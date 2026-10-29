// src/lib/payments/sebpay.ts
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  InitiateResult,
  MobileMoneyOperator,
  PaymentIntent,
  PaymentStatus,
  SebPayWebhookPayload,
  VerifyResult,
} from "./types";
import type { Plan } from "@/lib/plans";
import { normalizePhone, priceFor, type PaymentProvider } from "./provider";

/**
 * Implémentation SebPay — Mobile Money Afrique centrale.
 * Docs : https://docs.sebpay.com (à vérifier lors de l'intégration réelle)
 */
export class SebPayProvider implements PaymentProvider {
  readonly name = "sebpay";

  private get baseUrl(): string {
    return process.env.SEBray_SANDBOX === "true"
      ? "https://sandbox.sebpay.com/api/v1"
      : "https://api.sebpay.com/api/v1";
  }

  private get apiKey(): string {
    const key = process.env.SEBPAY_API_KEY;
    if (!key) throw new Error("SEBPAY_API_KEY manquant dans .env");
    return key;
  }

  private get webhookSecret(): string {
    const secret = process.env.SEBPAY_WEBHOOK_SECRET;
    if (!secret) throw new Error("SEBPAY_WEBHOOK_SECRET manquant dans .env");
    return secret;
  }

  /** URL publique du webhook (Vercel). */
  private get webhookUrl(): string {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ndeletik.com";
    return `${base}/api/payments/webhook`;
  }

  async initiate(params: {
    userId: string;
    phoneNumber: string;
    operator: MobileMoneyOperator;
    plan: Plan;
    period: "monthly" | "yearly";
    amount: number;
    metadata?: Record<string, unknown>;
  }): Promise<InitiateResult> {
    const admin = createAdminClient();
    const phone = normalizePhone(params.phoneNumber);

    // 1) Créer l'intent en base (status = pending)
    const { data: intent, error: insertError } = await admin
      .from("payments")
      .insert({
        user_id: params.userId,
        provider: "sebpay",
        provider_ref: null, // rempli après réponse API
        phone_number: phone,
        operator: params.operator,
        plan: params.plan,
        period: params.period,
        amount: params.amount,
        currency: "XAF",
        status: "pending",
        webhook_url: this.webhookUrl,
        metadata: params.metadata ?? {},
      })
      .select("id")
      .single();

    if (insertError || !intent) {
      return { ok: false, error: "Impossible de créer la transaction" };
    }

    // 2) Appeler l'API SebPay (initiate mobile push)
    try {
      const res = await fetch(`${this.baseUrl}/transactions/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          reference: intent.id,
          amount: params.amount,
          currency: "XAF",
          phone_number: phone,
          operator: params.operator.toLowerCase(),
          description: `Abonnement Ndeletik ${params.plan} (${params.period})`,
          notify_url: this.webhookUrl,
          metadata: { userId: params.userId, plan: params.plan },
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        await this.failIntent(intent.id, `SebPay HTTP ${res.status}: ${text}`);
        return { ok: false, error: "Le prestataire a refusé la transaction" };
      }

      const data = await res.json();
      const providerRef = data.transaction_id ?? data.id;

      // 3) Mettre à jour avec la référence SebPay
      await admin
        .from("payments")
        .update({ provider_ref: providerRef, status: "processing" })
        .eq("id", intent.id);

      return {
        ok: true,
        intentId: intent.id,
        providerRef,
        userMessage: `Valide le paiement de ${params.amount.toLocaleString("fr-FR")} FCFA sur ton téléphone ${params.operator}.`,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur réseau";
      await this.failIntent(intent.id, msg);
      return { ok: false, error: "Connexion au prestataire impossible" };
    }
  }

  async verifyWebhook(body: unknown, headers: Headers): Promise<VerifyResult> {
    // 1) Vérifier la signature HMAC
    const signature = headers.get("x-sebpay-signature") ?? "";
    const rawBody = typeof body === "string" ? body : JSON.stringify(body);
    const expected = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (!signature || signature !== expected) {
      return { ok: false, error: "Signature invalide" };
    }

    const payload = body as SebPayWebhookPayload;
    if (!payload.reference || !payload.status) {
      return { ok: false, error: "Payload incomplet" };
    }

    // 2) Mapper le statut SebPay vers notre statut canonique
    const statusMap: Record<string, PaymentStatus> = {
      success: "succeeded",
      failed: "failed",
      pending: "processing",
      expired: "expired",
    };
    const newStatus = statusMap[payload.status];
    if (!newStatus) {
      return { ok: false, error: `Statut SebPay inconnu: ${payload.status}` };
    }

    // 3) Mettre à jour l'intent
    const admin = createAdminClient();
    const { data: intent } = await admin
      .from("payments")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payload.reference)
      .select("id, user_id, plan, period")
      .single();

    if (!intent) return { ok: false, error: "Intent introuvable" };

    // 4) Si succès → déclencher l'activation du plan
    // Le trigger SQL `on_payment_succeeded` met à jour `accounts.plan` et `accounts.plan_expires_at`
    // → aucune logique ici, la base fait le travail.
    if (newStatus === "succeeded") {
      // On pourrait aussi appeler une RPC `activate_plan(user_id, plan, period)`
      // mais un trigger SQL est plus atomique et audit-friendly.
    }

    return { ok: true, intentId: intent.id, status: newStatus };
  }

  async getStatus(providerRef: string): Promise<PaymentStatus> {
    try {
      const res = await fetch(`${this.baseUrl}/transactions/${providerRef}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      if (!res.ok) return "pending";
      const data = await res.json();
      const map: Record<string, PaymentStatus> = {
        success: "succeeded",
        failed: "failed",
        pending: "processing",
        expired: "expired",
      };
      return map[data.status] ?? "pending";
    } catch {
      return "pending";
    }
  }

  private async failIntent(intentId: string, error: string): Promise<void> {
    try {
      const admin = createAdminClient();
      await admin
        .from("payments")
        .update({
          status: "failed",
          error_message: error.slice(0, 500),
          updated_at: new Date().toISOString(),
        })
        .eq("id", intentId);
    } catch {
      // silencieux — la création a déjà échoué
    }
  }
}
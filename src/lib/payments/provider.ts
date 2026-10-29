// src/lib/payments/provider.ts
import type {
  Amount,
  InitiateResult,
  MobileMoneyOperator,
  PaymentIntent,
  Plan,
  VerifyResult,
} from "./types";
import { SebPayProvider } from "./sebpay";
import type { Plan as AppPlan } from "@/lib/plans";

// Réexport pour éviter un import circulaire
export type { Plan } from "./types";

/**
 * Contrat unique que tout prestataire de paiement doit respecter.
 * Ajouter CinetPay, Flutterwave, Stripe ? Il suffit d'implémenter cette interface.
 */
export interface PaymentProvider {
  readonly name: "sebpay" | "cinetpay" | "flutterwave" | "stripe";

  /**
   * Initie un paiement Mobile Money.
   * - Crée l'intent en base (status = pending)
   * - Appelle l'API du prestataire (USSD push)
   * - Retourne l'ID intent et la référence prestataire
   */
  initiate(params: {
    userId: string;
    phoneNumber: string;
    operator: MobileMoneyOperator;
    plan: AppPlan;
    period: "monthly" | "yearly";
    amount: Amount;
    metadata?: Record<string, unknown>;
  }): Promise<InitiateResult>;

  /**
   * Vérifie et traite un webhook reçu.
   * - Valide la signature
   * - Met à jour l'intent en base
   * - Déclenche la mise à niveau du plan (via trigger SQL)
   */
  verifyWebhook(body: unknown, headers: Headers): Promise<VerifyResult>;

  /**
   * Interroge le statut d'une transaction (pour le polling côté client
   * pendant que l'utilisateur valide sur son téléphone).
   */
  getStatus(providerRef: string): Promise<PaymentIntent["status"]>;
}

/** Tarifs officiels en FCFA — à synchroniser avec `supabase/schema.sql` et `Pricing.tsx`. */
export const PRICING: Record<AppPlan, { monthly: Amount; yearly: Amount }> = {
  free: { monthly: 0, yearly: 0 },
  pro: { monthly: 3_000, yearly: Math.round(3_000 * 12 * 0.8) }, // 28 800 FCFA/an (-20%)
  business: { monthly: 9_000, yearly: Math.round(9_000 * 12 * 0.8) }, // 86 400 FCFA/an (-20%)
};

/** Retourne le montant à facturer pour un plan et une période. */
export function priceFor(plan: AppPlan, period: "monthly" | "yearly"): Amount {
  return PRICING[plan][period];
}

/**
 * Factory : retourne l'implémentation active.
 * Une seule ligne à changer pour basculer de prestataire.
 */
export function getProvider(): PaymentProvider {
  const chosen = (process.env.PAYMENT_PROVIDER ?? "sebpay") as
    | "sebpay"
    | "cinetpay"
    | "flutterwave"
    | "stripe";

  switch (chosen) {
    case "sebpay":
      return new SebPayProvider();
    // case "cinetpay": return new CinetPayProvider();
    // case "flutterwave": return new FlutterwaveProvider();
    // case "stripe": return new StripeProvider();
    default:
      throw new Error(`Prestataire de paiement inconnu : ${chosen}`);
  }
}

/**
 * Normalise un numéro de téléphone saisi par le créateur.
 * Accepte : "06 123 4567", "+242 06 123 45 67", "242061234567"…
 * Retourne le format E.164 international (+242061234567).
 */
export function normalizePhone(raw: string, defaultCountry = "242"): string {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("00")) return "+" + digits.slice(2);
  if (digits.length >= 9 && digits.startsWith(defaultCountry)) return "+" + digits;
  if (digits.startsWith("0")) return "+" + defaultCountry + digits.slice(1);
  return "+" + defaultCountry + digits;
}

/**
 * Détecte l'opérateur à partir d'un numéro (préfixes Congo +扩展).
 * Retourne null si inconnu — l'utilisateur devra choisir manuellement.
 */
export function detectOperator(phone: string): MobileMoneyOperator | null {
  const digits = phone.replace(/[^\d]/g, "");
  // Congo Brazzaville (+242)
  if (digits.startsWith("24206") || digits.startsWith("24205")) return "Airtel";
  if (digits.startsWith("24204") || digits.startsWith("24201")) return "MTN";
  // Cameroun (+237)
  if (digits.startsWith("23767") || digits.startsWith("23768")) return "MTN";
  if (digits.startsWith("23769") || digits.startsWith("23765")) return "Orange";
  // Sénégal / Côte d'Ivoire (Wave)
  if (digits.startsWith("22177") || digits.startsWith("22178") || digits.startsWith("22507")) return "Wave";
  return null;
}
// src/lib/payments/provider.ts
import type { Plan } from "@/lib/plans";
import type {
  Amount,
  InitiateResult,
  MobileMoneyOperator,
  PaymentStatus,
  VerifyResult,
} from "./types";
import { SebPayProvider } from "./sebpay";

/**
 * Contrat unique que tout prestataire de paiement doit respecter.
 * Ajouter CinetPay, Flutterwave ou Stripe ? Il suffit d'implémenter cette interface.
 */
export interface PaymentProvider {
  readonly name: "sebpay" | "cinetpay" | "flutterwave" | "stripe";

  /** Initie un paiement Mobile Money (USSD push) et retourne la référence prestataire. */
  initiate(params: {
    userId: string;
    phoneNumber: string;
    operator: MobileMoneyOperator;
    plan: Plan;
    period: "monthly" | "yearly";
    amount: Amount;
    metadata?: Record<string, unknown>;
  }): Promise<InitiateResult>;

  /** Vérifie et traite une notification webhook reçue du prestataire. */
  verifyWebhook(body: unknown, headers: Headers): Promise<VerifyResult>;

  /** Interroge le statut d'une transaction (polling pendant la validation client). */
  getStatus(providerRef: string): Promise<PaymentStatus>;
}

/** Tarifs officiels en FCFA — à garder synchronisés avec Pricing.tsx et plan_entitlements. */
export const PRICING: Record<Plan, { monthly: Amount; yearly: Amount }> = {
  free: { monthly: 0, yearly: 0 },
  pro: { monthly: 3_000, yearly: 28_800 }, // 3 000 × 12 × 0.8
  business: { monthly: 9_000, yearly: 86_400 }, // 9 000 × 12 × 0.8
};

/** Montant à facturer pour un plan et une période donnés. */
export function priceFor(plan: Plan, period: "monthly" | "yearly"): Amount {
  return PRICING[plan][period];
}

/** Jours crédités par activate_plan (mensuel = 30 j, annuel = 365 j). */
export function periodDays(period: "monthly" | "yearly"): number {
  return period === "yearly" ? 365 : 30;
}

/** Factory : retourne l'implémentation active (une seule ligne à changer pour basculer). */
export function getProvider(): PaymentProvider {
  const chosen = (process.env.PAYMENT_PROVIDER ?? "sebpay") as PaymentProvider["name"];
  switch (chosen) {
    case "sebpay":
      return new SebPayProvider();
    // case "cinetpay": return new CinetPayProvider();
    // case "flutterwave": return new FlutterwaveProvider();
    default:
      throw new Error(`Prestataire de paiement inconnu : ${chosen}`);
  }
}

/**
 * Normalise un numéro saisi ("06 123 45 67", "+24206…", "24206…")
 * au format international E.164 (+24206…).
 */
export function normalizePhone(raw: string, defaultCountry = "242"): string {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.startsWith(defaultCountry)) return `+${digits}`;
  if (digits.startsWith("0")) return `+${defaultCountry}${digits.slice(1)}`;
  return `+${defaultCountry}${digits}`;
}

/** Détecte l'opérateur Mobile Money à partir des préfixes (Congo, Cameroun, Sénégal, CI). */
export function detectOperator(phone: string): MobileMoneyOperator | null {
  const d = phone.replace(/[^\d]/g, "");
  if (d.startsWith("24206") || d.startsWith("24205")) return "Airtel";
  if (d.startsWith("24204") || d.startsWith("24201")) return "MTN";
  if (d.startsWith("23767") || d.startsWith("23768")) return "MTN";
  if (d.startsWith("23769") || d.startsWith("23765")) return "Orange";
  if (d.startsWith("22177") || d.startsWith("22178") || d.startsWith("22507")) return "Wave";
  return null;
}
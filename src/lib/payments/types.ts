// src/lib/payments/types.ts
import type { Plan } from "@/lib/plans";
export type { Plan } from "@/lib/plans";

/** Devise supportée (XAF = FCFA, devise de l'Afrique centrale). */
export type Currency = "XAF";

/** Montant entier (FCFA n'a pas de centimes). */
export type Amount = number;

/** Statut canonique — identique quel que soit le prestataire. */
export type PaymentStatus =
  | "pending"      // Créé, en attente de confirmation client
  | "processing"   // USSD push envoyé, client en train de valider
  | "succeeded"    // Paiement confirmé par le prestataire
  | "failed"       // Échec (solde insuffisant, code incorrect…)
  | "expired"      // Pas confirmé dans la fenêtre (5 min)
  | "refunded";    // Remboursé (manuel ou auto)

/** Moyen de paiement Mobile Money. */
export type MobileMoneyOperator = "MTN" | "Airtel" | "Wave" | "Orange" | "Moov";

/** Intent créé par notre app AVANT l'appel au prestataire. */
export interface PaymentIntent {
  /** ID unique interne (UUID). */
  id: string;
  /** Référence externe (SebPay transaction_id, etc.). */
  providerRef?: string;
  /** Prestataire utilisé. */
  provider: "sebpay" | "cinetpay" | "flutterwave" | "stripe";
  /** User qui paie. */
  userId: string;
  /** Numéro MSISDN du client (format international +242…). */
  phoneNumber: string;
  /** Opérateur détecté ou choisi. */
  operator: MobileMoneyOperator;
  /** Plan souscrit. */
  plan: Plan;
  /** Période (mensuel/annuel). */
  period: "monthly" | "yearly";
  /** Montant en FCFA (entier). */
  amount: Amount;
  /** Devise. */
  currency: Currency;
  /** Statut canonique. */
  status: PaymentStatus;
  /** Date de création. */
  createdAt: string;
  /** Date de dernière mise à jour. */
  updatedAt: string;
  /** URL du webhook pour recevoir la notification (Sebpay notify_url). */
  webhookUrl: string;
  /** Erreur éventuelle, texte lisible. */
  errorMessage?: string;
  /** Métadonnées libres (ex: { reason: "upgrade", previousPlan: "free" }). */
  metadata?: Record<string, unknown>;
}

/** Payload reçu du webhook SebPay (format réel documenté). */
export interface SebPayWebhookPayload {
  transaction_id: string;
  reference: string;
  status: "success" | "failed" | "pending";
  amount: number;
  currency: string;
  phone_number: string;
  operator: string;
  paid_at?: string;
  fee?: number;
  net_amount?: number;
  signature: string;
  [key: string]: unknown;
}

/** Résultat d'une initiation de paiement. */
export interface InitiateResult {
  ok: boolean;
  intentId?: string;
  providerRef?: string;
  /** Message à afficher au créateur (« Valide sur ton téléphone MTN »). */
  userMessage?: string;
  error?: string;
}

/** Résultat de vérification d'un webhook. */
export interface VerifyResult {
  ok: boolean;
  intentId?: string;
  status?: PaymentStatus;
  error?: string;
}
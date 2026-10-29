// src/lib/payments/index.ts
// Export public du module payments — un seul import pour toute l'app.
export {
  getProvider,
  priceFor,
  normalizePhone,
  detectOperator,
  PRICING,
} from "./provider";

export type {
  PaymentProvider,
} from "./provider";

export type {
  PaymentIntent,
  PaymentStatus,
  MobileMoneyOperator,
  Amount,
  Currency,
  InitiateResult,
  VerifyResult,
  SebPayWebhookPayload,
} from "./types";
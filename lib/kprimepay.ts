const BASE_URL = "https://api.kprimepay.com/v2";

function apiKey() {
  const key = process.env.KPRIMEPAY_API_KEY;
  if (!key) throw new Error("KPRIMEPAY_API_KEY manquant");
  return key;
}

export async function createKprimeCheckout(input: {
  transactionId: string;
  amount: number;
  description: string;
  returnUrl: string;
  metadata: Record<string, string>;
}) {
  const response = await fetch(`${BASE_URL}/checkout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
      "Idempotency-Key": input.transactionId,
    },
    body: JSON.stringify({
      transaction_id: input.transactionId,
      amount: input.amount,
      currency: "XOF",
      mode: process.env.KPRIMEPAY_MODE === "live" ? 2 : 1,
      with_fees: 0,
      description: input.description,
      return_url: input.returnUrl,
      locale: "fr",
      custom_meta_data: input.metadata,
    }),
    cache: "no-store",
  });
  const json = await response.json();
  if (!response.ok || !json?.status) throw new Error(json?.message || "KPRIMEPAY checkout impossible");
  return json.data as { checkout_url: string; transaction_id: string; kpp_tx_reference: string };
}

export async function getKprimePaymentStatus(transactionId: string) {
  const response = await fetch(`${BASE_URL}/transactions/debit-status`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ transaction_id: transactionId }),
    cache: "no-store",
  });
  const json = await response.json();
  if (!response.ok || !json?.status) throw new Error(json?.message || "Statut KPRIMEPAY indisponible");
  return json.data as { status: "pending" | "success" | "failed"; transaction_amount: number; transaction_id: string };
}

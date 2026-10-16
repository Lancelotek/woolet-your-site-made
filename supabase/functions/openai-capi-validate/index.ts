// TEMPORARY: validate_only checks for the OpenAI Conversions API. Deleted after use.
import { sendOpenAiEvent } from "../_shared/openai-capi.ts";

Deno.serve(async () => {
  const user = {
    email: " Test@Example.com ",
    externalId: "00000000-test-visitor",
    phone: "+48 600 100 200",
    country: "pl",
    ip: "203.0.113.10",
    userAgent: "Mozilla/5.0 (validate)",
    obref: "test-obref",
  };
  const base = { user, consent: true, source: "openai-capi-validate", validateOnly: true };
  const out = {
    lead_created: await sendOpenAiEvent({
      ...base, id: `val-lead-${Date.now()}`, type: "lead_created",
      sourceUrl: "https://woolet.co/en/lp/kickstarter", data: { type: "customer_action" },
    }),
    reservation_1usd: await sendOpenAiEvent({
      ...base, id: `val-res-${Date.now()}`, type: "custom", customEventName: "reservation_1usd",
      sourceUrl: "https://woolet.co/en/lp/kickstarter", data: { type: "custom" },
    }),
    order_created: await sendOpenAiEvent({
      ...base, id: `val-order-${Date.now()}`, type: "order_created",
      sourceUrl: "https://woolet.co/en/bespoke/checkout",
      data: {
        type: "contents", amount: 48000, currency: "USD",
        contents: [{ id: "bespoke", name: "Woolet Bespoke", content_type: "product", quantity: 1, amount: 48000, currency: "USD" }],
      },
    }),
  };
  return new Response(JSON.stringify(out, null, 2), { headers: { "Content-Type": "application/json" } });
});

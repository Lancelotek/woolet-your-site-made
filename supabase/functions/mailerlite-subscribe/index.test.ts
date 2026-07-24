// Integration tests for mailerlite-subscribe.
// Stubs global fetch so we never hit MailerLite or Meta Graph in tests,
// and asserts the Meta CAPI Lead event is fired with hashed PII,
// fbp/fbc, client IP/UA from headers, and the shared meta_event_id.

import {
  assert,
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

// Env required by the handler before import.
Deno.env.set("MAILERLITE_API_KEY", "test-ml-key");
Deno.env.set("META_PIXEL_ID", "1234567890");
Deno.env.set("META_CAPI_ACCESS_TOKEN", "test-capi-token");
// Prevent saveAttribution from doing anything (skips Supabase client).
Deno.env.delete("SUPABASE_URL");
Deno.env.delete("SUPABASE_SERVICE_ROLE_KEY");

const { handler } = await import("./index.ts");

type Captured = { url: string; init?: RequestInit; body?: unknown };

const sha256Hex = async (input: string) => {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

function installFetchStub(opts: { mlSubscriberStatus?: number } = {}) {
  const calls: Captured[] = [];
  const original = globalThis.fetch;

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    let body: unknown = undefined;
    if (init?.body && typeof init.body === "string") {
      try { body = JSON.parse(init.body); } catch { body = init.body; }
    }
    calls.push({ url, init, body });

    // MailerLite custom fields (ensureCustomFields loops through many)
    if (url.includes("/api/fields")) {
      return new Response(JSON.stringify({}), { status: 200 });
    }
    // MailerLite subscribers
    if (url.includes("/api/subscribers")) {
      const status = opts.mlSubscriberStatus ?? 200;
      return new Response(
        JSON.stringify({ data: { email: (body as { email?: string })?.email } }),
        { status },
      );
    }
    // Meta Graph API
    if (url.includes("graph.facebook.com")) {
      return new Response(JSON.stringify({ events_received: 1 }), { status: 200 });
    }
    return new Response("{}", { status: 200 });
  }) as typeof fetch;

  return {
    calls,
    restore: () => { globalThis.fetch = original; },
  };
}

const buildRequest = (payload: Record<string, unknown>, headers: HeadersInit = {}) =>
  new Request("http://localhost/mailerlite-subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "user-agent": "Mozilla/5.0 (TestBot)",
      "x-forwarded-for": "203.0.113.7, 10.0.0.1",
      ...headers,
    },
    body: JSON.stringify(payload),
  });

Deno.test("fires Meta CAPI Lead after successful subscription with hashed PII, fbp/fbc, and shared event_id", async () => {
  const stub = installFetchStub();
  try {
    const meta_event_id = "evt-abc-123";
    const email = "Test.User@Example.com";
    const req = buildRequest({
      email,
      phone: "+1 (555) 123-4567",
      country_code: "US",
      source: "kickstarter",
      fbp: "fb.1.1700000000.111",
      fbc: "fb.1.1700000000.AbCd",
      event_source_url: "https://woolet.co/en/blog/x",
      meta_event_id,
    });

    const res = await handler(req);
    const json = await res.json();
    assertEquals(res.status, 200);
    assertEquals(json.success, true);

    const capiCall = stub.calls.find((c) => c.url.includes("graph.facebook.com"));
    assertExists(capiCall, "Expected Meta CAPI request to be sent");
    assert(capiCall.url.includes("/1234567890/events"), "Uses correct pixel ID");
    assert(capiCall.url.includes("access_token=test-capi-token"), "Passes access token");

    const payload = capiCall.body as { data: Array<Record<string, unknown>> };
    assertEquals(payload.data.length, 1);
    const event = payload.data[0];
    assertEquals(event.event_name, "Lead");
    assertEquals(event.event_id, meta_event_id, "Shares event_id with browser pixel for dedup");
    assertEquals(event.action_source, "website");
    assertEquals(event.event_source_url, "https://woolet.co/en/blog/x");

    const user_data = event.user_data as Record<string, unknown>;
    // Email must be hashed lowercase
    assertEquals((user_data.em as string[])[0], await sha256Hex("test.user@example.com"));
    // Phone must be hashed digits-only
    assertEquals((user_data.ph as string[])[0], await sha256Hex("15551234567"));
    // Country code hashed, 2-letter lowercase
    assertEquals((user_data.country as string[])[0], await sha256Hex("us"));
    // fbp/fbc forwarded raw
    assertEquals(user_data.fbp, "fb.1.1700000000.111");
    assertEquals(user_data.fbc, "fb.1.1700000000.AbCd");
    // Client IP taken from x-forwarded-for (first hop)
    assertEquals(user_data.client_ip_address, "203.0.113.7");
    // UA taken from headers
    assertEquals(user_data.client_user_agent, "Mozilla/5.0 (TestBot)");

    const custom = event.custom_data as Record<string, unknown>;
    assertEquals(custom.currency, "USD");
    assertEquals(custom.value, 5);
    assertEquals(custom.lead_source, "kickstarter");
  } finally {
    stub.restore();
  }
});

Deno.test("generates a fallback event_id when meta_event_id is missing", async () => {
  const stub = installFetchStub();
  try {
    const res = await handler(buildRequest({ email: "noid@example.com" }));
    await res.json();
    const capiCall = stub.calls.find((c) => c.url.includes("graph.facebook.com"));
    assertExists(capiCall);
    const event = (capiCall.body as { data: Array<Record<string, unknown>> }).data[0];
    assert(typeof event.event_id === "string" && (event.event_id as string).length > 0);
  } finally {
    stub.restore();
  }
});

Deno.test("does NOT fire Meta CAPI when MailerLite subscription fails", async () => {
  const stub = installFetchStub({ mlSubscriberStatus: 422 });
  try {
    const res = await handler(buildRequest({ email: "fail@example.com" }));
    await res.json();
    assertEquals(res.status, 422);
    const capiCall = stub.calls.find((c) => c.url.includes("graph.facebook.com"));
    assertEquals(capiCall, undefined, "Meta CAPI must not be called on failed subscribe");
  } finally {
    stub.restore();
  }
});

Deno.test("does NOT fire Meta CAPI when email is missing (400)", async () => {
  const stub = installFetchStub();
  try {
    const res = await handler(buildRequest({}));
    await res.json();
    assertEquals(res.status, 400);
    assertEquals(stub.calls.find((c) => c.url.includes("graph.facebook.com")), undefined);
  } finally {
    stub.restore();
  }
});

Deno.test("skips Meta CAPI when META_PIXEL_ID / access token are not configured", async () => {
  const savedPixel = Deno.env.get("META_PIXEL_ID");
  const savedToken = Deno.env.get("META_CAPI_ACCESS_TOKEN");
  Deno.env.delete("META_PIXEL_ID");
  Deno.env.delete("META_CAPI_ACCESS_TOKEN");
  const stub = installFetchStub();
  try {
    const res = await handler(buildRequest({ email: "nocapi@example.com" }));
    await res.json();
    assertEquals(res.status, 200);
    assertEquals(stub.calls.find((c) => c.url.includes("graph.facebook.com")), undefined);
  } finally {
    stub.restore();
    if (savedPixel) Deno.env.set("META_PIXEL_ID", savedPixel);
    if (savedToken) Deno.env.set("META_CAPI_ACCESS_TOKEN", savedToken);
  }
});

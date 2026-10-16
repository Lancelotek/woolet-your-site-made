// OpenAI (ChatGPT Ads) Conversions API helper. Never throws.
// Docs: https://developers.openai.com/ads/conversions-api
import { createClient } from "npm:@supabase/supabase-js@2";

export const OPENAI_PIXEL_ID = "PZ4o6trkntv1aiioMM7GJ7";
const ENDPOINT = `https://bzr.openai.com/v1/events?pid=${OPENAI_PIXEL_ID}`;

export type OpenAiUserInput = {
  email?: string | null;
  externalId?: string | null; // raw wlt_visitor_id
  phone?: string | null;
  obref?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  country?: string | null;
};

export type OpenAiEventInput = {
  id: string;
  type: string;
  sourceUrl: string;
  oppref?: string | null;
  customEventName?: string;
  data: Record<string, unknown>;
  user: OpenAiUserInput;
  /** false = EU-like visitor without marketing consent → skip. */
  consent: boolean;
  /** Logging context */
  source: string;
  validateOnly?: boolean;
  requestSummary?: Record<string, unknown>;
};

export const sha256Hex = async (input: string): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

export function normalizePhone(raw?: string | null): string | null {
  const digits = String(raw ?? "").replace(/\D/g, "").replace(/^0+/, "");
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

/** Browser flag → boolean. Only an explicit "1"/true counts as allowed. */
export const parseConsentFlag = (v: unknown): boolean => v === true || v === "1" || v === "true";

export async function buildOpenAiUser(u: OpenAiUserInput): Promise<Record<string, unknown>> {
  const user: Record<string, unknown> = {};
  const email = String(u.email ?? "").trim().toLowerCase();
  if (email) user.emails_sha256 = [await sha256Hex(email)];
  const ext = String(u.externalId ?? "").trim();
  if (ext) user.external_ids_sha256 = [await sha256Hex(ext)];
  const phone = normalizePhone(u.phone);
  if (phone) user.phone_numbers_sha256 = [await sha256Hex(phone)];
  const obref = String(u.obref ?? "").trim();
  if (obref) user.obref = obref.slice(0, 500);
  const ip = String(u.ip ?? "").trim();
  if (ip) user.ip_address = ip.slice(0, 64);
  const ua = String(u.userAgent ?? "").trim();
  if (ua) user.user_agent = ua.slice(0, 500);
  const c = String(u.country ?? "").trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(c)) user.countries = [c];
  return user;
}

export function clientIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() || req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip");
}

let _sb: ReturnType<typeof createClient> | null = null;
const sb = () =>
  (_sb ??= createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!));

export async function sendOpenAiEvent(
  e: OpenAiEventInput,
): Promise<{ status: "sent" | "error" | "skipped"; http?: number; body?: string }> {
  let status: "sent" | "error" | "skipped" = "sent";
  let http: number | undefined;
  let body: string | undefined;
  let reason: string | undefined;
  let user: Record<string, unknown> = {};
  try {
    const key = Deno.env.get("OPENAI_CONVERSIONS_API_KEY");
    if (!e.consent) {
      status = "skipped";
      reason = "no_marketing_consent";
    } else if (!key) {
      status = "skipped";
      reason = "missing_api_key";
      console.warn("[openai-capi] OPENAI_CONVERSIONS_API_KEY not set — skipping", e.type);
    } else if (!e.sourceUrl) {
      status = "skipped";
      reason = "missing_source_url";
    } else {
      user = await buildOpenAiUser(e.user);
      const event: Record<string, unknown> = {
        id: e.id,
        type: e.type,
        timestamp_ms: Date.now(),
        action_source: "web",
        source_url: e.sourceUrl,
        data: e.data,
        user,
        ...(e.oppref ? { oppref: e.oppref } : {}),
        ...(e.customEventName ? { custom_event_name: e.customEventName } : {}),
      };
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ events: [event], ...(e.validateOnly ? { validate_only: true } : {}) }),
      });
      http = res.status;
      body = (await res.text()).slice(0, 500);
      if (!res.ok) {
        status = "error";
        console.error("[openai-capi] non-ok", e.type, http, body);
      } else {
        console.log("[openai-capi] sent", e.type, e.id);
      }
    }
  } catch (err) {
    status = "error";
    body = String(err).slice(0, 500);
    console.error("[openai-capi] error", err);
  }

  try {
    await sb().from("server_event_log").insert({
      source: e.source,
      event_name: `openai_${e.customEventName ?? e.type}`,
      event_id: e.id,
      event_source_url: e.sourceUrl || null,
      client_ip: e.user.ip ?? null,
      user_agent: e.user.userAgent ?? null,
      custom_data: e.data,
      user_data_hashed: {
        emails_sha256: user.emails_sha256 ?? null,
        external_ids_sha256: user.external_ids_sha256 ?? null,
        phone_numbers_sha256: user.phone_numbers_sha256 ?? null,
        countries: user.countries ?? null,
        obref: Boolean(user.obref),
      },
      destinations: { openai: { status, http: http ?? null, detail: body ?? reason ?? null } },
      request_summary: { ...(e.requestSummary ?? {}), validate_only: Boolean(e.validateOnly) },
      status,
    });
  } catch (logErr) {
    console.error("[server_event_log] openai insert failed", logErr);
  }
  return { status, http, body };
}

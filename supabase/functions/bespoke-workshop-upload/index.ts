// The workshop's upload page for one Bespoke order (/en/bespoke/workshop?t=...).
// No login: the per-order workshop_token is the key, and the admin can replace
// it at any time. The workshop can upload files and see what is already there;
// it cannot download, delete or see the customer's personal data.
//
// POST { t, action: "status" }
// POST { t, action: "sign", fileName, size }   -> signed upload URL for one file
// POST { t, action: "complete", path, note }   -> registers an uploaded file
// POST { t, action: "notify" }                 -> one email to support for the batch

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import {
  KIND_LABEL,
  WORKSHOP_ACCEPT,
  WORKSHOP_BUCKET,
  WORKSHOP_FORMAT_RULE,
  WORKSHOP_MAX_BYTES,
  WORKSHOP_MAX_FILES,
  WORKSHOP_MAX_PER_HOUR,
  WORKSHOP_TOKEN_RE,
  classifyWorkshopFile,
  defaultShowToCustomer,
  describeFiles,
  formatBytes,
  isAppleNativeFormat,
  safeWorkshopFileName,
  workshopStoredName,
} from "../_shared/bespoke-workshop.ts";
import { sendTemplateEmailAndLog } from "../_shared/transactional-email-templates/send-and-log.ts";

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const clean = (v: unknown, max: number) =>
  String(v ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f<>]/g, "").trim().slice(0, max);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const token = String(body.t ?? "");
    if (!WORKSHOP_TOKEN_RE.test(token)) return json({ error: "invalid_link" }, 404);

    const { data: order, error } = await admin
      .from("bespoke_orders")
      .select("id, case_no, frame_name, front_code, temple_code, finish_id, lens_type, engraving_text, crm_stage")
      .eq("workshop_token", token)
      .maybeSingle();
    if (error) throw error;
    if (!order) return json({ error: "invalid_link" }, 404);
    const o = order as Record<string, any>;
    const ref = o.case_no || `WLT-${String(o.id).slice(0, 8).toUpperCase()}`;
    const action = String(body.action ?? "status");

    const listFiles = async () => {
      const { data } = await admin
        .from("bespoke_workshop_files")
        .select("id, file_name, kind, size_bytes, note, uploaded_by, created_at, notified_at")
        .eq("order_id", o.id)
        .is("removed_at", null)
        .order("created_at", { ascending: false })
        .limit(WORKSHOP_MAX_FILES);
      return (data ?? []) as Array<Record<string, any>>;
    };

    if (action === "status") {
      const files = await listFiles();
      return json({
        orderRef: ref,
        frameName: o.frame_name ?? "Woolet Bespoke",
        frontCode: o.front_code ?? null,
        templeCode: o.temple_code ?? null,
        finish: o.finish_id ?? null,
        lens: o.lens_type ?? null,
        engraving: o.engraving_text ?? null,
        maxBytes: WORKSHOP_MAX_BYTES,
        accept: WORKSHOP_ACCEPT,
        formatRule: WORKSHOP_FORMAT_RULE,
        files: files.map((f) => ({
          id: f.id,
          name: f.file_name,
          kind: f.kind,
          size: f.size_bytes,
          note: f.note,
          createdAt: f.created_at,
        })),
      });
    }

    if (action === "sign") {
      // Every stored name starts with the order number, so a downloaded file
      // can always be matched to its order.
      const fileName = workshopStoredName(ref, safeWorkshopFileName(String(body.fileName ?? "")));
      if (isAppleNativeFormat(fileName)) return json({ error: "iphone_format" }, 400);
      const kind = classifyWorkshopFile(fileName);
      if (!kind) return json({ error: "file_type" }, 400);
      const size = Number(body.size ?? 0);
      if (!Number.isFinite(size) || size <= 0) return json({ error: "empty_file" }, 400);
      if (size > WORKSHOP_MAX_BYTES) return json({ error: "too_large" }, 400);

      const { count: total } = await admin
        .from("bespoke_workshop_files")
        .select("id", { count: "exact", head: true })
        .eq("order_id", o.id)
        .is("removed_at", null);
      if ((total ?? 0) >= WORKSHOP_MAX_FILES) return json({ error: "too_many_files" }, 409);
      const { count: lastHour } = await admin
        .from("bespoke_workshop_files")
        .select("id", { count: "exact", head: true })
        .eq("order_id", o.id)
        .gte("created_at", new Date(Date.now() - 3600_000).toISOString());
      if ((lastHour ?? 0) >= WORKSHOP_MAX_PER_HOUR) return json({ error: "rate_limited" }, 429);

      const rand = crypto.randomUUID().slice(0, 8);
      const path = `orders/${o.id}/${Date.now()}-${rand}-${fileName}`;
      const { data, error: signErr } = await admin.storage.from(WORKSHOP_BUCKET).createSignedUploadUrl(path);
      if (signErr || !data) throw signErr ?? new Error("sign_failed");
      return json({ path, token: data.token, kind, fileName });
    }

    if (action === "complete") {
      const path = String(body.path ?? "");
      const prefix = `orders/${o.id}/`;
      if (!path.startsWith(prefix) || path.includes("..")) return json({ error: "invalid_path" }, 400);
      const objectName = path.slice(prefix.length);
      // `<stamp>-<rand>-<name>`: the original (safe) name is the rest.
      const fileName = objectName.replace(/^\d+-[0-9a-f]{8}-/, "");
      const kind = classifyWorkshopFile(fileName);
      if (!kind) return json({ error: "file_type" }, 400);

      const { data: listed } = await admin.storage.from(WORKSHOP_BUCKET).list(`orders/${o.id}`, { search: objectName, limit: 10 });
      const obj = (listed ?? []).find((f) => f.name === objectName);
      if (!obj) return json({ error: "upload_missing" }, 400);
      const meta = (obj.metadata ?? {}) as { size?: number; mimetype?: string };
      if ((meta.size ?? 0) > WORKSHOP_MAX_BYTES) {
        await admin.storage.from(WORKSHOP_BUCKET).remove([path]);
        return json({ error: "too_large" }, 400);
      }

      const note = clean(body.note, 1000) || null;
      const { data: row, error: insErr } = await admin
        .from("bespoke_workshop_files")
        .upsert(
          {
            order_id: o.id,
            storage_path: path,
            file_name: fileName,
            content_type: meta.mimetype ?? null,
            size_bytes: meta.size ?? null,
            kind,
            note,
            uploaded_by: "workshop",
            show_to_customer: defaultShowToCustomer(kind),
          },
          { onConflict: "storage_path", ignoreDuplicates: true },
        )
        .select("id")
        .maybeSingle();
      if (insErr) throw insErr;
      if (row) {
        await admin.from("bespoke_crm_events").insert({
          order_id: o.id,
          from_stage: o.crm_stage ?? null,
          to_stage: o.crm_stage ?? null,
          note: `Workshop uploaded ${KIND_LABEL[kind].toLowerCase()}: ${fileName} (${formatBytes(meta.size)})`,
          created_by: "workshop",
        });
      }
      return json({ ok: true, files: (await listFiles()).map((f) => ({ id: f.id, name: f.file_name, kind: f.kind, size: f.size_bytes, note: f.note, createdAt: f.created_at })) });
    }

    // One email per batch, not one per file.
    if (action === "notify") {
      const { data: pending } = await admin
        .from("bespoke_workshop_files")
        .select("id, file_name, kind, size_bytes, note")
        .eq("order_id", o.id)
        .eq("uploaded_by", "workshop")
        .is("notified_at", null)
        .is("removed_at", null)
        .order("created_at", { ascending: true });
      const rows = (pending ?? []) as Array<Record<string, any>>;
      if (rows.length === 0) return json({ ok: true, notified: 0 });
      const { error: updErr } = await admin
        .from("bespoke_workshop_files")
        .update({ notified_at: new Date().toISOString() })
        .in("id", rows.map((r) => r.id));
      if (updErr) throw updErr;
      try {
        await sendTemplateEmailAndLog("bespoke-support-alert", undefined, {
          idempotencyKey: `bespoke-workshop-upload-${o.id}-${rows.map((r) => r.id).join("-").slice(0, 180)}`,
          templateData: {
            heading: `Workshop uploaded ${describeFiles(rows)} - ${ref}`,
            lines: [
              ...rows.map((r) => `${r.file_name} (${formatBytes(r.size_bytes)})${r.note ? ` - ${r.note}` : ""}`),
              "Check the files on the order card, then press \"Model sent\": videos, images and PDF drawings marked for the customer appear on their 3D model page.",
              "https://woolet.co/en/admin/bespoke",
            ],
          },
        });
      } catch (e) {
        console.error("[bespoke-workshop-upload] alert failed", e);
      }
      return json({ ok: true, notified: rows.length });
    }

    return json({ error: "unknown_action" }, 400);
  } catch (err) {
    console.error("[bespoke-workshop-upload]", err instanceof Error ? err.message : err);
    return json({ error: "server_error" }, 500);
  }
});

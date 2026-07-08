import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const API = "https://connect.mailerlite.com/api";

async function ml(apiKey: string, path: string) {
  const r = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  });
  return { status: r.status, data: await r.json() };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const apiKey = Deno.env.get("MAILERLITE_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "no api key" }), { status: 500, headers: cors });
  }

  const url = new URL(req.url);


  const q = (url.searchParams.get("q") || "").toLowerCase();

  // 1. list groups (paginate up to a few pages)
  const allGroups: Array<{ id: string; name: string; total: number; active_count?: number }> = [];
  let cursor = "";
  for (let i = 0; i < 5; i++) {
    const path = `/groups?limit=100${cursor ? `&cursor=${cursor}` : ""}`;
    const { status, data } = await ml(apiKey, path);
    if (status >= 400) break;
    const items = data.data || [];
    for (const g of items) {
      allGroups.push({
        id: g.id,
        name: g.name,
        total: g.total ?? g.active_count ?? 0,
        active_count: g.active_count,
      });
    }
    cursor = data?.meta?.next_cursor || "";
    if (!cursor) break;
  }

  const matched = q
    ? allGroups.filter((g) => g.name.toLowerCase().includes(q))
    : allGroups;

  // 2. list custom fields (to confirm phone/sms field exists)
  const { data: fieldsData } = await ml(apiKey, "/fields?limit=100");
  const fields = (fieldsData.data || []).map((f: { id: string; name: string; key: string; type: string }) => ({
    id: f.id, name: f.name, key: f.key, type: f.type,
  }));

  // 3. for the first matched group, fetch last 5 subscribers
  let recent: unknown = null;
  if (matched[0]) {
    const { data } = await ml(apiKey, `/subscribers?filter[group]=${matched[0].id}&limit=5&sort=-subscribed_at`);
    recent = (data.data || []).map((s: { email: string; subscribed_at: string; fields?: Record<string, unknown> }) => ({
      email: s.email,
      subscribed_at: s.subscribed_at,
      phone: s.fields?.phone ?? null,
      name: s.fields?.name ?? null,
    }));
  }

  return new Response(
    JSON.stringify({
      total_groups: allGroups.length,
      matched_groups: matched,
      phone_or_sms_fields: fields.filter((f: { key: string; name: string }) =>
        /phone|sms|tel/i.test(f.key) || /phone|sms|tel/i.test(f.name)
      ),
      recent_in_first_match: recent,
    }, null, 2),
    { headers: { ...cors, "Content-Type": "application/json" } }
  );
});

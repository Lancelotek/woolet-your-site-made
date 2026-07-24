// Reject callers that are not authenticated as the Supabase service role.
// The Supabase gateway (verify_jwt=true) validates the token cryptographically
// before requests reach this function, so we only need to inspect claims.
export function isServiceRoleRequest(req: Request): boolean {
  const auth = req.headers.get("Authorization") || req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  const token = auth.slice(7);
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(parts[1].length / 4) * 4, "=")),
    );
    return payload?.role === "service_role";
  } catch {
    return false;
  }
}

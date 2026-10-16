/** Pure known-route matcher. Data is generated from src/seo/routeCatalog.ts. */
export type RouteFamily =
  | { pattern: string; slugs: readonly string[] | Readonly<Record<string, readonly string[]>> }
  | { prefix: string };

export interface KnownRouteData {
  locales: readonly string[];
  exact: readonly string[];
  families: readonly RouteFamily[];
}

export function createMatcher(data: KnownRouteData): (pathname: string) => boolean {
  const exact = new Set(data.exact);
  const locales = new Set(data.locales);
  const compiled = data.families.map((f) => {
    if ("prefix" in f) return { prefix: f.prefix };
    const slugs = f.slugs;
    const perLang = !Array.isArray(slugs);
    const sets = perLang
      ? Object.fromEntries(Object.entries(slugs as Record<string, readonly string[]>).map(([k, v]) => [k, new Set(v)]))
      : { "*": new Set(slugs as readonly string[]) };
    return { segs: f.pattern.split("/").slice(1), perLang, sets };
  });

  return (rawPath: string) => {
    let pathname = rawPath;
    try { pathname = decodeURIComponent(rawPath); } catch { /* keep raw */ }
    if (exact.has(pathname) || exact.has(rawPath)) return true;
    const parts = pathname.split("/").slice(1);
    for (const f of compiled) {
      if ("prefix" in f) {
        if (pathname.startsWith(f.prefix) && pathname.length > f.prefix.length) return true;
        continue;
      }
      if (f.segs.length !== parts.length) continue;
      let lang = "";
      let ok = true;
      for (let i = 0; i < f.segs.length && ok; i++) {
        const s = f.segs[i];
        const p = parts[i];
        if (s === ":lang") { ok = locales.has(p); lang = p; }
        else if (s.startsWith(":")) {
          const set = f.perLang ? f.sets[lang] : f.sets["*"];
          ok = !!set && set.has(p);
        } else ok = s === p;
      }
      if (ok) return true;
    }
    return false;
  };
}

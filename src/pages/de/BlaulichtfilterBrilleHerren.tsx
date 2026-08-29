import { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FRAME_SPECS } from "@/data/sizes";
import { lensOptions, FILTER_SPEC } from "@/data/lensOptions";

/**
 * DE commercial landing page — "blaulichtfilter-brille herren" (880/mo)
 * crossed with the wide-head intent nobody in the German SERP owns.
 *
 * COMPLIANCE: keine Gesundheitsversprechen. Der Filter ist eine optionale
 * Beschichtung, kein Medizinprodukt. Abschnitt 6 nennt die Cochrane-Übersicht
 * von 2023 ausdrücklich — nicht abschwächen, nicht entfernen.
 *
 * SPRACHE: natives Deutsch, Duzen (wie Fielmann/Apollo/Mister Spex).
 */

const SITE = "https://woolet.co";
const PATH = "/blaulichtfilter-brille-herren";
const CANONICAL = `${SITE}/de${PATH}`;

// /de/fit rendert derzeit die englische FitLens-Oberfläche (kein DE-Dictionary
// in src/lib/i18n-fitscan.ts) und steht nicht als eigene Locale in der Route-
// Registry. Deshalb zeigt der CTA bewusst auf /en/fit.
const FIT_HREF = "/en/fit";

const T = {
  ink: "#0B0A09",
  dark: "#080807",
  cream: "#EDE7D9",
  surface: "#F8F6F1",
  panel: "#FFFFFF",
  hair: "#E0D5C5",
  gold: "#CAA449",
  goldDim: "#8A6E2C",
  ctaInk: "#1F1B16",
  body: "#333333",
};
const SANS = "'Archivo', 'Barlow', sans-serif";
const SERIF = "'Newsreader', 'Cormorant Garamond', serif";

const wrap: React.CSSProperties = { maxWidth: 760, margin: "0 auto", padding: "0 20px" };

const S007 = FRAME_SPECS["007"];
const S009 = FRAME_SPECS["009"];

const badges = ["Signature 158 mm", "Maßanfertigung 145–172 mm", "Handgefertigt in der EU", "UV400"];

const tableRows: [string, string, string, string][] = [
  ["Fassungsbreite", "130–145 mm", `${S007.frameWidth} mm`, `${S009.frameWidth} mm`],
  ["Brücke", "variiert", `${S007.bridge} mm Keyhole`, `${S009.bridge} mm Keyhole`],
  ["Glasbreite", "variiert", `${S007.lensWidth} mm`, `${S009.lensWidth} mm`],
  ["Bügellänge", "variiert", `${S007.templeLength} mm`, `${S009.templeLength} mm`],
  ["Mit Blaulichtfilter erhältlich", "variiert", "Ja (Glasoption)", "Ja (Glasoption)"],
];

const blueLight = lensOptions.find((o) => o.id === "blue-light")!;
const blueLightReady = !blueLight.disabled;

const segments = [
  {
    title: "Bildschirmarbeit",
    body: `Acht Stunden in einer Fassung, die Abdrücke an den Schläfen hinterlässt, ist ein Passform-Problem, kein Glas-Problem. Bei ${S007.frameWidth} mm Frontbreite liegen die Scharniere außerhalb deiner breitesten Gesichtsstelle — die Bügel laufen gerade nach hinten statt nach außen zu spreizen.`,
  },
  {
    title: "Gaming mit Headset",
    body: `Die Ohrmuscheln drücken die Bügel einer schmalen Fassung in den Kopf, und genau da fängt der Schmerz an. ${S007.frameWidth} mm Front und ${S007.templeLength} mm Bügel sitzen weiter außen und reichen weiter nach hinten — der Bügel läuft hinter der Muschel entlang, nicht darunter.`,
  },
  {
    title: "Autofahren",
    body: "Jedes Woolet-Glas ist UV400, klar oder getönt. Der Blaulichtfilter ist davon unabhängig und optional. Am Steuer zählt, dass die Fassung beim Schulterblick nicht verrutscht — und das ist eine Frage von Frontbreite und Bügellänge.",
  },
  {
    title: "Breite Köpfe",
    body: "Zwei Abdrücke an den Schläfen oder eine wunde Stelle hinter dem Ohr heißen: Die Front ist zu schmal. Miss zuerst von Schläfe zu Schläfe. Die Zahl entscheidet über die Fassung, die Glasoption kommt danach.",
  },
];

const faqs = [
  {
    q: "Welche Brillenbreite brauche ich bei einem breiten Kopf?",
    a: `Miss von Schläfe zu Schläfe an der breitesten Stelle. Ab 155 mm Gesichtsbreite brauchst du eine Fassungsbreite ab 155 mm — nicht nur ein größeres Glas. Woolet baut ${S007.frameWidth} mm Front mit ${S007.bridge}–${S009.bridge} mm Keyhole-Steg und ${S007.templeLength} mm Bügeln, Maßanfertigung von 145 bis 162 mm.`,
  },
  {
    q: "Gibt es Blaulichtfilter-Brillen in XXL für Herren?",
    a: `Ja. Beide Herrenmodelle — 007 Rund und 009 Soft Square — haben ${S007.frameWidth} mm Frontbreite, was etwa 58–62 cm Kopfumfang abdeckt. Der Blaulichtfilter ist bei beiden eine Glasoption. Über 161 mm Gesichtsbreite geht es in die Maßanfertigung bis 162 mm.`,
  },
  {
    q: "Wie breit ist die Woolet-Fassung genau?",
    a: `${S007.frameWidth} mm Fassungsbreite (Scharnier zu Scharnier), ${S007.bridge} mm Keyhole-Steg beim 007 und ${S009.bridge} mm beim 009, Glasbreite ${S007.lensWidth} mm bzw. ${S009.lensWidth} mm, Bügellänge ${S007.templeLength} mm. Material: Mazzucchelli-Acetat aus Mailand, handgefertigt in der EU.`,
  },
  {
    q: "Blaulichtfilter mit Sehstärke — geht das?",
    a: "Ja. Der Filter ist eine Beschichtung auf dem Glas und lässt sich mit Einstärken- oder Gleitsichtgläsern kombinieren, die auf die 158-mm-Front geschliffen werden. Ohne Sehstärke geht genauso: gleiche Fassung, planes Glas. Klär zuerst die Breite, dann die Gläser.",
  },
  {
    q: "Sind Blaulichtfilter-Brillen sinnvoll?",
    a: "Eine Cochrane-Übersichtsarbeit von 2023 mit 17 randomisierten Studien kam zu dem Ergebnis, dass Gläser mit Blaulichtfilter wahrscheinlich keinen messbaren Unterschied machen — weder bei der Ermüdung am Bildschirm noch beim Schlaf; die Aussagesicherheit wurde als niedrig bis moderat bewertet. Wir bieten den Filter an, weil er nachgefragt wird. Versprechen tun wir nur die Millimeter.",
  },
  {
    q: "Woher weiß ich, ob 158 mm zu mir passen?",
    a: "158 mm passen typischerweise bei 155–161 mm Gesichtsbreite. Miss mit einem Lineal vor dem Spiegel von Schläfe zu Schläfe, oder lass FitLens das mit der Handykamera erledigen — rund eine Minute. Außerhalb von 155–161 mm greift die Maßanfertigung von 145 bis 162 mm.",
  },
];

// Interne Links: DE-Ziele, wo eine echte deutsche Seite existiert; sonst EN.
const relatedLinks = [
  { href: "/de/xxl-brille-herren", label: "XXL Brille Herren — breite Fassungen" },
  { href: "/de/breite-brille", label: "Breite Brille: 155, 158 und 161 mm" },
  { href: "/de/brille-grosse-koepfe", label: "Brille für große Köpfe" },
  { href: "/de/brille-breite-160-mm", label: "Brille mit ca. 160 mm Breite" },
  { href: "/de/blog/beste-brillen-fuer-grosse-koepfe-2026", label: "Beste Brillen für große Köpfe 2026" },
  { href: "/de/blog/welche-groesse-sonnenbrille-breites-gesicht", label: "Welche Größe Sonnenbrille bei breitem Gesicht?" },
  { href: "/en/blog/how-to-measure-face-width-for-glasses", label: "Gesichtsbreite messen (englisch)" },
  { href: "/en/collections/blue-light-glasses-for-wide-faces", label: "Blue light glasses for wide faces (englisch)" },
];

const h2: React.CSSProperties = {
  fontFamily: SERIF,
  fontWeight: 300,
  fontSize: 28,
  lineHeight: 1.15,
  letterSpacing: "-0.3px",
  margin: "0 0 14px",
  color: T.ink,
};
const p: React.CSSProperties = { fontFamily: SANS, fontSize: 15, lineHeight: 1.7, color: T.body, margin: "0 0 14px" };
const cell: React.CSSProperties = { padding: "11px 14px", fontFamily: SANS, fontSize: 13.5, borderTop: `1px solid ${T.hair}` };

function Faq({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div style={{ borderBottom: `1px solid ${T.hair}` }}>
      <h3 style={{ margin: 0 }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          style={{
            width: "100%",
            display: "flex",
            gap: 14,
            alignItems: "baseline",
            justifyContent: "space-between",
            background: "transparent",
            border: 0,
            padding: "16px 0",
            cursor: "pointer",
            textAlign: "left",
            fontFamily: SANS,
            fontSize: 15,
            fontWeight: 600,
            color: T.ink,
          }}
        >
          {q}
          <span aria-hidden="true" style={{ color: T.goldDim, fontSize: 20, lineHeight: 1 }}>{open ? "–" : "+"}</span>
        </button>
      </h3>
      {open && <p style={{ ...p, margin: "0 0 18px", maxWidth: 660 }}>{a}</p>}
    </div>
  );
}

const BlaulichtfilterBrilleHerren = () => {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: `${SITE}/de` },
      { "@type": "ListItem", position: 2, name: "Blaulichtfilter-Brille Herren", item: CANONICAL },
    ],
  };

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Blaulichtfilter-Brille Herren — 158 mm für breite Köpfe",
    url: CANONICAL,
    inLanguage: "de",
    isPartOf: { "@type": "WebSite", name: "Woolet", url: SITE },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: 2,
      itemListElement: [S007, S009].map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: s.name,
        url: `${SITE}${s.href}`,
      })),
    },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "de",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <SEO
        title="Blaulichtfilter-Brille Herren — 158 mm für breite Köpfe | Woolet"
        exactTitle
        description="Die meisten Blaulichtfilter-Brillen enden bei 145 mm. Woolet: 158 mm Fassung, 148 mm Bügel, Blaulichtfilter optional. Maßanfertigung 145–172 mm. Handgefertigt in der EU."
        lang="de"
        path={PATH}
        jsonLd={[collectionLd, breadcrumbLd, faqLd]}
      />
      <Navbar />

      <main style={{ background: T.surface, minHeight: "100vh", fontFamily: SANS, color: T.ink }}>
        {/* 1 — Hero */}
        <header style={{ background: T.dark, color: T.cream, paddingTop: 64 }}>
          <nav aria-label="Breadcrumb" style={{ ...wrap, paddingTop: 18, fontSize: 11, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(237,231,217,0.55)" }}>
            <Link to="/de" style={{ color: "inherit", textDecoration: "none" }}>Startseite</Link>
            <span style={{ margin: "0 8px" }}>/</span>
            <span style={{ color: T.cream }}>Blaulichtfilter-Brille Herren</span>
          </nav>

          <div style={{ ...wrap, padding: "26px 20px 44px" }}>
            <h1 style={{ fontFamily: SERIF, fontWeight: 300, fontSize: 42, lineHeight: 1.08, letterSpacing: "-0.6px", margin: "0 0 14px", color: T.cream }}>
              Blaulichtfilter-Brille Herren — <em style={{ fontStyle: "italic", color: T.gold }}>158 mm</em> für breite Köpfe
            </h1>
            <p style={{ fontFamily: SANS, fontSize: 16.5, lineHeight: 1.6, color: "rgba(237,231,217,0.82)", margin: "0 0 22px", maxWidth: 620 }}>
              Die meisten Blaulichtfilter-Brillen enden bei 145 mm Frontbreite. Unsere fängt dort an, wo deine anfängt zu drücken.
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 26 }}>
              {badges.map((b) => (
                <span key={b} style={{ fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(237,231,217,0.75)", border: "1px solid rgba(202,164,73,0.45)", padding: "5px 10px", borderRadius: 2 }}>
                  {b}
                </span>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link
                to={FIT_HREF}
                style={{ background: T.gold, color: T.ctaInk, padding: "13px 22px", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", textDecoration: "none", borderRadius: 2, fontWeight: 700 }}
              >
                Gesicht mit FitLens messen
              </Link>
              <a
                href="#fassungen"
                style={{ background: "transparent", color: T.cream, padding: "13px 22px", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", textDecoration: "none", border: "1px solid rgba(237,231,217,0.45)", borderRadius: 2 }}
              >
                Fassungen ansehen
              </a>
            </div>
          </div>
        </header>

        {/* 2 — Antwortblock */}
        <section aria-labelledby="answer-heading" style={{ ...wrap, padding: "30px 20px 8px" }}>
          <div style={{ background: T.panel, border: `1px solid ${T.hair}`, borderLeft: `3px solid ${T.gold}`, padding: "22px 24px", borderRadius: 4 }}>
            <h2 id="answer-heading" style={{ ...h2, fontSize: 22, fontWeight: 400, margin: "0 0 10px" }}>
              Wie breit muss eine Blaulichtfilter-Brille für Herren sein?
            </h2>
            <p style={{ ...p, fontSize: 15.5, color: "#222", margin: 0 }}>
              Die meisten Blaulichtfilter-Brillen sind 130–145 mm breit — deshalb drücken sie auf einem breiten Kopf.
              Woolets Front misst {S007.frameWidth} mm, die Bügel {S007.templeLength} mm, der Keyhole-Steg{" "}
              {S007.bridge}–{S009.bridge} mm. Den Blaulichtfilter gibt es als Glasoption, die Maßanfertigung deckt
              145–172 mm ab.
            </p>
          </div>
        </section>

        {/* 3 — Vergleichstabelle */}
        <section aria-labelledby="compare-heading" style={{ ...wrap, padding: "34px 20px 8px" }}>
          <h2 id="compare-heading" style={h2}>Warum 145-mm-Fassungen bei breiten Köpfen drücken</h2>
          <p style={{ ...p, maxWidth: 660 }}>
            Die Beschichtung ist im ganzen Markt praktisch dieselbe. Die Millimeter sind es nicht. Unten die Geometrie
            einer typischen Blaulichtfilter-Brille gegen die beiden Woolet-Formen.
          </p>
          <div style={{ overflowX: "auto", border: `1px solid ${T.hair}`, borderRadius: 4, background: T.panel }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
              <caption className="sr-only">Maße: typische Blaulichtfilter-Brille im Vergleich zu Woolet 007 und 009</caption>
              <thead>
                <tr style={{ background: "#FBF7EE" }}>
                  <th scope="col" style={{ ...cell, borderTop: 0, textAlign: "left", fontSize: 11, letterSpacing: "1px", textTransform: "uppercase", color: "#666" }}>Maß</th>
                  <th scope="col" style={{ ...cell, borderTop: 0, textAlign: "left", fontSize: 12, color: T.ink }}>Typische Fassung (130–145 mm)</th>
                  <th scope="col" style={{ ...cell, borderTop: 0, textAlign: "left", fontSize: 12, color: T.ink }}>Woolet 007 Rund</th>
                  <th scope="col" style={{ ...cell, borderTop: 0, textAlign: "left", fontSize: 12, color: T.ink }}>Woolet 009 Soft Square</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map(([label, typical, a, b]) => (
                  <tr key={label}>
                    <th scope="row" style={{ ...cell, textAlign: "left", fontWeight: 600, color: "#555" }}>{label}</th>
                    <td style={{ ...cell, color: "#8A7F6C" }}>{typical}</td>
                    <td style={{ ...cell, color: T.ink }}>{a}</td>
                    <td style={{ ...cell, color: T.ink }}>{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ ...p, fontSize: 13, color: "#7A7263", margin: "10px 0 0" }}>
            „Variiert" heißt genau das: Die mittlere Spalte ist eine Marktspanne, kein konkretes Produkt. Maße von
            Fassungen, die wir nicht selbst gemessen haben, veröffentlichen wir nicht.
          </p>
        </section>

        {/* 4 — Mit oder ohne Sehstärke */}
        <section aria-labelledby="rx-heading" style={{ ...wrap, padding: "34px 20px 8px" }}>
          <h2 id="rx-heading" style={h2}>Mit oder ohne Sehstärke</h2>
          <p style={{ ...p, maxWidth: 660 }}>
            Beides ist dieselbe Fassung. Der Unterschied liegt im Glas, und die Breite entscheidest du zuerst.
          </p>
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            <article style={{ background: T.panel, border: `1px solid ${T.hair}`, borderRadius: 4, padding: "18px 20px" }}>
              <h3 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 20, margin: "0 0 8px" }}>Ohne Sehstärke</h3>
              <p style={{ ...p, margin: 0, fontSize: 14.5 }}>
                Planes Glas, UV400, inklusive. Wer nur eine Fassung sucht, die auf einem breiten Kopf sitzt, ist hier
                fertig: {S007.frameWidth} mm Front, {S007.templeLength} mm Bügel.
              </p>
            </article>
            <article style={{ background: T.panel, border: `1px solid ${T.hair}`, borderRadius: 4, padding: "18px 20px" }}>
              <h3 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 20, margin: "0 0 8px" }}>Mit Sehstärke</h3>
              <p style={{ ...p, margin: 0, fontSize: 14.5 }}>
                Einstärken- oder Gleitsichtgläser, auf die {S007.frameWidth}-mm-Front geschliffen. Wird nach der
                Messung separat angeboten — deine Werte, deine PD.
              </p>
            </article>
            <article style={{ background: T.panel, border: `1px solid ${T.hair}`, borderRadius: 4, padding: "18px 20px" }}>
              <h3 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 20, margin: "0 0 8px" }}>
                Blaulichtfilter {blueLightReady ? "(optional)" : "(bald verfügbar)"}
              </h3>
              <p style={{ ...p, margin: 0, fontSize: 14.5 }}>
                {blueLightReady
                  ? `Optionale Beschichtung, die Blaulicht im Bereich ${FILTER_SPEC} filtert. UV400. Eine optionale Glasbeschichtung, kein Medizinprodukt.`
                  : "Optionale Beschichtung, UV400. Eine optionale Glasbeschichtung, kein Medizinprodukt. Filterbereich und Aufpreis nennen wir, bevor die erste Serie ausgeliefert wird."}
              </p>
            </article>
          </div>
        </section>

        {/* 5 — Für wen */}
        <section aria-labelledby="who-heading" style={{ ...wrap, padding: "34px 20px 8px" }}>
          <h2 id="who-heading" style={h2}>Für wen</h2>
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            {segments.map((s) => (
              <article key={s.title} style={{ background: T.panel, border: `1px solid ${T.hair}`, borderRadius: 4, padding: "18px 20px" }}>
                <h3 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 20, margin: "0 0 8px", color: T.ink }}>{s.title}</h3>
                <p style={{ ...p, margin: 0, fontSize: 14.5 }}>{s.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* 6 — Ehrlichkeits-Abschnitt */}
        <section aria-labelledby="evidence-heading" style={{ ...wrap, padding: "34px 20px 8px" }}>
          <h2 id="evidence-heading" style={h2}>Bringt ein Blaulichtfilter etwas?</h2>
          <p style={{ ...p, maxWidth: 660 }}>
            Wahrscheinlich nicht so, wie die Kategorie es bewirbt. Eine Cochrane-Übersichtsarbeit von 2023 hat 17
            randomisierte Studien ausgewertet und kommt zu dem Schluss: Brillengläser mit Blaulichtfilter machen
            wahrscheinlich keinen messbaren Unterschied bei der Ermüdung während der Bildschirmarbeit, und für einen
            Effekt auf Augengesundheit oder Schlafqualität gibt es keine belastbaren Belege. Die Aussagesicherheit
            wurde als niedrig bis moderat eingestuft.
          </p>
          <p style={{ ...p, maxWidth: 660 }}>
            Wir bieten den Filter an, weil er nachgefragt wird — so wie eine Tönung nachgefragt wird. Ein Versprechen
            für deine Abende ist er nicht. Wofür wir geradestehen, sind die Millimeter: {S007.frameWidth} mm Front,{" "}
            {S007.bridge}–{S009.bridge} mm Keyhole-Steg, {S007.templeLength} mm Bügel — gebaut für Köpfe, für die der
            Rest des Marktes nicht mehr konstruiert.
          </p>
          <p style={{ ...p, fontSize: 13, color: "#7A7263", maxWidth: 660 }}>
            Quelle:{" "}
            <a
              href="https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD013244.pub2/full"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: T.goldDim, textUnderlineOffset: 3 }}
            >
              Cochrane Database of Systematic Reviews, 2023
            </a>
            .
          </p>
        </section>

        {/* 7 — Fassungen */}
        <section id="fassungen" aria-labelledby="frames-heading" style={{ ...wrap, padding: "34px 20px 8px", scrollMarginTop: 80 }}>
          <h2 id="frames-heading" style={h2}>Zwei Formen, beide 158 mm</h2>
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
            {[S007, S009].map((s) => (
              <Link
                key={s.href}
                to={s.href}
                style={{ display: "block", background: T.panel, border: `1px solid ${T.hair}`, borderRadius: 4, padding: "18px 20px", textDecoration: "none", color: T.ink }}
              >
                <div style={{ fontFamily: SERIF, fontSize: 20, marginBottom: 6 }}>{s.name}</div>
                <div style={{ fontSize: 13, color: "#666", lineHeight: 1.55, marginBottom: 10 }}>
                  {s.frameWidth} mm Front · {s.bridge} mm Keyhole-Steg · {s.lensWidth} mm Glas · {s.templeLength} mm Bügel.
                </div>
                <div style={{ fontSize: 12.5, color: T.goldDim, marginBottom: 12 }}>Blaulichtfilter als Glasoption erhältlich.</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ color: T.goldDim, fontWeight: 700, fontSize: 16 }}>114 $</span>
                  <span style={{ color: "#BBB", fontSize: 12, textDecoration: "line-through" }}>190 $</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: T.goldDim, letterSpacing: "1.5px", textTransform: "uppercase" }}>Ansehen →</span>
                </div>
              </Link>
            ))}
            <Link
              to="/en/bespoke"
              style={{ display: "block", background: T.dark, border: "1px solid rgba(202,164,73,0.4)", borderRadius: 4, padding: "18px 20px", textDecoration: "none", color: T.cream }}
            >
              <div style={{ fontFamily: SERIF, fontSize: 20, marginBottom: 6 }}>Maßanfertigung — 145 bis 162 mm</div>
              <div style={{ fontSize: 13, color: "rgba(237,231,217,0.7)", lineHeight: 1.55, marginBottom: 12 }}>
                Außerhalb von 155–161 mm? Gleiches Mazzucchelli-Acetat, deine Frontbreite, handgefertigt in der EU.
              </div>
              <span style={{ fontSize: 11, color: T.gold, letterSpacing: "1.5px", textTransform: "uppercase" }}>Maßanfertigung ansehen →</span>
            </Link>
          </div>
        </section>

        {/* 8 — FitLens */}
        <section aria-labelledby="fitlens-heading" style={{ ...wrap, padding: "34px 20px 8px" }}>
          <div style={{ background: "#F8F6F1", border: `1px solid ${T.gold}`, borderRadius: 4, padding: "24px 24px", color: T.ctaInk }}>
            <h2 id="fitlens-heading" style={{ ...h2, margin: "0 0 12px", color: T.ctaInk }}>Erst messen, dann Gläser wählen</h2>
            <ol style={{ margin: "0 0 18px", padding: "0 0 0 20px", fontFamily: SANS, fontSize: 14.5, lineHeight: 1.7, color: T.ctaInk }}>
              <li>Miss von Schläfe zu Schläfe, an der breitesten Stelle deines Gesichts.</li>
              <li>Halte das Lineal vor dem Spiegel waagerecht auf Augenhöhe.</li>
              <li>Oder lass FitLens messen — Handykamera, rund eine Minute, ohne Lineal.</li>
            </ol>
            <Link
              to={FIT_HREF}
              style={{ display: "inline-block", background: T.gold, color: T.ctaInk, padding: "13px 22px", fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", textDecoration: "none", borderRadius: 2, fontWeight: 700 }}
            >
              FitLens starten
            </Link>
          </div>
        </section>

        {/* 9 — FAQ */}
        <section aria-labelledby="faq-heading" style={{ ...wrap, padding: "34px 20px 8px" }}>
          <h2 id="faq-heading" style={h2}>Häufige Fragen</h2>
          <div style={{ borderTop: `1px solid ${T.hair}` }}>
            {faqs.map((f, i) => (
              <Faq key={f.q} q={f.q} a={f.a} index={i} />
            ))}
          </div>
        </section>

        {/* 10 — Weiterlesen */}
        <section aria-labelledby="related-heading" style={{ ...wrap, padding: "34px 20px 60px" }}>
          <h2 id="related-heading" style={{ ...h2, fontSize: 22 }}>Weiterlesen</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
            {relatedLinks.map((l) => (
              <li key={l.href}>
                <Link to={l.href} style={{ fontFamily: SANS, fontSize: 14.5, color: T.goldDim, textUnderlineOffset: 3 }}>
                  {l.label} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default BlaulichtfilterBrilleHerren;

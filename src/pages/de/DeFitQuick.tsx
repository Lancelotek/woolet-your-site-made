import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DeReservationCta from "@/components/de/DeReservationCta";
import { Button } from "@/components/ui/button";

type Hat = "klein" | "mittel" | "gross" | "sehr-gross";

export default function DeFitQuick() {
  const [hat, setHat] = useState<Hat | null>(null);
  const standard = hat === "gross";
  const bespoke = hat === "sehr-gross";
  return <main className="min-h-screen bg-background text-foreground">
    <Helmet><html lang="de" /><title>Schneller Brillen-Passform-Quiz | Woolet</title><meta name="description" content="Erhalte in wenigen Schritten eine erste Einschätzung für deine Woolet Passform." /><meta name="robots" content="noindex, follow" /></Helmet>
    <Navbar />
    <section className="px-5 py-12 sm:px-8 lg:py-20"><div className="mx-auto max-w-xl">
      <Link to="/de/fit" className="font-body text-xs uppercase tracking-[0.18em] text-primary">← Zurück zum Brillenfinder</Link>
      <p className="mt-8 font-body text-xs uppercase tracking-[0.22em] text-primary">Schnelle Einschätzung</p><h1 className="mt-4 font-display text-4xl font-light text-foreground">Welche Hutgröße trägst du?</h1><p className="mt-4 font-body leading-7 text-cream-dim">Die Hutgröße ist nur eine grobe Orientierung. Für ein genaues Ergebnis empfehlen wir FitLens.</p>
      <div className="mt-8 grid grid-cols-2 gap-3">{([['klein','S - bis 56 cm'],['mittel','M - 57 bis 58 cm'],['gross','L / XL - 59 bis 62 cm'],['sehr-gross','XXL - ab 63 cm']] as [Hat,string][]).map(([key,label]) => <Button key={key} type="button" variant={hat === key ? "default" : "outline"} onClick={() => setHat(key)} className="h-16 rounded-sm font-body text-sm">{label}</Button>)}</div>
      {hat && <div className="mt-6 border border-primary/40 bg-primary/5 p-6">{standard ? <><h2 className="font-display text-2xl text-foreground">Wahrscheinlich passt Woolet 007 oder 009 mit 158 mm.</h2><p className="mt-2 font-body text-sm leading-6 text-cream-dim">Bestätige die Passform vor der Reservierung mit FitLens.</p><div className="mt-5"><DeReservationCta source="fit_result" /></div><Link to="/de/kollektion" className="mt-4 inline-block font-body text-sm text-primary underline">Kollektion ansehen</Link></> : bespoke ? <><h2 className="font-display text-2xl text-foreground">Für dich ist eine Maßanfertigung wahrscheinlich die bessere Wahl.</h2><Button asChild className="mt-5 h-12 rounded-sm px-6 font-body text-xs uppercase tracking-[0.18em]"><Link to="/de/bespoke">Maßanfertigung ansehen</Link></Button></> : <><h2 className="font-display text-2xl text-foreground">Eine genaue Empfehlung braucht deine Gesichtsbreite.</h2><Button asChild className="mt-5 h-12 rounded-sm px-6 font-body text-xs uppercase tracking-[0.18em]"><Link to="/de/fit">Mit FitLens messen</Link></Button></>}</div>}
    </div></section><Footer lang="de" />
  </main>;
}
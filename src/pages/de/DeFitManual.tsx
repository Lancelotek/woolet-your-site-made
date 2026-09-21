import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DeReservationCta from "@/components/de/DeReservationCta";
import { Button } from "@/components/ui/button";
import manualFitImg from "@/assets/manual-fit-measure.png.asset.json";

export default function DeFitManual() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState("");
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const mm = Number(value.replace(",", ".")) * 10;
    if (!Number.isFinite(mm) || mm < 100 || mm > 220) {
      setError("Bitte gib einen Wert zwischen 10 und 22 cm ein.");
      setResult(null);
      return;
    }
    setError("");
    setResult(Math.round(mm));
  };
  const standard = result != null && result >= 155 && result <= 161;

  return <main className="min-h-screen bg-background text-foreground">
    <Helmet><html lang="de" /><title>Gesichtsbreite manuell messen | Woolet</title><meta name="description" content="Gesichtsbreite ohne Kamera messen und die passende Woolet Brille finden." /><meta name="robots" content="noindex, follow" /></Helmet>
    <Navbar />
    <section className="px-5 py-12 sm:px-8 lg:py-20"><div className="mx-auto max-w-5xl">
      <Link to="/de/fit" className="font-body text-xs uppercase tracking-[0.18em] text-primary">← Zurück zum Brillenfinder</Link>
      <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-16">
        <div><p className="font-body text-xs uppercase tracking-[0.22em] text-primary">Ohne Kamera</p><h1 className="mt-4 font-display text-4xl font-light leading-tight text-foreground">Gesichtsbreite <em className="text-gold-light">manuell messen</em></h1><p className="mt-5 font-body leading-7 text-cream-dim">Halte ein weiches Maßband waagerecht von Schläfe zu Schläfe. Es soll gerade anliegen und nicht über den Haaren verlaufen.</p><div className="mt-7 border border-border-sub bg-cream p-5"><img src={manualFitImg.url} alt="Gesichtsbreite mit einem Maßband von Schläfe zu Schläfe messen" width={900} height={900} className="h-auto w-full" /></div></div>
        <div><form onSubmit={submit} className="border border-border-sub bg-secondary p-6 sm:p-8"><label className="font-body text-sm text-cream-dim" htmlFor="de-face-width">Gesichtsbreite in cm</label><div className="mt-3 flex"><input id="de-face-width" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder="z. B. 15,8" className="min-h-12 min-w-0 flex-1 border border-border-sub bg-background px-4 font-body text-foreground outline-none focus:border-primary" /><span className="flex min-h-12 items-center border border-l-0 border-border-sub px-4 font-body text-primary">cm</span></div>{error && <p role="alert" className="mt-3 font-body text-sm text-destructive">{error}</p>}<Button type="submit" className="mt-5 h-12 w-full rounded-sm font-body text-xs uppercase tracking-[0.18em]">Passende Größe anzeigen</Button></form>
          {result != null && <div className="mt-5 border border-primary/40 bg-primary/5 p-6"><p className="font-body text-xs uppercase tracking-[0.2em] text-primary">Dein Ergebnis - {result} mm</p>{standard ? <><h2 className="mt-3 font-display text-2xl text-foreground">Passt: Woolet 007 oder 009 mit 158 mm</h2><div className="mt-5"><DeReservationCta source="fit_result" /></div><Link to="/de/kollektion" className="mt-4 inline-block font-body text-sm text-primary underline">Kollektion ansehen</Link></> : <><h2 className="mt-3 font-display text-2xl text-foreground">Für dich: Maßanfertigung von 145 bis 172 mm</h2><Button asChild className="mt-5 h-12 rounded-sm px-6 font-body text-xs uppercase tracking-[0.18em]"><Link to="/de/bespoke">Maßanfertigung ansehen</Link></Button></>}</div>}
        </div>
      </div>
    </div></section><Footer lang="de" />
  </main>;
}
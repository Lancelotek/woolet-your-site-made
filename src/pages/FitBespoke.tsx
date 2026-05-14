import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function FitBespoke() {
  return (
    <>
      <SEO
        title="Bespoke Fit — Woolet (150–172 mm)"
        description="If your face falls outside the standard Woolet sizes, bespoke covers 150–172 mm with a 16–26 mm bridge. Hand-crafted by an Italian atelier from your AI scan."
        lang="en"
        path="/fit/bespoke"
        noindex
      />
      <Navbar />
      <main className="bg-background text-foreground min-h-screen">
        <div className="max-w-xl mx-auto px-5 py-20 flex flex-col gap-6">
          <div className="woolet-eyebrow">
            <div className="woolet-eyebrow-line" />
            <span className="woolet-eyebrow-text">BESPOKE · 150–172 MM</span>
          </div>
          <h1 className="font-display text-woolet-white" style={{ fontSize: "clamp(2.2rem, 4vw, 3rem)", fontWeight: 300, lineHeight: 0.95 }}>
            <em className="italic text-gold-light">Made</em> to your scan.
          </h1>
          <p className="text-cream-dim leading-relaxed" style={{ fontSize: "0.95rem" }}>
            Hand-crafted by an Italian atelier from your AI measurement — frame width 150 to 172 mm,
            bridge 16 to 26 mm, lens custom. Reservations open with the Kickstarter on October 13, 2026.
            Limited to 100 backers at $299.
          </p>
          <Link to="/en/fit" className="text-gold-light underline self-start" style={{ fontSize: "0.85rem" }}>
            ← Back to AI Fit
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

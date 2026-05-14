import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function FitManual() {
  return (
    <>
      <SEO
        title="Manual Measurement — Woolet Fit"
        description="Measure your face width, bridge, and PD with a ruler and a credit card. Manual fallback for the Woolet AI Fit scan."
        lang="en"
        path="/fit/manual"
        noindex
      />
      <Navbar />
      <main className="bg-background text-foreground min-h-screen">
        <div className="max-w-xl mx-auto px-5 py-20 flex flex-col gap-6">
          <div className="woolet-eyebrow">
            <div className="woolet-eyebrow-line" />
            <span className="woolet-eyebrow-text">MANUAL FIT · COMING SOON</span>
          </div>
          <h1 className="font-display text-woolet-white" style={{ fontSize: "clamp(2.2rem, 4vw, 3rem)", fontWeight: 300, lineHeight: 0.95 }}>
            <em className="italic text-gold-light">Ruler</em> method.
          </h1>
          <p className="text-cream-dim leading-relaxed" style={{ fontSize: "0.95rem" }}>
            A step-by-step ruler-and-credit-card measurement guide is being filmed. Until then,
            the AI scan is the fastest path to your size — it works on any phone camera in 30 seconds.
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

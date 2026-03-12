import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Section {
  num: string;
  title: string;
  content: React.ReactNode;
}

const PolicyPage = ({ title, meta, sections }: { title: string; meta: string; sections: Section[] }) => {
  return (
    <div className="relative z-[1] flex flex-col min-h-screen">
      <div className="fixed pointer-events-none z-0 rounded-full w-[700px] h-[700px] -top-[250px] -right-[200px]"
        style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.05) 0%, transparent 65%)" }} />

      <nav className="sticky top-0 z-50 px-5 md:px-12 py-5 flex items-center justify-between bg-background/92 backdrop-blur-xl"
        style={{ borderBottom: "1px solid hsl(0 0% 100% / 0.055)" }}>
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="font-display text-2xl text-woolet-white tracking-wide">Woolet</span>
        </Link>
        <Link to="/" className="flex items-center gap-2 no-underline text-cream-dim hover:text-primary transition-colors uppercase tracking-[0.22em]" style={{ fontSize: "0.58rem" }}>
          <span>←</span> Back to Home
        </Link>
      </nav>

      <div className="relative z-[1] max-w-[860px] mx-auto px-8 py-20 w-full">
        <div className="woolet-eyebrow mb-5">
          <div className="woolet-eyebrow-line" />
          <span className="woolet-eyebrow-text">Legal</span>
        </div>
        <h1 className="font-display text-woolet-white leading-tight mb-4" style={{ fontSize: "clamp(2.2rem, 4vw, 3.6rem)" }}>
          {title}
        </h1>
        <div className="text-cream-dim tracking-wider mb-12 pb-8" style={{ fontSize: "0.66rem", borderBottom: "1px solid hsl(0 0% 100% / 0.055)" }}>
          {meta}
        </div>

        <div className="flex flex-col gap-9">
          {sections.map((section, i) => (
            <div key={i}>
              <div className="flex flex-col gap-3">
                <span className="woolet-section-num">{section.num}</span>
                <h2 className="font-display text-woolet-white leading-snug" style={{ fontSize: "1.3rem", fontWeight: 400 }}>
                  {section.title}
                </h2>
                <div className="text-cream-dim leading-relaxed tracking-wider space-y-3" style={{ fontSize: "0.85rem" }}>
                  {section.content}
                </div>
              </div>
              {i < sections.length - 1 && <div className="woolet-divider my-9" />}
            </div>
          ))}
        </div>
      </div>

      <footer className="mt-20 px-5 md:px-12 py-5 flex flex-col md:flex-row items-center justify-between gap-3"
        style={{ borderTop: "1px solid hsl(0 0% 100% / 0.055)" }}>
        <span className="text-cream-dim opacity-45 tracking-wider" style={{ fontSize: "0.58rem" }}>
          © 2025 JAY23 LLC · woolet.co · All rights reserved.
        </span>
        <div className="flex gap-5">
          <Link to="/privacy-policy" className="text-cream-dim no-underline uppercase tracking-[0.18em] hover:text-primary transition-colors" style={{ fontSize: "0.56rem" }}>Privacy Policy</Link>
          <Link to="/return-policy" className="text-cream-dim no-underline uppercase tracking-[0.18em] hover:text-primary transition-colors" style={{ fontSize: "0.56rem" }}>Return Policy</Link>
          <a href="mailto:support@woolet.co" className="text-cream-dim no-underline uppercase tracking-[0.18em] hover:text-primary transition-colors" style={{ fontSize: "0.56rem" }}>support@woolet.co</a>
        </div>
      </footer>
    </div>
  );
};

export default PolicyPage;

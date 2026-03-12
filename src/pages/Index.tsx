import heroManImg from "@/assets/hero-man.jpg";
import heroMobileImg from "@/assets/hero-mobile.png";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Countdown from "@/components/Countdown";
import WaitlistForm from "@/components/WaitlistForm";
import Testimonials from "@/components/Testimonials";
import ModelPills from "@/components/ModelPills";
import BenefitsBar from "@/components/BenefitsBar";
import BeforeAfter from "@/components/BeforeAfter";

const Index = () => {
  return (
    <div className="relative z-[1] flex flex-col min-h-screen">
      {/* Ambient glows */}
      <div className="fixed pointer-events-none z-0 rounded-full w-[900px] h-[900px] -top-[350px] -right-[300px]"
        style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.055) 0%, transparent 60%)" }} />
      <div className="fixed pointer-events-none z-0 rounded-full w-[600px] h-[600px] -bottom-[100px] -left-[200px]"
        style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.04) 0%, transparent 60%)" }} />

      <Navbar />

      {/* HERO */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_520px] min-h-[calc(100vh-62px)] animate-fade-in">
        {/* MOBILE-ONLY hero image */}
        <div className="block lg:hidden w-full aspect-[3/4] overflow-hidden">
          <img src={heroMobileImg} alt="Man wearing Woolet eyewear" className="w-full h-full object-cover object-top" />
        </div>

        {/* LEFT: Visual (desktop only) */}
        <div className="relative overflow-hidden bg-surface border-r hidden lg:block"
          style={{ borderRightColor: "hsl(0 0% 100% / 0.055)" }}>
          <div className="absolute inset-0 flex items-end overflow-hidden">
            <img src={heroManImg} alt="Man wearing Woolet wide-face eyewear" className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent 50%, hsl(var(--background) / 0.4) 100%)" }} />
          </div>

          {/* Before / After strip */}
          <div className="absolute bottom-0 left-0 right-0 z-[2]">
            <BeforeAfter />
          </div>

          {/* Overlay gradient */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent 60%, hsl(var(--background) / 0.35) 100%)" }} />
        </div>

        {/* RIGHT: Form panel */}
        <div className="flex flex-col p-6 lg:p-10 overflow-y-auto gap-8 lg:border-l"
          style={{ borderLeftColor: "hsl(0 0% 100% / 0.055)" }}>
          {/* Eyebrow + Headline */}
          <div>
            <div className="woolet-eyebrow mb-4">
              <div className="woolet-eyebrow-line" />
              <span className="woolet-eyebrow-text animate-pulse-gold">15% Off + Free Shipping — Waitlist Only</span>
            </div>
            <h1 className="font-display text-woolet-white leading-none mb-3" style={{ fontSize: "clamp(2rem, 3.2vw, 3.2rem)" }}>
              Finally frames<br />that fit a <em className="italic text-gold-light">wide face.</em>
            </h1>
            <p className="text-cream-dim leading-relaxed tracking-wider" style={{ fontSize: "0.8rem" }}>
              Woolet 007 &amp; 009 — Italian acetate, precision-engineered for 155mm+ face widths. Extended temples. Wider bridge. Zero compromise on style.
            </p>
          </div>

          <Countdown />
          <WaitlistForm />
          <Testimonials />

          <div className="woolet-divider" />

          <ModelPills />

          {/* Benefits */}
          <div>
            <div className="flex flex-col gap-1 mb-4">
              <div className="font-display text-woolet-white" style={{ fontSize: "1.15rem" }}>Waitlist Benefits</div>
              <div className="text-cream-dim tracking-wider" style={{ fontSize: "0.62rem" }}>Reserved exclusively for early supporters</div>
            </div>
            <BenefitsBar />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;

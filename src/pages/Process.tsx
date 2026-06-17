import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Step = {
  n: number;
  title: string;
  body: string;
  /** When true, render a paired visual placeholder block. */
  withVisual?: boolean;
  /** Alt text describing what photo will go in the placeholder, for future drop-in. */
  visualAlt?: string;
};

const STEPS: Step[] = [
  {
    n: 1,
    title: "Digital engineering & CAD",
    body:
      "We build the linear design on the computer, tailored to the exact measurements of your frame — not a generic mould. This is where your face data becomes geometry.",
    withVisual: true,
    visualAlt: "CAD wireframe of a Woolet acetate frame being engineered from face-scan measurements",
  },
  {
    n: 2,
    title: "Precision cutting",
    body:
      "The front and the temples are cut: CNC precision where it counts, by hand where it shows.",
  },
  {
    n: 3,
    title: "Component integration",
    body:
      "Rivets, hinges (charnières) and every metal functional element are placed and stabilised by hand.",
  },
  {
    n: 4,
    title: "Lens grooving (beveling)",
    body:
      "The internal rims are precision-beveled to create the exact groove profile, so the lenses sit seamlessly.",
  },
  {
    n: 5,
    title: "Front base curve shaping",
    body:
      "The front is thermally heated under control to lock in the precise optical base curve the lenses need.",
  },
  {
    n: 6,
    title: "Hand-shaping & filing",
    body:
      "The purely handmade stage begins. Files, sandpapers and specialised tools work each frame individually into its exact shape and contours.",
    withVisual: true,
    visualAlt: "Artisan hand-filing a Woolet acetate frame at the Italian atelier",
  },
  {
    n: 7,
    title: "Anatomical bridge sculpting",
    body:
      "The nose bridge is hand-sculpted for balanced weight distribution and all-day comfort — the detail that makes a wider frame disappear on your face.",
  },
  {
    n: 8,
    title: "Organic sanding (tumbling)",
    body:
      "The frames go into the first tumbling barrel for surface smoothing and leveling. 14–17 hours.",
    withVisual: true,
    visualAlt: "Wooden tumbling barrel rotating acetate frames during the organic sanding stage",
  },
  {
    n: 9,
    title: "Frame & temple alignment",
    body:
      "Front and temples are hand-assembled and balanced for perfect symmetry and zero gaps at the joints.",
  },
  {
    n: 10,
    title: "First polishing (tumbling)",
    body:
      "Into the second barrel for the primary polishing stage. 24–27 hours.",
  },
  {
    n: 11,
    title: "Final hand-buffing & finishing",
    body:
      "Finished by hand on specialised wheels with custom waxes — the source of that signature acetate luster.",
  },
  {
    n: 12,
    title: "Anatomical tailoring, engraving & QC",
    body:
      "Final anatomical adjustments (cold-bending), custom engraving of the Woolet logo and your name, then a rigorous final quality control inspection.",
    withVisual: true,
    visualAlt: "Close-up of a Woolet acetate temple being engraved with the wearer's name",
  },
  {
    n: 13,
    title: "Ultrasonic cleaning",
    body:
      "A deep ultrasonic-wave clean removes every trace of polishing compound and micro-dust before the frame is packed.",
  },
];

const HOW_TO_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How a Woolet frame is made",
  description:
    "The 13-stage process behind every Woolet frame — from CAD engineering on your face measurements to the final ultrasonic clean. Hand-finished in Italy from Mazzucchelli acetate.",
  totalTime: "P21D",
  step: STEPS.map((s) => ({
    "@type": "HowToStep",
    position: s.n,
    name: s.title,
    text: s.body,
    url: `https://woolet.co/en/process#step-${s.n}`,
  })),
};

const Process = () => {
  return (
    <>
      <SEO
        title="The Woolet Process — How Our Italian Acetate Eyewear Is Made"
        description="How a Woolet frame is made: 13 stages from CAD to ultrasonic cleaning, hand-finished in Italy from Mazzucchelli acetate and tailored for wider faces."
        lang="en"
        path="/process"
        jsonLd={HOW_TO_JSON_LD}
      />
      <Navbar />

      <main className="min-h-screen bg-background text-foreground">
        {/* Hero */}
        <section className="w-full px-5 sm:px-8 lg:px-16 pt-20 sm:pt-28 pb-16 sm:pb-20">
          <div className="max-w-3xl mx-auto text-center">
            <p
              className="uppercase tracking-[0.28em] text-gold-light mb-6"
              style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.62rem", fontWeight: 500 }}
            >
              The Process
            </p>
            <h1
              className="font-display text-woolet-white mb-8"
              style={{
                fontSize: "clamp(2.2rem, 5.5vw, 4rem)",
                fontWeight: 300,
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
              }}
            >
              The Woolet <em className="italic text-gold-light">Process</em>
            </h1>
            <p
              className="text-cream-dim mx-auto mb-10"
              style={{ fontSize: "1.02rem", lineHeight: 1.7, maxWidth: "38rem" }}
            >
              Every Woolet frame is built around one face — yours. From the first
              digital sketch to the final ultrasonic rinse, it passes through hand
              and machine more than a dozen times.
            </p>
            <div
              className="inline-flex items-center gap-3 px-4 py-2"
              style={{
                border: "1px solid hsl(var(--gold) / 0.32)",
                background: "hsl(var(--gold) / 0.05)",
                borderRadius: "999px",
              }}
            >
              <span
                className="uppercase tracking-[0.22em] text-gold-light"
                style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.6rem", fontWeight: 500 }}
              >
                13 stages · Mostly by hand · Italian Mazzucchelli acetate
              </span>
            </div>
          </div>
        </section>

        <div className="woolet-divider max-w-3xl mx-auto" />

        {/* Steps */}
        <section className="w-full px-5 sm:px-8 lg:px-16 py-20 sm:py-28">
          <div className="max-w-5xl mx-auto">
            <ol className="flex flex-col gap-16 sm:gap-20 list-none p-0 m-0">
              {STEPS.map((step, i) => {
                const reverse = i % 2 === 1;
                return (
                  <li
                    key={step.n}
                    id={`step-${step.n}`}
                    className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start scroll-mt-24"
                  >
                    {/* Number column */}
                    <div
                      className={`md:col-span-2 ${
                        reverse ? "md:order-2 md:text-right" : "md:order-1"
                      }`}
                    >
                      <span
                        className="font-display text-gold-light/70 block"
                        style={{
                          fontSize: "clamp(2.6rem, 4.5vw, 3.6rem)",
                          fontWeight: 300,
                          lineHeight: 1,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {String(step.n).padStart(2, "0")}
                      </span>
                      <span
                        className="block mt-3 uppercase tracking-[0.24em] text-cream-dim/50"
                        style={{
                          fontFamily: "Barlow, sans-serif",
                          fontSize: "0.55rem",
                          fontWeight: 500,
                        }}
                      >
                        Stage {step.n} / 13
                      </span>
                    </div>

                    {/* Text column */}
                    <div
                      className={`md:col-span-${step.withVisual ? "5" : "10"} ${
                        reverse ? "md:order-1" : "md:order-2"
                      }`}
                    >
                      <h2
                        className="font-display text-woolet-white mb-4"
                        style={{
                          fontSize: "clamp(1.35rem, 2.2vw, 1.75rem)",
                          fontWeight: 400,
                          lineHeight: 1.2,
                          letterSpacing: "-0.005em",
                        }}
                      >
                        {step.title}
                      </h2>
                      <p
                        className="text-cream-dim"
                        style={{ fontSize: "0.98rem", lineHeight: 1.75, maxWidth: "36rem" }}
                      >
                        {step.body}
                      </p>
                    </div>

                    {/* Visual placeholder column */}
                    {step.withVisual && (
                      <div className={`md:col-span-5 ${reverse ? "md:order-3" : "md:order-3"}`}>
                        <div
                          role="img"
                          aria-label={step.visualAlt}
                          className="w-full flex items-center justify-center"
                          style={{
                            aspectRatio: "4 / 3",
                            background:
                              "linear-gradient(135deg, hsl(var(--gold) / 0.06), hsl(var(--gold) / 0.015))",
                            border: "1px solid hsl(var(--gold) / 0.18)",
                          }}
                        >
                          <span
                            className="uppercase tracking-[0.28em] text-cream-dim/40 px-6 text-center"
                            style={{
                              fontFamily: "Barlow, sans-serif",
                              fontSize: "0.55rem",
                              fontWeight: 500,
                            }}
                          >
                            Photo · {step.title}
                          </span>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <div className="woolet-divider max-w-3xl mx-auto" />

        {/* Closing band */}
        <section
          className="w-full px-5 sm:px-8 lg:px-16 py-20 sm:py-28"
          style={{ background: "hsl(var(--gold) / 0.04)" }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <p
              className="font-display text-woolet-white mb-10"
              style={{
                fontSize: "clamp(1.4rem, 2.6vw, 2rem)",
                fontWeight: 300,
                lineHeight: 1.3,
                letterSpacing: "-0.005em",
              }}
            >
              Made from <em className="italic text-gold-light">Italian Mazzucchelli</em> acetate.
              <br className="hidden sm:block" /> Hand-finished in Italy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center items-center">
              <Link
                to="/en/fit"
                className="inline-flex items-center justify-center uppercase tracking-[0.22em] no-underline transition-all hover:opacity-90"
                style={{
                  background: "hsl(var(--gold))",
                  color: "hsl(var(--background))",
                  fontFamily: "Barlow, sans-serif",
                  fontWeight: 500,
                  fontSize: "0.72rem",
                  padding: "18px 32px",
                }}
              >
                Find your fit
              </Link>
              <Link
                to="/en/bespoke"
                className="inline-flex items-center justify-center uppercase tracking-[0.22em] no-underline transition-all hover:border-gold-light/60 hover:text-woolet-white"
                style={{
                  border: "1px solid hsl(var(--gold) / 0.4)",
                  color: "hsl(var(--gold-light))",
                  fontFamily: "Barlow, sans-serif",
                  fontWeight: 500,
                  fontSize: "0.72rem",
                  padding: "17px 32px",
                  background: "transparent",
                }}
              >
                Explore bespoke
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Process;

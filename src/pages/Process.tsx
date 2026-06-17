import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getMetadata } from "@/seo/metadata";

type Step = {
  day: number;
  title: string;
  body: string;
  duration?: string;
};

type Week = {
  label: string;
  title: string;
  steps: Step[];
};

const WEEKS: Week[] = [
  {
    label: "Week One",
    title: "Design & Build",
    steps: [
      { day: 1, title: "Digital Engineering & CAD", body: "Your face data becomes a CAD design built for one frame." },
      { day: 2, title: "Precision Cutting", body: "Front and temples cut — CNC where it counts, by hand where it shows." },
      { day: 3, title: "Component Integration", body: "Rivets, hinges and metal elements set and stabilised by hand." },
      { day: 4, title: "Lens Grooving", body: "Internal rims precision-beveled for a seamless lens groove." },
      { day: 5, title: "Front Base Curve Shaping", body: "Controlled thermal heating locks in the optical base curve." },
      { day: 6, title: "Hand-Shaping & Filing", body: "Files and tools work each frame individually into shape." },
      { day: 7, title: "Anatomical Bridge Sculpting", body: "Bridge hand-sculpted for balance on a wider face." },
    ],
  },
  {
    label: "Week Two",
    title: "Finish & Ship",
    steps: [
      { day: 8, title: "Organic Sanding", body: "First tumbling barrel — surface smoothing and leveling.", duration: "14–17 hours" },
      { day: 9, title: "Frame & Temple Alignment", body: "Front and temples hand-balanced for zero gaps at the joints." },
      { day: 10, title: "First Polishing — begins", body: "Second tumbling barrel for the primary polishing stage.", duration: "24–27 hours" },
      { day: 11, title: "First Polishing — completes", body: "Frames come out of the barrel with their deep base shine." },
      { day: 12, title: "Final Hand-Buffing", body: "Hand-finished on wheels with custom waxes for signature luster." },
      { day: 13, title: "Tailoring, Engraving & QC", body: "Cold-bend fit, your name engraved, then rigorous QC." },
      { day: 14, title: "Ultrasonic Cleaning & Ship", body: "Deep ultrasonic clean removes all residue before it ships." },
    ],
  },
];




const PROCESS_META = getMetadata("/en/process");
const HOW_TO_JSON_LD = PROCESS_META.jsonLd;

const Process = () => {
  return (
    <>
      <SEO
        title={PROCESS_META.title}
        description={PROCESS_META.description}
        lang="en"
        path="/process"
        jsonLd={HOW_TO_JSON_LD}
      />
      <Navbar />

      <main className="min-h-screen bg-background text-foreground">
        {/* Hero */}
        <section className="w-full px-5 sm:px-8 lg:px-16 pt-20 sm:pt-28 pb-14 sm:pb-20">
          <div className="max-w-3xl mx-auto text-center">
            <p
              className="uppercase text-gold-light mb-6"
              style={{
                fontFamily: "Barlow, sans-serif",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.24em",
              }}
            >
              Made in Italy · 13 stages · ~14 days per frame
            </p>
            <h1
              className="font-display text-woolet-white mb-7"
              style={{
                fontSize: "clamp(2.4rem, 5.8vw, 4.2rem)",
                fontWeight: 500,
                lineHeight: 1.04,
                letterSpacing: "-0.012em",
              }}
            >
              The Woolet <em className="italic text-gold-light">Process</em>
            </h1>
            <p
              className="text-cream-dim mx-auto"
              style={{ fontSize: "1.05rem", lineHeight: 1.7, maxWidth: "38rem" }}
            >
              A made-to-order frame takes about two weeks — from your measurements
              to the final clean. Here is the build, day by day.
            </p>
          </div>
        </section>

        {/* Timeline */}
        <section className="w-full px-5 sm:px-8 lg:px-16 pb-20 sm:pb-28">
          <div className="max-w-5xl mx-auto">
            {WEEKS.map((week, wi) => (
              <div key={week.label} className={wi === 0 ? "" : "mt-16 sm:mt-20"}>
                {/* Week header */}
                <div className="pl-[68px] sm:pl-[120px] mb-8 sm:mb-10">
                  <p
                    className="uppercase text-gold-light mb-2"
                    style={{
                      fontFamily: "Barlow, sans-serif",
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      letterSpacing: "0.22em",
                    }}
                  >
                    {week.label}
                  </p>
                  <h2
                    className="font-display text-woolet-white"
                    style={{
                      fontSize: "clamp(1.4rem, 2.4vw, 1.85rem)",
                      fontWeight: 500,
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {week.title}
                  </h2>
                </div>

                {/* Days */}
                <ol
                  className="relative list-none p-0 m-0"
                  style={{
                    // Rail x-position = numeral column width + gutter to rail
                    ["--rail-x" as string]: "92px",
                  } as React.CSSProperties}
                >
                  {/* Single vertical rail */}
                  <div
                    aria-hidden
                    className="absolute top-0 bottom-0 sm:[--rail-x:148px]"
                    style={{
                      left: "calc(var(--rail-x) - 1px)",
                      width: "2px",
                      background: "hsl(var(--gold) / 0.32)",
                    }}
                  />

                  {week.steps.map((step) => (
                    <li
                      key={step.day}
                      id={`day-${step.day}`}
                      className="relative grid grid-cols-[72px_1fr] sm:grid-cols-[128px_1fr] items-stretch scroll-mt-24 sm:[--rail-x:148px]"
                      style={{
                        ["--rail-x" as string]: "92px",
                      } as React.CSSProperties}
                    >
                      {/* Day number column */}
                      <div className="relative pr-4 sm:pr-6 py-4 text-right">
                        <span
                          className="block uppercase text-cream-dim/55"
                          style={{
                            fontFamily: "Barlow, sans-serif",
                            fontSize: "0.6rem",
                            fontWeight: 600,
                            letterSpacing: "0.28em",
                          }}
                        >
                          Day
                        </span>
                        <span
                          className="font-display text-gold-light block mt-1"
                          style={{
                            fontSize: "clamp(1.85rem, 3vw, 2.4rem)",
                            fontWeight: 600,
                            lineHeight: 1,
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {String(step.day).padStart(2, "0")}
                        </span>
                      </div>

                      {/* Connector from rail to card */}
                      <div
                        aria-hidden
                        className="absolute top-1/2 -translate-y-1/2"
                        style={{
                          left: "var(--rail-x)",
                          width: "18px",
                          height: "2px",
                          background: "hsl(var(--gold) / 0.45)",
                        }}
                      />
                      {/* Node circle on the rail */}
                      <span
                        aria-hidden
                        className="absolute top-1/2 -translate-y-1/2 rounded-full"
                        style={{
                          left: "calc(var(--rail-x) - 8px)",
                          width: "16px",
                          height: "16px",
                          background: "hsl(var(--background))",
                          border: "2px solid hsl(var(--gold))",
                        }}
                      />

                      {/* Card */}
                      <div className="pl-8 sm:pl-10 py-3">
                        <div
                          className="px-5 sm:px-7 py-5 sm:py-6 transition-colors"
                          style={{
                            background: "hsl(var(--gold) / 0.04)",
                            border: "1px solid hsl(var(--gold) / 0.22)",
                            borderRadius: "12px",
                          }}
                        >
                          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-2">
                            <h3
                              className="text-woolet-white"
                              style={{
                                fontFamily: "Barlow, sans-serif",
                                fontSize: "1.05rem",
                                fontWeight: 600,
                                letterSpacing: "-0.002em",
                              }}
                            >
                              {step.title}
                            </h3>
                            {step.duration && (
                              <span
                                className="uppercase text-gold-light"
                                style={{
                                  fontFamily: "Barlow, sans-serif",
                                  fontSize: "0.6rem",
                                  fontWeight: 600,
                                  letterSpacing: "0.18em",
                                  border: "1px solid hsl(var(--gold) / 0.55)",
                                  borderRadius: "999px",
                                  padding: "3px 10px",
                                }}
                              >
                                {step.duration}
                              </span>
                            )}
                          </div>
                          <p
                            className="text-cream-dim"
                            style={{ fontSize: "0.95rem", lineHeight: 1.65 }}
                          >
                            {step.body}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        <div className="woolet-divider max-w-3xl mx-auto" />

        {/* Closing band */}
        <section
          className="w-full px-5 sm:px-8 lg:px-16 py-20 sm:py-28"
          style={{ background: "hsl(var(--gold) / 0.04)" }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2
              className="font-display text-woolet-white mb-4"
              style={{
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                fontWeight: 500,
                lineHeight: 1.2,
                letterSpacing: "-0.005em",
              }}
            >
              Measured for you.
            </h2>
            <p
              className="text-cream-dim mb-10"
              style={{ fontSize: "1rem", lineHeight: 1.7 }}
            >
              Made from <em className="italic text-gold-light">Italian Mazzucchelli</em> acetate.
              Hand-finished in Italy.
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

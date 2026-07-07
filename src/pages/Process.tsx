import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getMetadata } from "@/seo/metadata";
import fitProblem01 from "@/assets/process/fit-problem-01.png.asset.json";
import fitProblem02 from "@/assets/process/fit-problem-02.png.asset.json";
import fitProblem03 from "@/assets/process/fit-problem-03.png.asset.json";
import build04 from "@/assets/process/build-04.png.asset.json";

type EditorialChapter = {
  index: string;
  eyebrow: string;
  src: string;
  alt: string;
  caption: string;
};

const CHAPTERS: EditorialChapter[] = [
  {
    index: "01",
    eyebrow: "The Fit Problem / 01",
    src: fitProblem01.url,
    alt: "Close-up of a man with a wide face wearing a too-narrow gold wire frame that pinches his temples — Woolet illustrates why standard 138–148 mm frames fail on 155 mm+ faces.",
    caption: "Frames hide their width. Most run too narrow — and you can't tell until they pinch. Woolet starts at a true 158 mm front.",
  },
  {
    index: "02",
    eyebrow: "The Fit Problem / 02",
    src: fitProblem02.url,
    alt: "Bearded man with a full, broad face wearing wide tortoise acetate glasses with gold temple detail — Woolet 158 mm frame proportioned for wider bone structure.",
    caption: "A full face needs balance. Small frames make a broad, bearded face look heavier. Proportioned width restores the line.",
  },
  {
    index: "03",
    eyebrow: "The Fit Problem / 03",
    src: fitProblem03.url,
    alt: "Macro close-up of a wide keyhole acetate bridge sitting flush on a wider nose — Woolet keyhole bridges are cut 21–24 mm to fit noses that standard 16–19 mm bridges pinch or slide off.",
    caption: "The nose is its own axis. Standard bridges run 16–19 mm. Some faces need 24. Ours are cut to fit — no perching, no sliding.",
  },
  {
    index: "04",
    eyebrow: "The Build / 04",
    src: build04.url,
    alt: "Italian craftsman hand-polishing a tortoise Mazzucchelli acetate Woolet frame on a workbench in Milano, acetate shavings visible — hand-finished, not injection-molded.",
    caption: "Hand-finished, not molded. Cheap frames are injection-molded and brittle. Woolet is cut from Italian Mazzucchelli acetate, finished by hand in Milano.",
  },
];

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
        availableLangs={["en", "pl", "fr", "es", "de", "ar", "ja"]}
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
              Made in the EU · 13 stages · ~14 days per frame
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

        {/* Editorial chapters — The Fit Problem + The Build */}
        <section
          aria-label="Why Woolet — the fit problem and the build"
          className="w-full pb-14 sm:pb-20"
        >
          <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-16">
            <div className="max-w-3xl mb-10 sm:mb-14">
              <p
                className="uppercase text-gold-light mb-4"
                style={{
                  fontFamily: "Barlow, sans-serif",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  letterSpacing: "0.22em",
                }}
              >
                Why the process matters
              </p>
              <h2
                className="font-display text-woolet-white"
                style={{
                  fontSize: "clamp(1.7rem, 3.2vw, 2.4rem)",
                  fontWeight: 500,
                  lineHeight: 1.15,
                  letterSpacing: "-0.008em",
                }}
              >
                Three fit problems, one <em className="italic text-gold-light">build answer</em>.
              </h2>
            </div>

            <div className="flex flex-col gap-6 sm:gap-8">
              {CHAPTERS.map((c) => (
                <figure
                  key={c.index}
                  className="relative overflow-hidden group"
                  style={{
                    borderRadius: "4px",
                    border: "1px solid hsl(var(--gold) / 0.18)",
                    background: "hsl(var(--panel))",
                  }}
                >
                  <img
                    src={c.src}
                    alt={c.alt}
                    loading="lazy"
                    decoding="async"
                    className="block w-full h-auto"
                    style={{ aspectRatio: "1920 / 1080", objectFit: "cover" }}
                  />
                  <figcaption className="sr-only">{c.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="w-full px-5 sm:px-8 lg:px-16 pb-20 sm:pb-28">
          <div className="max-w-5xl mx-auto">
            {WEEKS.map((week, wi) => (
              <div key={week.label} className={wi === 0 ? "" : "mt-16 sm:mt-20"}>
                {/* Week header */}
                <div className="pl-[72px] sm:pl-[128px] mb-8 sm:mb-10">
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
                    // Mobile keeps rail away from day numerals; desktop uses editorial number column.
                    ["--rail-x" as string]: "24px",
                  } as React.CSSProperties}
                >
                  {/* Single vertical rail */}
                  <div
                    aria-hidden
                    className="absolute top-0 bottom-0 sm:[--rail-x:168px]"
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
                      className="relative grid grid-cols-[48px_1fr] sm:grid-cols-[148px_1fr] items-stretch scroll-mt-24 sm:[--rail-x:168px]"
                      style={{
                        ["--rail-x" as string]: "24px",
                      } as React.CSSProperties}
                    >
                      {/* Day number column */}
                      <div className="relative col-start-2 sm:col-start-1 pr-0 sm:pr-8 pt-4 sm:py-4 pb-1 text-left sm:text-right">
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
                            fontSize: "clamp(1.55rem, 3vw, 2.4rem)",
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
                        className="absolute top-[4.85rem] sm:top-1/2 sm:-translate-y-1/2"
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
                        className="absolute top-[4.85rem] sm:top-1/2 sm:-translate-y-1/2 rounded-full"
                        style={{
                          left: "calc(var(--rail-x) - 8px)",
                          width: "16px",
                          height: "16px",
                          background: "hsl(var(--background))",
                          border: "2px solid hsl(var(--gold))",
                        }}
                      />

                      {/* Card */}
                      <div className="col-start-2 sm:col-start-2 pl-0 sm:pl-12 pt-2 pb-6 sm:py-3">
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
              Hand finished in the EU.
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

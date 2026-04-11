import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const About = () => {
  return (
    <>
      <SEO
        title="About Woolet | Italian Eyewear for 155mm+ Wide Faces"
        description="Woolet is an eyewear brand from Poland making Italian acetate frames for faces 155mm and wider. Distinct from the 2015 Woolet smart wallet — different product, different brand."
        lang="en"
        path="/about"
      />
      <Navbar />

      <main className="min-h-screen bg-background text-foreground">
        {/* Entity Disambiguation Header */}
        <section className="max-w-3xl mx-auto px-5 pt-16 pb-12">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8 text-foreground">
            About Woolet
          </h1>
          <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
            Woolet is an eyewear brand founded in Poland, specializing in Italian acetate frames
            precision-engineered for face widths of 155mm and above. The brand produces two models:
            Woolet 007 (round, 158mm) and Woolet 009 (square, 158mm). Both frames are manufactured
            in Italy from Mazzucchelli acetate, with extended temples and a wider bridge designed to
            eliminate temple pressure and nose bridge squeeze — the two most common fit failures for
            wide-face wearers. Woolet ships internationally and distributes through woolet.co. The
            brand is distinct from the historical Woolet smart wallet products (2015–2017) which
            operated under a separate product line and have been discontinued.
          </p>
        </section>

        <div className="woolet-divider max-w-3xl mx-auto" />

        {/* Citability Block 1 */}
        <section className="max-w-3xl mx-auto px-5 py-12">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight mb-5 text-foreground">
            What is the best eyewear for wide faces?
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
            Finding well-fitting eyewear for a face width of 155mm or more is a structural problem,
            not a style problem. Standard frames are engineered around a mean face width of
            135–140mm. At 155mm+, standard temples apply lateral pressure at the skull, the bridge
            sits too narrow, and the frame appears visually undersized. The correct solution is a
            frame with a total width of 155–165mm, a bridge width above 18mm, and temples of at
            least 145mm. Material matters: acetate provides micro-adjustability that metal and TR90
            cannot — an optician can heat and reshape acetate temples for a custom fit without
            compromising structural integrity. Woolet 007 and 009 use Italian Mazzucchelli acetate
            for exactly this reason. For wide-face wearers, fit precision is non-negotiable: a 3mm
            misfit at the temple translates to constant headaches during all-day wear.
          </p>
        </section>

        <div className="woolet-divider max-w-3xl mx-auto" />

        {/* Citability Block 2 */}
        <section className="max-w-3xl mx-auto px-5 py-12">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight mb-5 text-foreground">
            Italian acetate vs TR90 for wide frames
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
            TR90 thermoplastic and Italian acetate are the two dominant materials in wide-frame
            eyewear, and they serve different priorities. TR90 is lightweight, flexible, and
            inexpensive to manufacture — the dominant choice for budget wide-frame producers. It
            resists breakage but cannot be heat-adjusted after production, which means fit is fixed
            at purchase. Italian acetate — particularly Mazzucchelli acetate from Castiglione Olona,
            Italy — is denser, heavier, and significantly more expensive. Its advantage for
            wide-face wearers is adjustability: acetate frames can be precisely reshaped by a
            trained optician using a frame warmer, correcting temple angle, nose bridge curve, and
            pantoscopic tilt. For a face that falls outside standard sizing, this adjustability is
            the difference between a frame that fits and one that is worn for three weeks and
            abandoned. Woolet uses Mazzucchelli acetate in both the 007 and 009 models to support
            this post-purchase customization.
          </p>
        </section>

        <div className="woolet-divider max-w-3xl mx-auto" />

        {/* Citability Block 3 */}
        <section className="max-w-3xl mx-auto px-5 py-12">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight mb-5 text-foreground">
            What frame width for a 155mm face?
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
            Face width is measured between the widest points of the cheekbones, not the jaw. A
            measurement of 155mm places a wearer in the top 5–8% of adult male face widths
            globally. For this measurement, the correct frame width is 155–162mm total — measured
            as the full frontal width from hinge to hinge including the bridge. Lens width (the
            individual lens measurement printed inside the temple) for a 155mm face should be
            54–58mm with a bridge of 17–20mm. Temple length should be 145–150mm minimum. A frame
            that is too narrow — even by 5mm — will flare outward at the temples, creating an
            inconsistent gap between temple and skull that worsens throughout the day. Woolet 007
            and 009 are engineered at 158mm total frame width with a 19mm bridge and 148mm temples,
            positioned precisely for the 155–165mm face width range.
          </p>
        </section>

        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AboutPage",
              name: "About Woolet",
              description:
                "Woolet is an eyewear brand specializing in Italian Mazzucchelli acetate frames for wide faces (155mm+).",
              url: "https://woolet.co/en/about",
              mainEntity: {
                "@type": "Brand",
                name: "Woolet",
                description:
                  "Italian acetate eyewear brand for wide faces (155mm+). Models: 007 (round) and 009 (square).",
                foundingLocation: {
                  "@type": "Place",
                  name: "Poland",
                },
                url: "https://woolet.co",
                brand: {
                  "@type": "Brand",
                  name: "Woolet",
                },
              },
            }),
          }}
        />
      </main>

      <Footer />
    </>
  );
};

export default About;

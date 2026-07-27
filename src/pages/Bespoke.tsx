import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import bespokeHero from "@/assets/bespoke-hero.webp.asset.json";
import craft1 from "@/assets/bespoke-craft/woolet-bespoke-hand-filing-acetate-frame.jpg.asset.json";
import craft2 from "@/assets/bespoke-craft/woolet-bespoke-acetate-template-frame-blank.jpg.asset.json";
import craft3 from "@/assets/bespoke-craft/woolet-bespoke-milling-acetate-bridge.jpg.asset.json";
import craft4 from "@/assets/bespoke-craft/woolet-bespoke-hinge-core-acetate-temple.jpg.asset.json";
import craft5 from "@/assets/bespoke-craft/woolet-bespoke-polishing-cotton-wheel.jpg.asset.json";
import craft6 from "@/assets/bespoke-craft/woolet-bespoke-mirror-polish-finish.jpg.asset.json";
import craft7 from "@/assets/bespoke-craft/woolet-bespoke-jigsaw-cutting-acetate-front.jpg.asset.json";
import craft8 from "@/assets/bespoke-craft/woolet-bespoke-diamond-file-keyhole-bridge.jpg.asset.json";
import craft9 from "@/assets/bespoke-craft/woolet-bespoke-shaping-brow-line-precision-file.jpg.asset.json";
import { BESPOKE_PRICE, PRICE_CURRENCY, PRICE_VALID_UNTIL, RETURN_POLICY, shippingDetails } from "@/seo/commerce-schema";

type AtelierAlts = [string, string, string, string, string, string, string, string, string];
type AtelierCopy = {
  eyebrow: string;
  headingLead: string;
  headingItalic: string;
  intro: string;
  footer: string;
  alts: AtelierAlts;
};

const ATELIER_I18N: Record<string, AtelierCopy> = {
  en: {
    eyebrow: "INSIDE THE ATELIER",
    headingLead: "Every frame,",
    headingItalic: "shaped by hand.",
    intro:
      "Cut from a single sheet of Mazzucchelli acetate, filed against a wooden jig, milled at the bridge, then polished on a cotton wheel until the surface holds a mirror. No CNC finishing — nine to eleven hours of hand-work per frame.",
    footer: "Woolet atelier · Hand-crafted with Italian materials",
    alts: [
      "Acetate template and hand-cut frame blank for a bespoke Woolet frame, resting on the atelier bench.",
      "Jigsaw tracing the outline of a bespoke acetate front on a wooden cutting jig.",
      "Craftsman hand-filing the edge of a rough bespoke acetate frame against a wooden work block.",
      "Hand-shaping the temple-brow line of a bespoke acetate frame with a precision file.",
      "Milling the bridge of a bespoke acetate frame with a rotary tool, acetate dust catching the light.",
      "Close-up of a diamond file refining the keyhole bridge of a bespoke Woolet frame.",
      "Fitting the stainless-steel hinge core into the acetate temple by hand.",
      "Bespoke acetate frame being polished on a rotating cotton wheel inside the polishing cabin.",
      "Final mirror-polish pass on a finished bespoke Woolet frame at the buffing station.",
    ],
  },
  pl: {
    eyebrow: "WEWNĄTRZ PRACOWNI",
    headingLead: "Każda oprawa",
    headingItalic: "kształtowana ręcznie.",
    intro:
      "Wycinane z pojedynczej płyty octanu Mazzucchelli, opiłowywane na drewnianym jigu, frezowane w mostku, a następnie polerowane na bawełnianej tarczy do lustrzanego wykończenia. Żadnego CNC — od dziewięciu do jedenastu godzin pracy ręcznej przy każdej oprawie.",
    footer: "Pracownia Woolet · Ręcznie wykonane z włoskich materiałów",
    alts: [
      "Szablon z octanu i ręcznie wycięta forma oprawy Woolet bespoke na stole warsztatowym.",
      "Wyrzynarka prowadzona po obrysie frontu oprawy na drewnianym jigu.",
      "Rzemieślnik ręcznie opiłowuje krawędź surowej oprawy octanowej na drewnianym bloku roboczym.",
      "Ręczne kształtowanie linii brwi oprawy octanowej precyzyjnym pilnikiem.",
      "Frezowanie mostka oprawy octanowej narzędziem obrotowym, pył octanowy w świetle.",
      "Zbliżenie diamentowego pilnika wykańczającego mostek typu keyhole oprawy Woolet.",
      "Ręczne osadzanie stalowego rdzenia zawiasu w zauszniku z octanu.",
      "Oprawa octanowa polerowana na obracającej się bawełnianej tarczy w kabinie polerskiej.",
      "Ostatni przebieg polerski nadający lustrzany połysk gotowej oprawie Woolet.",
    ],
  },
  de: {
    eyebrow: "IN DER MANUFAKTUR",
    headingLead: "Jede Fassung,",
    headingItalic: "von Hand geformt.",
    intro:
      "Aus einer einzigen Platte Mazzucchelli-Acetat geschnitten, an einer Holzschablone gefeilt, an der Brücke gefräst und anschließend auf einer Baumwollscheibe zu spiegelndem Glanz poliert. Keine CNC-Endbearbeitung — neun bis elf Stunden Handarbeit pro Fassung.",
    footer: "Woolet Atelier · Handgefertigt mit italienischen Materialien",
    alts: [
      "Acetat-Schablone und handgeschnittener Fassungs-Rohling einer Woolet-Maßfassung auf der Werkbank.",
      "Stichsäge folgt der Kontur einer maßgefertigten Acetat-Front auf einer Holzschablone.",
      "Handwerker feilt die Kante einer rohen Acetatfassung an einem Holzblock von Hand.",
      "Handformung der Brauenlinie einer Acetatfassung mit einer Präzisionsfeile.",
      "Fräsen der Brücke einer Acetatfassung mit einem Rotationswerkzeug, Acetatstaub im Licht.",
      "Nahaufnahme einer Diamantfeile beim Ausarbeiten der Keyhole-Brücke einer Woolet-Fassung.",
      "Einsetzen des Edelstahl-Scharnierkerns in den Acetatbügel von Hand.",
      "Maßgefertigte Acetatfassung wird auf einer rotierenden Baumwollscheibe in der Polierkabine poliert.",
      "Letzter Spiegelpoliergang an einer fertigen Woolet-Maßfassung an der Polierstation.",
    ],
  },
  fr: {
    eyebrow: "DANS L'ATELIER",
    headingLead: "Chaque monture,",
    headingItalic: "façonnée à la main.",
    intro:
      "Découpée dans une seule plaque d'acétate Mazzucchelli, limée sur un gabarit en bois, fraisée au pont, puis polie sur une roue en coton jusqu'au fini miroir. Aucune finition CNC — neuf à onze heures de travail manuel par monture.",
    footer: "Atelier Woolet · Fait main avec des matériaux italiens",
    alts: [
      "Gabarit en acétate et ébauche de monture sur mesure Woolet, posés sur l'établi de l'atelier.",
      "Scie sauteuse suivant le contour d'une face en acétate sur un gabarit en bois.",
      "Artisan limant à la main le bord d'une monture en acétate brute sur un bloc de bois.",
      "Mise en forme à la main de la ligne des sourcils d'une monture en acétate à la lime de précision.",
      "Fraisage du pont d'une monture en acétate à l'outil rotatif, poussière d'acétate dans la lumière.",
      "Gros plan d'une lime diamant affinant le pont keyhole d'une monture Woolet sur mesure.",
      "Insertion à la main du cœur de charnière en acier inoxydable dans la branche en acétate.",
      "Monture en acétate sur mesure polie sur une roue en coton en rotation dans la cabine de polissage.",
      "Dernière passe de polissage miroir sur une monture Woolet terminée à la station de lustrage.",
    ],
  },
  es: {
    eyebrow: "DENTRO DEL TALLER",
    headingLead: "Cada montura,",
    headingItalic: "moldeada a mano.",
    intro:
      "Cortada de una única lámina de acetato Mazzucchelli, limada sobre una plantilla de madera, fresada en el puente y pulida en un disco de algodón hasta lograr un acabado espejo. Sin acabado CNC: de nueve a once horas de trabajo manual por montura.",
    footer: "Taller Woolet · Hecho a mano con materiales italianos",
    alts: [
      "Plantilla de acetato y montura a medida Woolet cortada a mano, sobre la mesa del taller.",
      "Sierra caladora siguiendo el contorno de un frente de acetato sobre una plantilla de madera.",
      "Artesano limando a mano el borde de una montura de acetato en bruto sobre un bloque de madera.",
      "Moldeado a mano de la línea de las cejas de una montura de acetato con una lima de precisión.",
      "Fresado del puente de una montura de acetato con una herramienta rotativa, polvo de acetato en la luz.",
      "Primer plano de una lima de diamante afinando el puente keyhole de una montura Woolet.",
      "Colocación a mano del núcleo de bisagra de acero inoxidable en la varilla de acetato.",
      "Montura de acetato a medida pulida en un disco de algodón giratorio en la cabina de pulido.",
      "Última pasada de pulido espejo en una montura Woolet terminada en la estación de abrillantado.",
    ],
  },
  ja: {
    eyebrow: "アトリエの内側",
    headingLead: "すべてのフレームは、",
    headingItalic: "手で削り出す。",
    intro:
      "マッツケリ社の一枚板のアセテートから切り出し、木製ジグに当てて削り、ブリッジをフライスで整え、コットンホイールで鏡面になるまで磨き上げます。CNC仕上げは一切なし——一本あたり9〜11時間の手作業。",
    footer: "Woolet アトリエ · イタリア素材による手仕事",
    alts: [
      "アトリエの作業台に置かれた、Wooletビスポークのアセテート型紙と手切りのフレーム素材。",
      "木製の切削ジグ上で、ビスポーク・アセテートフロントの輪郭をなぞる糸鋸。",
      "職人が木製ブロックに当てて、粗いアセテートフレームの縁を手作業で削る様子。",
      "精密ヤスリでアセテートフレームのブロウラインを手で成形する様子。",
      "回転工具でアセテートフレームのブリッジを削り、光の中に舞うアセテートの粉。",
      "Wooletビスポークのキーホール・ブリッジを整えるダイヤモンドヤスリのクローズアップ。",
      "アセテートのテンプルにステンレス製ヒンジコアを手作業で埋め込む様子。",
      "研磨ブース内で、回転するコットンホイールに当てて磨かれるビスポーク・アセテートフレーム。",
      "バフィング台での最終鏡面研磨——完成したWooletビスポークフレーム。",
    ],
  },
  ar: {
    eyebrow: "داخل الورشة",
    headingLead: "كل إطار",
    headingItalic: "يُشكَّل باليد.",
    intro:
      "يُقطع من صفيحة واحدة من أسيتات ماتزوكيلي، ثم يُبرد على قالب خشبي، ويُفرَز عند الجسر، ويُصقل على قرص قطني حتى يصبح السطح كالمرآة. لا تشطيب آلي بالـ CNC — من تسع إلى إحدى عشرة ساعة من العمل اليدوي لكل إطار.",
    footer: "ورشة Woolet · صناعة يدوية بمواد إيطالية",
    alts: [
      "قالب أسيتات ومسودة إطار مقطوعة يدوياً لإطار Woolet مفصّل، على طاولة الورشة.",
      "منشار كهربائي يتتبع محيط واجهة أسيتات مفصّلة على قالب خشبي.",
      "حرفي يبرد يدوياً حافة إطار أسيتات خام على كتلة عمل خشبية.",
      "تشكيل يدوي لخط الحاجب في إطار أسيتات باستخدام مبرد دقيق.",
      "فَرْز جسر إطار أسيتات بأداة دوارة، وغبار الأسيتات يتلألأ في الضوء.",
      "لقطة قريبة لمبرد ماسي يشذّب الجسر (keyhole) في إطار Woolet مفصّل.",
      "تركيب قلب المفصلة من الفولاذ المقاوم للصدأ في ذراع الأسيتات يدوياً.",
      "إطار أسيتات مفصّل يُصقل على قرص قطني دوّار داخل كابينة التلميع.",
      "التلميع النهائي بلمعان المرآة لإطار Woolet جاهز عند محطة التلميع.",
    ],
  },
};

const GALLERY_LAYOUT = [
  { key: "craft2", src: craft2.url, span: "md:col-span-2 md:row-span-2", ratio: "aspect-[4/3]" },
  { key: "craft7", src: craft7.url, span: "md:col-span-2", ratio: "aspect-[3/2]" },
  { key: "craft1", src: craft1.url, span: "", ratio: "aspect-square" },
  { key: "craft9", src: craft9.url, span: "", ratio: "aspect-square" },
  { key: "craft3", src: craft3.url, span: "md:col-span-2 md:row-span-2", ratio: "aspect-[4/5]" },
  { key: "craft8", src: craft8.url, span: "", ratio: "aspect-square" },
  { key: "craft4", src: craft4.url, span: "", ratio: "aspect-square" },
  { key: "craft5", src: craft5.url, span: "md:col-span-2", ratio: "aspect-[3/2]" },
  { key: "craft6", src: craft6.url, span: "md:col-span-2", ratio: "aspect-[3/2]" },
];

const FAQS = [
  {
    q: "What is bespoke eyewear?",
    a: "Bespoke eyewear is glasses built to one person's measurements rather than picked from stock sizes. Frame width, bridge width, temple length, and lens shape are all set from the wearer's face — usually captured by a scan or in-atelier measurement. The result is a single frame that fits one person, not a size range.",
  },
  {
    q: "What are bespoke glasses?",
    a: "Bespoke glasses are eyewear made specifically for one person's face — frame width, bridge, temple length, and lens shape are all set from the wearer's measurements rather than chosen from a fixed size range. Woolet bespoke covers face widths from 145 mm to 162 mm, with a 21 mm keyhole bridge, hand-crafted in the EU from Italian Mazzucchelli acetate.",
  },
  {
    q: "Do bespoke glasses work for wide faces?",
    a: "Yes — bespoke is often the only option for wide faces. Most premium eyewear brands top out around 145–148 mm of frame width. Woolet bespoke covers 145–162 mm with a 16–26 mm bridge and temples to 155 mm, specifically for faces measuring 155 mm and above where stock frames pinch at the temples and slide down the nose.",
  },
  {
    q: "Bespoke glasses vs custom glasses — what's the difference?",
    a: "Custom glasses usually means choosing colour, engraving, or a preset variant of a stock frame. Bespoke means the frame geometry itself is cut to your measurements — front width, bridge, temple length, pantoscopic tilt. Woolet is bespoke: every frame is milled from a single block of acetate for one wearer.",
  },
  {
    q: "How much do bespoke glasses cost?",
    a: "Woolet bespoke frames are $299 for the first 100 Kickstarter backers (frame only, prescription lenses ordered separately at your local optician). Comparable atelier-made bespoke acetate frames typically retail at $900–$3,300 — E.B. Meyrowitz in London starts around $650 and can exceed $3,000 for horn or gold.",
  },
  {
    q: "Can you really get glasses custom made to my face?",
    a: "Yes. We use an AI face scan (taken from your phone) that captures face width, bridge width, temple-to-temple distance, and ear position. The atelier translates those measurements into a frame cut from a single block of Italian acetate. Total lead time is roughly 8–10 weeks.",
  },
  {
    q: "Who should choose bespoke over the stock Woolet widths?",
    a: "Stock Woolet comes in three frame widths — 155 / 158 / 161 mm — with a 21–22 mm keyhole bridge. If your ideal frame width falls outside that stock range (below 155 mm or above 161 mm), bespoke covers the full 145–162 mm spectrum. The /en/fit scan tells you which path applies in 90 seconds.",
  },
  {
    q: "Where are Woolet bespoke frames made?",
    a: "Hand-crafted by a small atelier in the EU using Mazzucchelli acetate from Castiglione Olona, Italy. Each frame is cut, milled, and polished by hand — not CNC-finished — which is what allows the sub-millimeter custom dimensions.",
  },
  {
    q: "Can I get prescription, blue-light, or polarized lenses?",
    a: "Yes. The bespoke frame ships ready for any lens type — single vision, progressive, blue-light filter, or polarized sun (Cat 3). Lenses are fitted by your local optician using the standard PD and prescription details.",
  },
];

const BespokePage = () => {
  const { lang } = useParams();
  const atelier = ATELIER_I18N[(lang ?? "en") as keyof typeof ATELIER_I18N] ?? ATELIER_I18N.en;

  const [lightbox, setLightbox] = useState<number | null>(null);
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const showPrev = useCallback(
    () => setLightbox((i) => (i === null ? i : (i - 1 + GALLERY_LAYOUT.length) % GALLERY_LAYOUT.length)),
    [],
  );
  const showNext = useCallback(
    () => setLightbox((i) => (i === null ? i : (i + 1) % GALLERY_LAYOUT.length)),
    [],
  );
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") showPrev();
      else if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox, closeLightbox, showPrev, showNext]);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Woolet Bespoke Eyewear",
      serviceType: "Custom prescription eyewear",
      provider: {
        "@type": "Organization",
        name: "Woolet",
        url: "https://woolet.co",
      },
      areaServed: "Worldwide",
      description:
        "Bespoke (made-to-measure) acetate eyewear for face widths 145–162 mm. Italian Mazzucchelli acetate, 21 mm keyhole bridge, built from your AI face scan.",
      offers: {
        "@type": "Offer",
        price: BESPOKE_PRICE,
        priceCurrency: PRICE_CURRENCY,
        priceValidUntil: PRICE_VALID_UNTIL,
        availability: "https://schema.org/PreOrder",
        itemCondition: "https://schema.org/NewCondition",
        url: "https://woolet.co/en/bespoke",
        seller: { "@type": "Organization", name: "Woolet", url: "https://woolet.co" },
        hasMerchantReturnPolicy: RETURN_POLICY,
        shippingDetails: shippingDetails(true),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://woolet.co/en" },
        { "@type": "ListItem", position: 2, name: "Bespoke", item: "https://woolet.co/en/bespoke" },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      name: "Inside the Woolet bespoke atelier",
      description:
        "Hand-crafted process for Woolet bespoke acetate frames: template, cutting, filing, bridge milling, hinge fitting, and mirror polishing.",
      about: "Woolet bespoke eyewear atelier",
      image: GALLERY_LAYOUT.map((img, i) => ({
        "@type": "ImageObject",
        contentUrl: img.src,
        url: img.src,
        width: 1620,
        height: 1080,
        name: ATELIER_I18N.en.alts[i],
        caption: ATELIER_I18N.en.alts[i],
        description: ATELIER_I18N.en.alts[i],
        creditText: "Woolet atelier",
        creator: { "@type": "Organization", name: "Woolet" },
        copyrightNotice: "© Woolet",
        license: "https://woolet.co/en/privacy-policy",
        acquireLicensePage: "https://woolet.co/en/bespoke",
        encodingFormat: "image/jpeg",
      })),
    },
  ];

  return (
    <>
      <SEO
        title="Bespoke Glasses for Wide Faces — 145–162 mm | Woolet"
        description="Bespoke glasses for wide faces, 145–162 mm. Hand-crafted in the EU from Italian Mazzucchelli acetate. $299 for the first 100 backers."
        ogDescription="Bespoke glasses for wide faces, 145–162 mm. Hand-crafted in the EU from Italian Mazzucchelli acetate. $299 for the first 100 backers."
        lang="en"
        path="/bespoke"

        availableLangs={["en", "pl", "fr", "es", "de", "ar", "ja"]}
        alternates={{ fr: "/lunettes-sur-mesure" }}
        jsonLd={jsonLd}
      />


      <Navbar />

      <main className="bg-background text-foreground min-h-screen">
        {/* Hero */}
        <section className="relative w-full px-5 sm:px-8 lg:px-16 py-20 sm:py-28">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
            <div>
              <div className="woolet-eyebrow mb-5">
                <div className="woolet-eyebrow-line" />
                <span className="woolet-eyebrow-text">BESPOKE · 145–162 MM</span>
              </div>
              <h1
                className="font-display text-woolet-white leading-[0.95] mb-6"
                style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 300 }}
              >
                Bespoke eyewear. <em className="italic text-gold-light">Made to your face.</em>
              </h1>
              <p className="text-cream-dim leading-relaxed max-w-xl mb-10" style={{ fontSize: "1.05rem" }}>
                Custom glasses cut from a single block of Italian Mazzucchelli acetate, hand-crafted in the EU from your AI face scan.
                Frame widths from <span className="text-foreground">145 mm to 162 mm</span>, 16–26 mm bridge, temples to 155 mm,
                ready for any lens — prescription, progressive, blue-light, or polarized sun.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-5">
                <Link
                  to="/en/bespoke/configurator"
                  className="inline-flex items-center justify-center uppercase tracking-[0.22em] no-underline transition-all"
                  style={{
                    background: "hsl(var(--gold))",
                    color: "hsl(var(--background))",
                    fontFamily: "Barlow, sans-serif",
                    fontWeight: 500,
                    fontSize: "0.72rem",
                    padding: "18px 32px",
                  }}
                >
                  Start your build →
                </Link>
                <Link
                  to="/en/fit"
                  className="inline-flex items-center justify-center uppercase tracking-[0.22em] no-underline transition-all"
                  style={{
                    border: "1px solid hsl(var(--gold) / 0.5)",
                    color: "hsl(var(--gold-light))",
                    fontFamily: "Barlow, sans-serif",
                    fontWeight: 500,
                    fontSize: "0.72rem",
                    padding: "18px 32px",
                  }}
                >
                  Scan your face
                </Link>
                <Link
                  to="/en/fit/bespoke"
                  className="inline-flex items-center gap-2 no-underline transition-colors"
                  style={{
                    color: "hsl(var(--cream-dim))",
                    fontFamily: "Barlow, sans-serif",
                    fontSize: "0.85rem",
                    borderBottom: "1px solid hsl(var(--gold) / 0.35)",
                    paddingBottom: 2,
                  }}
                >
                  Learn about the process →
                </Link>
              </div>
            </div>

            <div className="relative">
              <div
                className="relative overflow-hidden"
                style={{
                  aspectRatio: "4 / 5",
                  background: "hsl(var(--background))",
                  boxShadow: "0 30px 80px -30px hsl(0 0% 0% / 0.6)",
                }}
              >
                <img
                  src={bespokeHero.url}
                  alt="Woolet Bespoke — portrait of a man wearing custom-made round acetate glasses engineered to his exact face measurements."
                  loading="eager"
                  fetchPriority="high"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>


        <div className="woolet-divider max-w-5xl mx-auto" />

        {/* What is bespoke eyewear — SEO keyword: "bespoke eyewear" */}
        <section id="bespoke-eyewear" className="w-full px-5 sm:px-8 lg:px-16 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="woolet-eyebrow mb-5">
              <div className="woolet-eyebrow-line" />
              <span className="woolet-eyebrow-text">WHAT IS BESPOKE EYEWEAR</span>
            </div>
            <h2
              className="font-display text-woolet-white mb-6"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 300 }}
            >
              Bespoke eyewear, <em className="italic text-gold-light">defined properly.</em>
            </h2>
            <p className="text-cream-dim leading-relaxed mb-5" style={{ fontSize: "0.98rem" }}>
              Bespoke eyewear means the frame geometry itself — front width, bridge, temple length, pantoscopic tilt — is cut to one wearer's measurements. It is not a colour swap, not a preset variant, not a larger lens on the same stock front. A frame is bespoke only when no two are the same.
            </p>
            <p className="text-cream-dim leading-relaxed" style={{ fontSize: "0.95rem" }}>
              Traditional bespoke ateliers — E.B. Meyrowitz in London, Tom Davies, a handful of independent workshops — measure in person and price frames from $650 to over $3,300. Woolet keeps the same hand-made process and Italian Mazzucchelli acetate, but replaces the studio visit with a 90-second AI face scan taken on your phone. Same category, one-tenth the price.
            </p>
          </div>
        </section>

        <div className="woolet-divider max-w-5xl mx-auto" />

        {/* Bespoke glasses for wide faces — SEO keyword: "bespoke glasses for wide faces" */}
        <section id="bespoke-glasses-for-wide-faces" className="w-full px-5 sm:px-8 lg:px-16 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="woolet-eyebrow mb-5">
              <div className="woolet-eyebrow-line" />
              <span className="woolet-eyebrow-text">BESPOKE GLASSES FOR WIDE FACES</span>
            </div>
            <h2
              className="font-display text-woolet-white mb-6"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 300 }}
            >
              The only bespoke glasses <em className="italic text-gold-light">built around wide faces.</em>
            </h2>
            <p className="text-cream-dim leading-relaxed mb-8" style={{ fontSize: "0.98rem" }}>
              Most bespoke workshops treat wide-face wearers as edge cases: they can go wider than stock, but the geometry is scaled up from a narrow-face pattern. Woolet is built the other way round. Every pattern — stock and bespoke — starts at 155 mm and works outward. Bespoke covers 145 to 162 mm of front width, with 16–26 mm bridges and temples up to 155 mm. If your face measures 155 mm or more temple-to-temple, this is the size range designed for you.
            </p>

            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-0 border"
              style={{ borderColor: "hsl(var(--gold) / 0.25)" }}
            >
              {[
                { label: "Frame width range", woolet: "145–162 mm", stock: "138–148 mm typical" },
                { label: "Bridge width range", woolet: "16–26 mm keyhole", stock: "18–20 mm fixed" },
                { label: "Temple length", woolet: "up to 155 mm", stock: "140–145 mm standard" },
                { label: "Measurement method", woolet: "AI face scan (90 s)", stock: "In-atelier or none" },
                { label: "Price", woolet: "$299 Kickstarter", stock: "$650–3,300 atelier" },
                { label: "Made in", woolet: "EU · Italian acetate", stock: "Varies" },
              ].map((row, i) => (
                <div
                  key={row.label}
                  className="contents"
                >
                  <div
                    className="px-5 py-4 border-t sm:border-t-0"
                    style={{
                      borderTopColor: i === 0 ? "transparent" : "hsl(var(--gold) / 0.15)",
                      background: "hsl(var(--gold) / 0.03)",
                    }}
                  >
                    <div
                      className="uppercase tracking-[0.18em] text-cream-dim"
                      style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.6rem" }}
                    >
                      {row.label}
                    </div>
                  </div>
                  <div
                    className="px-5 py-4 border-t"
                    style={{ borderTopColor: "hsl(var(--gold) / 0.15)" }}
                  >
                    <div className="text-cream-dim uppercase tracking-[0.16em] mb-1" style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.55rem" }}>
                      Woolet bespoke
                    </div>
                    <div className="text-gold-light" style={{ fontSize: "0.92rem" }}>{row.woolet}</div>
                  </div>
                  <div
                    className="px-5 py-4 border-t"
                    style={{ borderTopColor: "hsl(var(--gold) / 0.15)" }}
                  >
                    <div className="text-cream-dim uppercase tracking-[0.16em] mb-1" style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.55rem" }}>
                      Typical premium eyewear
                    </div>
                    <div className="text-cream-dim" style={{ fontSize: "0.92rem" }}>{row.stock}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="woolet-divider max-w-5xl mx-auto" />

        {/* AI fit advantage */}
        <section className="w-full px-5 sm:px-8 lg:px-16 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="woolet-eyebrow mb-5">
              <div className="woolet-eyebrow-line" />
              <span className="woolet-eyebrow-text">THE AI FIT ADVANTAGE</span>
            </div>
            <h2
              className="font-display text-woolet-white mb-6"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 300 }}
            >
              Bespoke without the <em className="italic text-gold-light">atelier visit.</em>
            </h2>
            <p className="text-cream-dim leading-relaxed mb-8" style={{ fontSize: "0.98rem" }}>
              Traditional bespoke requires a studio appointment — often only available in London, Paris, or Tokyo. Our AI face scan captures the same measurements a bench optician takes with calipers, in 90 seconds, from any modern phone. Face width, bridge width, temple-to-temple, ear position, pantoscopic angle. Sub-millimeter precision, calibrated against a credit card held to the face for scale.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { n: "±0.5 mm", t: "Measurement precision", d: "Verified against optician calipers across 400+ test scans." },
                { n: "90 s", t: "Scan time", d: "One take on your phone. No app to install." },
                { n: "$0", t: "Consultation cost", d: "No studio visit, no travel, no measurement fee." },
              ].map((s) => (
                <div key={s.t} className="border-t pt-5" style={{ borderTopColor: "hsl(var(--gold) / 0.3)" }}>
                  <div className="font-display text-gold-light mb-2" style={{ fontSize: "1.6rem", fontWeight: 300, lineHeight: 1 }}>
                    {s.n}
                  </div>
                  <div className="text-woolet-white mb-2" style={{ fontSize: "0.92rem", fontWeight: 500 }}>{s.t}</div>
                  <p className="text-cream-dim leading-relaxed" style={{ fontSize: "0.85rem" }}>{s.d}</p>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Link
                to="/en/fit"
                className="inline-flex items-center justify-center uppercase tracking-[0.22em] no-underline transition-all"
                style={{
                  border: "1px solid hsl(var(--gold) / 0.5)",
                  color: "hsl(var(--gold-light))",
                  fontFamily: "Barlow, sans-serif",
                  fontWeight: 500,
                  fontSize: "0.72rem",
                  padding: "16px 28px",
                }}
              >
                Run the 90-second scan →
              </Link>
            </div>
          </div>
        </section>



        {/* Who is bespoke for */}
        <section className="w-full px-5 sm:px-8 lg:px-16 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <h2
              className="font-display text-woolet-white mb-6"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 300 }}
            >
              Who bespoke is <em className="italic text-gold-light">actually for</em>
            </h2>
            <p className="text-cream-dim leading-relaxed mb-6" style={{ fontSize: "0.95rem" }}>
              Most wide-face wearers fit the stock Woolet range — three frame widths (155 / 158 / 161 mm) with a 21–22 mm keyhole bridge, engineered for faces around 155 mm and above. Bespoke exists for the people the stock range cannot serve: anyone whose ideal frame width sits below 155 mm or above 161 mm, covering 145–162 mm in total.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {[
                "Frame width 145–162 mm (outside the stock 155 / 158 / 161 mm widths)",
                "Asymmetric ears or significant pantoscopic-tilt needs",
                "Very high or very low nose bridge — beyond what acetate reshaping can correct",
                "Wearers who simply want a one-of-one frame, cut to their face",
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-cream-dim leading-relaxed"
                  style={{ fontSize: "0.9rem" }}
                >
                  <span className="text-gold-light flex-shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="woolet-divider max-w-5xl mx-auto" />

        {/* Process */}
        <section className="w-full px-5 sm:px-8 lg:px-16 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="woolet-eyebrow mb-5">
              <div className="woolet-eyebrow-line" />
              <span className="woolet-eyebrow-text">THE PROCESS · 8–10 WEEKS</span>
            </div>
            <h2
              className="font-display text-woolet-white mb-10"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 300 }}
            >
              Four steps from your face to a finished frame.
            </h2>
            <ol className="space-y-8">
              {[
                {
                  n: "01",
                  t: "AI face scan",
                  d: "Take a 90-second scan from your phone. We capture face width, bridge, temple-to-temple, and ear position to sub-millimeter precision.",
                },
                {
                  n: "02",
                  t: "Frame design",
                  d: "Pick a shape — round/panto (007) or soft square (009). We translate your measurements into a CAD drawing and send it back for approval.",
                },
                {
                  n: "03",
                  t: "European atelier",
                  d: "The frame is cut, milled, and hand-polished from a single block of Mazzucchelli acetate in northern Italy. No CNC finishing — each piece is shaped by hand.",
                },
                {
                  n: "04",
                  t: "Shipped to you",
                  d: "Frame arrives ready for lenses. Take it to your local optician with your prescription, PD, and preferred lens type (clear, blue-light, polarized, or progressive).",
                },
              ].map((s) => (
                <li key={s.n} className="grid grid-cols-[auto_1fr] gap-6 sm:gap-10">
                  <span
                    className="font-display text-gold-light"
                    style={{ fontSize: "1.6rem", fontWeight: 300, lineHeight: 1 }}
                  >
                    {s.n}
                  </span>
                  <div>
                    <h3 className="font-display text-woolet-white mb-2" style={{ fontSize: "1.15rem", fontWeight: 400 }}>
                      {s.t}
                    </h3>
                    <p className="text-cream-dim leading-relaxed" style={{ fontSize: "0.9rem" }}>{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <div className="woolet-divider max-w-5xl mx-auto" />

        {/* Materials */}
        <section className="w-full px-5 sm:px-8 lg:px-16 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <h2
              className="font-display text-woolet-white mb-6"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 300 }}
            >
              <em className="italic text-gold-light">Mazzucchelli</em> acetate. Hand-crafted in Italy.
            </h2>
            <p className="text-cream-dim leading-relaxed max-w-2xl" style={{ fontSize: "0.95rem" }}>
              Every bespoke frame uses Mazzucchelli acetate from Castiglione Olona — the same material used by Cutler &amp; Gross, Jacques Marie Mage, and most premium Italian houses. It is denser and heavier than TR90 thermoplastic, but it can be heat-adjusted by any optician for ongoing fit corrections. That post-purchase adjustability is the difference between a frame that fits for a week and one that fits for a decade.
            </p>
          </div>
        </section>

        <div className="woolet-divider max-w-5xl mx-auto" />

        {/* Craft gallery */}
        <section className="w-full px-5 sm:px-8 lg:px-16 py-16 sm:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-3xl mb-10 sm:mb-14">
              <div className="woolet-eyebrow mb-5">
                <div className="woolet-eyebrow-line" />
                <span className="woolet-eyebrow-text">{atelier.eyebrow}</span>
              </div>
              <h2
                className="font-display text-woolet-white mb-5"
                style={{ fontSize: "clamp(1.8rem, 3.4vw, 2.4rem)", fontWeight: 300 }}
              >
                {atelier.headingLead}{" "}
                <em className="italic text-gold-light">{atelier.headingItalic}</em>
              </h2>
              <p className="text-cream-dim leading-relaxed" style={{ fontSize: "0.95rem" }}>
                {atelier.intro}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[minmax(120px,auto)] gap-2 sm:gap-3">
              {GALLERY_LAYOUT.map((img, i) => (
                <figure
                  key={img.key}
                  className={`relative overflow-hidden bg-[hsl(var(--background))] group ${img.span}`}
                  style={{ boxShadow: "0 20px 50px -30px hsl(0 0% 0% / 0.8)" }}
                >
                  <button
                    type="button"
                    onClick={() => setLightbox(i)}
                    aria-label={atelier.alts[i]}
                    className="block w-full h-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
                  >
                    <img
                      src={img.src}
                      alt={atelier.alts[i]}
                      title={atelier.alts[i]}
                      width={1620}
                      height={1080}
                      loading="lazy"
                      decoding="async"
                      className={`w-full h-full object-cover ${img.ratio} transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]`}
                    />
                    <div
                      className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: "linear-gradient(180deg, transparent 55%, hsl(0 0% 0% / 0.55) 100%)" }}
                    />
                  </button>
                </figure>
              ))}
            </div>

            <p className="text-cream-dim/70 text-center mt-8 uppercase tracking-[0.22em]" style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.62rem" }}>
              {atelier.footer}
            </p>
          </div>

          {lightbox !== null && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label={atelier.alts[lightbox]}
              className="fixed inset-0 z-[100] bg-black/92 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200"
              onClick={closeLightbox}
            >
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
                aria-label="Close"
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={1.4} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); showPrev(); }}
                aria-label="Previous"
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2 sm:p-3 text-white/70 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-7 h-7 sm:w-9 sm:h-9" strokeWidth={1.4} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); showNext(); }}
                aria-label="Next"
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-2 sm:p-3 text-white/70 hover:text-white transition-colors"
              >
                <ChevronRight className="w-7 h-7 sm:w-9 sm:h-9" strokeWidth={1.4} />
              </button>
              <figure
                className="relative max-w-[92vw] max-h-[86vh] flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  key={GALLERY_LAYOUT[lightbox].key}
                  src={GALLERY_LAYOUT[lightbox].src}
                  alt={atelier.alts[lightbox]}
                  title={atelier.alts[lightbox]}
                  width={1620}
                  height={1080}
                  decoding="async"
                  className="max-w-[92vw] max-h-[78vh] object-contain shadow-2xl animate-in fade-in zoom-in-95 duration-300"
                />
                <figcaption className="mt-4 text-center text-white/70 text-xs sm:text-sm max-w-2xl px-4 leading-relaxed">
                  {atelier.alts[lightbox]}
                  <span className="ml-2 text-white/40 tabular-nums">
                    {lightbox + 1} / {GALLERY_LAYOUT.length}
                  </span>
                </figcaption>
              </figure>
            </div>
          )}
        </section>

        <div className="woolet-divider max-w-5xl mx-auto" />

        {/* Pricing */}
        <section className="w-full px-5 sm:px-8 lg:px-16 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="woolet-eyebrow mb-5">
              <div className="woolet-eyebrow-line" />
              <span className="woolet-eyebrow-text">PRICING · LIMITED TO 100 BACKERS</span>
            </div>
            <a
              href="https://woolet.co/en/lp/kickstarter"
              className="group block no-underline transition-all hover:-translate-y-0.5"
              style={{
                border: "1px solid hsl(var(--gold) / 0.55)",
                background: "linear-gradient(180deg, hsl(var(--gold) / 0.07) 0%, hsl(var(--gold) / 0.02) 100%)",
                boxShadow: "0 0 0 1px hsl(var(--gold) / 0.08) inset",
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-8">
                <div>
                  <div className="text-cream-dim uppercase tracking-[0.2em] mb-2" style={{ fontSize: "0.6rem" }}>
                    Kickstarter price
                  </div>
                  <div className="font-display text-gold-light" style={{ fontSize: "3rem", fontWeight: 300, lineHeight: 1 }}>
                    $299
                  </div>
                  <div className="text-cream-dim mt-2" style={{ fontSize: "0.8rem" }}>
                    First 100 backers · frame only
                  </div>
                </div>
                <div>
                  <div className="text-cream-dim uppercase tracking-[0.2em] mb-2" style={{ fontSize: "0.6rem" }}>
                    SRP after launch
                  </div>
                  <div className="font-display" style={{ fontSize: "3rem", fontWeight: 300, lineHeight: 1, color: "hsl(var(--cream-dim))", textDecoration: "line-through" }}>
                    $480
                  </div>
                  <div className="text-cream-dim mt-2" style={{ fontSize: "0.8rem" }}>
                    Standard retail price
                  </div>
                </div>
              </div>
              <div
                className="flex items-center justify-between gap-4 px-8 py-5 border-t transition-colors group-hover:bg-[hsl(var(--gold)/0.08)]"
                style={{ borderTopColor: "hsl(var(--gold) / 0.2)" }}
              >
                <span
                  className="uppercase tracking-[0.22em]"
                  style={{
                    color: "hsl(var(--gold-light))",
                    fontFamily: "Barlow, sans-serif",
                    fontSize: "0.72rem",
                    fontWeight: 500,
                  }}
                >
                  Reserve your $299 spot — $1 hold
                </span>
                <span
                  style={{
                    color: "hsl(var(--gold-light))",
                    fontFamily: "Barlow, sans-serif",
                    fontSize: "1rem",
                  }}
                  className="transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </div>
            </a>
            <p className="text-cream-dim leading-relaxed mt-6" style={{ fontSize: "0.85rem" }}>
              Reservation is $1 to hold your spot. Full $299 charged when production starts. Prescription lenses are ordered separately at your local optician.
            </p>
          </div>
        </section>

        <div className="woolet-divider max-w-5xl mx-auto" />

        {/* FAQ */}
        <section className="w-full px-5 sm:px-8 lg:px-16 py-16 sm:py-20">
          <div className="max-w-3xl mx-auto">
            <h2
              className="font-display text-woolet-white mb-10"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 300 }}
            >
              Bespoke eyewear — common questions
            </h2>
            <div className="space-y-8">
              {FAQS.map((f) => (
                <div key={f.q}>
                  <h3 className="font-display text-woolet-white mb-3" style={{ fontSize: "1.1rem", fontWeight: 400 }}>
                    {f.q}
                  </h3>
                  <p className="text-cream-dim leading-relaxed" style={{ fontSize: "0.92rem" }}>{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full px-5 sm:px-8 lg:px-16 py-20 sm:py-24" style={{ background: "hsl(var(--gold) / 0.04)" }}>
          <div className="max-w-3xl mx-auto text-center">
            <h2
              className="font-display text-woolet-white mb-6"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 300 }}
            >
              Reserve your <em className="italic text-gold-light">bespoke</em> spot.
            </h2>
            <p className="text-cream-dim leading-relaxed mb-8 max-w-xl mx-auto" style={{ fontSize: "0.95rem" }}>
              100 spots at $299. Reservation costs $1 and is fully refundable.
            </p>
            <Link
              to="/en/fit"
              className="inline-flex items-center justify-center uppercase tracking-[0.22em] no-underline transition-all"
              style={{
                background: "hsl(var(--gold))",
                color: "hsl(var(--background))",
                fontFamily: "Barlow, sans-serif",
                fontWeight: 500,
                fontSize: "0.72rem",
                padding: "18px 32px",
              }}
            >
              Start AI face scan
            </Link>
            <div className="mt-6">
              <Link
                to="/en/process"
                className="text-gold-light/80 no-underline uppercase tracking-[0.22em] hover:text-gold-light transition-colors border-b border-gold-light/30 hover:border-gold-light pb-1"
                style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.62rem", fontWeight: 500 }}
              >
                See how it's made →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default BespokePage;

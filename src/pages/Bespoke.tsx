import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { isValidLang, type Lang } from "@/lib/i18n";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import bespokeHero from "@/assets/hero-man.jpg";
import craft1 from "@/assets/bespoke-craft/woolet-bespoke-hand-filing-acetate-frame.jpg.asset.json";
import craft2 from "@/assets/bespoke-craft/woolet-bespoke-acetate-template-frame-blank.jpg.asset.json";
import craft3 from "@/assets/bespoke-craft/woolet-bespoke-milling-acetate-bridge.jpg.asset.json";
import craft4 from "@/assets/bespoke-craft/woolet-bespoke-hinge-core-acetate-temple.jpg.asset.json";
import craft5 from "@/assets/bespoke-craft/woolet-bespoke-polishing-cotton-wheel.jpg.asset.json";
import craft6 from "@/assets/bespoke-craft/woolet-bespoke-mirror-polish-finish.jpg.asset.json";
import craft7 from "@/assets/bespoke-craft/woolet-bespoke-jigsaw-cutting-acetate-front.jpg.asset.json";
import craft8 from "@/assets/bespoke-craft/woolet-bespoke-diamond-file-keyhole-bridge.jpg.asset.json";
import craft9 from "@/assets/bespoke-craft/woolet-bespoke-shaping-brow-line-precision-file.jpg.asset.json";
import { BESPOKE_FACTS, BESPOKE_FAQS, BESPOKE_GUIDE, BESPOKE_META_DESCRIPTION, bespokeFaqJsonLd, bespokeProductJsonLd } from "@/content/bespokeFacts";
import { trackMetaEventOnce } from "@/lib/meta-capi";

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

const FAQS = BESPOKE_FAQS;

const BespokePage = () => {
  const { lang: paramLang } = useParams();
  const lang: Lang = paramLang && isValidLang(paramLang) ? paramLang : "en";
  const atelier = ATELIER_I18N[(lang ?? "en") as keyof typeof ATELIER_I18N] ?? ATELIER_I18N.en;

  const heroCtaRef = useRef<HTMLDivElement>(null);
  const [showStickyCta, setShowStickyCta] = useState(false);
  useEffect(() => {
    const el = heroCtaRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setShowStickyCta(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Meta upper funnel — browser pixel + CAPI on one event_id, once per session.
  useEffect(() => {
    trackMetaEventOnce("ViewContent", "viewcontent:bespoke-landing", {
      custom: {
        content_type: "product",
        content_ids: ["bespoke"],
        content_name: "Woolet Bespoke",
        value: 480,
        currency: "USD",
      },
    });
  }, []);

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
    bespokeProductJsonLd(),
    bespokeFaqJsonLd(),
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
        title={lang === "de" ? "Maßanfertigung für breite Gesichter 145-172 mm | Woolet" : "Woolet Bespoke - Made-to-Measure Glasses"}
        description={lang === "de" ? "Brillen nach Maß für breite Gesichter von 145-172 mm. Italienisches Mazzucchelli-Acetat, handgefertigt in Griechenland (EU)." : BESPOKE_META_DESCRIPTION}
        ogDescription={lang === "de" ? "Brillen nach Maß für breite Gesichter von 145-172 mm. Italienisches Mazzucchelli-Acetat, handgefertigt in Griechenland (EU)." : BESPOKE_META_DESCRIPTION}
        lang={lang}
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
                 <span className="woolet-eyebrow-text">BESPOKE · {BESPOKE_FACTS.frontWidth.toUpperCase()}</span>
              </div>
              <h1
                className="font-display text-woolet-white leading-[0.95] mb-6"
                style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 300 }}
              >
                 {BESPOKE_FACTS.h1}
              </h1>
              <p className="text-cream-dim leading-relaxed max-w-xl" style={{ fontSize: "1.05rem" }}>
                 Woolet Bespoke is made-to-measure eyewear in any front width within {BESPOKE_FACTS.frontWidth}, with a {BESPOKE_FACTS.bridge} bridge and {BESPOKE_FACTS.temples} temples, made from {BESPOKE_FACTS.material} and hand made in Greece (EU) for $480 USD including standard prescription lenses and free worldwide shipping; specialty lens upgrades cost extra.
              </p>
              <p className="text-cream-dim leading-relaxed max-w-xl mb-10" style={{ fontSize: "0.85rem" }}>
                Photochromic lenses, often called transition lenses, darken outdoors and clear inside — see{" "}
                <Link to="/en/blog/glasses-that-turn-into-sunglasses-wide-face" className="text-gold-light underline underline-offset-4">
                  how photochromic glasses work on a wide face
                </Link>.
              </p>

              <div ref={heroCtaRef} className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-5">
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
                   Build your frame →
                </Link>
                <Link to="/en/fit" className="text-gold-light underline underline-offset-4 text-sm">
                  Not sure of your width? Take the fit scan
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
                {/* Clarity: people tap the hero image — make it a way in. */}
                  <Link to="/en/bespoke/configurator" aria-label="Build your bespoke frame" className="block w-full h-full">
                  <img
                    src={bespokeHero}
                    alt="Woolet frame worn on a face, showing the fit across the front and temples"
                    loading="eager"
                    fetchPriority="high"
                    className="w-full h-full object-cover"
                  />
                  </Link>
              </div>
            </div>
          </div>
        </section>


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

        <section className="w-full px-5 sm:px-8 lg:px-16 py-16 sm:py-20" aria-labelledby="bespoke-specifications">
          <div className="max-w-4xl mx-auto">
            <h2 id="bespoke-specifications" className="font-display text-woolet-white mb-5 text-3xl">Specifications at a glance</h2>
            <p className="text-cream-dim leading-relaxed mb-6">Woolet Bespoke is measured for each wearer, not selected from a fixed-width inventory. The four configurator shapes are Aviator, Rectangle, Crown Panto and Round. The standard Woolet 007 and 009 signature frames are different designs with a fixed 158 mm front.</p>
            <div className="overflow-x-auto border" style={{ borderColor: "hsl(var(--gold) / 0.25)" }}>
              <table className="w-full text-left text-sm text-cream-dim" style={{ minWidth: 420 }}>
                <thead><tr className="text-gold-light"><th className="p-4">Specification</th><th className="p-4">Woolet Bespoke</th></tr></thead>
                <tbody>{[
                  ["Front width", BESPOKE_FACTS.frontWidth], ["Bridge", BESPOKE_FACTS.bridge], ["Temples", BESPOKE_FACTS.temples],
                  ["Shapes", BESPOKE_FACTS.shapes.join(", ")], ["Regular price", BESPOKE_FACTS.regularPriceLabel],
                  ["Lenses", BESPOKE_FACTS.lenses], ["Shipping", BESPOKE_FACTS.shipping],
                  ["Material", BESPOKE_FACTS.material], ["Origin", BESPOKE_FACTS.origin],
                  ["Production", BESPOKE_FACTS.leadTime], ["Warranty", BESPOKE_FACTS.warranty],
                ].map(([label, value]) => <tr key={label} className="border-t" style={{ borderColor: "hsl(var(--gold) / 0.2)" }}><th scope="row" className="p-4 font-medium text-woolet-white">{label}</th><td className="p-4">{value}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </section>

        <div className="woolet-divider max-w-5xl mx-auto" />

        <section className="w-full px-5 sm:px-8 lg:px-16 py-16 sm:py-20" aria-label="Woolet Bespoke guide">
          <div className="max-w-4xl mx-auto space-y-9">
            {BESPOKE_GUIDE.map(({ heading, text }) => (
              <div key={heading}>
                <h2 className="font-display text-woolet-white text-3xl mb-4">{heading}</h2>
                <p className="text-cream-dim leading-relaxed">{text}</p>
              </div>
            ))}
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
              Woolet Bespoke is a made-to-measure frame, not a stock size or colour swap. Front widths run from 145-172 mm, bridges from 20-24 mm and temples from 145-155 mm. The finished frame is made for one wearer.
            </p>
            <p className="text-cream-dim leading-relaxed" style={{ fontSize: "0.95rem" }}>
              The regular price is $480 USD with standard prescription lenses and free worldwide shipping. Specialty lens upgrades cost extra in the configurator. The $299 price was a <Link to={BESPOKE_FACTS.kickstarterPath} className="text-gold-light underline">Kickstarter-only backer price</Link>, not a shop offer. Your phone-camera scan starts the remote measurement process; you approve the 3D model before production.
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
              Stock 007 and 009 both use a 158 mm front for faces around 155-161 mm. Bespoke instead covers any front width from 145-172 mm, whether narrower, wider or inside the stock band.
            </p>

            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-0 border"
              style={{ borderColor: "hsl(var(--gold) / 0.25)" }}
            >
              {[
                { label: "Frame width", woolet: BESPOKE_FACTS.frontWidth, stock: "158 mm (007 and 009)" },
                { label: "Bridge width", woolet: BESPOKE_FACTS.bridge, stock: "21 mm (007), 22 mm (009)" },
                { label: "Temple length", woolet: BESPOKE_FACTS.temples, stock: "150 mm (007 and 009)" },
                { label: "Measurement method", woolet: "Phone-camera scan and model approval", stock: "Fixed dimensions" },
                { label: "Regular price", woolet: "$480 USD, standard prescription lenses and worldwide shipping included; specialty upgrades cost extra", stock: "See stock product pages" },
                { label: "Made in", woolet: "Greece (EU), Italian acetate", stock: "EU" },
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
                      Standard Woolet 007 and 009
                    </div>
                    <div className="text-cream-dim" style={{ fontSize: "0.92rem" }}>{row.stock}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
              <Link
                to="/en/bespoke/configurator"
                className="inline-flex items-center justify-center uppercase tracking-[0.22em] no-underline transition-all"
                style={{
                  background: "hsl(var(--gold))",
                  color: "hsl(var(--background))",
                  fontFamily: "Barlow, sans-serif",
                  fontWeight: 500,
                  fontSize: "0.72rem",
                  padding: "16px 28px",
                }}
              >
                Build yours · {BESPOKE_FACTS.frontWidth} →
              </Link>
              <Link to="/en/fit" className="text-gold-light underline underline-offset-4 text-sm">
                Not sure of your width? Take the fit scan
              </Link>
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
              A phone-camera scan starts the remote measurement process. We review the dimensions with you before cutting the frame, and you approve the made-to-measure 3D model before production.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { n: "145-172 mm", t: "Front width", d: "A continuous made-to-measure range." },
                { n: "4", t: "Shapes", d: "Aviator, Rectangle, Crown Panto and Round." },
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
              Woolet 007 and 009 have one stock front width: 158 mm, fitting faces around 155-161 mm. Bespoke covers 145-172 mm, including narrower faces and customers seeking a one-of-one frame.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {[
                "Frame width 145-172 mm (outside the stock 158 mm front)",
                "Asymmetric ears or significant pantoscopic-tilt needs",
                "Bridge width 20-24 mm, measured for the wearer's nose",
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
              <span className="woolet-eyebrow-text">THE SIX-STEP PROCESS</span>
            </div>
            <h2
              className="font-display text-woolet-white mb-10"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 300 }}
            >
              Six steps from your scan to a finished frame.
            </h2>
            <ol className="space-y-8">
              {BESPOKE_FACTS.process.map((step, i) => (
                <li key={step} className="grid grid-cols-[auto_1fr] gap-6 sm:gap-10">
                  <span className="font-display text-gold-light" style={{ fontSize: "1.6rem", fontWeight: 300, lineHeight: 1 }}>{String(i + 1).padStart(2, "0")}</span>
                  <div><h3 className="font-display text-woolet-white mb-2" style={{ fontSize: "1.15rem", fontWeight: 400 }}>{step}</h3>
                  {i === 4 && <p className="text-cream-dim leading-relaxed" style={{ fontSize: "0.9rem" }}>Production takes 2 weeks after 3D model approval, then shipping begins.</p>}</div>
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
              <em className="italic text-gold-light">Mazzucchelli 1849</em> acetate. Hand made in Greece (EU).
            </h2>
            <p className="text-cream-dim leading-relaxed max-w-2xl" style={{ fontSize: "0.95rem" }}>
               The frame is hand made in Greece (EU) from Italian Mazzucchelli 1849 cellulose acetate. The regular $480 USD price includes standard prescription lenses and free worldwide shipping; specialty upgrades cost extra. First Bespoke pairs have shipped to customers abroad, including Vietnam. Each frame carries a 10-year warranty.
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

      </main>

      {/* Mobile: 47% of page views ended with no click — keep the way in on screen once the hero CTA scrolls away. */}
      {showStickyCta && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 bg-background/95 backdrop-blur-xl border-t" style={{ borderTopColor: "hsl(var(--gold) / 0.2)" }}>
          <Link
            to="/en/bespoke/configurator"
            className="flex w-full items-center justify-center uppercase tracking-[0.22em] no-underline"
            style={{
              background: "hsl(var(--gold))",
              color: "hsl(var(--background))",
              fontFamily: "Barlow, sans-serif",
              fontWeight: 500,
              fontSize: "0.72rem",
              padding: "16px 24px",
            }}
          >
            Build your frame →
          </Link>
        </div>
      )}
      <Footer />
    </>
  );
};

export default BespokePage;

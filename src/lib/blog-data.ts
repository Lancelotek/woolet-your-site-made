import type { Lang } from "./i18n";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: number;
  tags: string[];
}

const blogPostsEN: BlogPost[] = [
  {
    slug: "glasses-for-wide-faces-guide",
    title: "The Complete Guide to Glasses for Wide Faces",
    excerpt: "Finding glasses that fit a wide face can be frustrating. Here's everything you need to know about frame widths, temple lengths, and bridge sizes to get the perfect fit.",
    date: "2026-03-10",
    readTime: 8,
    tags: ["Guide", "Wide Face", "Fit"],
    content: `
<p>If you've ever walked into an optical store and left empty-handed because nothing fit, you're not alone. <strong>Millions of men</strong> have face widths above 145mm — and the standard eyewear industry largely ignores them.</p>

<h2>What Makes a Face "Wide"?</h2>
<p>A wide face typically measures <strong>145mm or more</strong> across the temples. For context, most standard frames are designed for faces between 130–142mm. That leaves a significant gap for anyone above that range.</p>
<p>At Woolet, we engineer frames starting at <strong>155mm</strong> — because "wide" shouldn't mean "out of options."</p>

<h2>Key Measurements to Look For</h2>
<p>When shopping for wide-face glasses, pay attention to three critical numbers:</p>
<ul>
<li><strong>Frame width:</strong> The total width across the front. Look for 148mm+ for a comfortable fit.</li>
<li><strong>Temple length:</strong> Standard temples are 140mm. If frames feel tight behind your ears, you need 145–155mm.</li>
<li><strong>Bridge width:</strong> A wider bridge (20mm+) prevents the nose pads from digging in.</li>
</ul>

<h2>Common Mistakes</h2>
<p>The biggest mistake is settling for frames that "almost fit." Frames that are too narrow cause pressure headaches, leave red marks on your temples, and look disproportionately small on your face.</p>

<h2>Why Woolet Is Different</h2>
<p>Woolet 007 and 009 are engineered from the ground up for wide faces. Italian acetate. Extended 150mm temples. A 22mm bridge. No compromises — just frames that actually fit.</p>
`,
  },
  {
    slug: "how-to-measure-face-width-for-glasses",
    title: "How to Measure Your Face Width for Glasses",
    excerpt: "A simple step-by-step guide to measuring your face width at home. All you need is a ruler or measuring tape — takes under 2 minutes.",
    date: "2026-03-08",
    readTime: 4,
    tags: ["How-to", "Measurement", "Fit"],
    content: `
<p>Getting the right frame size starts with knowing your face width. Here's a quick, accurate method you can do at home.</p>

<h2>What You'll Need</h2>
<ul>
<li>A flexible measuring tape or a ruler</li>
<li>A mirror</li>
</ul>

<h2>Step-by-Step</h2>
<ol>
<li><strong>Stand in front of a mirror</strong> and look straight ahead.</li>
<li><strong>Place the tape</strong> at the widest point of your face — typically from temple to temple, just above your ears.</li>
<li><strong>Read the measurement.</strong> This is your face width in millimetres.</li>
</ol>

<h2>What Your Measurement Means</h2>
<ul>
<li><strong>Under 135mm:</strong> Standard/narrow frames</li>
<li><strong>135–145mm:</strong> Standard/medium frames</li>
<li><strong>145–155mm:</strong> Wide frames</li>
<li><strong>155mm+:</strong> Extra-wide frames (like Woolet)</li>
</ul>

<h2>Pro Tip</h2>
<p>If you already own a pair of glasses that fit reasonably well, measure the total frame width (hinge to hinge). That gives you a reliable baseline for comparison.</p>
`,
  },
  {
    slug: "what-is-italian-acetate-premium-eyewear",
    title: "What Is Italian Acetate? The Material Behind Premium Eyewear",
    excerpt: "Italian acetate is the gold standard in luxury eyewear. Learn what makes it superior to regular plastic frames and why Woolet uses it exclusively.",
    date: "2026-03-05",
    readTime: 6,
    tags: ["Materials", "Craftsmanship", "Premium"],
    content: `
<p>When you hear "Italian acetate," you're hearing about the material that defines luxury eyewear. But what actually makes it so special?</p>

<h2>Acetate vs. Plastic</h2>
<p>Standard plastic frames (injection-moulded polycarbonate) are cheap, lightweight, and look it. Acetate is a <strong>plant-based material</strong> derived from cotton fibres and wood pulp. It's cut from solid blocks, hand-polished, and finished with a depth and richness that plastic can't replicate.</p>

<h2>Why "Italian"?</h2>
<p>Italy — specifically the Cadore region near Belluno — has been the epicentre of acetate production for decades. Manufacturers like <strong>Mazzucchelli</strong> produce sheets with unmatched colour depth, pattern complexity, and structural integrity.</p>

<h2>Benefits of Italian Acetate</h2>
<ul>
<li><strong>Hypoallergenic:</strong> Gentle on skin, no nickel or harsh chemicals.</li>
<li><strong>Adjustable:</strong> Can be heated and shaped for a custom fit.</li>
<li><strong>Durable:</strong> Resists warping and holds its shape over years.</li>
<li><strong>Beautiful:</strong> Rich colour layers that reveal depth when light hits them.</li>
</ul>

<h2>Woolet's Commitment</h2>
<p>Every Woolet frame is crafted from premium Italian acetate — hand-finished, never injection-moulded. Because if you're going to make glasses for wide faces, they should be uncompromisingly beautiful too.</p>
`,
  },
  {
    slug: "why-glasses-dont-fit-155mm-problem",
    title: "Why Most Glasses Don't Fit: The 155mm Problem",
    excerpt: "The eyewear industry designs for an average face. If yours is above 155mm, you've been systematically excluded. Here's why — and what's changing.",
    date: "2026-03-01",
    readTime: 5,
    tags: ["Industry", "Wide Face", "Problem"],
    content: `
<p>Walk into any eyewear store and you'll find hundreds of frames — almost none of which fit a face wider than 150mm. This isn't an accident. It's a systemic design choice.</p>

<h2>The Industry Standard</h2>
<p>Most major eyewear brands design frames for face widths between <strong>128–142mm</strong>. That covers approximately 70% of men. But it leaves out <strong>roughly 30%</strong> — millions of men who either squeeze into too-small frames or give up entirely.</p>

<h2>Why Brands Ignore Wide Faces</h2>
<p>It comes down to economics. Wider frames require:</p>
<ul>
<li>Different hinge mechanics</li>
<li>Longer temples</li>
<li>Wider lenses (more expensive to produce)</li>
<li>Separate manufacturing runs</li>
</ul>
<p>For mass-market brands optimising for volume, it's cheaper to sell one-size-fits-most.</p>

<h2>The Cost of Poor Fit</h2>
<p>Wearing frames that are too narrow causes more than discomfort. Pressure headaches. Red marks on temples. Frames that bow outward and break at the hinges. And — arguably worst — looking like you're wearing glasses two sizes too small.</p>

<h2>The Woolet Solution</h2>
<p>We started Woolet because we lived this problem. Our frames begin at 155mm and use reinforced 5-barrel hinges, extended 150mm temples, and a 22mm bridge. Not adapted. Not stretched. Engineered from zero.</p>
`,
  },
  {
    slug: "round-vs-square-glasses-wide-face",
    title: "Round vs. Square Glasses for Wide Faces: Which Style Suits You?",
    excerpt: "Choosing between round and square frames when you have a wide face? Here's how face shape interacts with frame geometry — and how to pick your best look.",
    date: "2026-02-25",
    readTime: 5,
    tags: ["Style", "Face Shape", "Guide"],
    content: `
<p>Frame shape matters — especially when you have a wide face. The right geometry can sharpen your look; the wrong one can make your face appear even wider.</p>

<h2>Understanding Face Shapes</h2>
<p>Wide faces come in different shapes:</p>
<ul>
<li><strong>Round-wide:</strong> Full cheeks, soft jawline, minimal angles.</li>
<li><strong>Square-wide:</strong> Strong jaw, angular features, prominent brow.</li>
<li><strong>Oval-wide:</strong> Balanced proportions, slightly longer than wide.</li>
</ul>

<h2>Round Frames on Wide Faces</h2>
<p>Round frames work best on <strong>square or angular</strong> wide faces. They soften harsh lines and add balance. However, on a round-wide face, circular frames can amplify roundness — making your face look wider.</p>

<h2>Square & Rectangular Frames</h2>
<p>Angular frames add structure and definition. They're ideal for <strong>round-wide</strong> faces because they introduce contrast. On square faces, they reinforce existing geometry — which can work if you want a strong, assertive look.</p>

<h2>The Woolet Approach</h2>
<p>The Woolet 007 features a refined rectangular silhouette — universally flattering on wide faces. The Woolet 009 has softer, rounded corners for those who want a touch of warmth without going full circle.</p>
`,
  },
  {
    slug: "wide-frame-glasses-professionals",
    title: "Wide-Frame Glasses for Professionals: Looking Sharp in the Office",
    excerpt: "Professional eyewear for wide faces doesn't have to mean boring. Here's how to find frames that are office-appropriate, well-fitting, and stylish.",
    date: "2026-02-20",
    readTime: 5,
    tags: ["Professional", "Style", "Office"],
    content: `
<p>In a professional setting, your glasses are part of your first impression. But when standard frames don't fit, you're left choosing between comfort and looking polished.</p>

<h2>The Professional Eyewear Dilemma</h2>
<p>Most "professional" frames — think black rectangles, metal half-rims — are designed for average face widths. If you have a wide face, these frames pinch, bow outward at the temples, and look undersized.</p>

<h2>What to Look For</h2>
<ul>
<li><strong>Understated colours:</strong> Black, tortoiseshell, dark navy, or charcoal.</li>
<li><strong>Clean lines:</strong> Rectangular or soft-square shapes read as professional.</li>
<li><strong>Proper fit:</strong> Frames should sit flush with your temples — no gaps, no pinching.</li>
<li><strong>Quality materials:</strong> Acetate or titanium signal intentionality. Cheap plastic doesn't.</li>
</ul>

<h2>Why Fit Matters More Than Style</h2>
<p>A perfectly fitting simple frame will always look more professional than an expensive designer pair that's too small. Fit communicates attention to detail — exactly what you want in a work environment.</p>

<h2>Woolet for the Office</h2>
<p>The Woolet 007 in Matte Black is our most popular professional choice. Clean rectangular silhouette. Italian acetate. 155mm+ width. Designed to make a quiet, confident statement.</p>
`,
  },
  {
    slug: "best-glasses-for-big-heads-2026",
    title: "Best Glasses for Big Heads in 2026: Our Top Picks",
    excerpt: "A curated roundup of the best glasses for large heads in 2026. We compare fit, style, materials, and value — with honest reviews.",
    date: "2026-02-15",
    readTime: 7,
    tags: ["Roundup", "2026", "Best Of"],
    content: `
<p>Finding stylish glasses when you have a big head shouldn't require a quest. Here's our honest look at the best options available in 2026.</p>

<h2>What "Big Head" Actually Means</h2>
<p>In eyewear terms, a "big head" typically refers to a face width of <strong>145mm or more</strong>. You might also need longer temples (145mm+) and a wider bridge (19mm+).</p>

<h2>Our Criteria</h2>
<p>We evaluated frames on four factors:</p>
<ol>
<li><strong>Actual width:</strong> Does it genuinely fit 150mm+ faces?</li>
<li><strong>Materials:</strong> Quality acetate, titanium, or premium composites.</li>
<li><strong>Style:</strong> Does it look intentional — not just a scaled-up version of a standard frame?</li>
<li><strong>Value:</strong> Price relative to build quality and materials.</li>
</ol>

<h2>Top Picks for 2026</h2>

<h3>1. Woolet 007 — Best Overall</h3>
<p>155mm+ frame width. Italian acetate. Extended 150mm temples. 22mm bridge. Designed specifically for wide faces — not adapted from a smaller frame. Starting at $189.</p>

<h3>2. Woolet 009 — Best for Soft Features</h3>
<p>Same wide-face engineering as the 007 but with a softer, rounded silhouette. Ideal for oval and round face shapes. Italian acetate. Same 155mm+ build.</p>

<h2>The Bottom Line</h2>
<p>Most "big head" glasses are afterthoughts — existing designs scaled up with no regard for proportion. Look for brands that engineer from scratch for wide faces. Your head isn't an edge case; it's just been treated like one.</p>
`,
  },
];

const blogPostsPL: BlogPost[] = [
  {
    slug: "okulary-na-szeroka-twarz-przewodnik",
    title: "Kompletny przewodnik po okularach na szeroką twarz",
    excerpt: "Szukanie okularów na szeroką twarz bywa frustrujące. Oto wszystko, co musisz wiedzieć o szerokości oprawek, długości zauszników i rozmiarze mostka.",
    date: "2026-03-10",
    readTime: 8,
    tags: ["Przewodnik", "Szeroka twarz", "Dopasowanie"],
    content: `
<p>Jeśli kiedykolwiek wszedłeś do salonu optycznego i wyszedłeś z pustymi rękami, bo nic nie pasowało — nie jesteś sam. <strong>Miliony mężczyzn</strong> mają twarz szerszą niż 145mm, a standardowa branża okularowa w dużej mierze ich ignoruje.</p>

<h2>Co oznacza "szeroka twarz"?</h2>
<p>Szeroka twarz to zazwyczaj <strong>145mm lub więcej</strong> mierzone w skroniach. Dla porównania, większość standardowych oprawek projektowana jest na twarze 130–142mm.</p>
<p>W Woolet projektujemy oprawki od <strong>155mm</strong> — bo "szeroka" nie powinna oznaczać "bez opcji."</p>

<h2>Kluczowe wymiary</h2>
<ul>
<li><strong>Szerokość oprawki:</strong> Całkowita szerokość frontu. Szukaj 148mm+ dla komfortowego dopasowania.</li>
<li><strong>Długość zausznika:</strong> Standard to 140mm. Jeśli oprawki ściskają za uszami, potrzebujesz 145–155mm.</li>
<li><strong>Szerokość mostka:</strong> Szerszy mostek (20mm+) zapobiega wbijaniu się nosków.</li>
</ul>

<h2>Najczęstsze błędy</h2>
<p>Największym błędem jest zadowalanie się oprawkami, które "prawie pasują." Za wąskie oprawki powodują bóle głowy, zostawiają czerwone ślady na skroniach i wyglądają nieproporcjonalnie.</p>

<h2>Dlaczego Woolet jest inny</h2>
<p>Woolet 007 i 009 są zaprojektowane od podstaw na szerokie twarze. Włoski octan. Zauszniki 150mm. Mostek 22mm. Bez kompromisów.</p>
`,
  },
  {
    slug: "jak-zmierzyc-szerokosc-twarzy-do-okularow",
    title: "Jak zmierzyć szerokość twarzy do okularów",
    excerpt: "Prosty przewodnik krok po kroku do mierzenia szerokości twarzy w domu. Potrzebujesz tylko linijki lub miarki — zajmie Ci to mniej niż 2 minuty.",
    date: "2026-03-08",
    readTime: 4,
    tags: ["Poradnik", "Pomiar", "Dopasowanie"],
    content: `
<p>Prawidłowy rozmiar oprawek zaczyna się od znajomości szerokości twarzy. Oto szybka i dokładna metoda, którą możesz wykonać w domu.</p>

<h2>Czego potrzebujesz</h2>
<ul>
<li>Elastyczna miarka lub linijka</li>
<li>Lustro</li>
</ul>

<h2>Krok po kroku</h2>
<ol>
<li><strong>Stań przed lustrem</strong> i patrz prosto przed siebie.</li>
<li><strong>Przyłóż miarkę</strong> w najszerszym miejscu twarzy — zwykle od skroni do skroni, tuż nad uszami.</li>
<li><strong>Odczytaj pomiar</strong> w milimetrach.</li>
</ol>

<h2>Co oznacza Twój wynik</h2>
<ul>
<li><strong>Poniżej 135mm:</strong> Standardowe/wąskie oprawki</li>
<li><strong>135–145mm:</strong> Standardowe/średnie oprawki</li>
<li><strong>145–155mm:</strong> Szerokie oprawki</li>
<li><strong>155mm+:</strong> Ekstra szerokie oprawki (jak Woolet)</li>
</ul>
`,
  },
  {
    slug: "czym-jest-wloski-octan-premium-oprawki",
    title: "Czym jest włoski octan? Materiał luksusowych okularów",
    excerpt: "Włoski octan to złoty standard w luksusowych okularach. Dowiedz się, co wyróżnia go na tle zwykłego plastiku i dlaczego Woolet używa go wyłącznie.",
    date: "2026-03-05",
    readTime: 6,
    tags: ["Materiały", "Rzemiosło", "Premium"],
    content: `
<p>Gdy słyszysz "włoski octan", słyszysz o materiale, który definiuje luksusowe okulary. Co sprawia, że jest tak wyjątkowy?</p>

<h2>Octan vs. plastik</h2>
<p>Standardowe plastikowe oprawki (wtryskiwany poliwęglan) są tanie, lekkie i tak wyglądają. Octan to <strong>materiał roślinny</strong> pozyskiwany z włókien bawełny i pulpy drzewnej. Jest wycinany z bloków, ręcznie polerowany i wykończony z głębią, której plastik nie może odwzorować.</p>

<h2>Dlaczego "włoski"?</h2>
<p>Włochy — a konkretnie region Cadore koło Belluno — są epicentrum produkcji octanu od dekad. Producenci jak <strong>Mazzucchelli</strong> tworzą arkusze o niezrównanej głębi kolorów i integralności strukturalnej.</p>

<h2>Zalety włoskiego octanu</h2>
<ul>
<li><strong>Hipoalergiczny:</strong> Delikatny dla skóry, bez niklu czy agresywnych chemikaliów.</li>
<li><strong>Regulowany:</strong> Można go podgrzać i dopasować do kształtu twarzy.</li>
<li><strong>Trwały:</strong> Odporny na odkształcenia, zachowuje kształt latami.</li>
<li><strong>Piękny:</strong> Bogate warstwy kolorów z głębią widoczną w świetle.</li>
</ul>
`,
  },
  {
    slug: "dlaczego-okulary-nie-pasuja-problem-155mm",
    title: "Dlaczego okulary nie pasują: problem 155mm",
    excerpt: "Branża okularowa projektuje na przeciętną twarz. Jeśli Twoja ma ponad 155mm, byłeś systematycznie wykluczany. Oto dlaczego — i co się zmienia.",
    date: "2026-03-01",
    readTime: 5,
    tags: ["Branża", "Szeroka twarz", "Problem"],
    content: `
<p>Wejdź do dowolnego salonu optycznego, a znajdziesz setki oprawek — prawie żadna nie pasuje na twarz szerszą niż 150mm. To nie przypadek.</p>

<h2>Standard branżowy</h2>
<p>Większość marek projektuje oprawki na twarze <strong>128–142mm</strong>. To obejmuje około 70% mężczyzn. Ale pomija <strong>ok. 30%</strong> — miliony mężczyzn, którzy albo wciskają się w za małe oprawki, albo rezygnują.</p>

<h2>Dlaczego marki ignorują szerokie twarze</h2>
<p>Chodzi o ekonomię. Szersze oprawki wymagają:</p>
<ul>
<li>Innej mechaniki zawiasów</li>
<li>Dłuższych zauszników</li>
<li>Szerszych soczewek (droższych w produkcji)</li>
<li>Osobnych serii produkcyjnych</li>
</ul>

<h2>Rozwiązanie Woolet</h2>
<p>Stworzyliśmy Woolet, bo sami żyliśmy z tym problemem. Nasze oprawki zaczynają się od 155mm, używają wzmocnionych zawiasów 5-baryłkowych, zauszników 150mm i mostka 22mm. Nie zaadaptowane. Zaprojektowane od zera.</p>
`,
  },
  {
    slug: "okragle-czy-kwadratowe-okulary-szeroka-twarz",
    title: "Okrągłe czy kwadratowe okulary na szeroką twarz?",
    excerpt: "Wybierasz między okrągłymi a kwadratowymi oprawkami przy szerokiej twarzy? Sprawdź, jak kształt twarzy wpływa na wybór geometrii oprawek.",
    date: "2026-02-25",
    readTime: 5,
    tags: ["Styl", "Kształt twarzy", "Przewodnik"],
    content: `
<p>Kształt oprawek ma znaczenie — szczególnie gdy masz szeroką twarz. Odpowiednia geometria może wyostrzyć Twój wygląd; niewłaściwa może sprawić, że twarz wygląda jeszcze szerzej.</p>

<h2>Typy kształtów szerokich twarzy</h2>
<ul>
<li><strong>Okrągło-szeroka:</strong> Pełne policzki, miękka linia żuchwy.</li>
<li><strong>Kwadratowo-szeroka:</strong> Mocna żuchwa, kątowe rysy, wyraźne brwi.</li>
<li><strong>Owalno-szeroka:</strong> Zbalansowane proporcje.</li>
</ul>

<h2>Okrągłe oprawki</h2>
<p>Najlepiej sprawdzają się na <strong>kwadratowych lub kątowych</strong> szerokich twarzach. Łagodzą ostre linie. Na okrągłej twarzy mogą jednak podkreślić okrągłość.</p>

<h2>Kwadratowe oprawki</h2>
<p>Kątowe oprawki dodają struktury. Idealne dla <strong>okrągłych</strong> szerokich twarzy, bo wprowadzają kontrast.</p>

<h2>Podejście Woolet</h2>
<p>Woolet 007 to wyrafinowany prostokątny kształt — uniwersalnie korzystny na szerokich twarzach. Woolet 009 ma łagodniejsze, zaokrąglone rogi dla tych, którzy wolą cieplejszy wygląd.</p>
`,
  },
  {
    slug: "okulary-na-szeroka-twarz-dla-profesjonalistow",
    title: "Okulary na szeroką twarz dla profesjonalistów",
    excerpt: "Profesjonalne okulary na szerokie twarze nie muszą oznaczać nudnych. Jak znaleźć oprawki pasujące do biura, wygodne i stylowe.",
    date: "2026-02-20",
    readTime: 5,
    tags: ["Profesjonalne", "Styl", "Biuro"],
    content: `
<p>W środowisku profesjonalnym okulary są częścią pierwszego wrażenia. Ale gdy standardowe oprawki nie pasują, musisz wybierać między komfortem a eleganckim wyglądem.</p>

<h2>Na co zwracać uwagę</h2>
<ul>
<li><strong>Stonowane kolory:</strong> Czarny, szylkretowy, ciemny granat lub grafitowy.</li>
<li><strong>Czyste linie:</strong> Prostokątne lub miękko-kwadratowe kształty wyglądają profesjonalnie.</li>
<li><strong>Prawidłowe dopasowanie:</strong> Oprawki powinny przylegać do skroni — bez przerw, bez ściskania.</li>
<li><strong>Jakościowe materiały:</strong> Octan lub tytan sygnalizują intencjonalność.</li>
</ul>

<h2>Dlaczego dopasowanie ważniejsze niż styl</h2>
<p>Idealnie dopasowana prosta oprawka zawsze wygląda bardziej profesjonalnie niż droga designerska para, która jest za mała.</p>

<h2>Woolet w biurze</h2>
<p>Woolet 007 w matowej czerni to nasz najpopularniejszy wybór profesjonalny. Czysty prostokątny kształt. Włoski octan. 155mm+. Cichy, pewny siebie styl.</p>
`,
  },
  {
    slug: "najlepsze-okulary-na-duza-glowe-2026",
    title: "Najlepsze okulary na dużą głowę w 2026 roku",
    excerpt: "Zestawienie najlepszych okularów na duże głowy w 2026. Porównujemy dopasowanie, styl, materiały i wartość — z uczciwymi recenzjami.",
    date: "2026-02-15",
    readTime: 7,
    tags: ["Zestawienie", "2026", "Najlepsze"],
    content: `
<p>Szukanie stylowych okularów przy dużej głowie nie powinno wymagać wyprawy. Oto nasz uczciwy przegląd najlepszych opcji dostępnych w 2026.</p>

<h2>Co oznacza "duża głowa"</h2>
<p>W terminologii okularowej "duża głowa" to szerokość twarzy <strong>145mm lub więcej</strong>. Możesz też potrzebować dłuższych zauszników (145mm+) i szerszego mostka (19mm+).</p>

<h2>Nasze kryteria</h2>
<ol>
<li><strong>Rzeczywista szerokość:</strong> Czy naprawdę pasuje na twarz 150mm+?</li>
<li><strong>Materiały:</strong> Jakościowy octan, tytan lub premium kompozyty.</li>
<li><strong>Styl:</strong> Czy wygląda intencjonalnie — nie jak powiększona wersja standardowej oprawki?</li>
<li><strong>Wartość:</strong> Cena w stosunku do jakości wykonania.</li>
</ol>

<h3>1. Woolet 007 — Najlepsze ogólnie</h3>
<p>155mm+ szerokości. Włoski octan. Zauszniki 150mm. Mostek 22mm. Zaprojektowane specjalnie na szerokie twarze. Od $189.</p>

<h3>2. Woolet 009 — Najlepsze na łagodne rysy</h3>
<p>Ta sama inżynieria jak 007, ale z łagodniejszym, zaokrąglonym kształtem. Idealny na owalne i okrągłe twarze.</p>
`,
  },
];

export const blogPosts: Partial<Record<Lang, BlogPost[]>> = {
  en: blogPostsEN,
  pl: blogPostsPL,
};

export function getBlogPosts(lang: Lang): BlogPost[] {
  return blogPosts[lang] ?? [];
}

export function getBlogPost(lang: Lang, slug: string): BlogPost | undefined {
  return getBlogPosts(lang).find((p) => p.slug === slug);
}

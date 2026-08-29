/**
 * Korean (ko) locale content — SINGLE SOURCE OF TRUTH for every /ko route.
 *
 * HARD RULE: there is NO English fallback for Korean routes. If a Korean
 * string is missing or empty, the assertion at the bottom of this file
 * throws at module load, which fails the build (prerender + sitemap both
 * import this module through src/seo/metadata.ts).
 *
 * Copy rules enforced below:
 *  - the phrase "넓은 얼굴 안경" is forbidden; the search term is 대두 안경테
 *  - millimetres are digits + mm (158mm), never 158 밀리미터
 *  - frames are EU 핸드메이드 (bespoke: 그리스 핸드메이드); only the acetate
 *    is Italian (이탈리아 마주켈리 아세테이트, 밀라노 가공)
 *  - prices in USD only
 *
 * Slugs are ASCII only. Korean text lives in title / h1 / h2 / body.
 */

export type KoFaq = { q: string; a: string };

export type KoTable = { head: string[]; rows: string[][] };

export type KoCta = { label: string; href: string; primary?: boolean };

export type KoSection = {
  h2: string;
  /** Lead paragraph (kept for backwards compatibility / validation). */
  body: string;
  /** Additional paragraphs rendered after `body`. */
  paras?: string[];
  /** Numbered or bulleted plain list. */
  list?: string[];
  ordered?: boolean;
  /** Spec key/value grid. */
  bullets?: { label: string; value: string }[];
  table?: KoTable;
  /** Bordered callout box lines. */
  callout?: string[];
  /** Highlighted monospace/formula block. */
  code?: string;
  /** Visually emphasised paragraph (rendered as a pull-quote). */
  emphasis?: string;
  ctas?: KoCta[];
  link?: { label: string; href: string };
};

export type KoPageConfig = {
  /** Full pathname, ASCII only. */
  path: string;
  eyebrow: string;
  h1: string;
  sub: string;
  metaTitle: string;
  metaDescription: string;
  /** H2 + body blocks rendered in order. */
  sections: KoSection[];
  faqs: KoFaq[];
  /** Absolute-path EN equivalent, or null when none exists yet. */
  englishEquivalent: string | null;
  /**
   * Keep the page out of the index while it still carries unverified /
   * placeholder data. Emits <meta name="robots" content="noindex, follow">
   * and drops the route from the sitemap.
   */
  noindex?: boolean;
};

/**
 * Feature flags for /ko sections whose data is NOT verified yet.
 * Both are OFF by default and must stay off until the underlying facts are
 * confirmed. Flipping one to `true` without the confirmation described in the
 * TODO next to the section is a compliance failure, not a content tweak.
 */
export const KO_FLAGS = {
  /** TODO: confirm carrier and delivery SLA with the fulfilment partner before enabling. */
  shippingCarrierAndSla: false,
  /** TODO: do not publish any percentage, threshold or duty rate until confirmed with a customs broker. */
  shippingDutyAndVat: false,
} as const;

/** Drops sections whose feature flag is off. */
const gated = (entries: { on: boolean; section: KoSection }[]): KoSection[] =>
  entries.filter((e) => e.on).map((e) => e.section);


export const KO_HOME_PATH = "/ko";

const SPEC_TABLE: KoTable = {
  head: ["항목", "Woolet 007 라운드", "Woolet 009 스퀘어"],
  rows: [
    ["전면부 총길이", "158mm", "158mm"],
    ["브릿지", "21mm (키홀)", "22mm (키홀)"],
    ["렌즈 (가로×세로)", "52 × 52mm", "54 × 50mm"],
    ["다리 길이", "150mm", "150mm"],
    ["프론트 높이", "52mm", "54mm"],
    ["소재", "이탈리아 마주켈리 아세테이트", "이탈리아 마주켈리 아세테이트"],
    ["가격", "$190 (데모 렌즈 포함)", "$190 (데모 렌즈 포함)"],
  ],
};

const BESPOKE_BULLETS = [
  "4가지 모양 중 선택",
  "60가지 색상과 사이즈 조합",
  "브릿지 폭과 다리 길이도 함께 조정",
  "이탈리아 마주켈리 아세테이트, 그리스에서 손으로 제작",
  "주문 후 2주 발송",
  "렌즈 포함 $480 (도수·선글라스·블루라이트·변색 중 선택)",
];

const FIT_CTAS: KoCta[] = [
  { label: "FitLens로 측정하기", href: "/en/fit", primary: true },
  { label: "비스포크 문의하기", href: "/en/bespoke" },
];

export const koPages: Record<string, KoPageConfig> = {
  "/ko": {
    path: "/ko",
    eyebrow: "Woolet · 대두 안경테",
    h1: "158mm 하나로 만든 대두 안경테",
    sub: "렌즈 크기가 아니라 전면부 총길이로 고르는 안경",
    metaTitle: "대두 안경테 158mm - 이탈리아 아세테이트 | Woolet",
    metaDescription:
      "전면부 총길이 158mm 단일 사이즈. 이탈리아 마주켈리 아세테이트, EU 핸드메이드. 비스포크는 145-172mm까지 맞춤 제작, 주문 후 2주.",
    sections: [
      {
        h2: "사이즈를 고를 필요가 없습니다",
        body:
          "우리는 158mm 하나만 만듭니다. 007 라운드와 009 스퀘어, 두 모양 모두 전면부 총길이가 158mm입니다. S·M·L 같은 표기도, 같은 모델의 여러 사이즈도 없습니다. 실측 155-161mm 얼굴이라면 고민할 것이 없습니다. 그 범위 밖이라면 비스포크로 만듭니다.",
      },
      {
        h2: "007 라운드 · 009 스퀘어",
        body: "두 모양의 전면부 총길이는 같습니다. 차이는 렌즈 형태와 브릿지 폭입니다.",
        table: SPEC_TABLE,
      },
      {
        h2: "렌즈 크기 말고 전면부 총길이를 보세요",
        body:
          "안경테 안쪽에 적힌 52□19 145에서 52는 렌즈 한쪽 가로, 19는 브릿지, 145는 다리 길이입니다. 정작 얼굴 폭과 직접 맞물리는 숫자 - 전면부 총길이 - 는 어디에도 적혀 있지 않습니다.",
        paras: [
          "렌즈가 큰 안경이 곧 넓은 안경은 아닙니다. 관자놀이가 눌리는 이유는 렌즈가 작아서가 아니라 전체 폭이 좁아서입니다. 렌즈만 키우면 얼굴은 더 커 보이고 압박은 그대로 남습니다.",
        ],
      },
      {
        h2: "155-161mm은 시그니처, 그 밖은 비스포크",
        body:
          "실측 155-161mm이라면 시그니처 158mm가 맞습니다. 그 범위를 벗어나면 비스포크로 만듭니다 - 145mm부터 172mm까지, 원하는 폭 그대로.",
        list: [
          "4가지 모양, 60가지 색상과 사이즈 조합",
          "주문 후 2주면 발송",
          "렌즈 포함 $480 (도수·선글라스·블루라이트·변색 렌즈 중 선택)",
          "그리스에서 손으로 제작",
        ],
      },
      {
        h2: "휴대폰으로 얼굴 폭 재기 - FitLens",
        body:
          "자를 들고 거울 앞에 서기 어렵다면 FitLens를 쓰세요. 휴대폰 카메라로 관자놀이에서 관자놀이까지의 폭을 측정하고, 그 숫자에 맞는 사이즈를 바로 알려줍니다. 구매 전에 확인하는 것이 반품보다 빠릅니다.",
        ctas: FIT_CTAS,
      },
      {
        h2: "소재와 제작",
        body:
          "이탈리아 마주켈리(Mazzucchelli) 아세테이트를 밀라노에서 가공합니다. 같은 아세테이트가 007·009와 비스포크에 모두 들어갑니다. 007과 009는 EU에서, 비스포크는 그리스에서 손으로 만듭니다.",
      },
      {
        h2: "한국 배송과 도수 렌즈",
        body: "프레임만 들고 안경원에 가시면 됩니다. 국내 안경원에서 구하기 어려운 것은 렌즈가 아니라 158mm 프레임입니다. 렌즈는 어디서나 넣을 수 있습니다.",
        callout: [
          "Woolet은 한국으로 도수 렌즈를 판매하지 않습니다.",
          "프레임(데모 렌즈 포함)과 도수 없는 선글라스만 배송합니다.",
          "도수 렌즈는 가까운 안경원에서 조제하시면 됩니다.",
        ],
        link: { label: "한국 배송, 관세, 개인통관고유부호 안내", href: "/ko/shipping" },
      },
    ],
    faqs: [
      {
        q: "내 얼굴 폭은 어떻게 재나요?",
        a: "관자놀이에서 관자놀이까지 가장 넓은 지점을 재고, 그 숫자를 전면부 총길이와 비교합니다. 실측 155-161mm이라면 158mm가 맞습니다.",
      },
      {
        q: "158mm보다 넓게 만들 수 있나요?",
        a: "비스포크로 145mm부터 172mm까지 제작합니다. 주문 후 2주, 렌즈 포함 $480입니다.",
      },
    ],
    englishEquivalent: "/en",
  },

  "/ko/size/150mm": {
    path: "/ko/size/150mm",
    eyebrow: "Woolet · 사이즈",
    h1: "150mm는 시그니처보다 좁습니다",
    sub: "시그니처 158mm는 실측 155-161mm 얼굴을 위한 치수입니다. 150mm는 비스포크로 만듭니다.",
    metaTitle: "대두 안경테 150mm - 비스포크 | Woolet",
    metaDescription: "시그니처 158mm는 155-161mm 얼굴용입니다. 150mm는 비스포크로 제작합니다.",
    sections: [
      {
        h2: "솔직하게 말씀드리면",
        body:
          "Woolet 시그니처는 158mm입니다. 150mm 얼굴에는 넓습니다. 억지로 맞추는 대신 비스포크로 150mm를 만드는 편이 낫습니다.",
      },
      {
        h2: "150mm는 어떤 얼굴인가",
        body:
          "전면부 총길이 150mm는 일반 브랜드의 넓은 쪽 라인과 겹치는 구간입니다. 기성품에서도 선택지가 있다는 뜻입니다. 그럼에도 비스포크를 고르는 이유는 브릿지 폭, 다리 길이, 프론트 높이를 함께 맞추기 때문입니다.",
        link: { label: "안경 사이즈 재는 법", href: "/ko/guide/frame-size" },
      },
      {
        h2: "비스포크 145-172mm",
        body: "원하는 폭을 그대로 지정합니다. 150mm도 같은 방식으로 만듭니다.",
        list: BESPOKE_BULLETS,
        ctas: FIT_CTAS,
      },
    ],
    faqs: [
      {
        q: "150mm와 158mm 중 무엇을 골라야 하나요?",
        a: "실측 155mm 미만이면 150mm 비스포크, 155-161mm이면 시그니처 158mm입니다.",
      },
    ],
    englishEquivalent: "/en/size/150mm",
  },

  "/ko/size/160mm": {
    path: "/ko/size/160mm",
    eyebrow: "Woolet · 사이즈",
    h1: "대두 안경테 160mm - 정말 160mm가 필요한가요?",
    sub: "160mm를 검색하는 분들 대부분은 실측 155-161mm입니다. 재는 법부터 확인하세요.",
    metaTitle: "대두 안경테 160mm를 찾는다면 | Woolet",
    metaDescription:
      "160mm를 검색하는 분들 대부분은 실측 155-161mm입니다. 재는 법부터 확인하고 시그니처 158mm와 비스포크 중에서 고르세요.",
    sections: [
      {
        h2: "160mm는 어디를 재는 숫자인가",
        body:
          "160mm는 안경테 양 끝에서 끝까지, 전면부 총길이를 말합니다. 안경테에 인쇄된 52□19 145 같은 표기에는 이 숫자가 없습니다. 그래서 160mm를 검색하는 분들 대부분은 실제로 재본 적이 없습니다.",
      },
      {
        h2: "얼굴 폭 재는 법",
        body: "자 하나면 충분합니다.",
        ordered: true,
        list: [
          "거울을 정면으로 보고 섭니다",
          "왼쪽 관자놀이의 가장 튀어나온 지점에서 오른쪽 같은 지점까지를 잽니다",
          "자가 얼굴 곡면을 따라가지 않도록 직선으로 유지합니다",
        ],
        paras: [
          "지금 쓰는 안경이 있다면 더 쉽습니다. 안경테를 펼쳐 놓고 양 끝 사이를 재세요. 그 숫자가 지금 압박을 느끼는 폭입니다.",
        ],
        link: { label: "안경 사이즈 재는 법 자세히 보기", href: "/ko/guide/frame-size" },
      },
      {
        h2: "실측 155-161mm이라면 시그니처 158mm",
        body:
          "이 범위가 Woolet 007과 009가 설계된 구간입니다. 158mm 프레임은 155mm 얼굴에서도, 161mm 얼굴에서도 관자놀이를 누르지 않습니다. 키홀 브릿지와 150mm 다리가 무게를 코가 아니라 프레임 전체에 분산시킵니다.",
      },
      {
        h2: "실측 162mm 이상이라면 비스포크",
        body:
          "비스포크는 145mm부터 172mm까지 원하는 폭으로 만듭니다. 4가지 모양, 60가지 색상과 사이즈 조합, 주문 후 2주, 렌즈 포함 $480.",
        ctas: FIT_CTAS,
      },
      {
        h2: "007 / 009 스펙",
        body: "두 모양 모두 전면부 총길이 158mm입니다.",
        table: SPEC_TABLE,
      },
    ],
    faqs: [
      {
        q: "안경테에 160mm라고 적혀 있는 제품을 찾고 있는데요.",
        a: "전면부 총길이는 안경테에 인쇄되지 않습니다. 제조사가 스펙에 따로 표기해야 알 수 있습니다. Woolet은 모든 제품에 전면부 총길이를 명시합니다.",
      },
      {
        q: "렌즈가 크면 전체 폭도 넓어지나요?",
        a: "아닙니다. 렌즈 가로가 58mm여도 브릿지와 엔드피스가 좁으면 전체 폭은 150mm에 못 미칩니다.",
      },
      {
        q: "158mm인데 160mm 얼굴에 맞나요?",
        a: "실측 161mm까지는 맞습니다. 아세테이트는 열로 미세 조정이 가능하고, 키홀 브릿지가 여유를 만듭니다.",
      },
    ],
    englishEquivalent: "/en/size/160mm",
  },

  "/ko/size/165mm": {
    path: "/ko/size/165mm",
    eyebrow: "Woolet · 비스포크",
    h1: "165mm 안경테는 비스포크로 만듭니다",
    sub: "165mm 전면부 총길이는 비스포크 범위(145-172mm) 안에 있습니다.",
    metaTitle: "대두 안경테 165mm - 비스포크 맞춤 제작 | Woolet",
    metaDescription:
      "165mm 전면부 총길이는 비스포크 범위(145-172mm) 안에 있습니다. 4가지 모양, 60가지 조합, 주문 후 2주, 렌즈 포함 $480.",
    sections: [
      {
        h2: "165mm는 기성품에 없습니다",
        body:
          "일반 브랜드의 전면부 총길이는 대개 135-145mm입니다. 165mm는 기성 라인에서 찾기 어려운 구간입니다. 그래서 맞춤으로 만듭니다.",
        link: { label: "안경 사이즈 재는 법", href: "/ko/guide/frame-size" },
      },
      {
        h2: "비스포크는 145mm부터 172mm까지",
        body:
          "원하는 폭을 그대로 지정합니다. 165mm도, 168mm도, 172mm도 같은 방식입니다. 172mm가 Woolet이 만드는 최대 폭입니다.",
        list: BESPOKE_BULLETS,
      },
      {
        h2: "165mm가 정말 맞는 숫자인지 먼저 확인하세요",
        body:
          "실측 155-161mm이라면 시그니처 158mm가 맞고, 가격은 $190입니다. 비스포크는 그 범위 밖일 때 필요합니다. FitLens로 먼저 재보세요.",
        ctas: FIT_CTAS,
      },
    ],
    faqs: [
      {
        q: "165mm보다 넓게 제작할 수 있나요?",
        a: "172mm까지 제작합니다. 그 이상은 만들지 않습니다.",
      },
    ],
    englishEquivalent: "/en/size/165mm",
  },

  "/ko/sunglasses": {
    path: "/ko/sunglasses",
    eyebrow: "Woolet · 선글라스",
    h1: "얼굴 옆이 눌리지 않는 대두 선글라스",
    sub: "전면부 총길이 158mm, UV400 차단. 도수 없는 제품이라 한국 주소로 바로 배송됩니다.",
    metaTitle: "대두 선글라스 158mm UV400 - 와이드핏 | Woolet",
    metaDescription:
      "전면부 총길이 158mm, UV400 차단. 관자놀이 압박 없는 와이드핏 선글라스. 도수 없는 제품이라 한국으로 바로 배송됩니다.",
    sections: [
      {
        h2: "도수가 없으니 바로 배송됩니다",
        body:
          "선글라스는 도수 렌즈가 아닙니다. 주문하시면 한국 주소로 그대로 배송됩니다. 안경원에 들를 필요도, 처방전도 필요 없습니다.",
      },
      {
        h2: "전면부 총길이 158mm",
        body:
          "대부분의 선글라스는 얼굴에 얹히는 것이 아니라 얼굴을 조입니다. 러닝이나 라운딩처럼 오래 쓰는 상황에서 관자놀이 압박은 두통으로 돌아옵니다. 158mm는 155-161mm 얼굴이 하루 종일 써도 자국이 남지 않는 폭입니다.",
      },
      {
        h2: "스펙",
        body: "007 라운드와 009 스퀘어 모두 전면부 총길이는 158mm입니다.",
        table: {
          head: ["항목", "007 라운드", "009 스퀘어"],
          rows: [
            ["전면부 총길이", "158mm", "158mm"],
            ["브릿지", "21mm (키홀)", "22mm (키홀)"],
            ["렌즈", "52 × 52mm", "54 × 50mm"],
            ["다리 길이", "150mm", "150mm"],
            ["렌즈 사양", "UV400 차단", "UV400 차단"],
            ["가격", "$210", "$210"],
          ],
        },
      },
      {
        h2: "더 넓은 폭이 필요하다면",
        body: "비스포크로 145-172mm까지 만듭니다. 선글라스 렌즈 포함 $480, 주문 후 2주.",
      },
      {
        h2: "한국 배송",
        body: "도수 렌즈는 한국으로 판매하지 않습니다.",
        callout: [
          "Woolet은 한국으로 도수 렌즈를 판매하지 않습니다.",
          "프레임(데모 렌즈 포함)과 도수 없는 선글라스만 배송합니다.",
          "도수 렌즈는 가까운 안경원에서 조제하시면 됩니다.",
        ],
        ctas: [
          { label: "FitLens로 측정하기", href: "/en/fit", primary: true },
          { label: "선글라스 보기", href: "/en/collections/sunglasses-for-big-heads" },
        ],
        link: { label: "한국 배송, 관세, 개인통관고유부호 안내", href: "/ko/shipping" },
      },
    ],
    faqs: [
      {
        q: "한국에서 도수를 넣을 수 있나요?",
        a: "선글라스는 도수 없는 제품으로만 배송합니다. 도수 렌즈가 필요하면 프레임을 받아 가까운 안경원에서 조제하시면 됩니다.",
      },
    ],
    englishEquivalent: null,
  },

  "/ko/guide/frame-size": {
    path: "/ko/guide/frame-size",
    eyebrow: "Woolet · 가이드",
    h1: "안경 사이즈, 렌즈 크기 말고 전면부 총길이로 보세요",
    sub: "안경테에 적힌 52□19 145가 무슨 뜻인지, 전면부 총길이는 어떻게 계산하는지, 대두라면 어떤 숫자를 봐야 하는지 정리했습니다.",
    metaTitle: "안경 사이즈 재는 법 - 전면부 총길이로 고르기 | Woolet",
    metaDescription:
      "안경테에 적힌 52□19 145가 무슨 뜻인지, 전면부 총길이는 어떻게 계산하는지, 대두라면 어떤 숫자를 봐야 하는지 정리했습니다.",
    sections: [
      {
        h2: "안경테에 적힌 숫자 읽는 법",
        body: "안경 다리 안쪽이나 브릿지 뒤에 52□19 145 형태의 숫자가 있습니다.",
        list: [
          "52 - 렌즈 한쪽 가로 길이(mm)",
          "□ - 구분 기호, 브릿지를 뜻합니다",
          "19 - 브릿지 폭(mm), 두 렌즈 사이 거리",
          "145 - 다리 길이(mm), 힌지에서 끝까지",
        ],
        paras: [
          "이 세 숫자만으로는 안경이 얼굴에 맞는지 알 수 없습니다. 가장 중요한 숫자가 빠져 있기 때문입니다.",
        ],
      },
      {
        h2: "전면부 총길이 - 표기되지 않는 숫자",
        body:
          "전면부 총길이는 안경테 왼쪽 끝에서 오른쪽 끝까지의 직선 거리입니다. 얼굴 폭과 직접 맞물리는 유일한 숫자인데, 안경테에는 인쇄되지 않습니다.",
        code: "전면부 총길이 ≈ (렌즈 가로 × 2) + 브릿지 + (엔드피스 × 2)",
        paras: [
          "52□19라면 52×2 + 19 = 123mm에 양쪽 엔드피스를 더해 대개 135-142mm가 나옵니다. 엔드피스 길이는 디자인마다 달라서, 정확한 값은 제조사가 표기해야 알 수 있습니다.",
        ],
      },
      {
        h2: "얼굴 폭 재는 법",
        body: "자 하나면 충분합니다.",
        ordered: true,
        list: [
          "거울을 정면으로 봅니다",
          "왼쪽 관자놀이의 가장 튀어나온 지점을 찾습니다",
          "반대쪽 같은 지점까지 자를 직선으로 대고 잽니다",
          "자가 얼굴 곡면을 따라 휘지 않도록 유지합니다",
        ],
        emphasis:
          "지금 쓰는 안경으로 재는 방법이 더 쉽습니다. 안경 다리를 펼쳐 책상에 놓고 양 끝 사이를 재세요. 그 숫자가 지금 얼굴이 견디고 있는 폭입니다.",
      },
      {
        h2: "대두가 봐야 하는 숫자는 렌즈 크기가 아닙니다",
        body:
          "큰 안경을 찾을 때 보통 렌즈 가로가 큰 제품을 고릅니다. 하지만 렌즈를 키워도 브릿지와 엔드피스가 좁으면 전체 폭은 그대로입니다. 결과는 두 가지입니다.",
        list: [
          "관자놀이 압박은 사라지지 않습니다 - 원인은 렌즈가 아니라 전체 폭이었으니까요",
          "얼굴이 더 커 보입니다 - 렌즈가 얼굴 안쪽으로 파고들기 때문입니다",
        ],
        paras: [
          "전면부 총길이가 얼굴 폭보다 좁으면 다리가 바깥으로 벌어지면서 힌지에 힘이 걸립니다. 안경이 흘러내리거나, 다리가 헐거워지거나, 관자놀이에 자국이 남는 이유입니다.",
        ],
      },
      {
        h2: "브릿지와 다리 길이는 따로 봐야 합니다",
        body: "두 숫자는 전면부 총길이와 함께 움직입니다.",
        list: [
          "브릿지 - 코 위에서 안경이 얹히는 지점입니다. 좁으면 코에 자국이 남고, 넓으면 안경이 내려앉습니다. 키홀 브릿지는 콧등 양옆으로 하중을 나눕니다.",
          "다리 길이 - 힌지에서 귀까지의 거리입니다. 전면부가 넓어지면 다리도 길어져야 귀 뒤에서 자연스럽게 꺾입니다. 전면부만 넓고 다리가 짧으면 귀 뒤가 아픕니다.",
        ],
        paras: ["Woolet 007과 009는 전면부 158mm에 다리 150mm를 맞췄습니다."],
      },
      {
        h2: "직접 재기 어렵다면 - FitLens",
        body:
          "FitLens는 휴대폰 카메라로 관자놀이에서 관자놀이까지의 폭을 측정합니다. 자도, 도움도 필요 없습니다. 측정값과 함께 맞는 사이즈를 알려드립니다.",
        ctas: [{ label: "FitLens로 측정하기", href: "/en/fit", primary: true }],
      },
    ],
    faqs: [
      {
        q: "안경 사이즈는 어디에 적혀 있나요?",
        a: "안경 다리 안쪽 또는 브릿지 뒤쪽에 52□19 145 형태로 인쇄되어 있습니다. 렌즈 가로, 브릿지, 다리 길이 순서입니다. 전면부 총길이는 여기에 포함되지 않습니다.",
      },
      {
        q: "전면부 총길이가 몇 mm면 대두인가요?",
        a: "기준선은 없습니다. 다만 일반 브랜드의 전면부 총길이가 대개 135-145mm이므로, 얼굴 폭이 150mm를 넘으면 기성품에서 선택지가 급격히 줄어듭니다.",
      },
      {
        q: "렌즈가 크면 얼굴이 작아 보이나요?",
        a: "전체 폭이 얼굴 폭과 맞을 때만 그렇습니다. 폭이 좁은 상태에서 렌즈만 크면 오히려 얼굴이 커 보입니다.",
      },
      {
        q: "아세테이트 안경테는 사이즈 조절이 되나요?",
        a: "열로 미세 조정이 가능합니다. 다만 조정 폭은 수 mm 수준입니다. 10mm 이상 차이는 조정으로 해결되지 않습니다.",
      },
    ],
    englishEquivalent: null,
  },

  "/ko/brands": {
    path: "/ko/brands",
    eyebrow: "Woolet · 비교",
    h1: "대두 안경테, 브랜드별 전면부 총길이 비교",
    sub: "브랜드를 비교할 수 있는 숫자는 전면부 총길이 하나뿐입니다.",
    metaTitle: "대두 안경테 브랜드 비교 - 어디까지 나오나 | Woolet",
    metaDescription:
      "대두 안경테를 전면부 총길이 기준으로 비교합니다. 경쟁 브랜드 수치는 각 브랜드 공식 스펙으로 확인되는 대로 채웁니다.",
    // Unverified comparison data -> stays out of the index until the
    // competitor rows below are filled in with confirmed figures.
    noindex: true,
    sections: [
      {
        h2: "브랜드별 전면부 총길이",
        body: "확인된 수치만 표기합니다. 확인 전인 항목은 '확인 중'으로 둡니다.",
        table: {
          head: ["브랜드", "전면부 총길이", "소재", "맞춤 제작"],
          rows: [
            ["Woolet 시그니처", "158mm", "이탈리아 마주켈리 아세테이트", "-"],
            ["Woolet 비스포크", "145-172mm", "이탈리아 마주켈리 아세테이트", "4가지 모양, 60가지 조합"],
            // TODO(ko/brands): a figure may only be filled in from that brand's OWN
            // published spec page — never from an AI summary, a forum post, or a
            // retailer listing. Until then every competitor cell stays "확인 중"
            // and this page keeps `noindex: true`.
            ["[경쟁 브랜드 1]", "확인 중", "확인 중", "확인 중"],
            ["[경쟁 브랜드 2]", "확인 중", "확인 중", "확인 중"],
          ],
        },
      },
      {
        h2: "왜 전면부 총길이를 공개하는 브랜드가 적을까",
        body:
          "대부분의 브랜드는 52□19 145 세 숫자만 표기합니다. 전면부 총길이는 디자인마다 엔드피스 길이가 달라 일괄 표기가 번거롭기 때문입니다. 얼굴 폭이 큰 사람에게는 그 숫자가 유일하게 중요한 숫자인데도 그렇습니다.",
        paras: ["Woolet은 모든 제품에 전면부 총길이를 명시합니다."],
        link: { label: "안경 사이즈 재는 법", href: "/ko/guide/frame-size" },
      },
    ],
    faqs: [],
    englishEquivalent: null,
  },

  "/ko/shipping": {
    path: "/ko/shipping",
    eyebrow: "Woolet · 배송",
    h1: "한국으로 배송하면 관세는 얼마인가요?",
    sub: "통관에 필요한 준비물과 국내 안경원에서 렌즈를 넣는 방법을 정리했습니다.",
    metaTitle: "한국 배송, 관세, 개인통관고유부호 안내 | Woolet",
    metaDescription:
      "해외직구 통관에 필요한 개인통관고유부호 발급 방법과, Woolet 프레임을 받아 국내 안경원에서 도수 렌즈를 넣는 절차를 안내합니다.",
    sections: [
      // [1] FEATURE FLAG OFF — KO_FLAGS.shippingCarrierAndSla
      // TODO(ko/shipping): confirm carrier and delivery SLA before enabling.
      // Do not render any carrier name or delivery window until then.
      ...gated([
        {
          on: KO_FLAGS.shippingCarrierAndSla,
          section: { h2: "배송 기간과 배송사", body: "확인 중" },
        },
      ]),
      {
        h2: "개인통관고유부호(PCCC)",
        body:
          "해외직구로 물건을 받으려면 개인통관고유부호가 필요합니다. 관세청 전자통관시스템(UNI-PASS)에서 무료로 발급받을 수 있고, 한 번 받으면 계속 사용합니다. 주문할 때 이 번호를 입력하지 않으면 통관이 지연됩니다.",
      },
      // [3] FEATURE FLAG OFF — KO_FLAGS.shippingDutyAndVat
      // TODO(ko/shipping): do not publish any percentage, threshold or duty
      // rate until it is confirmed with a customs broker.
      ...gated([
        {
          on: KO_FLAGS.shippingDutyAndVat,
          section: { h2: "관세와 부가세", body: "확인 중" },
        },
      ]),
      {
        h2: "도수 렌즈는 판매하지 않습니다",
        body: "한국으로는 도수 렌즈를 배송하지 않습니다.",
        callout: [
          "Woolet은 한국으로 도수 렌즈를 판매하지 않습니다.",
          "프레임(데모 렌즈 포함)과 도수 없는 선글라스만 배송합니다.",
        ],
      },
      {
        h2: "국내 안경원에서 렌즈 넣는 방법",
        body: "네 단계면 끝납니다.",
        ordered: true,
        list: [
          "Woolet 프레임을 받습니다 (데모 렌즈가 끼워진 상태로 배송됩니다)",
          "프레임을 들고 가까운 안경원에 갑니다",
          "시력 검사를 받고 도수 렌즈를 조제합니다",
          "안경사가 데모 렌즈를 빼고 도수 렌즈를 넣어 줍니다",
        ],
        paras: [
          "국내 안경원에서 구하기 어려운 것은 렌즈가 아니라 158mm 프레임입니다. 렌즈는 어디서나 넣을 수 있습니다. 프레임만 해결하면 됩니다.",
        ],
      },
    ],
    faqs: [],
    englishEquivalent: null,
  },

};

export const koPageOrder: string[] = Object.keys(koPages);

/** Every /ko route registered here. Consumed by metadata + sitemap. */
export const KO_ROUTES: string[] = koPageOrder;

// ---------------------------------------------------------------------------
// FAIL-LOUD VALIDATION. No English fallback exists for /ko: a missing or
// non-Korean-bearing string must break the build, not silently degrade.
// ---------------------------------------------------------------------------
const HANGUL = /[\uAC00-\uD7A3]/;
/** Forbidden phrasing — the Korean search term is 대두 안경테. */
const FORBIDDEN = ["넓은 얼굴 안경", "밀리미터", "made in Italy"];

function assertCopy(path: string, field: string, value: string) {
  if (!value || !value.trim()) {
    throw new Error(`[ko] Missing Korean copy: ${path} -> ${field}`);
  }
  if (!HANGUL.test(value)) {
    throw new Error(
      `[ko] ${path} -> ${field} contains no Korean text ("${value}"). English fallback is forbidden for /ko.`,
    );
  }
}

for (const [path, cfg] of Object.entries(koPages)) {
  const required: [string, string][] = [
    ["h1", cfg.h1],
    ["sub", cfg.sub],
    ["metaTitle", cfg.metaTitle],
    ["metaDescription", cfg.metaDescription],
    ["eyebrow", cfg.eyebrow],
  ];
  for (const [field, value] of required) assertCopy(path, field, value);

  if (cfg.path !== path) {
    throw new Error(`[ko] path mismatch for ${path} (config.path = ${cfg.path})`);
  }
  if (!/^\/ko(\/[a-z0-9-]+)*$/.test(path)) {
    throw new Error(`[ko] Non-ASCII or malformed slug: ${path}`);
  }
  if (!cfg.sections.length) {
    throw new Error(`[ko] ${path} has no content sections.`);
  }
  for (const s of cfg.sections) {
    assertCopy(path, `section.h2 (${s.h2})`, s.h2);
    assertCopy(path, `section.body (${s.h2})`, s.body);
    for (const p of s.paras ?? []) assertCopy(path, `section.para (${s.h2})`, p);
    for (const l of s.list ?? []) assertCopy(path, `section.list (${s.h2})`, l);
    for (const l of s.callout ?? []) assertCopy(path, `section.callout (${s.h2})`, l);
    if (s.code) assertCopy(path, `section.code (${s.h2})`, s.code);
    if (s.emphasis) assertCopy(path, `section.emphasis (${s.h2})`, s.emphasis);
    for (const cta of s.ctas ?? []) assertCopy(path, `section.cta (${s.h2})`, cta.label);
  }
  for (const f of cfg.faqs) {
    assertCopy(path, "faq.q", f.q);
    assertCopy(path, "faq.a", f.a);
  }

  const blob = JSON.stringify(cfg);
  for (const bad of FORBIDDEN) {
    if (blob.includes(bad)) {
      throw new Error(`[ko] ${path} uses forbidden phrasing: "${bad}".`);
    }
  }
}

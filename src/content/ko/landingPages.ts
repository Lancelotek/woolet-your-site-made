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
};

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
    h1: "대두 선글라스 158mm",
    sub: "실측 155-161mm 얼굴을 위한 선글라스. 전면부 총길이 158mm, 키홀 브릿지, UV400 렌즈. 이탈리아 마주켈리 아세테이트, EU 핸드메이드.",
    metaTitle: "대두 선글라스 158mm — UV400 | Woolet",
    metaDescription:
      "실측 155-161mm 얼굴을 위한 158mm 선글라스. 키홀 브릿지, UV400 렌즈, 이탈리아 마주켈리 아세테이트, EU 핸드메이드.",
    sections: [
      {
        h2: "선글라스는 오차가 더 크게 보인다",
        body:
          "렌즈 면적이 넓기 때문에 전면부 총길이가 부족하면 눈이 렌즈 안쪽으로 몰리고 관자놀이에 자국이 남습니다. 158mm 전면부는 눈동자 중심을 렌즈 중앙에 맞춰 줍니다.",
        bullets: [
          { label: "전면부 총길이", value: "158mm" },
          { label: "렌즈", value: "UV400" },
          { label: "브릿지", value: "21-22mm 키홀" },
        ],
      },
      {
        h2: "렌즈에 대한 솔직한 설명",
        body:
          "UV400은 자외선 차단 규격입니다. 블루라이트 코팅은 선택 옵션이며 의료기기가 아니고, 눈의 피로나 수면 개선을 약속하지 않습니다.",
      },
    ],
    faqs: [
      { q: "한국에서 도수를 넣을 수 있나요?", a: "프레임만 배송하며, 도수 렌즈는 가까운 안경원에서 조제하시면 됩니다." },
    ],
    englishEquivalent: null,
  },

  "/ko/guide/frame-size": {
    path: "/ko/guide/frame-size",
    eyebrow: "Woolet · 가이드",
    h1: "안경 사이즈 재는 법",
    sub: "안경테 안쪽에 적힌 숫자와 내 얼굴 폭을 연결하는 방법. 자 하나와 30초면 충분합니다.",
    metaTitle: "안경 사이즈 재는 법 — 얼굴 폭과 전면부 총길이 | Woolet",
    metaDescription:
      "안경 다리 안쪽 숫자(렌즈 가로-브릿지-다리 길이)를 읽는 법과 얼굴 폭 측정법. 전면부 총길이 계산식과 실측 155mm 이상 기준을 정리했습니다.",
    sections: [
      {
        h2: "다리 안쪽 숫자 읽기",
        body:
          "예를 들어 52□21 150은 렌즈 가로 52mm, 브릿지 21mm, 다리 길이 150mm를 뜻합니다. 전면부 총길이는 대략 (렌즈 가로 × 2) + 브릿지 + 엔드피스 여유입니다.",
        bullets: [
          { label: "렌즈 가로", value: "52-54mm" },
          { label: "브릿지", value: "21-22mm" },
          { label: "다리 길이", value: "150mm" },
        ],
      },
      {
        h2: "얼굴 폭 측정",
        body:
          "왼쪽 관자놀이의 가장 튀어나온 지점에서 오른쪽 같은 지점까지를 직선으로 잽니다. 이 값이 전면부 총길이와 ±3mm 안에 들면 잘 맞는 크기입니다.",
      },
    ],
    faqs: [
      { q: "전면부 총길이가 얼굴 폭보다 좁으면?", a: "관자놀이가 눌리고 다리가 벌어집니다. 얼굴 폭 이상 또는 동일한 전면부 총길이를 고르세요." },
    ],
    englishEquivalent: null,
  },

  "/ko/brands": {
    path: "/ko/brands",
    eyebrow: "Woolet · 비교",
    h1: "대두 안경테 브랜드 비교",
    sub: "대두 안경테를 다루는 브랜드는 많지 않습니다. 전면부 총길이라는 하나의 숫자로만 비교했습니다.",
    metaTitle: "대두 안경테 브랜드 비교 — 전면부 총길이 기준 | Woolet",
    metaDescription:
      "대두 안경테 브랜드를 전면부 총길이 기준으로 비교합니다. 대부분 135-145mm에 머무는 반면 Woolet은 158mm 기성과 145-172mm 비스포크를 제공합니다.",
    sections: [
      {
        h2: "비교 기준은 전면부 총길이 하나",
        body:
          "'라지', 'XL' 같은 표기는 브랜드마다 다릅니다. 유일하게 비교 가능한 숫자는 양 끝에서 끝까지의 전면부 총길이(mm)입니다.",
        bullets: [
          { label: "일반 브랜드", value: "135-145mm" },
          { label: "Woolet 시그니처", value: "158mm" },
          { label: "Woolet 비스포크", value: "145-172mm" },
        ],
      },
      {
        h2: "선택 기준",
        body:
          "얼굴 폭을 먼저 재고, 그 숫자에 맞는 전면부 총길이를 제공하는 브랜드만 후보에 남기세요. 그러면 대부분의 선택지는 자동으로 정리됩니다.",
      },
    ],
    faqs: [
      { q: "전면부 총길이를 공개하지 않는 브랜드는?", a: "다리 안쪽 숫자로 추정할 수 있습니다: (렌즈 가로 × 2) + 브릿지 + 약 6-10mm." },
    ],
    englishEquivalent: null,
  },

  "/ko/shipping": {
    path: "/ko/shipping",
    eyebrow: "Woolet · 배송",
    h1: "한국 배송 안내",
    sub: "한국으로의 배송, 통관, 반품과 보증에 대한 안내입니다.",
    metaTitle: "한국 배송 안내 — 통관·반품·보증 | Woolet",
    metaDescription:
      "Woolet 안경의 한국 배송 안내. 무료 배송, 30일 반품, 2년 보증, 개인통관고유부호 안내. 비스포크는 주문 후 2주 발송.",
    sections: [
      {
        h2: "배송과 기간",
        body:
          "시그니처 007·009는 EU에서 발송됩니다. 비스포크는 그리스에서 손으로 제작하며 주문 후 2주면 발송합니다.",
        bullets: [
          { label: "배송비", value: "무료" },
          { label: "반품", value: "30일" },
          { label: "보증", value: "2년" },
        ],
      },
      {
        h2: "통관과 개인통관고유부호",
        body:
          "한국으로 배송되는 해외 직구 상품은 개인통관고유부호가 필요합니다. 수입 관세와 부가세는 통관 시점의 규정에 따라 부과될 수 있습니다.",
        callout: [
          "Woolet은 한국으로 도수 렌즈를 판매하지 않습니다.",
          "프레임(데모 렌즈 포함)과 도수 없는 선글라스만 배송합니다.",
        ],
      },
    ],
    faqs: [
      { q: "반품 기간은?", a: "수령 후 30일입니다." },
    ],
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
const FORBIDDEN = ["넓은 얼굴 안경", "밀리미터", "made in Italy", "이탈리아에서 제작", "원"];

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
    for (const cta of s.ctas ?? []) assertCopy(path, `section.cta (${s.h2})`, cta.label);
  }
  for (const f of cfg.faqs) {
    assertCopy(path, "faq.q", f.q);
    assertCopy(path, "faq.a", f.a);
  }

  const blob = JSON.stringify(cfg);
  for (const bad of FORBIDDEN.slice(0, 3)) {
    if (blob.includes(bad)) {
      throw new Error(`[ko] ${path} uses forbidden phrasing: "${bad}".`);
    }
  }
}

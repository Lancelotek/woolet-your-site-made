/**
 * Korean (ko) locale content — SINGLE SOURCE OF TRUTH for every /ko route.
 *
 * HARD RULE: there is NO English fallback for Korean routes. If a Korean
 * string is missing or empty, the assertion at the bottom of this file
 * throws at module load, which fails the build (prerender + sitemap both
 * import this module through src/seo/metadata.ts). This is deliberate:
 * the /ja locale once shipped a Japanese <title> above the English
 * homepage <h1>, and that must never happen on /ko.
 *
 * Slugs are ASCII only. Korean text lives in title / h1 / h2 / body.
 */

export type KoFaq = { q: string; a: string };

export type KoPageConfig = {
  /** Full pathname, ASCII only. */
  path: string;
  eyebrow: string;
  h1: string;
  sub: string;
  metaTitle: string;
  metaDescription: string;
  /** H2 + body blocks rendered in order. */
  sections: { h2: string; body: string; bullets?: { label: string; value: string }[] }[];
  faqs: KoFaq[];
  /** Absolute-path EN equivalent, or null when none exists yet. */
  englishEquivalent: string | null;
};

export const KO_HOME_PATH = "/ko";

export const koPages: Record<string, KoPageConfig> = {
  "/ko": {
    path: "/ko",
    eyebrow: "Woolet · 넓은 얼굴을 위한 아이웨어",
    h1: "대두 안경테 158mm",
    sub: "일반 안경테의 전면 폭은 135~145mm입니다. 얼굴 폭이 155mm를 넘으면 시중의 모든 안경은 사실상 'M 사이즈' 하나뿐입니다. Woolet은 이탈리아 Mazzucchelli 아세테이트를 EU에서 수작업으로 마감한 158mm 전면 폭 안경테를 만듭니다.",
    metaTitle: "대두 안경테 158mm | Woolet 이탈리아 아세테이트",
    metaDescription:
      "얼굴 폭 155mm 이상을 위한 대두 안경테. Woolet은 전면 폭 158mm, 키홀 브리지, 이탈리아 Mazzucchelli 아세테이트를 EU에서 수작업으로 마감합니다. 비스포크는 145~162mm.",
    sections: [
      {
        h2: "왜 시중 안경은 작게 느껴질까",
        body:
          "주요 브랜드의 전면 폭은 대부분 135~148mm입니다. 얼굴 폭이 150mm를 넘으면 관자놀이가 눌리고, 다리가 벌어지고, 코받침 자국이 남습니다. 얼굴이 큰 것이 아니라 업계가 평균 한 가지 치수만 만들기 때문입니다.",
        bullets: [
          { label: "전면 폭", value: "158 mm" },
          { label: "브리지", value: "20~21 mm 키홀" },
          { label: "다리 길이", value: "145~155 mm" },
          { label: "소재", value: "Mazzucchelli 1849 이탈리아 아세테이트" },
          { label: "제작", value: "EU 수작업" },
        ],
      },
      {
        h2: "두 가지 셰이프, 하나의 정확한 사이즈",
        body:
          "007은 라운드 판토, 009는 소프트 스퀘어입니다. 두 모델 모두 전면 폭 158mm로 얼굴 폭 155~161mm를 위해 설계되었습니다. 그 범위를 벗어난다면 145~162mm를 1mm 단위로 제작하는 비스포크를 권합니다.",
      },
    ],
    faqs: [
      {
        q: "내 얼굴 폭은 어떻게 재나요?",
        a: "관자놀이에서 관자놀이까지 가장 넓은 지점을 밀리미터로 측정합니다. 155mm 이상이면 Woolet 158mm가 맞습니다.",
      },
      {
        q: "158mm보다 더 큰 사이즈도 있나요?",
        a: "비스포크로 145~162mm까지 1mm 단위로 제작합니다.",
      },
    ],
    englishEquivalent: "/en",
  },

  "/ko/size/150mm": {
    path: "/ko/size/150mm",
    eyebrow: "Woolet · 사이즈 가이드",
    h1: "대두 안경테 150mm",
    sub: "전면 폭 150mm는 얼굴 폭 약 148~152mm에 맞습니다. Woolet 기성 모델은 158mm 한 가지이므로, 150mm가 필요하면 비스포크로 제작합니다.",
    metaTitle: "150mm 안경테 — 얼굴 폭 148~152mm | Woolet",
    metaDescription:
      "전면 폭 150mm 안경테가 맞는 얼굴 폭과 측정 방법. Woolet 비스포크는 145~162mm를 1mm 단위로, 이탈리아 아세테이트로 EU에서 수작업 제작합니다.",
    sections: [
      {
        h2: "150mm는 누구에게 맞나요",
        body:
          "관자놀이 사이 폭이 148~152mm인 얼굴입니다. 158mm 기성 모델은 다리가 바깥으로 벌어져 흘러내릴 수 있으므로, 이 구간은 비스포크 치수로 맞추는 편이 정확합니다.",
        bullets: [
          { label: "권장 얼굴 폭", value: "148~152 mm" },
          { label: "전면 폭", value: "150 mm" },
          { label: "비스포크 범위", value: "145~162 mm" },
        ],
      },
      {
        h2: "측정 순서",
        body:
          "거울 앞에서 자를 눈썹 바로 위에 대고, 왼쪽 관자놀이 끝에서 오른쪽 관자놀이 끝까지 밀리미터로 읽습니다. 두 번 측정해 평균을 냅니다.",
      },
    ],
    faqs: [
      { q: "150mm와 158mm 중 무엇을 골라야 하나요?", a: "얼굴 폭이 155mm 미만이면 150mm 비스포크, 155mm 이상이면 158mm 기성 모델입니다." },
    ],
    englishEquivalent: "/en/size/150mm",
  },

  "/ko/size/160mm": {
    path: "/ko/size/160mm",
    eyebrow: "Woolet · 사이즈 가이드",
    h1: "대두 안경테 160mm",
    sub: "전면 폭 160mm는 얼굴 폭 약 158~162mm에 맞습니다. Woolet 158mm 기성 모델이 가장 가까우며, 정확한 160mm는 비스포크로 제작합니다.",
    metaTitle: "160mm 안경테 — 얼굴 폭 158~162mm | Woolet",
    metaDescription:
      "전면 폭 160mm 안경테가 필요한 얼굴 폭과 선택 기준. Woolet 158mm 기성 모델과 145~162mm 비스포크를 비교합니다. 이탈리아 아세테이트, EU 수작업.",
    sections: [
      {
        h2: "160mm는 누구에게 맞나요",
        body:
          "관자놀이 사이 폭이 158~162mm인 얼굴입니다. 이 구간에서는 158mm 기성 모델도 무리 없이 착용되지만, 다리 압박이 전혀 없기를 원한다면 160mm 비스포크가 정확합니다.",
        bullets: [
          { label: "권장 얼굴 폭", value: "158~162 mm" },
          { label: "전면 폭", value: "160 mm" },
          { label: "기성 대안", value: "Woolet 007 / 009 — 158 mm" },
        ],
      },
      {
        h2: "158mm로 충분한 경우",
        body:
          "아세테이트는 열로 미세 조정이 가능합니다. 얼굴 폭 158~160mm라면 158mm 전면에 다리 각도만 조정해도 편안하게 맞는 경우가 많습니다.",
      },
    ],
    faqs: [
      { q: "160mm 기성 모델이 있나요?", a: "기성은 158mm 한 가지이며, 160mm는 비스포크로 제작합니다." },
    ],
    englishEquivalent: "/en/size/160mm",
  },

  "/ko/size/165mm": {
    path: "/ko/size/165mm",
    eyebrow: "Woolet · 사이즈 가이드",
    h1: "대두 안경테 165mm",
    sub: "전면 폭 165mm는 얼굴 폭 163mm 이상을 위한 치수입니다. 솔직히 말해, 현재 Woolet의 제작 범위는 145~162mm이므로 165mm는 제작하지 않습니다.",
    metaTitle: "165mm 안경테 — 초광폭 얼굴 가이드 | Woolet",
    metaDescription:
      "전면 폭 165mm가 필요한 얼굴 폭과 현실적인 선택지. Woolet의 제작 범위는 145~162mm이며 그 이상은 제작하지 않습니다. 측정 기준과 대안을 정리했습니다.",
    sections: [
      {
        h2: "165mm가 필요한 얼굴",
        body:
          "관자놀이 사이 폭이 163mm를 넘는 경우입니다. 전체 인구에서 매우 드문 구간이며, 대부분의 브랜드가 다루지 않습니다.",
        bullets: [
          { label: "권장 얼굴 폭", value: "163 mm 이상" },
          { label: "Woolet 제작 범위", value: "145~162 mm" },
        ],
      },
      {
        h2: "Woolet이 맞지 않는 경우",
        body:
          "얼굴 폭이 163mm를 넘는다면 Woolet 158mm도, 162mm 비스포크도 압박이 남습니다. 이 경우에는 구매를 권하지 않습니다. 먼저 정확히 측정하고, 162mm 이하라면 비스포크가 해답입니다.",
      },
    ],
    faqs: [
      { q: "162mm보다 넓게 제작할 수 있나요?", a: "현재는 불가능합니다. 제작 범위는 145~162mm입니다." },
    ],
    englishEquivalent: "/en/size/165mm",
  },

  "/ko/sunglasses": {
    path: "/ko/sunglasses",
    eyebrow: "Woolet · 선글라스",
    h1: "대두 선글라스 158mm",
    sub: "얼굴 폭 155mm 이상을 위한 선글라스. 전면 폭 158mm, 키홀 브리지, UV400 렌즈. 이탈리아 Mazzucchelli 아세테이트를 EU에서 수작업으로 마감합니다.",
    metaTitle: "대두 선글라스 158mm — UV400 | Woolet",
    metaDescription:
      "넓은 얼굴을 위한 158mm 선글라스. 키홀 브리지, UV400 렌즈, 이탈리아 Mazzucchelli 아세테이트, EU 수작업. 얼굴 폭 155~161mm에 맞습니다.",
    sections: [
      {
        h2: "선글라스는 오차가 더 크게 보인다",
        body:
          "렌즈 면적이 넓기 때문에 전면 폭이 부족하면 눈이 렌즈 안쪽으로 몰리고 관자놀이에 자국이 남습니다. 158mm 전면은 눈동자 중심을 렌즈 중앙에 맞춰 줍니다.",
        bullets: [
          { label: "전면 폭", value: "158 mm" },
          { label: "렌즈", value: "UV400" },
          { label: "브리지", value: "20~21 mm 키홀" },
        ],
      },
      {
        h2: "렌즈에 대한 솔직한 설명",
        body:
          "UV400은 자외선 차단 규격입니다. 블루라이트 코팅은 선택 옵션이며 의료기기가 아니고, 눈의 피로나 수면 개선을 약속하지 않습니다.",
      },
    ],
    faqs: [
      { q: "도수를 넣을 수 있나요?", a: "네, 도수 렌즈로 제작 가능합니다." },
    ],
    englishEquivalent: null,
  },

  "/ko/guide/frame-size": {
    path: "/ko/guide/frame-size",
    eyebrow: "Woolet · 가이드",
    h1: "안경 사이즈 재는 법",
    sub: "안경테 안쪽에 적힌 숫자와 내 얼굴 폭을 연결하는 방법. 자 하나와 30초면 충분합니다.",
    metaTitle: "안경 사이즈 재는 법 — 얼굴 폭과 프레임 숫자 | Woolet",
    metaDescription:
      "안경 다리 안쪽 숫자(렌즈 폭-브리지-다리 길이)를 읽는 법과 얼굴 폭 측정법. 전면 폭 계산식과 155mm 이상 얼굴을 위한 기준을 정리했습니다.",
    sections: [
      {
        h2: "다리 안쪽 숫자 읽기",
        body:
          "예를 들어 54–21–150은 렌즈 폭 54mm, 브리지 21mm, 다리 길이 150mm를 뜻합니다. 전면 폭은 대략 (렌즈 폭 × 2) + 브리지 + 힌지 여유입니다.",
        bullets: [
          { label: "렌즈 폭", value: "51~54 mm" },
          { label: "브리지", value: "20~21 mm" },
          { label: "다리 길이", value: "145~155 mm" },
        ],
      },
      {
        h2: "얼굴 폭 측정",
        body:
          "눈썹 바로 위, 왼쪽 관자놀이 끝에서 오른쪽 관자놀이 끝까지 밀리미터로 잽니다. 이 값이 전면 폭과 ±3mm 안에 들면 잘 맞는 크기입니다.",
      },
    ],
    faqs: [
      { q: "전면 폭이 얼굴 폭보다 좁으면?", a: "관자놀이가 눌리고 다리가 벌어집니다. 얼굴 폭 이상 또는 동일한 전면 폭을 고르세요." },
    ],
    englishEquivalent: null,
  },

  "/ko/brands": {
    path: "/ko/brands",
    eyebrow: "Woolet · 비교",
    h1: "대두 안경테 브랜드 비교",
    sub: "넓은 얼굴을 다루는 브랜드는 많지 않습니다. 전면 폭이라는 하나의 숫자로만 비교했습니다.",
    metaTitle: "대두 안경테 브랜드 비교 — 전면 폭 기준 | Woolet",
    metaDescription:
      "넓은 얼굴용 안경 브랜드를 전면 폭 기준으로 비교합니다. 대부분 135~148mm에 머무는 반면 Woolet은 158mm 기성과 145~162mm 비스포크를 제공합니다.",
    sections: [
      {
        h2: "비교 기준은 전면 폭 하나",
        body:
          "'라지', 'XL' 같은 표기는 브랜드마다 다릅니다. 유일하게 비교 가능한 숫자는 힌지에서 힌지까지의 전면 폭(mm)입니다.",
        bullets: [
          { label: "일반 브랜드", value: "135~148 mm" },
          { label: "Woolet 기성", value: "158 mm" },
          { label: "Woolet 비스포크", value: "145~162 mm" },
        ],
      },
      {
        h2: "선택 기준",
        body:
          "얼굴 폭을 먼저 재고, 그 숫자에 맞는 전면 폭을 제공하는 브랜드만 후보에 남기세요. 그러면 대부분의 선택지는 자동으로 정리됩니다.",
      },
    ],
    faqs: [
      { q: "전면 폭을 공개하지 않는 브랜드는?", a: "다리 안쪽 숫자로 추정할 수 있습니다: (렌즈 폭 × 2) + 브리지 + 약 6~10mm." },
    ],
    englishEquivalent: null,
  },

  "/ko/shipping": {
    path: "/ko/shipping",
    eyebrow: "Woolet · 배송",
    h1: "한국 배송 안내",
    sub: "한국으로의 배송, 소요 기간, 반품과 보증에 대한 안내입니다.",
    metaTitle: "한국 배송 안내 — 기간·반품·보증 | Woolet",
    metaDescription:
      "Woolet 안경의 한국 배송 안내. 무료 배송, 30일 반품, 2년 보증. 기성 모델과 145~162mm 비스포크의 제작 및 배송 기간을 정리했습니다.",
    sections: [
      {
        h2: "배송과 기간",
        body:
          "기성 모델은 EU에서 발송되며 통상 영업일 기준 배송됩니다. 비스포크는 1mm 단위로 제작하므로 제작 기간이 추가로 필요합니다.",
        bullets: [
          { label: "배송비", value: "무료" },
          { label: "반품", value: "30일" },
          { label: "보증", value: "2년" },
        ],
      },
      {
        h2: "관세와 세금",
        body:
          "수입 관세와 부가세는 도착 국가의 규정에 따라 부과될 수 있습니다. 정확한 금액은 통관 시점에 결정됩니다.",
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

for (const [path, cfg] of Object.entries(koPages)) {
  const required: [string, string][] = [
    ["h1", cfg.h1],
    ["sub", cfg.sub],
    ["metaTitle", cfg.metaTitle],
    ["metaDescription", cfg.metaDescription],
    ["eyebrow", cfg.eyebrow],
  ];
  for (const [field, value] of required) {
    if (!value || !value.trim()) {
      throw new Error(`[ko] Missing Korean copy: ${path} -> ${field}`);
    }
    if (!HANGUL.test(value)) {
      throw new Error(`[ko] ${path} -> ${field} contains no Korean text ("${value}"). English fallback is forbidden for /ko.`);
    }
  }
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
    if (!HANGUL.test(s.h2) || !HANGUL.test(s.body)) {
      throw new Error(`[ko] ${path} has a section without Korean copy.`);
    }
  }
}

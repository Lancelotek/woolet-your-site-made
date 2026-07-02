export type JaFaq = { q: string; a: string };

export type JaPageConfig = {
  slug: string;
  eyebrow: string;
  h1: string;
  sub: string;
  metaTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  problemH2: string;
  problemBody: string;
  proofH2: string;
  proofBody: string;
  proofBullets: { label: string; value: string }[];
  closingH2: string;
  closingBody: string;
  faqs: JaFaq[];
  englishEquivalent: string;
};

export const jaPages: Record<string, JaPageConfig> = {
  "big-face-glasses": {
    slug: "big-face-glasses",
    eyebrow: "Woolet · 大きい顔のためのメガネ",
    h1: "大きい顔のメガネ — 締めつけない、本当に合うフレーム",
    sub: "標準フレームの幅は135〜145mm。顔幅が155mm以上なら、市販のメガネは「Mサイズ」しか存在しません。Wooletは155・158・161mmの実寸で、イタリア製マッツケリ・アセテートを手作業で仕立てます。",
    metaTitle: "大きい顔 メガネ 155–161mm | Woolet 幅広イタリア製アセテート",
    metaDescription:
      "大きい顔・幅広い顔のためのメガネ。Wooletは155mm・158mm・161mmの実寸フレームをイタリア製マッツケリ・アセテートで手作り。FitLensスキャンで20秒、自分のサイズが分かります。",
    primaryKeyword: "大きい顔 メガネ",
    ctaPrimaryLabel: "顔幅を20秒で測る",
    ctaPrimaryHref: "/ja/fit",
    ctaSecondaryLabel: "コレクションを見る",
    ctaSecondaryHref: "/ja/collection",
    problemH2: "市販のメガネが小さく見える理由",
    problemBody:
      "Ray-Ban、Persol、Warby Parker — 主要ブランドのフロント幅はほぼ135〜148mm。顔幅150mm以上の人にとっては「すべてがMサイズ」です。だから返品が増え、こめかみが痛み、写真が不自然になる。あなたの顔が大きいのではなく、業界が一つの平均値しか作っていないだけです。",
    proofH2: "推測ではなく、ミリ単位で",
    proofBody:
      "Wooletは3つの実寸フロント幅を提供します。「ラージ」「XL」といった曖昧な呼称ではなく、155mm・158mm・161mm。テンプル長、ブリッジ幅も大きめ顔向けに再設計。素材はマッツケリ1849のイタリア製アセテート、すべてEUで手作業仕上げ。",
    proofBullets: [
      { label: "フロント幅", value: "155 / 158 / 161 mm" },
      { label: "ブリッジ幅", value: "21–22 mm キーホール" },
      { label: "素材", value: "Mazzucchelli 1849 イタリア製アセテート" },
      { label: "製造", value: "EU 手作業" },
    ],
    closingH2: "自分のサイズが分かれば、選び方は一瞬",
    closingBody:
      "FitLensはスマートフォンのカメラで顔幅をミリ単位で計測し、推奨サイズを返します。所要時間は20秒。Founding価格はキックスターター開始時にメールで通知します。",
    faqs: [
      {
        q: "自分の顔幅はどう測るの？",
        a: "FitLensを使ってください。スマートフォンのカメラで顔幅をミリ単位で測定し、155/158/161mmのどれが合うかを推奨します。所要時間は約20秒、ブラウザ内で完結します。",
      },
      {
        q: "顔幅が何mmからWooletが向いている？",
        a: "標準フレームは135〜145mmで終わります。顔幅が約150mm以上ある場合、市販のメガネは合いません。そこからがWooletの守備範囲です。",
      },
      {
        q: "度付きレンズは入れられますか？",
        a: "はい。すべてのフレームは単焦点・累進両対応のレンズ加工が可能です。",
      },
      {
        q: "材質は何ですか？",
        a: "イタリア・マッツケリ1849のアセテート。EUで職人が手作業で仕上げています。",
      },
      {
        q: "いつ買えますか？",
        a: "Kickstarterで先行販売を開始します。VIPリストに登録すると、Founding価格を一般公開前にご案内します。",
      },
    ],
    englishEquivalent: "/en/collections/glasses-for-big-heads",
  },
  bespoke: {
    slug: "bespoke",
    eyebrow: "Woolet · オーダーメイド メガネ",
    h1: "オーダーメイド メガネ — 顔に合わせて作る、本当の一本",
    sub: "顔幅150〜165mmまでミリ単位で対応。ブリッジ幅、テンプル長、レンズ高さも個別調整。イタリア製マッツケリ・アセテートを使い、EUの職人が一本ずつ手作業で仕立てます。",
    metaTitle: "オーダーメイド メガネ 150–165mm | Woolet イタリア製アセテート",
    metaDescription:
      "オーダーメイド メガネを150〜165mmまでミリ単位で。Wooletはイタリア製マッツケリ・アセテートを使い、フロント幅・ブリッジ・テンプル長を個別調整。FitLensで顔を測り、職人がEUで手作業仕上げ。",
    primaryKeyword: "オーダーメイド メガネ",
    ctaPrimaryLabel: "FitLensで顔を測る",
    ctaPrimaryHref: "/ja/fit",
    ctaSecondaryLabel: "コンフィギュレーターを開く",
    ctaSecondaryHref: "/en/bespoke/configurator",
    problemH2: "「カスタム」と「オーダーメイド」は違います",
    problemBody:
      "多くの「カスタム」サービスは既製のフレームに色を選ぶだけ。Wooletのbespokeは違います。フロント幅、ブリッジ幅、テンプル長、レンズ高さをそれぞれミリ単位で指定可能。あなたの顔に合わせて木型から仕立て直します。",
    proofH2: "イタリア製アセテートを職人の手で",
    proofBody:
      "素材はマッツケリ1849のアセテート。70年以上の歴史を持つイタリア素材です。EUの工房で職人が削り、磨き、ヒンジを埋め込みます。納期は約4〜6週間。",
    proofBullets: [
      { label: "対応サイズ", value: "150 – 165 mm" },
      { label: "カスタマイズ", value: "幅 / ブリッジ / テンプル / 高さ" },
      { label: "素材", value: "Mazzucchelli 1849 アセテート" },
      { label: "納期", value: "4 – 6 週間 (EU手作業)" },
    ],
    closingH2: "標準サイズで諦めない",
    closingBody:
      "顔の写真を撮るだけで、必要な寸法が出ます。配色や形状はオンラインのコンフィギュレーターで決定。最終確認後に製造を開始します。",
    faqs: [
      {
        q: "どこまでサイズを調整できますか？",
        a: "フロント幅は150〜165mm、ブリッジは18〜24mm、テンプルは135〜155mmまで指定可能です。レンズ高さも調整できます。",
      },
      {
        q: "どうやって採寸しますか？",
        a: "FitLensでスマホのカメラから顔幅をミリ単位で計測します。スキャン結果はそのままコンフィギュレーターに連携されます。",
      },
      {
        q: "納期はどれくらい？",
        a: "発注確定からおおむね4〜6週間。EUの工房ですべて手作業で仕上げます。",
      },
      {
        q: "返品はできますか？",
        a: "オーダーメイドのため返品は受けられませんが、サイズ不適合の場合はフィット保証で再製作いたします。",
      },
      {
        q: "価格はいくらですか？",
        a: "Founding価格は事前登録者限定でメール案内します。標準価格より40%お得です。",
      },
    ],
    englishEquivalent: "/en/bespoke",
  },
};

export const jaPageOrder = ["big-face-glasses", "bespoke"] as const;

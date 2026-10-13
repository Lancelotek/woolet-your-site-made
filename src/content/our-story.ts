export const STORY_TITLE = "Woolet Story: From Smart Wallets to Glasses for Wide Faces";
export const STORY_DESCRIPTION = "Woolet started in 2015 with a smart wallet backed by 2,627 people on Kickstarter. Today we make 158 mm glasses for wide faces. Here is why.";
export const STORY_H1 = "Woolet started with a wallet. Now we make glasses for wide faces.";
export const STORY_CTA = "JOIN THE LIST - 40% OFF";
export const STORY_FIT_LINK = "Not sure about your size? Measure your face width in 60 seconds →";
export const STORY_SIGNATURE = "Marek Cieśla, founder";

export const STORY_PHOTOS = {
  collection: { file: "woolet-smart-wallet-2015-collection", width: 1200, height: 902, alt: "The original Woolet smart wallet collection from the 2015 Kickstarter campaign: slim leather wallets, phone sleeves and key fobs" },
  desk: { file: "woolet-smart-wallet-2015-desk", width: 1200, height: 799, alt: "Woolet smart wallet in brown leather next to an iPhone, glasses and a watch, 2015" },
  slim: { file: "woolet-smart-wallet-2015-slim-vs-standard", width: 1200, height: 796, alt: "A bulky standard wallet next to the slim Woolet smart wallet" },
  workshop: { file: "woolet-smart-wallet-2015-workshop", width: 1200, height: 675, alt: "Cutting leather for Woolet smart wallets in the workshop, 2015" },
  dog: { file: "woolet-smart-wallet-2015-dog", width: 1200, height: 748, alt: "A dog carrying a black Woolet smart wallet" },
} as const;

function photo(key: keyof typeof STORY_PHOTOS, caption?: string) {
  const image = STORY_PHOTOS[key];
  return `<figure><picture><source type="image/webp" srcset="/images/${image.file}.webp"><img src="/images/${image.file}.jpg" alt="${image.alt}" width="${image.width}" height="${image.height}" loading="${key === "collection" ? "eager" : "lazy"}" ${key === "collection" ? 'fetchpriority="high"' : 'decoding="async"'}></picture>${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;
}

// One exact editorial source for the visible page and no-JS crawler article.
export const STORY_HTML = `<header class="story-opening">
<h1>Woolet started with a <em>wallet.</em> Now we make glasses for wide faces.</h1>
<p class="story-intro">Every Woolet product starts with a problem I can't ignore.</p>
</header>
${photo("collection")}
<section class="story-chapter">
<h2>Chapter one: a wallet for people who <em>forget</em></h2>
<p>In 2015, my friend Teodor kept losing his wallet. So we built one he couldn't leave behind - a smart wallet that warned you before it was gone. On Kickstarter, 2,627 backers pledged $332,694.</p>
${photo("desk")}
<p>Our first factory was in Gdańsk, Poland. Costs pushed production to China. For years, Woolet wallets shipped worldwide - from Saudi Arabia to the United States and Australia.</p>
<div class="story-photo-row">${photo("slim", "Slim by design.")}${photo("workshop", "Hand-finished leather.")}${photo("dog", "Built to be found.")}</div>
</section>
<section class="story-chapter">
<h2>What <em>changed</em></h2>
<p>Then phones became wallets, and AirTags made tracking a built-in feature. The problem we solved got solved by the platforms. We closed that chapter.</p>
</section>
<section class="story-chapter">
<h2>Chapter two: my own <em>face</em></h2>
<figure><img src="/images/founder-portrait-1.webp" alt="Marek Cieśla, founder of Woolet, wearing Woolet glasses for wide faces" width="1600" height="893" loading="lazy" decoding="async"></figure>
<p>I have a wide face. For years I searched for glasses that weren't sporty. Oakleys run wide, but they're plastic and look it. I needed frames wide enough to stop squeezing my temples - and wide enough to make my head look smaller, not bigger.</p>
<p>I grew a beard to stretch my face visually. In standard frames I still looked like a Russian bear on a kid's bike. The frames made my face bigger.</p>
<p>Then I noticed how many of my friends had the same problem.</p>
</section>
<section class="story-chapter">
<h2>158 <em>mm</em></h2>
<p>I designed our first frames with a small family workshop in Bielsko-Biała, Poland - four people, Italian acetate. I chose a front width you won't find at a regular optician: 158 mm. It hit the bullseye.</p>
</section>
<section class="story-chapter">
<h2>Same backers, new <em>problem</em></h2>
<p>The people who backed the wallet are getting ready to back the glasses. Woolet launches on Kickstarter on October 29.</p>
</section>`;

export const STORY_CRAWLER_HTML = `<article>${STORY_HTML}<div><a href="/en/lp/kickstarter">${STORY_CTA}</a><p><a href="/en/fit">${STORY_FIT_LINK}</a></p></div><p>${STORY_SIGNATURE}</p></article>`;

export const STORY_JSONLD = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": "https://woolet.co/en/our-story#webpage",
  name: STORY_TITLE,
  description: STORY_DESCRIPTION,
  url: "https://woolet.co/en/our-story",
  inLanguage: "en",
  mainEntity: { "@id": "https://woolet.co/#organization" },
};
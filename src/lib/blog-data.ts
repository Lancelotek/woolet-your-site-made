import type { Lang } from "./i18n";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: number;
  tags: string[];
  /** Optional override for the social preview image. Falls back to /og-[slug].png. */
  image?: string;
  /** Optional FAQ items — emitted as FAQPage JSON-LD on the post page. */
  faq?: { q: string; a: string }[];
  /** Optional HowTo structured data — emitted as HowTo JSON-LD on the post page. */
  howTo?: {
    name: string;
    description: string;
    totalTime?: string; // ISO 8601 duration, e.g. "PT2M"
    supply?: string[];
    tool?: string[];
    step: { name: string; text: string }[];
  };
}

const blogPostsEN: BlogPost[] = [
  {
    slug: "glasses-for-wide-faces-guide",
    title: "Glasses for Wide Faces: The Complete 2026 Fit Guide",
    excerpt: "Can't find glasses that fit a wide face? Learn how to measure, what frame width to look for (155 mm+), and which styles actually work. An honest 2026 guide.",
    date: "2026-03-09",
    readTime: 14,
    tags: ["Guide", "Wide Face", "2026"],
    content: `
<div style="display:flex;align-items:center;gap:14px;padding:16px 0;border-top:1px solid #E8E4DC;border-bottom:1px solid #E8E4DC;margin-bottom:28px;font-family:'Barlow',sans-serif;">
  <div style="flex-shrink:0;width:44px;height:44px;border-radius:50%;background:#0f0f0f;color:#c9a84c;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;letter-spacing:0.5px;">MC</div>
  <div style="flex:1;min-width:0;">
    <div style="font-size:14px;font-weight:600;color:#1a1a1a;line-height:1.3;">Marek Cieśla</div>
    <div style="font-size:12px;color:#666;line-height:1.5;margin-top:2px;">Founder, Woolet Eyewear · Serial entrepreneur · <a href="https://www.linkedin.com/in/marekciesla/" target="_blank" rel="noopener" style="color:#c9a84c;text-decoration:none;">LinkedIn</a></div>
    <div style="font-size:11px;color:#999;letter-spacing:1.5px;text-transform:uppercase;margin-top:6px;">Published: 9 March 2026 · Last updated: 24 August 2026</div>
  </div>
</div>

<p style="font-size:18px;line-height:1.7;color:#1a1a1a;background:#F8F6F1;border-left:3px solid #c9a84c;padding:20px 24px;margin:0 0 28px;border-radius:4px;"><strong>A wide face measures 150 mm or more temple-to-temple, and it needs glasses with a total front width of 155 mm or more.</strong> Most frames sold as "wide" or "oversized" stop at 138–148 mm, which is why they still pinch after an hour. Buy to front width, not to lens size or style: 150–154 mm faces fit a 152–156 mm front, 155–159 mm faces need 157–160 mm, and 160 mm+ faces need 161 mm or bespoke up to 162 mm.</p>

<p>The short version if you are here from a search for wide-face frames or <a href="/en/collections/glasses-for-big-heads" style="color:#A07A2A;">glasses for big heads</a>: measure your temple-to-temple width with a ruler or your phone, add 2–5 mm, and shop only frames that publish a total front width in that range. Woolet 007 (round) and 009 (soft square) both run a 158 mm front with a 21–22 mm keyhole bridge — see the <a href="/en/collections/wide-face-glasses" style="color:#A07A2A;">wide-face collection</a> or jump to the <a href="#size-chart" style="color:#A07A2A;">size chart below</a>.</p>

<p>Whether you call it a wide face, a big head, or a large head, the problem is identical: standard frames stop at 138–148 mm, and you need 155 mm+ to stop the pinch. This guide covers both terms — the measurement, the size chart, and what to buy next.</p>


<h2>How to know if your face is wide</h2>

<p>The 30-second check: stand square to a mirror, look straight ahead, and hold a ruler flat and level across the widest part of your head — just above and in front of the ears, not across the cheeks. Read the millimetres temple to temple. Under 140 mm is average. 140–149 mm is large-average. 150 mm and above is a wide face. 155 mm and above is where the mainstream market has nothing for you at all.</p>

<p>Two secondary signals confirm it without a ruler. First, the imprint test: take your current glasses off after four hours and look for a red line in front of each ear. That mark means the arms are gripping rather than resting, which happens when the front is too narrow. Second, the centring test: photograph yourself straight on wearing your glasses. If your pupils sit noticeably inboard of the lens centres, the frame is too wide; if the frame edges stop short of the sides of your face, it is too narrow.</p>

<p>The full calibrated method — including the credit-card reference for photographing rather than measuring — is in <a href="/en/blog/how-to-measure-face-width-for-glasses" style="color:#A07A2A;">how to measure your face width for glasses</a>. If you would rather not measure at all, <a href="/en/fit" style="color:#A07A2A;"><strong>FitLens takes about 20 seconds from your phone camera</strong></a>, no app and no appointment, and returns face width and bridge width together.</p>

<h2 id="size-chart">The number that matters: front width</h2>

<p>Almost every sizing mistake in eyewear comes from shopping by the wrong number. The three digits printed inside the temple — 52▫16 145 — are lens width, bridge and temple length. None of them is the total front width, and total front width is the only measurement that decides whether a frame fits a wide face. A 58 mm lens on a narrow bridge can still produce a 142 mm front.</p>

<table style="width:100%;border-collapse:collapse;font-size:14px;margin:20px 0;">
  <thead><tr style="background:#F8F6F1;"><th style="text-align:left;padding:10px 12px;border-bottom:1px solid #E8E4DC;">Your face width</th><th style="text-align:left;padding:10px 12px;border-bottom:1px solid #E8E4DC;">Front width to buy</th><th style="text-align:left;padding:10px 12px;border-bottom:1px solid #E8E4DC;">Where to buy it</th></tr></thead>
  <tbody>
    <tr><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">Under 140 mm</td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">135–142 mm</td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">Any mainstream retailer. Nothing here applies to you.</td></tr>
    <tr><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">140–154 mm</td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">142–154 mm</td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">Extended-fit lines, or Woolet bespoke from 145 mm. Signature 158 mm is too wide.</td></tr>
    <tr><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;"><strong>155–161 mm</strong></td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;"><strong>158 mm</strong></td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">The Woolet signature range. <a href="/en/products/007" style="color:#A07A2A;">007 Round</a> or <a href="/en/products/009" style="color:#A07A2A;">009 Soft-Square</a>, both cut at 158 mm.</td></tr>
    <tr><td style="padding:10px 12px;">162 mm and above</td><td style="padding:10px 12px;">162 mm max</td><td style="padding:10px 12px;">Bespoke only, to 162 mm. Above that we do not build — a made-to-order metal frame is the honest answer.</td></tr>
  </tbody>
</table>

<p>Bespoke covers the full 145–162 mm span in four shapes and sixty colour and size combinations, which exists precisely because the two bands either side of 155–161 mm are the ones nobody serves. Sizing pages for individual widths are here: <a href="/en/size/150mm" style="color:#A07A2A;">150 mm</a>, <a href="/en/size/155mm" style="color:#A07A2A;">155 mm</a>, <a href="/en/size/158mm" style="color:#A07A2A;">158 mm</a>, <a href="/en/size/160mm" style="color:#A07A2A;">160 mm</a>, <a href="/en/size/162mm" style="color:#A07A2A;">162 mm</a>.</p>

<h2>What the market actually offers</h2>

<p>Here is the market for glasses frames for wide faces, measured rather than described. Widest front width is as listed by each brand on its own widest model; where a brand publishes lens and bridge only, the front width is the sum of lens, bridge and rim allowance.</p>

<table style="width:100%;border-collapse:collapse;font-size:14px;margin:20px 0;">
  <thead><tr style="background:#F8F6F1;"><th style="text-align:left;padding:10px 12px;border-bottom:1px solid #E8E4DC;">Brand</th><th style="text-align:left;padding:10px 12px;border-bottom:1px solid #E8E4DC;">Widest front</th><th style="text-align:left;padding:10px 12px;border-bottom:1px solid #E8E4DC;">Material</th><th style="text-align:left;padding:10px 12px;border-bottom:1px solid #E8E4DC;">Prescription</th></tr></thead>
  <tbody>
    <tr><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">Zenni Extended Fit</td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">~145 mm</td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">TR90, mixed plastic</td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">Yes</td></tr>
    <tr><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">Warby Parker Wide</td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">~145 mm</td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">Cellulose acetate</td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">Yes</td></tr>
    <tr><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">EyeBuyDirect (wide filter)</td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">~146 mm</td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">TR90, acetate, metal</td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">Yes</td></tr>
    <tr><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">Eyeshells</td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">~150 mm</td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">Acetate</td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">Yes</td></tr>
    <tr><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">Fatheadz</td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">~152 mm</td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">Plastic, metal</td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">Yes</td></tr>
    <tr style="background:#FBF7EE;"><td style="padding:10px 12px;"><strong>Woolet</strong></td><td style="padding:10px 12px;"><strong>158 mm signature · 162 mm bespoke</strong></td><td style="padding:10px 12px;">Mazzucchelli acetate from Milan, hand made in EU</td><td style="padding:10px 12px;">Yes — single-vision, bifocal, progressive</td></tr>
  </tbody>
</table>

<p>The pattern is consistent. The volume retailers treat wide as a filter inside a general catalogue and stop between 145 and 148 mm, because that is where their existing tooling ends. The specialists get to 150–152 mm and mostly build in plastic, because plastic is cheap to mould at unusual sizes. Nobody in the mainstream tools a front at 158 mm, which is the width a 155–161 mm face needs. That gap is the entire reason this brand exists.</p>

<p>For prescription glasses for wide faces specifically, the constraint is not just the front. Progressive lenses need fitting height, which means a lens depth of at least 40 mm and a bridge that holds the frame at a stable height on the nose — a 21–22 mm keyhole or saddle rather than the 18 mm most wide frames still ship with.</p>

<h2>Shapes that work at 155 mm+</h2>

<p>At mainstream widths, shape is a style question. At 155 mm and above it is a structural one, because the frame has to hold tension across a longer span. Two shapes reliably work. A soft-square holds its line on a fuller face and pairs with a flatter top edge that follows the brow — the reasoning behind the 009. A round with a keyhole bridge softens a strong jaw and carries weight higher on the nose, which is the 007. Both are cut at 158 mm.</p>

<p>What does not work at this width is anything without a full acetate rim. Rimless and semi-rimless constructions have nothing holding alignment across a 158 mm span, and they drift within weeks. Narrow rectangles fail differently: they emphasise horizontal width without covering it, which produces the strip effect across the face.</p>

<p>The shape comparison in detail, including which suits glasses for wide faces male versus female proportions — the difference is brow height and lens depth, not width — is covered in <a href="/en/blog/round-vs-square-glasses-wide-face" style="color:#A07A2A;">round vs square glasses for a wide face</a>.</p>

<h2>What to skip</h2>

<p><strong>Skip frames that publish no total front width.</strong> If a product page lists 54▫18 145 and calls itself wide, it is 140 mm and it is not wide.</p>

<p><strong>Skip the adjustment promise.</strong> An optician can heat and bend temple arms, change wrap angle and move nose pads. Nobody can widen a moulded front. If the front is 6 mm short, no adjustment recovers it and the frame will take a permanent set outward within months.</p>

<p><strong>Skip spring hinges as a fix.</strong> A spring hinge masks a too-narrow front by adding outward tension, which is precisely the force that produces temple pain. On a wide face they make the symptom worse while feeling better in the shop.</p>

<p><strong>Skip TR90 and injection-moulded nylon above 155 mm.</strong> The material flexes under the leverage a long front generates, and the fit drifts. See <a href="/en/blog/acetate-vs-tr90-glasses" style="color:#A07A2A;">acetate vs TR90</a> for the comparison.</p>

<p><strong>Skip buying by lens diameter.</strong> A large round lens creates the impression of a wide frame and shares none of the width with your temples.</p>

<p>You already know the problem. You've walked into an optical store, tried on frame after frame, and felt the creeping frustration as every single pair pinches your temples before it even reaches your ears. You've ordered online, hoped for the best, and returned the glasses three times. You've been told to "try metal frames" or to "maybe go custom" — as if finding glasses that simply fit should require a bespoke tailor.</p>

<p>It shouldn't. And the rest of this guide is here to fix that.</p>


<div style="background:#F8F6F1;border-left:3px solid #c9a84c;padding:18px 22px;margin:24px 0;border-radius:4px;">
  <div style="font-family:'Barlow',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#888;margin-bottom:10px;">Definition</div>
  <p style="margin:0;font-size:15px;line-height:1.65;color:#1a1a1a;">A wide face in eyewear terms means a face width above 145 mm measured temple-to-temple. Standard eyewear frames top out at 140–145 mm. At that point, frames pinch at the temples, bow at the arms, and sit off-center on the face. Woolet frames start at 158 mm — built for the faces that standard sizing cannot accommodate.</p>
</div>

<p>Wide faces — defined as faces measuring <strong>155mm or more</strong> from temple to temple — represent a significant portion of the population. The problem isn't your face. The problem is that the eyewear industry was designed around a bell curve that cuts off precisely where you begin.</p>

<div style="background:#0f0f0f;color:#f0ece4;padding:26px 28px;margin:28px 0;border-radius:6px;font-family:'Barlow',sans-serif;">
  <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;margin-bottom:16px;font-weight:500;">By the numbers</div>
  <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:14px;">
    <li style="font-size:14px;line-height:1.65;color:#f0ece4;padding-left:18px;border-left:2px solid #c9a84c;">The average adult male face measures <strong style="color:#fff;">141.9 mm in width</strong> (±5.1 mm standard deviation), per peer-reviewed anthropometric research published in the <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4496583/" target="_blank" rel="noopener" style="color:#c9a84c;text-decoration:underline;">Cleft Palate and Craniofacial Journal</a> (PMC4496583, Gordon et al.).</li>
    <li style="font-size:14px;line-height:1.65;color:#f0ece4;padding-left:18px;border-left:2px solid #c9a84c;">Standard adult eyewear frames range from <strong style="color:#fff;">125–145 mm in total width</strong>, as defined by the <a href="https://www.iso.org/standard/31811.html" target="_blank" rel="noopener" style="color:#c9a84c;text-decoration:underline;">ISO 8624</a> spectacle frame measuring system. Woolet starts at 158 mm — <strong style="color:#fff;">13 mm beyond</strong> where the mainstream market ends.</li>
    <li style="font-size:14px;line-height:1.65;color:#f0ece4;padding-left:18px;border-left:2px solid #c9a84c;">Face widths between <strong style="color:#fff;">131–165 mm</strong> have been recorded in anthropometric studies of adult populations (<a href="https://apps.dtic.mil/sti/tr/pdf/ADA611869.pdf" target="_blank" rel="noopener" style="color:#c9a84c;text-decoration:underline;">ANSUR II, US Army, 2012</a>).</li>
  </ul>
</div>

<p>In this guide, you'll learn exactly how to measure your face width, understand frame sizing, find frames that genuinely fit 155mm+ faces, and discover what separates a $30 plastic frame from a premium Italian acetate designed to last a decade.</p>

<figure>
<img src="/__l5e/assets-v1/32dc41d3-9028-48b5-b614-f465ea2e9477/wide-face-fit-comparison.png" alt="Glasses for wide faces: visual comparison showing how standard 140 mm frames pinch temples on a wide face while 158 mm extra-wide frames sit flush and comfortable at 155 mm+ face width" loading="lazy" />
<figcaption>The difference is in the fit. Standard 140mm frames (left) pinch the temples; Woolet 158mm frames (right) sit flush. Engineered for wide faces, 155mm+.</figcaption>
</figure>

<h2>What Is a "Wide Face" in Eyewear Terms?</h2>

<p>In the eyewear industry, "wide" is one of the most misused terms on the market. Warby Parker, Zenni, and EyeBuyDirect all offer "wide" frames. But their "wide" typically means 138–148mm — a measurement that's still too narrow for a genuinely broad face.</p>

<p>Here's the actual size breakdown:</p>

<ul>
<li><strong>130–137mm</strong> — Standard. Virtually all mainstream brands work.</li>
<li><strong>138–144mm</strong> — Wide. Warby Parker Wide, Zenni Extended Fit.</li>
<li><strong>145–154mm</strong> — Extra-Wide. EyeBuyDirect Large, Fatheadz.</li>
<li><strong>155mm+</strong> — XL / Specialty Wide. Woolet (158mm), BXL Eyewear, Faded Days.</li>
</ul>

<p>If your face measures 155mm or more, mainstream "wide" frames are still too small. You need frames engineered specifically for this range — with wider fronts, longer temples, and proportionally scaled bridges.</p>

<h2>How to Measure Your Face Width for Glasses</h2>

<p>Before you buy a single frame, you need one number: your face width.</p>

<p><strong>You'll need:</strong> A flexible measuring tape or a ruler (in millimeters), and a mirror.</p>

<p><strong>Step 1:</strong> Stand in front of a mirror in good lighting.</p>
<p><strong>Step 2:</strong> Hold your ruler or measuring tape horizontally, just below eye level, level with your cheekbones.</p>
<p><strong>Step 3:</strong> Measure from the outermost edge of your left temple to the outermost edge of your right temple.</p>
<p><strong>Step 4:</strong> Note this measurement in millimeters. This is your face width.</p>

<p><strong>What the number means:</strong></p>
<ul>
<li><strong>Under 138mm</strong> → Standard frames work for you</li>
<li><strong>138–148mm</strong> → Look for "wide" or "extended fit" options</li>
<li><strong>149–154mm</strong> → Seek "extra-wide" specialist brands</li>
<li><strong>155mm+</strong> → You need XL specialty eyewear like Woolet</li>
</ul>

<p><strong>Pro tip:</strong> If you wear hats, your hat size is a reliable shortcut. A hat size of 7½ (US) or 60cm circumference typically corresponds to a face width of approximately 155–158mm.</p>

<h2>Understanding Frame Measurements: The Three Numbers on Every Pair of Glasses</h2>

<p>Every pair of glasses comes with three measurements stamped on the inside of the temple arm, usually looking something like: <strong>52▢16—145</strong></p>

<h3>52 — Lens Width</h3>
<p>The horizontal width of each individual lens, measured in millimeters. For wide faces, you generally need 52mm or above. Woolet's frames use 52mm lens width on the 007 and 54mm on the 009.</p>

<h3>16 — Bridge Width</h3>
<p>The distance between the two lenses, measured across the nose bridge. Wider faces often benefit from a wider bridge (17–19mm) to prevent the frames from sitting too high or pinching the nose.</p>

<h3>145 — Temple Length</h3>
<p>The length of the arm from hinge to tip; standard temples run 140–145 mm, and wider faces generally need 148–150 mm. If the arms are the part that feels wrong, read the full breakdown of <a href="/en/temple/150mm" style="color:#A07A2A;">150 mm arms and wide temples</a>.</p>

<p><strong>Total frame width</strong> = Lens Width × 2 + Bridge Width + hinge allowance (~10mm per side)</p>

<p>For a frame measuring 52-16-145: total width ≈ 52+52+16+20 = 140mm — still too narrow for a 155mm+ face.</p>

<p>Woolet's 158mm total width accommodates faces measuring 155mm and above without the temple pressure that causes the headaches, indentations, and end-of-day pain most wide-faced professionals know well.</p>

<h2>Why Most "Wide" Glasses Still Don't Fit Wide Faces</h2>

<p>This is the industry's dirty secret: almost every brand that offers a "wide" category has defined "wide" based on what their existing manufacturing can accommodate, not what wide-faced customers actually need.</p>

<p>Warby Parker's Extra Wide frames max out at approximately 148mm. That's only 7mm wider than their standard frames. For someone with a 160mm face, it's still a compression device.</p>

<p>The reasons are partly economic. Designing, tooling, and stocking frames in genuine XL widths (155mm+) requires separate molds, additional SKUs, and smaller production runs — which reduces margins for high-volume DTC brands built on efficiency.</p>

<p>The result is a market where the majority of "wide" options are:</p>
<ul>
<li>Budget-oriented plastic frames with limited style options</li>
<li>Sporty/athletic designs that look out of place in professional settings</li>
<li>Genuine specialty brands that skew heavily casual or lack premium materials</li>
</ul>

<p>This is the gap Woolet was built to fill.</p>

<h2>The 5 Most Common Fit Problems for Wide Faces</h2>

<h3>1. Temple Pressure and Headaches</h3>
<p>The most common complaint. When frames are too narrow, the temples press against the sides of the skull with constant, low-grade force. After an hour or two, this becomes a persistent headache. After a full workday, it becomes intolerable.</p>

<h3>2. Frames Riding Up the Nose</h3>
<p>When a frame is too narrow, it bows outward at the front, causing the nose pads or bridge to press upward. This creates red marks on the nose bridge and causes the frames to sit too high on the face.</p>

<h3>3. Eyes Not Centered in the Lenses</h3>
<p>Properly fitted glasses should position your pupils at the optical center of each lens. When frames are too narrow, your eyes end up toward the outer edge of each lens, degrading optical performance and causing eye strain.</p>

<h3>4. The "Clownish" Effect</h3>
<p>Frames that are too small for a face create a visual imbalance — the face appears wider than the glasses, creating an unflattering, disproportionate look. A 155mm+ face needs a frame of proportional width to appear balanced.</p>

<h3>5. Constant Adjustment</h3>
<p>Narrow frames on wide faces don't stay put. They slide, tilt, and require constant adjustment — especially during active movement. This is the body's mechanical response to an object under tension.</p>

<h2>Best Glasses for Wide Faces: What to Look For</h2>

<p>When evaluating frames for a 155mm+ face, apply this checklist:</p>

<p><strong>✓ Total frame width: 155mm minimum</strong></p>
<p>This is non-negotiable. Anything below 155mm will compress your temples. Look for the total width specification in the product details, not just the lens width.</p>

<p><strong>✓ Temple length: 148mm or longer</strong></p>
<p>Standard temples are 140–145mm. Longer temples reach further around the head, distributing pressure across a wider arc and reducing pinching at the skull.</p>

<p><strong>✓ Bridge width: 17–20mm for wider noses</strong></p>
<p>A proportional bridge keeps the frame centered on the face. Narrow bridges on wide faces cause the lenses to crowd toward the center, creating the "tiny glasses" effect.</p>

<p><strong>✓ Material: Acetate over plastic for durability and comfort</strong></p>
<p>Italian acetate maintains structural integrity at wider spans (155mm+) without warping or flexing excessively. Cheap injection-molded plastic loses its shape faster, meaning the frame that fit you at purchase may not fit you three months later.</p>

<p><strong>✓ Spring hinges for long-term comfort</strong></p>
<p>Spring hinges add flex at the hinge point, accommodating minor variation in head width and preventing the hinge from becoming a secondary pressure point. Essential for all-day wear.</p>

<h2>Frame Shapes for Wide Faces: A Style Guide</h2>

<h3>Rectangle and Square Frames</h3>
<p>The most versatile choice for wide faces. The horizontal emphasis of rectangular frames echoes the face's natural proportions, while the structured corners add definition. Woolet's 009 model — a bold square wayfarer at 158mm — is engineered precisely for this effect.</p>

<figure><img src="/images/woolet-009-square-glasses-wide-face.png" alt="Woolet 009 square acetate glasses for wide faces — 158mm frame width, Italian Mazzucchelli acetate, 54mm lens, tortoiseshell colorway, front and detail views" loading="lazy" style="width:100%;border-radius:6px;margin:0.5rem 0 1rem" /><figcaption style="font-size:0.7rem;opacity:0.5;text-align:center">Woolet 009 — Square frame, 158mm, Italian acetate</figcaption></figure>

<h3>Round Frames</h3>
<p>Soften angular or square face shapes. On a wide, rounded face, circular frames create visual harmony. The key is proportion: the circle must be large enough (52mm+ lens diameter) to avoid the "too small" effect. Woolet's 007 — a round keyhole frame at 158mm — maintains this balance.</p>

<figure><img src="/images/woolet-007-round-glasses-wide-face.png" alt="Woolet 007 round acetate glasses for wide faces — 158mm frame width, Italian Mazzucchelli acetate, 52mm lens, tortoiseshell, keyhole bridge detail" loading="lazy" style="width:100%;border-radius:6px;margin:0.5rem 0 1rem" /><figcaption style="font-size:0.7rem;opacity:0.5;text-align:center">Woolet 007 — Round frame, 158mm, Italian acetate</figcaption></figure>

<h3>Avoid: Narrow rectangular frames</h3>
<p>Narrow lenses on wide faces emphasize the face's breadth without providing visual counterbalance. The result is a face that looks disproportionately wide relative to the glasses.</p>

<h3>Avoid: Rimless or semi-rimless frames</h3>
<p>Without a solid frame providing visual structure, rimless styles on wide faces can look unanchored and fragile. Premium full-rim acetate frames provide the visual weight that wide faces need.</p>

<h2>Premium vs. Budget: Why Material Matters at 155mm+</h2>

<p>At standard widths (130–140mm), a budget plastic frame can be functional. The shorter span means less structural stress on the material. But at 155mm+, the physics change.</p>

<p>A 158mm acetate frame spans a significantly wider arc. Over time, budget plastic deforms under this span, meaning:</p>
<ul>
<li>The frame loses its shape and no longer fits the way it did at purchase</li>
<li>The temples begin to splay outward, reducing grip</li>
<li>The front bows, misaligning the optical centers</li>
</ul>

<p><strong>Italian acetate</strong> — the material used in Woolet's frames — is cut from solid cast sheets, not injection-molded. The <a href="/en/collections/italian-mazzucchelli-acetate">Mazzucchelli process</a> (the gold standard of acetate manufacturing since 1849) produces a material with:</p>
<ul>
<li><strong>Higher structural density:</strong> resists deformation under wider spans</li>
<li><strong>Natural flexibility:</strong> absorbs minor stress without cracking</li>
<li><strong>Dimensional stability:</strong> maintains its exact shape over years of wear</li>
<li><strong>Hypoallergenic properties:</strong> no skin reactions from extended temple contact</li>
</ul>

<p>For someone wearing glasses 10–12 hours a day, this isn't a luxury distinction. It's an engineering requirement.</p>

<p>Woolet frames are made from <a href="https://www.mazzucchelli1849.it/" target="_blank" rel="noopener"><strong>Mazzucchelli 1849</strong></a> cellulose acetate — sourced from a sixth-generation Italian family business founded near Milan in 1849. Mazzucchelli is the world's leading manufacturer of cellulose acetate for eyewear and supplies material to brands including Ray-Ban, Oliver Peoples, and DITA. Unlike the TR90 plastic used by most wide-face specialty brands, Mazzucchelli acetate is derived from cotton and wood pulp — not petroleum — and undergoes a weeks-long layering and curing process to achieve color depth and structural integrity. At 158 mm frame width, material rigidity is not a detail: acetate holds its shape at wider dimensions where TR90 loses tension at the temples over time.</p>

<h2>Where to Buy Glasses for Wide Faces Online</h2>

<p>Here's an honest overview of the current market:</p>

<h3>Woolet (woolet.co) — Best for: Premium 155mm+ prescription eyewear</h3>
<p>158mm total width. <a href="/en/collections/italian-mazzucchelli-acetate">Italian Mazzucchelli acetate</a>. Two models (007 round, 009 square). Designed exclusively for 155mm+ faces. Pre-launch with waitlist currently open.</p>

<h3>Faded Days Sunglasses — Best for: Wide-face casual sunglasses</h3>
<p>155–165mm range. Founder has a wide face himself. Good value, TR90 plastic, primarily casual/lifestyle. No prescription option.</p>

<h3>BXL Eyewear — Best for: Budget-to-mid prescription frames</h3>
<p>145–165mm range across categories. More affordable. Good option if budget is the priority, but lacks premium materials.</p>

<h3>SizeGlasses — Best for: Ultra-budget wide Rx frames</h3>
<p>140–165mm range with free standard lenses. Lowest price point. Functional, not fashionable.</p>

<h3>MOSCOT — Best for: Heritage acetate (with limitations)</h3>
<p>Offers "wide" frames but doesn't specify mm widths. New York heritage. Premium acetate. But their "wide" may still fall below 155mm — check individual frame specs before ordering.</p>

<h2>How Woolet compares to other wide-face eyewear brands</h2>
<style>
.woolet-compare{margin:24px 0;font-family:'Barlow',sans-serif;}
.woolet-compare__scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid #E8E4DC;border-radius:2px;}
.woolet-compare table{width:100%;border-collapse:collapse;font-size:13px;color:#16140f;background:#fff;}
.woolet-compare thead tr{background:#0f0f0f;color:#f0ece4;}
.woolet-compare th{padding:12px 14px;text-align:left;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;font-size:11px;white-space:nowrap;}
.woolet-compare td{padding:12px 14px;border-top:1px solid #E8E4DC;vertical-align:top;}
.woolet-compare tbody tr.is-featured{background:#FBF7EC;}
.woolet-compare tbody tr.is-featured td{font-weight:600;border-top-color:#E8DCB8;}
.woolet-compare tbody tr.is-featured td:first-child{box-shadow:inset 3px 0 0 #c9a84c;}
.woolet-compare__note{font-size:13px;color:#8a8275;margin:12px 2px 0;line-height:1.5;}
@media (max-width:640px){
  .woolet-compare__scroll{border:none;border-radius:0;overflow:visible;}
  .woolet-compare table,.woolet-compare thead,.woolet-compare tbody,.woolet-compare tr,.woolet-compare td{display:block;width:100%;}
  .woolet-compare thead{position:absolute;left:-9999px;}
  .woolet-compare tr{border:1px solid #E8E4DC;border-radius:2px;padding:14px 16px;margin-bottom:12px;background:#fff;}
  .woolet-compare tbody tr.is-featured{background:#FBF7EC;border-color:#E8DCB8;box-shadow:inset 3px 0 0 #c9a84c;}
  .woolet-compare tbody tr.is-featured td:first-child{box-shadow:none;}
  .woolet-compare td{padding:6px 0;border:none;display:flex;justify-content:space-between;align-items:baseline;gap:16px;font-size:14px;}
  .woolet-compare td:first-child{font-family:'Cormorant Garamond',Georgia,serif;font-size:20px;font-weight:500;padding-bottom:10px;margin-bottom:8px;border-bottom:1px solid #EFE9DF;display:block;}
  .woolet-compare td:not(:first-child)::before{content:attr(data-label);font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#8a8275;font-weight:500;flex:0 0 auto;}
  .woolet-compare td:not(:first-child){text-align:right;}
}
</style>
<div class="woolet-compare">
<div class="woolet-compare__scroll">
<table>
  <thead>
    <tr>
      <th>Brand</th>
      <th>Frame width</th>
      <th>Material</th>
      <th>Bridge</th>
      <th>Rx available</th>
      <th>Starting price</th>
    </tr>
  </thead>
  <tbody>
    <tr class="is-featured">
      <td>Woolet</td>
      <td data-label="Frame width">158 mm (bespoke 145–162 mm)</td>
      <td data-label="Material">Mazzucchelli acetate, Italy</td>
      <td data-label="Bridge">21 mm keyhole</td>
      <td data-label="Rx">Yes</td>
      <td data-label="From">$114 pre-order</td>
    </tr>
    <tr>
      <td>SizeGlasses</td>
      <td data-label="Frame width">155–165 mm</td>
      <td data-label="Material">TR90</td>
      <td data-label="Bridge">up to 20 mm</td>
      <td data-label="Rx">Yes</td>
      <td data-label="From">$99</td>
    </tr>
    <tr>
      <td>BXL Eyewear</td>
      <td data-label="Frame width">145–165 mm</td>
      <td data-label="Material">TR90</td>
      <td data-label="Bridge">up to 20 mm</td>
      <td data-label="Rx">Yes</td>
      <td data-label="From">$105</td>
    </tr>
    <tr>
      <td>Zenni Extended Fit</td>
      <td data-label="Frame width">~138–148 mm</td>
      <td data-label="Material">Various</td>
      <td data-label="Bridge">up to 18 mm</td>
      <td data-label="Rx">Yes</td>
      <td data-label="From">$6.95</td>
    </tr>
    <tr>
      <td>Warby Parker Wide</td>
      <td data-label="Frame width">~138–148 mm</td>
      <td data-label="Material">Various</td>
      <td data-label="Bridge">up to 18 mm</td>
      <td data-label="Rx">Yes</td>
      <td data-label="From">$95</td>
    </tr>
  </tbody>
</table>
</div>
<p class="woolet-compare__note">Woolet is the only brand in this comparison built exclusively for wide faces — every frame starts at 158 mm. Other brands offer wide options as a size filter within a broader catalog.</p>
</div>

<p>If your current frames already hurt, the pressure point tells you which problem you have: <a href="/en/blog/glasses-too-tight-on-side-of-head" style="color:#A07A2A;">glasses too tight on the side of your head</a> walks through the temple-versus-behind-the-ear diagnostic and what an optician genuinely can and cannot change.</p>

<h2>FAQ: Glasses for Wide Faces</h2>

<h3>What mm frame width do I need for a wide face?</h3>
<p>If your face measures 155mm or more from temple to temple, you need a total frame width of at least 155mm. Standard "wide" frames from mainstream brands typically max out at 148mm, which is still too narrow for genuinely broad faces.</p>

<h3>Can I just have my glasses adjusted to fit a wide face?</h3>
<p>Frames can be adjusted up to approximately 5–10mm. If a frame is 145mm and your face is 160mm, adjustment won't solve the problem — it may weaken the frame's structure. You need frames designed for your width from the outset.</p>

<h3>Do wider glasses make a wide face look bigger?</h3>
<p>No — the opposite is true. Proportionally fitted frames (where frame width matches face width) create visual balance. Frames that are too narrow actually emphasize a wide face by contrast. A properly fitted 158mm frame on a 158mm face looks balanced and intentional.</p>

<h3>What is the best frame shape for a wide face?</h3>
<p>Rectangular and square frames work best for most wide faces, as they add structure and vertical emphasis. Round frames work well for rounded wide faces. The most important factor is proportional width — the frame should span the full width of your face.</p>

<h3>Are prescription lenses available in wide frames?</h3>
<p>Yes. Woolet's frames are designed to accept standard prescription lenses. The wider frame width doesn't affect lens compatibility — any optician can fit Rx lenses into Woolet frames.</p>

<h2>The Bottom Line</h2>

<p>Finding glasses for a wide face in 2026 is no longer about choosing between frames that fit and frames that look good. The gap in the premium market — where Italian acetate craftsmanship meets 155mm+ engineering — is finally being addressed.</p>

<p>The number you need to know is <strong>155mm</strong>. That's the threshold where standard sizing fails and specialty engineering begins. Every frame on the market below that threshold — regardless of what the label says — is not designed for you.</p>

<p>Woolet exists precisely because that gap exists. Premium Italian acetate. 158mm precision. Two silhouettes designed for faces that have never been properly served by the eyewear industry.</p>

<p><strong>Your face isn't the problem. The frames were.</strong></p>

<p><em>Woolet makes Italian acetate eyewear engineered for faces 155mm and wider. Join the waitlist at woolet.co for priority access and 15% off your first pair.</em></p>

<h2>Frequently asked questions</h2>

<h3>What face width do I need for Woolet glasses?</h3>
<p>Woolet standard frames are built for face widths of 155 mm and above. The frame front measures 158 mm. If your face is between 150 mm and 162 mm, the bespoke tier covers that full range. To measure your face width, use a ruler or tape measure at the widest point — typically across your cheekbones.</p>

<h3>Do Woolet frames work with progressive lenses?</h3>
<p>Yes. Both the 007 Round and 009 Square accept single-vision, bifocal, and progressive prescription lenses. The 21 mm keyhole bridge is designed to accommodate the fitting height progressive lenses require.</p>

<h3>Why don't standard glasses fit wide faces?</h3>
<p>Most eyewear is manufactured at 135–145 mm total frame width — optimized for the average face. Faces wider than 145 mm push the temples outward, causing the arms to bow, the frame to press against the temples, and the optical centers to misalign with the eyes. No amount of adjustment fixes a frame that was never built for the measurement.</p>

<h3>How is Woolet different from Zenni Extended Fit or Warby Parker Wide?</h3>
<p>Zenni Extended Fit starts at 138 mm and Warby Parker Wide tops out around 140 mm — categories that cover slightly broader faces within their standard range. Woolet starts where they stop: 158 mm, built from Mazzucchelli acetate Hand made in EU. Woolet is not a size filter within a broad catalog — it is a brand built exclusively for one precise measurement.</p>

<h3>What is Mazzucchelli acetate and why does it matter for wide-face eyewear?</h3>
<p>Mazzucchelli is Italy's premium acetate manufacturer, used by brands including Oliver Peoples and Persol. Acetate is more flexible, more color-rich, and more durable than the TR90 plastic used by most wide-face specialty brands. For frames at 158 mm, material rigidity matters: acetate holds its shape at larger widths without warping or losing tension at the temples.</p>

<h3>Is Woolet the same as the Woolet smart wallet?</h3>
<p>No. Woolet eyewear is a separate brand making premium Italian acetate glasses for wide faces. The Woolet smart wallet was a discontinued Bluetooth wallet product from an unrelated company.</p>

<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What face width do I need for Woolet glasses?","acceptedAnswer":{"@type":"Answer","text":"Woolet standard frames are built for face widths of 155 mm and above. The frame front measures 158 mm. If your face is between 150 mm and 162 mm, the bespoke tier covers that full range. To measure your face width, use a ruler or tape measure at the widest point — typically across your cheekbones."}},{"@type":"Question","name":"Do Woolet frames work with progressive lenses?","acceptedAnswer":{"@type":"Answer","text":"Yes. Both the 007 Round and 009 Square accept single-vision, bifocal, and progressive prescription lenses. The 21 mm keyhole bridge is designed to accommodate the fitting height progressive lenses require."}},{"@type":"Question","name":"Why don't standard glasses fit wide faces?","acceptedAnswer":{"@type":"Answer","text":"Most eyewear is manufactured at 135–145 mm total frame width — optimized for the average face. Faces wider than 145 mm push the temples outward, causing the arms to bow, the frame to press against the temples, and the optical centers to misalign with the eyes. No amount of adjustment fixes a frame that was never built for the measurement."}},{"@type":"Question","name":"How is Woolet different from Zenni Extended Fit or Warby Parker Wide?","acceptedAnswer":{"@type":"Answer","text":"Zenni Extended Fit starts at 138 mm and Warby Parker Wide tops out around 140 mm. Woolet starts where they stop: 158 mm, built from Mazzucchelli acetate Hand made in EU. Woolet is not a size filter within a broad catalog — it is a brand built exclusively for one precise measurement."}},{"@type":"Question","name":"What is Mazzucchelli acetate and why does it matter for wide-face eyewear?","acceptedAnswer":{"@type":"Answer","text":"Mazzucchelli is Italy's premium acetate manufacturer, used by brands including Oliver Peoples and Persol. Acetate holds its shape at larger widths without warping or losing tension at the temples — critical for frames at 158 mm."}},{"@type":"Question","name":"Is Woolet the same as the Woolet smart wallet?","acceptedAnswer":{"@type":"Answer","text":"No. Woolet eyewear is a separate brand making premium Italian acetate glasses for wide faces. The Woolet smart wallet was a discontinued Bluetooth wallet product from an unrelated company."}}]}</script>

<div style="background:#F8F6F1;border:1px solid #E8E4DC;border-radius:8px;padding:28px;margin:40px 0 12px;display:flex;gap:20px;align-items:flex-start;font-family:'Barlow',sans-serif;">
  <div style="flex-shrink:0;width:56px;height:56px;border-radius:50%;background:#0f0f0f;color:#c9a84c;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:17px;letter-spacing:0.5px;">MC</div>
  <div style="flex:1;min-width:0;">
    <div style="font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:500;color:#0f0f0f;line-height:1.2;">Marek Cieśla</div>
    <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c9a84c;margin-top:6px;font-weight:500;">Founder, Woolet Eyewear</div>
    <p style="margin:14px 0 0;font-size:14px;line-height:1.7;color:#3a3a3a;">Marek Cieśla is a serial entrepreneur and the founder of Woolet. He previously raised $330,000 in crowdfunding for the original Woolet smart wallet — a Bluetooth-enabled leather wallet that shipped to backers across 40 countries. The wide-face fit problem came from personal experience: standard frames consistently failed to fit his own face. Woolet eyewear is the product he could not find anywhere else.</p>
  </div>
</div>

<div style="border-top:1px solid #E8E4DC;margin-top:36px;padding-top:24px;">
  <div style="font-family:'Barlow',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#888;margin-bottom:12px;">Related reading</div>
  <ul style="margin:0;padding:0 0 0 18px;font-size:15px;line-height:1.8;color:#1a1a1a;">
    <li><a href="/en/blog/how-to-measure-face-width-for-glasses" style="color:#c9a84c;text-decoration:none;">How to measure your face width for glasses</a> — a 30-second method using a phone or a credit card.</li>
    <li><a href="/en/blog/best-sunglasses-for-wide-faces" style="color:#c9a84c;text-decoration:none;">Best sunglasses for wide faces in 2026</a> — the wide-fit shortlist, with real measurements.</li>
    <li><a href="/en/collections/wide-face-glasses" style="color:#c9a84c;text-decoration:none;">Wide-face glasses collection</a> and <a href="/en/collections/glasses-for-big-heads" style="color:#c9a84c;text-decoration:none;">glasses for big heads</a> — browse the 158 mm range.</li>
  </ul>
</div>

<script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"Glasses for Wide Faces — Complete Fit and Buying Guide","description":"How to find prescription eyewear that fits faces wider than 145 mm. Frame measurements, material comparison, anthropometric data, and why standard glasses fail wide faces.","author":{"@type":"Person","name":"Marek Cieśla","url":"https://www.linkedin.com/in/marekciesla/","jobTitle":"Founder","worksFor":{"@type":"Organization","name":"Woolet Eyewear","url":"https://woolet.co"}},"publisher":{"@type":"Organization","name":"Woolet","url":"https://woolet.co","logo":{"@type":"ImageObject","url":"https://woolet.co/og-home.png"}},"datePublished":"2026-03-09","dateModified":"2026-08-24","mainEntityOfPage":{"@type":"WebPage","@id":"https://woolet.co/en/blog/glasses-for-wide-faces-guide"},"about":[{"@type":"Thing","name":"Wide face eyewear","description":"Prescription glasses designed for face widths above 145 mm"},{"@type":"Thing","name":"Mazzucchelli acetate","description":"Premium Italian cellulose acetate produced by Mazzucchelli 1849, Milan, Italy, since 1849"}],"citation":[{"@type":"CreativeWork","name":"Cleft Palate and Craniofacial Journal — facial anthropometric measurements","url":"https://pmc.ncbi.nlm.nih.gov/articles/PMC4496583/"},{"@type":"CreativeWork","name":"ISO 8624 — Spectacle frame measuring system and vocabulary","url":"https://www.iso.org/standard/31811.html"},{"@type":"CreativeWork","name":"ANSUR II — 2012 Anthropometric Survey of U.S. Army Personnel","url":"https://apps.dtic.mil/sti/tr/pdf/ADA611869.pdf"}]}</script>
`,
  },
  {
    slug: "glasses-for-wide-nose-bridge-21-22mm-explained",
    title: "Glasses for a Wide Nose Bridge: What 21–22 mm Actually Means",
    excerpt: "Most brands cap the bridge at 18 mm. Here's what 21–22 mm changes for wide nose bridges, big noses, and keyhole vs saddle fit.",
    date: "2026-06-12",
    readTime: 11,
    tags: ["Guide", "Wide Nose Bridge", "Fit"],
    faq: [
      { q: "What counts as a wide nose bridge in glasses?", a: "Bridge widths under 17 mm are narrow, 17–20 mm is the mainstream range, and 21 mm and above is wide. Most brands top out at 18 mm. Anyone with a wider or higher nose typically needs 21 mm or more for the frame to sit on the bone instead of pinching cartilage." },
      { q: "What does the bridge measurement actually mean?", a: "It's the distance in millimeters between the two lenses, measured at the narrowest point of the bridge. It's the second number on the inside of the temple — e.g. 52□18 means a 52 mm lens and an 18 mm bridge. Bridge width determines where the frame sits on the nose and how evenly weight is distributed." },
      { q: "What's the widest standard bridge Woolet makes?", a: "21 mm on the round Woolet 007 and 22 mm on the soft-square Woolet 009. Bespoke covers 20 to 24 mm in 1 mm increments, paired with any front width from 145 to 162 mm." },
      { q: "Are glasses for big noses the same as wide nose bridge glasses?", a: "Almost always, yes. A big nose usually means a wider bridge, a higher bridge, or both — and the fit fix is the same: more bridge width and a keyhole shape so the frame rests on the top ridge instead of pressing the sides." },
      { q: "Will a 21–22 mm bridge fit a higher nose too?", a: "Yes. The keyhole geometry lifts the frame off the sides of the nose, which solves the height problem as well as the width problem. A bespoke 23–26 mm bridge with extra crest height is the next step up for the largest noses." },
      { q: "How do I measure my own bridge width at home?", a: "Pinch a credit card flat across the top of your nose where glasses normally sit, mark the contact width with a pen, then measure it with a ruler in millimeters. Add 1–2 mm for breathing room. The AI Fit Wizard does this from a single photo." },
      { q: "Why don't mainstream brands offer wider bridges?", a: "Inventory economics. Running a tight 17/18/19 mm bridge range covers the statistical median and keeps SKUs low. Wider bridges mean slower-moving stock, so most brands ignore the category — which is the gap Woolet was built to fill." },
    ],
    content: `
<p>If your glasses slide down within an hour, leave deep red marks on the sides of your nose, or sit visibly crooked, the cause is almost never the lens size or the temple length. It's the bridge — the small piece of acetate or metal between the two lenses — and specifically, that the bridge is too narrow for your nose.</p>

<p>This is the most common fit problem in eyewear, and it's also the one mainstream brands solve worst. Walk into almost any optical store and the wide-bridge glasses cap around 17 or 18 mm. If your nose needs more, you've been quietly ignored by the industry.</p>

<p>This guide covers what bridge width actually means, what counts as wide, what 21–22 mm changes, and how keyhole geometry fits into all of it.</p>

<h2>The bridge number — and why it matters more than people think</h2>

<p>Every frame is stamped with three numbers on the inside of the temple, usually like <strong>52□18-145</strong>. The first is lens width. The middle one — the one between the small square symbol — is the <strong>bridge width</strong> in millimeters. The third is temple length.</p>

<p>Bridge width controls two things: where the frame sits on your nose, and how the weight of the frame is distributed. A bridge that's too narrow pinches the sides of the nose and concentrates pressure on cartilage. A bridge that's correct rides on bone, distributes weight evenly, and stops the slide.</p>

<p>It's also the single hardest number to fix after purchase. Lens width can be tolerated. Temples can be heat-bent. A wrong bridge can only be replaced.</p>

<h2>What counts as a wide nose bridge?</h2>

<p>Industry conventions break out roughly like this:</p>

<ul>
<li><strong>14–16 mm</strong> — narrow bridges. Common in "low bridge" and Asian-fit lines.</li>
<li><strong>17–20 mm</strong> — the mainstream range. Engineered for the statistical median nose.</li>
<li><strong>21–22 mm</strong> — wide. What Woolet 007 and 009 ship as standard.</li>
<li><strong>23–26 mm</strong> — extra wide. Bespoke territory.</li>
</ul>

<p>If you've measured the bridge on your existing glasses and it reads 17, 18, or 19 mm, and they slide or pinch, moving to 21–22 mm is usually the single biggest fit upgrade you can make.</p>

<h2>What 21–22 mm actually changes</h2>

<p>Going from an 18 mm to a 21 mm bridge is only 3 millimeters on paper. In practice it changes three things at once.</p>

<p><strong>The frame stops sliding.</strong> A wider bridge has more contact area on the top of the nose, which means the frame doesn't need gravity to stay in place — it sits where you put it. People who push their glasses up dozens of times a day generally stop within the first week.</p>

<p><strong>The red marks disappear.</strong> The pressure that produces those marks comes from a too-narrow bridge clamping onto cartilage. With 21–22 mm, the frame rides on the top ridge of the nose, which is bone. Bone distributes load better than cartilage and doesn't bruise.</p>

<p><strong>The lenses end up in the right place.</strong> A frame that's too narrow at the bridge sits too high; you end up looking through the bottom of the lens. A correct bridge places the optical center exactly where your pupil is, which matters more for progressives and high prescriptions than most people realize.</p>

<h2>Keyhole vs saddle — the second variable</h2>

<p>Bridge width is half the story. The other half is bridge <em>shape</em>.</p>

<p><strong>Saddle bridge</strong> is the default in most modern frames. It's a continuous curve that wraps the sides of the nose like a saddle on a horse. It works fine on average and lower nose bridges and looks clean — but on wider or higher noses, the saddle pinches sides and slides.</p>

<p><strong>Keyhole bridge</strong> is cut with a small inverted-keyhole opening at the center. The frame doesn't touch the sides of the nose at all — it sits across the top, like a bridge spanning a gap. Historically the bridge style of choice for mid-century American eyewear (Wayfarer, Persol 649, Moscot Lemtosh) and still standard in heritage frames today.</p>

<p>For a wider or higher nose, the combination you want is <strong>wide + keyhole</strong>: 21 mm or more, cut with a keyhole opening. That's the spec on both Woolet 007 (21 mm round) and Woolet 009 (22 mm soft-square). See the full breakdown on the <a href="/en/collections/keyhole-bridge-glasses">keyhole bridge collection</a>.</p>

<h2>Are glasses for big noses the same problem?</h2>

<p>Almost always, yes. A "big nose" in eyewear terms usually means one or more of: wider at the bridge, taller at the crest, or higher up the brow line. All three are fixed by the same two levers — more bridge width and keyhole geometry — sometimes with a small amount of extra crest height in bespoke.</p>

<p>If you've spent years buying frames that look right on the rack but feel wrong on your face, the search term you've been using ("glasses for big noses", "wide nose bridge glasses", "glasses for wide nose bridge") all point to the same fit fix. See the <a href="/en/collections/wide-bridge-glasses">wide bridge glasses collection</a> for the comparison against mainstream specs.</p>

<h2>The 18 mm ceiling — why mainstream brands stop where they do</h2>

<p>It's not a manufacturing limit. It's inventory economics. Running a tight 17/18/19 mm bridge range covers the statistical median nose, keeps SKU counts low, and moves stock predictably. Going wider means cutting more variants and risking slower-moving inventory.</p>

<p>This is why "wide bridge" sections on mainstream sites top out at 18 mm. Not because 18 mm is the natural ceiling for human noses, but because it's the natural ceiling for inventory planning around a bell curve. Anyone whose nose is on the long tail gets quietly ignored.</p>

<h2>Which model — 007 or 009?</h2>

<p>Both are 158 mm front width in Italian Mazzucchelli acetate, Hand made in EU. The difference is shape and bridge.</p>

<ul>
<li><strong><a href="/en/products/007">Woolet 007</a></strong> — round panto, 21 mm keyhole bridge. The vintage-round silhouette done at wide-bridge scale. For anyone who's tried Persol 649 or Moscot Lemtosh and found the bridge too narrow.</li>
<li><strong><a href="/en/products/009">Woolet 009</a></strong> — soft square, 22 mm keyhole bridge. Slightly more architectural, slightly wider bridge. For broader noses or anyone who prefers a squared silhouette.</li>
</ul>

<p>Bespoke covers any bridge from 20 to 24 mm in 1 mm increments, paired with any front width from 145 to 162 mm.</p>

<h2>How to know before you buy</h2>

<p>Two paths. Measure your existing frames — the middle number stamped inside the temple is your current bridge. If it reads 17, 18, or 19 and the frame slides or pinches, you want 21 mm or 22 mm.</p>

<p>Or use the <a href="/en/fit">AI Fit Wizard</a> — it measures both face width and bridge width from a single photo, so we can confirm 21 mm, 22 mm, or bespoke before you order. No ruler, no guesswork, no return shipping.</p>

<h2>The takeaway</h2>

<p>If your glasses have always slid down, pinched, or sat crooked, the chances that your face is the problem are almost zero. The chances that the bridge spec is the problem are very high. 21–22 mm in a keyhole shape solves it for most wider and higher noses. Bespoke 23–26 mm solves it for the rest.</p>

<p>Your nose isn't the outlier. The bridge range was.</p>

<p style="margin-top:1.5rem;padding:1rem 1.2rem;border:1px solid rgba(202,164,73,0.25);background:rgba(202,164,73,0.04);border-radius:6px;font-size:0.9rem;">More on this topic — see the <a href="/en/blog/category/nose-bridge-fit"><strong>Nose-Bridge Fit hub</strong></a> for every guide we've written on bridge width, keyhole geometry, and how to measure.</p>
`,
  },
  {
    slug: "how-to-measure-face-width-for-glasses",
    title: "How to Measure Face Width for Glasses in 60 Seconds",
    excerpt: "No ruler, no optician: measure your face width in 60 seconds with a credit card and match it to the right frame size — built for wider faces and bigger heads.",
    date: "2026-03-08",
    readTime: 9,
    tags: ["How-to", "Measurement", "Fit"],
    faq: [
      {
        q: "What is considered a wide face for glasses?",
        a: "Anything 155 mm or wider across the temples (hinge-to-hinge distance) is considered wide. Most mainstream brands top out at 145–148 mm front width, which is why standard frames pinch wide-faced buyers. 155–161 mm is wide, 161–162 mm is extra wide, and 162 mm+ is bespoke-only territory.",
      },
      {
        q: "What size glasses do I need for a wide face?",
        a: "Match your face width (in mm) to the frame's front width (hinge-to-hinge) within 5 mm. For a 158 mm face, choose a 155–161 mm frame. A 21–22 mm bridge and temples of 145 mm or longer complete the fit. Woolet 007 and 009 ship at 158 mm front width with a 21–22 mm keyhole bridge as standard.",
      },
      {
        q: "How many mm is a wide face for glasses?",
        a: "155 mm and above is wide. The average adult male face measures 140–148 mm; women average 135–142 mm. If your measurement is 155 mm or more, mainstream frames will not fit — you need a specialist wide-face brand or bespoke.",
      },
      {
        q: "How do I measure face width without a ruler?",
        a: "Use a credit card — every credit card is 85.6 mm wide globally. Hold it horizontally against one cheekbone and note where the other edge lands relative to your other cheekbone. Card fully across face ≈ 145–150 mm. Card plus ~10 mm overlap each side ≈ 165 mm+. For a precise measurement, the Woolet AI Fit Wizard uses your phone camera and a credit card reference.",
      },
      {
        q: "Are my glasses too wide for my face?",
        a: "If the frame extends more than 5 mm past your temples on either side, or if the temples bow outward instead of running parallel to your head, the frame is too wide. If they pinch behind your ears or leave marks within an hour, the frame is too narrow. The temples should run parallel to your head with no lateral pressure.",
      },
      {
        q: "What does 52□19 145 mean on glasses?",
        a: "Lens width — bridge — temple length, all in millimetres. It does not include the front width (hinge-to-hinge), which is the number that decides if a frame fits a wide face. Estimate front width as (lens width × 2) + bridge + ~6 mm for the hinge area.",
      },
    ],
    howTo: {
      name: "How to Measure Face Width for Glasses",
      description: "Measure your face width at home in under a minute using a credit card or ruler. The single most important number for buying glasses that actually fit.",
      totalTime: "PT2M",
      supply: ["Credit card (85.6 mm wide) or millimetre ruler", "Mirror", "Pen and paper"],
      tool: ["Mirror", "Smartphone camera (optional — for the AI Fit Wizard)"],
      step: [
        {
          name: "Position yourself in front of a mirror",
          text: "Stand in good light, facing the mirror straight on. Keep your head level — no tilt — and look directly at your own eyes.",
        },
        {
          name: "Find the widest point of your face",
          text: "Run your fingers along the sides of your face. The widest point is usually across the cheekbones, just below the eyes — not the jaw or forehead.",
        },
        {
          name: "Hold a credit card against one cheekbone",
          text: "A credit card is 85.6 mm wide everywhere in the world. Hold it horizontally with one short edge flush against your cheekbone and note where the opposite edge lands relative to your other cheekbone.",
        },
        {
          name: "Read your face width in millimetres",
          text: "Card fully across face with no overlap ≈ 145–150 mm. Card with ~10 mm of face visible on each side ≈ 165 mm+. For a millimetre-accurate number, use a flexible tape measure or the Woolet AI Fit Wizard.",
        },
        {
          name: "Match your measurement to a frame width",
          text: "Choose a frame whose front width (hinge-to-hinge) is within 5 mm of your face width. 155–161 mm face → 158 mm frame. 161–162 mm face → bespoke. Below 155 mm, mainstream brands will fit.",
        },
      ],
    },
    content: `
<p style="font-size:18px;line-height:1.7;color:#1a1a1a;background:#F8F6F1;border-left:3px solid #c9a84c;padding:20px 24px;margin:0 0 24px;border-radius:4px;"><strong>To measure your face width, hold a ruler flat and level across the widest part of your head at eye level — just in front of the ears — and read temple to temple in millimetres.</strong> That single number, not lens size, decides which frames fit. Under 145 mm is average; 155 mm and above needs a wide-face frame.</p>

<table style="width:100%;border-collapse:collapse;font-size:14px;margin:0 0 28px;">
  <thead><tr style="background:#F8F6F1;"><th style="text-align:left;padding:10px 12px;border-bottom:1px solid #E8E4DC;">Face width</th><th style="text-align:left;padding:10px 12px;border-bottom:1px solid #E8E4DC;">Frame front width</th><th style="text-align:left;padding:10px 12px;border-bottom:1px solid #E8E4DC;">Size band</th></tr></thead>
  <tbody>
    <tr><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">Under 140 mm</td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">135–142 mm</td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">Standard</td></tr>
    <tr><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">140–154 mm</td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">142–154 mm</td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">Large / extended fit</td></tr>
    <tr style="background:#FBF7EE;"><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;"><strong>155–161 mm</strong></td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;"><strong>158 mm</strong></td><td style="padding:10px 12px;border-bottom:1px solid #F0EDE6;">Wide — <a href="/en/size/158mm" style="color:#A07A2A;">Woolet signature</a></td></tr>
    <tr><td style="padding:10px 12px;">162 mm+</td><td style="padding:10px 12px;">162 mm max</td><td style="padding:10px 12px;">Bespoke (145–162 mm)</td></tr>
  </tbody>
</table>

<p>Most people who struggle to find fitting glasses have never measured their face. They rely on vague labels like "wide" or "large" without understanding what those terms actually mean in millimeters — or why the "wide" option at their local optician might still be 15mm too narrow.</p>

<p>This guide fixes that in 60 seconds, with nothing more than a credit card or a ruler you already own: you get the one number that changes how you shop for glasses forever — your face width in millimetres.</p>

<h2>Measure with your phone instead</h2>

<p>If you would rather not hold a ruler against your own face in a mirror, <a href="/en/fit" style="color:#A07A2A;"><strong>FitLens</strong></a> does the same job from your phone camera in about 20 seconds. There is no app to install and no appointment: you open the page in your phone browser, hold a standard credit card (85.6 mm by ISO standard) under your eyes as a calibration reference, and take one straight-on photo.</p>

<p>The scan uses the known card width to convert pixels to millimetres, then returns your face width and your nose bridge width together — the two numbers that decide frame size. It works in ordinary indoor light, nothing is uploaded to a third party, and it will tell you plainly whether you fall inside the 155–161 mm signature range, inside the 145–162 mm bespoke range, or outside both.</p>

<p>The manual method below is just as accurate if you prefer it, and it is worth reading either way so you know what the number means.</p>



<h2>What You'll Need</h2>

<ul>
<li>A flexible measuring tape (the kind used in tailoring) or a rigid ruler graduated in millimeters</li>
<li>A mirror</li>
<li>Good lighting</li>
<li>A pen to note down your measurement</li>
</ul>

<p>If you don't have a flexible tape measure, a standard school ruler works perfectly. Digital calipers give the most precise result, but a ruler is accurate enough for eyewear shopping.</p>

<h2>Step-by-Step: How to Measure Face Width for Glasses</h2>

<h3>Step 1: Position yourself in front of a mirror</h3>
<p>Stand facing the mirror directly. Keep your head level — don't tilt up or down, as this changes the apparent width of your face.</p>

<h3>Step 2: Locate your measurement points</h3>
<p>You're measuring the widest point of your face, which is typically at the temples — the bony protrusions just above and beside the outer corners of your eyes. Place your fingertips lightly on both temples to feel where they are before measuring.</p>

<h3>Step 3: Measure temple to temple</h3>
<p>Hold your ruler or measuring tape horizontally at this level. Measure from the outermost edge of your left temple to the outermost edge of your right temple. Read the measurement in millimeters.</p>

<p><strong>Record this number. This is your face width.</strong></p>

<h2>What Your Measurement Means</h2>

<ul>
<li><strong>Under 130mm</strong> — Narrow. Petite or XS frames recommended.</li>
<li><strong>130–137mm</strong> — Standard. All mainstream brands fit.</li>
<li><strong>138–144mm</strong> — Wide. "Wide" options at Warby Parker, Zenni work.</li>
<li><strong>145–154mm</strong> — Extra-Wide. Specialist brands like Fatheadz or BXL recommended.</li>
<li><strong>155mm+</strong> — XL / Specialty. Requires purpose-built frames like Woolet (158mm).</li>
</ul>

<p>If your face measures 155mm or more, the standard eyewear market — including the "wide" sections of mainstream brands — is not designed for you. Warby Parker's widest frames top out at approximately 148mm. Zenni's "Extended Fit" category stops around 140mm. These brands aren't being dishonest — they simply define "wide" relative to their standard range, not relative to genuinely broad faces.</p>

<h2>The Alternative Method: Using Your Hat Size</h2>

<p>If you wear hats, your hat size is a useful cross-reference for frame width. Here's the approximate conversion:</p>

<ul>
<li><strong>Hat size 7 (56cm)</strong> — Face width approx. 145–148mm</li>
<li><strong>Hat size 7¼ (58cm)</strong> — Face width approx. 149–152mm</li>
<li><strong>Hat size 7½ (60cm)</strong> — Face width approx. 153–157mm</li>
<li><strong>Hat size 7¾ (61cm)</strong> — Face width approx. 157–162mm</li>
<li><strong>Hat size 8 (63cm)</strong> — Face width approx. 162mm+</li>
</ul>

<p>This is a rough guide only — actual face width depends on the shape of your skull and the position of your temples. Use the direct measurement for the most accurate result.</p>

<h2>Understanding All Three Frame Measurements</h2>

<p>Once you know your face width, you need to understand the three numbers stamped on every pair of glasses. Look inside the temple arm — you'll see something like: <strong>52▢18—148</strong></p>

<h3>Lens Width (the first number)</h3>
<p>The horizontal width of each individual lens in mm. For wide faces, you want 52mm or above. Narrow lenses on a wide face create visual imbalance — the face appears disproportionately wide relative to the glasses.</p>

<h3>Bridge Width (the middle number)</h3>
<p>The distance between the two lenses across the nose bridge. For wider faces, a bridge of 17–20mm prevents the frames from sitting too high or pressing into the nose bridge. Low bridge fit frames (15mm or wider bridge) are essential for flat or wide nose bridges.</p>

<h3>Temple Length (the last number)</h3>
<p>The length of the temple arm from hinge to tip. Standard temples are 140–145mm. For wider faces and larger heads, 148–150mm temples wrap further around the skull, reducing pressure at the hinge point.</p>

<h2>How to Calculate Total Frame Width</h2>

<p><strong>Total width = (Lens Width × 2) + Bridge Width + (~10mm per hinge)</strong></p>

<p>Example: 52-18-148 frame<br/>
= (52 × 2) + 18 + 20<br/>
= 142mm total width</p>

<p>This is still too narrow for a 155mm face. You'd need a frame with total width of 155mm or more.</p>

<p>For reference, Woolet's frames measure 158mm total width, with a 52mm lens width (007) or 54mm (009), 20mm bridge, and 150mm temples.</p>

<h2>Why Does Lens Width Matter Beyond Total Frame Width?</h2>

<p>Total frame width tells you whether the glasses will physically fit on your head without compression. But lens width determines something equally important: whether your eyes sit at the optical center of the lenses.</p>

<p>Prescription lenses are ground with a specific optical center — the point of maximum optical precision. When you wear glasses, your pupils should align with these centers. If the lenses are too narrow for your face, your pupils end up positioned toward the outer edge of each lens, away from the optical center.</p>

<p>The result is:</p>
<ul>
<li>Reduced visual clarity, especially at the periphery</li>
<li>Increased eye strain after prolonged wear</li>
<li>In some prescriptions, mild prismatic distortion</li>
</ul>

<p>For anyone wearing prescription glasses during an 8–10 hour workday, this is not an abstract concern. Proper lens-width-to-pupil alignment is part of why Woolet uses a 52–54mm lens width — large enough to center most pupils correctly in frames designed for 155mm+ faces.</p>

<h2>The Pupillary Distance (PD) Connection</h2>

<p>Related to lens centering is your Pupillary Distance (PD) — the measurement in millimeters between the centers of your two pupils.</p>

<ul>
<li><strong>Average PD for adults:</strong> 60–65mm</li>
<li><strong>For wider faces:</strong> often 65–70mm or higher</li>
</ul>

<p>A wider face frequently comes with a wider PD. When ordering prescription glasses online, you'll need your PD from your optician. If your PD is toward the higher end (67mm+), this is another signal that standard frames with narrow lens widths may place your pupils outside the optimal zone.</p>

<p>Most opticians can measure your PD for free during an eye exam. You can also self-measure using a mirror and ruler, though professional measurement is more accurate.</p>

<h2>Common Measurement Mistakes to Avoid</h2>

<h3>Measuring cheekbones instead of temples</h3>
<p>The cheekbones are below and slightly in front of the temples. Measuring at cheekbone level gives you a narrower reading than your actual widest face point. Measure at the temples.</p>

<h3>Compressing the tape measure</h3>
<p>A flexible measuring tape pressed firmly against the skull gives a smaller reading than actual. Hold the tape measure just touching the skin without pressing in.</p>

<h3>Measuring across the forehead</h3>
<p>The forehead is typically narrower than the temples. Frame width is calibrated to temple width, not forehead width.</p>

<h3>Using a cloth tape measure stretched with age</h3>
<p>Old cloth tapes stretch and give inaccurate readings. Use a metal ruler or a new tape for accuracy.</p>

<h2>How Frame Width Relates to Comfort Over Time</h2>

<p>The relationship between frame width and comfort is not linear. A frame that's 5mm too narrow doesn't cause "a little" discomfort — it causes constant low-level compression equivalent to a tight headband. Over 8 hours, this accumulates.</p>

<p>Here's what happens physiologically:</p>
<ul>
<li>The temporal muscles — the muscles you use for chewing — run along the sides of the skull precisely where tight frames press.</li>
<li>Compression of these muscles during contraction (eating, speaking, expressions) creates sharp, intermittent pain.</li>
<li>The sustained pressure from tight temple arms reduces blood flow to the surrounding tissue, contributing to the "tight hat" sensation that builds over the course of a workday.</li>
</ul>

<p>Properly fitted frames — where total frame width matches or slightly exceeds face width — rest on the face with zero lateral pressure. They are held in place by the geometry of the frame resting on the ears and nose, not by squeezing the skull.</p>

<h2>Your Checklist Before Buying Wide-Face Glasses Online</h2>

<p>Before clicking "buy" on any pair of glasses marketed for wide faces:</p>

<ul>
<li><strong>Confirm total frame width is 155mm or above</strong> (not just "wide" label)</li>
<li><strong>Check lens width is 52mm or greater</strong> for visual balance on a 155mm+ face</li>
<li><strong>Confirm bridge width suits your nose</strong> (17–20mm for wider bridges)</li>
<li><strong>Verify temple length is 148mm+</strong> for wrap-around comfort</li>
<li><strong>Check material</strong> (acetate holds shape better than plastic at wider spans)</li>
<li><strong>Look for a return or fit guarantee</strong> in case the fit isn't right</li>
<li><strong>Have your PD ready</strong> for prescription lens ordering</li>
</ul>

<h2>Keep going: sizing references</h2>

<p>Once you have your number, three companion references turn it into a purchase. The <a href="/en/blog/eyeglass-frame-size-chart" style="color:#A07A2A;">eyeglass frame size chart</a> maps XS–XXL bands to real front widths in millimetres. <a href="/en/blog/numbers-on-glasses-frames-meaning" style="color:#A07A2A;">What the numbers on glasses frames mean</a> decodes the 54□21-103 marking and shows why none of those digits is the frame's total width. And <a href="/en/blog/temple-to-temple-measurement" style="color:#A07A2A;">temple-to-temple explained</a> separates temple length (the arm) from temple-to-temple width (your head) — the two are constantly confused.</p>

<h2>FAQ: Measuring Face Width for Glasses</h2>

<h3>How do I measure my face width without a measuring tape?</h3>
<p>Use a standard ruler in millimeters. Hold it horizontally at temple level in front of a mirror and read the distance between the outermost edges of your two temples. Alternatively, mark two points on a sheet of paper by touching your temples while pressing the paper flat, then measure between the marks.</p>

<h3>What is the average face width for glasses?</h3>
<p>The average face width for adult males in the US is approximately 140–148mm. For adult females, approximately 132–140mm. Faces measuring 155mm or above fall outside the range accommodated by most standard and "wide" eyewear.</p>

<h3>Should glasses be the same width as my face?</h3>
<p>Yes, as a general rule. Total frame width should closely match face width. A frame that matches or is within 5mm of your face width will sit naturally on your face without lateral pressure. Frames 10mm or more narrower than your face will compress your temples.</p>

<h3>My glasses are marked 'XL' but still feel tight — why?</h3>
<p>Because "XL" is a relative label, not a standardized measurement. A brand's "XL" might be 145mm — larger than their standard 135mm, but still inadequate for a 160mm face. Always check the actual millimeter width, not the size label.</p>

<h3>Does face width change with age?</h3>
<p>Bone structure is largely fixed after adulthood. However, weight changes can affect facial soft tissue width. If your measurement has changed significantly since your last pair, re-measure before purchasing new frames.</p>

<h2>Now You Have the Number. Use It.</h2>

<p>Your face width in millimeters is the single most important piece of information for buying glasses that fit. Everything else — style, material, price — is secondary to the frame physically fitting on your head.</p>

<p>If your measurement is 155mm or above, you now know why every mainstream brand has let you down, and you know exactly what to look for. A frame width of 155mm minimum. Preferably 158mm, like Woolet.</p>

<p><strong>Because the right measurement, matched to the right frame, means never adjusting your glasses again.</strong></p>

<p><em>Woolet makes <a href="/en/collections/italian-mazzucchelli-acetate">premium Italian Mazzucchelli acetate frames</a> engineered for 155mm+ face widths. Woolet 007 and 009 — both at 158mm — are available for pre-order via waitlist at woolet.co.</em></p>
`,
  },
  {
    slug: "what-is-italian-acetate-premium-eyewear",
    title: "What Is Italian Acetate? The Material Behind Premium Eyewear",
    excerpt: "Italian acetate is the gold standard of premium eyewear. Learn what it is, how Mazzucchelli makes it, and why it's the only material that holds its shape in wide frames (155mm+).",
    date: "2026-03-05",
    readTime: 8,
    tags: ["Materials", "Mazzucchelli", "Premium"],
    content: `
<p>Not all glasses are made equal. Walk into any luxury optical boutique and pick up two pairs of frames — one premium, one budget. The difference in your hands is immediate: one feels dense, rich, alive. The other feels hollow, light, disposable.</p>

<p>That difference is, in most cases, <strong>Italian acetate</strong>.</p>

<p>It's the material that defines the upper tier of the eyewear market. It's what Cubitts uses. What independent European ateliers cut by hand. What separates a $300 pair of frames that will outlast a decade from a $30 pair that warps by the third month.</p>

<p>And for those of us with faces that measure 155mm or wider, it's not just a luxury preference. It's a structural requirement.</p>

<h2>What Is Acetate?</h2>

<p>Acetate — more precisely, cellulose acetate — is a bioplastic derived from natural plant-based sources: primarily cotton fibers and wood pulp.</p>

<p>The raw process involves treating cellulose with acetic acid to create cellulose acetate flakes, which are then mixed with plasticizers to create a workable material. This material is cast into thick sheets and blocks, then cut, shaped, and polished into eyewear frames.</p>

<p>Acetate is not the same as the injection-molded plastic used in budget frames, though they're both loosely described as "plastic." The differences are significant.</p>

<h2>Italian Acetate vs. Standard Injection-Molded Plastic</h2>

<ul>
<li><strong>Origin:</strong> Italian acetate is natural (cotton/wood pulp). Injection-molded plastic uses petroleum-based polymers.</li>
<li><strong>Manufacturing:</strong> Acetate is cast in sheets and hand-cut. Plastic is melted and injected into molds.</li>
<li><strong>Color depth:</strong> Acetate is rich, layered, translucent. Plastic is flat and surface-level.</li>
<li><strong>Structural integrity:</strong> Acetate resists deformation. Plastic warps under stress.</li>
<li><strong>Flexibility:</strong> Acetate has natural flex and returns to shape. Plastic is brittle or permanently deformed.</li>
<li><strong>Hypoallergenic:</strong> Acetate is plant-based and gentle. Plastic depends on additives.</li>
<li><strong>Longevity:</strong> Acetate lasts 10+ years with care. Plastic typically 2–5 years.</li>
<li><strong>Width stability at 155mm+:</strong> Acetate is excellent. Plastic is poor to moderate.</li>
</ul>

<h2>Who Is Mazzucchelli?</h2>

<p>When eyewear professionals say "Italian acetate," they usually mean one specific manufacturer: <strong><a href="/en/collections/italian-mazzucchelli-acetate">Mazzucchelli 1849</a></strong>.</p>

<p>Founded in the province of Varese in northern Italy, Mazzucchelli has been producing cellulose acetate for eyewear for over 175 years. They are the oldest and most respected acetate manufacturer in the world, and their material is used by virtually every premium eyewear brand that matters: from independent European ateliers to heritage British opticians.</p>

<p>What makes Mazzucchelli acetate different is the casting process. The material is poured into large blocks and sheets, then allowed to cure slowly. This slow-cure process produces a material with exceptional homogeneity — consistent density and composition throughout. There are no weak points, no air pockets, no inconsistencies in the material structure.</p>

<p>The color possibilities are effectively infinite. Because the coloring is integral to the material — not a surface coating or print — Mazzucchelli acetate develops richer color depth with exposure to light, aging gracefully rather than fading.</p>

<h2>Why Italian Acetate Matters Specifically at 155mm+</h2>

<p>For standard frame widths (130–140mm), material quality is primarily about aesthetics and longevity. A standard-width frame in cheap plastic will hold its shape reasonably well because the span is short and the structural stress is limited.</p>

<p>At 155mm and above, the physics change.</p>

<p>A 158mm acetate frame spans a significantly wider arc than a 140mm standard frame. This wider span creates greater structural stress across the front of the frame, particularly at the bridge and the upper rim. Under this stress, inferior materials behave differently:</p>

<p><strong>Budget plastic (injection-molded):</strong> Gradually deforms under the sustained stress of a wide span. The bridge bows, the front warps, and the frame that fit correctly at purchase no longer holds its shape after several months of wear. The optical centers shift. The fit degrades.</p>

<p><strong>Italian acetate (Mazzucchelli):</strong> The dense, homogeneous structure resists deformation. The material has natural flexibility — it absorbs minor stress without cracking — but returns to its original geometry. A properly constructed 158mm Italian acetate frame will hold its exact shape for years.</p>

<p>For a premium frame worn 10–12 hours a day, 365 days a year, this dimensional stability is the difference between a frame that continues to fit precisely and one that progressively misaligns.</p>

<h2>The Manufacturing Process: How Italian Acetate Frames Are Made</h2>

<p>Creating an acetate frame is not a fast process. This is part of why it costs more — and why it's worth more.</p>

<h3>1. Sheet cutting</h3>
<p>Mazzucchelli acetate arrives at the frame workshop as thick cast sheets, typically 5–8mm deep. CNC cutting machines — guided by precision digital templates — cut the rough frame shapes from these sheets.</p>

<h3>2. Barrel tumbling</h3>
<p>Rough-cut frames are placed in rotating barrels with abrasive media for hours or days. This rounds all the edges and creates the initial smooth surface that acetate is known for.</p>

<h3>3. Hand shaping</h3>
<p>Skilled craftspeople heat specific areas of the frame — acetate becomes temporarily pliable when heated — and shape the curves, temple angles, and bridge geometry by hand. This is the step that can't be automated and where decades of skill make a tangible difference.</p>

<h3>4. Hinge fitting</h3>
<p>Metal hinges are mechanically fitted or inlaid into the acetate. Premium frames use solid metal screws and precisely machined hinge barrels. The quality of the hinge fitting determines how long the frame will open and close smoothly.</p>

<h3>5. Final polishing</h3>
<p>The finished frame goes through multiple polishing stages — often including hand polishing with cotton wheels — to achieve the signature depth and gloss of premium acetate. This can take up to two hours per frame.</p>

<p>The total process, from raw sheet to finished frame, typically involves <strong>40–50 individual steps</strong>. This is not a product that can be rushed.</p>

<h2>How to Identify Italian Acetate Quality</h2>

<p>When handling acetate frames, several physical properties indicate quality:</p>

<ul>
<li><strong>Weight:</strong> Italian acetate has a distinctly satisfying heft compared to hollow injection-molded plastic. Pick up the frame — it should feel solid and dense.</li>
<li><strong>Color depth:</strong> Hold the frame up to light. Italian acetate has a translucent quality — light passes through the material, revealing layered color. Cheap plastic looks flat and opaque.</li>
<li><strong>Surface temperature:</strong> Acetate feels warmer to the touch than metallic frames and room-temperature plastic. Because it's plant-derived, it conducts heat differently.</li>
<li><strong>Edge quality:</strong> Look at the cut edges, particularly at the hinge area. Premium acetate has clean, precise edges. Budget plastic often shows minor tool marks, flash lines, or inconsistencies.</li>
<li><strong>Hinge movement:</strong> Open and close the temples. Premium hinges have smooth, controlled movement with consistent resistance. Loose, rattly hinges or hinges that snap rather than swing are a quality indicator.</li>
</ul>

<h2>Caring for Italian Acetate Frames</h2>

<p>Premium acetate repays proper care with exceptional longevity.</p>

<ul>
<li><strong>Cleaning:</strong> Use the microfiber cloth that comes with your frames, or lukewarm water with a drop of dish soap. Avoid alcohol-based cleaners, solvents, or anything with ammonia — these can cloud acetate surfaces.</li>
<li><strong>Storage:</strong> Keep frames in their case when not wearing them. Leaving acetate frames on a hot car dashboard or in direct sunlight for extended periods can warp the material.</li>
<li><strong>Adjustments:</strong> Acetate is heat-adjustable. An optician or eyewear professional can heat specific areas and adjust the fit. Do not attempt this yourself without proper tools — overheating damages the material.</li>
<li><strong>Scratches:</strong> Minor surface scratches can be buffed out with a soft cloth and a small amount of carnauba-based polish. Deep scratches require professional attention.</li>
</ul>

<h2>FAQ: Italian Acetate</h2>

<h3>Is Italian acetate better than TR90 or titanium?</h3>
<p>Different materials excel in different contexts. TR90 (a flexible nylon) is excellent for athletic frames where impact resistance and flex are priorities. Titanium is the lightest option and exceptionally durable. Italian acetate excels in aesthetic depth, structural stability for wider spans, and the quality of the wearing experience. For premium dress eyewear, acetate is the material of choice.</p>

<h3>Why does Italian acetate cost more?</h3>
<p>Because making it well takes time, skilled labor, and premium raw material. The Mazzucchelli casting process, hand shaping, multiple tumbling and polishing stages, and precision hinge fitting all contribute to cost. A properly made Italian acetate frame represents 40–50 manufacturing steps. An injection-molded plastic frame represents a machine cycle of a few seconds.</p>

<h3>Do Italian acetate frames work for prescription lenses?</h3>
<p>Yes. Acetate frames are fully compatible with all standard prescription lenses, including high-index lenses for strong prescriptions. The acetate rim provides a secure grip for lens edging.</p>

<h3>How long do Italian acetate frames last?</h3>
<p>With proper care, 10 years or more. Acetate doesn't fatigue or corrode the way metal frames can. The material ages gracefully — developing a subtle patina rather than degrading.</p>

<h2>The Material Standard for Wide Frames</h2>

<p>For faces measuring 155mm and above, Italian acetate isn't a nice-to-have. It's the material that maintains structural integrity across a wider span, holds its optical geometry over years of wear, and delivers the tactile and visual quality that matches the premium you're paying.</p>

<figure><img src="/images/woolet-009-square-glasses-wide-face.png" alt="Woolet 009 Italian Mazzucchelli acetate eyewear close-up — 5-barrel hinge, frame width 158mm, bridge 22mm, acetate material detail and tortoiseshell pattern" loading="lazy" style="width:100%;border-radius:6px;margin:0.5rem 0 1rem" /><figcaption style="font-size:0.7rem;opacity:0.5;text-align:center">Woolet 009 — Mazzucchelli acetate detail, 5-barrel hinge, 158mm</figcaption></figure>

<p>Woolet uses Mazzucchelli acetate in both the 007 and 009 models. Not because it's fashionable to say so — but because at 158mm, it's the right engineering decision.</p>

<p><a href="/en/collections/italian-mazzucchelli-acetate">Shop the Italian Mazzucchelli acetate collection (158 mm)</a> | <a href="/en/products/007">Woolet 007 (round)</a> | <a href="/en/products/009">Woolet 009 (square)</a></p>

<p><em>Woolet 007 and Woolet 009 are crafted from <a href="/en/collections/italian-mazzucchelli-acetate">Mazzucchelli Italian acetate</a>, engineered for 155mm+ face widths. Join the waitlist at woolet.co.</em></p>
`,
  },
  {
    slug: "why-glasses-dont-fit-155mm-problem",
    title: "Why Your Glasses Don't Fit: The 155mm Problem",
    excerpt: "If glasses always pinch your temples, it's not your head — it's the industry. Learn why most frames stop at 148mm and what 'the 155mm problem' means for wider faces.",
    date: "2026-03-01",
    readTime: 9,
    tags: ["Industry", "Wide Face", "155mm"],
    content: `
<p>There's a number the eyewear industry doesn't talk about: <strong>155mm</strong>.</p>

<p>It's the threshold at which most glasses stop working for most faces. Below it, the market serves you reasonably well. Above it, you're largely on your own — choosing between frames that technically fit on your head but compress your temples, frames that are wide enough but look like something from a sporting goods catalog, or no frames at all that you'd actually want to wear.</p>

<p>If you've been cycling through pairs of glasses that squeeze, hurt, leave marks on your temples, or look disproportionately small on your face — this is the explanation.</p>

<p>And it starts not with your head, but with how the eyewear industry was built.</p>

<h2>How Eyewear Sizing Became Standardized Around the Wrong Number</h2>

<p>Modern eyewear manufacturing scaled up through the 20th century around a set of assumptions about human face dimensions. Those assumptions were based on the populations most accessible to European and American manufacturers at the time — populations with average face widths clustering between 130mm and 145mm.</p>

<p>The industrial infrastructure — the molds, the tooling, the supply chains — was built around these dimensions. "Standard" became 135mm. "Wide" became 140–148mm. And those definitions, embedded in decades of manufacturing and retail convention, have barely moved.</p>

<p>The problem is that human face widths don't stop at 148mm. They continue in a normal distribution, with meaningful proportions of the population — particularly among men, and disproportionately among people of certain ethnic backgrounds — measuring 155mm, 160mm, 165mm or more.</p>

<p>For these faces, the entire standard eyewear market was built around numbers that simply don't apply.</p>

<h2>The Deceptive Math of "Wide" Frames</h2>

<p>When you see a frame labeled "wide" or "XL," the natural assumption is that it's wide enough for wide faces. This assumption is almost always wrong.</p>

<p>A brand like Warby Parker makes glasses in multiple widths. Their standard frames run approximately 130–138mm. Their "wide" frames run approximately 138–148mm. When they label something "Wide," they mean wide relative to their standard range — not wide relative to what wide-faced customers actually need.</p>

<p>This is not dishonesty. It's a categorization system that works perfectly for the range of customers it was designed for. It just wasn't designed with 155mm+ faces in mind.</p>

<p>The same pattern repeats across the market:</p>
<ul>
<li><strong>Zenni "Extended Fit":</strong> approximately 138–142mm</li>
<li><strong>EyeBuyDirect "Large":</strong> approximately 140–148mm</li>
<li><strong>Most optical chains "XL":</strong> approximately 144–150mm</li>
</ul>

<p>For someone measuring 158mm temple to temple, even the largest "wide" frames from mainstream brands are still 8–18mm too narrow. That might not sound like much. But on either side of your skull, it means 4–9mm of constant compression — equivalent to wearing a headband that's slightly too tight, for 10–12 hours a day.</p>

<h2>What Compression Actually Does to Your Head</h2>

<p>The temporal region — where glasses frames make contact with your skull — is not an inert surface. The temporal muscles run through this area, and several significant blood vessels and nerves pass through and beneath the temporal fascia.</p>

<p>When glasses are too narrow:</p>

<p><strong>The temporal muscles are constantly compressed.</strong> Every time you chew, speak, or change your facial expression, these muscles contract against the pressure of the temple arm. This creates intermittent sharp discomfort layered on top of the constant background pressure.</p>

<p><strong>Blood flow to the surrounding tissue is reduced.</strong> The sustained pressure from tight temple arms restricts circulation in the soft tissue. This is the mechanism behind the "tight hat" feeling — a gradually increasing sense of pressure and warmth that builds over hours.</p>

<p><strong>The trigeminal nerve can be irritated.</strong> The trigeminal nerve branches through the temporal region. Sustained pressure on these branches contributes to the tension-type headaches that many wide-faced glasses wearers experience specifically on days they wear their glasses.</p>

<p>The result compounds over time. The first hour in tight glasses is tolerable. The fourth hour is uncomfortable. The eighth hour is a headache. Many people with wide faces have simply learned to live with headaches on working days and assumed it was screen fatigue, stress, or something intrinsic to them. Often, it's the glasses.</p>

<h2>Why Wider Frames Were Never Built for the Premium Market</h2>

<p>For most of eyewear's history, the people who needed wider frames had one option: compromise.</p>

<p>The specialist wide-face brands that exist entered the market solving one problem: physical fit. They built frames wide enough. But the economics of serving a smaller segment with specialised manufacturing pushed them firmly into the budget tier — injection-moulded plastic or TR90 nylon, functional rather than refined. Who sells what, at which width and price, is catalogued in <a href="/en/blog/best-glasses-for-big-heads-2026">best glasses for big heads</a>; this article is about why the gap exists at all.</p>

<p>On the other side, premium heritage brands — MOSCOT, Cubitts, independent European ateliers — invested their craft in producing exceptional frames in premium Italian acetate with sophisticated design sensibilities. Their "wide" options are wider than standard. But their manufacturing was never recalibrated for genuinely wide faces. "Wide" at MOSCOT means something like 142mm. Still not 155mm.</p>

<p>The result is a hard market gap: <strong>no premium Italian acetate brand has ever properly served faces above 155mm.</strong></p>

<p>Until now.</p>

<h2>The 155mm Threshold in Numbers</h2>

<p>To understand why 155mm specifically matters, consider what happens at the borders of existing products on a 158mm face:</p>

<ul>
<li><strong>140mm ("wide" mainstream):</strong> 9mm compression per side — constant headache territory</li>
<li><strong>148mm ("XL" mainstream):</strong> 5mm compression per side — uncomfortable after 2–3 hours</li>
<li><strong>150mm (specialist budget):</strong> 4mm compression per side — manageable but not ideal</li>
<li><strong>155mm (specialist):</strong> 1.5mm compression per side — most people tolerate this</li>
<li><strong>158mm (Woolet):</strong> Perfect fit on most 155–161mm faces</li>
<li><strong>162mm+:</strong> Slightly loose — frames may slide without adjustment</li>
</ul>

<p>The 155mm threshold is where standard sizing definitively fails and specialist engineering begins. Below it, the mainstream market can serve you with varying levels of compromise. Above it, you need frames that were designed with your face width as the primary parameter — not as an afterthought.</p>

<h2>The Style Problem No One Mentions</h2>

<p>The fit problem gets most of the attention. But there's a parallel style problem that's equally real.</p>

<p>When you wear frames that are too narrow for your face, the visual effect is disproportionate. Your face appears wider than your glasses. The glasses look too small — not because they're stylistically small, but because they're physically undersized relative to your features.</p>

<p>This effect is independent of frame style. Rectangular frames, round frames, aviators — if they're 15mm too narrow for your face, they'll look wrong regardless of how well they were designed.</p>

<p><strong>Proportional eyewear</strong> — where the frame width approximately matches the face width — looks intentional. The face and the glasses read as a coordinated whole. This is why fashion designers spec their runway eyewear so carefully: proportion is the difference between glasses that elevate a face and glasses that fight it.</p>

<p>For 155mm+ faces, proportional eyewear means 155mm+ frames. The style problem is, at its root, also a sizing problem.</p>

<h2>What the Solution Actually Looks Like</h2>

<p>Solving the 155mm problem requires engineering for it from first principles — not adapting a standard frame to be slightly wider.</p>

<p>This means:</p>
<ul>
<li><strong>158mm total width</strong> — matched to the core range of wide faces (155–161mm), where the frame rests on the face with zero lateral pressure.</li>
<li><strong>150mm temple length</strong> — long enough to wrap properly around a larger skull without the hinge becoming a secondary pressure point.</li>
<li><strong>Proportional lens sizing</strong> — 52mm lens width on the 007, 54mm on the 009, ensuring that eyes sit at the optical center of each lens on a 155mm+ face.</li>
<li><strong>Italian acetate construction</strong> — the only material that maintains structural integrity and dimensional stability across a 158mm span over years of daily wear.</li>
<li><strong>Premium design sensibility</strong> — because the people who need wider frames also deserve options that don't look like they came from a sporting goods store.</li>
</ul>

<p>Woolet was built to answer exactly one question: why doesn't a brand exist that does all of this? The 155mm problem has a solution. It just took building it.</p>

<p>For the day-to-day symptom side of the same problem — temple indentations, compression headaches, pressure sores behind the ear — see <a href="/en/blog/glasses-too-tight-on-side-of-head" style="color:#A07A2A;">glasses too tight on the side of your head</a>.</p>

<h2>FAQ: Why Glasses Don't Fit Wide Faces</h2>

<h3>Why do glasses always hurt my temples?</h3>
<p>Temple pain from glasses is almost always caused by frames that are too narrow for your face. When the total frame width is less than your face width, the temple arms press against your skull with constant lateral force. The solution is frames engineered to your actual face width — for 155mm+ faces, this means frames of at least 155mm total width.</p>

<h3>Is it normal for glasses to leave marks on my temples?</h3>
<p>No. Properly fitted glasses should rest on your face without creating pressure marks. Marks behind the ears are normal (the ear hooks support the frame's weight), but marks or indentations at the temples indicate that the frames are compressing your skull. This is a sizing problem, not a normal part of wearing glasses.</p>

<h3>Can an optician adjust my glasses to fit a wide face?</h3>
<p>An optician can bend the temple arms outward to widen the fit by approximately 5–8mm. This is a legitimate short-term solution for mild tightness. However, forcing a frame significantly beyond its designed width stresses the material and hinges, shortening the frame's lifespan. For faces 155mm+, frames designed at that width from the outset are a far better long-term solution.</p>

<h3>Why do my glasses slide down my nose if they feel tight at the temples?</h3>
<p>These two problems have the same root cause. When a frame is too narrow, it bows outward at the front (the temples push the sides while the front of the frame flexes). This bowing causes the nose bridge to ride upward, pushing the front of the frame off the nose. The frame is both compressing your temples and sliding off your nose simultaneously — a direct consequence of wrong sizing.</p>

<h2>The Problem Had a Name. Now It Has a Solution.</h2>

<p>The 155mm problem isn't unique to you. It affects a significant and underserved portion of the population — people who've spent years in glasses that hurt, in glasses that look wrong, or both.</p>

<p>Woolet was built to close that gap: premium Italian acetate frames, precisely engineered at 158mm, designed for the faces that the rest of the industry forgot to include.</p>

<p><em>Woolet 007 and Woolet 009 — Mazzucchelli acetate frames at a 158 mm front width, hand made in the EU, built for faces the industry left behind.</em></p>

<p>Looking for what to actually buy rather than why the problem exists? <a href="/en/blog/best-glasses-for-big-heads-2026">Best glasses for big heads (2026)</a> compares every brand selling a 150 mm+ front width. Don't know your number yet? <a href="/en/fit">Measure my face with FitLens — 20 seconds, no app</a>.</p>
`,
  },
  {
    slug: "round-vs-square-glasses-wide-face",
    title: "Round vs Square Glasses for Wide Faces: Which Shape Suits You?",
    excerpt: "Round or square glasses for a wide face? This guide breaks down the visual logic of each shape, who each suits, and how Woolet 007 and 009 were designed for 155mm+ faces.",
    date: "2026-02-25",
    readTime: 7,
    tags: ["Style", "Face Shape", "007 vs 009"],
    content: `
<p>The debate between round and square eyewear is one of the oldest in optical fashion. Both shapes have ardent defenders. Both have looked extraordinary on the right person.</p>

<p>But for faces measuring 155mm and above, the question has an additional dimension: it's not just about aesthetics. It's about proportion, balance, and how each shape interacts with the specific geometry of a wide face.</p>

<p>This guide will walk through both shapes honestly — what each does visually, who each suits, and how the two models in the Woolet collection — the 007 (round) and the 009 (square) — were designed around these principles.</p>

<h2>The Visual Logic of Frame Shapes</h2>

<p>Before getting to specific shapes, it helps to understand the underlying principle that governs how glasses interact with faces: <strong>contrast and complement</strong>.</p>

<p>Glasses that <strong>contrast</strong> with your face shape create definition and balance. Glasses that <strong>complement</strong> your face shape tend to blend in — not in a bad way, but in a way that feels harmonious rather than dramatic.</p>

<p>A round face and round glasses is a complement: both soft, both curved. A round face and square glasses is a contrast: the angular frames add structure to a curved face.</p>

<p>For wide faces, this principle plays out in a specific way. Wide faces tend to have prominent cheekbones and broad temples. The right frames acknowledge this proportionally: they're wide enough to span the face (155mm+), and their shape either adds visual height to counterbalance the breadth, or mirrors the face's natural roundness in a way that feels cohesive.</p>

<h2>Square and Rectangular Frames on Wide Faces</h2>

<h3>Why square frames work</h3>

<p>Square and rectangular frames are characterized by strong horizontal lines and right-angle corners. On a wide face, these do several things:</p>

<p><strong>They add vertical emphasis.</strong> The straight top and bottom edges of a square frame create a vertical visual element that counterbalances horizontal breadth. A wide face with square frames reads as broader and taller — more balanced overall.</p>

<p><strong>They project structure and authority.</strong> Angular corners communicate decisiveness. This is part of why rectangular frames have been the dominant professional eyewear shape for decades. On a wide face with strong bone structure, square frames look intentional and commanding.</p>

<p><strong>They suit defined jawlines.</strong> Wide faces with square or strong jawlines pair naturally with square frames — the shapes echo each other in a way that creates visual consistency.</p>

<h3>Who square frames suit on wide faces</h3>
<ul>
<li>Wide faces with rounded features (square adds contrast)</li>
<li>Faces with strong, defined jawlines</li>
<li>Those seeking a professional, authoritative aesthetic</li>
<li>Classic dressers who want eyewear that commands the room without demanding attention</li>
</ul>

<h3>The Woolet 009</h3>
<p>The 009 is Woolet's square model: a bold wayfarer silhouette at 158mm total width with 54mm lenses. The design draws from the classic wayfarer geometry — strong horizontal lines, defined corners — but scaled and proportioned specifically for 155mm+ faces. On a wide face, the 009 sits with visual authority. The frame doesn't look like a smaller pair of glasses stretched to fit. It looks like it was designed for exactly this face, because it was.</p>

<figure><img src="/images/woolet-009-square-glasses-wide-face.png" alt="Woolet 009 square wayfarer glasses for wide faces 155mm+ — Italian Mazzucchelli acetate, tortoiseshell, 158mm total width, 54mm lens, 5-barrel hinge detail" loading="lazy" style="width:100%;border-radius:6px;margin:0.5rem 0 1rem" /><figcaption style="font-size:0.7rem;opacity:0.5;text-align:center">Woolet 009 — Square wayfarer, 158mm, Mazzucchelli acetate</figcaption></figure>

<h2>Round Frames on Wide Faces</h2>

<h3>Why round frames work</h3>

<p>Round frames have a reputation as a "soft" or "artistic" choice, but their relationship with wide faces is more nuanced than that.</p>

<p><strong>They soften strong angular faces.</strong> Wide faces with prominent, square jawlines can be visually intense. Round frames introduce curves that counterbalance angular bone structure, creating a face that reads as broad but approachable.</p>

<p><strong>They emphasize the eyes.</strong> Round lenses frame the eyes in a way that draws the viewer's gaze upward and inward, rather than emphasizing the horizontal breadth of the face. This creates a sense of focus and presence.</p>

<p><strong>They have timeless intellectual credibility.</strong> Round frames carry decades of cultural association with thoughtfulness and considered style. From Le Corbusier to Steve Jobs, round frames project a specific kind of quiet confidence. On a wide face, properly proportioned round frames achieve this effect without looking borrowed from a narrower aesthetic.</p>

<h3>The critical condition: size must match face</h3>
<p>Round frames on wide faces only work when the frames are genuinely proportional to the face. A small round frame (50mm lens, 140mm total width) on a 160mm face looks like an accident — two tiny circles perched on a broad canvas.</p>

<p>For wide faces, round frames need lens diameters of 50mm or above and total frame widths of 155mm+. At this scale, the roundness reads as intentional and proportional.</p>

<h3>Who round frames suit on wide faces</h3>
<ul>
<li>Wide faces with soft, rounded features (the harmony of complementary shapes)</li>
<li>Wide, angular faces that need softening</li>
<li>Faces with high cheekbones and defined features</li>
<li>Those with a more considered, intellectual aesthetic sensibility</li>
<li>Anyone who wants presence without aggression</li>
</ul>

<h3>The Woolet 007</h3>
<p>The 007 is Woolet's round model: a keyhole-bridge silhouette at 158mm total width with 52mm lenses. The keyhole bridge — a teardrop-shaped nose piece characteristic of classic European eyewear — adds an element of refined detail that distinguishes the 007 from generic "round glasses." At 52mm lens diameter, the circles are large enough to maintain proportion on a 155mm+ face while retaining the clean, uncluttered geometry of true round eyewear.</p>

<figure><img src="/images/woolet-007-round-glasses-wide-face.png" alt="Woolet 007 round keyhole bridge glasses for wide faces 155mm+ — Italian Mazzucchelli acetate, tortoiseshell, 158mm width, 52mm lens, keyhole bridge detail" loading="lazy" style="width:100%;border-radius:6px;margin:0.5rem 0 1rem" /><figcaption style="font-size:0.7rem;opacity:0.5;text-align:center">Woolet 007 — Round keyhole bridge, 158mm, Mazzucchelli acetate</figcaption></figure>

<h2>How to Choose: A Decision Framework</h2>

<p>If you're deciding between round and square glasses for a wide face, work through these questions:</p>

<h3>1. What shape is your face?</h3>

<p><strong>Rounder face</strong> (soft features, less defined jawline): Square frames add the angular definition your face naturally lacks. The 009 is typically the stronger choice.</p>

<p><strong>Squarer or more angular face</strong> (strong jawline, prominent cheekbones): Both shapes work. Round frames (007) soften the angles and create interesting contrast. Square frames (009) create bold consonance — strong face, strong frame.</p>

<p><strong>Oval wide face</strong> (balanced proportions, slightly longer than wide): Both shapes work well. Choose based on the aesthetic impression you want to create.</p>

<h3>2. What context are these glasses for?</h3>

<p><strong>Professional / boardroom / formal:</strong> Square frames (009) tend to project authority and formality. The straight horizontal lines read as decisive and structured.</p>

<p><strong>Creative / intellectual / versatile:</strong> Round frames (007) have broader cultural range — they work in professional settings while also translating to creative and casual contexts.</p>

<p><strong>Weekend / casual:</strong> Both work. Consider which silhouette you naturally gravitate toward — structured vs. softer choices.</p>

<h3>3. What impression do you want to create?</h3>
<ul>
<li><strong>Commanding, authoritative, direct</strong> → Square (009)</li>
<li><strong>Thoughtful, considered, approachable</strong> → Round (007)</li>
<li><strong>Classic, timeless, versatile</strong> → Round (007)</li>
<li><strong>Bold, structured, professional</strong> → Square (009)</li>
<li><strong>Softened angles, refined contrast</strong> → Round (007)</li>
<li><strong>Echoed strength, visual coherence</strong> → Square (009)</li>
</ul>

<h2>What Both Shapes Have in Common</h2>

<p>For all their visual differences, the 007 and 009 share the fundamentals that matter most for wide-faced wearers:</p>

<ul>
<li><strong>158mm total width</strong> — engineered for faces 155mm and above. Both frames sit on wider faces without lateral compression, without the headaches, without the marks behind the temples.</li>
<li><strong>Italian Mazzucchelli acetate</strong> — the same material in both frames. Dense, dimensionally stable, plant-based, and produced by the manufacturer that has defined premium eyewear for over 175 years.</li>
<li><strong>150mm temples</strong> — long enough to wrap properly around larger skulls, distributing any residual pressure across a wider arc.</li>
<li><strong>Proportional lens sizing</strong> — 52mm (007) and 54mm (009), scaled to maintain visual balance on 155mm+ faces.</li>
</ul>

<p>The choice between round and square is a genuine aesthetic decision. But it's a decision you can make on purely stylistic grounds, because both options have already solved the fit problem.</p>

<h2>FAQ: Frame Shapes for Wide Faces</h2>

<h3>Do round glasses make a wide face look rounder?</h3>
<p>Not if they're properly sized. A small round frame on a wide face can emphasize the face's breadth. But a proportional round frame (52mm+ lens, 155mm+ total width) frames the eyes in a way that draws focus inward, creating balance rather than amplifying width.</p>

<h3>What face shape should wear square glasses?</h3>
<p>Square frames are particularly effective on oval, round, and heart-shaped faces, where the angular structure adds definition. They work on square faces too, creating bold visual consonance. For wide faces specifically, square frames add vertical emphasis that counterbalances horizontal breadth.</p>

<h3>Can you wear both styles depending on the occasion?</h3>
<p>Absolutely. Many wearers maintain two pairs for different contexts — a round pair for creative and intellectual environments, a square pair for formal professional settings. With both the 007 and 009 available in the same Italian acetate at 158mm, this is a natural pairing.</p>

<p><em>Woolet 007 (round, 158mm) and Woolet 009 (square, 158mm) — Italian acetate frames designed for 155mm+ faces. Join the waitlist at woolet.co.</em></p>

<p style="background:#F8F6F1;border-left:3px solid #c9a84c;padding:16px 20px;border-radius:4px;">Shape is taste; width is arithmetic. Before you choose between round and soft-square, <a href="/en/fit" style="color:#A07A2A;"><strong>measure your face with FitLens</strong></a> — 20 seconds on your phone camera, and you will know whether 158 mm is your number.</p>

`,
  },
  {
    slug: "wide-frame-glasses-professionals",
    title: "Wide Frame Glasses for Professionals: Office-Ready Eyewear for 155mm+ Faces",
    excerpt: "Wide-faced professionals deserve eyewear that fits AND commands respect. Here's what to look for in office-ready glasses for 155mm+ faces — and why most 'wide' options fall short.",
    date: "2026-02-20",
    readTime: 8,
    tags: ["Professional", "Office", "155mm+"],
    content: `
<p>Glasses are the one accessory most professionals wear every single day. They're on your face in every meeting, every Zoom call, every presentation. They're the first thing people see when they look at you, and they form part of the immediate impression you make before you've said a word.</p>

<p>For most professionals, this is unremarkable. They have their frames, the frames fit, and they move on.</p>

<p>For professionals with wide faces — faces measuring 155mm or more — it's rarely that simple. The options available at the intersection of "fits a wide face" and "looks premium and professional" have historically been either non-existent or hidden behind the kind of exhaustive searching that most people don't have time for.</p>

<p>This guide is for those professionals. Here's what to look for, what to avoid, and what's actually available.</p>

<h2>Why the Professional Context Specifically Matters</h2>

<p>Glasses worn casually can get away with imperfect fit. If you're wearing slightly-too-tight sunglasses for two hours at the weekend, the discomfort is manageable.</p>

<p>Glasses worn in a professional context are different:</p>

<p><strong>Duration:</strong> Most professionals wear their glasses for 8–12 hours on workdays. At this duration, even moderate temple pressure becomes significant. The tension headache that begins at hour four doesn't just affect your comfort — it affects your cognitive performance, your patience in meetings, your presence on calls.</p>

<p><strong>Visual scrutiny:</strong> In professional settings, people look at you. Glasses that are visibly too small for your face — with the telltale tension bow in the front and eyes pushed to the outer lens edges — read as ill-fitting in the same way that a suit jacket with stretched shoulders reads as ill-fitting.</p>

<p><strong>Zoom and video:</strong> The camera flattens and broadens faces. On a video call, the proportional relationship between your face and your glasses is more visible than in person. Glasses that are already slightly too narrow for your face look definitively too small on camera.</p>

<p><strong>First impressions and authority:</strong> Research on first impressions consistently shows that glasses influence perceived intelligence, competence, and trustworthiness. But this effect depends partly on the glasses fitting proportionally. Frames that appear undersized can inadvertently undermine the authority premium that well-fitting eyewear provides.</p>

<h2>What "Professional" Means in Eyewear</h2>

<p><strong>Material quality signals competence.</strong> Premium Italian acetate reads differently to the eye — and to the hand when someone picks up your glasses — than budget plastic. In rooms where details matter, material quality registers, even subliminally.</p>

<p><strong>Fit signals intentionality.</strong> Glasses that fit well look chosen. They look like part of a considered presentation of self. Glasses that are too tight, bowing at the front or compressing visibly at the temples, look like the best option available rather than the right option.</p>

<p><strong>Simplicity signals sophistication.</strong> The most credible professional eyewear tends toward clean lines and restrained detail. Not bland — there's a difference between minimal and generic — but without fussy embellishments that would look dated in five years.</p>

<p><strong>Timelessness over trend.</strong> Professional eyewear should still look appropriate in a decade. Round and square acetate frames in classic proportions have the longest aesthetic longevity of any eyewear category.</p>

<h2>The Specific Challenges for Wide-Faced Professionals</h2>

<h3>The narrow frame problem at scale</h3>
<p>A 10mm-too-narrow frame worn for 10 hours creates cumulative physical stress. Many wide-faced professionals have normalized end-of-day headaches without connecting them to their glasses. The connection becomes clear the first time they wear frames that genuinely fit.</p>

<h3>The casual-only wide-frame market</h3>
<p>Most glasses specifically designed for wide faces are designed for casual contexts: outdoor use, sport, lifestyle. The Fatheadzes and Faded Days of the world produce frames that work for weekend wear but would look out of place at a board meeting or a client presentation. The materials are too casual, the designs too sporty.</p>

<h3>The premium-but-too-narrow gap</h3>
<p>The brands that produce genuinely premium acetate eyewear suitable for professional contexts — MOSCOT, Cubitts, independent Italian brands — generally cap their "wide" options around 140–148mm. For someone with a 158mm face, this doesn't solve the problem.</p>

<h2>What to Look for in Professional Wide-Face Glasses</h2>

<p>Apply this checklist when evaluating any frame for professional daily wear:</p>

<p><strong>✓ Total frame width: 155mm minimum</strong></p>
<p>This is the baseline for any face measuring 155mm or above. Below this number, the frame will compress your temples. No amount of material quality or design sophistication compensates for a frame that physically hurts.</p>

<p><strong>✓ Italian acetate or premium metal</strong></p>
<p>For professional contexts, material communicates. Italian acetate — particularly from Mazzucchelli — has the color depth, surface quality, and tactile premium that registers in professional environments. Brushed titanium or gold-filled metal frames are the other premium option. Avoid injection-molded plastic in any professional context where first impressions matter.</p>

<p><strong>✓ Proportional lens width (52mm+)</strong></p>
<p>Lens width determines visual balance. On a 155mm+ face, lenses of at least 52mm maintain proportion. Narrower lenses create the undersized effect that undermines professional presence.</p>

<p><strong>✓ Neutral to dark colorways</strong></p>
<p>For professional contexts, dark tortoiseshell, matte black, deep navy, and classic horn work in virtually all settings. Bright or transparent frames narrow the range of contexts where the glasses work appropriately.</p>

<p><strong>✓ Full rim construction</strong></p>
<p>Full-rim acetate frames provide more visual structure and authority than semi-rimless or rimless designs. On wide faces, full rims also provide the visual weight needed to balance broad features.</p>

<p><strong>✓ Spring hinges</strong></p>
<p>For 8–12 hours of daily wear, spring hinges eliminate the minor temple pressure that accumulates from fixed hinges. Small difference in the short term, meaningful difference over a year of daily wear.</p>

<h2>Frame Shape for Professional Wide Faces</h2>

<p><strong>Square and rectangular frames</strong> are the conventional professional choice. The clean horizontal lines project structure and authority. In most traditional business environments, rectangular acetate frames in dark or tortoiseshell colorways represent the highest credibility-per-dollar ratio in eyewear.</p>

<p><strong>Round frames</strong> work exceptionally well in professional contexts where intellectual credibility and considered style matter: consulting, academia, creative leadership, legal and advisory roles. Round frames signal thoughtfulness rather than authority — which is often exactly the right signal.</p>

<p><strong>Avoid:</strong> Strong geometric shapes with unusual angles, half-rim designs that look fragile on wide faces, anything with visible branding or fashion-forward details that will look dated. Professional glasses should outlast trends.</p>

<h2>The Woolet 009 and 007 for Professional Wear</h2>

<h3>Woolet 009 — The Authority Frame</h3>
<p>The 009's square wayfarer silhouette is calibrated for professional contexts. Dark Italian acetate. Strong horizontal lines. Clean construction without embellishment. At 158mm and 54mm lenses, the 009 sits on a wide face with the proportional balance that conventional "wide" frames can't achieve. The result is eyewear that reads as intentional and authoritative — not "the widest thing I could find."</p>
<p><strong>Context:</strong> Boardroom, client presentations, legal and financial settings, video calls.</p>

<figure><img src="/images/woolet-009-square-glasses-wide-face.png" alt="Woolet 009 professional square glasses for wide faces — Italian acetate, 158mm frame, office-ready tortoiseshell eyewear for 155mm+ faces" loading="lazy" style="width:100%;border-radius:6px;margin:0.5rem 0 1rem" /><figcaption style="font-size:0.7rem;opacity:0.5;text-align:center">Woolet 009 — Professional square frame, 158mm</figcaption></figure>

<h3>Woolet 007 — The Considered Frame</h3>
<p>The 007's round keyhole-bridge design occupies the space between classic and contemporary. The keyhole bridge adds a point of distinction that separates the 007 from generic round frames. At 158mm and 52mm lenses, the circles are large enough to sit proportionally on wide faces without the "borrowed from a smaller face" quality that plagues most round eyewear for broader features.</p>
<p><strong>Context:</strong> Creative direction, consulting, advisory roles, any environment where intellectual presence and style matter equally.</p>

<figure><img src="/images/woolet-007-round-glasses-wide-face.png" alt="Woolet 007 round professional glasses for wide faces — Italian acetate, 158mm frame, keyhole bridge, premium eyewear for creative professionals with 155mm+ faces" loading="lazy" style="width:100%;border-radius:6px;margin:0.5rem 0 1rem" /><figcaption style="font-size:0.7rem;opacity:0.5;text-align:center">Woolet 007 — Round keyhole bridge, 158mm</figcaption></figure>

<h2>The Zoom Factor: Wide-Face Glasses on Camera</h2>

<p>Video calls have changed the professional eyewear equation. A significant proportion of professional interactions now happen on camera, where different dynamics apply.</p>

<p><strong>Cameras broaden faces.</strong> The lens compression in typical webcam and laptop cameras tends to flatten and widen faces. A face that measures 158mm in person can appear even broader on camera. This amplifies the disproportionate effect of frames that are already too narrow.</p>

<p><strong>Light reflection matters more on camera.</strong> High-gloss acetate surfaces can create distracting reflections under desk lighting during video calls. Matte or satin-finish acetate, or frames with a slight texture, reduce this effect.</p>

<p><strong>Frame width is more visible on camera.</strong> The contrast between frame width and face width is more perceptible at the flattened depth of a video call than in person. Properly proportioned frames (158mm on a 158mm face) look composed and intentional on camera in a way that undersized frames don't.</p>

<h2>FAQ: Professional Glasses for Wide Faces</h2>

<h3>What are the best glasses for wide-faced professionals?</h3>
<p>Frames combining total width of 155mm+, Italian acetate construction, and classic professional silhouettes (square or round) in dark or tortoiseshell colorways. Woolet's 007 and 009 are designed specifically for this combination.</p>

<h3>Do glasses affect how you're perceived professionally?</h3>
<p>Yes. Glasses influence perceived intelligence, competence, and authority. But this effect is contingent on the glasses fitting proportionally. Frames that are visibly too small for the wearer's face can undermine the credibility premium that well-fitting eyewear provides.</p>

<h3>Should I get prescription lenses in premium frames?</h3>
<p>Yes. Premium acetate frames are fully compatible with all standard prescription lenses, including high-index lenses for stronger prescriptions. Your optician can fit lenses into any Woolet frame.</p>

<h3>How long should professional glasses last?</h3>
<p>Italian acetate frames with proper care should last 8–12 years, significantly outlasting budget plastic alternatives. The per-year cost of a $300 frame worn daily for 10 years is $30/year — less than the cost of most professional accessories that receive far less use.</p>

<p><em>Woolet makes premium Italian acetate eyewear engineered for professionals with 155mm+ face widths. Two models: 007 (round, 158mm) and 009 (square, 158mm). Join the waitlist at woolet.co.</em></p>

<p style="background:#F8F6F1;border-left:3px solid #c9a84c;padding:16px 20px;border-radius:4px;">Not sure where you land? <a href="/en/fit" style="color:#A07A2A;"><strong>Get your number in 20 seconds</strong></a> with FitLens — your phone camera, a credit card for scale, and a face width in millimetres.</p>

`,
  },
  {
    slug: "best-glasses-for-big-heads-2026",
    title: "Best Glasses for Big Heads in 2026: Truly Wide Frames",
    excerpt: "Big head glasses frames that actually fit. Every brand selling a 150 mm+ front width compared — real measurements, keyhole bridges, and a 158 mm option.",
    date: "2026-02-14",
    readTime: 13,
    tags: ["Roundup", "2026", "Premium"],
    faq: [
      { q: "What brands make glasses bigger than 150 mm?", a: "Woolet (158 mm stock, 145–162 mm bespoke), Faded Days (155–165 mm), BXL Eyewear (145–165 mm), SizeGlasses (140–165 mm), some Jubleelens models, and traditional bespoke ateliers such as Tom Davies — all as listed by each brand. Mainstream brands generally cap at 145–148 mm." },
      { q: "Why are most glasses smaller than 150 mm?", a: "Industrial moulds were standardised around an average face width of 138–142 mm. Adding wider moulds is a capital cost mainstream brands will not carry for a segment they treat as niche." },
      { q: "Are 150 mm+ glasses prescription-compatible?", a: "Yes. Specialist wide-face brands ship frames lens-less so your optician can fit prescription lenses. No prescription range is specific to wide frames — anything your lens lab can produce fits a 158 mm frame." },
      { q: "What glasses actually fit big heads?", a: "Frames with a total front width of 155 mm or above. For prescription eyewear that means Woolet at 158 mm, BXL Eyewear and SizeGlasses up to 165 mm as listed by the brands. For sunglasses only, Faded Days reaches 165 mm." },
    ],
    content: `
<p>Finding glasses for a wider face has never been easy. Finding ones that genuinely fit, look sophisticated, and won't warp or discolor by the end of the year? That's been even harder.</p>

<p>This guide cuts through the noise. We've mapped the market carefully, measured the actual specifications (not just the labels), and identified what's worth considering across different price points in 2026. No padding, no filler — just an honest breakdown of who makes what, what fits what, and what the trade-offs actually are.</p>

<h2>What Size Glasses Do You Need for a Big Head?</h2>

<p>Before evaluating any frames, you need your face width in millimeters. Stand in front of a mirror and measure from the outermost edge of your left temple to the outermost edge of your right temple.</p>

<ul>
<li><strong>Under 145mm</strong> — Extra-wide. Specialist brands help but mainstream may work.</li>
<li><strong>145–154mm</strong> — XL. Dedicated wide-face brands required.</li>
<li><strong>155mm+</strong> — Specialty Wide. Purpose-built 155mm+ frames only.</li>
</ul>

<p>If you're consistently getting headaches from glasses or finding that "wide" options from mainstream brands still feel tight, your face likely measures 155mm or above. This guide is primarily for you.</p>

<h2>The 2026 Wide-Face Glasses Market: An Honest Overview</h2>

<p>The good news: the market has more options than it did five years ago. The honest news: most of those options are still concentrated in the budget tier, and many "wide" claims from mainstream brands remain overstated.</p>

<ul>
<li><strong>Premium Italian acetate for 155mm+ faces:</strong> Near-zero options until Woolet. This is the genuine gap in the market.</li>
<li><strong>Budget specialist brands:</strong> Several functional options exist (Faded Days, SizeGlasses, BXL Eyewear). Fit is real; materials and aesthetics are limited.</li>
<li><strong>Mainstream "wide" options:</strong> Warby Parker, Zenni, EyeBuyDirect all offer extended fits. Their widths cap at approximately 145–148mm — still inadequate for most truly wide faces.</li>
<li><strong>Premium heritage brands:</strong> MOSCOT, Cubitts offer premium acetate but their "large" options typically max around 140–148mm.</li>
</ul>

<h2>Best Glasses for Big Heads in 2026: By Category</h2>

<h3>🥇 Best Overall Premium: Woolet (woolet.co)</h3>
<p><strong>Width: 158mm | Price: $114 pre-order, $190 at launch | Material: Mazzucchelli acetate from Milan | Prescription: Yes</strong></p>

<p>Woolet is the answer to a question the premium eyewear market ignored for too long: why doesn't a sophisticated Italian acetate brand engineer frames specifically for 155mm+ faces?</p>

<p>Two models are available. The <strong>Woolet 007</strong> is a round keyhole-bridge frame with 52mm lenses at 158mm total width — a design that brings genuine European optical heritage to wider faces without the visual compromise of frames scaled up from a smaller platform. The <strong>Woolet 009</strong> is a bold square wayfarer at 158mm with 54mm lenses — structured, authoritative, built for professional contexts.</p>

<figure style="display:flex;gap:1rem;flex-wrap:wrap"><img src="/images/woolet-007-round-glasses-wide-face.png" alt="Woolet 007 round glasses for big heads — best premium wide face eyewear 2026, Italian acetate, 158mm, 52mm lens" loading="lazy" style="width:48%;min-width:200px;border-radius:6px" /><img src="/images/woolet-009-square-glasses-wide-face.png" alt="Woolet 009 square glasses for big heads — best premium wide face eyewear 2026, Italian acetate, 158mm, 54mm lens" loading="lazy" style="width:48%;min-width:200px;border-radius:6px" /></figure>

<p>Both frames are crafted from Mazzucchelli acetate, the benchmark material for premium eyewear since 1849. Both use 150mm temples and proportionally scaled bridge widths. Both are engineered from first principles for 155mm+ faces — not adapted from a standard frame.</p>

<p><strong>Who it's for:</strong> Wide-faced professionals who want premium Italian acetate eyewear that fits without compromise. Currently available via waitlist for priority access.</p>

<p><strong>Strengths:</strong> Only premium Italian acetate brand engineering specifically for 155mm+. Proportional design. Two strong silhouettes. Materials that hold shape across the wider span.</p>

<p><strong>Limitations:</strong> Pre-launch, limited availability at launch. Premium price point.</p>

<p><strong>Verdict:</strong> The obvious recommendation for anyone who's been forced to choose between fit and quality. This is both.</p>

<h3>🥈 Best Budget Premium: Cubitts (cubitts.com)</h3>
<p><strong>Width: Up to ~148mm (Large/XL) | Price: £125–310 | Material: Mazzucchelli acetate | Prescription: Yes</strong></p>

<p>Cubitts is the best-made accessible option that doesn't quite solve the problem. British-designed, Mazzucchelli-acetate-built, sold in London boutiques and online globally. The Large and XL options push toward 148mm — better than most mainstream brands, but still short of the 155mm threshold that genuinely wide faces require.</p>

<p>If your face measures 148–153mm, Cubitts is worth trying — you might find the fit acceptable, and the material quality is exceptional for the price. If you're 155mm+, the fit will likely still be too tight.</p>

<p><strong>Verdict:</strong> Excellent brand, excellent material, doesn't quite reach the width required for genuinely wide faces.</p>

<h3>🥈 Best Wide Sunglasses: Faded Days Sunglasses (fadeddayssunglasses.com)</h3>
<p><strong>Width: 155–165mm | Price: $50–155 | Material: TR90, polycarbonate | Prescription: No</strong></p>

<p>Founded by a wide-faced person, for wide-faced people. Faded Days makes sunglasses that genuinely fit 155mm+ faces, and their range extends to 165mm for broader faces. The founder's personal experience with the problem gives the brand an authenticity that's rare in this niche.</p>

<p>The limitations: TR90 plastic rather than acetate, primarily lifestyle/casual designs, no prescription option. For sunny days and outdoor use, Faded Days is a strong choice. For office wear or prescription use, you'll need something else.</p>

<p><strong>Verdict:</strong> Best wide-face sunglasses option for budget-conscious buyers. Strong fit credentials, casual aesthetic.</p>

<h3>Best Budget Prescription: SizeGlasses (sizeglasses.com)</h3>
<p><strong>Width: 140–165mm | Price: $59–99 (with lenses) | Material: TR90, acetate-polycarbonate blend | Prescription: Yes</strong></p>

<p>SizeGlasses exists to solve one problem: providing prescription glasses in genuine XL widths at accessible prices. They succeed. The range extends to 165mm, lens prescriptions are included in the listed price, and the fit for wider faces is real.</p>

<p>The trade-offs are material quality (budget plastic with limited longevity) and design range (functional over fashionable).</p>

<p><strong>Verdict:</strong> Best budget prescription option for 155mm+ faces. Functional, not fashionable.</p>

<h3>Best Budget Wide: BXL Eyewear (bxleyewear.com)</h3>
<p><strong>Width: 145–165mm | Price: $79–125 | Material: TR90, titanium, acetate options | Prescription: Yes</strong></p>

<p>BXL has the widest range of styles among the specialist budget brands, with options in TR90, titanium, and some acetate frames. The width range (145–165mm) is genuine, and the price-to-width ratio is strong.</p>

<p>For someone who needs multiple pairs, wants prescription options, and isn't willing to spend $300+ per frame, BXL is a solid choice.</p>

<p><strong>Verdict:</strong> Best mid-range wide-face brand. Good selection, honest sizing, reasonable quality.</p>

<h3>Best Heritage Option: MOSCOT (moscot.com)</h3>
<p><strong>Width: Varies (check individual specs) | Price: $300–500+ | Material: Premium acetate and metal | Prescription: Yes</strong></p>

<p>MOSCOT has been making glasses in New York since 1915. Their heritage is real, their acetate quality is genuine, and their design archive includes some of the most iconic optical shapes of the 20th century.</p>

<p>The limitation for wide faces: MOSCOT doesn't specify total frame widths consistently, and their "wide" options often cap below 150mm. Individual styles vary — some of their larger frames push toward 148mm — but confirmed 155mm+ fits are difficult to verify without trying them in person.</p>

<p><strong>Verdict:</strong> Exceptional heritage brand. Worth exploring if you're near a boutique and can try frames, but online ordering for wider faces is risky without confirmed width specs.</p>

<h3>Mainstream "Wide": Warby Parker (warbyparker.com)</h3>
<p><strong>Width: Up to ~148mm (Wide/Extra-Wide) | Price: $95–195 | Material: Acetate, metal | Prescription: Yes</strong></p>

<p>Warby Parker makes good glasses. Their Home Try-On program is genuinely useful, their customer service is strong, and their acetate quality is solid for the price.</p>

<p>But their "Extra-Wide" frames top out at approximately 148mm. For a 155mm+ face, this isn't enough — and Warby Parker's own site acknowledges this by noting frames "may not accommodate all face widths."</p>

<p><strong>Verdict:</strong> Strong brand, genuinely limited at 155mm+ face widths. Good starting point for faces in the 145–150mm range.</p>

<h2>Every brand selling 150 mm+, compared</h2>

<p>The honest list of brands actually shipping a 150 mm+ front width in 2026 is short. Here it is with the real numbers and trade-offs.</p>

<div style="overflow-x:auto;margin:24px 0;">
<table style="width:100%;border-collapse:collapse;font-family:'Barlow',sans-serif;font-size:13px;">
  <thead>
    <tr style="border-bottom:2px solid #0f0f0f;text-align:left;">
      <th style="padding:8px 10px;">Brand</th>
      <th style="padding:8px 10px;">Front (mm)</th>
      <th style="padding:8px 10px;">Material</th>
      <th style="padding:8px 10px;">Rx</th>
      <th style="padding:8px 10px;">Price</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #E8E4DC;"><td style="padding:8px 10px;">Woolet (stock)</td><td style="padding:8px 10px;">158</td><td style="padding:8px 10px;">Mazzucchelli acetate</td><td style="padding:8px 10px;">Yes</td><td style="padding:8px 10px;">$114–$190</td></tr>
    <tr style="border-bottom:1px solid #E8E4DC;"><td style="padding:8px 10px;">Woolet (bespoke)</td><td style="padding:8px 10px;">145–162</td><td style="padding:8px 10px;">Mazzucchelli acetate</td><td style="padding:8px 10px;">Yes</td><td style="padding:8px 10px;">$299–$480</td></tr>
    <tr style="border-bottom:1px solid #E8E4DC;"><td style="padding:8px 10px;">Faded Days</td><td style="padding:8px 10px;">155–165 (as listed by the brand)</td><td style="padding:8px 10px;">TR-90</td><td style="padding:8px 10px;">No</td><td style="padding:8px 10px;">$50–$155</td></tr>
    <tr style="border-bottom:1px solid #E8E4DC;"><td style="padding:8px 10px;">BXL Eyewear</td><td style="padding:8px 10px;">145–165 (as listed by the brand)</td><td style="padding:8px 10px;">Mixed</td><td style="padding:8px 10px;">Yes</td><td style="padding:8px 10px;">$79–$125</td></tr>
    <tr style="border-bottom:1px solid #E8E4DC;"><td style="padding:8px 10px;">SizeGlasses</td><td style="padding:8px 10px;">140–165 (as listed by the brand)</td><td style="padding:8px 10px;">TR-90 blend</td><td style="padding:8px 10px;">Yes</td><td style="padding:8px 10px;">$59–$99</td></tr>
    <tr style="border-bottom:1px solid #E8E4DC;"><td style="padding:8px 10px;">Jubleelens</td><td style="padding:8px 10px;">138–155 (as listed by the brand)</td><td style="padding:8px 10px;">Mixed</td><td style="padding:8px 10px;">Yes</td><td style="padding:8px 10px;">$30–$120</td></tr>
    <tr><td style="padding:8px 10px;">Tom Davies bespoke</td><td style="padding:8px 10px;">Custom</td><td style="padding:8px 10px;">Acetate, horn, Ti</td><td style="padding:8px 10px;">Yes</td><td style="padding:8px 10px;">$1,200–$3,200</td></tr>
  </tbody>
</table>
</div>

<p><strong>Faded Days (155–165 mm, as listed by the brand).</strong> The original wide-face sunglass specialist. Honest fit across the range and the right price for a casual pair. Trade-offs: TR-90 plastic rather than acetate, and sunglasses only — no prescription.</p>

<p><strong>BXL Eyewear (145–165 mm, as listed by the brand).</strong> The broadest range of shapes and materials in the specialist budget tier, with prescription available. Material quality is mixed: TR-90 at the low end, titanium and acetate higher up.</p>

<p><strong>SizeGlasses (140–165 mm, as listed by the brand).</strong> Functional, not fashionable. Best price if you need wide-fit prescription glasses and don't mind a recognisably budget plastic frame.</p>

<p><strong>Jubleelens (138–155 mm, as listed by the brand).</strong> An Amazon-first brand with a small subset of frames in the 150–155 mm range. Filter carefully; the published measurements are inconsistent.</p>

<p><strong>Tom Davies bespoke (custom width).</strong> The most established bespoke atelier in London: in-person consultations, CAD design, hand-finished frame. The price reflects the in-person service and bench labour.</p>

<p><strong>Mainstream "wide" lines — the caveat.</strong> Ray-Ban Wide Fit, Warby Parker Wide, Oakley XL, Persol Large mostly cap at 145–148 mm of front width, as listed by each brand. Below 150 mm of face width they work. At 150 mm or more they do not, regardless of how large the lens looks.</p>

<h3>How to decide which one to buy</h3>

<ul>
<li><strong>Premium daily-wear prescription frame at 155–161 mm:</strong> Woolet stock — 158 mm front, Mazzucchelli acetate from Milan, hand made in the EU, lens-less shipping to your optician.</li>
<li><strong>A width outside 155–161 mm:</strong> Woolet bespoke, any width from 145 to 162 mm, 4 shapes and 60 colour and size combinations.</li>
<li><strong>Casual sunglasses under $155:</strong> Faded Days.</li>
<li><strong>Prescription at the lowest price:</strong> SizeGlasses or BXL TR-90, accepting the material trade-off.</li>
<li><strong>Traditional bespoke with an in-person fitter:</strong> Tom Davies.</li>
</ul>

<h3>What to ask any brand before you buy</h3>

<ul>
<li>What is the hinge-to-hinge front width in millimetres (not lens width)?</li>
<li>What is the bridge width and the temple length?</li>
<li>What material is the frame — cellulose acetate, TR-90, injection plastic?</li>
<li>Does it accept prescription lenses, and does it ship lens-less to my optician?</li>
<li>What is the return policy if the fit is wrong?</li>
</ul>

<h2>What Nobody Tells You About Buying Wide-Face Glasses Online</h2>

<p><strong>"Wide" labels are relative, not absolute.</strong> Always check the actual millimeter measurement, not just the size label. A brand's "XL" may be 145mm. Another's "Large" may be 140mm. The number is what matters.</p>

<p><strong>Return policies matter more for wide-face buyers.</strong> Because so few brands reliably serve 155mm+ faces, the risk of ordering glasses that don't fit is higher. Prioritize brands with clear return policies and full-width specifications listed.</p>

<p><strong>Virtual try-on tools are imprecise for fit assessment.</strong> They're useful for style visualization. They're unreliable for predicting physical fit. A frame that looks right in a virtual try-on can still compress your temples if the total width is wrong.</p>

<p><strong>Read the actual reviews.</strong> Look specifically for reviews from people who mention having a wide or large head. Their fit experience is the most predictive indicator of whether a frame will work for your face.</p>

<h2>FAQ: Best Glasses for Big Heads</h2>

<h3>What glasses actually fit big heads?</h3>
<p>Frames with a total width of 155mm or above. The brands that reliably achieve this for prescription eyewear include Woolet (158mm, premium acetate), BXL Eyewear (up to 165mm, budget), and SizeGlasses (up to 165mm, ultra-budget). For sunglasses only, Faded Days reaches 165mm.</p>

<h3>What mm glasses do I need for a big head?</h3>
<p>Measure your face width temple to temple. For a 155mm face, look for frames of 155–161mm total width. The frame should approximately match your face width without compressing your temples.</p>

<h3>Are there stylish glasses for big heads?</h3>
<p>In 2026, yes — but primarily through Woolet. Most wide-face specialists have focused on fit over aesthetics, producing functional but casually-oriented frames. Woolet's 007 and 009 are the first premium Italian acetate frames designed specifically for 155mm+ faces with professional and sophisticated aesthetics.</p>

<h3>Do cheap wide glasses hold their shape?</h3>
<p>At 155mm+, material quality matters more than at standard widths. Budget injection-molded plastic deforms more readily under the structural stress of a wider span. Italian acetate (Mazzucchelli) maintains dimensional stability at 158mm far more effectively than budget alternatives.</p>

<h3>What's the most comfortable glasses for a wide face?</h3>
<p>Comfort at 155mm+ requires: (1) total frame width matching face width (155mm+ minimum), (2) 150mm temples, (3) spring hinges, (4) Italian acetate construction for long-term shape retention. Woolet's frames are engineered against all four criteria.</p>

<h2>The Bottom Line for 2026</h2>

<p>The market for glasses that fit big heads has grown, but remains imperfect. Budget options exist and serve their purpose. Premium options with genuine 155mm+ engineering have been essentially absent — until now.</p>

<p>If you've been waiting for the Italian acetate equivalent of what budget wide-face brands have been doing for years, 2026 is the year it arrives.</p>

<p><strong>The glasses for big heads that look like they belong on a discerning, style-conscious professional — because they do — are finally here.</strong></p>

<p><em>Woolet 007 (round, 158mm) and Woolet 009 (square, 158mm). Italian acetate. Engineered for 155mm+ faces. Join the waitlist at woolet.co for priority access and 15% off at launch.</em></p>

<p style="background:#F8F6F1;border-left:3px solid #c9a84c;padding:16px 20px;border-radius:4px;">Every recommendation above depends on one number you probably do not have yet. <a href="/en/fit" style="color:#A07A2A;"><strong>Scan your face with your phone</strong></a> — FitLens returns your temple-to-temple width and the front width that fits it.</p>

`,
  },
  {
    slug: "best-glasses-for-oval-face",
    title: "Best Glasses for an Oval Face (When Your Face Is Also Wide)",
    excerpt: "Oval-face fit advice usually assumes a 140mm standard frame. Here's how to choose shapes when your face is oval and 155mm+ wide — what works, what doesn't, and why.",
    date: "2026-05-17",
    readTime: 10,
    tags: ["Guide", "Face shape", "Oval"],
    content: `
<p>The standard advice for an oval face is simple: almost any frame shape works. That advice is correct — for the standard 140 mm frame on a standard 140 mm face. It breaks down quickly once you add a second variable that mainstream eyewear advice rarely covers: face width.</p>

<p>If your face is oval and 155 mm+ wide, the usual shape rules still apply, but the size question dominates. A perfectly proportioned round frame at 145 mm will still pinch your temples. A bold square at 148 mm will still slide forward by mid-afternoon. This guide is for the overlap — oval-faced adults who also need genuine 155 mm+ engineering.</p>

<h2>What an oval face actually means</h2>

<p>An oval face is defined by smooth, balanced proportions: forehead, cheekbones and jaw track roughly the same width, and the face is slightly longer than it is wide. There are no dominant angles, no extreme width-to-length ratios, and no single feature that needs softening or balancing.</p>

<p>This is why <em>any frame works</em> is the default oval advice. It is mostly true at standard sizes, where almost any shape lands inside the face's clean outline.</p>

<h2>Why width changes the rules</h2>

<p>At 155 mm+, the question shifts from <em>what shape suits an oval face</em> to <em>what shape suits an oval face that is also genuinely wide</em>. The answer narrows.</p>

<ul>
<li>Round frames remain flattering, but the lens needs to be large enough to match the wider front. A 50 mm lens on a 158 mm frame reads as balanced; a 46 mm lens on the same front reads as bug-eye small.</li>
<li>Soft square frames work especially well, because the structured corners add definition that wider faces can carry.</li>
<li>Aviators and narrow rectangles, which oval-face guides often recommend, become harder to justify above 155 mm. The lens height drops too low and emphasises the wider front.</li>
</ul>

<h2>How Woolet sizes apply to an oval face</h2>

<p>Woolet ships each shape in one precise size — 158 mm front width with a 21–22 mm keyhole bridge — and a bespoke tier from 145 to 162 mm. For an oval face, the size question reduces to a single measurement (temple to temple) without any shape compensation. Run the <a href="/en/fit">AI Fit Wizard</a> or the <a href="/en/fit/manual">credit-card method</a> to confirm 158 mm is right for you, then choose between shapes on aesthetic preference.</p>

<h3>Woolet 007 round / panto</h3>

<p>The classic oval-face round. At 158 mm with a 21 mm keyhole bridge, the round shape softens the face without dominating it. The keyhole bridge keeps the lens sitting at the right height even on faces with a higher cheekbone line.</p>

<h3>Woolet 009 soft square</h3>

<p>The more architectural choice. At wider sizes the soft-square shape reads as intentional and current rather than retro. Often a better daily-driver than the round for professional contexts.</p>

<h2>Mistakes to avoid</h2>

<ul>
<li><strong>Buying a small frame because oval faces "suit anything":</strong> the rule assumes standard width. Above 155 mm, a small frame creates the wrong proportion regardless of shape.</li>
<li><strong>Buying a frame with bridge width that does not scale:</strong> a 19 mm bridge on a 161 mm frame leaves a wide gap above the nose. Bridges should scale with the frame — 19 / 21 / 23 mm in the Woolet line.</li>
<li><strong>Choosing material on price alone:</strong> at 155 mm+ the front spans a wider arc, and budget plastic deforms over time. <a href="/en/blog/what-is-italian-acetate-premium-eyewear">Italian Mazzucchelli acetate</a> holds the shape it was cut at.</li>
</ul>

<h2>A short decision tree</h2>

<ol>
<li>Measure temple to temple. Under 155 mm, mainstream brands work and oval-face shape rules apply unchanged.</li>
<li>At 155 mm+, use the AI Fit Wizard to pick a Woolet size (158 mm) or move to bespoke if you are outside 152–168 mm.</li>
<li>Choose shape on preference: 007 round for softer features, 009 soft square for more structure.</li>
<li>Confirm with the 30-day return window. If the size feels off in person, exchange for the next size up or down.</li>
</ol>

<p>The combination of an oval face and a wider front is one of the easiest to fit once you stop trying to make 140 mm frames work. Start with the size, finish with the shape.</p>
`,
  },
  {
    slug: "do-blue-light-glasses-work-wide-face",
    title: "Do Blue Light Glasses Actually Work? (Plus What to Do If Your Face Is Wide)",
    excerpt: "Independent reviews on blue-light lenses, when they help, when they don't, and why the frame width matters more than the coating for 155 mm+ faces.",
    date: "2026-06-02",
    readTime: 10,
    tags: ["Lenses", "Blue Light", "Wide Face"],
    content: `
<p>Blue-light glasses have been one of the loudest eyewear trends of the last five years. Search interest for "do blue light glasses work" sits at roughly <strong>18,000 monthly searches</strong> in the US alone. The honest answer is more nuanced than either side of the marketing fight admits — and if your face measures 155 mm or more, there is a second question that gets ignored entirely: <em>can you even get a blue-light frame that fits you?</em></p>

<h2>What blue-light lenses actually do</h2>

<p>Blue-light filter lenses apply a coating (or use a tinted base material) that absorbs a portion of the high-energy visible light spectrum, typically in the <strong>380–460 nm</strong> range. Screens, LED bulbs and daylight all emit blue light in this band. Coatings reduce — they don't eliminate — the amount reaching the retina.</p>

<p>Two things are commonly conflated:</p>
<ul>
<li><strong>Glare reduction.</strong> Most blue-light coatings also reduce surface reflections from the lens, so the wearer sees fewer reflections of their own screen and ambient lighting. This is real and easy to notice.</li>
<li><strong>HEV filtering itself.</strong> This is the claim the marketing is built on: reduced eye strain, better sleep, less retinal stress.</li>
</ul>

<h2>What the evidence says</h2>

<p>The most cited independent review is the <strong>Cochrane systematic review (2023)</strong>, which pooled 17 randomized trials on blue-light filtering lenses. The headline finding: <em>limited evidence that blue-light blocking lenses provide short-term relief of digital eye strain</em>, and no convincing evidence for long-term retinal protection or sleep improvement at the wavelengths blocked by typical consumer coatings.</p>

<p>That is not the same as "they do nothing." Many users consistently report:</p>
<ul>
<li>Less perceived glare during long screen sessions</li>
<li>More comfortable evening computer or TV use</li>
<li>Easier transition from work-from-home screens to bedtime</li>
</ul>

<p>What we can say with confidence: blue-light coatings are <strong>not a placebo for everyone</strong>, but they are also not a medical-grade intervention. They are a comfort feature, similar to an anti-reflective coating, with a marketing layer attached.</p>

<h2>Where the wide-face question comes in</h2>

<p>If you have a face wider than 155 mm, almost every blue-light frame on the market is <em>technically inaccessible to you</em>. Warby Parker's "Wide" tops out around 145 mm. Felix Gray, the most-recognised blue-light specialist brand, sits at 140–148 mm across most models. Pair Eyewear's wide fit lands around 144 mm.</p>

<p>This is the same structural problem Woolet was built to solve for optical and sun lenses: mainstream eyewear caps at 145–148 mm of front width, and "wide" frames simply enlarge the lens cut-out, not the front. The result is the same temple pinch, the same all-day discomfort — only with a blue-light coating on top.</p>

<h2>What we did about it</h2>

<p>Woolet 007 (round) and 009 (soft square) ship at a <strong>158 mm front width with a 21–22 mm keyhole bridge</strong>. The blue-light filter is available as a <strong>lens upgrade (+$40)</strong> on either model, alongside polarized sunglass lenses (+$60) and a combined polarized + blue-light option (+$80). The same Italian Mazzucchelli acetate frame works for all of them — you choose the lens, not the frame.</p>

<p>For a 155 mm+ face, this collapses two problems (fit and coating) into one purchase, and gets the geometry right before layering on the lens. <a href="/en/collections/oversized-blue-light-glasses">Oversized blue-light glasses for wide faces</a> walks through the size logic in more detail.</p>

<h2>Should you buy a blue-light frame?</h2>

<p>A short decision tree:</p>
<ol>
<li><strong>If you work in front of a screen for 8+ hours daily and have noticed eye comfort issues in the evening:</strong> a blue-light coating is a low-risk add-on worth trying. Pair it with a 20-20-20 break habit and a properly-fitted frame.</li>
<li><strong>If you are looking for medical-grade protection against retinal damage:</strong> the evidence does not support that claim. Discuss with your optometrist instead.</li>
<li><strong>If your face is 155 mm or wider:</strong> fix the frame first. The most expensive premium blue-light coating on a frame that pinches your temples is the wrong purchase. Start with a frame that fits, then add the coating.</li>
</ol>

<h2>What to ask a brand before you buy</h2>

<ul>
<li><strong>What wavelength range is filtered?</strong> A clear lens with HEV filter that filters mostly in the 380–420 nm range is closer to UV-protection than what people picture as a "blue-light" lens.</li>
<li><strong>Is it a coating or an in-lens tint?</strong> Coatings can scratch off over time on cheap lenses. CR-39 in-lens treatments are more durable.</li>
<li><strong>What is the total front width of the frame?</strong> The first number on the temple is lens width, not front width. Ask for the hinge-to-hinge measurement. Anything below 150 mm is too narrow for a genuinely wide face.</li>
<li><strong>Does it pair with my prescription?</strong> Single-vision, progressive and plano lenses should all accept the upgrade.</li>
</ul>

<h2>The bottom line</h2>

<p>Blue-light glasses are a useful comfort feature with modest, mostly evening-and-glare-related benefits. They are not a medical product. The biggest mistake wide-faced buyers make is not in choosing the wrong coating — it is in buying a frame that doesn't fit, and then blaming the lens when their head still hurts. Get the 158 mm frame first. Then choose the lens.</p>

<p><a href="/en/collections/oversized-blue-light-glasses">Oversized blue-light glasses (158 mm)</a> | <a href="/en/collections/blue-light-glasses-for-wide-faces">Blue-light glasses for wide faces</a> | <a href="/en/products/007">Woolet 007 (round)</a> | <a href="/en/products/009">Woolet 009 (square)</a></p>

<p style="background:#F8F6F1;border-left:3px solid #c9a84c;padding:16px 20px;border-radius:4px;">A blue-light lens in a frame that pinches is still a frame that pinches. <a href="/en/fit" style="color:#A07A2A;"><strong>Measure your face with FitLens</strong></a> first — about 20 seconds, no app.</p>

`,
  },
  {
    slug: "best-oversized-sunglasses-big-heads-2026",
    title: "Sunglasses for Big Heads: The 2026 Buyer's Guide (155 mm+)",
    excerpt: "Big head sunglasses that actually fit: 155 mm+ fronts ranked by fit and material, XXL aviator-style options, polarized Cat 3 UV400, and which brands widen the front — not just the lens.",
    date: "2026-06-02",
    readTime: 11,
    tags: ["Roundup", "Sunglasses", "Big Heads", "2026"],
    content: `
<p>"Oversized" is the most over-used word in the sunglass market. Almost every major brand has an "oversized" line. Almost none of them are actually built for big heads — they enlarge the lens cut-out, keep the front at 138–148 mm, and call it a day. If you've ever bought an "oversized" pair from a mainstream brand and still felt the temples pinch by lunch, you already know.</p>

<p>This guide is for the people who measure 155 mm or more across the temples and want sunglasses that look <em>genuinely</em> proportional — and stay on your head past 3 pm.</p>

<h2>What "oversized for big heads" actually means</h2>

<p>Three measurements decide whether a sunglass frame fits a big head:</p>
<ul>
<li><strong>Front width (hinge to hinge).</strong> The headline number. For a 155 mm+ face you want 155 mm or more here. Mainstream "oversized" caps around 145–148 mm.</li>
<li><strong>Bridge.</strong> 17–19 mm fits a standard nose; 20–22 mm fits the wider noses that usually go with wider faces. A bridge that doesn't scale leaves the lens sitting too high on your cheekbones.</li>
<li><strong>Temple length.</strong> Standard temples are 140–145 mm. For a big head you want 148–155 mm so the arm reaches behind your ear with room to bend down, not straight out.</li>
</ul>

<h2>The 2026 shortlist</h2>

<h3>Woolet 007 / 009 — best overall for 155 mm+ faces</h3>
<p><strong>Front: 158 mm · Bridge: 21 mm · Temples: 150 mm · Material: Italian Mazzucchelli acetate · Lens: CR-39 Cat 3 polarized upgrade ($60), or polarized + blue-light combo ($80) · Price: $114 pre-order, $190 launch</strong></p>

<p>Woolet's 007 (round) and 009 (soft square) are the only premium Italian-acetate sunglasses we know of that are <em>engineered from the front out</em> for 155 mm+ faces — not retrofitted from a standard frame. Both models start at 158 mm with a 21–22 mm keyhole bridge as standard, and a bespoke tier extends 145–162 mm in either shape. Polarized lenses are a lens-level upgrade selected on the product page, so you pick the geometry first and the lens second.</p>

<p>For most buyers in the 155–161 mm face range, this is the obvious recommendation. For 161 mm+ faces, the bespoke route covers the rest. <a href="/en/collections/sunglasses-for-big-heads">Sunglasses for big heads (158 mm)</a> has the full size logic.</p>

<h3>Faded Days — best for casual / lifestyle use</h3>
<p><strong>Front: 155–165 mm · Material: TR-90 · Prescription: no · Price: $50–155</strong></p>
<p>The original wide-face sunglass specialist, founded by a wide-faced person. Faded Days does the fit honestly — 155 to 165 mm of real front width — and the price is right for a single-season pair. The trade-offs are TR-90 plastic (not acetate, lower long-term shape retention) and a casual/lifestyle aesthetic that does not always work in professional contexts. Strong pick if you want a wide pair for weekends and the beach without spending premium.</p>

<h3>BXL Eyewear — broadest range</h3>
<p><strong>Front: 145–165 mm · Material: TR-90, titanium, some acetate · Prescription: yes · Price: $79–125</strong></p>
<p>BXL has the widest range of shapes and materials in the specialist budget tier. The TR-90 lifestyle frames hit at $79–95; the titanium and acetate options go higher. The sizing claims are honest, the fit for 155 mm+ is real. Worth checking if you want multiple pairs at different price points and are willing to compromise on material quality.</p>

<h3>SizeGlasses — budget prescription oversized</h3>
<p><strong>Front: 140–165 mm · Material: TR-90, acetate-poly blends · Price: $59–99 with lenses</strong></p>
<p>Functional, not fashionable. Best price point if you need wide-fit sunglasses with prescription lenses included and you don't care that the frame is recognisably budget plastic. Fit is genuine; longevity is limited.</p>

<h3>What about mainstream "oversized"?</h3>
<p>Ray-Ban "Oversized", Warby Parker "Wide Fit", Quay "Oversized", Oakley XL — almost all of these cap at 140–148 mm of front width. For a face below 155 mm, they work. For a 155 mm+ face, they do not, regardless of how big the lens looks in the photo.</p>

<h2>XXL aviator-style frames</h2>

<p>Search "XXL aviator sunglasses" and most listings use "XXL" for a larger lens on a standard-width front: a 62 mm lens on a 140 mm front. On a 155 mm face or a 58 cm head, that frame pinches within an hour. A 62 mm lens on a 142 mm front pinches exactly as hard as a 58 mm lens on the same front — the hinge-to-hinge distance is identical.</p>

<p>The aviator is a specific silhouette: teardrop lenses, thin metal wire, straight temples. Ray-Ban built it in 1937 at 58–62 mm lens width on a roughly 140 mm front, and almost every "XXL aviator" since is a variation on that geometry — rarely above 148 mm hinge-to-hinge.</p>

<p><strong>Why metal aviators struggle above 155 mm.</strong> Metal aviators are cold-formed wire, usually monel, sometimes titanium. At 140–148 mm the wire is stiff enough to hold its shape. At 155–165 mm the same gauge flexes at the temples, and after 3–6 months of heat cycles — car dashboards, back pockets, sweat — the frame loses its set and slides down the nose. A thicker wire only makes the frame heavy and front-loaded. Cellulose acetate, block-cut from Mazzucchelli sheet, holds its geometry at wider spans because temple stiffness scales with cross-section rather than tensile strength.</p>

<p><strong>What to check on any XXL aviator-style frame:</strong></p>

<ol>
  <li><strong>A published front width of 155 mm or more.</strong> Not "oversized", not "XXL" — a millimetre number.</li>
  <li><strong>A bridge of 20 mm or more</strong>, ideally keyhole. A 17 mm saddle bridge on a 158 mm front pulls the lenses inward, off-centre from your pupils.</li>
  <li><strong>Temples long enough to clear a wider skull</strong> before they turn down behind the ear.</li>
  <li><strong>Acetate over thin metal or injection-moulded plastic.</strong> Acetate holds set at wider spans; metal fatigues at the temples.</li>
  <li><strong>UV400 as a baseline, polarized as an option.</strong></li>
</ol>

<p>Woolet does not make a metal teardrop aviator. The <a href="/en/products/007">007 round panto</a> (158 mm front, 21 mm keyhole bridge) is the closest silhouette without the metal fatigue, and the <a href="/en/products/009">009 soft square</a> (158 mm front, 20 mm keyhole bridge) is the squared-off equivalent. Both take the polarized lens upgrade. For a custom aviator-style front outside standard sizing, bespoke covers any width from 145 to 162 mm.</p>

<h2>Polarized or not?</h2>

<p>For sunglasses, the answer is usually yes. Polarized lenses block horizontal light reflections — water, wet roads, car hoods — and dramatically reduce glare during driving and outdoor sport. The only downsides are slightly reduced screen visibility (LCDs can show rainbow patterns) and a higher price.</p>

<p>On Woolet 007 and 009, the polarized lens is a $60 upgrade selected on the product page (Cat 3, 100% UVA/UVB). If you also want HEV filtering for outdoor screen use, the $80 combo upgrade layers blue-light filtering on top of the polarized base.</p>

<h2>FAQ</h2>

<h3>What size sunglasses do I need for a big head?</h3>
<p>Measure across the temples. If your face is 155 mm or more, you need a sunglass frame with a front width of 155 mm or more, a 20–22 mm bridge, and 148+ mm temples. Anything narrower will pinch within an hour.</p>

<h3>What size aviator sunglasses do I need for a big head?</h3>
<p>For a head circumference of 58 cm or a face width of 155 mm and above, look for a front width of at least 155 mm hinge-to-hinge and a bridge of 20 mm or wider. Most frames sold as "XXL aviators" are 140–148 mm across the front and still pinch at this size.</p>

<h3>Are oversized sunglasses for big heads polarized?</h3>
<p>It depends on the brand. Woolet's polarized lens is a $60 upgrade across both 007 and 009; Faded Days offers polarized as a standard option on most models; BXL and SizeGlasses offer polarized as an upgrade on selected SKUs.</p>

<h3>Where do you buy oversized sunglasses for big heads?</h3>
<p>Specialist wide-face brands like Woolet (premium acetate, 158 mm + bespoke), Faded Days (TR-90, 155–165 mm), BXL Eyewear (mixed materials, 145–165 mm) and SizeGlasses (budget, 140–165 mm). Mainstream "oversized" lines from Ray-Ban, Warby Parker and Oakley generally cap below 150 mm front width and are not built for big heads.</p>

<h3>Are oversized sunglasses still in style in 2026?</h3>
<p>Yes — but the silhouette has shifted. Cleaner, more architectural shapes (Woolet 009 soft square) and refined round panto designs (Woolet 007) are dominant, and the bug-eye plastic of the 2010s is largely out. Oversized in 2026 means proportional to a wide face, not theatrically large.</p>

<h3>Can I get prescription oversized sunglasses for big heads?</h3>
<p>Yes. Woolet 007 and 009 both accept prescription lenses, with the polarized or combo upgrade applied on top. SizeGlasses and BXL also offer prescription in their wide ranges; Faded Days does not at the time of writing.</p>

<p><a href="/en/collections/sunglasses-for-big-heads">Sunglasses for big heads — full collection</a> | <a href="/en/collections/oversized-sunglasses-men">Oversized sunglasses for men</a> | <a href="/en/products/007">Woolet 007 (round)</a> | <a href="/en/products/009">Woolet 009 (square)</a></p>

<p style="background:#F8F6F1;border-left:3px solid #c9a84c;padding:16px 20px;border-radius:4px;">Before you buy any pair on this list, <a href="/en/fit" style="color:#A07A2A;"><strong>get your number in 20 seconds</strong></a>. FitLens measures your face width from your phone camera and tells you whether 158 mm fits.</p>

`,
  },
  {
    slug: "what-size-sunglasses-for-wide-faces",
    title: "What Size Sunglasses for a Wide Face? 155mm+ Fit Guide",
    excerpt: "Stop pinching sunglasses. Wide faces (155mm+) need 155mm+ front width, a 20–22mm bridge and 148mm temples. Measure in 60 seconds and find frames that fit.",
    date: "2026-06-03",
    readTime: 7,
    tags: ["Sizing", "Sunglasses", "Wide Face"],
    faq: [
      {
        q: "What size sunglasses are best for a wide face?",
        a: "155 mm or more in front width (hinge to hinge), a 20–22 mm bridge, and temples of at least 148 mm. Below 155 mm front width, the frame will pinch — regardless of how big the lens looks.",
      },
      {
        q: "How do I measure my face width for sunglasses?",
        a: "Find the widest point of your face across the cheekbones. Use a credit card (85.6 mm) as a reference, or use the Woolet AI Fit Wizard for a precise measurement.",
      },
      {
        q: "What does 52□19 145 mean on sunglasses?",
        a: "Lens width — bridge — temple length, in millimetres. It does not tell you the front width (hinge to hinge), which is the number that actually decides whether a frame will fit a wide face. Ask the seller for hinge-to-hinge directly.",
      },
      {
        q: "Are oversized sunglasses the same as wide-face sunglasses?",
        a: "No. Oversized usually means a larger lens on a standard 140 mm front. Wide-face sunglasses scale the front width itself to 155 mm or more.",
      },
      {
        q: "Where do I buy sunglasses that actually fit a wide face?",
        a: "Specialist brands. Woolet 007 and 009 are 158 mm Italian-acetate sunglasses with bespoke up to 162 mm.",
      },
    ],
    content: `
<p>The single most common question we get from wide-faced buyers is also the simplest: <em>what size sunglasses do I actually need?</em> The short answer fits in one line — a front width of 155 mm or more, a 20–22 mm bridge, and temples of at least 148 mm. The long answer is what this guide is for: how to read the three numbers on a sunglass frame, how to measure your own face in under a minute, and how to avoid the most common sizing mistake.</p>

<h2>The one-line answer</h2>

<p>If your face measures 155 mm or more across the temples, you want a sunglass frame with:</p>
<ul>
<li><strong>Front width (hinge to hinge):</strong> 155 mm or more</li>
<li><strong>Bridge:</strong> 20–22 mm</li>
<li><strong>Temples:</strong> 148 mm or more</li>
</ul>

<p>Anything narrower will pinch within an hour, leave marks behind your ears, and slide forward on your nose when you sweat. This is not a styling preference — it is mechanics. A 140 mm frame on a 158 mm face has nowhere for the temples to go but outward, and the hinges take all the load.</p>

<h2>How to read the three numbers on a sunglass frame</h2>

<p>Most frames print a string like <code>52□19 145</code> on the inside of the temple. That is <strong>lens width — bridge — temple length</strong>, all in millimetres. It tells you almost nothing useful for wide-face sizing, because the number that actually matters is missing: <strong>front width</strong> (hinge to hinge).</p>

<p>You can estimate front width as: <em>(lens width × 2) + bridge + ~6 mm for the hinge area</em>. So <code>52□19</code> means roughly <code>52 + 52 + 19 + 6 = 129 mm</code> of front width — far too narrow for a 155 mm+ face. Or just ask the seller for the hinge-to-hinge measurement directly. Specialist wide-face brands publish it; mainstream brands usually do not.</p>

<h2>How to measure your face in under a minute</h2>

<p>You need one tool: a credit card (85.6 × 53.98 mm — same size globally) or a soft tape measure.</p>

<ol>
<li>Stand in front of a mirror in good light, looking straight ahead.</li>
<li>Find the widest point of your face — usually across the cheekbones, just below your eyes.</li>
<li>Hold the credit card horizontally against one cheekbone. Note where the other end falls relative to your other cheekbone.</li>
<li>Roughly: card fully across face = ~85 mm half-width, so total face width ≈ 145–150 mm. Card plus an inch of overlap on either side = 165 mm+ territory.</li>
</ol>

<p>For a precise number, our <a href="/en/fit">AI Fit Wizard</a> uses your phone camera and a credit card to give you a measurement accurate to within 2 mm. Or use the <a href="/en/fit/manual">manual credit-card method</a> if you prefer not to use the camera.</p>

<h2>Wide-face sunglass size brackets</h2>

<ul>
<li><strong>Face width 150–154 mm — medium-wide.</strong> A standard-large sunglass at 148–152 mm front width will work. Most mainstream "wide fit" lines (Ray-Ban Justin XL, Warby Parker Wide) hit this range.</li>
<li><strong>Face width 155–161 mm — wide.</strong> Standard mainstream sunglasses won't fit. You need a specialist wide-face brand. Woolet's 007 and 009 ship at 158 mm with a 21–22 mm bridge and 150 mm temples, designed exactly for this range.</li>
<li><strong>Face width 161–162 mm — extra wide.</strong> Off-the-shelf options are very limited. Bespoke is usually the only honest answer. Woolet's bespoke tier covers 145 to 162 mm of front width in either shape.</li>
<li><strong>Face width 162 mm+ — XXL.</strong> Custom only. Most bespoke programs stop at 162 mm.</li>
</ul>

<h2>The most common sizing mistake</h2>

<p>The biggest mistake wide-faced buyers make is sizing up the <em>lens</em> instead of the <em>frame</em>. "Oversized" at most mainstream brands means a larger lens cut-out on the same 140 mm front. The lens looks big in product photos, but the frame still pinches your temples. Always ask for the front width (hinge to hinge). If the brand can't or won't tell you, that is the answer — it is not built for a wide face.</p>

<h2>Bridge size matters more than you think</h2>

<p>Bridge is the gap between the two lenses. Mainstream sunglasses use a 17–19 mm bridge, designed for a standard nose. Wider faces almost always come with wider noses — a 20–22 mm bridge sits the frame correctly on your nose pads, distributes weight evenly, and stops the frame riding up onto your cheekbones when you smile. Woolet uses a 21 mm keyhole bridge as standard, with bespoke options between 16 and 26 mm.</p>

<h2>Quick FAQ</h2>

<h3>What size sunglasses are best for a wide face?</h3>
<p>155 mm or more in front width (hinge to hinge), a 20–22 mm bridge, and temples of at least 148 mm. Below 155 mm front width, the frame will pinch — regardless of how big the lens looks.</p>

<h3>How do I measure my face width for sunglasses?</h3>
<p>Find the widest point of your face across the cheekbones. Use a credit card (85.6 mm) as a reference, or use the <a href="/en/fit">AI Fit Wizard</a> for a precise measurement.</p>

<h3>What does 52□19 145 mean on sunglasses?</h3>
<p>Lens width — bridge — temple length, in millimetres. It does not tell you the front width (hinge to hinge), which is the number that actually decides whether a frame will fit a wide face. Ask the seller for hinge-to-hinge directly.</p>

<h3>Are oversized sunglasses the same as wide-face sunglasses?</h3>
<p>No. "Oversized" usually means a larger lens on a standard 140 mm front. Wide-face sunglasses scale the front width itself to 155 mm or more. See our <a href="/en/blog/best-oversized-sunglasses-big-heads-2026">2026 oversized sunglasses guide</a> for the difference in detail.</p>

<h3>Where do I buy sunglasses that actually fit a wide face?</h3>
<p>Specialist brands. Woolet 007 and 009 are 158 mm Italian-acetate sunglasses with bespoke up to 162 mm. <a href="/en/collections/sunglasses-for-big-heads">Sunglasses for big heads (158 mm)</a> has the full collection.</p>

<p><a href="/en/collections/sunglasses-for-big-heads">Sunglasses for big heads — full collection</a> | <a href="/en/collections/oversized-sunglasses-men">Oversized sunglasses for men</a> | <a href="/en/products/007">Woolet 007 (round)</a> | <a href="/en/products/009">Woolet 009 (square)</a></p>
`,
  },
  {
    slug: "bespoke-eyewear-size-range-150-172mm-guide",
    title: "Bespoke Eyewear 145–162 mm — The Complete Size Guide (2026)",
    excerpt: "Why bespoke exists between 150 and 162 mm, how the sizing actually works, and how to know whether a stock 155–161 mm Woolet or a made-to-measure frame is the right call.",
    date: "2026-06-16",
    readTime: 12,
    tags: ["Bespoke", "Sizing", "Wide Face", "2026"],
    faq: [
      {
        q: "What is bespoke eyewear?",
        a: "Bespoke eyewear is a frame cut and finished to one person's measurements rather than picked from a fixed size catalog. The frame width, bridge, temple length, and lens shape are all set from the wearer's face — typically captured with a scan or in-person measurement.",
      },
      {
        q: "What face width counts as bespoke territory?",
        a: "Most mainstream brands cap at 145–148 mm. Specialist wide-face brands cover roughly 155–161 mm with stock sizes. Anything below 150 mm or above 161 mm is bespoke territory — the size range where stock catalogs no longer carry an option that fits.",
      },
      {
        q: "How much do bespoke glasses cost?",
        a: "Atelier-made bespoke acetate frames typically retail at $900–$2,500. Woolet bespoke is $299 for the first 100 Kickstarter backers (frame only); prescription lenses are ordered separately at a local optician.",
      },
      {
        q: "How long does bespoke production take?",
        a: "About 8–10 weeks from approved measurements to delivery: scan and CAD approval in week 1, hand-finishing at the European atelier over 6–8 weeks, shipping in the final week.",
      },
      {
        q: "Bespoke vs stock — how do I decide?",
        a: "Run the AI Fit Scan first. If your face width lands between 155 and 161 mm with a 21–22 mm bridge, stock Woolet 007 or 009 will fit. If you're below 155 mm, above 161 mm, or your bridge falls outside 21–22 mm, bespoke is the only path that gets you a frame that actually fits.",
      },
    ],
    content: `
<p>Bespoke eyewear is one of the most misused words in the optical industry. Most brands that call themselves "bespoke" simply let you pick a color, swap a lens, or add an engraving on a frame whose underlying dimensions never change. That's customization. <strong>Bespoke means the dimensions themselves are made to one person.</strong></p>

<p>This guide explains where bespoke actually starts (it's not at 155 mm), why the 145–162 mm range exists, and how to know whether a stock Woolet 155–161 mm frame will work for you — or whether you need a made-to-measure pair.</p>

<div style="background:#F8F6F1;border-left:3px solid #c9a84c;padding:18px 22px;margin:24px 0;border-radius:4px;">
  <div style="font-family:'Barlow',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#888;margin-bottom:10px;">In one line</div>
  <p style="margin:0;font-size:15px;line-height:1.65;color:#1a1a1a;">Bespoke eyewear is for the faces stock catalogs can't fit — below 150 mm, above 161 mm, or with a bridge outside the 21–22 mm keyhole standard. Woolet bespoke covers 145–162 mm, hand-cut from a single block of Italian Mazzucchelli acetate.</p>
</div>

<h2>Why bespoke starts at 150 mm and ends at 162 mm</h2>

<p>The mainstream eyewear industry tops out at roughly 148 mm total frame width — that's Persol, Ray-Ban, Tom Ford, and almost every brand sold in mall opticals. Specialist wide-face brands extend that ceiling to around 155–161 mm with stock sizes. Above 161 mm, the catalog options collapse to almost zero.</p>

<p>The lower bound matters too. Faces measuring 150–154 mm are often <em>too wide for mainstream and too narrow for wide-face specialists</em>. They sit in a gap where no stock frame fits cleanly.</p>

<p>162 mm is the practical upper limit of a single-block acetate cut — beyond that, the frame's structural integrity drops and the temples need a metal core to stay rigid. Below 150 mm, mainstream "wide" frames already cover the range, so bespoke isn't economically justified.</p>

<h2>The complete 145–162 mm size table</h2>

<p>Use the table below to find your size band. Measurements are total frame width (lens + bridge + lens + hinge allowance), not just lens width.</p>

<div style="overflow-x:auto;margin:28px 0;">
<table style="width:100%;border-collapse:collapse;font-family:'Barlow',sans-serif;font-size:14px;">
<thead>
<tr style="background:#0f0f0f;color:#f0ece4;">
<th style="padding:14px 16px;text-align:left;font-weight:500;letter-spacing:1px;text-transform:uppercase;font-size:11px;">Face width</th>
<th style="padding:14px 16px;text-align:left;font-weight:500;letter-spacing:1px;text-transform:uppercase;font-size:11px;">Bridge</th>
<th style="padding:14px 16px;text-align:left;font-weight:500;letter-spacing:1px;text-transform:uppercase;font-size:11px;">Path</th>
<th style="padding:14px 16px;text-align:left;font-weight:500;letter-spacing:1px;text-transform:uppercase;font-size:11px;">Where it fits</th>
</tr>
</thead>
<tbody>
<tr style="border-bottom:1px solid #E8E4DC;"><td style="padding:14px 16px;"><strong>150–154 mm</strong></td><td style="padding:14px 16px;">16–20 mm</td><td style="padding:14px 16px;color:#c9a84c;">Bespoke</td><td style="padding:14px 16px;color:#555;">Gap between mainstream and Woolet stock</td></tr>
<tr style="background:#F8F6F1;border-bottom:1px solid #E8E4DC;"><td style="padding:14px 16px;"><strong>155 mm</strong></td><td style="padding:14px 16px;">21 mm</td><td style="padding:14px 16px;color:#0f0f0f;">Stock — Woolet 007 (S)</td><td style="padding:14px 16px;color:#555;">Round/panto, narrow stock size</td></tr>
<tr style="border-bottom:1px solid #E8E4DC;"><td style="padding:14px 16px;"><strong>158 mm</strong></td><td style="padding:14px 16px;">21–22 mm</td><td style="padding:14px 16px;color:#0f0f0f;">Stock — Woolet 007 / 009 (M)</td><td style="padding:14px 16px;color:#555;">Core size, covers most 155 mm+ buyers</td></tr>
<tr style="background:#F8F6F1;border-bottom:1px solid #E8E4DC;"><td style="padding:14px 16px;"><strong>161 mm</strong></td><td style="padding:14px 16px;">22 mm</td><td style="padding:14px 16px;color:#0f0f0f;">Stock — Woolet 009 (L)</td><td style="padding:14px 16px;color:#555;">Square, top of stock range</td></tr>
<tr style="border-bottom:1px solid #E8E4DC;"><td style="padding:14px 16px;"><strong>162–166 mm</strong></td><td style="padding:14px 16px;">22–24 mm</td><td style="padding:14px 16px;color:#c9a84c;">Bespoke</td><td style="padding:14px 16px;color:#555;">Above stock ceiling</td></tr>
<tr style="background:#F8F6F1;border-bottom:1px solid #E8E4DC;"><td style="padding:14px 16px;"><strong>167–162 mm</strong></td><td style="padding:14px 16px;">23–26 mm</td><td style="padding:14px 16px;color:#c9a84c;">Bespoke</td><td style="padding:14px 16px;color:#555;">Upper limit of acetate single-block cut</td></tr>
</tbody>
</table>
</div>

<p>The pattern is clean: <strong>three stock sizes</strong> (158 mm) cover the mainstream wide-face range, and <strong>bespoke covers everything else</strong> — both the 150–154 mm gap below and the 162–162 mm range above.</p>

<h2>What "bespoke" actually controls (and what it doesn't)</h2>

<p>Bespoke dimensions cover four things:</p>

<ul>
<li><strong>Frame width</strong> — total horizontal width, set to your temple-to-temple measurement plus a 4–6 mm clearance.</li>
<li><strong>Bridge width</strong> — distance between the lenses, sized to sit on the bone ridge rather than pinch the cartilage.</li>
<li><strong>Temple length</strong> — hinge to tip, matched to your ear position (not a default 145 mm).</li>
<li><strong>Pantoscopic tilt</strong> — the forward angle of the lens plane, useful if you have asymmetric ear height.</li>
</ul>

<p>Bespoke does <em>not</em> change the lens shape catalog. You still choose between the 007 round/panto silhouette and the 009 soft-square. The shape is the design language; bespoke just scales it precisely to your face.</p>

<h2>How the AI scan translates to bespoke dimensions</h2>

<p>The <a href="/en/fit">AI Fit Scan</a> captures four measurements from a 90-second phone scan: face width, bridge width, temple-to-temple distance, and ear position. Those four numbers map directly to the four bespoke dimensions above.</p>

<p>If the scan returns a face width inside 155–161 mm with a 21–22 mm bridge, you get a stock recommendation (007 or 009) and your bespoke decision is over. If any measurement falls outside that window, the scan routes you to the bespoke path with your numbers pre-filled — no re-measuring, no guesswork at the atelier.</p>

<h2>Stock vs bespoke — the honest comparison</h2>

<div style="background:#0f0f0f;color:#f0ece4;padding:26px 28px;margin:28px 0;border-radius:6px;font-family:'Barlow',sans-serif;">
  <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;margin-bottom:16px;font-weight:500;">Decision matrix</div>
  <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:14px;">
    <li style="font-size:14px;line-height:1.65;color:#f0ece4;padding-left:18px;border-left:2px solid #c9a84c;"><strong style="color:#fff;">Stock wins when</strong> your face is 155–161 mm with a 21–22 mm bridge. You get the same Mazzucchelli acetate at $114–$190, with a 2–3 week lead time instead of 8–10.</li>
    <li style="font-size:14px;line-height:1.65;color:#f0ece4;padding-left:18px;border-left:2px solid #c9a84c;"><strong style="color:#fff;">Bespoke wins when</strong> stock can't physically fit — face width outside 155–161 mm, bridge outside 21–22 mm, asymmetric ears, or unusual pantoscopic-tilt needs.</li>
    <li style="font-size:14px;line-height:1.65;color:#f0ece4;padding-left:18px;border-left:2px solid #c9a84c;"><strong style="color:#fff;">Neither wins when</strong> you're inside the stock range but want a one-of-one piece for aesthetic reasons. That's a legitimate use of bespoke, but the fit gain is zero.</li>
  </ul>
</div>

<h2>Why Italian Mazzucchelli acetate matters for bespoke</h2>

<p>Bespoke only works on a material that can be hand-shaped after the initial cut. Mazzucchelli acetate (from Milan, northern Italy) is denser than TR90 thermoplastic and can be heat-adjusted by any optician for ongoing fit corrections — even years after delivery. CNC-finished TR90 frames cannot be reshaped the same way.</p>

<p>That adjustability is the difference between a frame that fits for a week and one that fits for a decade. For deeper background, see <a href="/en/blog/what-is-italian-acetate-premium-eyewear">What is Italian acetate</a>.</p>

<h2>The bespoke process — week by week</h2>

<ol>
<li><strong>Week 1:</strong> Take the AI Fit Scan. CAD drawing is generated from your measurements and sent for approval.</li>
<li><strong>Weeks 2–7:</strong> The atelier cuts the frame from a single block of Mazzucchelli acetate, mills the lens slots, and hand-polishes the surface. No CNC finishing.</li>
<li><strong>Week 8:</strong> QC and final fitting check. Frame ships ready for lenses.</li>
<li><strong>Week 9–10:</strong> You take the frame to your local optician with your prescription, PD, and lens preference (clear, blue-light, polarized, or progressive).</li>
</ol>

<h2>Pricing — bespoke vs the market</h2>

<p>Comparable atelier-made bespoke acetate frames retail at $900–$2,500. Tom Davies bespoke starts around $1,800. Lindberg semi-custom titanium runs $1,200–$2,000. Cubitts bespoke is roughly $1,500.</p>

<p>Woolet bespoke is <strong>$299 for the first 100 Kickstarter backers</strong> (frame only; lenses ordered separately). The $1 reservation holds your spot; full charge happens when production starts.</p>

<h2>FAQ</h2>

<h3>What's the difference between custom and bespoke glasses?</h3>
<p>Custom usually means choosing options from a fixed menu — color, lens type, engraving — while the underlying frame dimensions stay the same. Bespoke means the dimensions themselves (frame width, bridge, temples) are made to one person's face. Most "custom" eyewear is not bespoke.</p>

<h3>Can bespoke frames be remade if my prescription changes?</h3>
<p>Yes. The frame is delivered without lenses, so any future prescription change is a lens swap at your optician — the frame itself stays. Acetate also reshapes with heat, so minor fit corrections happen at the optician too.</p>

<h3>Do I need to fly to Italy or visit a fitter?</h3>
<p>No. The entire process runs from the AI scan on your phone. The atelier receives the digitized measurements and a CAD approval — no in-person fitting needed.</p>

<h3>What if the bespoke frame doesn't fit when it arrives?</h3>
<p>Acetate is heat-adjustable at any local optician for free, which handles ~90% of fit issues. For dimensional problems beyond optician adjustment, the frame is remade — covered under the bespoke guarantee.</p>

<h2>Next steps</h2>

<p>Start with the <a href="/en/fit">AI Fit Scan</a> — it tells you in 90 seconds whether you're in stock territory (155–161 mm) or bespoke (150–154 mm or 162–162 mm). If you're already certain you need bespoke, go straight to <a href="/en/fit/bespoke">the bespoke size reference</a> or <a href="/en/bespoke">reserve a $299 spot</a>.</p>

<h2>Related articles</h2>
<ul>
<li><a href="/en/blog/made-to-measure-glasses-explained">Made-to-measure glasses explained</a> — what bespoke actually means and who needs it.</li>
<li><a href="/en/blog/why-glasses-dont-fit-155mm-problem">Why glasses don't fit at 155 mm+</a> — the industry sizing gap, in plain numbers.</li>
<li><a href="/en/blog/glasses-for-wide-faces-guide">Wide-face glasses: the complete guide</a> — stock options before you commit to bespoke.</li>
<li><a href="/en/blog/what-is-italian-acetate-premium-eyewear">What is Italian acetate?</a> — the material every bespoke frame is cut from.</li>
<li><a href="/en/fit">AI Fit Scan</a> — 90-second check whether you're in stock or bespoke territory.</li>
<li><a href="/en/bespoke">Reserve a $299 bespoke spot</a> — pre-launch pricing for 145–162 mm.</li>
</ul>
`,
  },
  {
    slug: "made-to-measure-glasses-explained",
    title: "Made-to-Measure Glasses: What They Are and Who Should Buy Them",
    excerpt: "Made-to-measure glasses build a frame to your face — not the average face. Here's how the process works, what it costs, and when stock simply won't fit.",
    date: "2026-06-17",
    readTime: 9,
    tags: ["Bespoke", "Made to Measure", "Guide"],
    faq: [
      { q: "What does made-to-measure glasses mean?", a: "Made-to-measure glasses are eyewear frames built to a single customer's face measurements — front width, bridge, temple length and tilt — rather than picked off a stock size run. The lenses are added separately by an optician." },
      { q: "Are made-to-measure glasses the same as bespoke?", a: "Functionally yes. 'Bespoke' is the British term, 'made-to-measure' the international one. Both describe a frame cut to a single buyer rather than a standard size grid." },
      { q: "How much do made-to-measure glasses cost?", a: "Mass-market brands don't sell them. Specialist ateliers in Italy, Japan and the UK charge $800–$3,000 per frame. Woolet's bespoke tier starts at $299 because the order is handled digitally and the frame is cut in our partner European atelier — no in-person fitter visits." },
      { q: "Do I need to fly somewhere to get measured?", a: "No. Woolet bespoke runs from an AI face scan on your phone. The atelier receives the digitized measurements and a CAD approval — no fitter visit required." },
      { q: "Who actually needs made-to-measure?", a: "People whose face width falls outside the 145–158 mm stock range — either narrower than 150 mm or wider than 161 mm — and people with an asymmetric bridge or strong temple curve that no stock size accommodates." },
    ],
    content: `
<p>Most eyewear is built for the average face. The average face is 138–142 mm wide. If yours is not, you have probably already spent years compensating — pinching frames at the temples, sliding them up your nose, or accepting the only "wide fit" your local store stocks. <strong>Made-to-measure glasses</strong> are the way out: a frame cut to your face, not to a size grid.</p>

<h2>The plain-English definition</h2>

<p>A made-to-measure frame is built to a single customer's measurements. The front width, bridge width, temple length, and pantoscopic tilt are all set to your face before the acetate is cut. The lenses are added separately by your local optician, the same way they would be for any frame.</p>

<p>This is distinct from <em>customised</em> glasses (where you pick a colour or engraving on a stock size) and from <em>"wide fit"</em> lines (where the brand has one larger stock size, not a frame cut to you).</p>

<h2>Why made-to-measure exists at all</h2>

<p>Eyewear sizing is a leftover from 1960s industrial production. Most factory lines run six size grades between roughly 130 mm and 148 mm of front width. Anything outside that grid was historically too expensive to tool — so it didn't get made.</p>

<p>The faces above and below that grid did not disappear. They just stopped buying glasses that fit. Survey data we collected from 1,800 Woolet waitlist sign-ups shows that <strong>23% of people with a face wider than 155 mm have given up on optical stores entirely</strong> and order online, accepting the return cycle as a cost of doing business.</p>

<h2>How the process works</h2>

<ol>
<li><strong>Measurement.</strong> A trained fitter takes face width, bridge width, temple length and pantoscopic tilt. Traditional ateliers do this in person. Woolet does it through an AI face scan on your phone (~90 seconds, credit-card calibration).</li>
<li><strong>CAD design.</strong> The atelier turns your measurements into a CAD file in the chosen shape (round, square, panto, aviator). You approve the renders before any material is cut.</li>
<li><strong>Cutting.</strong> A block of Italian Mazzucchelli acetate is milled to your CAD on a 5-axis CNC. The cut takes 20–40 minutes per frame.</li>
<li><strong>Hand finishing.</strong> The cut frame is tumbled in walnut chips for 5–7 days to polish the surface, then hand-finished — hinge fitting, temple bending, edge bevelling. This is what makes the difference between a CNC blank and a finished frame.</li>
<li><strong>Delivery.</strong> The frame ships without lenses to your address. You take it to any local optician for prescription, polarized or blue-light lenses.</li>
</ol>

<h2>Made-to-measure vs stock — who should buy what</h2>

<ul>
<li><strong>Face width 145–158 mm:</strong> a stock wide-fit frame is usually the right call. Woolet 007 and 009 both ship at 158 mm and cover this range at $190 launch ($114 pre-order).</li>
<li><strong>Face width &lt; 145 mm or &gt; 161 mm:</strong> stock will not fit cleanly. Made-to-measure is the honest answer. Woolet bespoke runs 145–162 mm.</li>
<li><strong>Strongly asymmetric face or unusual bridge:</strong> made-to-measure is the only path. Even a "wide fit" stock frame assumes symmetry.</li>
<li><strong>You just want a unique frame:</strong> a customised stock frame (engraved, custom colour) is usually a better value than full bespoke unless the geometry actually requires it.</li>
</ul>

<h2>What it costs and why</h2>

<p>Traditional made-to-measure ateliers — Tom Davies in London, Nakanishi in Tokyo, several Italian houses in Cadore — charge $800–$3,000 per frame. The cost reflects two in-person fitter visits, hand drafting, and bench labour at a workshop rate that hasn't shifted in two decades.</p>

<p>Woolet bespoke starts at <strong>$299</strong>. The price is lower for one reason: the measurement and approval happen digitally, so the atelier handles only the cutting and finishing. The frame is still milled from Mazzucchelli acetate and Hand made in EU — the labour is the same, the overhead is not. <a href="/en/blog/how-much-do-bespoke-glasses-cost">Full cost breakdown is here</a>.</p>

<h2>The realistic timeline</h2>

<p>From scan to delivery, a Woolet bespoke order takes 4–6 weeks. The breakdown:</p>
<ul>
<li><strong>Days 1–3:</strong> CAD design and your render approval.</li>
<li><strong>Week 2:</strong> CNC cut from your acetate block.</li>
<li><strong>Weeks 3–4:</strong> Tumbling and hand finishing.</li>
<li><strong>Week 5:</strong> Quality check and shipping.</li>
</ul>

<p>Traditional made-to-measure ateliers usually quote 8–14 weeks. The shorter cycle is the second benefit of removing the fitter visits.</p>

<h2>What can still go wrong</h2>

<p>Two things, both correctable. Acetate is heat-malleable, so any local optician can adjust temple length, nose-pad angle and frame curvature in ten minutes — that handles roughly 90% of fit corrections. For dimensional issues beyond local adjustment, Woolet's bespoke guarantee remakes the frame at no charge.</p>

<h2>Next step</h2>

<p>The fastest way to find out whether you need made-to-measure or whether stock will fit is the <a href="/en/fit">AI Fit Scan</a> — 90 seconds, no commitment. If you already know you're outside the 155–161 mm stock range, the <a href="/en/fit/bespoke">bespoke size reference</a> shows the full 145–162 mm grid, and <a href="/en/bespoke">$299 reservations</a> are open.</p>

<h2>Related articles</h2>
<ul>
<li><a href="/en/blog/bespoke-eyewear-size-range-150-172mm-guide">Bespoke eyewear size guide (145–162 mm)</a> — the full pillar reference.</li>
<li><a href="/en/blog/how-much-do-bespoke-glasses-cost">How much do bespoke glasses cost?</a> — line-by-line price breakdown.</li>
<li><a href="/en/blog/handmade-italian-acetate-eyewear-process">The handmade in the EU from Italian acetate process</a> — what your $299 actually buys.</li>
<li><a href="/en/blog/handcrafted-vs-machine-made-glasses">Handcrafted vs machine-made glasses</a> — where the difference is real.</li>
<li><a href="/en/fit">AI Fit Scan</a> — 90-second check before you go bespoke.</li>
<li><a href="/en/bespoke">Reserve a $299 bespoke spot</a> — pre-launch pricing for 145–162 mm.</li>
</ul>
`,
  },
  {
    slug: "custom-prescription-glasses-for-wide-faces",
    title: "Custom Prescription Glasses for Wide Faces: A Practical Guide",
    excerpt: "Custom prescription glasses for 155 mm+ faces — how to combine a wide-fit frame with progressive, single-vision or blue-light lenses without overpaying.",
    date: "2026-06-17",
    readTime: 8,
    tags: ["Prescription", "Wide Face", "Custom"],
    faq: [
      { q: "Can I get prescription lenses in oversized wide-face frames?", a: "Yes. Woolet 007 and 009 (158 mm front) and the bespoke tier (145–162 mm) all accept single-vision, progressive and bifocal prescriptions. The frame ships without lenses so your local optician fits the prescription you actually use." },
      { q: "Do progressives work in a 158 mm wide-face frame?", a: "Yes — and they work better than in a standard 140 mm frame. The taller lens gives the optician more vertical room for the progressive corridor, which means a smoother distance-to-reading transition and less head tilt." },
      { q: "Why don't most prescription brands offer 155 mm+ widths?", a: "Lens-fitting tooling and frame moulds in mass-market optical labs are set for 130–148 mm front widths. Adding wider widths is a capital cost most chains won't take on for what they consider a niche segment." },
      { q: "What does custom prescription mean — the frame, the lens, or both?", a: "Both can be customised. A custom frame is cut to your face (made-to-measure). A custom lens is ground to your prescription, PD and the frame curve. Most 'custom prescription' brands customise only the lens — Woolet's bespoke tier customises both." },
      { q: "Where can I get prescription glasses for a big head?", a: "From a brand that publishes a total front width above 155 mm, not from a wide filter inside a mainstream catalogue. Woolet 007 and 009 ship at a 158 mm front with 150 mm temples and arrive lens-less, so any local optician can fit your prescription. Bespoke covers 145–162 mm." },
      { q: "Are prescription glasses for big heads the same as for wide faces?", a: "Almost always the same product. Face width decides the front measurement, head circumference decides the temple length, and a 59–61 cm head usually pairs with a 155–161 mm face. If your head is 62 cm or more, bespoke specifies 152–155 mm temples alongside the wide front." },
    ],
    content: `
<p>If your face is wider than 155 mm and you need a prescription, you have probably had this exact conversation in an optical store: "We don't make this frame in your prescription range" or "We can do the prescription, but only in these three frames" — pointing to a wall of identical narrow rectangles. <strong>Custom prescription glasses for wide faces</strong> exist precisely to end that conversation.</p>

<h2>What "custom prescription" actually means</h2>

<p>The phrase gets used loosely. There are two independent things being customised:</p>

<ul>
<li><strong>The frame.</strong> A standard frame in a stock size run, or a made-to-measure frame cut to your face.</li>
<li><strong>The lens.</strong> A stock lens (limited PD and prescription ranges) or a free-form digitally surfaced lens ground to your prescription, pupillary distance and frame geometry.</li>
</ul>

<p>"Custom prescription glasses" usually means the lens is custom. For wide-face buyers, the frame side matters at least as much — a perfect lens in a frame that pinches your temples is still uncomfortable.</p>

<h2>The wide-face problem in two sentences</h2>

<p>Mainstream prescription brands cap their frame moulds at 140–148 mm of front width. If your face is 155 mm or more, no amount of lens customisation rescues a frame that is mechanically too narrow.</p>

<h2>The three buying paths</h2>

<h3>1. Stock wide-fit frame + custom prescription lens (most common)</h3>

<p>You buy a wide-fit frame from a specialist brand and have your local optician fit the lenses. Woolet 007 and 009 both ship at 158 mm with a 21–22 mm bridge and 150 mm temples; the frame arrives lens-less and your optician handles the prescription. Cost: $190 frame ($114 pre-order) + your usual lens fee at the optician (typically $80–$300 depending on lens type and coatings).</p>

<p>This is the right path for 80% of wide-face buyers — face width 155–161 mm, standard prescription, single-vision or progressive.</p>

<h3>2. Made-to-measure frame + custom prescription lens (precision route)</h3>

<p>The frame itself is cut to your face. Woolet's bespoke tier covers 145–162 mm of front width with a matching bridge and temple grid. The frame still ships lens-less to your local optician. Cost: $299 frame + standard lens fee.</p>

<p>Right path if your face is below 150 mm or above 161 mm, or if you have an asymmetric bridge, strong cheekbone projection, or any other geometry that stock cannot accommodate.</p>

<h3>3. Full custom (frame + lens cut together)</h3>

<p>The frame and lenses are designed as a single optical system — usually by traditional ateliers like Tom Davies or specialist independent opticians. The result is excellent for very strong prescriptions (above ±6.00) or for unusual sport/safety requirements. Cost: $1,500–$5,000 total.</p>

<p>Worth it only for strong prescriptions or specialist use cases. For everyday wear, paths 1 and 2 deliver the same daily experience at a fraction of the price.</p>

<h2>What to ask your optician</h2>

<ul>
<li><strong>Will this frame accept my prescription?</strong> Most CR-39 and high-index lenses up to ±6.00 fit any standard frame. Above ±6.00 the lens thickness matters and a smaller eye box can help.</li>
<li><strong>Are my PDs in the lens fitting range?</strong> Wide faces often have wider PDs (66–74 mm). Your optician should measure this for the frame you bring in, not assume from your last pair.</li>
<li><strong>Progressive corridor length.</strong> Standard progressives need 14–18 mm of vertical lens height. A 158 mm wide-face frame gives that comfortably; some narrow trend frames do not.</li>
<li><strong>Coating options.</strong> Anti-reflective is worth it for any prescription. Blue-light filter is a comfort add-on (see <a href="/en/blog/do-blue-light-glasses-work-wide-face">our review</a>). Polarized lenses are for sunglass conversions.</li>
</ul>

<h2>What it should not cost</h2>

<p>A wide-fit frame plus single-vision prescription lenses at a good independent optician should land at $270–$500 total. A wide-fit frame plus progressives lands at $400–$700. Anything above that for a standard prescription is either premium lens technology (Zeiss DriveSafe, Varilux X-series) or a margin you can negotiate.</p>

<h2>Prescription glasses for big heads — the same problem, a different search</h2>

<p>"Prescription glasses for big heads" and "prescription glasses for wide faces" describe one product and two ways of noticing the same failure. Face width is the measurement that decides whether a frame front reaches across you; head circumference is what decides whether the temple arms reach around you. Big-head buyers usually arrive with the second complaint — arms that grip in front of the ear, tips that press behind it — and assume they need a longer arm rather than a wider front.</p>

<p>In practice the two travel together. A head circumference of 59–61 cm typically comes with a face width of 155–161 mm, which is exactly the band the 158 mm signature front is cut for, paired with 150 mm temples at an 11° drop. A 62 cm head on a 160 mm face is the case where the arm becomes the binding constraint and bespoke specifies 152–155 mm temples instead.</p>

<p>The prescription side does not change with head size. The frame ships lens-less either way, your optician grinds to your PD — which on a big head commonly runs 66–74 mm — and progressives benefit from the taller lens a wide frame allows. What changes is only the frame geometry, and that is the part that no mainstream prescription chain tools for. If you are not sure which of the two measurements is failing you, <a href="/en/fit" style="color:#A07A2A;">FitLens returns face width and bridge in about 20 seconds</a> from your phone camera.</p>

<h2>Where Woolet fits</h2>

<p>The frame is the part we control. Woolet 007 and 009 are designed front-out for 155 mm+ faces, both ship lens-less, and your local optician handles the prescription using the lenses they already stock. You pay $190 for a frame that fits — your optician charges you the same lens price they would for any frame.</p>

<p>Next step: <a href="/en/fit">measure your face</a> · <a href="/en/products/009">view 009</a> · <a href="/en/bespoke">bespoke at $299</a>.</p>

<h2>Related articles</h2>
<ul>
<li><a href="/en/blog/bespoke-eyewear-size-range-150-172mm-guide">Bespoke eyewear size guide (145–162 mm)</a> — the full pillar reference.</li>
<li><a href="/en/blog/glasses-for-wide-faces-guide">Wide-face glasses: the complete guide</a> — stock-frame options first.</li>
<li><a href="/en/blog/how-to-measure-face-width-for-glasses">How to measure your face width for glasses</a> — get the input right before ordering.</li>
<li><a href="/en/blog/glasses-for-wide-nose-bridge-21-22mm-explained">Wide nose-bridge glasses (21–22 mm)</a> — the second axis after face width.</li>
<li><a href="/en/fit">AI Fit Scan</a> — your measurements in 90 seconds.</li>
<li><a href="/en/bespoke">Reserve a $299 bespoke spot</a> — for prescriptions outside the stock grid.</li>
</ul>
`,
  },
  {
    slug: "how-much-do-bespoke-glasses-cost",
    title: "How Much Do Bespoke Glasses Cost? A Real Breakdown (2026)",
    excerpt: "Bespoke eyewear prices in 2026 — Tom Davies, Cartier, European ateliers and Woolet compared. Why the same handmade frame can cost $300 or $3,000.",
    date: "2026-06-18",
    readTime: 9,
    tags: ["Bespoke", "Pricing", "Buying Guide"],
    faq: [
      { q: "How much do bespoke glasses cost in 2026?", a: "Traditional ateliers (Tom Davies, Nakanishi, Italian houses in Cadore) charge $800–$3,000 per frame. Luxury fashion houses (Cartier, Chrome Hearts) charge $2,000–$15,000. Woolet's digital bespoke starts at $299 because the order is handled remotely — the frame is still milled and Hand made in EU." },
      { q: "How much do Tom Davies bespoke glasses cost?", a: "Tom Davies bespoke runs roughly £950–£2,500 (about $1,200–$3,200) depending on material and complexity. The price includes two in-person fitter consultations and the workshop labour, which is most of the cost." },
      { q: "Why are bespoke glasses so expensive?", a: "Most of the cost is human labour — fitter visits, CAD drafting, bench finishing — not material. The acetate block itself costs about $25–$60. Cutting it costs $40–$120 of CNC time. Everything else is people: typically 8–16 hours of skilled labour per frame at workshop rates." },
      { q: "Are bespoke glasses worth the money?", a: "If your face is outside the 145–158 mm stock range, yes — there is no equivalent stock option that fits. If you are inside the stock range, only if you specifically want a unique shape or material. For most 155–161 mm faces, a wide-fit stock frame at $190 is the better buy." },
    ],
    content: `
<p>Search for "bespoke glasses cost" and you'll see numbers from $300 to $15,000 quoted for what sounds like the same thing — a frame cut to your face from Italian acetate. The spread is real, and once you understand what drives it, you can pick the right tier instead of overpaying or underbuying.</p>

<h2>The 2026 price map</h2>

<table style="width:100%;border-collapse:collapse;margin:24px 0;font-family:'Barlow',sans-serif;font-size:14px;">
  <thead>
    <tr style="border-bottom:2px solid #0f0f0f;text-align:left;">
      <th style="padding:10px 12px;">Tier</th>
      <th style="padding:10px 12px;">Brand examples</th>
      <th style="padding:10px 12px;">Price per frame</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #E8E4DC;">
      <td style="padding:10px 12px;">Digital bespoke</td>
      <td style="padding:10px 12px;">Woolet (145–162 mm)</td>
      <td style="padding:10px 12px;">$299–$499</td>
    </tr>
    <tr style="border-bottom:1px solid #E8E4DC;">
      <td style="padding:10px 12px;">Independent atelier</td>
      <td style="padding:10px 12px;">Tom Davies, Nakanishi, Lindberg custom</td>
      <td style="padding:10px 12px;">$800–$3,000</td>
    </tr>
    <tr style="border-bottom:1px solid #E8E4DC;">
      <td style="padding:10px 12px;">Luxury fashion bespoke</td>
      <td style="padding:10px 12px;">Cartier, Chrome Hearts, Maybach</td>
      <td style="padding:10px 12px;">$2,000–$15,000</td>
    </tr>
    <tr>
      <td style="padding:10px 12px;">Heritage commission</td>
      <td style="padding:10px 12px;">Maison Bonnet, Jacques Marie Mage one-off</td>
      <td style="padding:10px 12px;">$3,000–$25,000</td>
    </tr>
  </tbody>
</table>

<p>Lenses are extra at every tier and are typically added by your local optician — $80–$300 for standard prescription, more for premium progressives.</p>

<h2>What you are actually paying for</h2>

<p>Material cost is almost identical across tiers. A block of Mazzucchelli M49 Italian acetate large enough for one frame is $25–$60 wholesale. Hand-finishing supplies (walnut tumbling media, hinges, temple cores) add $30–$70. So roughly <strong>$60–$130 of materials per frame</strong>.</p>

<p>Everything else is labour and overhead. The breakdown for a traditional $1,500 bespoke frame looks like this:</p>

<ul>
<li>Two in-person fitter visits with a master optician: $250–$400</li>
<li>CAD design and approval cycle: $150–$250</li>
<li>CNC cut and bench finishing (8–14 hours of skilled labour): $400–$700</li>
<li>Workshop overhead, packaging, guarantee: $150–$250</li>
<li>Materials: $60–$130</li>
</ul>

<p>At luxury tiers, additional cost is brand margin, retail-store overhead, and premium material specifications (gold leaf, buffalo horn). The frame is not meaningfully better optically.</p>

<h2>Why Woolet bespoke is $299</h2>

<p>We removed the part that dominates traditional pricing: the in-person consultations. The AI face scan captures the measurements remotely. CAD approval happens by email. The atelier — the same European workshop tradition, the same Mazzucchelli acetate, the same hand-finishing — receives a complete digital order and cuts the frame.</p>

<p>The bench labour is the same. The fitter labour is not in the price because there is no fitter visit. That single change cuts the cost by roughly $500–$700 per frame.</p>

<p>The $299 price is a Kickstarter price for the first 100 backers; the regular bespoke price afterward is $499, still well below traditional ateliers.</p>

<h2>How to decide which tier you actually need</h2>

<p>The honest version of the buying logic:</p>

<ul>
<li><strong>Face width 155–161 mm, no special requirements:</strong> a stock wide-fit frame ($190 Woolet 007 or 009) is the right buy. Bespoke is not necessary.</li>
<li><strong>Face width &lt;150 mm or &gt;161 mm, or asymmetric face:</strong> bespoke is necessary. Start at the $299 digital tier; only step up if the digital process can't accommodate a specific feature you need.</li>
<li><strong>You want a unique material (buffalo horn, real tortoise, gold inlay):</strong> traditional atelier or heritage commission is the only path. Plan on $2,000+.</li>
<li><strong>You want the brand experience (Cartier C de Cartier, Chrome Hearts):</strong> this is fashion, not eyewear engineering. Buy on those terms and budget accordingly.</li>
</ul>

<h2>What "bespoke" should always include</h2>

<p>Regardless of tier, a fair bespoke offer should give you:</p>

<ul>
<li>CAD renders for your approval before any material is cut</li>
<li>Italian acetate (Mazzucchelli M49 or equivalent) or a clearly named alternative material</li>
<li>Hand-finishing — not just CNC-cut and shipped</li>
<li>A remake guarantee if the dimensional fit is wrong on delivery</li>
<li>Lens-free shipping so your local optician fits the prescription</li>
</ul>

<p>If any of these is missing at any price point, ask why.</p>

<h2>The hidden cost most people forget</h2>

<p>If you have a wide face and you've been buying stock glasses that don't quite fit, the real cost is the cycle: $200 frame, return, $250 frame, return, $300 frame, keep and tolerate. We've seen waitlist members tell us they've spent $1,500+ over five years on frames they no longer wear. At that point a single $299 bespoke frame that actually fits is the cheap option, not the expensive one.</p>

<p>Next step: <a href="/en/fit">measure your face</a> to find out whether you're inside or outside the 155–161 mm stock range, then either <a href="/en/products/009">009 stock at $190</a> or <a href="/en/bespoke">bespoke at $299</a>.</p>

<h2>Related articles</h2>
<ul>
<li><a href="/en/blog/bespoke-eyewear-size-range-150-172mm-guide">Bespoke eyewear size guide (145–162 mm)</a> — the full pillar reference.</li>
<li><a href="/en/blog/made-to-measure-glasses-explained">Made-to-measure glasses explained</a> — definitions and who actually needs it.</li>
<li><a href="/en/blog/handmade-italian-acetate-eyewear-process">The handmade in the EU from Italian acetate process</a> — where the cost comes from.</li>
<li><a href="/en/blog/handcrafted-vs-machine-made-glasses">Handcrafted vs machine-made glasses</a> — which premium is worth paying.</li>
<li><a href="/en/fit">AI Fit Scan</a> — confirm stock vs bespoke in 90 seconds.</li>
<li><a href="/en/bespoke">Reserve a $299 bespoke spot</a> — pre-launch pricing for 145–162 mm.</li>
</ul>
`,
  },
  {
    slug: "handmade-italian-acetate-eyewear-process",
    title: "How Handmade Acetate Eyewear Is Actually Made",
    excerpt: "From a Mazzucchelli acetate block in Milan to a finished frame, hand made in EU — the steps, the tools, and what 'handmade' should actually mean in 2026.",
    date: "2026-06-18",
    readTime: 10,
    tags: ["Handmade", "Italian Acetate", "Craftsmanship"],
    faq: [
      { q: "How is handmade in the EU from Italian acetate eyewear made?", a: "A block of Mazzucchelli acetate is milled on a 5-axis CNC to the frame shape, then tumbled in walnut chips for 5–7 days to polish the surface, then hand-finished — hinge fitting, temple bending, edge bevelling — by a bench technician. Total labour per frame is 8–16 hours." },
      { q: "What does 'handmade' mean for glasses in 2026?", a: "Honest 'handmade' means the cutting may be CNC (it almost always is — hand-cutting acetate is no longer commercial) but every finishing step is done by a person at a bench. The polishing, hinging, bending and final QC cannot be automated to the standard a premium frame requires." },
      { q: "What is Italian acetate?", a: "Italian acetate is cellulose acetate sheet manufactured by Italian houses — primarily Mazzucchelli (near Milan since 1849). It is denser and holds colour more deeply than injection-moulded plastic, and it is heat-malleable for optician fitting." },
      { q: "Why is it called 'made in Cadore'?", a: "Cadore is a valley in the Italian Dolomites where the modern eyewear industry was founded in the late 19th century. Most of the world's premium acetate frames — Luxottica, Marcolin, Safilo, plus dozens of independent ateliers — are still made there." },
    ],
    content: `
<p>"Handmade in the EU from Italian acetate" is one of the most over-claimed phrases in eyewear marketing. Plenty of brands print it on the temple of a frame that was injection-moulded in southern China and never touched by a human until the QC sticker went on. The phrase has a real meaning — and once you know what each step looks like, you can tell the difference in your hand.</p>

<h2>Where it's made</h2>

<p>The world's premium acetate eyewear industry is concentrated in two places: <strong>Cadore</strong>, a valley in the Italian Dolomites, and <strong>Sabae</strong>, a city on Japan's west coast. Both regions specialise because the skilled bench technicians who hand-finish frames live there — the talent is geographic, the way Swiss watchmaking is geographic.</p>

<p>Woolet's stock production runs in our EU atelier, using the same bench process described above. The acetate itself comes from <strong>Mazzucchelli 1849</strong> near Milan — the oldest acetate manufacturer in the world, supplying everyone from Persol to Cutler &amp; Gross.</p>

<h2>Step 1 — The acetate block</h2>

<p>Cellulose acetate arrives at the atelier as rectangular blocks, roughly 150 × 150 × 8 mm, in whatever colour pattern has been ordered. The pattern is not painted on — it is woven into the block itself, with up to 20 sheets of differently-tinted acetate laminated together under heat and pressure. Slice the block at any angle and the pattern continues through. This is why a high-quality acetate frame keeps its colour even after years of polishing scratches off.</p>

<p>An $25–$60 block produces one to two frames depending on shape and material loss.</p>

<h2>Step 2 — CNC cutting (20–40 minutes per frame)</h2>

<p>The block is mounted in a 5-axis CNC mill and cut to the CAD file for the chosen shape. This is the one step where "handmade" gets honestly modernised — hand-cutting acetate to optical precision is no longer commercial. Even the most traditional ateliers in Cadore have used CNC for thirty years. The difference between a good atelier and a cheap factory at this step is the CAD file (shape geometry, lens-cut angle, hinge seating) and the mill quality, not whether a human held the cutter.</p>

<h2>Step 3 — Tumbling (5–7 days)</h2>

<p>The cut frames are dropped into rotating drums filled with crushed walnut shells, sometimes mixed with wax. The drums turn 24 hours a day for five to seven days. The walnut media slowly rounds the edges, removes the CNC tool marks, and brings up a warm matte polish that no machine can replicate. This is the step that separates a hand-finished frame from a stock injection mould — and the step you can feel immediately on a frame, before you even put it on.</p>

<p>A cheap factory will tumble for 12–24 hours and ship. The frame feels sharp on the temple edges and looks slightly dull. A proper Cadore atelier will not cut this step short.</p>

<h2>Step 4 — Hinging (~30–45 minutes per frame)</h2>

<p>Hinges arrive as separate brass or stainless components. Each hinge is hand-set into the temple end of the frame: the technician heats the acetate locally with a hot-air gun, inserts the hinge core, lets the acetate cool around it, then trims and polishes the join. A well-set hinge is invisible from the outside and indestructible from normal wear; a badly-set hinge wobbles within a year.</p>

<h2>Step 5 — Temple bending and tilt setting</h2>

<p>The temples are bent to the temple-end-piece angle on a wooden form, again with heat. The pantoscopic tilt (the slight forward angle of the lens plane) is set by hand. These two adjustments are why two identical frames can fit two faces completely differently — and why a local optician can refine the fit later by reheating and re-bending.</p>

<h2>Step 6 — Hand polishing and QC</h2>

<p>Final polishing happens at the bench with cloth wheels and polishing compounds, by hand. The frame is checked for symmetry on a measuring jig, the hinges are tested to a defined tension, and the QC stamp goes on. From cut block to QC stamp, total labour per frame is 8–16 hours of bench time.</p>

<h2>What about machine-finished frames?</h2>

<p>Machine finishing exists and is cheaper. Injection-moulded plastic frames (not acetate — different material) take 30 seconds to make and require no bench labour. They are functional, often perfectly fine for $40–$120 frames. They are not handmade in the EU from Italian acetate, and they should not be sold as such.</p>

<p>The trick to spot one: weight, edge feel, and how the colour catches light. Injection-moulded plastic is lighter than acetate (lower density), has slightly sharper edges where the mould met, and the colour pattern is printed on a single layer rather than woven through the block.</p>

<h2>Why this still matters in 2026</h2>

<p>You could argue that for a $190 frame, none of this matters. But two things keep handmade in the EU from Italian acetate worth paying for:</p>

<ul>
<li><strong>Durability.</strong> A properly hand-finished acetate frame, kept reasonably, lasts 8–15 years. Injection-moulded plastic frames usually become hinge-loose at year 3 and are not worth re-hinging.</li>
<li><strong>Fit malleability.</strong> Acetate is heat-adjustable. Any local optician can warm and reshape the frame for $0–$20. Injection plastic cannot — what you got is what you keep.</li>
</ul>

<h2>Where Woolet's frames come from</h2>

<p>Woolet 007 and 009 are cut from Mazzucchelli M49 Italian acetate and finished by hand in our EU atelier — the same process described above, applied to a frame engineered front-out for 155 mm+ faces. The bespoke tier uses the same atelier, the same acetate, with a CAD file generated from your AI face scan instead of a stock shape file.</p>

<p>Next step: <a href="/en/products/009">view 009</a> · <a href="/en/about">about our atelier partner</a> · <a href="/en/fit">measure your face</a>.</p>

<h2>Related articles</h2>
<ul>
<li><a href="/en/blog/bespoke-eyewear-size-range-150-172mm-guide">Bespoke eyewear size guide (145–162 mm)</a> — the full pillar reference.</li>
<li><a href="/en/blog/what-is-italian-acetate-premium-eyewear">What is Italian acetate?</a> — the material the atelier starts from.</li>
<li><a href="/en/blog/handcrafted-vs-machine-made-glasses">Handcrafted vs machine-made glasses</a> — what handwork actually changes.</li>
<li><a href="/en/blog/made-to-measure-glasses-explained">Made-to-measure glasses explained</a> — how bespoke fits into the wider market.</li>
<li><a href="/en/fit">AI Fit Scan</a> — start the bespoke flow from your phone.</li>
<li><a href="/en/bespoke">Reserve a $299 bespoke spot</a> — pre-launch pricing for 145–162 mm.</li>
</ul>
`,
  },
  {
    slug: "handcrafted-vs-machine-made-glasses",
    title: "Handcrafted vs Machine-Made Glasses: What Actually Differs",
    excerpt: "What 'handcrafted' really means in eyewear today, where the line between hand and machine sits, and when paying more for handcrafted is worth it.",
    date: "2026-06-19",
    readTime: 8,
    tags: ["Handcrafted", "Buying Guide", "Quality"],
    faq: [
      { q: "Are handcrafted glasses worth it?", a: "For a daily-worn frame you expect to keep 5+ years, yes — the hand-finishing steps (tumbling, hinging, bending) determine how long the frame stays comfortable and structurally tight. For a fashion frame you rotate seasonally, no — injection-moulded plastic is fine." },
      { q: "How can I tell if glasses are really handcrafted?", a: "Three tests. Weight: acetate is denser than injection plastic, a hand-finished frame feels solid. Edge feel: hand-tumbled edges are warm and rounded, not sharp. Colour: laminated acetate keeps its pattern when scratched; printed plastic shows white underneath." },
      { q: "Is CNC cutting still 'handcrafted'?", a: "Yes, by industry convention. Hand-cutting acetate to optical precision is no longer commercial — every premium atelier uses CNC for the rough cut. 'Handcrafted' refers to the finishing steps (tumbling, hinging, bending, polishing), which cannot be automated to the quality required." },
      { q: "Do machine-made glasses last as long?", a: "Usually no. Injection-moulded plastic frames are typically hinge-loose by year 3 and not worth re-hinging. Hand-finished acetate frames last 8–15 years with normal wear and can be heat-adjusted indefinitely at any optician." },
    ],
    content: `
<p>Every eyewear brand claims handcrafted in their marketing. Almost none of them mean the same thing. This guide is a plain-English look at what hand and machine actually do in 2026 eyewear, which steps matter for daily life, and when paying more for handcrafted is worth it.</p>

<h2>The line between hand and machine</h2>

<p>Modern premium eyewear is a mix. The line sits at the same place across every honest atelier in Italy and Japan:</p>

<ul>
<li><strong>Machine:</strong> the rough cut from the acetate block (CNC), the lens-cut and bridge geometry (CAD-defined), and some final QC measurement.</li>
<li><strong>Hand:</strong> tumbling supervision, hinge fitting, temple bending, pantoscopic tilt setting, final polishing, fit QC.</li>
</ul>

<p>Hand-cutting acetate disappeared from commercial production in the 1990s. Even Maison Bonnet, the most traditional bespoke atelier in Paris, uses CNC for the initial cut and applies the hand work afterwards. Anyone claiming "fully hand-cut" acetate in 2026 is either lying or pricing at $5,000+ per frame.</p>

<h2>What hand-finishing actually adds</h2>

<h3>1. Edge comfort</h3>
<p>A walnut-tumbled frame has rounded, warm edges that sit on your temple without irritation. An injection-moulded frame has slightly sharper mould-line edges that you feel after a few hours of wear. Tumbling takes 5–7 days; cheaper factories shortcut it to 12–24 hours and the difference is immediate.</p>

<h3>2. Hinge longevity</h3>
<p>A hand-set hinge — heated acetate around a fitted brass or stainless core — keeps tension for 8–15 years. An injection-moulded snap hinge typically loosens within 2–4 years and cannot be re-tensioned without replacing the whole temple.</p>

<h3>3. Fit adjustability</h3>
<p>Acetate is heat-malleable. Any local optician can warm the frame and reshape the temple bend, the nose pads, the pantoscopic tilt — in ten minutes, for $0–$20. Injection-moulded plastic glasses cannot be adjusted because the material is brittle when heated. What you bought is what you wear.</p>

<h3>4. Colour depth</h3>
<p>Hand-finished acetate frames use laminated acetate sheets — the colour pattern is woven through the block, not printed on the surface. Polish through 1 mm of frame thickness and the pattern continues. Injection-moulded plastic uses surface pigment that wears off, showing the lighter base material underneath.</p>

<h2>Where machine-made is fine</h2>

<p>Injection-moulded plastic frames are not bad. They are honest at their price. For:</p>

<ul>
<li>A second or third pair you rotate seasonally</li>
<li>A reading-only frame you keep on your desk</li>
<li>Kids' frames that will be replaced in 18 months anyway</li>
<li>A backup pair for travel</li>
</ul>

<p>...spending $300+ on hand-finished acetate is overspending. A $40–$120 injection-moulded frame from a mainstream brand is the right purchase.</p>

<h2>Where handcrafted is worth it</h2>

<ul>
<li>Your primary daily frame, worn 8+ hours a day</li>
<li>You want the frame to last more than 5 years</li>
<li>You have a wide face and need a 155 mm+ front — injection moulds don't go this wide reliably</li>
<li>You expect to take it to an optician for fit adjustments</li>
<li>You care how the colour and finish look in two years, not just unboxing day</li>
</ul>

<h2>How to tell what you're holding</h2>

<p>Three quick tests, no jeweller's loupe required:</p>

<ol>
<li><strong>Weight in hand.</strong> Acetate is roughly 1.25 g/cm³; injection plastic is 1.05 g/cm³. A 158 mm acetate frame weighs 28–35 g; an equivalent injection plastic frame weighs 20–26 g. You can feel the difference.</li>
<li><strong>Run a finger along the temple edge.</strong> Tumbled acetate is warm and smooth. Mould-line plastic has a faint ridge along the edge where the two mould halves met.</li>
<li><strong>Look at the colour at a deep scratch (find a returned demo pair).</strong> Laminated acetate shows the same colour layers all the way through. Pigment-printed plastic shows white or grey underneath.</li>
</ol>

<h2>What honest brands tell you</h2>

<p>A brand confident in its production will name:</p>

<ul>
<li>The country and ideally the region (Cadore, Italy; Sabae, Japan)</li>
<li>The acetate supplier (Mazzucchelli, Takiron, Daicel)</li>
<li>The hinge supplier or material (e.g. "OBE German hinges")</li>
<li>The tumbling duration (5–7 days for premium; if they don't list it, ask)</li>
</ul>

<p>If the country, atelier, acetate supplier and hinge are all missing from the product page or "about" page, it is almost certainly an injection-moulded frame with a marketing layer.</p>

<h2>Where Woolet sits</h2>

<p>Woolet 007 and 009 are CNC-cut and hand-finished in our EU atelier from Mazzucchelli M49 acetate from Milan, with German-made OBE 5-barrel hinges. The bespoke tier uses the same atelier and same materials with a CAD file generated from your AI face scan. Full atelier details are on the <a href="/en/about">about page</a>.</p>

<h2>Related articles</h2>
<ul>
<li><a href="/en/blog/bespoke-eyewear-size-range-150-172mm-guide">Bespoke eyewear size guide (145–162 mm)</a> — the full pillar reference.</li>
<li><a href="/en/blog/handmade-italian-acetate-eyewear-process">The handmade in the EU from Italian acetate process</a> — step-by-step inside the atelier.</li>
<li><a href="/en/blog/what-is-italian-acetate-premium-eyewear">What is Italian acetate?</a> — why the material matters before the method.</li>
<li><a href="/en/blog/how-much-do-bespoke-glasses-cost">How much do bespoke glasses cost?</a> — the price of handwork, line by line.</li>
<li><a href="/en/fit">AI Fit Scan</a> — see whether handmade bespoke is right for your face.</li>
<li><a href="/en/bespoke">Reserve a $299 bespoke spot</a> — Hand made in EU, pre-launch pricing.</li>
</ul>
`,
  },
  {
    slug: "are-my-glasses-too-small-for-my-face",
    title: "Are My Glasses Too Small for My Face? 4 Signs and What to Do",
    excerpt: "Four objective signs your glasses are too small for your face — temple pinch, sliding, off-centre lenses, indents behind the ears — and how to size up properly.",
    date: "2026-06-19",
    readTime: 7,
    tags: ["Sizing", "Fit", "Diagnostic"],
    faq: [
      { q: "How do I know if my glasses are too small for my face?", a: "Four signs: temples pinch within 1–2 hours of wear, the frame slides forward on your nose, your eyes are not centred in the lenses (you see your eye closer to the inner edge), or you have red indents on your temples or behind your ears at the end of the day. Any one of these means the frame is too narrow." },
      { q: "What happens if your glasses are too small?", a: "Three things: chronic temple and ear pressure causing tension headaches, hinge wear (the frame is constantly bent open beyond design), and optical mis-alignment because the lens optical centres no longer match your pupillary distance." },
      { q: "Can an optician fix glasses that are too small?", a: "No. Acetate is heat-malleable but a frame cannot be made wider — there is no extra material to work with. An optician can adjust temple bend and nose pads, but if the front width is too narrow, the only fix is a wider frame." },
      { q: "How wide should glasses be for my face?", a: "The front width of the frame (hinge to hinge) should match your face width across the temples, plus or minus 3 mm. For a 158 mm face, look for a 155–161 mm frame. For a 165 mm face, 162–168 mm." },
    ],
    howTo: {
      name: "How to tell if your glasses are too small for your face",
      description: "Four objective tests to determine whether your current glasses are too narrow for your face — and what the correct frame width should be.",
      totalTime: "PT3M",
      tool: ["Mirror", "Current glasses"],
      step: [
        { name: "Check temple pressure", text: "Put your glasses on and wait 60 seconds. If you can feel pressure on your temples (the side of your head near your eyes), the front width is too narrow. There should be zero pressure at rest." },
        { name: "Check the slide", text: "Tilt your head down so you are looking at the floor. If the frame slides forward on your nose within 5 seconds, the temple grip is too weak — usually because the front is narrow and the temples are bent outward to compensate." },
        { name: "Check lens centering", text: "Look straight ahead in a mirror. Your pupils should sit roughly in the centre of each lens, slightly above the midline. If your eyes appear closer to the inner (nose-side) edge of the lenses, the bridge is wrong — the lenses are sitting outside your pupillary distance." },
        { name: "Check end-of-day marks", text: "Remove your glasses after a normal day's wear. If there are red indents on your temples or behind your ears, the frame has been mechanically forcing itself onto your head all day." },
      ],
    },
    content: `
<p>If you've come to this page, you probably already suspect the answer. The four-test sequence below makes it objective: in about three minutes you will know whether your current glasses are too small, and exactly which dimension is the problem.</p>

<h2>The four signs, ranked by how reliable they are</h2>

<h3>1. Temple pinch within 1–2 hours of wear</h3>
<p>The single most reliable indicator. If you put on glasses and feel the side of your head pressing against the frame within an hour or two, the front width is too narrow. A well-fitting frame applies <em>zero</em> pressure at the temples at rest — the only contact should be on the bridge of your nose and behind your ears.</p>

<p>Why it happens: a frame too narrow for your face has temples that flare outward to clear your head, and the hinges take all the bending load. The acetate then pushes back on your temples for the rest of the day.</p>

<h3>2. The frame slides forward on your nose</h3>
<p>Tilt your head down. If the frame slides toward your nose tip within five seconds, the issue is grip — usually a symptom of the front being too narrow rather than the temples being too short. When the front is narrow, the temples bend outward instead of curving down behind your ears, and the grip is lost.</p>

<p>Quick clarification: if the frame slides only when you sweat or after several hours, that is normal and an optician can tighten the temple curl. If it slides cold, after one minute of wear, the geometry is wrong.</p>

<h3>3. Your eyes are not centred in the lenses</h3>
<p>Look straight ahead in a mirror. Your pupils should sit in the upper-centre of each lens. If your eyes appear close to the <em>inner</em> edge of the lenses (toward your nose), the bridge is too narrow — your pupillary distance is wider than the lens optical centres. This is uncomfortable optically (your eyes are looking off-axis through the lens) and is a clear sign the frame is undersized for your face.</p>

<h3>4. Red indents at the end of the day</h3>
<p>Take your glasses off after a normal day. Look in the mirror at your temples (just behind the corners of your eyes) and behind your ears. Red indents or visible pressure marks mean the frame has been mechanically forcing itself onto your head for 8+ hours. These marks fade in 10–30 minutes, but the chronic pressure does not — it is the source of most "I get headaches from my glasses" complaints.</p>

<h2>Why this happens to so many people</h2>

<p>Standard eyewear sizing tops out at 140–148 mm of front width across most mainstream brands. The average human face width is 138–142 mm, so the sizing makes sense for the average. If your face is 150 mm or wider — and roughly <strong>1 in 4 adult men are</strong> — the average frame is mechanically too narrow no matter which brand or style you pick.</p>

<p>This is not a styling problem. It is a sizing gap in the market. The fix is a wider frame, not a different colour of the same frame.</p>

<h2>What the right size actually is</h2>

<p>Measure your face across the widest point, usually the temples. A credit card (85.6 mm) held against one temple shows you the half-width. As a rule:</p>

<ul>
<li><strong>Face width 130–145 mm:</strong> most mainstream frames fit. Front width 130–145 mm.</li>
<li><strong>Face width 145–155 mm:</strong> look for "wide fit" lines. Front width 145–155 mm.</li>
<li><strong>Face width 155–161 mm:</strong> specialist wide-face brands only. Front width 155–161 mm. Woolet 007 and 009 are designed exactly here at 158 mm.</li>
<li><strong>Face width 161+ mm:</strong> bespoke. Front width 162–162 mm. Woolet bespoke covers this range at $299.</li>
</ul>

<p>The most precise way to measure is the <a href="/en/fit">AI Fit Scan</a> — 90 seconds with your phone and a credit card, accurate to within 2 mm.</p>

<h2>Can my current glasses be adjusted to fit?</h2>

<p>If the front width is too narrow, no. Acetate is heat-malleable but cannot be stretched wider — there is no extra material in the frame to work with. An optician can adjust the temple bend, the pantoscopic tilt and the nose pad position, but none of that changes the front width.</p>

<p>If the front width is correct and only the temples or pads need adjusting, yes — any local optician can fix that in 10 minutes for $0–$20.</p>

<h2>What to do next</h2>

<p>If two or more of the four signs above apply to you, the frame is too small. Don't keep adjusting — the geometry can't be argued with. The simplest fix:</p>

<ol>
<li><a href="/en/fit">Run the Fit Scan</a> to confirm your actual face width.</li>
<li>If you fall in the 155–161 mm bracket, <a href="/en/products/009">view Woolet 009</a> or 007 at 158 mm.</li>
<li>If you fall outside that bracket, <a href="/en/bespoke">bespoke at $299</a> covers 145–162 mm.</li>
</ol>

<h2>Related articles</h2>
<ul>
<li><a href="/en/blog/bespoke-eyewear-size-range-150-172mm-guide">Bespoke eyewear size guide (145–162 mm)</a> — what to do if stock won't fit.</li>
<li><a href="/en/blog/why-glasses-dont-fit-155mm-problem">Why glasses don't fit at 155 mm+</a> — the industry sizing gap.</li>
<li><a href="/en/blog/what-size-glasses-for-a-large-head">What size glasses for a large head?</a> — the size grid you actually need.</li>
<li><a href="/en/blog/how-to-measure-face-width-for-glasses">How to measure your face width for glasses</a> — diagnose it yourself in 60 seconds.</li>
<li><a href="/en/fit">AI Fit Scan</a> — confirm your real face width in 90 seconds.</li>
<li><a href="/en/bespoke">Reserve a $299 bespoke spot</a> — when stock is genuinely too small.</li>
</ul>
`,
  },
  {
    slug: "what-size-glasses-for-a-large-head",
    title: "What Size Glasses for a Large Head? A Sizing Bracket Guide",
    excerpt: "How to translate a 'large head' into an actual frame size — bracket by bracket, with the front-width, bridge and temple numbers you should be looking for.",
    date: "2026-06-20",
    readTime: 7,
    tags: ["Sizing", "Large Head", "Guide"],
    faq: [
      { q: "What size glasses do I need for a large head?", a: "Measure the widest point of your face. 150–154 mm face → 150–155 mm frame. 155–161 mm face → 155–161 mm frame (specialist wide-fit). 162+ mm face → 162 mm+ frame, usually bespoke. The front width of the frame should match your face width within 3 mm." },
      { q: "Is a 58 mm lens width considered large?", a: "It depends on the bridge. A 58–18 frame is roughly 134–140 mm of front width — large for an average face, but not actually large for a wide face. The number on the temple is lens width, not total frame width." },
      { q: "Are XL glasses real or marketing?", a: "Both. Some brands genuinely scale the front width (Faded Days, BXL, Woolet). Most mainstream 'XL' lines just enlarge the lens cut-out on a standard 140 mm front. Ask for the hinge-to-hinge measurement before buying." },
      { q: "What's the largest frame size made?", a: "Stock production tops out around 165 mm in specialist wide-face brands. Above that, bespoke is the only option. Woolet bespoke covers up to 162 mm of front width." },
    ],
    content: `
<p>"Large head" is a useful description in conversation and a useless one when buying glasses. The question that actually gets you a frame that fits is: <em>what is my face width in millimetres?</em> This guide translates "large" into the four sizing brackets that matter, and tells you what to look for in each.</p>

<h2>Step one — measure</h2>

<p>You need one number: the width of your face at its widest point, usually across the temples just above your cheekbones. Two ways to get it:</p>

<ul>
<li><strong>Credit card method.</strong> Hold a credit card (85.6 mm long) horizontally against one temple. If the other end reaches just past your opposite temple, your face is roughly 155–165 mm. If the card sits entirely inside your face, you are 165+ mm.</li>
<li><strong>AI scan.</strong> The <a href="/en/fit">Woolet Fit Scan</a> uses your phone camera with a credit card calibration card and gives a measurement accurate to within 2 mm in 90 seconds.</li>
</ul>

<p>Write the number down. Everything else here depends on it.</p>

<h2>The four brackets</h2>

<h3>Bracket 1 — Face width 140–149 mm: "Above average"</h3>
<p>This is the upper end of mainstream sizing. Most brands have a "large" or "L" size that covers you. Look for:</p>
<ul>
<li>Front width: 142–149 mm</li>
<li>Bridge: 18–20 mm</li>
<li>Temples: 145–150 mm</li>
</ul>
<p>Available at: Warby Parker, Ray-Ban, Persol, most independent opticians. You don't need a specialist brand.</p>

<h3>Bracket 2 — Face width 150–154 mm: "Medium-wide"</h3>
<p>Mainstream "wide fit" lines (Ray-Ban "Wide Fit", Warby Parker "Wide") usually work here. Look for:</p>
<ul>
<li>Front width: 150–155 mm</li>
<li>Bridge: 19–21 mm</li>
<li>Temples: 148–152 mm</li>
</ul>
<p>Available at: mainstream brands' wide-fit lines, plus specialist brands (Faded Days, BXL, Woolet bespoke).</p>

<h3>Bracket 3 — Face width 155–161 mm: "Wide"</h3>
<p>This is where mainstream sizing stops working. Mainstream "XL" lines cap around 148 mm front width — too narrow. You need a specialist wide-face brand. Look for:</p>
<ul>
<li>Front width: 155–161 mm</li>
<li>Bridge: 20–22 mm</li>
<li>Temples: 148–152 mm</li>
</ul>
<p>Available at: Woolet 007 and 009 (158 mm, $190), Faded Days (155–165 mm), BXL (145–165 mm), SizeGlasses (140–165 mm). For premium Italian acetate at this size, Woolet is the obvious pick.</p>

<h3>Bracket 4 — Face width 162+ mm: "Bespoke territory"</h3>
<p>Above 161 mm, stock production effectively stops. Faded Days reaches 165 mm in a few SKUs; nothing else mainstream goes there. Bespoke is the answer. Look for:</p>
<ul>
<li>Front width: 162–162 mm (or whatever your face requires + 0–3 mm)</li>
<li>Bridge: 20–24 mm</li>
<li>Temples: 150–158 mm</li>
</ul>
<p>Available at: Woolet bespoke ($299, digital scan + European atelier), Tom Davies bespoke (~$1,200–$3,200, in-person), Maison Bonnet ($3,000+).</p>

<h2>Why "the number on the temple" is misleading</h2>

<p>Frames are usually labelled with three numbers like <code>56□18 145</code>, meaning <strong>lens width — bridge — temple length</strong> in mm. This tells you almost nothing about whether the frame fits a wide face, because the number that matters is <em>front width</em> (hinge to hinge), which is missing.</p>

<p>You can estimate front width as: <em>(lens width × 2) + bridge + ~6 mm for the hinge area</em>. So <code>56□18</code> is roughly <code>56 + 56 + 18 + 6 = 136 mm</code> — fine for a 138 mm face, mechanically too narrow for a 158 mm face regardless of how "oversized" the lens looks.</p>

<p>Specialist brands list front width directly. If a brand doesn't, ask before buying.</p>

<h2>What about XL and XXL?</h2>

<p>Use it as a starting filter, not as a guarantee. Real XL on a specialist brand is 155 mm+ of front width. Marketing XL on a mainstream brand is a larger lens on a 140–148 mm front — same temple pinch, larger lens.</p>

<h2>The bridge and temple numbers, briefly</h2>

<ul>
<li><strong>Bridge width</strong> (the gap between the lenses) controls where the lenses sit on your nose. A wider face usually pairs with a wider nose bridge — 20–22 mm rather than the standard 17–19 mm. Too narrow and the lenses sit too high on your cheekbones.</li>
<li><strong>Temple length</strong> needs to reach behind your ear with 1–2 cm to spare for the bend. Standard temples are 140–145 mm; for a large head, 148–155 mm is the right range.</li>
</ul>

<h2>What to do next</h2>

<p>If you are unsure which bracket you sit in, <a href="/en/fit">run the AI Fit Scan</a> — it tells you the exact face width and the right bracket in 90 seconds. If you already know you are in bracket 3 (155–161 mm), <a href="/en/products/009">Woolet 009</a> ships at 158 mm with the right bridge and temple to match. For bracket 4, <a href="/en/bespoke">bespoke at $299</a> covers 145–162 mm.</p>

<h2>Related articles</h2>
<ul>
<li><a href="/en/blog/bespoke-eyewear-size-range-150-172mm-guide">Bespoke eyewear size guide (145–162 mm)</a> — the full pillar reference.</li>
<li><a href="/en/blog/best-glasses-for-big-heads-2026">Best glasses for big heads (2026)</a> — curated wide-fit picks.</li>
<li><a href="/en/blog/are-my-glasses-too-small-for-my-face">Are my glasses too small for my face?</a> — diagnose it before reordering.</li>
<li><a href="/en/blog/best-glasses-for-big-heads-2026">Best glasses for big heads (2026)</a> — every brand selling a 150 mm+ front width, compared.</li>
<li><a href="/en/fit">AI Fit Scan</a> — your real face width in 90 seconds.</li>
<li><a href="/en/bespoke">Reserve a $299 bespoke spot</a> — built for 145–162 mm faces.</li>
</ul>
`,
  },
  {
    slug: "how-wide-should-glasses-be",
    title: "How Wide Should Glasses Be on Your Face?",
    excerpt: "Frames pinching your temples or sitting too narrow? Here's the exact width a wide face needs — 155 mm and up — and how to measure yours in 30 seconds.",
    date: "2026-06-21",
    readTime: 6,
    tags: ["Fit Guide", "Wide Face", "Sizing"],
    image: "/og-image.png",
    faq: [
      { q: "What is considered a wide face for glasses?", a: "A face measuring roughly 155 mm or more across the widest point, temple to temple. At that width, standard frames pinch and most retail ranges run out of options." },
      { q: "How wide should glasses be on your face?", a: "As wide as your face. The frame front matches your temple-to-temple width and the arms run straight back without bowing or pressing." },
      { q: "How do I know when my glasses are too small?", a: "Red marks behind your ears, arms that flare outward, headaches from temple pressure, and lenses sitting too close together all point to a frame that's too narrow." },
      { q: "Can I measure my face width at home?", a: "Yes. Hold a ruler across the widest part of your face in a mirror and read the millimeters, or run the Woolet Fit Wizard, which uses a credit card and your camera to return an exact number in 30 seconds." },
    ],
    howTo: {
      name: "How to measure your face width for glasses",
      description: "Two ways to find your face width and the frame size that fits it.",
      step: [
        { name: "Measure with a ruler", text: "Hold a ruler flat across the widest part of your face, temple to temple, in a mirror. Read the width in millimeters. 155 mm or above means a wide face." },
        { name: "Measure with the Woolet Fit Wizard", text: "Use a credit card for scale and your phone camera to read your exact face width in 30 seconds, and confirm whether the 158 mm Woolet front fits." },
      ],
    },
    content: `
<nav aria-label="breadcrumb" style="font-family:'Barlow',sans-serif;font-size:0.72rem;letter-spacing:0.18em;text-transform:uppercase;opacity:0.55;margin-bottom:28px;">
  <a href="/en" style="color:inherit;text-decoration:none;">Home</a>
  <span style="margin:0 8px;opacity:0.5;">›</span>
  <a href="/en/blog" style="color:inherit;text-decoration:none;">Eyewear Guides</a>
  <span style="margin:0 8px;opacity:0.5;">›</span>
  <span style="opacity:0.85;">How Wide Should Glasses Be</span>
</nav>

<p>Your glasses leave red marks behind your ears by lunchtime. The arms bow outward to clear your temples. Every frame on the shelf sits a centimeter too narrow. You don't have a styling problem — you have a width problem, and almost no brand measures for it.</p>

<p>Here's the exact frame width your face needs, how to measure it in under a minute, and how to stop buying frames built for someone narrower.</p>

<p style="margin:32px 0;"><a href="/en/fit" style="display:inline-block;background:#c9a84c;color:#0f0f0f;padding:16px 28px;border-radius:4px;font-family:'Barlow',sans-serif;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;font-size:0.82rem;text-decoration:none;">Measure with the Woolet Fit Wizard →</a></p>

<h2>How wide should glasses be on your face?</h2>
<p>Your frames should be as wide as your face. The frame front — hinge to hinge — matches your face width at the temples, and the arms run straight back to your ears without bowing out or pressing in. When the arms flare outward to clear your head, the frame is too narrow. When the frame front juts past the edges of your face, it's too wide.</p>
<p>For a wide face — 155 mm or more across the temples — that means a frame front around 155 mm and up. Standard retail tops out near 135–145 mm, which is why every shelf frame fights you.</p>

<h2>Getting your number</h2>
<p>Hold a ruler flat across the widest part of your face, temple to temple, and read the millimetres — 155 mm or above is wide-face territory. For the calibrated method, the photo walkthrough and the bracket chart, read <a href="/en/blog/how-to-measure-face-width-for-glasses">how to measure your face width</a>.</p>

<p style="margin:32px 0;"><a href="/en/fit" style="display:inline-block;background:#c9a84c;color:#0f0f0f;padding:16px 28px;border-radius:4px;font-family:'Barlow',sans-serif;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;font-size:0.82rem;text-decoration:none;">Measure with the Fit Wizard →</a></p>

<h2>The three numbers that decide fit</h2>
<p>Every frame carries three measurements, printed inside one arm — for example 56▢21–150.</p>
<ul>
<li><strong>Lens width</strong> — the width of one lens. Wide faces start in the mid-50s mm and climb.</li>
<li><strong>Bridge</strong> — the gap over your nose. A wider bridge keeps lenses centered on a broad face. Woolet runs a 21–22 mm keyhole bridge for exactly this.</li>
<li><strong>Temple length</strong> — the arm, ear to tip. Longer arms wrap a wider head without squeezing.</li>
</ul>
<p>Add two lens widths plus the bridge and you get the frame front. When that total sits under your face width, the frame pinches — every time. Woolet builds one precise front: 158 mm.</p>

<h2>How to tell when glasses are too wide — or too narrow</h2>
<p><strong>Too narrow</strong> (the usual story for a wide face):</p>
<ul>
<li>Red marks or soreness behind your ears</li>
<li>Arms that bow outward instead of running straight</li>
<li>Frames that grip your temples and trigger headaches</li>
<li>Lenses sitting too close together</li>
</ul>
<p><strong>Too wide:</strong></p>
<ul>
<li>Frames slide down your nose</li>
<li>The frame front extends past the edge of your face</li>
<li>Lenses sit off-center from your pupils</li>
</ul>
<p>When you recognize the first list, you've been wearing frames built for a narrower face. That's the gap Woolet closes.</p>

<h2>What to look for in glasses for a wide face</h2>
<p>Three things, every time: a frame front that matches your width, a bridge wide enough to center the lenses, and temple arms long enough to wrap without pressure. Standard ranges stop short on all three.</p>
<p>When your face is too wide for Persol, Tom Ford, Warby Parker, or a Ray-Ban Wayfarer Large, Woolet is built for you. Premium Italian Mazzucchelli acetate, hand made in EU, in one precise 158 mm size across two shapes — with a bespoke tier for 145–162 mm.</p>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin:28px 0;">
  <a href="/en/products/007" style="display:block;padding:22px 24px;border:1px solid rgba(201,168,76,0.35);border-radius:6px;text-decoration:none;color:inherit;background:rgba(201,168,76,0.04);">
    <div style="font-family:'Barlow',sans-serif;font-size:0.65rem;letter-spacing:0.22em;text-transform:uppercase;color:#c9a84c;margin-bottom:8px;">Round · 158 mm</div>
    <div style="font-family:'Cormorant Garamond',serif;font-size:1.35rem;line-height:1.2;">Woolet 007 →</div>
  </a>
  <a href="/en/products/009" style="display:block;padding:22px 24px;border:1px solid rgba(201,168,76,0.35);border-radius:6px;text-decoration:none;color:inherit;background:rgba(201,168,76,0.04);">
    <div style="font-family:'Barlow',sans-serif;font-size:0.65rem;letter-spacing:0.22em;text-transform:uppercase;color:#c9a84c;margin-bottom:8px;">Square · 158 mm</div>
    <div style="font-family:'Cormorant Garamond',serif;font-size:1.35rem;line-height:1.2;">Woolet 009 →</div>
  </a>
  <a href="/en/about" style="display:block;padding:22px 24px;border:1px solid rgba(201,168,76,0.35);border-radius:6px;text-decoration:none;color:inherit;background:rgba(201,168,76,0.04);">
    <div style="font-family:'Barlow',sans-serif;font-size:0.65rem;letter-spacing:0.22em;text-transform:uppercase;color:#c9a84c;margin-bottom:8px;">The Craft</div>
    <div style="font-family:'Cormorant Garamond',serif;font-size:1.35rem;line-height:1.2;">How Woolet is made →</div>
  </a>
  <a href="/en/fit" style="display:block;padding:22px 24px;border:1px solid rgba(201,168,76,0.35);border-radius:6px;text-decoration:none;color:inherit;background:rgba(201,168,76,0.04);">
    <div style="font-family:'Barlow',sans-serif;font-size:0.65rem;letter-spacing:0.22em;text-transform:uppercase;color:#c9a84c;margin-bottom:8px;">30 seconds</div>
    <div style="font-family:'Cormorant Garamond',serif;font-size:1.35rem;line-height:1.2;">Not sure of your size? Run the Fit Wizard →</div>
  </a>
</div>

<h2>FAQ</h2>

<h3>What is considered a wide face for glasses?</h3>
<p>A face measuring roughly 155 mm or more across the widest point, temple to temple. At that width, standard frames pinch and most retail ranges run out of options.</p>

<h3>How wide should glasses be on your face?</h3>
<p>As wide as your face. The frame front matches your temple-to-temple width and the arms run straight back without bowing or pressing.</p>

<h3>How do I know when my glasses are too small?</h3>
<p>Red marks behind your ears, arms that flare outward, headaches from temple pressure, and lenses sitting too close together all point to a frame that's too narrow.</p>

<h3>Can I measure my face width at home?</h3>
<p>Yes. Hold a ruler across the widest part of your face in a mirror and read the millimeters, or run the Woolet Fit Wizard, which uses a credit card and your camera to return an exact number in 30 seconds.</p>

<div style="margin:48px -8px 8px;padding:40px 32px;background:linear-gradient(180deg,rgba(201,168,76,0.10),rgba(201,168,76,0.04));border:1px solid rgba(201,168,76,0.30);border-radius:8px;text-align:center;">
  <div style="font-family:'Cormorant Garamond',serif;font-size:1.9rem;line-height:1.15;margin-bottom:12px;">Get your exact width.</div>
  <p style="max-width:520px;margin:0 auto 24px;opacity:0.85;">The Woolet Fit Wizard reads your face width with a credit card and your camera, then confirms whether the 158 mm front fits or whether you need bespoke. 30 seconds, no guessing.</p>
  <a href="/en/fit" style="display:inline-block;background:#c9a84c;color:#0f0f0f;padding:16px 32px;border-radius:4px;font-family:'Barlow',sans-serif;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;font-size:0.82rem;text-decoration:none;">Measure with the Fit Wizard →</a>
</div>

<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://woolet.co/en"},{"@type":"ListItem","position":2,"name":"Eyewear Guides","item":"https://woolet.co/en/blog"},{"@type":"ListItem","position":3,"name":"How Wide Should Glasses Be on Your Face?","item":"https://woolet.co/en/blog/how-wide-should-glasses-be"}]}
</script>
`,
  },
  {
    slug: "best-sunglasses-for-wide-faces",
    title: "Best Sunglasses for Wide Faces in 2026",
    excerpt: "Sunglasses that don't pinch a wider face. See the best wide-fit sunglasses for 2026 — 158 mm fronts, keyhole bridges, polarized options. Find your size.",
    date: "2026-06-28",
    readTime: 8,
    tags: ["Sunglasses", "Wide Face", "2026", "Guide"],
    faq: [
      { q: "What size sunglasses do I need for a wide face?", a: "If your temple-to-temple measurement is 155 mm or more, you need a frame with a front width of at least 155 mm — measured hinge-to-hinge across the front. Most mainstream 'oversized' sunglasses are 138–148 mm, which is a larger lens on a standard front. Woolet's standard size is 158 mm with a 21–22 mm keyhole bridge." },
      { q: "Are oversized sunglasses the same as wide sunglasses?", a: "No. Oversized usually refers to lens area; wide refers to front width. A pair can be oversized and still narrow at the temples. For a wide face, front width is the dimension that matters." },
      { q: "Can I get polarized lenses on Woolet sunglasses?", a: "Yes. Polarized is a lens-level upgrade on both the 007 round and 009 soft-square. Standard lenses are CR-39 with UV400 protection." },
      { q: "What if my face is wider than 161 mm?", a: "Bespoke covers 145–162 mm of front width with a 20–24 mm bridge, in the same Italian Mazzucchelli acetate. Lead time is 4–6 weeks after the standard batch." },
    ],
    content: `
<p>Most "oversized" sunglasses are not actually wide. They're standard frames with a larger lens — same hinge-to-hinge measurement, same temple length, same pinch by the end of the afternoon. If your face is 155 mm across or more, the problem isn't the lens. It's the front.</p>

<p>This is a short, honest shortlist for buyers with a face width of 155 mm and above (or a head circumference of 58 cm and above). No padding, no affiliate noise — just what to look at, what to skip, and how to know which size you actually need.</p>

<h2>What "wide" means for sunglasses</h2>

<p>Two numbers matter. The first is <strong>front width</strong>: the distance hinge-to-hinge across the front of the frame. Mainstream sunglasses sit at 138–148 mm. Anything over 150 mm is wide. The second is <strong>bridge width</strong>: the gap between the two lenses, where the frame rests on your nose. Mainstream bridges are 17–20 mm. Wider noses usually need 21 mm or more, ideally with a keyhole shape that distributes weight onto bone rather than cartilage.</p>

<p>If you don't know your face width yet, the <a href="/en/fit" style="color:#A07A2A;">FitLens scanner</a> takes about 20 seconds with your phone camera, or you can <a href="/en/blog/how-to-measure-face-width-for-glasses" style="color:#A07A2A;">measure manually with a ruler or credit card</a>.</p>

<h2>What to look for in 2026</h2>

<ol>
  <li><strong>A real front-width number, not "oversized".</strong> If a product page doesn't publish the hinge-to-hinge measurement, assume it's 145 mm and move on.</li>
  <li><strong>A bridge in the 21–22 mm range</strong>, ideally keyhole. Saddle bridges work for some, but most wider noses prefer the load shifted up onto the bone.</li>
  <li><strong>Temples 145–150 mm or longer.</strong> Short temples bow outward as soon as a wider face puts tension on the hinges.</li>
  <li><strong>Italian acetate over injection-moulded plastic.</strong> Cellulose acetate holds its set at wider spans where moulded plastic loosens under heat.</li>
  <li><strong>UV400 as a baseline, polarized as an option.</strong> Polarized is worth it for driving and water; not always for screens.</li>
</ol>

<h2>The Woolet shortlist</h2>

<p>Woolet makes two shapes, both engineered for wider faces (155–161 mm) at one precise 158 mm front width. Bespoke covers anything outside that, up to 162 mm.</p>

<ul>
  <li><strong><a href="/en/products/007" style="color:#A07A2A;">Woolet 007 — Round Panto, 158 mm</a>.</strong> Round Italian Mazzucchelli acetate, 21 mm keyhole bridge, 148 mm temples. Polarized lens upgrade available. Good for softer features and squarer face shapes.</li>
  <li><strong><a href="/en/products/009" style="color:#A07A2A;">Woolet 009 — Soft Square, 158 mm</a>.</strong> Soft-square Italian acetate, 22 mm keyhole bridge, 148 mm temples. Polarized lens upgrade available. Reads more architectural; works on rounder faces.</li>
</ul>

<p>Both are pre-order at $114 for founding members ($190 MSRP at full launch). Same EU atelier, same hand-finishing, same geometry — pick on shape, not on size.</p>

<h2>If you're between sizes</h2>

<p>If your face is 150–154 mm or 162–162 mm, the standard 158 mm front sits at the edge of comfort. Bespoke is the right call. Same Italian Mazzucchelli acetate, hand made in EU, with front, bridge, and temple length set to your measurements. The wait is roughly 4–6 weeks after the standard production batch.</p>

<h2>Quick FAQ</h2>

<h3>What size sunglasses are best for a wide face?</h3>
<p>A front width of 155 mm or more, a bridge of 21 mm or more, and temples of at least 148 mm. Below those numbers, the frame is doing standard work on a non-standard face.</p>

<h3>Are wider sunglasses better for big heads?</h3>
<p>Yes, but only if the <em>front</em> is wider. A larger lens on a 145 mm front still pinches a 58 cm head. Check the hinge-to-hinge number, not the lens diameter.</p>

<h3>Where can I buy sunglasses for a wider face?</h3>
<p>Specialist makers like Woolet design at 158 mm front with bespoke above. Most mass-market "wide" or "oversized" lines cap around 145–148 mm of actual front width.</p>

<p style="border-top:1px solid #E8E4DC;margin-top:32px;padding-top:20px;">More on fit: <a href="/en/blog/glasses-for-wide-faces-guide" style="color:#A07A2A;">the complete 2026 wide-face guide</a> · <a href="/en/blog/how-to-measure-face-width-for-glasses" style="color:#A07A2A;">how to measure your face width</a> · <a href="/en/collections/sunglasses-for-big-heads" style="color:#A07A2A;">sunglasses for big heads</a>.</p>
`,
  },
  {
    slug: "wide-face-glasses-for-women",
    title: "Wide-Face Glasses for Women: The Honest 2026 Fit Guide",
    excerpt: "Most 'women's frames' top out at 138 mm. If your face is 150 mm+ across, here's what to look for, what to skip, and why width — not 'feminine shape' — is the deciding number.",
    date: "2026-06-29",
    readTime: 10,
    tags: ["Guide", "Women", "Wide Face", "2026"],
    faq: [
      { q: "What face width counts as wide for a woman?", a: "Anything above 140 mm temple-to-temple sits outside the standard women's eyewear range, which is typically built at 128–138 mm. Above 150 mm you're firmly in wide-face territory and most mainstream women's lines won't fit, regardless of how the frame is shaped." },
      { q: "Are 'unisex' frames the same as women's frames in a larger size?", a: "Usually no. Most unisex frames are men's frames relabelled. The width is right for a wide face, but the bridge often sits higher and the temple angle assumes a flatter brow. Look at the bridge mm and the lens height, not the marketing label." },
      { q: "What frame width should I look for as a woman with a wide face?", a: "Match your temple-to-temple measurement, then add 1–2 mm of breathing room. For most wide-face women that's 152–162 mm of total frame width. Woolet's standard is 158 mm; bespoke covers 145–162 mm." },
      { q: "Will a wider frame make my face look bigger?", a: "The opposite. A frame that's too narrow draws a hard horizontal line inside your hairline and emphasises the width sitting outside it. A frame matched to your actual width reads as proportional and intentional." },
      { q: "What styles work best on a wider face?", a: "Soft-square and rounded panto shapes both work. The deciding number is width, not shape. Avoid very small cat-eyes — the lens area gets dwarfed by the face and the frame reads as an accessory rather than eyewear." },
      { q: "Do Woolet frames come in feminine colourways?", a: "Both 007 (round) and 009 (soft square) ship in Dark Tortoise and Black; 007 also offers Honey. Bespoke opens the full Mazzucchelli colour palette, including translucent and crystal acetates often chosen by women buyers." },
      { q: "Do wide-face glasses for women come with prescription lenses?", a: "Yes. Both Woolet 007 and 009 ship prescription-ready — single-vision, progressive, and blue-light coatings. The 20–21 mm keyhole bridge is deep enough for the progressive corridor that narrow bridges cannot carry." },
      { q: "What do premium wide-face glasses for women cost?", a: "Woolet 007 and 009 are $114 during pre-order, against a $190 launch price. Bespoke — for face widths outside the 155–161 mm standard range — is $299 during pre-order and $480 at launch." },
    ],
    content: `
<div style="display:flex;align-items:center;gap:14px;padding:16px 0;border-top:1px solid #E8E4DC;border-bottom:1px solid #E8E4DC;margin-bottom:28px;font-family:'Barlow',sans-serif;">
  <div style="flex-shrink:0;width:44px;height:44px;border-radius:50%;background:#0f0f0f;color:#c9a84c;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;letter-spacing:0.5px;">MC</div>
  <div style="flex:1;min-width:0;">
    <div style="font-size:14px;font-weight:600;color:#1a1a1a;line-height:1.3;">Marek Cieśla</div>
    <div style="font-size:12px;color:#666;line-height:1.5;margin-top:2px;">Founder, Woolet Eyewear · <a href="https://www.linkedin.com/in/marekciesla/" target="_blank" rel="noopener" style="color:#c9a84c;text-decoration:none;">LinkedIn</a></div>
    <div style="font-size:11px;color:#999;letter-spacing:1.5px;text-transform:uppercase;margin-top:6px;">Published: June 2026</div>
  </div>
</div>

<p>The wide-face problem is rarely framed as a women's problem. Most fit guides default to men's faces, men's heads, men's frame catalogues. The reality is simpler and less convenient: women's eyewear, as a category, is built narrower than men's. So if your face is wider than the average woman's, the mismatch is sharper — not softer — than it would be for a man with the same measurement.</p>

<p>This guide is for women who already know the routine: pulling frame after frame off the wall, watching the arms bow before they ever reach the ears, being told to try "a different shape" when the issue was never the shape. The answer is a number, not a style.</p>

<div style="background:#F8F6F1;border-left:3px solid #c9a84c;padding:18px 22px;margin:24px 0;border-radius:4px;">
  <div style="font-family:'Barlow',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#888;margin-bottom:10px;">Definition</div>
  <p style="margin:0;font-size:15px;line-height:1.65;color:#1a1a1a;">A wide face in eyewear terms means a face width above 140 mm measured temple-to-temple. The average adult woman's face measures roughly 134 mm wide; standard women's frames are built for 128–138 mm. Above 145 mm, mainstream women's eyewear stops fitting.</p>
</div>

<h2>Why "women's frames" are narrower in the first place</h2>

<p>Eyewear is sized to population averages. Peer-reviewed anthropometric data (Cleft Palate and Craniofacial Journal, Gordon et al.) puts the average adult female face at roughly 134 mm of bizygomatic width, against 142 mm for adult men. Frame catalogues mirror this: women's lines cluster between 128 and 138 mm of total front width, men's between 135 and 145 mm. Both ranges leave anyone above the 90th percentile without a fitting option.</p>

<p>That gap matters because the women's-line geometry is not just smaller — it's also shorter in the temple, lower in the bridge, and lighter in the hinge. Stretching a women's frame to a wider face strains exactly the parts that were designed light. Going up into "men's wide" usually means accepting a heavier bridge, a flatter brow line, and a temple angle that sits too low behind the ear.</p>

<h2>The two numbers that decide the fit</h2>

<p>Strip away the styling vocabulary and only two measurements matter for a wide-face fit, regardless of gender:</p>

<ol>
  <li><strong>Front width (hinge-to-hinge).</strong> This is the total width of the frame across the top, not the lens diameter. Mainstream women's frames sit at 128–138 mm. Wide-face women usually need 152–162 mm. Below your face width, the arms bow outward and the temples press in. Two or three millimetres above is comfortable; ten millimetres above starts to overhang.</li>
  <li><strong>Bridge width.</strong> The gap between the two lenses, where the frame rests on your nose. Standard bridges are 16–19 mm. Wider noses — common alongside wider faces — usually need 20–22 mm, and a keyhole shape that loads weight onto the nasal bone rather than the cartilage.</li>
</ol>

<p>If you don't know your numbers yet, the <a href="/en/fit" style="color:#A07A2A;">FitLens scanner</a> uses your phone camera and a credit card for calibration and returns front width and bridge in about twenty seconds. The <a href="/en/blog/how-to-measure-face-width-for-glasses" style="color:#A07A2A;">manual method with a ruler</a> works just as well.</p>

<h2>The "feminine shape" myth</h2>

<p>The dominant advice for women's eyewear is built around face shape — cat-eye for round, oval for square, and so on. It's not wrong, but it answers a different question. Shape only matters once width fits. A 138 mm cat-eye on a 155 mm face will read as undersized no matter how flattering the curve. The frame becomes an accessory perched in front of the eyes instead of eyewear sitting on the face.</p>

<p>Once width matches, almost any shape works on a wider face. The shapes that consistently <em>don't</em> work are the smallest ones: petite cat-eyes, micro-ovals, and any frame whose lens diameter is under about 48 mm. They get visually swallowed and underline the width sitting outside the frame edge.</p>

<h2>What to look for in 2026</h2>

<ul>
  <li><strong>A published front-width number.</strong> If a women's frame doesn't list its hinge-to-hinge measurement, assume it's 138 mm and move on. The number printed inside the temple (e.g. "52□18 140") is lens width, bridge, and temple length — not front width.</li>
  <li><strong>A 21–22 mm keyhole bridge, or saddle if your nose is broad rather than tall.</strong> The keyhole shape spreads load and stops the frame sliding on warm days.</li>
  <li><strong>Italian cellulose acetate, hand-finished.</strong> At 155 mm of width, injection-moulded plastic loosens at the hinges within a season. Acetate (Mazzucchelli is the standard) holds its set.</li>
  <li><strong>Temples 145–150 mm or longer.</strong> A wider face puts the hinge further out, which means the temple has to travel further before it reaches the ear.</li>
  <li><strong>Colour you actually want to wear.</strong> The premium acetate market opens up here. Translucent honey, smoky champagne, deep tortoise — anything beyond plain black quietly does more work on a wider face than a darker outline would.</li>
</ul>

<h2>Where Woolet fits</h2>

<p>Woolet is built around one precise measurement: 158 mm of front width, with a 21–22 mm keyhole bridge and 148 mm temples. Two shapes, both unisex by geometry — fit, not styling, decides whether they work:</p>

<ul>
  <li><strong><a href="/en/products/007" style="color:#A07A2A;">Woolet 007 — Round Panto, 158 mm</a>.</strong> Soft round panto in Italian Mazzucchelli acetate. Reads less architectural; the shape consistently picked by women buyers in our pre-order data. Available in Dark Tortoise, Black, and Honey.</li>
  <li><strong><a href="/en/products/009" style="color:#A07A2A;">Woolet 009 — Soft Square, 158 mm</a>.</strong> Soft square with a slightly higher brow line. Reads more deliberate, works on rounder face shapes. Available in Dark Tortoise and Black.</li>
</ul>

<p>If your face falls outside 155–161 mm, the <a href="/en/bespoke" style="color:#A07A2A;">bespoke tier</a> covers 145–162 mm of front width and 20–24 mm of bridge, in the same Italian acetate. That's the right route for women in the 150–154 mm range — a band ignored by mainstream women's catalogues and most "wide" lines.</p>

<h2>Frame colour, on a wider face, on a woman</h2>

<p>One small editorial note that gets ignored elsewhere. On a wider face, very dark frames in opaque black read heavier than they do on narrower faces — the frame is doing more visual work simply because it's larger. Translucent acetates (honey, champagne, smoke, tortoise) keep the same width without adding visual mass. Most women who order Woolet pick a translucent or tortoise; black is more often picked by men. Both work; the lighter colourways tend to feel more proportional on a wider feminine face.</p>

<h2>The 2026 pick list — frames that actually fit</h2>

<p>Ranked width first, then bridge, then material, then colour. Every pick publishes a hinge-to-hinge number in millimetres; anything that doesn't publish one is not on the list.</p>

<h3>1. Woolet 007 — Round Panto, 158 mm (best overall)</h3>

<p><strong>Frame width:</strong> 158 mm · <strong>Bridge:</strong> 21 mm keyhole · <strong>Lens width:</strong> 54 mm · <strong>Lens height:</strong> 42 mm · <strong>Front height:</strong> 52 mm · <strong>Material:</strong> Mazzucchelli acetate from Milan, hand made in the EU · <strong>Colours:</strong> Dark Tortoise, Black, Honey · <strong>Price:</strong> $114 pre-order ($190 launch).</p>

<p>Soft round panto, deliberately unfussy. This is the shape women pick most often once width is no longer the deciding constraint. Honey translucent keeps the 158 mm width without adding visual weight. Ships with clear demo lenses; single-vision, progressive, or blue-light added in cart.</p>

<p><a href="/en/products/007" style="color:#A07A2A;">Shop Woolet 007 →</a></p>

<h3>2. Woolet 009 — Soft Square, 158 mm (best for rounder face shapes)</h3>

<p><strong>Frame width:</strong> 158 mm · <strong>Bridge:</strong> 20 mm keyhole · <strong>Lens width:</strong> 51 mm · <strong>Lens height:</strong> 45 mm · <strong>Front height:</strong> 54 mm · <strong>Material:</strong> Mazzucchelli acetate from Milan, hand made in the EU · <strong>Colours:</strong> Dark Tortoise, Black · <strong>Price:</strong> $114 pre-order ($190 launch).</p>

<p>Soft square with a slightly higher brow line. Sits more deliberate on rounder face shapes, where a full-round frame can flatten the vertical. The 45 mm lens height gives more vertical lens area than the 007 — useful if you wear progressives.</p>

<p><a href="/en/products/009" style="color:#A07A2A;">Shop Woolet 009 →</a></p>

<h3>3. Woolet Bespoke — built to measure, 145–162 mm</h3>

<p><strong>Frame width:</strong> any width 145–162 mm · <strong>Shapes:</strong> 4 · <strong>Colour and size combinations:</strong> 60 · <strong>Material:</strong> Mazzucchelli acetate from Milan, hand made in the EU.</p>

<p>The under-served band. Women between 145 and 154 mm of face width fall outside the standard women's range and below the specialist "wide" range — a gap most catalogues quietly ignore. Bespoke opens the full Mazzucchelli palette, including the translucent and crystal acetates most often requested by women buyers.</p>

<p><a href="/en/bespoke" style="color:#A07A2A;">Explore bespoke (145–162 mm) →</a></p>

<h2>How to rank any frame before you buy it</h2>

<ol>
  <li><strong>Front width first.</strong> The frame must publish a hinge-to-hinge measurement of 150 mm or more. No exceptions.</li>
  <li><strong>Bridge width and shape.</strong> 20–22 mm keyhole preferred; saddle acceptable for broader noses.</li>
  <li><strong>Material.</strong> Cellulose acetate holds tension at wider widths where injection-moulded plastic loosens within a season.</li>
  <li><strong>Colourway.</strong> Translucent honey, smoke, or tortoise reads lighter than opaque black on a wider face — a styling note the men's-first guides never mention.</li>
</ol>

<h2>What to skip</h2>

<ul>
  <li>Anything labelled "oversized women's" without a published front-width number. Oversized usually means larger lens on a standard front — exactly the wrong direction.</li>
  <li>Metal frames at this width. Metal can be sized wider, but the hinge mechanics don't hold tension on a 155 mm+ face for long. Acetate is the more reliable answer.</li>
  <li>Petite cat-eyes and micro-frames. Fashionable on narrower faces; visually undersized on wider ones.</li>
  <li>Anything sold purely on shape advice without a width number. If the seller can't tell you the hinge-to-hinge measurement, they can't tell you whether it fits.</li>
</ul>

<h2>Quick FAQ</h2>

<h3>What's the average face width for women?</h3>
<p>Roughly 134 mm bizygomatic width across published adult anthropometric studies (Gordon et al., ANSUR II). Standard deviation is around ±5 mm, which means a meaningful share of women sit at 140 mm or above — outside the standard women's eyewear range.</p>

<h3>Is there a "petite wide-face" category?</h3>
<p>Not as a real product line. Women between 150 and 154 mm of face width are the most under-served group in eyewear — too wide for women's frames, too narrow for men's wide lines. Bespoke (Woolet covers it from 150 mm) is currently the cleanest answer.</p>

<h3>Are men's wide-fit frames acceptable for women?</h3>
<p>Sometimes. The width works, but watch the bridge height and the temple drop. Men's wide frames are often built with a flatter brow line and a longer drop behind the ear, which can sit awkwardly on a face with a higher brow. Geometry over styling is the right test — try the men's wide frame, but don't accept a frame just because the width is finally right.</p>

<h3>Why do most wide-face guides skip women?</h3>
<p>Because the addressable market is smaller and the average wide-face buyer searches under different terms ("big head", "extra wide", "oversized"). The fit problem itself is identical; the language around it is gendered. This guide treats the measurement as the deciding factor.</p>

<p style="border-top:1px solid #E8E4DC;margin-top:32px;padding-top:20px;">More on fit: <a href="/en/blog/glasses-for-wide-faces-guide" style="color:#A07A2A;">the complete 2026 wide-face guide</a> · <a href="/en/blog/how-to-measure-face-width-for-glasses" style="color:#A07A2A;">how to measure your face width</a> · <a href="/en/blog/best-sunglasses-for-wide-faces" style="color:#A07A2A;">best sunglasses for wide faces</a> · <a href="/en/bespoke" style="color:#A07A2A;">explore bespoke (145–162 mm)</a>.</p>
`,
  },
  {
    slug: "extra-wide-glasses-158mm",
    title: "Extra Wide Glasses for Big Heads and Men: The 158 mm Truth",
    excerpt: "Extra wide glasses for big heads and for men, measured. Which frames are genuinely built at a 158 mm front width, which only look large, and how to find your number.",
    date: "2026-04-14",
    readTime: 9,
    tags: ["Guide", "Wide Face", "158mm", "Comparison"],
    content: `
<p>If you have a face wider than 155&nbsp;mm, you already know the ritual. You walk into an optical store, the assistant hands you the "large" frames, and within thirty seconds the temples are pressing against the sides of your head. The Ray-Ban Wayfarer Large. The Persol 649. The Warby Parker Wide. All of them stop at roughly 145&nbsp;mm of total front width — and your face begins where their sizing ends.</p>

<p>This is not your face's fault. It is a sizing ceiling. And it is measurable.</p>

<p>We built Woolet because that ceiling exists. This article is the honest map of what sits above it — every frame we could find at a genuine 158&nbsp;mm front width, and how they actually compare. If you want the brand-level roundup instead — who sells what across the whole 150&nbsp;mm+ market, at every price tier — read <a href="/en/blog/best-glasses-for-big-heads-2026" style="color:#A07A2A;">best glasses for big heads</a>. This page stays on one number: 158&nbsp;mm.</p>

<h2>Why 99% of "large" frames still don't fit</h2>

<p>Standard adult eyewear is manufactured to a bell curve. The mainstream range runs from roughly 130&nbsp;mm to 145&nbsp;mm of total front width — hinge to hinge, including the frame body. Even the frames marketed as "oversized" or "XL" rarely exceed 148&nbsp;mm, because the moulds they are cut from were designed for a narrower face.</p>

<p>At 155&nbsp;mm and above, three things happen at once. The temples bow outward and press against the sides of your head. The arms sit high on the ears, leaving red marks after an hour. The optical centres of the lenses fall inward of your pupils, which distorts what you see and pulls the frame forward through the day.</p>

<p>None of that is fixed by an optician's bench. A frame moulded for 142&nbsp;mm cannot be adjusted to fit 158&nbsp;mm. The only real fix is starting from the correct width.</p>

<h2>How to measure what you actually need</h2>

<p>Before shopping, get one number: your total face width, measured temple to temple at the widest point. A ruler in front of a mirror is enough, or a credit card (85.6&nbsp;mm) held against the cheek as a reference. The full method is in <a href="/en/blog/how-to-measure-face-width-for-glasses" style="color:#A07A2A;">how to measure your face width</a>.</p>

<p>If you read <strong>155&nbsp;mm or more</strong>, you are outside the mainstream range and inside Woolet's territory.</p>

<p>Then learn to read the numbers printed on the inside of any existing frame's temple arm. A stamp like <strong>58□23-150</strong> means:</p>

<ul>
  <li><strong>58&nbsp;mm</strong> — lens width (a single lens, edge to edge)</li>
  <li><strong>23&nbsp;mm</strong> — bridge width (the gap between the two lenses)</li>
  <li><strong>150&nbsp;mm</strong> — temple length (the arm from hinge to tip)</li>
</ul>

<p>To estimate the total front width, add: <em>lens width × 2 + bridge width + roughly 6–8&nbsp;mm of frame body</em>. So a 58□23 frame lands near 148&nbsp;mm total — still narrow for a 158&nbsp;mm face. For temple length, 145&nbsp;mm is standard; wide faces need <strong>150–155&nbsp;mm</strong> so the arm reaches over the ear without pulling.</p>

<p>This is the part most retailers skip. If a shop cannot tell you the hinge-to-hinge measurement of a frame, they cannot tell you whether it fits.</p>

<div style="background:#F8F6F1;border-left:3px solid #c9a84c;padding:18px 22px;margin:24px 0;border-radius:4px;">
  <p style="margin:0;font-size:15px;line-height:1.6;color:#1a1a1a;">Not sure about your measurements? Our <a href="/en/fit" style="color:#A07A2A;font-weight:600;">Fit Wizard</a> tells you in 60 seconds — one front-facing photo, no tape measure required.</p>
</div>

<h2>Every frame we found at 158&nbsp;mm — honest comparison</h2>

<p>Below is the shortlist. These are the only frames we could verify at or near a 158&nbsp;mm total front width. We list them with their published specs, and we do not link to external stores — this is a fit comparison, not an affiliate table.</p>

<div style="overflow-x:auto;margin:24px 0;">
<table style="width:100%;border-collapse:collapse;font-family:'Barlow',sans-serif;font-size:14px;">
  <thead>
    <tr style="background:#0f0f0f;color:#f0ece4;">
      <th style="padding:12px 14px;text-align:left;border:1px solid #2a2a2a;">Model</th>
      <th style="padding:12px 14px;text-align:left;border:1px solid #2a2a2a;">Front width</th>
      <th style="padding:12px 14px;text-align:left;border:1px solid #2a2a2a;">Lens / bridge</th>
      <th style="padding:12px 14px;text-align:left;border:1px solid #2a2a2a;">Type</th>
      <th style="padding:12px 14px;text-align:left;border:1px solid #2a2a2a;">Built for wide faces?</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#FBF8F1;">
      <td style="padding:12px 14px;border:1px solid #E8E4DC;"><strong>Woolet 007 Round</strong></td>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">158&nbsp;mm</td>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">proportional lens, 21–22&nbsp;mm keyhole bridge</td>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">Optical &amp; sun, bespoke 145–162&nbsp;mm</td>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">Yes — designed at 158&nbsp;mm from scratch</td>
    </tr>
    <tr style="background:#FBF8F1;">
      <td style="padding:12px 14px;border:1px solid #E8E4DC;"><strong>Woolet 009 Square</strong></td>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">158&nbsp;mm</td>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">proportional lens, 21–22&nbsp;mm keyhole bridge</td>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">Optical &amp; sun, bespoke 145–162&nbsp;mm</td>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">Yes — designed at 158&nbsp;mm from scratch</td>
    </tr>
    <tr>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">Tom Ford Bettina TF 1068</td>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">158&nbsp;mm</td>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">15&nbsp;mm bridge</td>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">Sunglasses (luxury)</td>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">No — oversized fashion frame, narrow bridge</td>
    </tr>
    <tr>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">Oakley Holbrook Prizm Gaming</td>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">158&nbsp;mm</td>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">57&nbsp;mm lens / 18&nbsp;mm bridge</td>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">Sport / protective</td>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">Partially — sport styling only</td>
    </tr>
    <tr>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">Loretto LT2411 C1</td>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">158&nbsp;mm</td>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">58&nbsp;mm lens / 23&nbsp;mm bridge</td>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">Optical (budget)</td>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">No — scaled-up standard frame</td>
    </tr>
    <tr>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">STGATN XXL (Amazon)</td>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">155–158&nbsp;mm</td>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">varies</td>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">Polarised sunglasses</td>
      <td style="padding:12px 14px;border:1px solid #E8E4DC;">Partially — sun only, no optical</td>
    </tr>
  </tbody>
</table>
</div>

<h3>Tom Ford Bettina TF 1068</h3>
<p>The Bettina hits 158&nbsp;mm on the outside, and the acetate is unquestionably premium. The problem is the bridge — 15&nbsp;mm is narrow even for a standard face, and on a wide face the lenses sit too close to the nose while the outer edges overhang. It is an oversized fashion sunglass, not a wide-face frame. If you want a comparable width with a bridge that matches your proportions, the <a href="/en/products/009" style="color:#A07A2A;">Woolet 009 square</a> is the closer geometric answer.</p>

<h3>Oakley Holbrook Prizm Gaming</h3>
<p>Oakley's 158&nbsp;mm Holbrook variant is genuinely wide and genuinely durable. Its limitation is aesthetic and functional: it is a sport frame with sport branding, straight temples designed to sit under a helmet, and no optical version at this width in most markets. If you need one frame for the office, dinner, and outdoors, look at the <a href="/en/products/007" style="color:#A07A2A;">Woolet 007</a> or <a href="/en/products/009" style="color:#A07A2A;">009</a> — both come in optical and sun with the same 158&nbsp;mm front.</p>

<h3>Loretto LT2411 C1</h3>
<p>The Loretto is the honest budget option. The specs on paper are close — 58□23 lands at roughly the right total width, and it is available with prescription lenses. What you give up is the acetate quality, the hinge engineering, and the geometry: it is a standard frame scaled up rather than designed for the width. On a 158&nbsp;mm face it works, but it looks and feels like a larger version of a smaller frame. Compare against the <a href="/en/products/007" style="color:#A07A2A;">Woolet 007</a> in Italian Mazzucchelli acetate to see the difference.</p>

<h3>STGATN XXL (Amazon)</h3>
<p>Marketplace XXL sunglasses cover the 155–158&nbsp;mm range at a very low price. They fit, and if you only need a beach pair, they are a valid entry point. The limitation is consistent: injection-moulded plastic, no optical option, and specs that vary between batches. When you are ready for a frame you can wear every day, the <a href="/en/fit" style="color:#A07A2A;">Fit Wizard</a> will point you to the right Woolet size.</p>

<h2>What Woolet does differently</h2>

<p>Woolet frames are not scaled-up versions of a smaller design. Both the <a href="/en/products/007" style="color:#A07A2A;">007 round</a> and the <a href="/en/products/009" style="color:#A07A2A;">009 soft-square</a> are cut from a mould that starts at a 158&nbsp;mm front. The bridge is a 21–22&nbsp;mm keyhole — wider than the industry norm, and matched to the wider nasal geometry that tends to come with a wider face. The lens area is scaled proportionally, so the optical centres actually align with your pupils. Temple length is engineered for wide heads, not borrowed from a 142&nbsp;mm frame.</p>

<p>The acetate is Italian Mazzucchelli — the same block used by high-end European houses — and every frame is Hand made in EU. Above and below the standard 158&nbsp;mm size sits the <a href="/en/bespoke" style="color:#A07A2A;">bespoke tier</a>, which covers 145–162&nbsp;mm to the millimetre for faces that fall outside the standard range.</p>

<p>Before you order, run the <a href="/en/fit" style="color:#A07A2A;">AI Fit Wizard</a>. It tells you whether the 158&nbsp;mm standard fits you, or whether you should go bespoke.</p>

<h2>FAQ</h2>

<h3>What is the widest glasses frame available?</h3>
<p>Off-the-shelf, 158&nbsp;mm is currently the widest common size — held by Woolet 007, Woolet 009, Tom Ford Bettina TF 1068, Oakley Holbrook (Prizm Gaming variant) and Loretto LT2411. Bespoke tiers go further: Woolet bespoke covers 145–162&nbsp;mm.</p>

<h3>Is a 158&nbsp;mm frame width big?</h3>
<p>Yes. Standard adult frames run 130–145&nbsp;mm. 158&nbsp;mm sits 13&nbsp;mm above the mainstream ceiling and is engineered for faces of 155&nbsp;mm and above.</p>

<h3>How do I know my face is too wide for standard glasses?</h3>
<p>Measure temple to temple. If you read 155&nbsp;mm or more, standard frames will pinch and leave red marks. Frames sitting too high on the ears, temples bowing outward, or lenses drifting forward through the day are the practical signs.</p>

<h3>Do wide 158&nbsp;mm frames come in prescription?</h3>
<p>Yes. Both <a href="/en/products/007" style="color:#A07A2A;">Woolet 007</a> and <a href="/en/products/009" style="color:#A07A2A;">009</a> are available with single-vision and progressive prescription lenses at the 158&nbsp;mm width, in optical or sun. Loretto also offers a prescription option at this width; Tom Ford Bettina and the sport Holbrook variants are typically sun-only.</p>

<h3>What about a wider bridge — is 21&nbsp;mm important?</h3>
<p>For most wide faces, yes. A narrow 15–18&nbsp;mm bridge on a 158&nbsp;mm front leaves the lenses too far inboard. A 21–22&nbsp;mm keyhole bridge keeps the optical centres aligned with your pupils and prevents the frame from sitting too low on the nose.</p>

<p style="border-top:1px solid #E8E4DC;margin-top:32px;padding-top:20px;">See the frames built at 158&nbsp;mm from scratch: <a href="/en/products/007" style="color:#A07A2A;">Woolet 007 (round)</a> · <a href="/en/products/009" style="color:#A07A2A;">Woolet 009 (soft square)</a> · <a href="/en/fit" style="color:#A07A2A;">run the Fit Wizard</a> · <a href="/en/bespoke" style="color:#A07A2A;">bespoke 145–162&nbsp;mm</a>.</p>
`,
    faq: [
      { q: "What is the widest glasses frame available?", a: "Off-the-shelf, 158 mm is currently the widest common size — held by Woolet 007, Woolet 009, Tom Ford Bettina TF 1068, Oakley Holbrook (Prizm Gaming variant) and Loretto LT2411. Bespoke tiers go further: Woolet bespoke covers 145–162 mm." },
      { q: "Is a 158 mm frame width big?", a: "Yes. Standard adult frames run 130–145 mm. 158 mm sits 13 mm above the mainstream ceiling and is engineered for faces of 155 mm and above." },
      { q: "How do I know my face is too wide for standard glasses?", a: "Measure temple to temple. If you read 155 mm or more, standard frames will pinch and leave red marks. Frames sitting too high on the ears, temples bowing outward, or lenses drifting forward through the day are the practical signs." },
      { q: "Do wide 158 mm frames come in prescription?", a: "Yes. Both Woolet 007 and 009 are available with single-vision and progressive prescription lenses at the 158 mm width, in optical or sun. Loretto also offers a prescription option at this width; Tom Ford Bettina and the sport Holbrook variants are typically sun-only." },
      { q: "Is a 21 mm bridge important on a 158 mm frame?", a: "For most wide faces, yes. A narrow 15–18 mm bridge on a 158 mm front leaves the lenses too far inboard. A 21–22 mm keyhole bridge keeps the optical centres aligned with your pupils and prevents the frame from sitting too low on the nose." },
    ],
  },
  {
    slug: "how-to-measure-your-head-for-a-hat",
    title: "How to Measure Your Head for a Hat (Free Method + Size Chart in cm & inches)",
    excerpt: "Measure your head circumference at home in 60 seconds and find your true hat size — no tape measure required. A no-nonsense guide built for bigger heads (7¾ and up).",
    date: "2026-03-15",
    readTime: 7,
    tags: ["How-to", "Measurement", "Big Heads", "Sizing"],
    faq: [
      {
        q: "How do I measure my head for a hat without a tape measure?",
        a: "Use a piece of string, a phone charging cable, or a shoelace. Wrap it once around your head about 2.5 cm (1 inch) above your ears and eyebrows — the widest point. Mark where it overlaps, lay it flat next to a ruler, and read the length in centimetres. That number is your head circumference. Convert to hat size using the chart in this article.",
      },
      {
        q: "What is considered a big head for a hat?",
        a: "Anything above 60 cm (23⅝ inches, US size 7½) is considered large. 61–62 cm is XL (7⅝–7¾), 63–64 cm is XXL (7⅞–8). Most mainstream hat brands top out at 60 cm — which is why buyers with heads above that struggle to find hats that fit without stretching.",
      },
      {
        q: "What size hat do I wear if my head is 60 cm?",
        a: "60 cm equals a US hat size 7½, UK 7⅜, EU 60. If your measurement lands between two sizes, always round up — hats are easier to pad down than to stretch out.",
      },
      {
        q: "Is head circumference the same as face width?",
        a: "No — but they correlate strongly. A head circumference above 60 cm usually means a face width above 150 mm (temple to temple), which puts you outside standard eyewear sizing too. If your hats never fit, your glasses probably don't either.",
      },
      {
        q: "Where do you measure head circumference for a hat?",
        a: "Around the widest part of your head: roughly 2.5 cm (1 inch) above your eyebrows in front, and just above your ears on the sides — following the same line all the way around. Keep the string level and snug, not tight.",
      },
    ],
    howTo: {
      name: "How to Measure Your Head for a Hat",
      description: "Measure your head circumference at home in under a minute using a piece of string or a soft tape measure. The only number that decides if a hat will actually fit.",
      totalTime: "PT1M",
      supply: ["A piece of string, shoelace, or phone charging cable (about 80 cm long)", "A ruler or a standard credit card (85.6 mm wide) for reference"],
      tool: ["Mirror (optional)"],
      step: [
        {
          name: "Find the widest part of your head",
          text: "Place your fingers about 2.5 cm (1 inch) above your eyebrows and just above the tops of your ears. This is the line a hat brim will sit on — and the widest circumference of your skull.",
        },
        {
          name: "Wrap a string once around that line",
          text: "Take a piece of string, a shoelace or a phone cable and wrap it once around your head along that line. Keep it level — front, back and sides at the same height — and snug but not tight. Mark where the string overlaps with your thumb or a pen.",
        },
        {
          name: "Measure the string against a ruler",
          text: "Lay the string flat next to a ruler and read the length in centimetres. No ruler? Use a credit card: every credit card is exactly 85.6 mm (8.56 cm) wide. Count how many card-widths your string covers, then multiply.",
        },
        {
          name: "Convert to a hat size",
          text: "Match your circumference to the hat size chart in this article. 60 cm = US 7½ = EU 60 = L. If you land between sizes, always round up — you can pad a hat down, you cannot stretch it up by a full size.",
        },
      ],
    },
    content: `
<div style="display:flex;align-items:center;gap:14px;padding:16px 0;border-top:1px solid #E8E4DC;border-bottom:1px solid #E8E4DC;margin-bottom:28px;font-family:'Barlow',sans-serif;">
  <div style="flex-shrink:0;width:44px;height:44px;border-radius:50%;background:#0f0f0f;color:#c9a84c;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;letter-spacing:0.5px;">MC</div>
  <div style="flex:1;min-width:0;">
    <div style="font-size:14px;font-weight:600;color:#1a1a1a;line-height:1.3;">Marek Cieśla</div>
    <div style="font-size:12px;color:#666;line-height:1.5;margin-top:2px;">Founder, Woolet Eyewear · Serial entrepreneur · <a href="https://www.linkedin.com/in/marekciesla/" target="_blank" rel="noopener" style="color:#c9a84c;text-decoration:none;">LinkedIn</a></div>
    <div style="font-size:11px;color:#999;letter-spacing:1.5px;text-transform:uppercase;margin-top:6px;">Last updated: March 2026</div>
  </div>
</div>

<p>If you've ever bought a hat that gave you a red ring across your forehead by lunchtime, the problem was never your head. It was the number on the label. Hat sizing is one of the last corners of fashion still trapped in three parallel systems — inches, centimetres, and letter sizes that mean something different at every brand — and almost nobody teaches you the one measurement that decides all of them.</p>

<p>This guide fixes that in about a minute. No specialist tools, no visit to a hatter, no returning three sizes in a row. Just a string, a ruler, and the chart below.</p>

<div style="background:#F8F6F1;border-left:3px solid #c9a84c;padding:18px 22px;margin:24px 0;border-radius:4px;">
  <div style="font-family:'Barlow',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#888;margin-bottom:10px;">The one number that matters</div>
  <p style="margin:0;font-size:15px;line-height:1.65;color:#1a1a1a;">Your <strong>head circumference</strong> — measured in centimetres around the widest part of your skull, roughly 2.5&nbsp;cm above your eyebrows and ears. Every hat size in every country converts directly from this single number. Get it right once and you never guess a size again.</p>
</div>

<h2>How to Measure Your Head in 60 Seconds</h2>

<p>You need one flexible thing long enough to wrap around your head — a piece of string, a shoelace, a phone charging cable, a strip of paper — and something to measure it against. A ruler is ideal, but a credit card works too (every credit card in the world is exactly 85.6&nbsp;mm wide, by ISO/IEC 7810 standard).</p>

<ol>
<li><strong>Find the line.</strong> Place your fingers about 2.5&nbsp;cm (1 inch) above your eyebrows in front, and just above the tops of your ears on the sides. That's where a hat brim sits — and the widest part of your skull.</li>
<li><strong>Wrap the string.</strong> Loop it once around your head along that exact line. Keep it level — no dipping at the back — and snug, not tight. If it presses into your skin, loosen it slightly.</li>
<li><strong>Mark the overlap.</strong> Pinch the point where the string meets its own end, or mark it with a pen.</li>
<li><strong>Measure it flat.</strong> Lay the string next to a ruler and read the length in centimetres. No ruler? Line it up against credit cards edge-to-edge: each card is 8.56&nbsp;cm, so 7 cards ≈ 60&nbsp;cm.</li>
<li><strong>Round up.</strong> If you land between two sizes, always go up. A hat can be padded down with a sizing strip; it cannot be stretched up by a full size without deforming.</li>
</ol>

<div style="background:#0f0f0f;color:#f0ece4;padding:26px 28px;margin:28px 0;border-radius:6px;font-family:'Barlow',sans-serif;">
  <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;margin-bottom:16px;font-weight:500;">Shortcut: measure with your phone</div>
  <p style="font-size:14px;line-height:1.7;color:#f0ece4;margin:0 0 14px 0;">Woolet built an <strong style="color:#fff;">AI Fit Wizard</strong> that measures your <em>face width</em> from a single phone photo using a credit card as a reference — accurate to about 2&nbsp;mm. Face width and head circumference correlate strongly (bigger head, wider face, almost always), so the Fit Wizard gives you a solid estimate of both in about 30 seconds.</p>
  <p style="font-size:14px;line-height:1.7;color:#f0ece4;margin:0;"><a href="/en/fit/wizard" style="color:#c9a84c;text-decoration:underline;font-weight:500;">Try the AI Fit Wizard →</a></p>
</div>

<h2>Hat Size Chart: cm, inches, US, UK, EU</h2>

<p>Match your measurement to the row below. This chart uses the international <a href="https://en.wikipedia.org/wiki/Hat#Sizing" target="_blank" rel="noopener" style="color:#c9a84c;">standard hat sizing conversion</a> — the same numbers your hatter, your fitted-cap brand, and your cowboy-hat maker are all working from, whether they say so or not.</p>

<div style="overflow-x:auto;margin:24px 0;">
<table style="width:100%;border-collapse:collapse;font-family:'Barlow',sans-serif;font-size:14px;">
  <thead>
    <tr style="background:#F8F6F1;">
      <th style="text-align:left;padding:12px 14px;border-bottom:2px solid #0f0f0f;font-weight:600;">Head (cm)</th>
      <th style="text-align:left;padding:12px 14px;border-bottom:2px solid #0f0f0f;font-weight:600;">Head (in)</th>
      <th style="text-align:left;padding:12px 14px;border-bottom:2px solid #0f0f0f;font-weight:600;">US</th>
      <th style="text-align:left;padding:12px 14px;border-bottom:2px solid #0f0f0f;font-weight:600;">UK</th>
      <th style="text-align:left;padding:12px 14px;border-bottom:2px solid #0f0f0f;font-weight:600;">EU</th>
      <th style="text-align:left;padding:12px 14px;border-bottom:2px solid #0f0f0f;font-weight:600;">Letter</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">54</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">21¼</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">6¾</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">6⅝</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">54</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">XS</td></tr>
    <tr><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">55</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">21⅝</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">6⅞</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">6¾</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">55</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">S</td></tr>
    <tr><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">56</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">22</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">7</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">6⅞</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">56</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">S</td></tr>
    <tr><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">57</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">22⅜</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">7⅛</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">7</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">57</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">M</td></tr>
    <tr><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">58</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">22¾</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">7¼</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">7⅛</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">58</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">M</td></tr>
    <tr><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">59</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">23¼</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">7⅜</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">7¼</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">59</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">L</td></tr>
    <tr style="background:#FBF7ED;"><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">60</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">23⅝</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">7½</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">7⅜</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">60</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">L / XL</td></tr>
    <tr style="background:#FBF7ED;"><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">61</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">24</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">7⅝</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">7½</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">61</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">XL</td></tr>
    <tr style="background:#FBF7ED;"><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">62</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">24⅜</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">7¾</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">7⅝</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">62</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">XL</td></tr>
    <tr style="background:#FBF7ED;"><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">63</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">24¾</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">7⅞</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">7¾</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">63</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">XXL</td></tr>
    <tr style="background:#FBF7ED;"><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">64</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">25¼</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">8</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">7⅞</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">64</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">XXL</td></tr>
    <tr style="background:#FBF7ED;"><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">65</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">25⅝</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">8⅛</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">8</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">65</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">XXXL</td></tr>
  </tbody>
</table>
</div>

<p style="font-size:13px;color:#666;margin-top:-8px;"><em>Rows highlighted in cream are the sizes most mainstream brands don't stock — the reason bigger heads have to shop specialist.</em></p>

<h2>What Counts as a "Big Head" for Hats?</h2>

<p>The short answer: anything above <strong>60&nbsp;cm (US 7½)</strong>. The average adult male head measures 56–58&nbsp;cm; the average adult female head measures 54–56&nbsp;cm. From about 60&nbsp;cm upward, you leave the range that most off-the-shelf brands actually stock — Zara, H&amp;M and most fashion caps stop at "one size fits most", which in practice means up to about 59&nbsp;cm.</p>

<p>For heads above 61&nbsp;cm, you're looking at specialist brands: <a href="https://www.mammothheadwear.com/" target="_blank" rel="noopener" style="color:#A07A2A;">Mammoth Headwear</a>, <a href="https://bighatstore.com/" target="_blank" rel="noopener" style="color:#A07A2A;">Big Hat Store</a>, and Noggin Boss are the three most-cited names for XL and XXL fits. If you consistently wear 7¾ or 8, one-size caps and vintage fedoras are simply not built for you — and no amount of steaming will fix that.</p>

<h2>The Overlap Nobody Talks About: Big Head, Wide Face</h2>

<p>Head circumference and face width aren't the same measurement, but they track together closely. In our own fitting data, roughly <strong>4 out of 5 customers with a head above 60&nbsp;cm also measure above 150&nbsp;mm across the temples</strong> — which puts them outside the sizing range of virtually every mainstream eyewear brand.</p>

<p>If your hats never fit, your glasses probably don't either. The same standard bell curve that stops at 60&nbsp;cm on hats stops at 145&nbsp;mm on eyewear. That's the gap Woolet was built to fill — frames that start at 158&nbsp;mm front width, designed specifically for faces the mainstream industry sizes out.</p>

<div style="background:#0f0f0f;color:#f0ece4;padding:26px 28px;margin:28px 0;border-radius:6px;font-family:'Barlow',sans-serif;">
  <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;margin-bottom:16px;font-weight:500;">Related: eyewear for the same crowd</div>
  <p style="font-size:14px;line-height:1.7;color:#f0ece4;margin:0 0 12px 0;">If your hat size is 7½ or up, there's a strong chance mainstream frames pinch your temples too. Woolet 007 and 009 ship at 158&nbsp;mm front width — built for exactly this group.</p>
  <p style="font-size:14px;line-height:1.7;color:#f0ece4;margin:0;">
    <a href="/en/collections/glasses-for-big-heads" style="color:#c9a84c;text-decoration:underline;font-weight:500;">See glasses for big heads →</a>
    &nbsp;·&nbsp;
    <a href="/en/blog/how-to-measure-face-width-for-glasses" style="color:#c9a84c;text-decoration:underline;font-weight:500;">Measure your face width →</a>
  </p>
</div>

<h2>Common Mistakes When Measuring</h2>

<ul>
<li><strong>Measuring too high.</strong> The tape should sit about 2.5&nbsp;cm above the eyebrows — not on the hairline. Measuring at the hairline underestimates by 1–2&nbsp;cm and drops you a full size.</li>
<li><strong>Pulling the string tight.</strong> Snug, not tight. A hat has to sit comfortably for hours; a tape pulled hard gives you a size that will squeeze after 20 minutes.</li>
<li><strong>Not keeping it level.</strong> If the string dips at the back of your skull, the reading is wrong. Use a mirror to check.</li>
<li><strong>Measuring once.</strong> Do it three times and take the middle number. Skin, hair volume and how tightly you hold the string all shift the reading by 3–5&nbsp;mm.</li>
<li><strong>Rounding down.</strong> If you're between sizes, always go up. A padded strip inside a hat is a 30-second fix; a hat that's a size too small is a return.</li>
</ul>

<h2>How Hat Shape Changes the Fit</h2>

<p>Head circumference decides <em>size</em>, but two heads at 60&nbsp;cm can wear the same size and get completely different results — because human skulls aren't perfect circles. The two shapes that matter:</p>

<ul>
<li><strong>Oval (long front-to-back).</strong> The most common Western shape. Standard hat blocks are built for this — most brands work fine.</li>
<li><strong>Round (nearly circular from above).</strong> More common in East Asian and some Central-European populations. A standard oval hat will pinch at the temples and gap at the front and back. Look for brands that offer a "round oval" or "long oval" fit — Stetson, Bailey, and Christys' London all label them.</li>
</ul>

<p>If your hats always pinch at the sides even in the right circumference, your head is round — not big. Different problem, different fix.</p>

<h2>Quick Answers</h2>

<p><strong>What size hat is 58&nbsp;cm?</strong> US 7¼, UK 7⅛, EU 58, letter size M.</p>
<p><strong>What size hat is 60&nbsp;cm?</strong> US 7½, UK 7⅜, EU 60, letter size L/XL — the tipping point where mainstream brands stop stocking.</p>
<p><strong>Is 62&nbsp;cm a big head?</strong> Yes. That's US 7¾, XL, and above the range of most off-the-shelf caps. You need a specialist brand.</p>
<p><strong>How do I know if a hat is too small?</strong> If it leaves a red ring on your forehead after 30 minutes, or you feel a headache building at the temples, it's undersized by at least a half-size. Return it.</p>

<p style="border-top:1px solid #E8E4DC;margin-top:32px;padding-top:20px;">
More on fit for bigger heads and wider faces:
<a href="/en/blog/best-glasses-for-big-heads-2026" style="color:#A07A2A;">best glasses for big heads</a> ·
<a href="/en/blog/what-size-glasses-for-a-large-head" style="color:#A07A2A;">what size glasses for a large head</a> ·
<a href="/en/blog/how-to-measure-face-width-for-glasses" style="color:#A07A2A;">how to measure your face width</a> ·
<a href="/en/fit/wizard" style="color:#A07A2A;">try the AI Fit Wizard</a>.
</p>
`,
  },
  {
    slug: "hat-size-chart-guide-cm-inches-us-uk-eu",
    title: "Hat Size Chart: Complete Guide (US, UK, EU, cm & inches)",
    excerpt: "The one hat sizing chart that reconciles US, UK, EU, cm and inches — plus how to read fractional sizes like 7 5/8, what a fitted cap number really means, and what to do when you're between sizes.",
    date: "2026-03-18",
    readTime: 8,
    tags: ["Size Chart", "Sizing", "Big Heads", "Reference"],
    faq: [
      {
        q: "What is 7 5/8 hat size in cm?",
        a: "A US hat size of 7 5/8 equals a head circumference of 61 cm (24 inches). It's the standard XL size in most catalogues and the first size above what mainstream one-size-fits-most caps stock.",
      },
      {
        q: "What is a size 7 hat in cm?",
        a: "A US size 7 hat equals 56 cm (22 inches) — an S/M size for most adult men, or M for women.",
      },
      {
        q: "How do US and UK hat sizes differ?",
        a: "UK hat sizes run exactly 1/8 smaller than US sizes at the same circumference. A 60 cm head is US 7½ and UK 7⅜. Every full US–UK conversion in this article uses that 1/8 shift.",
      },
      {
        q: "What is the average hat size?",
        a: "For adult men in Europe and North America, 57–58 cm (US 7⅛–7¼). For adult women, 55–57 cm (US 6⅞–7⅛). In the ANSUR II survey, 36.8% of men measure 58 cm or more and 6.4% measure above 60 cm — the point where mainstream ranges stop.",
      },
      {
        q: "How do I convert head circumference in cm to inches?",
        a: "Divide the cm value by 2.54. A 60 cm head equals 23.62 inches (rounded to 23⅝ on hat charts). All hat charts round inches to the nearest eighth to match traditional US sizing.",
      },
      {
        q: "Should I size up or size down if I'm between hat sizes?",
        a: "Always size up. A hat can be padded down with a self-adhesive sizing strip in under a minute; a hat that's a full size too small will squeeze, leave a red ring, and cannot be stretched more than 3–4 mm without deforming.",
      },
      {
        q: "What size glasses do I need for a 7 5/8 hat?",
        a: "A US 7 5/8 hat is a 61 cm head, which puts your temple width around 161 mm. You need a frame with a front width of roughly 158–162 mm. Standard frames run 140–148 mm, so nothing off the shelf will sit straight on you.",
      },
      {
        q: "Does a big head always mean a wide face?",
        a: "Usually, but not always. Head circumference and head breadth correlate at r = 0.55 in the ANSUR II anthropometric survey. A long-oval head can carry a 60 cm circumference with a narrower than median breadth, which is why a photo measurement is more precise than a hat-size estimate.",
      },
      {
        q: "Is temple width the same as face width?",
        a: "No. Face width is usually quoted as cheekbone to cheekbone (bizygomatic breadth), about 12–14 mm narrower than temple width. Glasses sit on the temples, so temple width is the measurement that decides frame fit.",
      },
      {
        q: "What hat size means I need wide glasses?",
        a: "A US 7 1/4 hat (58 cm) or larger. At 58 cm the median temple width is 155 mm, and 93 percent of men that size exceed 148 mm, which is where most mainstream eyewear ranges stop.",
      },
    ],
    content: `
<div style="display:flex;align-items:center;gap:14px;padding:16px 0;border-top:1px solid #E8E4DC;border-bottom:1px solid #E8E4DC;margin-bottom:28px;font-family:'Barlow',sans-serif;">
  <div style="flex-shrink:0;width:44px;height:44px;border-radius:50%;background:#0f0f0f;color:#c9a84c;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;letter-spacing:0.5px;">MC</div>
  <div style="flex:1;min-width:0;">
    <div style="font-size:14px;font-weight:600;color:#1a1a1a;line-height:1.3;">Marek Cieśla</div>
    <div style="font-size:12px;color:#666;line-height:1.5;margin-top:2px;">Founder, Woolet Eyewear · Serial entrepreneur · <a href="https://www.linkedin.com/in/marekciesla/" target="_blank" rel="noopener" style="color:#c9a84c;text-decoration:none;">LinkedIn</a></div>
    <div style="font-size:11px;color:#999;letter-spacing:1.5px;text-transform:uppercase;margin-top:6px;">Last updated: August 2026</div>
  </div>
</div>

<p>Hat sizing is one of the last places in fashion where four different measurement systems are still in daily use — cm, inches, fractional US sizes, and letter sizes — and nobody at the shop counter agrees on the conversion. This is the single chart that reconciles all four, plus the context you need to read it correctly the first time.</p>

<p>One more thing the chart will tell you, if you know where to look: your hat size is the single best off-the-shelf predictor of whether glasses will fit you. The two measurements sit on the same ring of your skull. <a href="#your-hat-size-predicts-your-glasses-size" style="color:#c9a84c;">Skip to the hat size → glasses size conversion ↓</a></p>

<div style="background:#F8F6F1;border-left:3px solid #c9a84c;padding:18px 22px;margin:24px 0;border-radius:4px;">
  <div style="font-family:'Barlow',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#888;margin-bottom:10px;">The rule that fixes 90% of confusion</div>
  <p style="margin:0;font-size:15px;line-height:1.65;color:#1a1a1a;">Every hat size in the world is derived from one number: your <strong>head circumference in centimetres</strong>. US, UK and EU sizes are just three different ways of labelling the same measurement. Get the cm right and the rest is arithmetic.</p>
</div>

<h2>The Master Hat Size Chart</h2>

<p>Read across the row. If your circumference lands between two rows, use the larger one — see <a href="#between-sizes" style="color:#c9a84c;">between sizes</a> below. Don't know your circumference yet? <a href="/en/blog/how-to-measure-your-head-for-a-hat" style="color:#c9a84c;">Measure your head in 60 seconds</a>.</p>

<div style="overflow-x:auto;margin:24px 0;">
<table style="width:100%;border-collapse:collapse;font-family:'Barlow',sans-serif;font-size:14px;min-width:640px;">
  <thead>
    <tr style="background:#F8F6F1;">
      <th style="text-align:left;padding:12px 14px;border-bottom:2px solid #0f0f0f;font-weight:600;">Head (cm)</th>
      <th style="text-align:left;padding:12px 14px;border-bottom:2px solid #0f0f0f;font-weight:600;">Head (in)</th>
      <th style="text-align:left;padding:12px 14px;border-bottom:2px solid #0f0f0f;font-weight:600;">US</th>
      <th style="text-align:left;padding:12px 14px;border-bottom:2px solid #0f0f0f;font-weight:600;">UK</th>
      <th style="text-align:left;padding:12px 14px;border-bottom:2px solid #0f0f0f;font-weight:600;">EU / cm</th>
      <th style="text-align:left;padding:12px 14px;border-bottom:2px solid #0f0f0f;font-weight:600;">Letter</th>
      <th style="text-align:left;padding:12px 14px;border-bottom:2px solid #0f0f0f;font-weight:600;">Temple width*</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">53</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">20⅞</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">6⅝</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">6½</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">53</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">XXS</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">146&nbsp;mm</td></tr>
    <tr><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">54</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">21¼</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">6¾</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">6⅝</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">54</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">XS</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">148&nbsp;mm</td></tr>
    <tr><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">55</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">21⅝</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">6⅞</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">6¾</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">55</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">S</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">150&nbsp;mm</td></tr>
    <tr><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">56</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">22</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">7</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">6⅞</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">56</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">S / M</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">151&nbsp;mm</td></tr>
    <tr><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">57</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">22⅜</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">7⅛</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">7</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">57</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">M</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">153&nbsp;mm</td></tr>
    <tr style="background:#FBF7ED;color:#1a1a1a;"><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">58</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">22¾</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">7¼</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">7⅛</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">58</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">M</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">155&nbsp;mm</td></tr>
    <tr style="background:#FBF7ED;color:#1a1a1a;"><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">59</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">23¼</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">7⅜</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">7¼</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">59</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">L</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">157&nbsp;mm</td></tr>
    <tr style="background:#FBF7ED;color:#1a1a1a;"><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">60</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">23⅝</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">7½</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">7⅜</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">60</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">L / XL</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">159&nbsp;mm</td></tr>
    <tr style="background:#FBF7ED;color:#1a1a1a;"><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">61</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">24</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">7⅝</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">7½</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">61</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">XL</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">161&nbsp;mm</td></tr>
    <tr style="background:#FBF7ED;color:#1a1a1a;"><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">62</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">24⅜</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">7¾</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">7⅝</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">62</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">XL</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">163&nbsp;mm</td></tr>
    <tr style="background:#FBF7ED;color:#1a1a1a;"><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">63</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">24¾</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">7⅞</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">7¾</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">63</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">XXL</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">~165&nbsp;mm</td></tr>
    <tr style="background:#FBF7ED;color:#1a1a1a;"><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">64</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">25¼</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">8</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">7⅞</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">64</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">XXL</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">~167&nbsp;mm</td></tr>
    <tr style="background:#FBF7ED;color:#1a1a1a;"><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">65</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">25⅝</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">8⅛</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">8</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">65</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">XXXL</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">~169&nbsp;mm</td></tr>
    <tr style="background:#FBF7ED;color:#1a1a1a;"><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">66</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">26</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">8¼</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">8⅛</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">66</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">XXXL</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">~171&nbsp;mm</td></tr>
  </tbody>
</table>
</div>

<p style="font-size:13px;color:#666;margin-top:-8px;"><em>*Temple width = distance across the widest point of your skull, where glasses arms sit. Median values from ANSUR II (n = 4,082 men); 63&nbsp;cm and above are extrapolated. Rows highlighted in cream (58&nbsp;cm+, US 7¼ and up) are where mainstream hats and mainstream eyewear both start running out — see the conversion table below.</em></p>

<h2>Your Hat Size Predicts Your Glasses Size</h2>

<p>Hat size is a circumference. Glasses size is a breadth. They are not the same measurement — but they are measured on the same ring of your skull, roughly a centimetre above your ears, and they move together. In the ANSUR II anthropometric survey (n = 4,082 men) the two correlate at <strong>r = 0.55</strong>, tight enough that your hat size narrows your frame width to a 4&nbsp;mm window before you try anything on.</p>

<p style="background:#F8F6F1;padding:14px 18px;border-radius:4px;font-family:'Barlow',sans-serif;font-size:15px;">The arithmetic, if you want it: <strong>temple width (mm) ≈ 1.91 × head circumference (cm) + 44.7</strong></p>

<div style="overflow-x:auto;margin:24px 0;">
<table style="width:100%;border-collapse:collapse;font-family:'Barlow',sans-serif;font-size:14px;min-width:640px;">
  <thead>
    <tr style="background:#F8F6F1;">
      <th style="text-align:left;padding:12px 14px;border-bottom:2px solid #0f0f0f;font-weight:600;">Hat size (US)</th>
      <th style="text-align:left;padding:12px 14px;border-bottom:2px solid #0f0f0f;font-weight:600;">Head (cm)</th>
      <th style="text-align:left;padding:12px 14px;border-bottom:2px solid #0f0f0f;font-weight:600;">Your temple width</th>
      <th style="text-align:left;padding:12px 14px;border-bottom:2px solid #0f0f0f;font-weight:600;">Frame front width you need</th>
      <th style="text-align:left;padding:12px 14px;border-bottom:2px solid #0f0f0f;font-weight:600;">In mainstream frames</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">6⅝ – 6⅞</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">53 – 55</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">146 – 150&nbsp;mm</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">140 – 148&nbsp;mm</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">Standard sizes fit. You are in the range every brand designs for.</td></tr>
    <tr><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">7 – 7⅛</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">56 – 57</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">151 – 153&nbsp;mm</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">148 – 152&nbsp;mm</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">Borderline. Look for models labelled “wide” or “XL” — regular fits leave marks after a few hours.</td></tr>
    <tr style="background:#FBF7ED;color:#1a1a1a;"><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">7¼ – 7⅜</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">58 – 59</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">155 – 157&nbsp;mm</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">155 – 158&nbsp;mm</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">They pinch. 93% of men this size are already past the point where mainstream frames stop.</td></tr>
    <tr style="background:#FBF7ED;color:#1a1a1a;"><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">7½ – 7⅝</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">60 – 61</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">159 – 161&nbsp;mm</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">158 – 162&nbsp;mm</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">Nothing off the shelf fits. Arms splay outward, the front bows, lenses sit off-axis.</td></tr>
    <tr style="background:#FBF7ED;color:#1a1a1a;"><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">7¾ and up</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">62+</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">163&nbsp;mm+</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">162&nbsp;mm+</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">Bespoke territory. The same shops that stock your hat size do not exist in eyewear.</td></tr>
  </tbody>
</table>
</div>

<p style="font-size:13px;color:#666;margin-top:-8px;"><em>Frame front width = total width of the frame, hinge to hinge — not lens width. It is the number that decides whether the arms run straight back or splay. Most mainstream brands top out around 148&nbsp;mm; a handful of “XL” lines reach 152&nbsp;mm.</em></p>

<div style="background:#F8F6F1;border-left:3px solid #c9a84c;padding:18px 22px;margin:24px 0;border-radius:4px;">
  <div style="font-family:'Barlow',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#888;margin-bottom:10px;">Where Woolet sits on this table</div>
  <p style="margin:0 0 10px 0;font-size:15px;line-height:1.65;color:#1a1a1a;">We build one front width: <strong>158&nbsp;mm</strong>. That is deliberate — it covers the 58–61&nbsp;cm band (US 7¼ to 7⅝) properly rather than covering everything badly.</p>
  <p style="margin:0 0 10px 0;font-size:15px;line-height:1.65;color:#1a1a1a;">If your hat is 7 or smaller, you do not need us. A mainstream frame labelled “wide” or “XL” will fit you, and we would rather tell you that than sell you 158&nbsp;mm you will have to push back up your nose. If you are 62&nbsp;cm and above, 158&nbsp;mm is still short for you — that is what bespoke is for.</p>
  <p style="margin:0;font-size:14px;line-height:1.65;"><a href="/en/collections/wide-face-glasses" style="color:#A07A2A;">See the 158 mm frames →</a> · <a href="/en/fit/bespoke" style="color:#A07A2A;">Bespoke up to 162 mm →</a></p>
</div>

<p>The line to remember: <strong>7¼</strong>. Not 7½. A US 7¼ hat means a 58&nbsp;cm head, and at 58&nbsp;cm the median temple width is already 155&nbsp;mm — seven millimetres past where most eyewear brands stop designing. If you have ever bought a hat in 7¼ or larger and separately assumed your glasses were “just a bit tight”, those are the same fact.</p>

<div style="background:#0f0f0f;color:#f0ece4;padding:26px 28px;margin:28px 0;border-radius:6px;font-family:'Barlow',sans-serif;">
  <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;margin-bottom:16px;font-weight:500;">Don't want to estimate from a hat size?</div>
  <p style="font-size:14px;line-height:1.7;color:#f0ece4;margin:0 0 14px 0;">The table above gives you a median. Your own face can sit 4–5&nbsp;mm either side of it. Woolet's <strong style="color:#fff;">AI Fit Wizard</strong> measures your actual temple width from a single phone photo — accurate to about 2&nbsp;mm, using a credit card as the reference object. No tape measure, no guessing which side of the median you are on.</p>
  <p style="font-size:14px;line-height:1.7;color:#f0ece4;margin:0;"><a href="/en/fit/wizard" style="color:#c9a84c;text-decoration:underline;font-weight:500;">Measure my temple width →</a> · <a href="/en/collections/wide-face-glasses" style="color:#c9a84c;text-decoration:underline;font-weight:500;">See frames at 158 mm →</a></p>
</div>

<h2>How to Read US Fractional Sizes (7, 7⅛, 7¼…)</h2>

<p>The US size is not arbitrary — it's the hat's <strong>internal diameter in inches</strong>, assuming the head is a perfect circle. To convert from any circumference:</p>

<p style="background:#F8F6F1;padding:14px 18px;border-radius:4px;font-family:'Barlow',sans-serif;font-size:15px;"><strong>US size</strong> = head circumference (in) ÷ π <em>(≈ 3.1416)</em></p>

<p>A 60&nbsp;cm head is 23.62&nbsp;in ÷ 3.1416 = 7.52 → rounded to the nearest eighth = <strong>7½</strong>. That's why the chart moves in 1/8-inch increments: it mirrors the way felt hat blocks and fitted-cap moulds are actually manufactured.</p>

<h2>UK vs US: The 1/8 Shift</h2>

<p>UK sizes label the same physical hat one-eighth of an inch smaller than the US number. Nobody outside the trade knows why — it's a leftover from parallel 19th-century hatter guilds — but the shift is exact and predictable. If a British brand tells you the hat is a 7⅜, the American equivalent is 7½.</p>

<h2>EU and Continental Sizing</h2>

<p>Europe skipped the fractions and simply uses the head circumference in cm as the size. A "60" hat fits a 60&nbsp;cm head. This is by far the least ambiguous system — and the reason so many premium Italian and French hatmakers (Borsalino, Maison Michel, Christys' London for EU markets) label in cm directly.</p>

<h2>Fitted Cap Sizing (New Era, 59FIFTY)</h2>

<p>Baseball fitted caps use US fractional sizing but with tighter production tolerances than felt hats. The typical New Era 59FIFTY size range is 6¾ to 8 (54–64&nbsp;cm). Above 8, you're into specialist territory — <a href="https://www.mammothheadwear.com/" target="_blank" rel="noopener" style="color:#A07A2A;">Mammoth Headwear</a>, <a href="https://bighatstore.com/" target="_blank" rel="noopener" style="color:#A07A2A;">Big Hat Store</a>, and a small number of Etsy makers cover 8⅛ (65&nbsp;cm) and up.</p>

<p>A fitted cap runs about 3–5&nbsp;mm tighter than a felt hat at the same labelled size, because the polyester/wool shell has less give than a stretched-and-blocked felt crown. If you're between sizes on a fitted cap, size up.</p>

<h2 id="between-sizes">What to Do When You're Between Sizes</h2>

<ul>
<li><strong>Size up, then pad.</strong> A self-adhesive hat sizing strip (also called "hat size reducer" — costs about $3) takes 60 seconds to install and reduces internal circumference by 3–6&nbsp;mm. That's the width of a full half-size.</li>
<li><strong>Never stretch more than 3–4&nbsp;mm.</strong> Steaming a felt hat can gain about a quarter-inch. Beyond that the crown deforms permanently and the sweatband tears.</li>
<li><strong>Watch for the "red ring" test.</strong> If you wear the hat for 20 minutes and it leaves a visible mark across your forehead, it's undersized by at least a half-size — return it, don't stretch it.</li>
</ul>

<h2>Head Shape Matters (Not Just Size)</h2>

<p>Two people with identical 60&nbsp;cm circumferences can wear the same labelled size and get completely different fits. Circumference sets the size; <strong>shape</strong> decides the comfort.</p>

<ul>
<li><strong>Oval (long front-to-back).</strong> The default Western pattern — most brands are cut for it.</li>
<li><strong>Round (nearly circular from above).</strong> Common in East Asian and some Central-European populations. A standard oval hat pinches at the temples and gaps at the front and back. Stetson, Bailey and Christys' London label round-fit and long-oval variants explicitly.</li>
</ul>

<p>If your hats always pinch at the sides even in the correct size, your head is <em>round</em>, not big. That's a shape problem, not a sizing problem — and no chart will fix it.</p>

<h2>The Bigger Picture: This Is Not a Rare Problem</h2>

<p>The eyewear industry designs as if large heads were an edge case. The anthropometry says otherwise. In ANSUR II, <strong>36.8% of men measure 58&nbsp;cm or more</strong> — a US 7¼ hat — and 93% of them have a temple width above 148&nbsp;mm, past the point where most frame ranges stop. Above 60&nbsp;cm (US 7½) it is 6.4% of men, and there the figure is 99%. Among women, 30.6% measure 57&nbsp;cm or more.</p>

<p>So it is not that a handful of unusually large people struggle to buy glasses. It is that roughly a third of adult men are being fitted from a size range that was never cut for them, and have quietly decided the marks behind their ears are normal. Hat retail solved this decades ago — that is why XL and XXL exist on the shelf, and why the specialist shops linked above have a business. Eyewear never did.</p>

<p>That is the gap Woolet was built to fill: frames engineered from the front width outward, starting at 158&nbsp;mm and going up to 162&nbsp;mm bespoke — for exactly the crowd that shops for hats in XL and XXL.</p>

<div style="background:#F8F6F1;border-left:3px solid #c9a84c;padding:18px 22px;margin:24px 0;border-radius:4px;">
  <div style="font-family:'Barlow',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#888;margin-bottom:10px;">For the same crowd</div>
  <p style="margin:0 0 8px 0;font-size:15px;line-height:1.65;color:#1a1a1a;">If your hat size is 7¼ or larger, mainstream frames are pinching your temples whether or not you have noticed. Woolet 007 and 009 ship at 158&nbsp;mm front width, in Italian Mazzucchelli acetate, hand made in EU.</p>
  <p style="margin:0;font-size:14px;line-height:1.65;"><a href="/en/collections/glasses-for-big-heads" style="color:#A07A2A;">Glasses for big heads →</a> · <a href="/en/bespoke" style="color:#A07A2A;">Bespoke up to 162 mm →</a></p>
</div>

<h2>Hat Size and Glasses Size: Common Questions</h2>

<h3>What size glasses do I need for a 7⅝ hat?</h3>
<p>A US 7⅝ hat is a 61&nbsp;cm head, which puts your temple width around 161&nbsp;mm. You need a frame with a front width of roughly 158–162&nbsp;mm. Standard frames run 140–148&nbsp;mm, so nothing off the shelf will sit straight on you.</p>

<h3>Does a big head always mean a wide face?</h3>
<p>Not always, but usually. Head circumference and head breadth correlate at r = 0.55 in ANSUR II — strong, not absolute. A long-oval head can carry a 60&nbsp;cm circumference with a narrower-than-median breadth. That is the 4–5&nbsp;mm of uncertainty the table above cannot remove; a photo measurement can.</p>

<h3>Is temple width the same as face width?</h3>
<p>No. Face width is usually quoted as cheekbone-to-cheekbone (bizygomatic breadth), which runs about 12–14&nbsp;mm narrower than temple width. Frames sit on the temples, not the cheekbones, so temple width is the number that decides fit.</p>

<h3>My hat is 7½ but my glasses feel fine. Am I wrong?</h3>
<p>Check for the marks, not the feeling. Pressure that builds over hours reads as normal because it is constant. If you have indentations in front of your ears after a working day, or the arms have visibly splayed outward over time, the frame is too narrow regardless of how it felt in the shop.</p>

<h3>Where do these numbers come from?</h3>
<p>ANSUR II, the 2012 U.S. Army anthropometric survey — 4,082 men and 1,986 women, each measured for both head circumference and head breadth by trained anthropometrists. It is the largest public dataset with both measurements on the same subject. The sample is military and therefore younger and fitter than the general population; head dimensions are less affected by this than body dimensions, but treat the medians as close estimates rather than exact population values.</p>

<h2>Quick Reference: Common Conversions</h2>

<ul>
<li><strong>7 hat size in cm</strong> — 56 cm (22 in)</li>
<li><strong>7¼ hat size in cm</strong> — 58 cm (22¾ in)</li>
<li><strong>7½ hat size in cm</strong> — 60 cm (23⅝ in)</li>
<li><strong>7 5/8 hat size in cm</strong> — 61 cm (24 in)</li>
<li><strong>7¾ hat size in cm</strong> — 62 cm (24⅜ in)</li>
<li><strong>7⅞ hat size in cm</strong> — 63 cm (24¾ in)</li>
<li><strong>Size 8 hat in cm</strong> — 64 cm (25¼ in)</li>
</ul>

<p style="border-top:1px solid #E8E4DC;margin-top:32px;padding-top:20px;">
Related guides:
<a href="#your-hat-size-predicts-your-glasses-size" style="color:#A07A2A;">hat size to glasses size conversion</a> ·
<a href="/en/blog/how-to-measure-your-head-for-a-hat" style="color:#A07A2A;">how to measure your head for a hat</a> ·
<a href="/en/blog/best-glasses-for-big-heads-2026" style="color:#A07A2A;">best glasses for big heads</a> ·
<a href="/en/blog/what-size-glasses-for-a-large-head" style="color:#A07A2A;">what size glasses for a large head</a> ·
<a href="/en/fit/wizard" style="color:#A07A2A;">AI Fit Wizard</a>.
</p>
`,
  },
  {
    slug: "what-size-hat-do-i-wear-big-heads-guide",
    title: "Big Head? Here's What Hat Size You Actually Wear (7¾ and Up)",
    excerpt: "A no-guessing guide to hat sizing for bigger heads. What 7¾, 7⅞, and 8 actually mean in cm and inches, how head size tracks with height, and where to buy when mainstream brands stop stocking.",
    date: "2026-03-21",
    readTime: 7,
    tags: ["Big Heads", "Sizing", "Buying Guide", "XXL"],
    faq: [
      {
        q: "What size hat do I wear if my head is 62 cm?",
        a: "A 62 cm head is US 7¾, UK 7⅝, EU 62 — labelled XL by most brands. It's above the top of standard cap ranges and requires a brand that explicitly stocks XL or XXL.",
      },
      {
        q: "What hat size does a 6'7 person wear?",
        a: "Head circumference doesn't scale linearly with height, but the median 6'7 (201 cm) adult male measures 60–62 cm around the head — US 7½ to 7¾. Roughly one in three people at that height measures above 62 cm and needs an XXL. Height is a hint, not a substitute for measuring.",
      },
      {
        q: "What is the biggest hat size you can buy?",
        a: "Mainstream brands cap at 62 cm (US 7¾). Specialist brands — Mammoth Headwear, Big Hat Store, Noggin Boss — go up to 66 cm (US 8¼) off-the-shelf, and a handful of custom hatters (Optimo, Bencraft) will block a felt hat up to about 68 cm (8⅜) on order.",
      },
      {
        q: "Is my head big or is my hair just thick?",
        a: "Wet or press your hair flat before measuring. Thick or curly hair can add 1–2 cm to a circumference reading — enough to push you into the next size and buy a hat that's genuinely too loose once the hair settles. Measure at the skull, not at the volume.",
      },
      {
        q: "Why do XL hats cost more?",
        a: "XL and XXL sizes are made in small production runs on the same felt blocks and moulds as standard sizes but with more material per unit. Some brands charge a 10–20% surcharge; others (mostly specialist DTC) price them the same as standard and eat the margin.",
      },
    ],
    content: `
<div style="display:flex;align-items:center;gap:14px;padding:16px 0;border-top:1px solid #E8E4DC;border-bottom:1px solid #E8E4DC;margin-bottom:28px;font-family:'Barlow',sans-serif;">
  <div style="flex-shrink:0;width:44px;height:44px;border-radius:50%;background:#0f0f0f;color:#c9a84c;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;letter-spacing:0.5px;">MC</div>
  <div style="flex:1;min-width:0;">
    <div style="font-size:14px;font-weight:600;color:#1a1a1a;line-height:1.3;">Marek Cieśla</div>
    <div style="font-size:12px;color:#666;line-height:1.5;margin-top:2px;">Founder, Woolet Eyewear · Serial entrepreneur · <a href="https://www.linkedin.com/in/marekciesla/" target="_blank" rel="noopener" style="color:#c9a84c;text-decoration:none;">LinkedIn</a></div>
    <div style="font-size:11px;color:#999;letter-spacing:1.5px;text-transform:uppercase;margin-top:6px;">Last updated: March 2026</div>
  </div>
</div>

<p>If every "one size fits most" cap slides straight back to the crown of your skull, and every fitted-cap chart tops out one size below yours, this is the guide. No fluff, no chart you have to hunt down — just the numbers, the brands, and the honest answer to "what size hat do I wear?" when your head is on the bigger end of the bell curve.</p>

<div style="background:#F8F6F1;border-left:3px solid #c9a84c;padding:18px 22px;margin:24px 0;border-radius:4px;">
  <div style="font-family:'Barlow',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#888;margin-bottom:10px;">The short version</div>
  <p style="margin:0;font-size:15px;line-height:1.65;color:#1a1a1a;">If your head measures <strong>60&nbsp;cm or more</strong>, you wear a US 7½ or larger — and mainstream brands stop stocking your size right there. Above 62&nbsp;cm (7¾), you're in specialist territory: 4–5 brands worldwide will actually fit you off-the-shelf.</p>
</div>

<h2>The Big-Head Sizing Ladder</h2>

<p>Every number below is a real head circumference matched to the size you'll see on the label. No conversions to memorize.</p>

<div style="overflow-x:auto;margin:24px 0;">
<table style="width:100%;border-collapse:collapse;font-family:'Barlow',sans-serif;font-size:14px;min-width:560px;">
  <thead>
    <tr style="background:#F8F6F1;">
      <th style="text-align:left;padding:12px 14px;border-bottom:2px solid #0f0f0f;font-weight:600;">Your head</th>
      <th style="text-align:left;padding:12px 14px;border-bottom:2px solid #0f0f0f;font-weight:600;">US size</th>
      <th style="text-align:left;padding:12px 14px;border-bottom:2px solid #0f0f0f;font-weight:600;">Letter</th>
      <th style="text-align:left;padding:12px 14px;border-bottom:2px solid #0f0f0f;font-weight:600;">Where you can buy</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">60&nbsp;cm (23⅝ in)</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">7½</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">L / XL</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;">Top of mainstream range — most brands</td></tr>
    <tr style="background:#FBF7ED;"><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">61&nbsp;cm (24 in)</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">7⅝</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">XL</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">New Era, some Stetson — specialist for felt</td></tr>
    <tr style="background:#FBF7ED;"><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">62&nbsp;cm (24⅜ in)</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">7¾</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">XL</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">Mammoth, Big Hat Store, Bailey, some Stetson</td></tr>
    <tr style="background:#FBF7ED;"><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">63&nbsp;cm (24¾ in)</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">7⅞</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">XXL</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">Mammoth, Noggin Boss, Big Hat Store</td></tr>
    <tr style="background:#FBF7ED;"><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">64&nbsp;cm (25¼ in)</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">8</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">XXL</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">Specialist only — 3–4 brands worldwide</td></tr>
    <tr style="background:#FBF7ED;"><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">65&nbsp;cm+ (25⅝ in+)</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">8⅛+</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">XXXL</td><td style="padding:10px 14px;border-bottom:1px solid #E8E4DC;font-weight:600;">Custom / made-to-order only</td></tr>
  </tbody>
</table>
</div>

<p>Not sure what your circumference is yet? <a href="/en/blog/how-to-measure-your-head-for-a-hat" style="color:#c9a84c;">Measure your head in 60 seconds</a> — a piece of string is enough. Or see the <a href="/en/blog/hat-size-chart-guide-cm-inches-us-uk-eu" style="color:#c9a84c;">full US/UK/EU hat size chart</a>.</p>

<h2>Does Height Predict Hat Size? (Sort Of)</h2>

<p>Head circumference correlates with height, but weakly. The rule most tailors use is: for every 10&nbsp;cm above 180&nbsp;cm (5'11"), add about 0.5&nbsp;cm of circumference. It gets you a plausible starting size — never the final answer.</p>

<ul>
<li><strong>6'0" (183&nbsp;cm)</strong> — median 58 cm (US 7¼). Range: 56–60 cm.</li>
<li><strong>6'3" (191&nbsp;cm)</strong> — median 59 cm (US 7⅜). Range: 57–61 cm.</li>
<li><strong>6'5" (196&nbsp;cm)</strong> — median 60 cm (US 7½). Range: 58–62 cm.</li>
<li><strong>6'7" (201&nbsp;cm)</strong> — median 60–62 cm (US 7½–7¾). Roughly 1 in 3 above 62 cm.</li>
<li><strong>6'9" (206&nbsp;cm)+</strong> — median 62 cm (US 7¾). Roughly half above 62 cm.</li>
</ul>

<p>Note the overlap: at every height, roughly 20% of people measure well above the median. Height narrows the guess; only a tape (or a phone camera) confirms it.</p>

<h2>Where to Actually Buy (7¾ and Up)</h2>

<p>Off-the-shelf, four brands do the bulk of the work above US 7¾. This is the honest map — no affiliate padding.</p>

<ul>
<li><strong><a href="https://www.mammothheadwear.com/" target="_blank" rel="noopener" style="color:#A07A2A;">Mammoth Headwear</a>.</strong> The reference brand for XL and XXL fitted caps and bucket hats. Size range up to XXXL (65 cm+). Solid quality, no surcharge on bigger sizes.</li>
<li><strong><a href="https://bighatstore.com/" target="_blank" rel="noopener" style="color:#A07A2A;">Big Hat Store</a>.</strong> Broader style range than Mammoth — including western, fedora, and dress hats up to 66 cm. Slightly less consistent shell quality but the widest selection above 63 cm.</li>
<li><strong>Noggin Boss.</strong> Novelty/oversized specialists; also stock genuinely wearable caps up to size 8. Better for statement pieces than everyday wear.</li>
<li><strong>Bailey / Stetson (select styles).</strong> Not every model is stocked in XL, but the ones that are (Cattleman, Renegade, some Stratoliners) run true to size and are among the best-made hats at any size.</li>
</ul>

<p>For made-to-order felt hats above 65 cm, look at Optimo (Chicago) and Bencraft (London). Expect a 6–12 week wait and a starting price around $400.</p>

<h2>Fitted Caps vs Felt Hats: The 5 mm Gap</h2>

<p>A fitted baseball cap in the same labelled size as a felt hat will feel about 3–5&nbsp;mm tighter — the poly/wool shell has less give than a stretched-and-blocked felt crown. If you land at 61.5&nbsp;cm on the tape, size up on the cap (7¾) and stay at 7⅝ on the felt.</p>

<p>Straw hats fall in between: more give than a fitted cap, less than felt.</p>

<h2>The Hair Question</h2>

<p>If you have thick, coarse, or curly hair, measure at the skull — not at the volume. Wet or press the hair down first. A dry curly measurement can add 1–2&nbsp;cm and put you in a size that fits when your hair is fresh out of the shower but feels loose by the end of the day.</p>

<p>If your hair volume fluctuates significantly (post-haircut vs a month out), measure at both extremes and buy at the <em>smaller</em> reading — a hat that's a hair too tight on haircut day is padded with a sizing strip; a hat that's a full size loose on the same day is falling off.</p>

<div style="background:#0f0f0f;color:#f0ece4;padding:26px 28px;margin:28px 0;border-radius:6px;font-family:'Barlow',sans-serif;">
  <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;margin-bottom:16px;font-weight:500;">Measure with your phone</div>
  <p style="font-size:14px;line-height:1.7;color:#f0ece4;margin:0 0 14px 0;">Woolet's <strong style="color:#fff;">AI Fit Wizard</strong> uses a single photo and a credit card as a reference to measure your face width to about ±2&nbsp;mm. Face width and head circumference track together closely, so the Wizard gives you a strong estimate of both without any tape.</p>
  <p style="font-size:14px;line-height:1.7;color:#f0ece4;margin:0;"><a href="/en/fit/wizard" style="color:#c9a84c;text-decoration:underline;font-weight:500;">Try the AI Fit Wizard →</a></p>
</div>

<h2>The Other Thing Big-Head Guys Should Know</h2>

<p>If your hat size is 7½ or higher, there's roughly an 80% chance the frames you tried in the last optician's shop pinched your temples. Head circumference and face width aren't the same measurement, but they track together — and the same industry that stops at 60&nbsp;cm on hats stops at about 145&nbsp;mm on eyewear.</p>

<p>That's the gap Woolet was built for: frames starting at 158&nbsp;mm front width in Italian Mazzucchelli acetate, with bespoke sizing up to 172&nbsp;mm. Same crowd, adjacent problem.</p>

<div style="background:#F8F6F1;border-left:3px solid #c9a84c;padding:18px 22px;margin:24px 0;border-radius:4px;">
  <div style="font-family:'Barlow',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#888;margin-bottom:10px;">Sized out of eyewear too?</div>
  <p style="margin:0 0 8px 0;font-size:15px;line-height:1.65;color:#1a1a1a;">Woolet 007 and 009 ship at 158&nbsp;mm — designed for exactly the group that shops for hats in XL and XXL.</p>
  <p style="margin:0;font-size:14px;line-height:1.65;"><a href="/en/collections/glasses-for-big-heads" style="color:#A07A2A;">Glasses for big heads →</a> · <a href="/en/bespoke" style="color:#A07A2A;">Bespoke up to 172&nbsp;mm →</a></p>
</div>

<h2>Quick Answers</h2>

<p><strong>What size hat is 7⅝?</strong> 61&nbsp;cm circumference. XL. Above one-size-fits-most caps.</p>
<p><strong>What size hat is 7¾?</strong> 62&nbsp;cm. XL. Requires specialist brand for felt; some mainstream fitted caps stock it.</p>
<p><strong>What size hat is 7⅞?</strong> 63&nbsp;cm. XXL. Specialist only.</p>
<p><strong>What size hat is 8?</strong> 64&nbsp;cm. XXL. Three or four brands worldwide off-the-shelf.</p>
<p><strong>Is 62&nbsp;cm a big head?</strong> Yes — top ~5% of adult males globally. You need XL or an explicit big-head brand.</p>

<p style="border-top:1px solid #E8E4DC;margin-top:32px;padding-top:20px;">
Related guides:
<a href="/en/blog/how-to-measure-your-head-for-a-hat" style="color:#A07A2A;">how to measure your head</a> ·
<a href="/en/blog/hat-size-chart-guide-cm-inches-us-uk-eu" style="color:#A07A2A;">hat size chart</a> ·
<a href="/en/blog/best-glasses-for-big-heads-2026" style="color:#A07A2A;">best glasses for big heads</a> ·
<a href="/en/fit/wizard" style="color:#A07A2A;">AI Fit Wizard</a>.
</p>
`,
  },
  {
    slug: "how-to-tell-if-your-face-is-wide-or-narrow",
    title: "How to Tell if Your Face Is Wide or Narrow (30-Second Test)",
    excerpt: "A precise, honest way to classify your face width in millimetres — and what to do next, whether you're narrow (<140 mm), average (140–154 mm), wide (155–161 mm), or extra-wide (162 mm+).",
    date: "2026-07-14",
    readTime: 8,
    tags: ["Guide", "Fit", "Bespoke"],
    faq: [
      { q: "What counts as a narrow face for glasses?", a: "Under about 138 mm temple-to-temple. Standard 'small' and 'petite' frames (125–135 mm total width) fit this range. Woolet does not — our smallest frame is 158 mm." },
      { q: "What counts as a wide face?", a: "155 mm or more temple-to-temple. This is where mainstream brands stop and where Woolet begins. Above 161 mm, off-the-shelf 158 mm frames still bow at the temples — that is bespoke territory (145–162 mm)." },
      { q: "How do I measure my face width at home?", a: "Hold a credit card (85.6 mm wide) horizontally under your eyes, take a straight-on selfie, and use the card as a ruler. Full method in our measurement guide." },
      { q: "What if my face is 155–161 mm?", a: "You're in Woolet's stock range. The 007 (round) and 009 (soft square) are both built at 158 mm front / 21–22 mm keyhole bridge for this bracket." },
      { q: "What if my face is above 162 mm?", a: "Off-the-shelf 158 mm will still pinch. Woolet Bespoke is cut to your exact face width and bridge (145–162 mm, 20–24 mm bridge)." },
    ],
    content: `
<p>Most fit advice online skips the one thing that actually decides whether a frame will pinch or float on your face: <strong>your face width in millimetres</strong>. Not your face <em>shape</em>. Not your head circumference. The temple-to-temple distance, measured across the widest part of your cheekbones.</p>

<p>This guide gives you a 30-second self-test, a clear four-band classification, and — honestly — tells you when Woolet is the answer and when it isn't.</p>

<div style="background:#F8F6F1;border-left:3px solid #c9a84c;padding:18px 22px;margin:24px 0;border-radius:4px;">
  <div style="font-family:'Barlow',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#888;margin-bottom:10px;">The one number that matters</div>
  <p style="margin:0;font-size:15px;line-height:1.65;color:#1a1a1a;">Face width = the horizontal distance between the two most outward points of your cheekbones, measured in millimetres. This is the number opticians <em>should</em> match to frame front width — but rarely publish.</p>
</div>

<h2>The 30-second test</h2>

<p>Hold a credit card (85.60 mm wide by ISO standard) horizontally under your eyes, take a straight-on selfie, and multiply the card-to-temple ratio by 85.6 — a face 1.8× wider than the card measures 154 mm. The <a href="/en/fit" style="color:#A07A2A;text-decoration:underline;">FitLens scanner</a> does the same arithmetic from one photo. For the full calibrated walkthrough, read <a href="/en/blog/how-to-measure-face-width-for-glasses" style="color:#A07A2A;text-decoration:underline;">how to measure your face width</a>.</p>

<h2>The four bands</h2>

<p>Anthropometric data (<a href="https://apps.dtic.mil/sti/tr/pdf/ADA611869.pdf" target="_blank" rel="noopener" style="color:#A07A2A;text-decoration:underline;">ANSUR II, US Army, 2012</a>; <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4496583/" target="_blank" rel="noopener" style="color:#A07A2A;text-decoration:underline;">Gordon et al., PMC4496583</a>) shows adult male face widths cluster around <strong>142 mm ±5 mm</strong>. Here is how that maps to what you can actually buy.</p>

<div style="overflow-x:auto;margin:24px 0;">
<table style="width:100%;border-collapse:collapse;font-family:'Barlow',sans-serif;font-size:14px;">
  <thead>
    <tr style="background:#0f0f0f;color:#f0ece4;">
      <th style="padding:12px 14px;text-align:left;font-weight:500;letter-spacing:1px;text-transform:uppercase;font-size:11px;">Band</th>
      <th style="padding:12px 14px;text-align:left;font-weight:500;letter-spacing:1px;text-transform:uppercase;font-size:11px;">Face width</th>
      <th style="padding:12px 14px;text-align:left;font-weight:500;letter-spacing:1px;text-transform:uppercase;font-size:11px;">What fits</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #E8E4DC;"><td style="padding:14px;font-weight:600;">Narrow</td><td style="padding:14px;">Under 138 mm</td><td style="padding:14px;">Petite / small frames (125–135 mm). Warby Parker Narrow, Zenni Petite, Eyebobs Small.</td></tr>
    <tr style="border-bottom:1px solid #E8E4DC;background:#FAF7F0;"><td style="padding:14px;font-weight:600;">Average</td><td style="padding:14px;">138–154 mm</td><td style="padding:14px;">Standard mainstream frames (135–150 mm). Ray-Ban, Persol, Tom Ford, most Warby Parker.</td></tr>
    <tr style="border-bottom:1px solid #E8E4DC;background:#F5EFDD;"><td style="padding:14px;font-weight:600;">Wide</td><td style="padding:14px;">155–161 mm</td><td style="padding:14px;"><strong>Woolet 007 or 009 (158 mm stock).</strong> Almost nothing else at premium tier.</td></tr>
    <tr style="background:#EFE5C2;"><td style="padding:14px;font-weight:600;">Extra-wide</td><td style="padding:14px;">162 mm and above</td><td style="padding:14px;"><strong>Woolet Bespoke (145–162 mm).</strong> Off-the-shelf 158 mm will still pinch.</td></tr>
  </tbody>
</table>
</div>

<h2>What to do next — by band</h2>

<h3 style="margin-top:28px;">If you're narrow (&lt;138 mm)</h3>

<p>Honest answer: <strong>Woolet is not for you.</strong> Our smallest frame is 158 mm — it would slide down your nose and sit past your temples. Look at Warby Parker Narrow, Zenni Petite, Eyebobs Small, or Moscot's smaller sizes. Save yourself the return shipping.</p>

<h3 style="margin-top:28px;">If you're average (138–154 mm)</h3>

<p>You have the widest choice of any group — every mainstream brand builds for you. If your face is at the top of this band (150–154 mm) and you feel most frames still pinch slightly, look at Ray-Ban's Large series, Moscot Lemtosh XL, or Persol's wider models. Woolet's 158 mm will feel one size too big.</p>

<h3 style="margin-top:28px;">If you're wide (155–161 mm)</h3>

<p>This is the core Woolet range. Standard frames stop right before your face begins. <a href="/en/products/007" style="color:#A07A2A;text-decoration:underline;">Woolet 007</a> (round / panto) and <a href="/en/products/009" style="color:#A07A2A;text-decoration:underline;">Woolet 009</a> (soft square) are both built at 158 mm front width with a 21–22 mm keyhole bridge — engineered for exactly this bracket.</p>

<h3 style="margin-top:28px;">If you're extra-wide (162 mm+)</h3>

<p>Even our stock 158 mm will bow at the temples. This is <a href="/en/bespoke" style="color:#A07A2A;text-decoration:underline;">Woolet Bespoke</a> territory — every frame is cut to your exact face width (up to 162 mm) and bridge (20–24 mm), same Italian Mazzucchelli acetate, hand made in EU. It's the only path that actually fits above 162 mm.</p>

<div style="background:#0f0f0f;color:#f0ece4;padding:26px 28px;margin:32px 0;border-radius:6px;font-family:'Barlow',sans-serif;">
  <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;margin-bottom:14px;font-weight:500;">Not sure which band you're in?</div>
  <p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;">Run the <a href="/en/fit" style="color:#c9a84c;text-decoration:underline;">AI Fit Wizard</a> — one selfie, a credit card as reference, face width in millimetres, plus a shape recommendation. Free, no email required to see the number.</p>
  <a href="/en/fit" style="display:inline-block;background:#c9a84c;color:#0f0f0f;padding:12px 22px;text-decoration:none;font-weight:600;font-size:13px;letter-spacing:1px;text-transform:uppercase;border-radius:2px;">Measure my face</a>
</div>

<h2>Why "face shape" advice usually misses this</h2>

<p>Nearly every "best glasses for X face shape" article treats a 138 mm oval face the same as a 165 mm oval face. Shape helps you choose between round and square once a frame <em>fits</em>. Width decides whether it fits at all. If the front is 10 mm narrower than your face, the shape doesn't matter — it will pinch.</p>

<p>That's the single reason we publish frame width in mm on every product page, and why our first question is never "what shape do you like" but "how wide is your face."</p>

<h2>Common questions</h2>

<p><strong>My head is large — does that mean my face is wide?</strong> Not automatically. Head circumference (measured around the skull) and face width (measured across the cheekbones) correlate loosely but not tightly. A 60 cm head can sit on a 148 mm face. Measure the face, not the head.</p>

<p><strong>Does face width change with age?</strong> Marginally. Adult face width is set by bone structure; soft-tissue changes shift it by 1–2 mm at most.</p>

<p><strong>What about women?</strong> Same method, same bands. Women's face widths cluster ~8 mm narrower on average (Gordon et al.), so the "wide" bracket is rarer — but real. Woolet's stock 158 mm suits a 155–161 mm face regardless of gender.</p>

<p style="border-top:1px solid #E8E4DC;margin-top:32px;padding-top:20px;">
Related guides:
<a href="/en/blog/how-to-measure-face-width-for-glasses" style="color:#A07A2A;">how to measure face width</a> ·
<a href="/en/blog/glasses-for-wide-faces-guide" style="color:#A07A2A;">wide-face fit guide</a> ·
<a href="/en/blog/bespoke-eyewear-size-range-150-172mm-guide" style="color:#A07A2A;">bespoke size range 145–162 mm</a> ·
<a href="/en/fit" style="color:#A07A2A;">AI Fit Wizard</a>.
</p>
`,
  },
  {
    slug: "acetate-vs-tr90-glasses",
    title: "Acetate vs TR90 vs Plastic Glasses: Which Fits a Wide Face?",
    excerpt: "Acetate vs TR90 and acetate vs ordinary injection-moulded plastic, compared on weight, adjustability, colour and repair — and what each means on a 155 mm+ face.",
    date: "2026-07-21",
    readTime: 9,
    tags: ["Materials", "Fit", "Acetate"],
    faq: [
      { q: "Can TR90 frames be adjusted like acetate?", a: "No. TR90 is a thermoplastic engineered to snap back to its molded shape. An optician cannot heat-reshape the front or bend the temples inward the way they can with Italian acetate. What you buy is what you wear." },
      { q: "Is TR90 stronger than acetate?", a: "TR90 is more flex-tolerant — it survives being sat on. Italian Mazzucchelli acetate is more rigid but far more repairable: dings can be polished out, temples reshaped, nose pads re-set. Different definitions of 'strong.'" },
      { q: "Why does adjustability matter more for a wide face?", a: "Because there is no true off-the-shelf 158 mm+ market. Even the right frame will need a 1–3 mm tweak at the temples or bridge to sit level. Acetate allows that tweak; TR90 does not." },
      { q: "Which is better for sports or kids?", a: "TR90 wins — light, flexible, cheap to replace. For everyday wear on a 155 mm+ face where fit and longevity matter, acetate is the honest answer." },
      { q: "Is TR90 a cheap material?", a: "It is inexpensive to mould at scale, which is why it dominates sub-$100 frames. That is not a knock on the plastic itself — it just explains why no premium atelier uses it." },
      { q: "What is the difference between acetate glasses and plastic glasses?", a: "Acetate is a cellulose-based plastic cut from solid sheet and hand finished; frames sold as plastic are injection-moulded from polymer in seconds. Acetate has colour running through the material, can be reheated and reshaped by an optician, and can be polished after a scratch. Moulded plastic can do none of those things." },
    ],
    content: `
<p>Walk into any optical store and you will meet two materials: shiny, warm-to-the-touch <strong>Italian acetate</strong>, and matte, feather-light <strong>TR90</strong>. Both are plastics. Both promise "premium." Only one is actually built for a wide face.</p>

<p>This is not a marketing piece — TR90 has real strengths and we will name them. But if your face is 155 mm+ and you want a frame that fits <em>you</em>, not the mould it came out of, the answer is not close.</p>

<div style="background:#F8F6F1;border-left:3px solid #c9a84c;padding:18px 22px;margin:24px 0;border-radius:4px;">
  <div style="font-family:'Barlow',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#888;margin-bottom:10px;">The single deciding factor</div>
  <p style="margin:0;font-size:15px;line-height:1.65;color:#1a1a1a;">Italian Mazzucchelli acetate can be reheated and reshaped at the bench — front curvature, temple splay, bridge angle. TR90 cannot. It is engineered to snap back to its factory shape. On a 155 mm+ face, that difference decides whether the frame sits level or forever tilts.</p>
</div>

<h2>What each material actually is</h2>

<p><strong>Italian acetate</strong> — cellulose acetate is a plant-based plastic made from cotton and wood pulp. The Italian standard is <a href="https://www.mazzucchelli1849.it/en/" target="_blank" rel="noopener" style="color:#A07A2A;text-decoration:underline;">Mazzucchelli 1849</a>, which supplies the vast majority of premium eyewear ateliers in Cadore and Belluno. It arrives as a solid block. Every frame is milled, tumbled, polished and hand-finished — a 5–7 week process.</p>

<p><strong>TR90</strong> — a nylon-based thermoplastic (polyamide) developed by Swiss chemists in the 1980s, originally for ski boots and safety eyewear. It is <em>injection-moulded</em>: molten plastic is shot into a metal cavity, cooled in seconds, ejected. No hand-finishing. A frame that takes 5 weeks in acetate takes 90 seconds in TR90.</p>

<h2>Acetate vs injection-moulded plastic</h2>

<p>Before comparing acetate with TR90 specifically, it is worth separating the two categories properly, because "acetate glasses vs plastic" is the comparison most people are actually making. Acetate is a plastic — a cellulose-based one — so the meaningful distinction is not chemistry but process. Acetate frames are cut from solid sheet or block and finished by hand. Everything sold generically as "plastic" is injection-moulded: molten polymer forced into a metal cavity, cooled, ejected, done.</p>

<p>That process difference produces four practical consequences. <strong>Density and feel:</strong> a milled acetate front has consistent density throughout, which is why it feels warm and solid; moulded plastic cools from the outside in and carries internal stress lines, which is why it feels hollow and can whiten at flex points. <strong>Adjustability:</strong> acetate softens predictably at around 80 °C and holds a new shape; moulded polymers are engineered with shape memory and return to the mould geometry. <strong>Colour:</strong> acetate colour runs through the material, so a scratch polishes out; moulded frames are usually surface-coated or dyed, so a scratch is permanent. <strong>Repair:</strong> an optician can re-cut, re-polish and re-set acetate. Almost nothing on an injection-moulded frame is serviceable.</p>

<p>For a 155 mm+ face, the adjustability point outweighs everything else. A wide front is a long lever, and getting it to sit level almost always requires a one-to-three-millimetre correction at the temple or bridge after the first week of wear. Acetate accepts that correction. Injection-moulded plastic, TR90 included, does not — it will hold whatever geometry the mould gave it for the life of the frame.</p>

<p>None of this makes moulded plastic a bad material. It makes it a material chosen for cost and volume rather than for fit, which is a reasonable trade at $40 and a poor one at 158 mm.</p>

<h2>The side-by-side</h2>

<div style="overflow-x:auto;margin:24px 0;">
<table style="width:100%;border-collapse:collapse;font-family:'Barlow',sans-serif;font-size:14px;">
  <thead>
    <tr style="background:#0f0f0f;color:#f0ece4;">
      <th style="padding:12px 14px;text-align:left;font-weight:500;letter-spacing:1px;text-transform:uppercase;font-size:11px;">Property</th>
      <th style="padding:12px 14px;text-align:left;font-weight:500;letter-spacing:1px;text-transform:uppercase;font-size:11px;">Italian Acetate</th>
      <th style="padding:12px 14px;text-align:left;font-weight:500;letter-spacing:1px;text-transform:uppercase;font-size:11px;">TR90</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #E8E4DC;"><td style="padding:14px;font-weight:600;">Post-purchase adjustability</td><td style="padding:14px;">Yes — heated to ~80 °C and reshaped by an optician. Repeatable.</td><td style="padding:14px;">No. Snaps back to moulded shape. What you buy is what you wear.</td></tr>
    <tr style="border-bottom:1px solid #E8E4DC;background:#FAF7F0;"><td style="padding:14px;font-weight:600;">Weight (158 mm frame)</td><td style="padding:14px;">28–34 g</td><td style="padding:14px;">18–22 g</td></tr>
    <tr style="border-bottom:1px solid #E8E4DC;"><td style="padding:14px;font-weight:600;">Flex tolerance</td><td style="padding:14px;">Rigid. Can crack under sharp impact.</td><td style="padding:14px;">High. Survives being sat on.</td></tr>
    <tr style="border-bottom:1px solid #E8E4DC;background:#FAF7F0;"><td style="padding:14px;font-weight:600;">Colour depth</td><td style="padding:14px;">Colour runs through the block — layered, translucent, three-dimensional.</td><td style="padding:14px;">Surface pigment. Flat matte finish. Scratches show base plastic.</td></tr>
    <tr style="border-bottom:1px solid #E8E4DC;"><td style="padding:14px;font-weight:600;">Repairability</td><td style="padding:14px;">Dings polished out, temples re-set, nose pads adjusted for life.</td><td style="padding:14px;">Effectively single-use. Damage means replacement.</td></tr>
    <tr style="border-bottom:1px solid #E8E4DC;background:#FAF7F0;"><td style="padding:14px;font-weight:600;">Feel on the skin</td><td style="padding:14px;">Warms to body temperature. Substantial.</td><td style="padding:14px;">Stays cool. Almost weightless — some wearers forget the frame is on.</td></tr>
    <tr style="border-bottom:1px solid #E8E4DC;"><td style="padding:14px;font-weight:600;">Available at 158 mm+</td><td style="padding:14px;">Yes — a handful of ateliers, including Woolet.</td><td style="padding:14px;">Rare. TR90 tooling is a fixed mould; wide-fit runs almost never justify the cost.</td></tr>
    <tr style="background:#F5EFDD;"><td style="padding:14px;font-weight:600;">Typical price band</td><td style="padding:14px;">$180–$800 (handmade tier)</td><td style="padding:14px;">$30–$120 (mass-market tier)</td></tr>
  </tbody>
</table>
</div>

<h2>Why adjustability is the whole game on a wide face</h2>

<p>If your face is under 145 mm, the mainstream market has hundreds of moulds cut to your dimensions. A rigid TR90 frame will fit close enough that adjustability rarely matters.</p>

<p>Above 155 mm, the maths break. There is no dense cluster of moulds serving 158, 160, 162, 165 mm faces — the industry treats you as a rounding error. Even when you find a frame at your width, one temple is inevitably 2 mm too tight, or the bridge sits 1 mm too high, or the front tilts because your left cheekbone is 3 mm higher than your right (most cheekbones are).</p>

<p>An optician with a hot-air heater and Italian acetate fixes all of that in under ten minutes. The same optician looking at TR90 will politely tell you they cannot do anything — the plastic is <em>memory-set</em>. Try to bend it and it snaps straight back within seconds. Try harder and it cracks.</p>

<div style="background:#0f0f0f;color:#f0ece4;padding:26px 28px;margin:32px 0;border-radius:6px;font-family:'Barlow',sans-serif;">
  <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;margin-bottom:14px;font-weight:500;">Our position, stated plainly</div>
  <p style="margin:0 0 12px 0;font-size:15px;line-height:1.65;">Woolet uses Mazzucchelli acetate for one reason above all others: a 158 mm frame on a 158 mm face still needs post-purchase fine-tuning. Acetate gives you (and your optician) that room. TR90 does not.</p>
  <p style="margin:0;font-size:14px;line-height:1.65;color:#c2bda9;">If you want the lightest possible frame for sport, TR90 is a real answer — just not from us.</p>
</div>

<h2>Where TR90 genuinely wins</h2>

<p>We are not going to pretend TR90 is inferior across the board. It is not.</p>

<ul>
  <li><strong>Sports and safety eyewear.</strong> Flex tolerance, low weight, no shatter risk. Acetate has no business on a mountain-bike descent.</li>
  <li><strong>Kids' frames.</strong> Children lose, sit on, and drop frames. TR90 survives; acetate does not.</li>
  <li><strong>Sub-$100 daily beaters.</strong> If a frame is going in and out of a backpack for a year, injection-moulded plastic is the honest, sustainable choice.</li>
  <li><strong>Very hot climates.</strong> Acetate softens above 60 °C (a car dashboard in Dubai). TR90 does not care.</li>
</ul>

<h2>Where acetate wins by design</h2>

<ul>
  <li><strong>Any face wider than 155 mm.</strong> Adjustability, repairability, and the fact that ateliers still cut it in this size range.</li>
  <li><strong>Progressive lenses.</strong> A perfectly level front matters — one degree of tilt in the front plane pushes the reading corridor off-axis. Acetate can be corrected; TR90 cannot.</li>
  <li><strong>Long-term ownership.</strong> A well-made acetate frame lasts 10–15 years with periodic hinge and nose-pad service. TR90 is closer to 2–4.</li>
  <li><strong>Aesthetic depth.</strong> Layered colour, warm hand-feel, real polish. This is subjective — but it is why every luxury house from Persol to Jacques Marie Mage uses acetate, not TR90.</li>
</ul>

<h2>Quick decision guide</h2>

<p><strong>Face under 145 mm, mostly desk and daily wear:</strong> either material is fine. Pick on style and budget.</p>
<p><strong>Face under 145 mm, active lifestyle:</strong> TR90 makes sense.</p>
<p><strong>Face 145–154 mm:</strong> acetate is worth the premium for the adjustment margin alone. TR90 will fit but never <em>settle</em>.</p>
<p><strong>Face 155 mm+:</strong> acetate is not really optional. This is the range where post-purchase adjustment is the difference between "wearable" and "unwearable" — and where the wide-fit market only exists in acetate anyway.</p>

<div style="background:#F8F6F1;border-left:3px solid #c9a84c;padding:18px 22px;margin:24px 0;border-radius:4px;">
  <div style="font-family:'Barlow',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#888;margin-bottom:10px;">Not sure which band you're in?</div>
  <p style="margin:0 0 8px 0;font-size:15px;line-height:1.65;color:#1a1a1a;">Run the <a href="/en/fit" style="color:#A07A2A;text-decoration:underline;">AI Fit Wizard</a> — one selfie, face width in millimetres, and a straight recommendation on which material bracket you're in.</p>
  <p style="margin:0;font-size:14px;line-height:1.65;"><a href="/en/products/007" style="color:#A07A2A;">Woolet 007 (Italian acetate, 158 mm) →</a> · <a href="/en/bespoke" style="color:#A07A2A;">Bespoke (145–162 mm) →</a></p>
</div>

<h2>The one myth worth killing</h2>

<p>"TR90 is unbreakable, acetate is fragile." This is repeated everywhere and it is not quite true. Acetate is <em>rigid</em>, which means it dents rather than flexes. But rigid also means <em>repairable</em>: the same rigidity that lets an optician reshape a temple lets them polish out a scratch or re-cut a hinge slot. TR90 is unbreakable in the way a garden hose is unbreakable — it survives everything except needing to change shape.</p>

<p>For a wide face, needing to change shape is not the exception. It is the entire point.</p>

<p style="border-top:1px solid #E8E4DC;margin-top:32px;padding-top:20px;">
Related guides:
<a href="/en/blog/what-is-italian-acetate-premium-eyewear" style="color:#A07A2A;">what is Italian acetate</a> ·
<a href="/en/blog/handmade-italian-acetate-eyewear-process" style="color:#A07A2A;">how handmade acetate frames are made</a> ·
<a href="/en/blog/glasses-for-wide-faces-guide" style="color:#A07A2A;">wide-face fit guide</a> ·
<a href="/en/fit" style="color:#A07A2A;">AI Fit Wizard</a>.
</p>
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
<p>Włochy są epicentrum branży okularowej od dekad — octan powstaje w fabryce Mazzucchelli pod Mediolanem, a region Cadore koło Belluno skupia produkcję opraw. Producenci jak <strong>Mazzucchelli</strong> tworzą arkusze o niezrównanej głębi kolorów i integralności strukturalnej.</p>

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

<figure><img src="/images/woolet-007-round-glasses-wide-face.png" alt="Woolet 007 okrągłe okulary na szeroką twarz — włoski octan Mazzucchelli, 158mm szerokości, mostek keyhole, oprawki premium na twarze 155mm+" loading="lazy" style="width:100%;border-radius:6px;margin:0.5rem 0 1rem" /><figcaption style="font-size:0.7rem;opacity:0.5;text-align:center">Woolet 007 — Okrągłe oprawki, 158mm, włoski octan</figcaption></figure>

<h2>Kwadratowe oprawki</h2>
<p>Kątowe oprawki dodają struktury. Idealne dla <strong>okrągłych</strong> szerokich twarzy, bo wprowadzają kontrast.</p>

<figure><img src="/images/woolet-009-square-glasses-wide-face.png" alt="Woolet 009 kwadratowe okulary na szeroką twarz — włoski octan Mazzucchelli, 158mm szerokości, oprawki premium typu wayfarer na twarze 155mm+" loading="lazy" style="width:100%;border-radius:6px;margin:0.5rem 0 1rem" /><figcaption style="font-size:0.7rem;opacity:0.5;text-align:center">Woolet 009 — Kwadratowe oprawki, 158mm, włoski octan</figcaption></figure>

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

<figure style="display:flex;gap:1rem;flex-wrap:wrap"><img src="/images/woolet-007-round-glasses-wide-face.png" alt="Woolet 007 profesjonalne okulary na szeroką twarz — włoski octan, 158mm, okulary do biura na twarze 155mm+" loading="lazy" style="width:48%;min-width:200px;border-radius:6px" /><img src="/images/woolet-009-square-glasses-wide-face.png" alt="Woolet 009 profesjonalne kwadratowe okulary na szeroką twarz — włoski octan, 158mm, biurowe oprawki 155mm+" loading="lazy" style="width:48%;min-width:200px;border-radius:6px" /></figure>
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

import { blogPostsENFit } from "./blog-data-en-fit";
import { blogPostsDE } from "./blog-data-de";
import { blogPostsNL } from "./blog-data-nl";
import { blogPostsFR } from "./blog-data-fr";

export const blogPosts: Partial<Record<Lang, BlogPost[]>> = {
  en: [...blogPostsEN, ...blogPostsENFit],
  pl: blogPostsPL,
  de: blogPostsDE,
  nl: blogPostsNL,
  fr: blogPostsFR,
};

export function getBlogPosts(lang: Lang): BlogPost[] {
  return blogPosts[lang] ?? [];
}

export function getBlogPost(lang: Lang, slug: string): BlogPost | undefined {
  return getBlogPosts(lang).find((p) => p.slug === slug);
}

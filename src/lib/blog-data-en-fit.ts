import type { BlogPost } from "./blog-data";

/**
 * EN blog — fit, sizing and frame-measurement cluster (July 2026).
 *
 * Four posts targeting the "my glasses hurt / what do the numbers mean"
 * query family, which the existing wide-face cluster never covered.
 * Each post follows the house rules: 40–60 word direct answer up top,
 * millimetre specificity, publish + last-updated dates, FAQPage schema
 * via `faq`, a FitLens CTA, and a Related-articles block of three.
 */

const BYLINE = (published: string, updated: string) => `
<div style="display:flex;align-items:center;gap:14px;padding:16px 0;border-top:1px solid #E8E4DC;border-bottom:1px solid #E8E4DC;margin-bottom:28px;font-family:'Barlow',sans-serif;">
  <div style="flex-shrink:0;width:44px;height:44px;border-radius:50%;background:#0f0f0f;color:#c9a84c;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:13px;letter-spacing:0.5px;">W</div>
  <div style="flex:1;min-width:0;">
    <div style="font-size:14px;font-weight:600;color:#1a1a1a;line-height:1.3;">Woolet Editorial Team</div>
    <div style="font-size:12px;color:#666;line-height:1.5;margin-top:2px;">Eyewear fit &amp; sizing · Woolet, wide-face eyewear since 2026</div>
    <div style="font-size:11px;color:#999;letter-spacing:1.5px;text-transform:uppercase;margin-top:6px;">Published: ${published} · Last updated: ${updated}</div>
  </div>
</div>`;

const ANSWER = (html: string) => `
<p style="font-size:18px;line-height:1.7;color:#1a1a1a;background:#F8F6F1;border-left:3px solid #c9a84c;padding:20px 24px;margin:0 0 28px;border-radius:4px;">${html}</p>`;

const FITLENS_CTA = (intro: string, anchor: string) => `
<div style="background:#0f0f0f;color:#f0ece4;padding:26px 28px;margin:32px 0;border-radius:6px;font-family:'Barlow',sans-serif;">
  <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;margin-bottom:14px;font-weight:500;">FitLens · 20 seconds, phone camera</div>
  <p style="margin:0 0 14px 0;font-size:15px;line-height:1.65;">${intro}</p>
  <a href="/en/fit" style="display:inline-block;background:#CAA449;color:#1F1B16;text-decoration:none;padding:12px 22px;border-radius:2px;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">${anchor}</a>
</div>`;

const TH = `padding:12px 14px;text-align:left;font-weight:500;letter-spacing:1px;text-transform:uppercase;font-size:11px;`;
const TD = `padding:13px 14px;vertical-align:top;`;

export const blogPostsENFit: BlogPost[] = [
  /* ─────────────────────────── POST 1 ─────────────────────────── */
  {
    slug: "glasses-too-tight-on-side-of-head",
    title: "Glasses Too Tight on the Side of Your Head? Here's the Real Fix",
    excerpt:
      "If your glasses press on your temples rather than behind your ears, the front is too narrow — and no adjustment fixes that. Here's how to diagnose the pressure point, what an optician can genuinely change, and what they can't.",
    date: "2026-07-29",
    readTime: 8,
    tags: ["Fit", "Wide Face", "Guide"],
    faq: [
      {
        q: "Why are my glasses suddenly too tight on the side of my head?",
        a: "Frames rarely tighten on their own — acetate relaxes with wear rather than shrinking. A sudden change usually means someone over-tightened the temples at a recent adjustment, the hinge screws were re-seated inward, or the frame was heated and reset narrower. Weight change and swelling can add 2–4 mm of head width, which is enough to turn a borderline frame into a painful one.",
      },
      {
        q: "Can an optician widen glasses that are too tight?",
        a: "An optician can splay the temple arms outward, bend the arm behind the ear, adjust nose pads and open the temple angle by a few degrees. What they cannot change is the front width — the distance across the frame from hinge to hinge is fixed by the acetate block or metal front. If a 148 mm front sits on a 158 mm face, adjustment relieves symptoms for a day or two at best.",
      },
      {
        q: "How do I know if my glasses are too small rather than badly adjusted?",
        a: "Look at where the pressure is. Pain in front of the ears, at the temples, means the front is too narrow. Pain behind the ears, on the mastoid bone, usually means the temple arms are bent too steeply or are too short — that is adjustable. Red indentations on both temples after four hours of wear is the clearest sign the frame itself is too small.",
      },
      {
        q: "Can glasses cause a pressure sore behind the ear?",
        a: "Yes. A temple arm with too tight a bend concentrates load on a few square millimetres of skin over bone, which reddens, then breaks down. Silicone ear cushions and a shallower bend fix most cases. If the sore returns within a week of every adjustment, the arm is being asked to hold a frame the front cannot hold on its own.",
      },
      {
        q: "Do glasses stretch out over time?",
        a: "Acetate relaxes slightly with body heat — perhaps 1–2 mm of effective width over months, and only at the temples, not across the front. It is not a plan. Buying a frame that is 10 mm too narrow and waiting for it to give will produce months of headaches and a frame that eventually cracks at the hinge.",
      },
      {
        q: "Can tight glasses cause headaches?",
        a: "Pressure over the temporal region is a well-known trigger for compression headaches — a dull ache above and in front of the ear that builds over a few hours and eases within minutes of removing the frame. If your headache follows that timing, the frame width is the first thing to check, before your prescription.",
      },
    ],
    content: `${BYLINE("29 July 2026", "29 July 2026")}
${ANSWER(
      `<strong>If the pressure is at your temples rather than behind your ears, the front of the frame is too narrow.</strong> That is a dimension, not an adjustment. An optician can splay the arms, soften the bend and add cushions, but nobody can widen a frame front. Measure temple-to-temple, compare it with the frame's front width, and buy to that number.`,
    )}

<p>Almost everyone who searches for this has already tried the obvious things: pushed the arms outward, asked an optician to "loosen them a bit", bought the silicone sleeves. Relief lasts a day. Then the ache returns above the ear, the red lines return in front of it, and the frame ends up on the desk by three in the afternoon.</p>

<p>The reason is simple and slightly annoying: the eyewear industry treats tightness as an adjustment problem, and for most faces it is. Above roughly 150 mm of head width it stops being one.</p>

<h2>Where exactly does it hurt?</h2>

<p>The location of the pain tells you which of three completely different problems you have. Take your glasses off after four hours of wear and look in a mirror before you read the table.</p>

<div style="overflow-x:auto;margin:24px 0;">
<table style="width:100%;border-collapse:collapse;font-family:'Barlow',sans-serif;font-size:14px;">
  <thead>
    <tr style="background:#0f0f0f;color:#f0ece4;">
      <th style="${TH}">Where it hurts</th>
      <th style="${TH}">What it means</th>
      <th style="${TH}">Fixable?</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #E8E4DC;">
      <td style="${TD}"><strong>Temples</strong><br><span style="color:#666;">in front of the ear, flat side of the skull</span></td>
      <td style="${TD}">The front is narrower than your face. The arms are being forced outward at the hinge and are squeezing inward along their whole length, right over the temporal artery.</td>
      <td style="${TD}"><strong style="color:#A05A3F;">No.</strong> Front width is fixed.</td>
    </tr>
    <tr style="border-bottom:1px solid #E8E4DC;background:#FAF7F0;">
      <td style="${TD}"><strong>Behind the ears</strong><br><span style="color:#666;">on the bone, where the arm curls</span></td>
      <td style="${TD}">The temple bend is too steep, too early, or the arm is too short for your ear position. The frame is hanging off the ear instead of resting on it.</td>
      <td style="${TD}"><strong style="color:#7A6A3A;">Yes.</strong> Standard optician adjustment.</td>
    </tr>
    <tr style="border-bottom:1px solid #E8E4DC;">
      <td style="${TD}"><strong>Nose bridge</strong><br><span style="color:#666;">red dents either side</span></td>
      <td style="${TD}">The bridge is too narrow for your nose, or the whole frame weight has migrated forward because the arms are not carrying their share.</td>
      <td style="${TD}"><strong style="color:#7A6A3A;">Partly.</strong> Pads yes; keyhole width no.</td>
    </tr>
    <tr style="background:#F5EFDD;">
      <td style="${TD}"><strong>All three at once</strong></td>
      <td style="${TD}">The frame is simply a size too small in every dimension. This is the classic pattern for a face over 155 mm wearing a mainstream 142–148 mm frame.</td>
      <td style="${TD}"><strong style="color:#A05A3F;">No.</strong> Change the frame.</td>
    </tr>
  </tbody>
</table>
</div>

<p>The single most useful distinction in that table is temples versus behind the ears. Behind-the-ear pain is a fitting problem and a good optician solves it in ten minutes. Temple pain is a geometry problem and no amount of bench work solves it.</p>

<h2>What you can fix at home</h2>

<p>Four things are genuinely within reach without a workshop, and they are worth doing before you conclude the frame is wrong.</p>

<p><strong>Splaying the temple arms.</strong> On acetate, hold the arm near the hinge, warm the plastic, and ease it outward a few degrees. This increases the effective spread at the back of the head without touching the front. Realistic gain: 3–5 mm of comfort each side, and only if the front is already close.</p>

<p><strong>Heat on acetate.</strong> Cellulose acetate softens at around 80 °C. A hairdryer on medium, 20–30 seconds, moving constantly, gets you there. Never boiling water and never a heat gun — acetate blisters and the finish goes cloudy. Bend gently, hold the new shape until cool, check the fit, repeat. This is the mechanism behind every "how to adjust plastic frame glasses" tutorial, and it works — on the arms.</p>

<p><strong>Nose pads.</strong> On metal frames, squeezing the pads inward by a millimetre raises the frame and takes load off the arms. On acetate keyhole bridges there are no pads to adjust; the bridge is cut into the front and its width is fixed at manufacture. A stick-on pad can lift the frame slightly but cannot widen the keyhole.</p>

<p><strong>Ear cushions.</strong> Silicone sleeves spread the load behind the ear over a larger area, which is exactly the right treatment for a pressure sore behind the ear. They do nothing for temple pressure — in fact they slightly increase it, because they add material to an arm that is already being pushed outward.</p>

<div style="background:#F8F6F1;border-left:3px solid #c9a84c;padding:18px 22px;margin:24px 0;border-radius:4px;">
  <div style="font-family:'Barlow',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#888;margin-bottom:10px;">Being honest about opticians</div>
  <p style="margin:0;font-size:15px;line-height:1.65;color:#1a1a1a;">A skilled optician can change temple angle, temple bend, pantoscopic tilt, nose pads, and the splay of the arms. They can add 3–6 mm of practical comfort on a frame that is marginal. They cannot change lens width, bridge width, or the hinge-to-hinge front width. If they tell you the frame is too small, they are not brushing you off — they are telling you the truth that a shop with a sales target usually skips.</p>
</div>

<h2>What you cannot fix</h2>

<p>Front width. That is the whole list, and it is the one that matters.</p>

<p>Consider the arithmetic. A mainstream frame front measures 138–148 mm from outer edge to outer edge. A wide face measures 155–165 mm temple to temple. Put a 148 mm front on a 158 mm face and the arms must spread ten millimetres wider than they were designed to, working as leaf springs the entire time you wear them. That spring load lands on a strip of skin roughly 40 mm long over the temporal region — the same area where the superficial temporal artery runs just under the surface.</p>

<p>Three things follow, in order. First, a dull compression ache that builds over two to four hours and disappears within minutes of taking the frame off. Second, visible indentations — two parallel lines that stay pink for twenty minutes afterwards. Third, over months, the hinge fatigues: the arm has been held at an angle it was never machined for, and acetate frames typically crack at the hinge slot rather than the arm.</p>

<p>People describe this as "glasses too narrow for face", and that phrasing is exactly right. It is not a tightness that can be loosened. It is a frame that is the wrong size, in the same way a size 9 shoe is wrong for a size 11 foot regardless of how you lace it.</p>

<h2>The 30-second check</h2>

<p>You need two numbers and one of them is printed on your current frame.</p>

<p><strong>Number one — your face.</strong> Stand square to a mirror, look straight ahead, and hold a ruler flat and level across the widest part of your head, just above and in front of the ears. Not across your cheeks. Read the millimetres. Under 140 mm is average. 140–149 mm is large-average. 150 mm and up is a wide face. 155 mm and up is where the mainstream market has nothing at all.</p>

<p><strong>Number two — your frame.</strong> Lay the glasses face-down and measure straight across the front, outer edge to outer edge. This is the front width, and it is <em>not</em> any of the three numbers printed inside the temple. A 54□21-140 marking describes lens width, bridge and arm length; the front is roughly lens × 2 + bridge + about 6 mm of rim, so around 135 mm in that example. We break the arithmetic down in <a href="/en/blog/numbers-on-glasses-frames-meaning" style="color:#A07A2A;">what the numbers on glasses frames mean</a>.</p>

<p>Now compare. If your frame's front width is within about 3 mm of your face width, the fit is right and the pain is an adjustment problem. If the frame is 6 mm or more narrower than your face, it is the wrong size and no bench work will change that.</p>

${FITLENS_CTA(
      "Don't want to hold a ruler against your own head? FitLens measures face width and bridge width from your phone camera in about twenty seconds — no app, no appointment, and the image never leaves your device.",
      "Measure your face with FitLens",
    )}

<h2>If your face is 155 mm or wider</h2>

<p>Then you have run into what we call the 155 mm problem, and it is structural rather than personal. Frame moulds are cut for the middle of the distribution. Zenni's extended fit tops out around 145 mm, Warby Parker's wide range around 145 mm, EyeBuyDirect around 146 mm. Even most brands marketing to "big heads" stop before 150 mm. Above 155 mm the market thins to a handful of makers, and above 162 mm it is bespoke or nothing.</p>

<p>The full explanation of why the industry stops where it does — and what it means for pricing, tooling and availability — is in <a href="/en/blog/why-glasses-dont-fit-155mm-problem" style="color:#A07A2A;">why glasses don't fit at 155 mm</a>. If you want the practical version, with what to buy and what to skip, start with the <a href="/en/blog/glasses-for-wide-faces-guide" style="color:#A07A2A;">complete wide-face fit guide</a>.</p>

<p>For reference, both Woolet signature frames are cut at a 158 mm front: the <a href="/en/products/007" style="color:#A07A2A;">007 Round</a> at 54□21 with a 103 mm temple, and the <a href="/en/products/009" style="color:#A07A2A;">009 Soft-Square</a> at 51□20 with the same 103 mm temple. Both sit in a 155–161 mm fit band. Below 155 mm or above 161 mm, bespoke covers 145–162 mm in four shapes.</p>

<p>The point is not that you need a particular frame. It is that the pain you are feeling has a number attached to it, and once you know that number the problem stops being mysterious.</p>

<h2>FAQ</h2>

<h3>Why are my glasses suddenly too tight on the side of my head?</h3>
<p>Frames rarely tighten on their own — acetate relaxes with wear rather than shrinking. A sudden change usually means someone over-tightened the temples at a recent adjustment, the hinge screws were re-seated inward, or the frame was heated and reset narrower. Weight change and swelling can add 2–4 mm of head width, which is enough to turn a borderline frame into a painful one.</p>

<h3>Can an optician widen glasses that are too tight?</h3>
<p>An optician can splay the temple arms outward, bend the arm behind the ear, adjust nose pads and open the temple angle by a few degrees. What they cannot change is the front width — the distance across the frame from hinge to hinge is fixed by the acetate block or metal front. If a 148 mm front sits on a 158 mm face, adjustment relieves symptoms for a day or two at best.</p>

<h3>How do I know if my glasses are too small rather than badly adjusted?</h3>
<p>Look at where the pressure is. Pain in front of the ears, at the temples, means the front is too narrow. Pain behind the ears, on the mastoid bone, usually means the temple arms are bent too steeply or are too short — that is adjustable. Red indentations on both temples after four hours of wear is the clearest sign the frame itself is too small.</p>

<h3>Can glasses cause a pressure sore behind the ear?</h3>
<p>Yes. A temple arm with too tight a bend concentrates load on a few square millimetres of skin over bone, which reddens, then breaks down. Silicone ear cushions and a shallower bend fix most cases. If the sore returns within a week of every adjustment, the arm is being asked to hold a frame the front cannot hold on its own.</p>

<h3>Do glasses stretch out over time?</h3>
<p>Acetate relaxes slightly with body heat — perhaps 1–2 mm of effective width over months, and only at the temples, not across the front. It is not a plan. Buying a frame that is 10 mm too narrow and waiting for it to give will produce months of headaches and a frame that eventually cracks at the hinge.</p>

<h3>Can tight glasses cause headaches?</h3>
<p>Pressure over the temporal region is a well-known trigger for compression headaches — a dull ache above and in front of the ear that builds over a few hours and eases within minutes of removing the frame. If your headache follows that timing, the frame width is the first thing to check, before your prescription.</p>

<h2>Related articles</h2>
<ul>
<li><a href="/en/blog/why-glasses-dont-fit-155mm-problem">Why glasses don't fit at 155 mm</a> — the industry sizing gap, in plain numbers.</li>
<li><a href="/en/blog/how-to-measure-face-width-for-glasses">How to measure your face width for glasses</a> — the calibrated method, with and without a ruler.</li>
<li><a href="/en/blog/glasses-for-wide-faces-guide">Glasses for wide faces: the complete guide</a> — what to buy once you know your number.</li>
</ul>
`,
  },

  /* ─────────────────────────── POST 2 ─────────────────────────── */
  {
    slug: "eyeglass-frame-size-chart",
    title: "Eyeglass Frame Size Chart (2026) — and Why It Stops at 150 mm",
    excerpt:
      "A real eyeglass frame size chart in millimetres: XS to XXL mapped to front width, lens width, bridge, temple length and the face width each band actually fits — plus what to do when the standard chart ends before your face begins.",
    date: "2026-07-29",
    readTime: 9,
    tags: ["Sizing", "Guide", "Frame Size"],
    faq: [
      {
        q: "What is a standard eyeglass frame size?",
        a: "The industry median is a 52 mm lens, an 18 mm bridge and a 140 mm temple, giving a total front width of roughly 128–132 mm. Most adult frames sold worldwide fall between 125 mm and 145 mm of front width, which is why the standard chart effectively ends at large.",
      },
      {
        q: "How do I find my glasses size without having glasses?",
        a: "Measure your face temple-to-temple with a ruler held flat across the widest part of your head, just in front of the ears. Your frame front width should land within about 3 mm of that number. From front width you can work back: subtract the bridge you need, divide the rest by two, and you have your approximate lens width.",
      },
      {
        q: "Is there a glasses size chart by age?",
        a: "Only loosely, and only for children. Youth frames run roughly 105–125 mm of front width from age four to twelve, after which head width is adult in most people by fourteen to sixteen. For adults, age tells you nothing useful — measure the face rather than reading a chart by year.",
      },
      {
        q: "Why is the women's frame size chart narrower than the men's?",
        a: "Because it is built on average measured head width by sex, where the female mean sits roughly 8–12 mm below the male mean. It is a statistical convention, not a rule about who a frame suits. A woman with a 156 mm face needs a 155 mm+ front just as much as a man does, and will not find it on the women's chart.",
      },
      {
        q: "What size sunglasses do I need in mm?",
        a: "The same front width as your eyeglasses, occasionally 2–4 mm more if you want coverage past the outer eye corner. Sunglass lens widths run larger — 55–62 mm is common — but lens width alone does not tell you the front width, so use the front measurement in the chart below.",
      },
      {
        q: "What counts as a medium frame size?",
        a: "In the common six-band system, medium is roughly a 50–53 mm lens with a 132–140 mm front width, fitting a face of about 134–142 mm. It is the single most produced band in eyewear and the default assumption behind almost every frame you see in a shop window.",
      },
    ],
    content: `${BYLINE("29 July 2026", "29 July 2026")}
${ANSWER(
      `<strong>Eyeglass frames are sized in millimetres across six bands, XS to XXL, running from about 122 mm to 150 mm of total front width.</strong> Use the chart below to match your face width to a band. The important caveat: the standard industry chart ends at roughly 150 mm, which is exactly where wide faces begin.`,
    )}

<p>Every retailer publishes a size chart and almost none of them publish the number you need. They give lens width, sometimes bridge, occasionally temple length — and then leave you to guess whether the frame will actually span your head. This chart gives front width as the primary column, because front width is the measurement that decides fit.</p>

<h2>The chart</h2>

<p>Front width is the total outer edge-to-outer edge measurement of the frame front. Face width is temple-to-temple, measured across the widest part of your head just in front of the ears. A good fit puts the two within about 3 mm of each other.</p>

<div style="overflow-x:auto;margin:24px 0;">
<table style="width:100%;border-collapse:collapse;font-family:'Barlow',sans-serif;font-size:13.5px;">
  <thead>
    <tr style="background:#0f0f0f;color:#f0ece4;">
      <th style="${TH}">Band</th>
      <th style="${TH}">Front width</th>
      <th style="${TH}">Lens width</th>
      <th style="${TH}">Bridge</th>
      <th style="${TH}">Temple</th>
      <th style="${TH}">Fits a face of</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #E8E4DC;">
      <td style="${TD}"><strong>XS</strong></td><td style="${TD}">122–127 mm</td><td style="${TD}">42–45 mm</td><td style="${TD}">16–18 mm</td><td style="${TD}">130–135 mm</td><td style="${TD}">up to 126 mm</td>
    </tr>
    <tr style="border-bottom:1px solid #E8E4DC;background:#FAF7F0;">
      <td style="${TD}"><strong>S</strong></td><td style="${TD}">127–132 mm</td><td style="${TD}">46–49 mm</td><td style="${TD}">17–19 mm</td><td style="${TD}">135–140 mm</td><td style="${TD}">127–133 mm</td>
    </tr>
    <tr style="border-bottom:1px solid #E8E4DC;">
      <td style="${TD}"><strong>M</strong></td><td style="${TD}">132–140 mm</td><td style="${TD}">50–53 mm</td><td style="${TD}">18–20 mm</td><td style="${TD}">140–145 mm</td><td style="${TD}">134–142 mm</td>
    </tr>
    <tr style="border-bottom:1px solid #E8E4DC;background:#FAF7F0;">
      <td style="${TD}"><strong>L</strong></td><td style="${TD}">140–145 mm</td><td style="${TD}">54–56 mm</td><td style="${TD}">19–21 mm</td><td style="${TD}">145–148 mm</td><td style="${TD}">143–147 mm</td>
    </tr>
    <tr style="border-bottom:1px solid #E8E4DC;">
      <td style="${TD}"><strong>XL</strong></td><td style="${TD}">145–148 mm</td><td style="${TD}">56–58 mm</td><td style="${TD}">20–22 mm</td><td style="${TD}">145–150 mm</td><td style="${TD}">148–152 mm</td>
    </tr>
    <tr style="border-bottom:1px solid #E8E4DC;background:#FAF7F0;">
      <td style="${TD}"><strong>XXL</strong><br><span style="color:#666;font-size:12px;">rare, few makers</span></td><td style="${TD}">148–150 mm</td><td style="${TD}">58–60 mm</td><td style="${TD}">20–22 mm</td><td style="${TD}">148–150 mm</td><td style="${TD}">152–154 mm</td>
    </tr>
    <tr style="background:#F5EFDD;">
      <td style="${TD}"><strong>Woolet 158</strong><br><span style="color:#666;font-size:12px;">off the standard chart</span></td><td style="${TD}"><strong>158 mm</strong></td><td style="${TD}">51–54 mm</td><td style="${TD}">20–21 mm</td><td style="${TD}">103 mm*</td><td style="${TD}"><strong>155–161 mm</strong></td>
    </tr>
  </tbody>
</table>
</div>

<p style="font-size:13px;color:#666;">*Woolet publishes temple length as the straight arm measurement to the start of the bend (103 mm), not the total including the drop. See the note on measurement conventions in <a href="/en/blog/temple-to-temple-measurement" style="color:#A07A2A;">temple-to-temple explained</a>.</p>

<div style="background:#F8F6F1;border-left:3px solid #c9a84c;padding:18px 22px;margin:24px 0;border-radius:4px;">
  <div style="font-family:'Barlow',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#888;margin-bottom:10px;">The hook nobody prints on the chart</div>
  <p style="margin:0;font-size:15px;line-height:1.65;color:#1a1a1a;">The standard chart stops at about 150 mm of front width, fitting a face of roughly 154 mm. Faces do not stop there. A meaningful share of adult men measure 155–165 mm temple to temple, and for them every row above is a compromise. That gap — not style, not budget — is why this article exists and why Woolet builds at 158 mm.</p>
</div>

<h2>How to read a frame size from your current glasses</h2>

<p>Take your glasses off and look at the inside of the left temple arm, or occasionally the inside of the bridge. You will find something like <strong>54□21-140</strong>.</p>

<ul>
  <li><strong>54</strong> — lens width in millimetres, measured horizontally across one lens at its widest point. Sometimes called eye size.</li>
  <li><strong>□</strong> — the DBL symbol, indicating that the next number is the distance between lenses.</li>
  <li><strong>21</strong> — bridge width: the gap between the two lenses at their closest point.</li>
  <li><strong>140</strong> — temple length: the arm, measured from the hinge screw along the arm and around the bend to the tip.</li>
</ul>

<p>What the marking does not give you is front width. To estimate it, double the lens width, add the bridge, then add 5–8 mm for the two outer rims and hinge blocks. For 54□21 that is 54 × 2 + 21 + 6 ≈ 135 mm. If your face is 158 mm, that frame is 23 mm short — and it will hurt exactly the way described in <a href="/en/blog/glasses-too-tight-on-side-of-head" style="color:#A07A2A;">glasses too tight on the side of your head</a>.</p>

<p>This estimation gap is the single most common sizing mistake in eyewear. People shop for a "58 mm lens" believing bigger lenses mean a wider frame, then discover a 58□16 frame is narrower across the front than a 54□22 one.</p>

${FITLENS_CTA(
      "The chart is only useful once you know which row you are in. FitLens reads your face width and bridge width from a phone photo in about twenty seconds and tells you which band — including whether you are past the end of the standard chart.",
      "Find your band in 20 seconds",
    )}

<h2>Men's vs women's charts — why the women's chart is narrower</h2>

<p>Open any retailer's sizing page and you will find two charts. The men's chart typically runs 132–148 mm of front width; the women's runs 125–140 mm. The bands carry the same letters and mean different millimetres.</p>

<p>The reason is anthropometric averaging. Measured head breadth across adult populations shows a female mean roughly 8–12 mm below the male mean, and frame ranges were built around those two clusters decades ago. It is a manufacturing convention, not a statement about who a frame is for.</p>

<p>Two practical consequences follow. First, if you are a woman with a face wider than about 145 mm, the women's chart has nothing for you and you should ignore it entirely — shop the men's or unisex chart by front width and pick the shape you like. Second, if you are a man with a narrow face, the same logic applies in reverse; a 128 mm front is not a "women's frame", it is a 128 mm front.</p>

<p>Woolet publishes one chart because there is one measurement. Face width in millimetres, frame front width in millimetres, matched.</p>

<h2>Sunglasses sizing in millimetres</h2>

<p>Sunglass charts look larger because sunglass lenses are larger — 55–62 mm is normal where 50–54 mm is normal in optical. That does not mean the frames are wider across the front. A 60□14 sunglass front measures roughly 140 mm, no more than an L-band optical frame.</p>

<p>For sunglasses, add 0–4 mm to your optical front width if you want the lens edge to sit past the outer corner of your eye for coverage. Beyond that the rules are identical: front width first, lens width second.</p>

<h2>What to do if you are off the chart</h2>

<p>If your face measures more than about 154 mm, the six-band chart has run out. Three honest options remain.</p>

<p><strong>Buy at 158 mm.</strong> If you measure 155–161 mm, that is a stock size at Woolet: the <a href="/en/products/007" style="color:#A07A2A;">007 Round</a> at 54□21 and the <a href="/en/products/009" style="color:#A07A2A;">009 Soft-Square</a> at 51□20, both cut at a 158 mm front from Mazzucchelli acetate and hand made in the EU.</p>

<p><strong>Go bespoke between 145 and 162 mm.</strong> The bands either side of 155–161 mm are the ones nobody serves: 145–154 mm is too wide for the mainstream chart and too narrow for a 158 mm signature frame, and 162 mm is past everything. Bespoke covers that full span in four shapes and sixty colour and size combinations. See <a href="/en/bespoke" style="color:#A07A2A;">bespoke</a>.</p>

<p><strong>Above 162 mm, look at made-to-order metal.</strong> We do not build past 162 mm, and saying so is more useful than pretending otherwise. A custom metal front from a specialist workshop is the realistic route.</p>

<p>Individual width reference pages, each with fit notes and frame recommendations: <a href="/en/size/145mm" style="color:#A07A2A;">145 mm</a> · <a href="/en/size/150mm" style="color:#A07A2A;">150 mm</a> · <a href="/en/size/155mm" style="color:#A07A2A;">155 mm</a> · <a href="/en/size/158mm" style="color:#A07A2A;">158 mm</a> · <a href="/en/size/160mm" style="color:#A07A2A;">160 mm</a> · <a href="/en/size/162mm" style="color:#A07A2A;">162 mm</a> · <a href="/en/size/165mm" style="color:#A07A2A;">165 mm</a>.</p>

<h2>FAQ</h2>

<h3>What is a standard eyeglass frame size?</h3>
<p>The industry median is a 52 mm lens, an 18 mm bridge and a 140 mm temple, giving a total front width of roughly 128–132 mm. Most adult frames sold worldwide fall between 125 mm and 145 mm of front width, which is why the standard chart effectively ends at large.</p>

<h3>How do I find my glasses size without having glasses?</h3>
<p>Measure your face temple-to-temple with a ruler held flat across the widest part of your head, just in front of the ears. Your frame front width should land within about 3 mm of that number. From front width you can work back: subtract the bridge you need, divide the rest by two, and you have your approximate lens width.</p>

<h3>Is there a glasses size chart by age?</h3>
<p>Only loosely, and only for children. Youth frames run roughly 105–125 mm of front width from age four to twelve, after which head width is adult in most people by fourteen to sixteen. For adults, age tells you nothing useful — measure the face rather than reading a chart by year.</p>

<h3>Why is the women's frame size chart narrower than the men's?</h3>
<p>Because it is built on average measured head width by sex, where the female mean sits roughly 8–12 mm below the male mean. It is a statistical convention, not a rule about who a frame suits. A woman with a 156 mm face needs a 155 mm+ front just as much as a man does, and will not find it on the women's chart.</p>

<h3>What size sunglasses do I need in mm?</h3>
<p>The same front width as your eyeglasses, occasionally 2–4 mm more if you want coverage past the outer eye corner. Sunglass lens widths run larger — 55–62 mm is common — but lens width alone does not tell you the front width, so use the front measurement in the chart above.</p>

<h3>What counts as a medium frame size?</h3>
<p>In the common six-band system, medium is roughly a 50–53 mm lens with a 132–140 mm front width, fitting a face of about 134–142 mm. It is the single most produced band in eyewear and the default assumption behind almost every frame you see in a shop window.</p>

<h2>Related articles</h2>
<ul>
<li><a href="/en/blog/numbers-on-glasses-frames-meaning">What do the numbers on glasses frames mean?</a> — 54□21-103 decoded, with the arithmetic.</li>
<li><a href="/en/blog/how-to-measure-face-width-for-glasses">How to measure your face width for glasses</a> — the measurement the chart is built around.</li>
<li><a href="/en/blog/extra-wide-glasses-158mm">Extra-wide glasses at 158 mm</a> — what exists past the end of the chart.</li>
</ul>
`,
  },

  /* ─────────────────────────── POST 3 ─────────────────────────── */
  {
    slug: "temple-to-temple-measurement",
    title: "Temple-to-Temple: The One Measurement Nobody Tells You About",
    excerpt:
      "Temple length is the arm on your glasses. Temple-to-temple is the width of your head. They are different numbers, they are constantly confused, and only one of them decides whether a frame fits.",
    date: "2026-07-29",
    readTime: 7,
    tags: ["Sizing", "Fit", "Frame Size"],
    faq: [
      {
        q: "How do I measure temple length for glasses?",
        a: "Lay one arm flat and measure from the centre of the hinge screw, along the arm, around the bend and out to the tip. Standard lengths are 135, 140, 145 and 150 mm. If the arm curves down behind the ear, follow the curve rather than measuring straight — that is the convention printed on the frame.",
      },
      {
        q: "What does temple length mean on glasses?",
        a: "It is the length of the side arm from hinge to tip in millimetres, the third number in a marking like 54□21-140. It controls how far back the frame reaches before it turns down behind the ear. It says nothing about how wide the frame is across your face.",
      },
      {
        q: "What is the difference between 140 and 145 temple length?",
        a: "Five millimetres of reach. A 145 mm arm places the bend 5 mm further back, which helps if your ears sit further back on your skull or if a 140 mm arm bends before it clears the ear and digs in. It does not make the frame wider across the front — a common and expensive misunderstanding.",
      },
      {
        q: "What does temple-to-temple mean?",
        a: "It is your own face measurement: the distance across the widest part of your head, just above and in front of the ears, measured in millimetres. It is the number a frame's total front width should match within about 3 mm. Average is under 140 mm; 155 mm and above is a wide face.",
      },
      {
        q: "Why is the Woolet temple length only 103 mm?",
        a: "Because Woolet publishes the straight arm section to the start of the bend, not the total path length around the drop. Adding the 52 mm tip drop gives an effective reach comparable with a conventional 145–150 mm marking. Different convention, same fit — it is listed alongside the tip drop for exactly that reason.",
      },
    ],
    content: `${BYLINE("29 July 2026", "29 July 2026")}
${ANSWER(
      `<strong>Temple length is the arm of the glasses — usually 135–150 mm, the third number in a marking like 54□21-140. Temple-to-temple is the width of your head.</strong> They sound the same and are entirely different. Front width must match your temple-to-temple measurement; temple length only controls how far back the arm reaches.`,
    )}

<p>This confusion costs people money. Someone measures their head at 158 mm, finds a frame marked 54□21-150, sees the largest number matches roughly, and buys it. The arm is long. The front is 135 mm. It arrives and it pinches.</p>

<p>So before anything else: the third number on your frame is not a width. It has never been a width.</p>

<h2>Two measurements, one word</h2>

<div style="overflow-x:auto;margin:24px 0;">
<table style="width:100%;border-collapse:collapse;font-family:'Barlow',sans-serif;font-size:14px;">
  <thead>
    <tr style="background:#0f0f0f;color:#f0ece4;">
      <th style="${TH}"></th>
      <th style="${TH}">Temple length</th>
      <th style="${TH}">Temple-to-temple</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #E8E4DC;"><td style="${TD}"><strong>What it measures</strong></td><td style="${TD}">The side arm of the frame, hinge to tip</td><td style="${TD}">Your head, side to side</td></tr>
    <tr style="border-bottom:1px solid #E8E4DC;background:#FAF7F0;"><td style="${TD}"><strong>Belongs to</strong></td><td style="${TD}">The frame</td><td style="${TD}">You</td></tr>
    <tr style="border-bottom:1px solid #E8E4DC;"><td style="${TD}"><strong>Typical range</strong></td><td style="${TD}">135–150 mm</td><td style="${TD}">130–170 mm</td></tr>
    <tr style="border-bottom:1px solid #E8E4DC;background:#FAF7F0;"><td style="${TD}"><strong>Where you find it</strong></td><td style="${TD}">Printed inside the arm, third number</td><td style="${TD}">Ruler across your head, or a FitLens scan</td></tr>
    <tr style="background:#F5EFDD;"><td style="${TD}"><strong>Decides fit?</strong></td><td style="${TD}">Comfort behind the ear only</td><td style="${TD}"><strong>Yes — it sets required front width</strong></td></tr>
  </tbody>
</table>
</div>

<h2>Temple length: what the numbers actually do</h2>

<p>Temple length is measured from the centre of the hinge screw, along the arm, around the bend and to the tip. It determines where the arm turns down. Too short and the bend lands in front of the ear, pressing into the side of the head. Too long and the tip slides past the ear and the frame slips forward.</p>

<div style="overflow-x:auto;margin:24px 0;">
<table style="width:100%;border-collapse:collapse;font-family:'Barlow',sans-serif;font-size:14px;">
  <thead>
    <tr style="background:#0f0f0f;color:#f0ece4;">
      <th style="${TH}">Temple length</th>
      <th style="${TH}">Who it fits</th>
      <th style="${TH}">Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #E8E4DC;"><td style="${TD}"><strong>135 mm</strong></td><td style="${TD}">Small adult and youth frames</td><td style="${TD}">Common on XS/S fronts. Bends early.</td></tr>
    <tr style="border-bottom:1px solid #E8E4DC;background:#FAF7F0;"><td style="${TD}"><strong>140 mm</strong></td><td style="${TD}">The default for most adults</td><td style="${TD}">Paired with 132–142 mm fronts. If a shop has one length in stock, it is this.</td></tr>
    <tr style="border-bottom:1px solid #E8E4DC;"><td style="${TD}"><strong>145 mm</strong></td><td style="${TD}">Larger heads, ears set further back</td><td style="${TD}">The usual upgrade when a 140 mm arm bends too early.</td></tr>
    <tr style="border-bottom:1px solid #E8E4DC;background:#FAF7F0;"><td style="${TD}"><strong>150 mm</strong></td><td style="${TD}">Long-skulled or high-circumference heads</td><td style="${TD}">Rare in stock. Often special order.</td></tr>
    <tr style="background:#F5EFDD;"><td style="${TD}"><strong>103 mm + 52 mm drop</strong><br><span style="color:#666;font-size:12px;">Woolet 007 / 009</span></td><td style="${TD}">155–161 mm faces</td><td style="${TD}">Different convention — see below. Effective reach is comparable to 145–150 mm.</td></tr>
  </tbody>
</table>
</div>

<h2>Why Woolet publishes 103 mm</h2>

<p>Both signature frames — the <a href="/en/products/007" style="color:#A07A2A;">007 Round</a> (54□21, front 158 mm, lens height 42 mm, front height 52 mm) and the <a href="/en/products/009" style="color:#A07A2A;">009 Soft-Square</a> (51□20, front 158 mm, lens height 45 mm, front height 54 mm) — list a 103 mm temple and a 52 mm tip drop.</p>

<p>That 103 mm is the straight section from hinge to the start of the bend. The conventional marking on a mass-market frame folds the whole curved path into one number, which is why it reads 140 or 145. Add Woolet's 103 mm straight run to the 52 mm drop and the arm reaches as far back as a conventionally marked 145–150 mm temple.</p>

<p>We publish it split because on a wide front the two parts do different jobs. The straight run has to clear a wider skull before it turns; the drop has to sit behind an ear that is further back than the average. Reporting a single fused number hides which of the two is short when a frame does not fit — and on a 158 mm front that distinction matters.</p>

<h2>Temple length and head circumference</h2>

<p>Head circumference and temple-to-temple width are correlated but not interchangeable. A head can be wide and short front-to-back, or narrow and long. Circumference above roughly 59 cm generally means you need a 145 mm arm or longer, regardless of width, because the ears sit further back along the skull.</p>

<p>The practical consequence: it is entirely possible to need a 158 mm front with a standard 140 mm arm, or a 140 mm front with a 150 mm arm. These are independent dimensions and should be chosen independently. Length reference pages by measurement: <a href="/en/temple/140mm" style="color:#A07A2A;">140 mm</a> · <a href="/en/temple/145mm" style="color:#A07A2A;">145 mm</a> · <a href="/en/temple/150mm" style="color:#A07A2A;">150 mm</a>.</p>

${FITLENS_CTA(
      "Temple-to-temple is the number that decides whether a frame fits, and it is awkward to measure on yourself. FitLens reads it from your phone camera in about twenty seconds, together with your bridge width.",
      "Get your number in 20 seconds",
    )}

<h2>How to measure both, properly</h2>

<p><strong>Temple length (the frame).</strong> Lay one arm flat on a table. Measure from the centre of the hinge screw along the arm; when you reach the bend, follow the curve to the tip rather than measuring in a straight line. Round to the nearest 5 mm — that is the granularity the industry works in.</p>

<p><strong>Temple-to-temple (your face).</strong> Stand square to a mirror. Hold a ruler flat and level across the widest part of your head, just above and in front of the ears — not across your cheekbones, which reads 8–15 mm narrow. Read the millimetres. The full calibrated method, including the credit-card photo reference, is in <a href="/en/blog/how-to-measure-face-width-for-glasses" style="color:#A07A2A;">how to measure your face width for glasses</a>.</p>

<h2>Frame width vs temple length, one last time</h2>

<p>If a frame hurts at the temples, the front is too narrow — temple length is irrelevant to that problem, and buying a longer arm will not help. If a frame hurts behind the ear, or slides down your nose while sitting level at the sides, temple length or its bend is the culprit and an optician can fix it. The diagnostic table in <a href="/en/blog/glasses-too-tight-on-side-of-head" style="color:#A07A2A;">glasses too tight on the side of your head</a> covers every combination.</p>

<h2>FAQ</h2>

<h3>How do I measure temple length for glasses?</h3>
<p>Lay one arm flat and measure from the centre of the hinge screw, along the arm, around the bend and out to the tip. Standard lengths are 135, 140, 145 and 150 mm. If the arm curves down behind the ear, follow the curve rather than measuring straight — that is the convention printed on the frame.</p>

<h3>What does temple length mean on glasses?</h3>
<p>It is the length of the side arm from hinge to tip in millimetres, the third number in a marking like 54□21-140. It controls how far back the frame reaches before it turns down behind the ear. It says nothing about how wide the frame is across your face.</p>

<h3>What is the difference between 140 and 145 temple length?</h3>
<p>Five millimetres of reach. A 145 mm arm places the bend 5 mm further back, which helps if your ears sit further back on your skull or if a 140 mm arm bends before it clears the ear and digs in. It does not make the frame wider across the front — a common and expensive misunderstanding.</p>

<h3>What does temple-to-temple mean?</h3>
<p>It is your own face measurement: the distance across the widest part of your head, just above and in front of the ears, measured in millimetres. It is the number a frame's total front width should match within about 3 mm. Average is under 140 mm; 155 mm and above is a wide face.</p>

<h3>Why is the Woolet temple length only 103 mm?</h3>
<p>Because Woolet publishes the straight arm section to the start of the bend, not the total path length around the drop. Adding the 52 mm tip drop gives an effective reach comparable with a conventional 145–150 mm marking. Different convention, same fit — it is listed alongside the tip drop for exactly that reason.</p>

<h2>Related articles</h2>
<ul>
<li><a href="/en/blog/numbers-on-glasses-frames-meaning">What do the numbers on glasses frames mean?</a> — the full 54□21-103 breakdown.</li>
<li><a href="/en/blog/eyeglass-frame-size-chart">Eyeglass frame size chart (2026)</a> — XS to XXL in real millimetres.</li>
<li><a href="/en/blog/how-to-measure-face-width-for-glasses">How to measure your face width for glasses</a> — the temple-to-temple method.</li>
</ul>
`,
  },

  /* ─────────────────────────── POST 4 ─────────────────────────── */
  {
    slug: "numbers-on-glasses-frames-meaning",
    title: "What Do the Numbers on Glasses Frames Mean? (54□21-103 Explained)",
    excerpt:
      "The three numbers inside your temple arm are lens width, bridge width and temple length. None of them is the total width of the frame — which is why so many people buy glasses that don't fit.",
    date: "2026-07-29",
    readTime: 7,
    tags: ["Sizing", "Frame Size", "Guide"],
    faq: [
      {
        q: "What do the numbers on glasses frames mean?",
        a: "They are three measurements in millimetres: lens width, bridge width and temple length, printed inside the left temple arm as something like 54□21-103. The square symbol between the first two numbers marks the distance between lenses. Together they describe the parts of the frame, not the total width of the frame.",
      },
      {
        q: "What does 55 17 mean on glasses?",
        a: "A 55 mm lens width and a 17 mm bridge. Doubling the lens, adding the bridge and allowing about 6 mm for rims and hinges gives a front width near 133 mm — a medium frame, despite the large-sounding lens number.",
      },
      {
        q: "What is bridge width on glasses?",
        a: "The horizontal gap between the two lenses at their closest point, in millimetres. Standard bridges run 16–20 mm. A keyhole bridge of 21–24 mm distributes weight across a wider nasal base, which is why Woolet uses 20–21 mm keyhole bridges on frames built for wide faces.",
      },
      {
        q: "How do I find the lens size on my glasses?",
        a: "It is the first of the three printed numbers, on the inside of the left temple arm or occasionally on the bridge. To check it by hand, measure horizontally across one lens at its widest point, from groove to groove. Typical adult lens widths run 46–58 mm.",
      },
      {
        q: "Why isn't the frame's total width printed on the frame?",
        a: "Convention. The three-number marking was standardised for lens ordering and glazing, where lens and bridge dimensions are what a lab needs. Total front width matters to the wearer rather than the lab, so most brands omit it — which is precisely why wide-face buyers keep ordering frames that are 20 mm too narrow.",
      },
    ],
    content: `${BYLINE("29 July 2026", "29 July 2026")}
${ANSWER(
      `<strong>The three numbers inside your temple arm are lens width, bridge width and temple length in millimetres — for example 54□21-103.</strong> None of them is the total front width of the frame. That total is roughly lens × 2 + bridge + 6 mm, and it is the only number that decides whether a frame will fit your face.`,
    )}

<h2>The marking, decoded</h2>

<p>Open your glasses and look at the inside of the left arm. You will find a sequence like <strong>54□21-103</strong>, sometimes written 54-21-103 or 54▫21▫103.</p>

<div style="background:#F8F6F1;border:1px solid #E8E4DC;padding:22px 24px;margin:24px 0;border-radius:4px;font-family:'Barlow',sans-serif;">
  <div style="font-size:26px;letter-spacing:2px;color:#1a1a1a;margin-bottom:18px;"><strong>54</strong> <span style="color:#c9a84c;">□</span> <strong>21</strong> <span style="color:#999;">-</span> <strong>103</strong></div>
  <div style="font-size:14px;line-height:1.9;color:#1a1a1a;">
    <div><strong>54</strong> — <span style="color:#555;">lens width (eye size): across one lens at its widest point</span></div>
    <div><strong>□</strong> — <span style="color:#555;">the DBL marker: "distance between lenses" follows</span></div>
    <div><strong>21</strong> — <span style="color:#555;">bridge width: the gap between the lenses at their closest point</span></div>
    <div><strong>103</strong> — <span style="color:#555;">temple length: the arm, from hinge screw toward the tip</span></div>
  </div>
</div>

<p>That is the entire standard. Four items, three numbers, no total. Some manufacturers add lens height or front width on the box or the spec sheet, but almost nobody prints it on the frame.</p>

<h2>The worked example: Woolet 007 and 009</h2>

<p>Both signature frames are cut at a 158 mm front, and their printed markings look nothing like 158.</p>

<div style="overflow-x:auto;margin:24px 0;">
<table style="width:100%;border-collapse:collapse;font-family:'Barlow',sans-serif;font-size:14px;">
  <thead>
    <tr style="background:#0f0f0f;color:#f0ece4;">
      <th style="${TH}">Frame</th>
      <th style="${TH}">Marking</th>
      <th style="${TH}">Lens W</th>
      <th style="${TH}">Bridge</th>
      <th style="${TH}">Lens H</th>
      <th style="${TH}">Front width</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #E8E4DC;">
      <td style="${TD}"><strong><a href="/en/products/007" style="color:#A07A2A;">Woolet 007 Round</a></strong></td><td style="${TD}">54□21-103</td><td style="${TD}">54 mm</td><td style="${TD}">21 mm</td><td style="${TD}">42 mm</td><td style="${TD}"><strong>158 mm</strong></td>
    </tr>
    <tr style="background:#FAF7F0;">
      <td style="${TD}"><strong><a href="/en/products/009" style="color:#A07A2A;">Woolet 009 Soft-Square</a></strong></td><td style="${TD}">51□20-103</td><td style="${TD}">51 mm</td><td style="${TD}">20 mm</td><td style="${TD}">45 mm</td><td style="${TD}"><strong>158 mm</strong></td>
    </tr>
  </tbody>
</table>
</div>

<p>Note what just happened. The 009 has a <em>smaller</em> lens and a <em>narrower</em> bridge than the 007, and both frames are exactly the same width across the front. The difference is absorbed in rim thickness and the width of the hinge blocks either side. Nothing in the printed marking would tell you they are the same size on a face.</p>

<h2>The arithmetic: getting from three numbers to front width</h2>

<p>The estimate that works across most acetate frames:</p>

<div style="background:#0f0f0f;color:#f0ece4;padding:22px 26px;margin:24px 0;border-radius:6px;font-family:'Barlow',sans-serif;font-size:16px;line-height:1.8;">
  front width ≈ (lens width × 2) + bridge + rim &amp; hinge allowance<br>
  <span style="color:#c9a84c;font-size:14px;">acetate: allow 6–10 mm · thin metal: allow 2–4 mm</span>
</div>

<p>Worked through on three real markings:</p>

<ul>
  <li><strong>52□18-140</strong> → 52 × 2 + 18 + 6 = <strong>~128 mm</strong>. A small-to-medium frame, fits a face up to about 132 mm.</li>
  <li><strong>55□17-145</strong> → 55 × 2 + 17 + 6 = <strong>~133 mm</strong>. Despite the big lens, still a medium front.</li>
  <li><strong>58□16-145</strong> → 58 × 2 + 16 + 6 = <strong>~138 mm</strong>. Marketed as oversized; fits a 136–140 mm face.</li>
</ul>

<p>And the counter-example that makes the point: a 54□21 with wide rims and generous hinge blocks reaches 158 mm. The three printed numbers account for 129 mm of that; the remaining 29 mm is material either side of the lenses that the marking simply never mentions.</p>

<h2>Why the printed numbers hide the number that matters</h2>

<p>The three-number system was standardised for the optical lab, not for you. A glazing lab needs lens shape dimensions and the distance between lenses to cut and mount a prescription. It does not need to know how far the frame reaches across your skull, so that measurement was never part of the marking.</p>

<p>For a face under about 145 mm this omission is harmless. Frames in that range cluster tightly, and if the lens size looks right the front width usually is. Above 150 mm the omission becomes the central problem of buying glasses. Lens width stops predicting front width, because manufacturers building "oversized" frames enlarge the lens and keep the front the same — a bigger lens on the same 140 mm front looks dramatic and fits nobody differently.</p>

<p>This is the single most common sizing mistake buyers make: shopping for a large lens number when the requirement is a large front number. It is also why the standard <a href="/en/blog/eyeglass-frame-size-chart" style="color:#A07A2A;">frame size chart</a> is misleading past its final row, and why the pain described in <a href="/en/blog/glasses-too-tight-on-side-of-head" style="color:#A07A2A;">glasses too tight on the side of your head</a> keeps recurring even after people "size up".</p>

<h2>What the numbers don't cover at all</h2>

<p>Four dimensions matter for fit and never appear in the marking: total front width, lens height, front height, and temple tip drop. Woolet publishes all of them — the 007 at 42 mm lens height and 52 mm front height, the 009 at 45 mm and 54 mm, both with a 52 mm tip drop — because on a wide face each one changes whether the frame sits level.</p>

<p>Bridge deserves one extra note. A 21 mm keyhole bridge is not just a wider gap; it is a different load path, spreading weight across a broader nasal base instead of pinching two points. Detail on that in the <a href="/en/bridge/21mm" style="color:#A07A2A;">21 mm bridge reference</a>.</p>

${FITLENS_CTA(
      "Rather than decoding markings and estimating, measure the thing the markings leave out. FitLens returns your face width and bridge width from a phone photo in about twenty seconds and tells you the front width to shop for.",
      "Measure with FitLens",
    )}

<h2>FAQ</h2>

<h3>What do the numbers on glasses frames mean?</h3>
<p>They are three measurements in millimetres: lens width, bridge width and temple length, printed inside the left temple arm as something like 54□21-103. The square symbol between the first two numbers marks the distance between lenses. Together they describe the parts of the frame, not the total width of the frame.</p>

<h3>What does 55 17 mean on glasses?</h3>
<p>A 55 mm lens width and a 17 mm bridge. Doubling the lens, adding the bridge and allowing about 6 mm for rims and hinges gives a front width near 133 mm — a medium frame, despite the large-sounding lens number.</p>

<h3>What is bridge width on glasses?</h3>
<p>The horizontal gap between the two lenses at their closest point, in millimetres. Standard bridges run 16–20 mm. A keyhole bridge of 21–24 mm distributes weight across a wider nasal base, which is why Woolet uses 20–21 mm keyhole bridges on frames built for wide faces.</p>

<h3>How do I find the lens size on my glasses?</h3>
<p>It is the first of the three printed numbers, on the inside of the left temple arm or occasionally on the bridge. To check it by hand, measure horizontally across one lens at its widest point, from groove to groove. Typical adult lens widths run 46–58 mm.</p>

<h3>Why isn't the frame's total width printed on the frame?</h3>
<p>Convention. The three-number marking was standardised for lens ordering and glazing, where lens and bridge dimensions are what a lab needs. Total front width matters to the wearer rather than the lab, so most brands omit it — which is precisely why wide-face buyers keep ordering frames that are 20 mm too narrow.</p>

<h2>Related articles</h2>
<ul>
<li><a href="/en/blog/eyeglass-frame-size-chart">Eyeglass frame size chart (2026)</a> — XS to XXL mapped to real front widths.</li>
<li><a href="/en/blog/temple-to-temple-measurement">Temple-to-temple explained</a> — temple length vs the width of your head.</li>
<li><a href="/en/blog/how-to-measure-face-width-for-glasses">How to measure your face width for glasses</a> — the number the markings leave out.</li>
</ul>
`,
  },

  /* ─────────────────────────── POST 5 ─────────────────────────── */
  {
    slug: "oversized-blue-light-glasses-vs-wide-fit",
    title: "Oversized vs Wide-Fit Blue Light Glasses: Which One Do You Actually Need?",
    excerpt:
      "Oversized describes the lens. Wide-fit describes the distance across your face. A frame can have huge lenses and still measure 140 mm across — here's how to tell which one your face actually needs, in millimetres.",
    date: "2026-08-17",
    readTime: 7,
    tags: ["Blue Light", "Fit", "Guide"],
    faq: [
      {
        q: "What is the difference between oversized and wide-fit glasses?",
        a: "Oversized refers to lens size — tall, wide lenses that create a large visual footprint on the face. Wide-fit refers to the frame's total front width, hinge to hinge, and its bridge and temple length. A frame can be oversized and narrow at the same time: big lenses on a 140 mm front. Only the front width decides whether it spans your face.",
      },
      {
        q: "Are oversized blue light glasses good for a wide face?",
        a: "Only if the front width is also large. Most oversized frames sit around 130–145 mm front width as listed by the brands, which is under the 155 mm+ a wide face needs. If your temple-to-temple measurement is above 155 mm, the lenses can be as big as you like and the frame will still press on your temples.",
      },
      {
        q: "How do I measure whether I need a wide fit?",
        a: "Measure temple-to-temple: the straight-line distance across your face at the widest point, just in front of your ears. Under 145 mm is standard sizing, 145–155 mm is the upper end of mainstream, and above 155 mm you are outside most catalogues. Woolet's front width is 158 mm, with bespoke covering 145–162 mm.",
      },
      {
        q: "What size are oversized square blue light glasses?",
        a: "There is no standard. Brands apply the label to lens widths from roughly 52 mm upward, with front widths that vary widely and are often not published. The Woolet 009 Soft Square is 158 mm across the front with 54 mm lens width, a 22 mm keyhole bridge and 148 mm temples, and blue-light filtering is offered as a lens option.",
      },
      {
        q: "Do blue light glasses actually do anything?",
        a: "A 2023 Cochrane systematic review found blue-light filtering lenses probably make no measurable difference to eye strain, visual performance or sleep quality compared with standard lenses. We treat the filter as an optional coating and a matter of preference, not as a health product. The fit — the millimetres — is the part we make claims about.",
      },
    ],
    content: `${BYLINE("17 August 2026", "17 August 2026")}
${ANSWER(
      `<strong>Oversized describes the lens and the look. Wide-fit describes the distance across your face.</strong> A frame can carry huge lenses and still measure 140 mm from hinge to hinge — which is exactly why oversized frames keep pinching wide faces. Measure temple-to-temple first, then choose the style. The two words control different dimensions.`,
    )}

<figure style="margin:0 0 28px;">
  <img src="/__l5e/assets-v1/5552e04f-7dae-4c80-af3a-32577d75b965/standard-vs-wide-comparison.png" alt="Side-by-side comparison of a standard 140 mm front-width frame pinching a wide face against a 158 mm Woolet frame sitting flush at the temples" width="1200" height="675" loading="eager" fetchpriority="high" decoding="async" style="width:100%;height:auto;border-radius:6px;display:block;" />
  <figcaption style="font-size:0.72rem;opacity:0.55;text-align:center;margin-top:8px;">A standard ~140 mm front versus a 158 mm wide fit on the same face. Lens size is unchanged — only the front width moves.</figcaption>
</figure>

<p>Search "oversized blue light glasses" and you get a wall of big-lens frames photographed on small faces. That is a style category, and it is a perfectly good thing to want: a large lens reads as deliberate, softens a strong brow, and gives a screen-facing frame some presence. Nothing about that description tells you whether the frame will fit.</p>


<p>The confusion is costly for one specific group — people whose faces measure more than 155 mm across. They buy the biggest frame on the page, it arrives, and it still leaves two red marks in front of the ears. Below is the distinction, in millimetres.</p>

<h2>Oversized means big lenses. Wide-fit means a big front.</h2>

<div style="overflow-x:auto;margin:24px 0;">
<table style="width:100%;border-collapse:collapse;font-family:'Barlow',sans-serif;font-size:14px;">
  <thead>
    <tr style="background:#0f0f0f;color:#f0ece4;">
      <th style="${TH}">Oversized controls</th>
      <th style="${TH}">Wide-fit controls</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #E8E4DC;">
      <td style="${TD}"><strong>Lens width</strong> — how far each lens runs horizontally, typically 52–58 mm when a frame is called oversized.</td>
      <td style="${TD}"><strong>Front width</strong> — hinge to hinge across the whole frame. The only number that decides whether the frame spans your face.</td>
    </tr>
    <tr style="border-bottom:1px solid #E8E4DC;background:#FAF7F0;">
      <td style="${TD}"><strong>Lens height</strong> — the vertical drop, which is what makes a frame look big in photographs.</td>
      <td style="${TD}"><strong>Bridge width</strong> — the gap between the lenses. A wide nose needs 21–22 mm; standard bridges stop near 18 mm.</td>
    </tr>
    <tr>
      <td style="${TD}"><strong>Rim thickness and visual mass</strong> — styling, not geometry.</td>
      <td style="${TD}"><strong>Temple length</strong> — how far the arms reach before they turn down. Woolet runs 148 mm at an 11° drop.</td>
    </tr>
  </tbody>
</table>
</div>

<p>Neither list overlaps. That is the whole point. A brand can enlarge every lens dimension and leave the front width untouched, because the front is set by the acetate block, the rim geometry and the hinge placement — none of which change when the lens gets taller.</p>

<h2>How to tell which one you need</h2>

<p>Three steps, about a minute:</p>

<ol>
<li><strong>Measure temple-to-temple.</strong> Straight line across your face at the widest point, just in front of your ears — not around your head. A credit card is 85.6 mm wide and makes a usable ruler; the method is in <a href="/en/blog/how-to-measure-face-width-for-glasses" style="color:#A07A2A;">how to measure your face width</a>.</li>
<li><strong>Compare it with the frame's front width</strong>, not its lens width. If the brand publishes only 54□18-145, the front is roughly 54 × 2 + 18 + 6 ≈ 132 mm.</li>
<li><strong>Decide.</strong> Under 150 mm, you can shop mainstream and pick oversized purely for the look. Above 155 mm, front width is the constraint and style comes second.</li>
</ol>

<p>If step one puts you above 155 mm, the rest of the catalogue problem is described in <a href="/en/blog/extra-wide-glasses-158mm" style="color:#A07A2A;">extra-wide glasses at 158 mm</a>.</p>

<h2>Where oversized blue-light frames stop</h2>

<p>Most frames marketed as oversized sit somewhere in the 130–145 mm front-width band as listed by the brands — where the number is listed at all, which is the recurring problem. Lens size is advertised; front width usually is not. Woolet publishes both, because on a wide face the second number is the one that decides comfort.</p>

<div style="overflow-x:auto;margin:24px 0;">
<table style="width:100%;border-collapse:collapse;font-family:'Barlow',sans-serif;font-size:14px;">
  <thead>
    <tr style="background:#0f0f0f;color:#f0ece4;">
      <th style="${TH}" scope="col">Spec</th>
      <th style="${TH}" scope="col">Woolet 007 Round</th>
      <th style="${TH}" scope="col">Woolet 009 Soft Square</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #E8E4DC;">
      <th style="${TD}" scope="row">Front width</th>
      <td style="${TD}">158 mm</td>
      <td style="${TD}">158 mm</td>
    </tr>
    <tr style="border-bottom:1px solid #E8E4DC;background:#FAF7F0;">
      <th style="${TD}" scope="row">Lens width × height</th>
      <td style="${TD}">52 × 52 mm</td>
      <td style="${TD}">54 × 50 mm</td>
    </tr>
    <tr style="border-bottom:1px solid #E8E4DC;">
      <th style="${TD}" scope="row">Bridge (keyhole)</th>
      <td style="${TD}">21 mm</td>
      <td style="${TD}">22 mm</td>
    </tr>
    <tr style="border-bottom:1px solid #E8E4DC;background:#FAF7F0;">
      <th style="${TD}" scope="row">Temple length</th>
      <td style="${TD}">148 mm at 11°</td>
      <td style="${TD}">148 mm at 11°</td>
    </tr>
    <tr>
      <th style="${TD}" scope="row">Fit range</th>
      <td style="${TD}">155–161 mm (bespoke 145–162 mm)</td>
      <td style="${TD}">155–161 mm (bespoke 145–162 mm)</td>
    </tr>
  </tbody>
</table>
</div>

<p>Both are cut from Mazzucchelli acetate from Milan and hand made in EU. Blue-light filtering is a lens option rather than a separate product, which is why the same two frames appear under <a href="/en/collections/blue-light-glasses-for-wide-faces" style="color:#A07A2A;">blue light glasses for wide faces</a>.</p>

<h2>Oversized square blue-light glasses</h2>

<p>If the shape you want is square, the <a href="/en/products/009" style="color:#A07A2A;">Woolet 009 Soft Square</a> is the one that is oversized and wide at the same time: 54 mm lens width for the look, 158 mm front width for the fit, softened corners so a strong jaw is not doubled by a hard rectangle. The 50 mm lens height keeps a square frame from dominating a long face, and the 22 mm keyhole bridge spreads weight across a broader nasal base instead of two pressure points.</p>

<figure style="margin:24px 0;">
  <img src="/images/woolet-009-square-glasses-wide-face.webp" alt="Woolet 009 Soft Square acetate frame for wide faces — 158 mm front width, 54 × 50 mm lenses, 22 mm keyhole bridge, 148 mm temples, shown front-on and in profile" width="1200" height="630" loading="lazy" decoding="async" style="width:100%;height:auto;border-radius:6px;display:block;" />
  <figcaption style="font-size:0.72rem;opacity:0.55;text-align:center;margin-top:8px;">Woolet 009 Soft Square — 158 mm front, 54 × 50 mm lens, 22 mm keyhole bridge. Oversized look, wide-fit geometry.</figcaption>
</figure>

<p>For a rounder shape at the same width, the 007 runs 52 × 52 mm on the same 158 mm front.</p>

<figure style="margin:24px 0;">
  <img src="/images/woolet-007-round-glasses-wide-face.webp" alt="Woolet 007 Round acetate frame for wide faces — 158 mm front width, 52 × 52 mm lenses, 21 mm keyhole bridge, Mazzucchelli acetate in tortoiseshell" width="1200" height="533" loading="lazy" decoding="async" style="width:100%;height:auto;border-radius:6px;display:block;" />
  <figcaption style="font-size:0.72rem;opacity:0.55;text-align:center;margin-top:8px;">Woolet 007 Round — same 158 mm front, 52 × 52 mm lens, 21 mm keyhole bridge. Hand made in EU from Mazzucchelli acetate.</figcaption>
</figure>


<h2>Does the blue-light filter matter here?</h2>

<p>Honestly: probably less than the marketing suggests. A 2023 Cochrane systematic review of randomised trials concluded that blue-light filtering lenses probably make no measurable difference to eye strain, visual performance or sleep quality compared with standard lenses — <a href="https://www.cochrane.org/CD013244/EYES_blue-light-filtering-spectacles-lenses-eye-health-and-sleep-quality" target="_blank" rel="noopener noreferrer" style="color:#A07A2A;">read the review</a>.</p>

<p>So we treat it as what it is: an optional coating, a preference, not a medical device. The claim we do make is the measurement. A frame that spans your face is the difference between wearing it for eight hours and taking it off at three.</p>

${FITLENS_CTA(
      "Stop guessing from lens numbers. FitLens reads your temple-to-temple and bridge width from a phone photo in about twenty seconds, then tells you whether 158 mm is your size or bespoke is.",
      "Measure with FitLens",
    )}

<h2>FAQ</h2>

<h3>What is the difference between oversized and wide-fit glasses?</h3>
<p>Oversized refers to lens size — tall, wide lenses that create a large visual footprint. Wide-fit refers to the frame's total front width, hinge to hinge, plus bridge and temple length. A frame can be oversized and narrow at once: big lenses on a 140 mm front. Only front width decides whether it spans your face.</p>

<h3>Are oversized blue light glasses good for a wide face?</h3>
<p>Only if the front width is also large. Most oversized frames sit around 130–145 mm front width as listed by the brands, under the 155 mm+ a wide face needs. Above 155 mm temple-to-temple, the lenses can be as big as you like and the frame will still press on your temples.</p>

<h3>How do I measure whether I need a wide fit?</h3>
<p>Measure temple-to-temple: the straight-line distance across your face at its widest point, just in front of your ears. Under 145 mm is standard, 145–155 mm is the upper end of mainstream, above 155 mm is outside most catalogues. Woolet's front width is 158 mm; bespoke covers 145–162 mm.</p>

<h3>What size are oversized square blue light glasses?</h3>
<p>There is no standard. The label gets applied from roughly 52 mm lens width upward, with front widths that vary and are often unpublished. The Woolet 009 Soft Square is 158 mm across the front, 54 mm lens width, 22 mm keyhole bridge, 148 mm temples, with blue-light filtering offered as a lens option.</p>

<h3>Do blue light glasses actually do anything?</h3>
<p>A 2023 Cochrane review found blue-light filtering lenses probably make no measurable difference to eye strain, visual performance or sleep quality versus standard lenses. We treat the filter as an optional coating and a matter of preference — not a health product. The millimetres are the part we stand behind.</p>

<h2>Related articles</h2>
<ul>
<li><a href="/en/collections/blue-light-glasses-for-wide-faces">Blue light glasses for wide faces</a> — the 158 mm fit, filter optional.</li>
<li><a href="/en/blog/how-to-measure-face-width-for-glasses">How to measure your face width for glasses</a> — the one number that decides this.</li>
<li><a href="/en/blog/extra-wide-glasses-158mm">Extra-wide glasses at 158 mm</a> — what exists past the end of the size chart.</li>
</ul>
`,
  },
];


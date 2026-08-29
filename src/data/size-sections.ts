/**
 * Long-form, per-width unique copy for the /en/size/* landing cluster.
 *
 * Purpose: each numeric size page must carry substantially unique prose —
 * not one template with a swapped number. Every entry below is written for
 * its own millimetre band: who it fits, how the 158 mm signature behaves on
 * that face, when bespoke is the honest answer, and what to avoid.
 *
 * Data-accuracy rules (do not violate):
 *   - Signature front width 158 mm, designed fit range 155–161 mm.
 *   - Bespoke 145–172 mm. We never claim 165 mm.
 *   - Material: Mazzucchelli acetate from Milan. Manufacturing: hand made in EU.
 *   - Head-circumference figures are stated as approximate correlations, never
 *     as measured guarantees.
 */

export interface SizeSection {
  h2: string;
  /** Paragraphs of body copy. Plain text; rendered as <p>. */
  body: string[];
  /** Optional simple two-column table rendered under the paragraphs. */
  table?: { head: [string, string]; rows: [string, string][] };
}

export const SIZE_SECTIONS: Record<string, SizeSection[]> = {
  "145mm": [
    {
      h2: "Who a 145 mm face width actually is",
      body: [
        "145 mm temple-to-temple is the hinge point of the whole eyewear market. It is the number where mainstream catalogues stop describing frames as regular and start calling them wide, XL or extended fit. In practice a 145 mm face is not a wide face by our definition — it is a large-average face that the industry serves badly rather than not at all.",
        "A 145 mm face width tends to travel with a head circumference around 56–57 cm and a nose bridge in the 18–20 mm band. That combination is why so many 145 mm wearers report that frames technically close but feel tight after four hours: the front width is borderline and the temple arms, usually 140–145 mm, are the part that actually fails.",
      ],
    },
    {
      h2: "Does the 158 mm signature fit a 145 mm face?",
      body: [
        "No, and we would rather say so than take the order. The signature 007 and 009 are cut at a 158 mm front for the 155–161 mm band. Put that on a 145 mm face and you carry 13 mm of surplus width: the frame front overhangs the sides of the head, the temple arms splay outward before they reach the ears, and the optical centres of the lenses sit outside your pupillary distance.",
        "That last point matters more than the aesthetics. Once the lens centres drift wide of your pupils, a prescription starts inducing prism — the reason a too-wide frame can give you eye strain that no adjustment fixes.",
      ],
      table: {
        head: ["Route at 145 mm", "Verdict"],
        rows: [
          ["Mainstream extended fit (142–148 mm)", "Workable. Cheapest honest answer."],
          ["Woolet signature 158 mm", "Too wide by 13 mm. Do not buy."],
          ["Woolet bespoke at 145 mm", "Exact fit. Floor of our range."],
        ],
      },
    },
    {
      h2: "When bespoke is worth it at this width",
      body: [
        "145 mm is the floor of our bespoke range, so the frame can be cut to your number rather than rounded to the nearest catalogue size. The reason to pay for that at 145 mm is rarely front width alone — it is usually the second measurement. If your bridge runs 21 mm or more, or your temple arms need to clear a 57 cm head, mainstream 145 mm frames will still fail you even though the front width is nominally right.",
        "Bespoke uses the same Mazzucchelli acetate from Milan and the same hand finishing in the EU as the signature frames. Four shapes, sixty colour and size combinations, built to your millimetre.",
      ],
    },
    {
      h2: "What to skip at 145 mm",
      body: [
        "Skip anything marketed as XXL or big-head specific — those frames are usually built at 155 mm and up and will swamp you. Skip metal frames sold as adjustable at this width; bending a temple changes the angle, not the front. And skip buying by lens width alone: a 58 mm lens on a narrow bridge can still produce a 142 mm front.",
      ],
    },
  ],

  "150mm": [
    {
      h2: "Who a 150 mm face width actually is",
      body: [
        "150 mm is the most under-served measurement in eyewear. It sits above the reliable mainstream ceiling of roughly 145–148 mm, and below the 155 mm floor where specialist wide-face brands begin. There is a genuine gap in the market at exactly this number, which is why 150 mm shoppers spend the most time searching and return the most frames.",
        "A 150 mm face width commonly pairs with a head circumference near 57–58 cm and a bridge around 19–21 mm. Wearers at this width usually describe the same two symptoms: a red mark just in front of the ears by mid-afternoon, and frames that creep down the nose because the arms are gripping instead of resting.",
      ],
    },
    {
      h2: "Does the 158 mm signature fit a 150 mm face?",
      body: [
        "Not properly. Eight millimetres of surplus front width is roughly a full size in optical terms. The frame will stay on your face, which is exactly why people convince themselves it works, but the temples will sit proud of your head and the lens centres will run wide of your pupillary distance.",
        "Our designed tolerance is 3 mm of ease at the temples across the 155–161 mm band. At 150 mm you are outside that tolerance by more than the tolerance itself.",
      ],
      table: {
        head: ["Measurement at 150 mm", "What it means"],
        rows: [
          ["Face width 150 mm", "Above mainstream, below signature"],
          ["Signature front 158 mm", "8 mm too wide"],
          ["Bespoke front 150 mm", "Exact, cut to measure"],
          ["Typical bridge", "19–21 mm"],
        ],
      },
    },
    {
      h2: "Why bespoke is the honest route here",
      body: [
        "150 mm sits comfortably inside our 145–172 mm bespoke range, near the middle of the lower half. Both signature shapes scale cleanly to it: the 007 round keeps its keyhole bridge geometry, the 009 soft-square keeps its flatter top line. What changes is the front width, the distance between the hinges and the temple length that follows from it.",
        "If you have already tried three or four pairs of extended-fit frames and sent them all back, the arithmetic on bespoke is simpler than it looks. You are not paying for luxury, you are paying to stop guessing.",
      ],
    },
    {
      h2: "What to skip at 150 mm",
      body: [
        "Skip frames that quote only lens and bridge size without a total front width — at 150 mm the total is the only number that decides the outcome. Skip spring hinges as a fix; they mask a too-narrow front by adding tension, which is precisely what causes temple pain. And skip 158 mm signature frames because they are in stock and bespoke has a lead time.",
      ],
    },
  ],

  "152mm": [
    {
      h2: "Who a 152 mm face width actually is",
      body: [
        "152 mm is the near-miss width. It is close enough to our 155 mm signature floor that people talk themselves into the standard frame, and far enough away that it shows. Most wearers at this measurement have already worked out that mainstream sizing fails them; the open question is whether they need a specialist frame or a made-to-measure one.",
        "The typical profile at 152 mm is a head circumference around 58 cm, a bridge between 20 and 22 mm and a strong temporal ridge — the bone just behind the eye socket that a too-narrow frame presses against. That ridge is why 152 mm faces feel frames rather than merely see them.",
      ],
    },
    {
      h2: "Does the 158 mm signature fit a 152 mm face?",
      body: [
        "It will sit on your face, but it is 6 mm oversized and it looks it. Six millimetres reads as visible temple overhang from the front and a slight forward pitch from the side, because the arms have to travel further before they find the ear.",
        "There is one exception worth stating honestly. If you measure 152 mm but carry a 59 cm head circumference — a narrow face on a deep skull — the signature 158 mm can work, because the extra front width buys the arms the clearance they need. That is a minority case and FitLens will flag it rather than you guessing.",
      ],
      table: {
        head: ["Scenario at 152 mm", "Recommendation"],
        rows: [
          ["152 mm face, head under 58 cm", "Bespoke at 152 mm"],
          ["152 mm face, head 59 cm+", "Signature 158 mm may work"],
          ["152 mm face, bridge 22 mm+", "Bespoke — bridge is the constraint"],
        ],
      },
    },
    {
      h2: "The bespoke case at 152 mm",
      body: [
        "152 mm is well inside the 145–172 mm bespoke range and is one of the widths we are asked for most. Because it sits only 6 mm below signature, the frame keeps the same visual proportions — the same lens depth, the same acetate thickness at the rim, the same 11° temple drop — while losing the overhang.",
        "Same material throughout: Mazzucchelli acetate from Milan, hand made in the EU, hand polished. Bespoke changes the dimensions, not the build.",
      ],
    },
    {
      h2: "What to skip at 152 mm",
      body: [
        "Skip the advice to size up and get them adjusted. An optician can heat and bend acetate temples, which changes wrap angle and tip length; nobody can widen a moulded front. Skip oversized round frames with a narrow front — the lens diameter creates an illusion of width that your temples will not share.",
      ],
    },
  ],

  "155mm": [
    {
      h2: "Who a 155 mm face width actually is",
      body: [
        "155 mm is the floor of the signature range and the point at which the mainstream market stops being an option at all. Nothing sold as extended fit reaches you reliably here. A 155 mm face typically comes with a head circumference in the 58–59 cm region and a bridge of 20–22 mm, and it is the width at which people usually stop shopping by style and start shopping by number.",
        "If you have arrived at this page after measuring for the first time, the useful reframe is this: 155 mm is not an outlier measurement. It is a normal measurement that the catalogue never covered.",
      ],
    },
    {
      h2: "Does the 158 mm signature fit a 155 mm face?",
      body: [
        "Yes. This is the width the frame was engineered against. The 158 mm front gives you 3 mm of designed ease across the temples, which is the correct tolerance for an acetate front at this scale — enough for the arms to clear the temporal ridge without contact, not so much that the frame slides.",
        "Both shapes work at 155 mm. The 007 round, with its 21 mm keyhole bridge, distributes weight higher on the nose and suits a stronger jaw. The 009 soft-square runs a 22 mm bridge and a flatter top line, which holds structure on a fuller face.",
      ],
      table: {
        head: ["Dimension at 155 mm", "Signature answer"],
        rows: [
          ["Front width", "158 mm — 3 mm designed ease"],
          ["Bridge", "21 mm (007) / 22 mm (009)"],
          ["Temple", "148 mm at 11° drop"],
          ["Bespoke needed?", "No"],
        ],
      },
    },
    {
      h2: "When bespoke still makes sense",
      body: [
        "You do not need bespoke at 155 mm, and we will not pretend otherwise to upsell you. There are two real reasons to choose it anyway. The first is bridge: if you measure above 22 mm across the nose, the signature bridge will sit lower than intended regardless of the front width being right. The second is temple length: a 60 cm head circumference on a 155 mm face needs arms longer than the standard 148 mm.",
        "Otherwise, order the signature. It ships from the first production batch instead of waiting six to eight weeks behind it.",
      ],
    },
    {
      h2: "What to skip at 155 mm",
      body: [
        "Skip anything under a 152 mm front, however generous the lens looks in the photograph. Skip semi-rimless and rimless constructions at this width — without a full acetate rim there is nothing holding tension across a 155 mm span, and the frame will drift out of alignment within weeks.",
      ],
    },
  ],

  "158mm": [
    {
      h2: "Who a 158 mm face width actually is",
      body: [
        "158 mm is the number the entire brand is engineered around. It is not a bespoke variant or a large option inside a broader catalogue — both signature shapes are cut at a 158 mm front as the canonical size, and everything else on this site is described in relation to it. A 158 mm face usually carries a head circumference near 59–60 cm and a bridge of 21–22 mm.",
        "For context: peer-reviewed anthropometric work puts the average adult male face width around 142 mm. 158 mm is roughly three standard deviations out. That is not a rare face — it is a common face that sits outside the range the industry tooled for.",
      ],
    },
    {
      h2: "Why 158 mm is the signature and not a special order",
      body: [
        "Building one width properly is a different exercise from scaling a small frame up. At 158 mm the acetate front has to hold tension across a longer span, so the rim runs thicker at the hinge and the barrel count goes to five rather than three. The temple drop is set at 11°, which is steeper than a standard frame, because a wider face nearly always means a deeper skull and the arms have further to travel before the ear.",
        "The lens geometry follows the same logic. The 007 round is cut 52 × 52 mm and the 009 soft-square 54 × 50 mm, sized so that the optical centres land inside the pupillary distance range that comes with a 158 mm face rather than outside it.",
      ],
      table: {
        head: ["Spec", "007 Round / 009 Soft Square"],
        rows: [
          ["Front width", "158 mm / 158 mm"],
          ["Bridge", "21 mm keyhole / 22 mm"],
          ["Lens", "52 × 52 mm / 54 × 50 mm"],
          ["Temple", "148 mm at 11° drop"],
          ["Material", "Mazzucchelli acetate, Milan"],
        ],
      },
    },
    {
      h2: "Do you need bespoke at 158 mm?",
      body: [
        "No. 158 mm is the middle of the 155–161 mm designed range, which means the signature frame is a direct match and there is nothing bespoke can improve about the front width. Bespoke exists for the widths either side of the range, from 145 mm up to 162 mm, and for wearers whose bridge or temple length falls outside the standard pairing.",
        "If your face is 158 mm and your bridge is 21 or 22 mm, order the signature 007 or 009 and skip the scan queue entirely.",
      ],
    },
    {
      h2: "What to skip at 158 mm",
      body: [
        "Skip every frame that describes itself as wide without publishing a total front width. Skip TR90 and injection-moulded nylon at this scale — the material flexes under the leverage a 158 mm span generates and the fit drifts. And skip the assumption that a bigger lens compensates for a narrower front; it does not, it just moves the problem to your temples.",
      ],
    },
  ],

  "160mm": [
    {
      h2: "Who a 160 mm face width actually is",
      body: [
        "160 mm sits in the upper half of the signature band and is the width at which the wide-face problem becomes non-negotiable. There is no mainstream product at this measurement and there is no adjustment that produces one. A 160 mm face typically comes with a head circumference around 60–61 cm and a bridge in the 21–23 mm range.",
        "Search interest at this specific number has grown faster than any other width we track, which matches what we see in scans: people are increasingly measuring first and shopping second, and 160 mm is a common result once they do.",
      ],
    },
    {
      h2: "Does the 158 mm signature fit a 160 mm face?",
      body: [
        "Yes, and it is the fit we would recommend before bespoke. At 160 mm you are 2 mm inside the designed 155–161 mm range, sitting toward the upper end. In practice that means the frame reads as close-fitting rather than loose: the arms make light contact just ahead of the ear and stay there.",
        "Some wearers at 160 mm prefer that contact and some prefer air. If you want the frame to sit off the temple entirely, bespoke at 160 mm gives you a millimetre-exact front and the ease moves into the temple angle instead.",
      ],
      table: {
        head: ["Option at 160 mm", "Trade-off"],
        rows: [
          ["Signature 158 mm", "In range, ships first batch, light temple contact"],
          ["Bespoke 160 mm", "Exact front, 6–8 week lead time"],
          ["Bespoke 160 mm + long temple", "For head circumference above 61 cm"],
        ],
      },
    },
    {
      h2: "The temple question at 160 mm",
      body: [
        "Front width is not usually what fails at this measurement — temple length is. The standard 148 mm arm at an 11° drop is correct for most 155–161 mm faces, but a 160 mm face on a deep skull can need 152 mm or more to hook the ear without the tip pressing behind it. That is the single most common reason we route a 160 mm order to bespoke.",
        "FitLens reports both numbers from one phone photo, so you do not have to work out which of the two is the constraint.",
      ],
    },
    {
      h2: "What to skip at 160 mm",
      body: [
        "Skip vintage and heritage acetate frames, however wide they look — almost nothing from that era was cut past 150 mm. Skip clip-on and magnetic sun attachments at this width; the added mass at the front amplifies slippage on an already long lever. And skip buying two pairs to hedge, because at 160 mm they will both be wrong in the same direction.",
      ],
    },
  ],

  "162mm": [
    {
      h2: "Who a 162 mm face width actually is",
      body: [
        "162 mm is the ceiling of everything we build. It is one millimetre above the top of the signature range and the widest front we can produce in acetate without compromising the structure at the hinge. A 162 mm face generally carries a head circumference of 61–62 cm and a bridge of 22–24 mm — dimensions where the bridge often becomes the binding constraint before the front width does.",
        "If you measure 162 mm you are in the top fraction of a percent of adult face widths. There is no shortcut available to you in retail, and there is no point pretending otherwise.",
      ],
    },
    {
      h2: "Why the signature 158 mm falls short here",
      body: [
        "The signature front is 4 mm narrower than your face. That is the wrong direction of error: a frame that is too wide looks oversized, a frame that is too narrow hurts. At 162 mm the arms would grip the temporal ridge from the moment you put them on, and acetate under sustained outward load takes a set — within a few months the frame no longer returns to its original geometry.",
        "So the answer at 162 mm is bespoke, not the standard frame worn optimistically.",
      ],
      table: {
        head: ["At 162 mm", "Outcome"],
        rows: [
          ["Signature 158 mm", "4 mm too narrow — temple pressure"],
          ["Bespoke 162 mm", "Correct. Our maximum width."],
          ["Above 162 mm", "We do not build it"],
        ],
      },
    },
    {
      h2: "What bespoke gives you at the top of the range",
      body: [
        "A 162 mm bespoke front is built with the hinge plates set further out and the rim carrying additional material at the barrel, so the frame holds its span without relying on tension. Bridge is specified separately, which matters here: at 162 mm a 24 mm bridge is common and pairing it with a standard 21 mm would undo the benefit of the wider front.",
        "Four shapes, sixty colour and size combinations, Mazzucchelli acetate from Milan, hand made in the EU. Lead time is six to eight weeks behind the standard batch.",
      ],
    },
    {
      h2: "What to skip at 162 mm",
      body: [
        "Skip any brand that offers to widen a stock frame for you. Heat-forming an acetate front past its moulded width thins the material at the bridge and the frame fails there later. Skip sizing by lens width entirely at this measurement — only total front width and bridge matter now.",
      ],
    },
  ],

  "165mm": [
    {
      h2: "Why this page exists even though we cannot help",
      body: [
        "We do not build 165 mm frames. Our bespoke ceiling is 162 mm, and we are not going to invent a product to keep you on the page. What we can do is tell you two useful things: how to be sure the number is real, and what the market actually contains above 162 mm.",
        "The first matters more than it sounds. A large share of people who arrive here convinced they need 165 mm measure between 156 and 162 mm once they measure correctly, because most self-measurements are taken at the cheekbone rather than the temple, or on an angle, or with the ruler tilted away from the face.",
      ],
    },
    {
      h2: "Re-measure before you accept 165 mm",
      body: [
        "Stand square to a mirror, look straight ahead, and hold the ruler flat and level at eye level across the widest point of the head — usually just above and in front of the ears, not at the cheeks. Read temple to temple. A credit card is 85.6 mm by ISO standard and makes a useful calibration reference if you would rather photograph than measure.",
        "FitLens does the same arithmetic from a single phone photo in about twenty seconds and will tell you plainly whether you land inside 162 mm.",
      ],
      table: {
        head: ["Re-measured result", "Next step"],
        rows: [
          ["155–161 mm", "Signature 158 mm fits"],
          ["162 mm", "Bespoke — our maximum"],
          ["163 mm and above", "Outside our range"],
        ],
      },
    },
    {
      h2: "Why almost nobody builds past 162 mm",
      body: [
        "It is a geometry problem before it is a commercial one. A single-piece acetate front has to carry the load of both temples across its span, and past roughly 162 mm the material either has to thicken to the point where the frame becomes heavy on the nose, or it flexes and the alignment drifts. Metal and titanium constructions can go wider because they carry load differently, which is why the handful of makers working above 165 mm are almost all metal.",
        "If you genuinely measure above 162 mm, a made-to-order titanium frame from a specialist metal workshop is the honest recommendation, and it is not one we can fulfil.",
      ],
    },
    {
      h2: "What to skip if you are above our range",
      body: [
        "Skip anyone selling 165 mm acetate off the shelf without publishing hinge and rim specifications. Skip sizing up in lens width to compensate. And skip ordering from us on the assumption that a 162 mm bespoke will stretch — it will not, and we would rather lose the order than take a return.",
      ],
    },
  ],
};

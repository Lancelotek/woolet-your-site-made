/**
 * Long-form, per-length unique copy for the /en/temple/* landing cluster.
 * Signature temple length 150 mm; bespoke temple range 145–155 mm.
 * Front width context: signature 158 mm, bespoke 145–162 mm.
 * Material: Mazzucchelli acetate from Milan. Hand made in EU.
 */

export interface ClusterSection {
  h2: string;
  body: string[];
  table?: { head: [string, string]; rows: [string, string][] };
}

export const TEMPLE_SECTIONS: Record<string, ClusterSection[]> = {
  "140mm": [
    {
      h2: "Who wears a 140 mm temple",
      body: [
        "140 mm is the shortest arm in common production and it belongs to a specific head: a shallow skull, an ear set relatively far forward, and a front width in the 138–145 mm range. It is the default on children's and small adult frames, and it is what most budget catalogues fit by default because it is the cheapest arm to tool.",
        "If 140 mm genuinely measures right for you, mainstream eyewear is your market and this is good news rather than bad. Nothing on this site is built for you, and we would rather say that on the first screen.",
      ],
    },
    {
      h2: "Why a 140 mm arm fails on a wide front",
      body: [
        "Temple length is not an independent measurement. It has to carry the frame from the hinge, around the temporal ridge, to the ear — and on a 158 mm front the hinges start 8 to 18 mm further apart than on a mainstream frame, so the arm has further to travel before it turns down. A 140 mm arm on a wide front runs out of length before the bend, which pushes the front forward on the nose and drops the optical centres below the pupils.",
        "The symptom people describe is glasses sliding, and the instinct is to tighten the arms. Tightening a short arm on a wide head is what produces the pressure headache behind the ear.",
      ],
      table: {
        head: ["Temple length", "Suits"],
        rows: [
          ["140 mm", "Shallow head, 138–145 mm front"],
          ["145 mm", "Bespoke floor — average depth"],
          ["150 mm", "Woolet signature, 155–161 mm faces"],
          ["152–155 mm", "Bespoke long — deep skull"],
        ],
      },
    },
    {
      h2: "What to do instead",
      body: [
        "Measure your face width before you shop by temple length at all. If you land under 150 mm temple-to-temple, a mainstream 140–148 mm frame with 140 mm arms is a reasonable and inexpensive answer. If you land above 155 mm, the arm length was never the real problem — the front was.",
      ],
    },
  ],

  "145mm": [
    {
      h2: "Who wears a 145 mm temple",
      body: [
        "145 mm is the floor of what we build and the crossover point between mainstream and specialist arm lengths. It suits a head of average depth carrying a wider-than-average face — the combination that produces the complaint of frames that fit across the front but press behind the ear.",
        "It is also the length we specify most often on bespoke frames ordered at the narrow end of our range, from 145 to 152 mm front width, where a 150 mm arm would overshoot the ear and leave the tip floating.",
      ],
    },
    {
      h2: "How 145 mm pairs with front width",
      body: [
        "Arm and front are specified together. A 145 mm temple on a 158 mm signature front generally leaves the tip landing just short of the mastoid bone, which means the frame relies on nose grip alone and slides forward through the day. Paired with a 148–152 mm bespoke front, the same 145 mm arm is correct.",
        "This is why we ask for both numbers before building. Getting one right and the other wrong produces a frame that fails in a way that is hard to diagnose from the mirror.",
      ],
      table: {
        head: ["Front width", "Temple length we specify"],
        rows: [
          ["145–152 mm bespoke", "145 mm"],
          ["155–161 mm signature", "150 mm"],
          ["158–162 mm, deep skull", "152–155 mm"],
        ],
      },
    },
    {
      h2: "Ordering 145 mm arms",
      body: [
        "145 mm is available on bespoke only — the signature 007 and 009 ship at 150 mm. Same Mazzucchelli acetate from Milan, same five-barrel hinge, same hand finishing in the EU; the arm is cut and bent to the shorter length rather than trimmed from a longer one, so the tip curve stays where it should be.",
      ],
    },
  ],

  "150mm": [
    {
      h2: "Why 150 mm is the signature arm",
      body: [
        "150 mm is the length that pairs with a 158 mm front, and the pairing is the point. Wide faces almost always sit on deeper skulls, so the arm has to clear the temporal ridge without contact and still reach far enough past the ear to hold. At 150 mm, on both the 007 and the 009, the tip bend lands on the mastoid rather than on the top of the ear.",
        "The arm also runs an 11° drop, steeper than a standard frame. That angle is what stops a long arm from sitting high on the ear and tilting the lens plane away from the face.",
      ],
    },
    {
      h2: "Do you need 150 mm arms?",
      body: [
        "If your face measures 155–161 mm temple-to-temple and your head circumference is roughly 58–60 cm, yes — 150 mm is the fit and no bespoke specification will improve it. Below 155 mm face width, 150 mm arms usually overshoot. Above 61 cm head circumference, they usually come up short and 152–155 mm is the answer.",
        "The quickest way to know is to measure both numbers at once. FitLens returns face width and temple length from one phone photo in about twenty seconds.",
      ],
      table: {
        head: ["Your measurement", "Verdict on 150 mm arms"],
        rows: [
          ["Face 155–161 mm", "Correct — signature fit"],
          ["Head circumference 58–60 cm", "Correct"],
          ["Head circumference 61 cm+", "Consider bespoke 152–155 mm"],
          ["Face under 152 mm", "Too long"],
        ],
      },
    },
    {
      h2: "What to skip",
      body: [
        "Skip frames that publish only a lens–bridge–temple string without a total front width; a 150 mm arm on a 142 mm front is a mainstream frame wearing a specialist number. Skip cable and wire temples at this length — the leverage a long arm generates needs an acetate or full-metal arm to resist it.",
      ],
    },
  ],

  "152mm": [
    {
      h2: "Who needs a 152 mm temple",
      body: [
        "152 mm is the first genuinely long arm in our range and it exists for one profile: a signature-width face on an unusually deep skull. Head circumference around 61 cm, ears set well back, and a persistent complaint that even wide frames sit forward on the nose and leave the tips pressing rather than resting.",
        "Front width is right in this case; distance from hinge to ear is not. It is the most misdiagnosed fit problem we see, because the wearer assumes a frame that slides must be too wide.",
      ],
    },
    {
      h2: "How 152 mm changes the fit",
      body: [
        "Two extra millimetres over the signature 150 mm sounds trivial and is not. The arm reaches past the ear crest before it turns, which moves the bearing point from the top of the ear onto the bone behind it. Weight transfers off the nose, the front sits back where it belongs, and the optical centres return to the pupil line.",
        "We keep the 11° drop unchanged at this length. Lengthening the arm and steepening the angle at the same time overcorrects and lifts the lens away from the cheek.",
      ],
      table: {
        head: ["Symptom", "Whether 152 mm arms fix it"],
        rows: [
          ["Frame slides down the nose", "Usually yes"],
          ["Pressure on top of the ear", "Yes"],
          ["Pressure at the temples", "No — that is front width"],
          ["Lens sits too low", "Often yes"],
        ],
      },
    },
    {
      h2: "Ordering at 152 mm",
      body: [
        "152 mm is a bespoke specification and can be paired with any front width from 145 to 162 mm, though it is most often ordered with 158 and 160 mm fronts. Lead time is six to eight weeks behind the standard batch.",
      ],
    },
  ],

  "155mm": [
    {
      h2: "Who needs a 155 mm temple",
      body: [
        "155 mm is the longest arm we build and it is a genuine minority specification. It suits a head circumference above 62 cm, or an ear set far enough back that a 152 mm arm still lands on the ear crest rather than behind it. Most people who ask for 155 mm arms turn out to need 152 mm; a small number genuinely need this.",
        "It is also the arm we specify most often alongside 160 and 162 mm bespoke fronts, where the hinges start furthest apart and the arm has the greatest distance to cover.",
      ],
    },
    {
      h2: "The limits of a long arm",
      body: [
        "155 mm is our ceiling for a reason. Beyond that length an acetate arm behaves like a lever: small forces at the tip translate into large forces at the hinge, and the barrel eventually loosens no matter how many barrels it has. Our five-barrel hinge is specified to hold at 155 mm and we do not build past it.",
        "If a 155 mm arm still comes up short on your head, the honest answer is a made-to-order metal frame from a specialist workshop rather than a longer acetate one from us.",
      ],
      table: {
        head: ["Head circumference", "Temple length"],
        rows: [
          ["58–60 cm", "150 mm signature"],
          ["60–62 cm", "152 mm bespoke"],
          ["62 cm+", "155 mm bespoke — our maximum"],
        ],
      },
    },
    {
      h2: "What to skip at this length",
      body: [
        "Skip spring hinges. On a 155 mm arm the spring adds outward tension exactly where you least want it, and the extra mechanism is the first thing to fail under the leverage. Skip thin-profile temples too — an arm this long needs section depth to stay straight.",
      ],
    },
  ],
};

/**
 * Long-form, per-width unique copy for the /en/bridge/* landing cluster.
 * Signature bridges: 21 mm keyhole (007), 22 mm (009). Bespoke adjusts bridge
 * within the 145–162 mm front-width range.
 */
export const BRIDGE_SECTIONS: Record<string, ClusterSection[]> = {
  "18mm": [
    {
      h2: "Who an 18 mm bridge fits",
      body: [
        "18 mm is the mainstream default. It suits a narrow nasal root — the bone between the eyes, measured at the point where the pads or the acetate saddle would sit — and it is what the great majority of frames on the market ship with because it matches the average face the industry tooled for.",
        "An 18 mm bridge on a wide face is the second half of the fit problem. People solve the front width, order a 155 mm+ frame with a stock bridge, and find the frame perched high with the lenses too far from the eyes.",
      ],
    },
    {
      h2: "Why we do not build 18 mm",
      body: [
        "Bridge and front width are not independent. A wider face nearly always carries a wider nasal root, and putting an 18 mm saddle on a 158 mm front concentrates the entire weight of the frame on two small contact points at the top of the nose. That is what produces the red indentation marks and the frame that slides the moment your skin warms.",
        "Our narrowest is 21 mm on the 007 keyhole, which spreads the same load across a longer contact arc.",
      ],
      table: {
        head: ["Bridge width", "Nasal root it suits"],
        rows: [
          ["18 mm", "Narrow — mainstream default"],
          ["20 mm", "Average-to-wide"],
          ["21 mm", "Woolet 007 keyhole"],
          ["22 mm", "Woolet 009"],
          ["23–24 mm", "Bespoke"],
        ],
      },
    },
    {
      h2: "What to do if 18 mm is your measurement",
      body: [
        "Buy mainstream, and buy on bridge rather than on lens size. If your face width is under 150 mm as well, nothing about the wide-face category applies to you. If your face is wide but your bridge is genuinely 18 mm, bespoke can pair a narrow bridge with a wide front — that combination is unusual but we can build it.",
      ],
    },
  ],

  "19mm": [
    {
      h2: "Who a 19 mm bridge fits",
      body: [
        "19 mm is the upper edge of mainstream bridge sizing — the widest you will reliably find in a stock catalogue before you enter specialist territory. It suits a nasal root that is slightly broader than average without being wide, which is a very common combination on faces measuring 145–152 mm.",
        "It is the bridge width where the industry's sizing logic starts to break down, because a 19 mm bridge is usually only offered on frames with fronts of 140–148 mm. If your face is wider than that, the bridge you need exists but not on the frame you need.",
      ],
    },
    {
      h2: "19 mm against the Woolet range",
      body: [
        "We start at 21 mm, so a 19 mm measurement sits 2 mm below our narrowest signature bridge. In practice a 2 mm gap is small enough that the 007 keyhole often still works: the keyhole shape carries its contact lower on the sides of the nose than a saddle bridge does, which tolerates a slightly narrower root than the nominal number suggests.",
        "If you want it exact, bespoke can specify a 19 mm bridge on any front width from 145 to 162 mm.",
      ],
      table: {
        head: ["Your bridge", "Best route"],
        rows: [
          ["19 mm, face under 152 mm", "Mainstream frames"],
          ["19 mm, face 155–161 mm", "007 keyhole, or bespoke for exact"],
          ["19 mm, high nasal root", "Keyhole strongly preferred"],
        ],
      },
    },
    {
      h2: "Keyhole versus saddle at 19 mm",
      body: [
        "A saddle bridge rests across the top of the nose and needs the width to be right or it perches. A keyhole bridge clears the top of the nose entirely and bears on the flanks, which both spreads load and gives a couple of millimetres of tolerance. At 19 mm, on a wide frame, keyhole is the shape that behaves.",
      ],
    },
  ],

  "20mm": [
    {
      h2: "Who a 20 mm bridge fits",
      body: [
        "20 mm is the crossover measurement. It is wider than nearly everything in stock retail and one millimetre under our 007 keyhole, which makes it the single most common bridge measurement we see on wide-face scans that have never found a frame that works.",
        "A 20 mm nasal root usually travels with a face width of 152–158 mm and a bridge complaint rather than a temple complaint: the frame closes fine at the sides but sits too high, so the wearer looks through the lower third of the lens.",
      ],
    },
    {
      h2: "Does the 21 mm signature keyhole work at 20 mm?",
      body: [
        "Yes, in most cases. One millimetre of surplus on a keyhole bridge is inside the tolerance the shape is designed to absorb — the contact simply sits fractionally lower on the flanks of the nose, which is where you want the weight anyway. The 009's 22 mm bridge is a larger stretch at this measurement and tends to sit lower than intended.",
        "So at 20 mm the practical recommendation is the 007 round rather than the 009 soft-square, unless you want bespoke.",
      ],
      table: {
        head: ["Frame", "Fit at a 20 mm nasal root"],
        rows: [
          ["007 Round, 21 mm keyhole", "Recommended"],
          ["009 Soft Square, 22 mm", "Sits low — bespoke preferred"],
          ["Bespoke, 20 mm", "Exact"],
        ],
      },
    },
    {
      h2: "How to measure your bridge properly",
      body: [
        "Look straight into a mirror and find the narrowest point between your eyes, roughly level with the pupil centre. Measure across it in millimetres — that distance, not the width of the whole nose, is your bridge measurement. FitLens returns it alongside face width from a single phone photo.",
      ],
    },
  ],

  "21mm": [
    {
      h2: "Why 21 mm is the 007 keyhole",
      body: [
        "21 mm is the bridge the 007 round is built around, and the keyhole shape is inseparable from the number. A keyhole clears the crest of the nose and transfers load onto the flanks, which is the only way to carry a 158 mm acetate front without pads. At 21 mm the contact arc is long enough to spread the weight and short enough that the frame does not drift when you look down.",
        "It suits a nasal root measuring 20–22 mm, which is the range that comes with most 155–161 mm faces.",
      ],
    },
    {
      h2: "21 mm versus the 22 mm on the 009",
      body: [
        "The difference is not simply one millimetre of width. The 007's keyhole is cut higher and narrower at the crest, so it sits further up the nose and carries a round lens that needs the extra height. The 009's 22 mm bridge is a shallower saddle profile that pairs with the soft-square's flatter top line and lower lens height.",
        "If your nasal root is 20–21 mm, take the 007. At 22 mm or above, the 009 is the better mechanical match even before you consider which shape you prefer.",
      ],
      table: {
        head: ["Nasal root", "Frame"],
        rows: [
          ["20–21 mm", "007 Round, 21 mm keyhole"],
          ["22 mm", "009 Soft Square, 22 mm"],
          ["23–24 mm", "Bespoke"],
        ],
      },
    },
    {
      h2: "What a 21 mm bridge does not fix",
      body: [
        "A correct bridge will not rescue a frame that is too narrow across the front. If the arms press at the temples, the bridge is not the problem and widening it makes the frame heavier without moving the contact points. Diagnose front width first, bridge second, temple length third.",
      ],
    },
  ],

  "22mm": [
    {
      h2: "Who a 22 mm bridge fits",
      body: [
        "22 mm is a genuinely wide nasal root and it is the bridge the 009 soft-square is built at. It suits a face in the upper half of the signature range, typically 158–161 mm, where the nose is broad at the root as well as at the nostrils and a narrower bridge would perch rather than seat.",
        "Almost nothing in mainstream retail is offered at 22 mm. When a stock frame does list it, the front width is usually still 145 mm or under, which puts you back in the same trap from the other direction.",
      ],
    },
    {
      h2: "Saddle at 22 mm and why it works here",
      body: [
        "The 009 carries a shallower saddle profile rather than a keyhole. At 22 mm the root is wide enough that a saddle has real surface to bear on, which distributes the frame weight over a broader area than a keyhole can and keeps the lens height consistent — important on a soft-square where the top line is flat and any tilt is visible.",
        "It also pairs with the 009's 54 × 50 mm lens: a wider bridge pushes the lenses apart, and the lens geometry is cut to keep the optical centres inside the pupillary distance that comes with a 158 mm face.",
      ],
      table: {
        head: ["Spec", "009 Soft Square"],
        rows: [
          ["Bridge", "22 mm saddle"],
          ["Front width", "158 mm"],
          ["Lens", "54 × 50 mm"],
          ["Alternative at 22 mm", "Bespoke, any front 145–162 mm"],
        ],
      },
    },
    {
      h2: "When to go bespoke instead",
      body: [
        "If your bridge is 22 mm but your face measures outside 155–161 mm, the bridge is right and the front is not — that is a bespoke order. The same applies if you need a 22 mm bridge with a keyhole rather than a saddle profile, which we can cut but do not stock.",
      ],
    },
  ],

  "24mm": [
    {
      h2: "Who a 24 mm bridge fits",
      body: [
        "24 mm is the widest bridge we build and it is a bespoke specification only. It suits a very broad nasal root, usually paired with a face width at the top of our range — 160 to 162 mm — and it is the measurement where every stock frame on the market has already failed by a wide margin.",
        "At this width the bridge stops being a detail and becomes the primary fit constraint. Front width can be approximately right and the frame will still be unwearable if the bridge is four millimetres narrow.",
      ],
    },
    {
      h2: "What changes at 24 mm",
      body: [
        "A 24 mm bridge moves the lenses further apart, so the lens geometry has to be recalculated rather than carried over: we adjust lens width to keep the optical centres aligned with your pupillary distance instead of drifting outboard of it. The acetate at the bridge also carries more unsupported span, so the section runs thicker there than on a 21 mm keyhole.",
        "That is the reason 24 mm exists only in bespoke. It is not a variant of the signature frame; it is a different set of numbers throughout.",
      ],
      table: {
        head: ["At a 24 mm nasal root", "Route"],
        rows: [
          ["Signature 007 (21 mm)", "3 mm too narrow — perches"],
          ["Signature 009 (22 mm)", "2 mm too narrow"],
          ["Bespoke 24 mm", "Correct — our maximum bridge"],
        ],
      },
    },
    {
      h2: "Getting the measurement right",
      body: [
        "Bridge is measured at the narrowest point between the eyes, level with the pupils — not across the nostrils, which is the mistake that produces inflated numbers. If you measured 24 mm at the base of the nose, measure again higher up; the root is usually several millimetres narrower. FitLens measures at the correct point automatically.",
      ],
    },
  ],
};

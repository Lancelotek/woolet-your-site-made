/**
 * Long-form, per-length unique copy for the /en/temple/* landing cluster.
 * Signature temple length 150 mm; bespoke temple range 145–155 mm.
 * Front width context: signature 158 mm, bespoke 145–160 mm.
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
          ["150 mm", "Woolet signature, 153–163 mm faces"],
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
          ["153–163 mm signature", "150 mm"],
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
        "If your face measures 153–163 mm temple-to-temple and your head circumference is roughly 58–60 cm, yes — 150 mm is the fit and no bespoke specification will improve it. Below 153 mm face width, 150 mm arms usually overshoot. Above 61 cm head circumference, they usually come up short and 152–155 mm is the answer.",
        "The quickest way to know is to measure both numbers at once. FitLens returns face width and temple length from one phone photo in about twenty seconds.",
        "Pain on top of or behind the ear is the classic sign of a temple that is too short - see <a href=\"/en/blog/glasses-hurt-behind-ears\" style=\"color:#A07A2A;\">why glasses hurt behind your ears</a>.",
      ],
      table: {
        head: ["Your measurement", "Verdict on 150 mm arms"],
        rows: [
          ["Face 153–163 mm", "Correct — signature fit"],
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
        "152 mm is a bespoke specification and can be paired with any front width from 145 to 160 mm, though it is most often ordered with 158 and 160 mm fronts. Lead time is six to eight weeks behind the standard batch.",
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
 * Signature bridges: 26 mm keyhole (007), 25 mm (009). Bespoke 20–26 mm,
 * any front width 145–160 mm. Bridge numbers here are frame DBL, not a
 * measurement of the wearer's nose.
 */
const RANGE_TABLE: NonNullable<ClusterSection["table"]> = {
  head: ["Frame bridge", "Woolet route"],
  rows: [
    ["18–19 mm", "Below our range — mainstream"],
    ["20–24 mm", "Bespoke"],
    ["25 mm", "Woolet 009 Soft Square (signature)"],
    ["26 mm", "Woolet 007 Round keyhole (signature)"],
  ],
};

const MEASURE_SECTION: ClusterSection = {
  h2: "Your nose is not the number on the frame",
  body: [
    "The bridge printed on a frame (the middle number in 54□25-150) is the gap between the lenses. A measurement of your nose is a different number, so do not copy one into the other. FitLens measures face width and bridge from one phone photo and tells you whether the 007, the 009 or bespoke fits.",
  ],
};

export const BRIDGE_SECTIONS: Record<string, ClusterSection[]> = {
  "18mm": [
    {
      h2: "Who an 18 mm bridge fits",
      body: [
        "18 mm is the mainstream default. It is what the great majority of frames ship with because it matches the average face the industry tooled for.",
        "On a wide face an 18 mm bridge is the second half of the fit problem. People solve the front width, order a 155 mm+ frame with a stock bridge, and find the frame perched high with the lenses too far from the eyes.",
      ],
    },
    {
      h2: "Why we do not build 18 mm",
      body: [
        "Putting an 18 mm saddle on a 158 mm front concentrates the weight of the frame on two small contact points at the top of the nose. That is what produces red marks and a frame that slides once your skin warms. Our signature bridges are 25 mm (009) and 26 mm (007 keyhole).",
      ],
      table: RANGE_TABLE,
    },
    {
      h2: "What to do if 18 mm is your measurement",
      body: [
        "Buy mainstream, and buy on bridge rather than on lens size. If your face width is under 155 mm as well, nothing about the wide-face category applies to you. If your face is wide but your frame bridge needs to be 18 mm, the honest answer is a mainstream frame or a specialist outside our range.",
      ],
    },
    MEASURE_SECTION,
  ],

  "19mm": [
    {
      h2: "Who a 19 mm bridge fits",
      body: [
        "19 mm is the upper edge of mainstream bridge sizing — the widest you will reliably find in a stock catalogue. It is usually offered only on fronts of 140–148 mm, so on a wider face the bridge you need exists but not on the frame you need.",
      ],
    },
    {
      h2: "19 mm against the Woolet range",
      body: [
        "Woolet bespoke starts at 20 mm and the signature frames run 25–26 mm, so 19 mm sits below our range.",
      ],
      table: RANGE_TABLE,
    },
    MEASURE_SECTION,
  ],

  "20mm": [
    {
      h2: "Who a 20 mm bridge fits",
      body: [
        "20 mm is wider than nearly everything in stock retail and it is the floor of Woolet bespoke. It suits a wide face that needs a frame bridge narrower than our 25–26 mm signature.",
      ],
    },
    {
      h2: "20 mm against the Woolet range",
      body: [
        "Signature frames are 25 mm (009) and 26 mm (007 keyhole). A 20 mm bridge is a bespoke build on any front from 145 to 160 mm.",
      ],
      table: RANGE_TABLE,
    },
    MEASURE_SECTION,
  ],

  "21mm": [
    {
      h2: "21 mm against the Woolet range",
      body: [
        "21 mm is a wide bridge by mainstream standards and a bespoke build at Woolet. The signature frames go wider: 25 mm on the 009 Soft Square and 26 mm on the 007 keyhole.",
      ],
      table: RANGE_TABLE,
    },
    {
      h2: "What a correct bridge does not fix",
      body: [
        "A correct bridge will not rescue a frame that is too narrow across the front. If the arms press at the temples, the bridge is not the problem. Check front width first, bridge second, temple length third.",
      ],
    },
    MEASURE_SECTION,
  ],

  "22mm": [
    {
      h2: "22 mm against the Woolet range",
      body: [
        "Almost nothing in mainstream retail is offered at 22 mm, and when a stock frame lists it the front is usually 145 mm or under. At Woolet 22 mm is a bespoke build; the signature 009 runs 25 mm and the 007 keyhole 26 mm.",
      ],
      table: RANGE_TABLE,
    },
    MEASURE_SECTION,
  ],

  "24mm": [
    {
      h2: "24 mm against the Woolet range",
      body: [
        "24 mm is specialist wide-bridge sizing and a bespoke build at Woolet. It sits just under the signature 009 (25 mm) and 007 keyhole (26 mm).",
        "When the bridge widens, the lens geometry has to follow: bespoke adjusts lens width so the optical centres stay aligned with your pupillary distance.",
      ],
      table: RANGE_TABLE,
    },
    MEASURE_SECTION,
  ],

  "25mm": [
    {
      h2: "Why 25 mm is the 009 bridge",
      body: [
        "The 009 Soft Square is built 54□25-150 on a 158 mm front. A 25 mm bridge pushes the lenses apart for a wide nose, and the 54 × 44 mm lens keeps the optical centres inside the pupillary distance that comes with a wide face.",
      ],
      table: {
        head: ["Spec", "009 Soft Square"],
        rows: [
          ["Bridge", "25 mm"],
          ["Front width", "158 mm"],
          ["Lens", "54 × 44 mm"],
          ["Temples", "150 mm"],
        ],
      },
    },
    {
      h2: "25 mm versus the 26 mm keyhole on the 007",
      body: [
        "The 007 Round carries a 26 mm keyhole that rests on the sides of the nose and a taller 53 × 47.6 mm round lens. The 009 pairs its 25 mm bridge with a flatter top line and a lower lens. Shape preference usually decides between them.",
      ],
    },
    MEASURE_SECTION,
  ],

  "26mm": [
    {
      h2: "Why 26 mm is the 007 keyhole",
      body: [
        "The 007 Round / Panto is built 53□26-150 on a 158 mm front. A keyhole clears the crest of the nose and carries the load on the flanks, which is how a 158 mm acetate front sits without pads.",
      ],
      table: {
        head: ["Spec", "007 Round / Panto"],
        rows: [
          ["Bridge", "26 mm keyhole"],
          ["Front width", "158 mm"],
          ["Lens", "53 × 47.6 mm"],
          ["Temples", "150 mm"],
        ],
      },
    },
    {
      h2: "26 mm is our widest bridge",
      body: [
        "26 mm is the 007 signature and the top of the bespoke range (20–26 mm). Bespoke can put a 26 mm bridge on any bespoke shape and front from 145 to 160 mm.",
      ],
    },
    MEASURE_SECTION,
  ],
};

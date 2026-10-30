// Side-profile example for the Bespoke fit photo. Same line style as
// CardPositionIllustration. Numbered markers match the four steps listed under
// it on /bespoke/photo, so the drawing stays readable at phone width. The
// bottom strip shows what the side photo is for: where the nose bridge starts
// against the eye line (low vs high).
const GOLD = "#D4A65A";
const LINE = "#E8DCC4";
const MUTE = "#9a9a9a";

function Badge({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="24" fill={GOLD} />
      <text
        x={x}
        y={y + 9}
        fill="#1F1B16"
        fontFamily="-apple-system, sans-serif"
        fontSize="26"
        fontWeight="600"
        textAnchor="middle"
      >
        {n}
      </text>
    </g>
  );
}

export default function ProfilePhotoIllustration() {
  return (
    <svg
      viewBox="0 0 800 1000"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby="profiletitle profiledesc"
      className="w-full h-auto"
    >
      <title id="profiletitle">How to take the side photo for Woolet Bespoke</title>
      <desc id="profiledesc">
        A head in strict side profile with a bank card flat on the cheek, long edge level. The ear and the
        nose bridge are both visible. A phone at eye height points straight at the side of the face. Below,
        two profiles compare a low and a high nose bridge against the eye line.
      </desc>

      {/* eye line */}
      <line x1="120" y1="292" x2="760" y2="292" stroke={GOLD} strokeWidth="1.5" strokeDasharray="4 7" opacity="0.6" />

      {/* head in profile, facing right */}
      <path
        d="M 220 560 C 220 520 212 495 188 465 C 148 415 132 350 142 280 C 156 170 240 92 338 92 C 390 92 420 125 426 182 C 430 220 420 245 416 265 C 412 280 406 288 404 296 C 418 325 440 360 456 388 C 462 398 456 406 444 407 L 420 409 C 426 420 424 428 420 434 C 430 442 430 452 422 460 C 428 468 427 480 418 486 C 420 505 418 524 402 536 C 382 550 350 552 324 550 C 312 570 310 588 312 620"
        stroke={LINE}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* eye + brow */}
      <path d="M 348 292 Q 362 284 374 292 Q 362 298 348 292 Z" stroke={LINE} strokeWidth="2.5" fill="none" />
      <circle cx="366" cy="292" r="3.5" fill={LINE} />
      <path d="M 344 272 Q 372 260 402 266" stroke={LINE} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* ear */}
      <path
        d="M 238 272 C 210 270 202 308 210 340 C 216 366 236 372 246 356 C 254 342 250 326 256 312 C 262 294 258 274 238 272 Z"
        stroke={LINE}
        strokeWidth="2.5"
        fill="none"
      />
      <path d="M 234 292 C 222 300 224 324 234 334" stroke={LINE} strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* nose bridge marker */}
      <circle cx="404" cy="296" r="9" fill="none" stroke={GOLD} strokeWidth="3" />

      {/* card flat on cheek, long edge level */}
      <rect x="272" y="338" width="124" height="78" rx="7" fill={GOLD} stroke="#B8893E" strokeWidth="1.5" />
      <rect x="286" y="354" width="20" height="16" rx="2" fill="#8C6B30" />

      {/* phone at eye height, ~50 cm away */}
      <line x1="470" y1="292" x2="640" y2="292" stroke={GOLD} strokeWidth="2" strokeDasharray="2 6" />
      <rect x="650" y="244" width="56" height="100" rx="10" fill="none" stroke={GOLD} strokeWidth="2.5" />
      <circle cx="678" cy="266" r="9" fill="none" stroke={GOLD} strokeWidth="2" />
      <circle cx="678" cy="266" r="3" fill={GOLD} />

      {/* numbered markers = steps under the drawing */}
      <Badge x={150} y={200} n={1} />
      <Badge x={334} y={450} n={2} />
      <Badge x={678} y={392} n={3} />
      <Badge x={520} y={240} n={4} />

      {/* what we check: low vs high bridge */}
      <line x1="60" y1="680" x2="740" y2="680" stroke={LINE} strokeWidth="1" opacity="0.15" />
      <text
        x="400"
        y="728"
        fill={GOLD}
        fontFamily="-apple-system, sans-serif"
        fontSize="24"
        letterSpacing="4"
        textAnchor="middle"
      >
        WHAT WE CHECK
      </text>

      <g transform="translate(90 760) scale(1.6)">
        <line x1="0" y1="40" x2="170" y2="40" stroke={GOLD} strokeWidth="1.2" strokeDasharray="3 4" opacity="0.7" />
        <path
          d="M 40 0 C 80 0 92 20 90 34 C 88 46 86 52 88 58 C 100 70 112 80 118 88 L 96 92"
          stroke={LINE}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="70" cy="40" r="2.5" fill={LINE} />
        <circle cx="88" cy="58" r="5" fill="none" stroke={GOLD} strokeWidth="2" />
      </g>
      <text x="230" y="944" fill={LINE} fontFamily="Georgia, serif" fontSize="34" fontStyle="italic" textAnchor="middle">
        Low bridge
      </text>
      <text x="230" y="980" fill={MUTE} fontFamily="-apple-system, sans-serif" fontSize="22" textAnchor="middle">
        starts below the eye line
      </text>

      <g transform="translate(450 760) scale(1.6)">
        <line x1="0" y1="40" x2="170" y2="40" stroke={GOLD} strokeWidth="1.2" strokeDasharray="3 4" opacity="0.7" />
        <path
          d="M 40 0 C 80 0 94 14 94 24 C 94 30 96 34 100 44 C 108 62 118 78 124 88 L 100 92"
          stroke={LINE}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="70" cy="40" r="2.5" fill={LINE} />
        <circle cx="94" cy="26" r="5" fill="none" stroke={GOLD} strokeWidth="2" />
      </g>
      <text x="590" y="944" fill={LINE} fontFamily="Georgia, serif" fontSize="34" fontStyle="italic" textAnchor="middle">
        High bridge
      </text>
      <text x="590" y="980" fill={MUTE} fontFamily="-apple-system, sans-serif" fontSize="22" textAnchor="middle">
        starts above the eye line
      </text>
    </svg>
  );
}

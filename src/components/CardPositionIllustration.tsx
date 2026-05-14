export default function CardPositionIllustration() {
  return (
    <svg
      viewBox="0 0 800 800"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby="cardpostitle cardposdesc"
      className="w-full h-auto"
    >
      <title id="cardpostitle">How to position the credit card for AI Fit scan</title>
      <desc id="cardposdesc">
        A person facing forward holds a credit card horizontally against their forehead, with labels showing card orientation and skin contact, and a phone icon below indicating the camera direction.
      </desc>

      <text
        x="400"
        y="55"
        fill="#D4A65A"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="22"
        textAnchor="middle"
        fontStyle="italic"
      >
        How to position the card
      </text>

      <line x1="370" y1="72" x2="430" y2="72" stroke="#D4A65A" strokeWidth="1" />

      <path
        d="M 282 232 Q 400 142 518 232"
        stroke="#E8DCC4"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="400" cy="385" rx="128" ry="172" stroke="#E8DCC4" strokeWidth="2.5" fill="none" />
      <path
        d="M 274 365 Q 258 385 268 410"
        stroke="#E8DCC4"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 526 365 Q 542 385 532 410"
        stroke="#E8DCC4"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 343 358 Q 363 350 385 358"
        stroke="#E8DCC4"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 415 358 Q 437 350 457 358"
        stroke="#E8DCC4"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      <circle cx="364" cy="395" r="4" fill="#E8DCC4" />
      <circle cx="436" cy="395" r="4" fill="#E8DCC4" />

      <path
        d="M 400 412 L 390 468 L 410 468"
        stroke="#E8DCC4"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 372 508 Q 400 520 428 508"
        stroke="#E8DCC4"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      <line x1="346" y1="553" x2="342" y2="625" stroke="#E8DCC4" strokeWidth="2" strokeLinecap="round" />
      <line x1="454" y1="553" x2="458" y2="625" stroke="#E8DCC4" strokeWidth="2" strokeLinecap="round" />

      <path
        d="M 240 700 Q 300 645 342 625"
        stroke="#E8DCC4"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 560 700 Q 500 645 458 625"
        stroke="#E8DCC4"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      <rect x="300" y="245" width="200" height="65" rx="8" fill="#D4A65A" stroke="#B8893E" strokeWidth="1.5" />
      <rect x="320" y="262" width="26" height="22" rx="3" fill="#8C6B30" />
      <line x1="324" y1="269" x2="342" y2="269" stroke="#5A4520" strokeWidth="0.6" />
      <line x1="324" y1="274" x2="342" y2="274" stroke="#5A4520" strokeWidth="0.6" />
      <line x1="324" y1="279" x2="342" y2="279" stroke="#5A4520" strokeWidth="0.6" />

      <line x1="305" y1="310" x2="495" y2="310" stroke="#D4A65A" strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />

      <line x1="500" y1="248" x2="610" y2="195" stroke="#7a7a7a" strokeWidth="1" />
      <circle cx="500" cy="248" r="3" fill="#D4A65A" />
      <text x="625" y="190" fill="#D4A65A" fontFamily="Georgia, serif" fontSize="15" fontStyle="italic">
        Horizontal
      </text>
      <text x="625" y="210" fill="#9a9a9a" fontFamily="-apple-system, sans-serif" fontSize="12">
        Long edge level
      </text>

      <line x1="300" y1="305" x2="190" y2="335" stroke="#7a7a7a" strokeWidth="1" />
      <circle cx="300" cy="305" r="3" fill="#D4A65A" />
      <text x="175" y="330" fill="#D4A65A" fontFamily="Georgia, serif" fontSize="15" fontStyle="italic" textAnchor="end">
        Flat on forehead
      </text>
      <text x="175" y="350" fill="#9a9a9a" fontFamily="-apple-system, sans-serif" fontSize="12" textAnchor="end">
        Both edges touching skin
      </text>

      <line x1="400" y1="395" x2="400" y2="715" stroke="#D4A65A" strokeWidth="1" strokeDasharray="3 5" opacity="0.45" />

      <rect x="375" y="700" width="50" height="80" rx="8" fill="none" stroke="#D4A65A" strokeWidth="1.5" />
      <circle cx="400" cy="715" r="3" fill="#D4A65A" />
      <circle cx="400" cy="740" r="9" fill="none" stroke="#D4A65A" strokeWidth="1.2" />
      <circle cx="400" cy="740" r="3" fill="#D4A65A" />

      <text x="400" y="785" fill="#9a9a9a" fontFamily="-apple-system, sans-serif" fontSize="13" textAnchor="middle">
        Look straight at the camera
      </text>
    </svg>
  );
}

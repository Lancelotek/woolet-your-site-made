const SpecSheet = () => {
  const specs = ["158mm total", "54×56mm lens", "20mm bridge", "148mm temple", "Italian acetate"];

  return (
    <div className="border overflow-hidden" style={{ borderColor: "hsl(0 0% 100% / 0.055)" }}>
      {/* SVG glasses illustration */}
      <div className="flex items-center justify-center py-8 px-4">
        <svg viewBox="0 0 320 100" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[380px] opacity-70" style={{ filter: "invert(1) brightness(.65) sepia(.15)" }}>
          <g stroke="#333" strokeWidth="1.8" fill="none">
            <rect x="30" y="20" width="110" height="65" rx="8"/>
            <rect x="180" y="20" width="110" height="65" rx="8"/>
            <path d="M140 52 Q160 42 180 52" strokeWidth="1.2"/>
            <line x1="30" y1="45" x2="6" y2="45"/>
            <path d="M6 45 Q0 45 0 52"/>
            <line x1="290" y1="45" x2="314" y2="45"/>
            <path d="M314 45 Q320 45 320 52"/>
          </g>
          <text x="160" y="14" textAnchor="middle" fontFamily="Barlow,sans-serif" fontSize="7" fill="#555" letterSpacing="3" fontWeight="400">
            EYEWEAR FOR WIDE FACES
          </text>
          <text x="160" y="60" textAnchor="middle" fontFamily="Cormorant Garamond,serif" fontSize="11" fill="#666" letterSpacing="2">
            158 MM TOTAL
          </text>
        </svg>
      </div>

      {/* Spec pills */}
      <div className="flex flex-wrap gap-1.5 px-3 py-3 border-t" style={{ borderTopColor: "hsl(0 0% 100% / 0.055)" }}>
        {specs.map((spec) => (
          <span
            key={spec}
            className="text-gold-dim border border-primary/20 px-2 py-0.5 uppercase tracking-[0.14em]"
            style={{ fontSize: "0.5rem" }}
          >
            {spec}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SpecSheet;

const BeforeAfter = () => {
  return (
    <div className="grid grid-cols-2 border-t" style={{ borderTopColor: "hsl(0 0% 100% / 0.055)" }}>
      {/* BEFORE */}
      <div className="p-4 relative overflow-hidden" style={{ borderRight: "1px solid hsl(0 0% 100% / 0.055)" }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-woolet-red flex-shrink-0" />
          <span className="uppercase tracking-[0.22em] text-cream-dim" style={{ fontSize: "0.55rem" }}>
            Standard frames — 145mm
          </span>
        </div>
        <div className="flex flex-col items-center justify-center h-[90px]">
          <div className="flex flex-col items-center">
            <div className="flex gap-7 text-woolet-red animate-squeeze" style={{ fontSize: "0.85rem" }}>
              <span>❯</span><span>❮</span>
            </div>
            <div className="flex items-center gap-0.5 relative">
              <div className="absolute -left-6 top-3 w-6 h-px bg-woolet-red" />
              <div className="w-9 h-7 border-2 border-woolet-red rounded" />
              <div className="w-1.5 h-0.5 bg-woolet-red mt-3" />
              <div className="w-9 h-7 border-2 border-woolet-red rounded" />
              <div className="absolute -right-6 top-3 w-6 h-px bg-woolet-red" />
            </div>
            <div className="text-woolet-red tracking-wider text-center mt-2" style={{ fontSize: "0.58rem", letterSpacing: "0.12em" }}>
              Pinching. Headache. Red marks.
            </div>
          </div>
        </div>
        <div className="text-cream-dim mt-1" style={{ fontSize: "0.62rem", lineHeight: 1.5 }}>
          Too narrow. Digs in at the temples after 1 hour.
        </div>
      </div>

      {/* AFTER */}
      <div className="p-4 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-woolet-green flex-shrink-0" />
          <span className="uppercase tracking-[0.22em] text-cream-dim" style={{ fontSize: "0.55rem" }}>
            Woolet 009 — 158mm
          </span>
        </div>
        <div className="h-[90px] flex flex-col items-center justify-center gap-2 pt-2 px-1">
          <svg viewBox="0 0 220 72" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[200px] block mx-auto mb-2">
            <g stroke="#c9a84c" strokeWidth="1.6" fill="none">
              <rect x="14" y="12" width="82" height="54" rx="6"/>
              <rect x="124" y="12" width="82" height="54" rx="6"/>
              <path d="M96 38 Q110 30 124 38" strokeWidth="1"/>
              <line x1="14" y1="32" x2="0" y2="32"/>
              <line x1="206" y1="32" x2="220" y2="32"/>
              <line x1="0" y1="2" x2="0" y2="8" stroke="rgba(201,168,76,.3)" strokeWidth=".7"/>
              <line x1="220" y1="2" x2="220" y2="8" stroke="rgba(201,168,76,.3)" strokeWidth=".7"/>
            </g>
            <text x="110" y="4.5" textAnchor="middle" fontFamily="Barlow,sans-serif" fontSize="4.5" fill="rgba(201,168,76,.6)" letterSpacing="1.5">158 MM</text>
          </svg>
          <div className="flex gap-5 justify-center">
            {[
              { val: "158mm", label: "width" },
              { val: "54mm", label: "lens" },
              { val: "148mm", label: "temple" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-0.5">
                <span className="font-display text-gold-light font-light" style={{ fontSize: "1rem" }}>{s.val}</span>
                <span className="text-cream-dim uppercase tracking-[0.18em]" style={{ fontSize: "0.48rem" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-cream-dim mt-2" style={{ fontSize: "0.62rem", lineHeight: 1.5 }}>
          <strong className="text-gold-light font-normal">Italian acetate.</strong> Engineered for 155mm+ faces. Comfortable all day.
        </div>
      </div>
    </div>
  );
};

export default BeforeAfter;

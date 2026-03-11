const ModelPills = () => {
  return (
    <div>
      <div className="text-cream-dim uppercase tracking-[0.24em] mb-3" style={{ fontSize: "0.56rem" }}>
        The Collection
      </div>
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="flex-1 border p-4 flex flex-col gap-1 transition-colors hover:border-primary/20 relative overflow-hidden group"
          style={{ borderColor: "hsl(0 0% 100% / 0.055)" }}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-400" />
          <svg viewBox="0 0 180 60" xmlns="http://www.w3.org/2000/svg" className="w-full opacity-55 mb-1.5">
            <g stroke="hsl(var(--gold))" strokeWidth="1.3" fill="none">
              <circle cx="50" cy="30" r="22"/>
              <circle cx="130" cy="30" r="22"/>
              <path d="M72 30 Q90 22 108 30" strokeWidth="1"/>
              <line x1="28" y1="24" x2="6" y2="24"/><path d="M6 24 Q0 24 0 30"/>
              <line x1="152" y1="24" x2="174" y2="24"/><path d="M174 24 Q180 24 180 30"/>
            </g>
          </svg>
          <div className="text-primary uppercase tracking-[0.28em]" style={{ fontSize: "0.5rem" }}>007</div>
          <div className="font-display text-woolet-white" style={{ fontSize: "1.1rem" }}>Woolet 007</div>
          <div className="text-cream-dim" style={{ fontSize: "0.6rem" }}>Round · 158mm · 44mm lens</div>
        </div>

        <div className="flex-1 border p-4 flex flex-col gap-1 transition-colors hover:border-primary/20 relative overflow-hidden group"
          style={{ borderColor: "hsl(0 0% 100% / 0.055)" }}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-400" />
          <svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg" className="w-full opacity-55 mb-1.5">
            <g stroke="hsl(var(--gold))" strokeWidth="1.3" fill="none">
              <rect x="16" y="8" width="68" height="44" rx="5"/>
              <rect x="116" y="8" width="68" height="44" rx="5"/>
              <path d="M84 30 Q100 23 116 30" strokeWidth="1"/>
              <line x1="16" y1="25" x2="0" y2="25"/><path d="M0 25 Q-5 25 -5 30"/>
              <line x1="184" y1="25" x2="200" y2="25"/><path d="M200 25 Q205 25 205 30"/>
            </g>
          </svg>
          <div className="text-primary uppercase tracking-[0.28em]" style={{ fontSize: "0.5rem" }}>009</div>
          <div className="font-display text-woolet-white" style={{ fontSize: "1.1rem" }}>Woolet 009</div>
          <div className="text-cream-dim" style={{ fontSize: "0.6rem" }}>Square · 158mm · 54mm lens</div>
        </div>
      </div>
    </div>
  );
};

export default ModelPills;

const BeforeAfter = () => {
  return (
    <div className="grid grid-cols-2 border-t" style={{ borderTopColor: "hsl(0 0% 100% / 0.055)" }}>
      {/* BEFORE */}
      <div className="p-4 relative overflow-hidden" style={{ borderRight: "1px solid hsl(0 0% 100% / 0.055)" }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-woolet-red flex-shrink-0" />
          <span className="uppercase tracking-[0.22em] text-cream-dim" style={{ fontSize: "0.55rem" }}>Before</span>
        </div>
        <div className="flex flex-col items-center justify-center h-[90px]">
          <div className="flex items-center gap-0.5 relative">
            <div className="w-9 h-7 border-2 border-woolet-red rounded" />
            <div className="w-1.5 h-0.5 bg-woolet-red mt-3" />
            <div className="w-9 h-7 border-2 border-woolet-red rounded" />
            <div className="absolute -left-6 top-3 w-6 h-px bg-woolet-red" />
            <div className="absolute -right-6 top-3 w-6 h-px bg-woolet-red" />
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex gap-7 text-woolet-red animate-squeeze" style={{ fontSize: "0.85rem" }}>
              <span>›</span><span>‹</span>
            </div>
          </div>
          <div className="text-woolet-red tracking-wider text-center mt-2" style={{ fontSize: "0.58rem" }}>Too tight</div>
        </div>
      </div>

      {/* AFTER */}
      <div className="p-4 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-woolet-green flex-shrink-0" />
          <span className="uppercase tracking-[0.22em] text-cream-dim" style={{ fontSize: "0.55rem" }}>After — Woolet</span>
        </div>
        <div className="h-[90px] flex flex-col items-center justify-center gap-2 pt-2">
          <div className="flex gap-5 justify-center">
            {[
              { val: "158mm", label: "Width" },
              { val: "52mm", label: "Bridge" },
              { val: "150mm", label: "Temple" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-0.5">
                <span className="font-display text-gold-light" style={{ fontSize: "1rem" }}>{s.val}</span>
                <span className="text-cream-dim uppercase tracking-[0.18em]" style={{ fontSize: "0.48rem" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfter;

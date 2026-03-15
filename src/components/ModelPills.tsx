import { useState } from "react";
import woolet007Img from "@/assets/woolet-007.png";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const ModelPills = () => {
  const [open007, setOpen007] = useState(false);

  return (
    <div>
      <div className="text-cream-dim uppercase tracking-[0.24em] mb-3" style={{ fontSize: "0.56rem" }}>
        The Collection
      </div>
      <div className="flex gap-3 flex-col sm:flex-row">
        {/* Woolet 007 */}
        <div className="flex-1 border p-4 flex flex-col gap-1 transition-colors hover:border-primary/20 relative overflow-hidden group cursor-pointer"
          style={{ borderColor: "hsl(0 0% 100% / 0.055)" }}
          onClick={() => setOpen007(true)}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-400" />
          <div className="w-full aspect-[3/1] mb-1.5 overflow-hidden rounded-sm">
            <img src={woolet007Img} alt="Woolet 007 round glasses" className="w-full h-full object-cover opacity-75 group-hover:opacity-90 transition-opacity" />
          </div>
          <div className="text-primary uppercase tracking-[0.28em]" style={{ fontSize: "0.5rem" }}>007</div>
          <div className="font-display text-woolet-white" style={{ fontSize: "1.1rem" }}>Woolet 007</div>
          <div className="text-cream-dim" style={{ fontSize: "0.6rem" }}>Round · 158mm · 44mm lens</div>
        </div>

        {/* Woolet 009 */}
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

      {/* 007 Popup */}
      <Dialog open={open007} onOpenChange={setOpen007}>
        <DialogContent className="max-w-2xl bg-surface border-primary/10 p-2">
          <DialogTitle className="sr-only">Woolet 007</DialogTitle>
          <img src={woolet007Img} alt="Woolet 007 — round acetate glasses for wide faces" className="w-full rounded" />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModelPills;

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { bridgeFitImages, BRIDGE_FIT_CARDS, BRIDGE_FIT_INTRO, BRIDGE_FIT_LEGEND } from "@/content/bridgeFit";

type BridgeImage = typeof bridgeFitImages.gap;
function BridgePicture({ image }: { image: BridgeImage }) {
  return <picture className="block overflow-hidden border border-border">
    <source srcSet={image.webp} type="image/webp" />
    <img src={image.original} alt={image.alt} width={image.width} height={image.height} loading="lazy" className="block h-auto w-full" />
  </picture>;
}

export default function BridgeFitExplainer({ variant = "full", hideButton = false }: { variant?: "full" | "compact"; hideButton?: boolean }) {
  return <section aria-label="The nose bridge" className="my-12 bg-background px-5 py-10 text-foreground sm:px-8 sm:py-14">
    <div className="mx-auto max-w-[860px]">
      {variant === "full" && <p className="mb-3 font-body text-xs font-semibold uppercase text-primary">THE NOSE BRIDGE</p>}
      <h2 className="mb-5 font-display text-3xl leading-tight text-foreground sm:text-4xl">Wide enough frame. Wrong bridge.</h2>
      {variant === "full" && <p className="mb-8 max-w-[70ch] font-body text-base leading-relaxed text-cream-dim">{BRIDGE_FIT_INTRO}</p>}
      <figure className="m-0">
        <BridgePicture image={bridgeFitImages.gap} />
        <figcaption className="mt-4"><ol className="grid gap-3 p-0 sm:grid-cols-2">
          {BRIDGE_FIT_LEGEND.map((item) => <li key={item.number} className="flex items-start gap-3 font-body text-sm leading-relaxed text-cream-dim">
            <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-semibold text-white" style={{ backgroundColor: "#E2533D" }}>{item.number}</span>
            <span><strong className="text-foreground">{item.title}</strong> - {item.text}</span>
          </li>)}
        </ol></figcaption>
      </figure>
      <div className="mt-9 grid gap-6 md:grid-cols-2">
        {BRIDGE_FIT_CARDS.map((card, index) => <div key={card.title} className="border border-border bg-card">
          <BridgePicture image={card.image} />
          <div className="p-5 sm:p-6">
            <h3 className={`font-display text-2xl ${index === 0 ? "" : "text-primary"}`} style={index === 0 ? { color: "#E2533D" } : undefined}>{card.title}</h3>
            <p className="mt-1 font-body text-sm text-cream-dim">{card.subtitle}</p>
            <ul className="mt-5 grid gap-2 pl-5 font-body text-sm leading-relaxed text-foreground" style={{ listStyleType: "disc" }}>
              {card.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
            </ul>
          </div>
        </div>)}
      </div>
      {variant === "full" && <div className="mt-9 border-t border-border pt-7">
        <p className="mb-5 font-body text-base leading-relaxed text-foreground">Width is not only temple to temple. FitLens measures your bridge too.</p>
        {!hideButton && <Button asChild className="rounded-sm"><Link to="/en/fit">Scan your fit</Link></Button>}
      </div>}
    </div>
  </section>;
}
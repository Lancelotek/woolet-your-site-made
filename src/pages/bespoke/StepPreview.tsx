import type { BespokeConfig } from "@/lib/bespoke-state";
import { AiPreviewPanel } from "./steps";

interface Props {
  config: BespokeConfig;
  update: <K extends keyof BespokeConfig>(key: K, value: BespokeConfig[K]) => void;
  locale?: "en" | "pl";
}

export default function StepPreview({ config }: Props) {
  return (
    <div className="space-y-10">
      <header>
        <div className="cfg-eyebrow">Step 3 — Preview</div>
        <h2 className="cfg-h1 mt-3">See it before you <em className="cfg-em">build</em> it</h2>
        <p className="cfg-body mt-4 max-w-xl">Generate your exact acetate frame in the colours and finish you picked. The render stays with your build through the next steps.</p>
      </header>
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-gold-light">AI frame render</div>
        <AiPreviewPanel config={config} />
      </div>
    </div>
  );
}

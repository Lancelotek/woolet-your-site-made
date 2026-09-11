// Step 3 — Preview. Two panels: the AI render of the build and the true-scale
// overlay on the buyer's own photograph.

import type { BespokeConfig } from "@/lib/bespoke-state";
import { AiPreviewPanel } from "./steps";
import OnYourFacePanel from "./OnYourFacePanel";

interface Props {
  config: BespokeConfig;
  update: <K extends keyof BespokeConfig>(key: K, value: BespokeConfig[K]) => void;
  locale?: "en" | "pl";
}

export default function StepPreview({ config, update, locale = "en" }: Props) {
  return (
    <div className="space-y-10">
      <header>
        <div className="cfg-eyebrow">Step 3 — Preview</div>
        <h2 className="cfg-h1 mt-3">
          See it before you <em className="cfg-em">build</em> it
        </h2>
        <p className="cfg-body mt-4 max-w-xl">
          An AI render of the exact acetate you chose, then the pattern laid over your own photograph at true
          millimetre scale. All optional; none of it changes your build.
        </p>
      </header>

      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-[#CAA449]">AI render</div>
        <AiPreviewPanel config={config} />
      </div>

      <OnYourFacePanel config={config} update={update} locale={locale} />
    </div>
  );
}

// Step 3 — Preview. Three panels: the AI render of the build, the same pair on
// the buyer's own photograph (AI try-on), and the true-scale overlay.

import { useState } from "react";

import type { BespokeConfig } from "@/lib/bespoke-state";
import { AiPreviewPanel } from "./steps";
import TryOnPanel from "./TryOnPanel";
import OnYourFacePanel from "./OnYourFacePanel";

interface Props {
  config: BespokeConfig;
  update: <K extends keyof BespokeConfig>(key: K, value: BespokeConfig[K]) => void;
  locale?: "en" | "pl";
}

export default function StepPreview({ config, update, locale = "en" }: Props) {
  const [framePreviewUrl, setFramePreviewUrl] = useState<string | null>(null);

  return (
    <div className="space-y-10">
      <header>
        <div className="cfg-eyebrow">Step 3 — Preview</div>
        <h2 className="cfg-h1 mt-3">
          See it before you <em className="cfg-em">build</em> it
        </h2>
        <p className="cfg-body mt-4 max-w-xl">
          An AI render of the exact acetate you chose, then the same pair on a photo of you — and, if you
          like, the pattern laid over your own photograph at true millimetre scale. All optional; none of it
          changes your build.
        </p>
      </header>

      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-[#CAA449]">AI render</div>
        <AiPreviewPanel config={config} onRenderChange={setFramePreviewUrl} />
      </div>

      <TryOnPanel config={config} unlocked={Boolean(framePreviewUrl)} />

      <OnYourFacePanel config={config} update={update} locale={locale} />
    </div>
  );
}

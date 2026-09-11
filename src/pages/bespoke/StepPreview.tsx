import { useState } from "react";
import type { BespokeConfig } from "@/lib/bespoke-state";
import { AiPreviewPanel } from "./steps";
import TryOnPanel from "./TryOnPanel";

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
        <h2 className="cfg-h1 mt-3">See it before you <em className="cfg-em">build</em> it</h2>
        <p className="cfg-body mt-4 max-w-xl">First generate your exact acetate frame. Then continue on a phone to see that same frame on your face. This optional preview does not change your build.</p>
      </header>
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-gold-light">AI frame render</div>
        <AiPreviewPanel config={config} onRenderChange={setFramePreviewUrl} />
      </div>
      <TryOnPanel config={config} framePreviewUrl={framePreviewUrl} locale={locale} onSaved={(at) => update("facePhotoSavedAt", at)} />
    </div>
  );
}

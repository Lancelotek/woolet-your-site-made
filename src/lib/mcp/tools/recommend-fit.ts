import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const RECS = [
  {
    minFaceWidthMm: 150,
    maxFaceWidthMm: 158,
    recommendation: "Woolet 007 Round or 009 Square — both 158 mm front width. Try the Fit Wizard for a shape recommendation.",
    url: "https://woolet.co/en/fit",
  },
  {
    minFaceWidthMm: 159,
    maxFaceWidthMm: 172,
    recommendation: "Woolet Bespoke — cut to your exact face width (145–172 mm).",
    url: "https://woolet.co/en/bespoke",
  },
];

export default defineTool({
  name: "recommend_fit",
  title: "Recommend Woolet fit",
  description:
    "Recommend a Woolet model based on face width in millimetres (measured temple-to-temple). Wide faces only — 150 mm and above.",
  inputSchema: {
    faceWidthMm: z
      .number()
      .min(120)
      .max(200)
      .describe("Face width in millimetres, measured temple-to-temple."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ faceWidthMm }) => {
    if (faceWidthMm < 150) {
      return {
        content: [
          {
            type: "text",
            text: `Face width ${faceWidthMm} mm is narrower than Woolet's 150 mm minimum. Woolet is built for wide faces (155 mm+). Standard eyewear brands will fit better.`,
          },
        ],
        structuredContent: { faceWidthMm, match: null },
      };
    }
    const match = RECS.find(
      (r) => faceWidthMm >= r.minFaceWidthMm && faceWidthMm <= r.maxFaceWidthMm,
    );
    return {
      content: [
        {
          type: "text",
          text: match
            ? `${match.recommendation} (${match.url})`
            : `Face width ${faceWidthMm} mm exceeds Woolet Bespoke's 162 mm max. Contact support@woolet.co.`,
        },
      ],
      structuredContent: { faceWidthMm, match: match ?? null },
    };
  },
});

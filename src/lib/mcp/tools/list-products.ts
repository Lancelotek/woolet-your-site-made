import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "list_products",
  title: "List Woolet products",
  description:
    "List Woolet eyewear products with model, width, bridge, and pre-order pricing (USD).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const products = [
      {
        id: "007",
        name: "Woolet 007 Round",
        shape: "Round",
        widthMm: 158,
        bridgeMm: 22,
        preOrderUsd: 133,
        regularUsd: 190,
        url: "https://woolet.co/en/products/007",
      },
      {
        id: "009",
        name: "Woolet 009 Square",
        shape: "Square",
        widthMm: 158,
        bridgeMm: 21,
        preOrderUsd: 133,
        regularUsd: 190,
        url: "https://woolet.co/en/products/009",
      },
      {
        id: "bespoke",
        name: "Woolet Bespoke",
        shape: "Made-to-measure (Aviator / Rectangle / Crown Panto / Round)",
        widthMm: "150–172 (cut to face)",
        bridgeMm: "custom",
        preOrderUsd: 480,
        regularUsd: 480,
        url: "https://woolet.co/en/bespoke",
      },
    ];
    return {
      content: [{ type: "text", text: JSON.stringify(products, null, 2) }],
      structuredContent: { products },
    };
  },
});

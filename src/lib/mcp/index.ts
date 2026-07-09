import { defineMcp } from "@lovable.dev/mcp-js";
import listProducts from "./tools/list-products";
import recommendFit from "./tools/recommend-fit";

export default defineMcp({
  name: "woolet-mcp",
  title: "Woolet Eyewear",
  version: "0.1.0",
  instructions:
    "Tools for Woolet, an Italian acetate eyewear brand for wide faces (145–162 mm). Use `list_products` to browse models 007, 009, and Bespoke. Use `recommend_fit` to suggest a model from a face width in millimetres.",
  tools: [listProducts, recommendFit],
});

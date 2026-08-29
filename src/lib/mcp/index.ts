import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listProducts from "./tools/list-products";
import recommendFit from "./tools/recommend-fit";

// OAuth issuer MUST be the direct Supabase host (never the .lovable.cloud
// proxy) — mcp-js rejects tokens whose configured issuer doesn't match the
// one published by discovery. Read the project ref from a build-time inline
// so this file stays import-safe (no runtime env reads).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "woolet-mcp",
  title: "Woolet Eyewear",
  version: "0.1.0",
  instructions:
    "Tools for Woolet, an Italian acetate eyewear brand for wide faces (145–172 mm). Use `list_products` to browse models 007, 009, and Bespoke. Use `recommend_fit` to suggest a model from a face width in millimetres.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listProducts, recommendFit],
});

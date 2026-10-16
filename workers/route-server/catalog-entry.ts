// SSR entry bundled by build-bundle.mjs: the shared route catalog + the Worker matcher.
export { buildKnownRouteData, parseAppRoutes } from "../../src/seo/routeCatalog";
export { getAllRoutes } from "../../src/seo/metadata";
export { createMatcher } from "./src/routes";

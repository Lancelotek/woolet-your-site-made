export const COMPOSITION_REFERENCE_URL = "https://wmefczrhnsqicikveuhz.supabase.co/functions/v1/bespoke-render-image/renders/round/woolet-bespoke-round-british-racing-green-front-ice-translucent-temples-brushed-plano-06b46be2.png";
export const SHAPE_CONSTRAINTS: Record<string, string> = {
  "crown-panto": "Each lens has a FLAT, straight top edge (a crown line) running horizontally into the bridge, with a deep rounded panto bottom; the top of the front is a straight horizontal line, NOT a circle; keyhole bridge. Must not look round. Lens size and proportions exactly as the outline drawing: compact lenses, NOT aviator teardrops, keyhole bridge sitting high, no brow bar.",
  round: "Fully circular lenses, keyhole bridge.",
  rectangle: "Rectangular lenses with straight top and bottom edges, soft corners, thick flat brow.",
};
export const shapeConstraint = (shape: string) => SHAPE_CONSTRAINTS[shape.trim().toLowerCase().replace(/\s+/g, "-")] ?? "";
export const compositionReferenceFor = (shape: string) => shape.trim().toLowerCase() === "round" ? COMPOSITION_REFERENCE_URL : null;
export const COMPOSITION_RULES = [
  "Image 1 is the geometry authority.",
  "Three-quarter view: the front sits in the lower left of the image, turned toward the viewer's left; both open temples recede diagonally to the upper right; camera about 20 degrees above the frame; warm off-white seamless background; soft upper-left light; one soft contact shadow.",
  "HARD CAMERA CONSTRAINTS: both temples visible and open, far temple partly visible behind the lens; look slightly down onto the top of the front and temples. Centre the complete pair, filling about 75% of image width; entire frame inside the image, nothing cropped. Never mirror the pose or use a flat front view. Construction photos define construction only, never the camera angle.",
  "No props, no coloured backdrop, no face, no text, no model, no branding, no logos or printed markings anywhere, including inside the temples.",
].join(" ");
/** Owner rule (29.10.2026): Bespoke fronts carry no ornaments - no pins, rivets or dots on the front face. */
export const PLAIN_FRONT_RULE =
  "PLAIN FRONT: the frame front, including both outer corners and the bridge, is smooth unbroken acetate with no decoration of any kind - no visible pins, rivets, dots, studs, diamond or arrow inlays, screws, metal plaques or wires on the front face. Hinges are concealed inside the acetate where the temple meets the front. Never copy front pins from any reference image.";
export const compositionRulesFor = (shape: string) => [COMPOSITION_RULES, PLAIN_FRONT_RULE, ...(compositionReferenceFor(shape) ? ["The LAST image is the Round composition reference, the authority ONLY for camera angle, framing, lighting and background. Never copy its shape, colours, finish or lenses. Never copy its lens shape, bridge or proportions. Copy only camera angle, framing, light and background."] : [])].join(" ");
export type RenderView = "angle" | "front";

/** Straight-on front view (owner request 04.11.2026): shown in the review step next to the 3/4 render. */
export const FRONT_COMPOSITION_RULES = [
  "Image 1 is the geometry authority.",
  "FRONT VIEW: camera exactly level with the frame, perfectly square to the front, zero rotation and zero tilt - the view an optician has looking straight at the glasses.",
  "HARD CAMERA CONSTRAINTS: the front is perfectly symmetric left to right; both lenses the same size; the bridge on the vertical centre line; the open temples point straight back away from the camera so only their hinge ends and a thin sliver of each temple show at the outer corners.",
  "Centre the complete front, filling about 75% of image width; entire frame inside the image, nothing cropped.",
  "Same seamless warm cream studio backdrop and soft even softbox light as a premium catalogue still, with a soft contact shadow below the frame.",
  "No props, no coloured backdrop, no face, no text, no model, no branding, no logos or printed markings anywhere.",
].join(" ");

/** Rules for the requested view. The front view never uses the 3/4 composition reference image. */
export const compositionRulesForView = (shape: string, view: RenderView) =>
  view === "front" ? [FRONT_COMPOSITION_RULES, PLAIN_FRONT_RULE].join(" ") : compositionRulesFor(shape);

/** Cache key suffix: 3/4 keys stay unchanged so existing renders keep working. */
export const viewKey = (key: string, view: RenderView) => (view === "front" ? `${key}|front` : key);

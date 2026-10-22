export const COMPOSITION_REFERENCE_URL = "https://wmefczrhnsqicikveuhz.supabase.co/functions/v1/bespoke-render-image/renders/round/woolet-bespoke-round-british-racing-green-front-ice-translucent-temples-brushed-plano-06b46be2.png";
export const SHAPE_CONSTRAINTS: Record<string, string> = {
  "crown-panto": "Each lens has a FLAT, straight top edge (a crown line) running horizontally into the bridge, with a deep rounded panto bottom; the top of the front is a straight horizontal line, NOT a circle; keyhole bridge. Must not look round. Lens size and proportions exactly as the outline drawing: compact lenses, NOT aviator teardrops, keyhole bridge sitting high, no brow bar. Exactly two lenses, each with ONE continuous rim: never a doubled, nested or ghost inner rim, never a third lens or extra ring beside the hinge or the bridge.",
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
export const compositionRulesFor = (shape: string) => [COMPOSITION_RULES, ...(compositionReferenceFor(shape) ? ["The LAST image is the Round composition reference, the authority ONLY for camera angle, framing, lighting and background. Never copy its shape, colours, finish or lenses. Never copy its lens shape, bridge or proportions. Copy only camera angle, framing, light and background."] : [])].join(" ");
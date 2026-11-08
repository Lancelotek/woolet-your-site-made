import { BESPOKE_FACTS } from "@/content/bespokeFacts";

/**
 * Single source for the Bespoke video watch page (/en/bespoke/video).
 * Google only indexes a video when it is the main content of its page, so the
 * YouTube Short embedded on /en/bespoke gets its own watch page here.
 * The React page (src/pages/bespoke/Video.tsx) and the prerender metadata
 * (src/seo/metadata.ts) both read this file, so crawler HTML and the hydrated
 * page carry the same VideoObject.
 */
export const BESPOKE_VIDEO = {
  path: "/en/bespoke/video",
  youtubeId: "tSVsg9sj7y4",
  name: "Woolet Bespoke - made-to-measure glasses built from your phone",
  h1: "Woolet Bespoke: made-to-measure glasses, built from your phone",
  description:
    "Watch how a Woolet Bespoke frame is made: scan your face width with a phone camera in 60 seconds, design the shape and Mazzucchelli acetate, preview the frame on your face, approve the 3D model, and get it hand made in the EU in 2 weeks. Front widths 145-160 mm.",
  metaDescription:
    "Video: how Woolet Bespoke works - 60-second phone face scan, design, preview, 3D model approval and hand-made production in the EU. Front widths 145-160 mm.",
  uploadDate: "2026-10-08T12:25:18-07:00",
  durationIso: "PT28S",
  durationLabel: "28 seconds",
  width: 1080,
  height: 1920,
  /** hqdefault always exists for YouTube uploads (maxresdefault can 404 on Shorts). */
  thumbnailUrl: "https://i.ytimg.com/vi/tSVsg9sj7y4/hqdefault.jpg",
  embedUrl: "https://www.youtube.com/embed/tSVsg9sj7y4",
  watchUrl: "https://www.youtube.com/shorts/tSVsg9sj7y4",
  steps: [
    { title: "Scan", text: "Your phone camera measures your face width in about 60 seconds." },
    { title: "Design", text: `Pick one of four shapes (${BESPOKE_FACTS.shapes.join(", ")}) and the Italian Mazzucchelli acetate for the front and temples.` },
    { title: "Preview", text: "See the frame on your own face before you order." },
    { title: "Approve and build", text: "Approve your made-to-measure 3D model. The frame is hand made in the EU in 2 weeks." },
  ],
} as const;

export function bespokeVideoJsonLd() {
  const v = BESPOKE_VIDEO;
  const url = `https://woolet.co${v.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `${url}#video`,
    name: v.name,
    description: v.description,
    thumbnailUrl: [v.thumbnailUrl],
    uploadDate: v.uploadDate,
    duration: v.durationIso,
    embedUrl: v.embedUrl,
    url,
    width: v.width,
    height: v.height,
    inLanguage: "en",
    isFamilyFriendly: true,
    publisher: {
      "@type": "Organization",
      name: "Woolet",
      url: "https://woolet.co",
      logo: { "@type": "ImageObject", url: "https://woolet.co/og-image.png" },
    },
    about: { "@type": "Product", name: BESPOKE_FACTS.name, url: "https://woolet.co/en/bespoke" },
  };
}

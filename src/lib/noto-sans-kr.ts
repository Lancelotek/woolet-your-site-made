/**
 * Noto Sans KR used to be requested globally from index.html, which put a
 * render-blocking stylesheet on every page for the benefit of two surfaces:
 * the Korean landing pages and the Bespoke engraving preview (Malgun Gothic
 * equivalent). It is now injected on demand, non-blocking, only where needed.
 */
const HREF =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap";
const ID = "wlt-noto-sans-kr";

export function loadNotoSansKr(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(ID)) return;

  const preconnect = document.createElement("link");
  preconnect.rel = "preconnect";
  preconnect.href = "https://fonts.gstatic.com";
  preconnect.crossOrigin = "anonymous";
  document.head.appendChild(preconnect);

  const link = document.createElement("link");
  link.id = ID;
  link.rel = "stylesheet";
  link.href = HREF;
  // Non-blocking: parse the sheet only once it has arrived.
  link.media = "print";
  link.onload = () => {
    link.media = "all";
  };
  document.head.appendChild(link);
}

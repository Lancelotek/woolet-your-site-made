export const BLOG_FITLENS_HOOK_POSTS = new Set([
  "round-vs-square-glasses-wide-face",
  "glasses-for-wide-faces-guide",
  "how-to-measure-face-width-for-glasses",
  "how-to-tell-if-your-face-is-wide-or-narrow",
  "what-size-sunglasses-for-wide-faces",
  "eyeglass-frame-size-chart",
]);

export const BLOG_FITLENS_HOOK = {
  title: "Know your size in 20 seconds",
  body: "Your phone camera measures your face width and matches you to a frame. Free, no signup.",
  label: "Measure my face",
  href: "/en/fit",
} as const;

export function blogFitLensHookHtml(): string {
  return `<aside class="blog-fitlens-hook"><h2>${BLOG_FITLENS_HOOK.title}</h2><p>${BLOG_FITLENS_HOOK.body}</p><a href="${BLOG_FITLENS_HOOK.href}">${BLOG_FITLENS_HOOK.label}</a></aside>`;
}

export function insertBlogFitLensHook(html: string): string {
  const firstH2 = html.search(/<h2\b/i);
  if (firstH2 < 0) return `${html}${blogFitLensHookHtml()}`;
  return `${html.slice(0, firstH2)}${blogFitLensHookHtml()}${html.slice(firstH2)}`;
}
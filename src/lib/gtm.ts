/** Push a custom event to GTM dataLayer */
export const pushGtmEvent = (event: string, data?: Record<string, string | number | boolean>) => {
  if (typeof window !== "undefined" && (window as any).dataLayer) {
    (window as any).dataLayer.push({ event, ...data });
  }
};

/** Push a custom event to GTM dataLayer */
export const pushGtmEvent = (event: string, data?: Record<string, string | number | boolean>) => {
  if (typeof window !== "undefined") {
    const w = window as any;
    // Initialise the array if GTM has not loaded yet — otherwise events fired
    // before GTM initialises are silently discarded.
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event, ...data });
  }
};

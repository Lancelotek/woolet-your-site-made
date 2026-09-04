declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
      push?: unknown;
    };
    _fbq?: unknown;
    __wooletMetaDirect?: boolean;
  }
}

export {};

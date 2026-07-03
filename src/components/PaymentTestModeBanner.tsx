import { isTestMode } from "@/lib/stripe";

export function PaymentTestModeBanner() {
  if (!isTestMode()) return null;
  return (
    <div className="w-full bg-orange-100 border-b border-orange-300 px-4 py-2 text-center text-sm text-orange-800">
      Test mode — use card 4242 4242 4242 4242, any future date, any CVC.{" "}
      <a
        href="https://docs.lovable.dev/features/payments#test-and-live-environments"
        target="_blank"
        rel="noopener noreferrer"
        className="underline font-medium"
      >
        Learn about Stripe test and live payment environments
      </a>
    </div>
  );
}

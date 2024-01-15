import { getEnvVar } from '@/utils/get-env-var';
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(
      getEnvVar(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')
    );
  }

  return stripePromise;
}

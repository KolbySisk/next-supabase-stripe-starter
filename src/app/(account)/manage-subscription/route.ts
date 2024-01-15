import { redirect } from 'next/navigation';

import { getCustomerId } from '@/features/account/controllers/get-customer-id';
import { getSession } from '@/features/account/controllers/get-session';
import { stripeAdmin } from '@/libs/stripe/stripe-admin';
import { getURL } from '@/utils/get-url';

export const dynamic = 'force-dynamic';

export async function GET() {
  // 1. Get the user from session
  const session = await getSession();

  if (!session || !session.user.id) {
    throw Error('Could not get userId');
  }

  // 2. Retrieve or create the customer in Stripe
  const customer = await getCustomerId({
    userId: session.user.id,
  });

  if (!customer) {
    throw Error('Could not get customer');
  }

  // 3. Create portal link and redirect user
  const { url } = await stripeAdmin.billingPortal.sessions.create({
    customer,
    return_url: `${getURL()}/account`,
  });

  redirect(url);
}

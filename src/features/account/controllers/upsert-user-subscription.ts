import Stripe from 'stripe';

import { stripeAdmin } from '@/libs/stripe/stripe-admin';
import { supabaseAdminClient } from '@/libs/supabase/supabase-admin';
import type { Database } from '@/libs/supabase/types';
import { toDateTime } from '@/utils/to-date-time';
import { AddressParam } from '@stripe/stripe-js';

export async function upsertUserSubscription({
  subscriptionId,
  customerId,
  isCreateAction,
}: {
  subscriptionId: string;
  customerId: string;
  isCreateAction?: boolean;
}) {
  // Get customer's userId from mapping table.
  const { data: customerData, error: noCustomerError } = await supabaseAdminClient
    .from('customers')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  if (noCustomerError) throw noCustomerError;

  const { id: userId } = customerData!;

  const subscription = await stripeAdmin.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method'],
  });

  // Upsert the latest status of the subscription object.
  const subscriptionData: Database['public']['Tables']['subscriptions']['Insert'] = {
    id: subscription.id,
    user_id: userId,
    metadata: subscription.metadata,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: subscription.cancel_at ? toDateTime(subscription.cancel_at).toISOString() : null,
    canceled_at: subscription.canceled_at ? toDateTime(subscription.canceled_at).toISOString() : null,
    current_period_start: toDateTime(subscription.current_period_start).toISOString(),
    current_period_end: toDateTime(subscription.current_period_end).toISOString(),
    created: toDateTime(subscription.created).toISOString(),
    ended_at: subscription.ended_at ? toDateTime(subscription.ended_at).toISOString() : null,
    trial_start: subscription.trial_start ? toDateTime(subscription.trial_start).toISOString() : null,
    trial_end: subscription.trial_end ? toDateTime(subscription.trial_end).toISOString() : null,
  };

  const { error } = await supabaseAdminClient.from('subscriptions').upsert([subscriptionData]);
  if (error) {
    throw error;
  }
  console.info(`Inserted/updated subscription [${subscription.id}] for user [${userId}]`);

  // For a new subscription copy the billing details to the customer object.
  // NOTE: This is a costly operation and should happen at the very end.
  if (isCreateAction && subscription.default_payment_method && userId) {
    await copyBillingDetailsToCustomer(userId, subscription.default_payment_method as Stripe.PaymentMethod);
  }
}

const copyBillingDetailsToCustomer = async (userId: string, paymentMethod: Stripe.PaymentMethod) => {
  const customer = paymentMethod.customer;
  if (typeof customer !== 'string') {
    throw new Error('Customer id not found');
  }

  const { name, phone, address } = paymentMethod.billing_details;
  if (!name || !phone || !address) return;

  await stripeAdmin.customers.update(customer, { name, phone, address: address as AddressParam });

  const { error } = await supabaseAdminClient
    .from('users')
    .update({
      billing_address: { ...address },
      payment_method: { ...paymentMethod[paymentMethod.type] },
    })
    .eq('id', userId);

  if (error) {
    throw error;
  }
};

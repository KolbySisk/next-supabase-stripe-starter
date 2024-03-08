import Stripe from 'stripe';

import { supabaseAdminClient } from '@/libs/supabase/supabase-admin';
import type { Database } from '@/libs/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];

export async function upsertProduct(product: Stripe.Product) {
  const productData: Product = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? null,
    image: product.images?.[0] ?? null,
    metadata: product.metadata,
  };

  const { error } = await supabaseAdminClient.from('products').upsert([productData]);

  if (error) {
    throw error;
  } else {
    console.info(`Product inserted/updated: ${product.id}`);
  }
}

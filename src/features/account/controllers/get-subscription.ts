import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

export async function getSubscription() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  if (error) {
    console.error(error);
  }

  return data;
}

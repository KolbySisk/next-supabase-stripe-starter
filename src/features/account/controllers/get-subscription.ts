import { supabaseServerClient } from '@/libs/supabase/supabase-server-client';

export async function getSubscription() {
  const supabase = supabaseServerClient();

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  console.error(error);

  return data;
}

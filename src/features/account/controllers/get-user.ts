import { supabaseServerClient } from '@/libs/supabase/supabase-server-client';

export async function getUser() {
  const supabase = supabaseServerClient();

  const { data, error } = await supabase.from('users').select('*').single();

  console.error(error);

  return data;
}

import { cache } from 'react';
import { cookies } from 'next/headers';

import { Database } from '@/libs/supabase/types';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabaseServerClient = cache(() => createServerComponentClient<Database>({ cookies }));

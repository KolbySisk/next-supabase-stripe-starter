'use client';

import { createContext, PropsWithChildren, useContext, useState } from 'react';

import type { Database } from '@/libs/supabase/types';
import type { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

type SupabaseContext = {
  supabase: SupabaseClient<Database>;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export function SupabaseProvider({ children }: PropsWithChildren) {
  const [supabase] = useState(() => createPagesBrowserClient());

  return (
    <Context.Provider value={{ supabase }}>
      <>{children}</>
    </Context.Provider>
  );
}

export function useSupabase() {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider');
  }

  return context;
}

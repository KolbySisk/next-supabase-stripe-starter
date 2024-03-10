// ref: https://github.com/vercel/next.js/blob/canary/examples/with-supabase/app/auth/callback/route.ts

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import { getURL } from '@/utils/get-url';

const siteUrl = getURL();

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.redirect(`${siteUrl}/login`);
    }

    // Check if user is subscribed, if not redirect to pricing page
    const { data: userSubscription } = await supabase
      .from('subscriptions')
      .select('*, prices(*, products(*))')
      .in('status', ['trialing', 'active'])
      .maybeSingle();

    if (!userSubscription) {
      return NextResponse.redirect(`${siteUrl}/pricing`);
    } else {
      return NextResponse.redirect(`${siteUrl}`);
    }
  }

  return NextResponse.redirect(siteUrl);
}

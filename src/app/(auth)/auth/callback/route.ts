// ref: https://github.com/vercel/next.js/blob/canary/examples/with-supabase/app/auth/callback/route.ts

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import { EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const next = requestUrl.searchParams.get('next') ?? '/';

  console.log('Auth Callback - Params:', { code, token_hash, type, next });
  console.log('Auth Callback - Cookies:', request.cookies.getAll().map(c => ({ name: c.name, value: c.value?.substring(0, 10) + '...' })));

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete('code');
  redirectTo.searchParams.delete('token_hash');
  redirectTo.searchParams.delete('type');
  redirectTo.searchParams.delete('next');

  const supabase = await createSupabaseServerClient();
  let sessionError = null;

  if (token_hash && type) {
    console.log('Auth Callback - Verifying OTP (Magic Link/Email OTP)');
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (error) {
      console.error('Auth Callback - Error verifying OTP:', error);
      sessionError = error;
      redirectTo.pathname = '/login';
      redirectTo.searchParams.set('error', 'otp_verification_failed');
      redirectTo.searchParams.set('error_description', error.message);
    }
  } else if (code) {
    console.log('Auth Callback - Exchanging Code for Session (PKCE)');
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('Auth Callback - Error exchanging code:', error);
      sessionError = error;
      redirectTo.pathname = '/login';
      redirectTo.searchParams.set('error', 'code_exchange_failed');
      redirectTo.searchParams.set('error_description', error.message);
    }
  } else {
    console.log('Auth Callback - No token_hash or code found. Redirecting to login.');
    redirectTo.pathname = '/login';
    redirectTo.searchParams.set('error', 'missing_auth_param');
    return NextResponse.redirect(redirectTo);
  }

  if (!sessionError) {
    const { data: { user }, error: getUserError } = await supabase.auth.getUser();

    if (getUserError) {
      console.error('Auth Callback - Error getting user after auth:', getUserError);
      redirectTo.pathname = '/login';
      redirectTo.searchParams.set('error', 'get_user_failed');
      redirectTo.searchParams.set('error_description', getUserError.message);
      return NextResponse.redirect(redirectTo);
    }

    if (!user) {
      console.log('Auth Callback - No user found after auth. Redirecting to login.');
      redirectTo.pathname = '/login';
      redirectTo.searchParams.set('error', 'no_user_after_auth');
      return NextResponse.redirect(redirectTo);
    }

    console.log('Auth Callback - User authenticated:', user.id);

    const { data: userSubscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*, prices(*, products(*))')
      .in('status', ['trialing', 'active'])
      .eq('user_id', user.id)
      .maybeSingle();

    if (subError) {
      console.error('Auth Callback - Error checking subscription:', subError);
    } else if (!userSubscription) {
      console.log('Auth Callback - No active subscription found, redirecting to pricing.');
      redirectTo.pathname = '/pricing';
      redirectTo.searchParams.delete('error');
      redirectTo.searchParams.delete('error_description');
    } else {
       console.log('Auth Callback - Active subscription found, redirecting to:', redirectTo.pathname);
    }
  }

  console.log('Auth Callback - Final Redirect URL:', redirectTo.toString());
  return NextResponse.redirect(redirectTo);
}

import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from './env';

export function createClient() {
  if (typeof window === 'undefined') {
    return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    });
  }
  return createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
}

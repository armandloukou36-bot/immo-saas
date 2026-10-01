import 'server-only';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

const URL: string = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const KEY: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!URL || !KEY) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY doivent être définies (voir .env.local).'
  );
}

export const SUPABASE_URL = URL;
export const SUPABASE_ANON_KEY = KEY;

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Client Supabase côté serveur, lié aux cookies de la requête.
 * Toutes les requêtes passent par RLS : chaque organisation ne voit
 * que ses propres données.
 */
export function createServerSupabase() {
  const cookieStore = cookies();

  return createServerClient(URL, KEY, {
    cookies: {
      getAll(): { name: string; value: string }[] {
        return cookieStore.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Appelé depuis un Server Component en lecture seule : les cookies
          // sont rafraîchis par le middleware, l'échec est sans conséquence.
        }
      },
    },
  });
}

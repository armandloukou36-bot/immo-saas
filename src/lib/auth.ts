import 'server-only';
import { redirect } from 'next/navigation';
import { createServerSupabase } from './supabase';

export type SessionUser = {
  id: string;
  org_id: string;
  email: string;
  full_name: string;
  role: string;
  org_name: string;
};

/* ------------------------------------------------------------------ */
/* Lecture de la session                                               */
/* ------------------------------------------------------------------ */

/**
 * Retourne l'utilisateur connecté avec son organisation, ou null.
 * `getUser()` valide le jeton auprès de Supabase, contrairement à
 * `getSession()` qui se contente de lire le cookie.
 */
export async function getSession(): Promise<SessionUser | null> {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, full_name, role, enabled, organizations(name)')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || profile.enabled === false) return null;

  const org = Array.isArray(profile.organizations) ? profile.organizations[0] : profile.organizations;

  return {
    id: user.id,
    org_id: profile.organization_id as string,
    email: user.email ?? '',
    full_name: (profile.full_name as string) ?? user.email ?? '',
    role: (profile.role as string) ?? 'agent',
    org_name: (org?.name as string) ?? 'Mon organisation',
  };
}

/** Variante pour les Server Actions : redirige si non connecté. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect('/login');
  return user;
}

/* ------------------------------------------------------------------ */
/* Actions d'authentification                                          */
/* ------------------------------------------------------------------ */

export type AuthResult = { ok: true } | { ok: false; error: string };

/** Traduit les messages d'erreur Supabase en français. */
function messageFor(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Email ou mot de passe incorrect.';
  if (m.includes('email not confirmed')) return 'Votre email doit être confirmé avant de vous connecter.';
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'Un compte existe déjà avec cet email.';
  if (m.includes('password should be at least') || m.includes('password is too short'))
    return 'Le mot de passe doit contenir au moins 8 caractères.';
  if (m.includes('unable to validate email') || m.includes('invalid email')) return 'Adresse email invalide.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Trop de tentatives. Réessayez dans quelques minutes.';
  if (m.includes('signups not allowed')) return 'Les inscriptions sont désactivées sur ce projet.';
  return 'Une erreur est survenue. Veuillez réessayer.';
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const supabase = createServerSupabase();

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) return { ok: false, error: messageFor(error.message) };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);
  }

  return { ok: true };
}

export async function register(input: {
  organizationName: string;
  fullName: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const supabase = createServerSupabase();

  // Le trigger `on_auth_user_created` crée l'organisation et le profil admin
  // à partir de ces métadonnées.
  const { error } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: {
        organization_name: input.organizationName.trim(),
        full_name: input.fullName.trim(),
      },
    },
  });

  if (error) return { ok: false, error: messageFor(error.message) };
  return { ok: true };
}

export async function logout(): Promise<void> {
  const supabase = createServerSupabase();
  await supabase.auth.signOut();
}

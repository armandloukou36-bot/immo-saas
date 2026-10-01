import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';
import { SettingsClient } from './SettingsClient';
import type { Organization, TeamUser } from '@/lib/types';

export const metadata = { title: 'Paramètres — IMMO SAAS' };

export default async function SettingsPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const supabase = createServerSupabase();

  const [{ data: organization }, { data: users }] = await Promise.all([
    supabase.from('organizations').select('*').eq('id', user.org_id).maybeSingle(),
    supabase
      .from('profiles')
      .select('id, email, full_name, role, enabled, last_login_at, created_at')
      .eq('organization_id', user.org_id)
      .order('created_at', { ascending: true }),
  ]);

  if (!organization) redirect('/login');

  return (
    <SettingsClient
      organization={organization as Organization}
      users={(users ?? []) as TeamUser[]}
      currentUser={user}
    />
  );
}

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';
import { PropertiesClient } from './PropertiesClient';
import type { Property } from '@/lib/types';

export const metadata = { title: 'Biens — IMMO SAAS' };

export default async function PropertiesPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const supabase = createServerSupabase();
  const { data } = await supabase
    .from('properties')
    .select('*')
    .eq('organization_id', user.org_id)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  return <PropertiesClient properties={(data ?? []) as Property[]} />;
}

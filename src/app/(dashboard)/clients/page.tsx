import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';
import { ClientsClient } from './ClientsClient';
import type { ClientWithProperty, Property } from '@/lib/types';

export const metadata = { title: 'Clients — IMMO SAAS' };

export default async function ClientsPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const supabase = createServerSupabase();

  const [{ data: clients }, { data: properties }] = await Promise.all([
    supabase
      .from('clients')
      .select('*, properties(name)')
      .eq('organization_id', user.org_id)
      .order('created_at', { ascending: false }),
    supabase.from('properties').select('*').eq('organization_id', user.org_id).order('name', { ascending: true }),
  ]);

  // Aplatit la relation « properties(name) » en property_name.
  const shaped = (clients ?? []).map((row) => {
    const rel = Array.isArray(row.properties) ? row.properties[0] : row.properties;
    const { properties: _drop, ...rest } = row as Record<string, unknown> & { properties?: unknown };
    return { ...rest, property_name: (rel as { name?: string } | null)?.name ?? null };
  }) as unknown as ClientWithProperty[];

  return <ClientsClient clients={shaped} properties={(properties ?? []) as Property[]} />;
}

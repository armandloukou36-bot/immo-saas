import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';
import { LeasesClient } from './LeasesClient';
import type { Client, LeaseWithRelations, Property } from '@/lib/types';

export const metadata = { title: 'Baux — IMMO SAAS' };

export default async function LeasesPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const supabase = createServerSupabase();

  const [{ data: leases }, { data: properties }, { data: clients }] = await Promise.all([
    supabase
      .from('leases')
      .select('*, properties(name), clients(full_name)')
      .eq('organization_id', user.org_id)
      .order('created_at', { ascending: false }),
    supabase.from('properties').select('*').eq('organization_id', user.org_id).order('name', { ascending: true }),
    supabase
      .from('clients')
      .select('*')
      .eq('organization_id', user.org_id)
      .in('type', ['locataire', 'prospect', 'vendeur', 'autre'])
      .order('full_name', { ascending: true }),
  ]);

  const shaped = (leases ?? []).map((row) => {
    const r = row as Record<string, unknown> & { properties?: unknown; clients?: unknown };
    const prop = Array.isArray(r.properties) ? r.properties[0] : r.properties;
    const cli = Array.isArray(r.clients) ? r.clients[0] : r.clients;
    const { properties: _p, clients: _c, ...rest } = r;
    return {
      ...rest,
      property_name: (prop as { name?: string } | null)?.name ?? null,
      client_name: (cli as { full_name?: string } | null)?.full_name ?? null,
    };
  }) as unknown as LeaseWithRelations[];

  return (
    <LeasesClient
      leases={shaped}
      properties={(properties ?? []) as Property[]}
      clients={(clients ?? []) as Client[]}
    />
  );
}

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';
import { InvoicesClient } from './InvoicesClient';
import type { Client, InvoiceWithRelations, Lease, Payment, Property } from '@/lib/types';

export const metadata = { title: 'Factures — IMMO SAAS' };

export default async function InvoicesPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const supabase = createServerSupabase();

  const [{ data: invoices }, { data: properties }, { data: clients }, { data: leases }, { data: payments }] =
    await Promise.all([
      supabase
        .from('invoices')
        .select('*, clients(full_name), properties(name), leases(reference), payments(amount)')
        .eq('organization_id', user.org_id)
        .order('created_at', { ascending: false }),
      supabase.from('properties').select('*').eq('organization_id', user.org_id).order('name', { ascending: true }),
      supabase.from('clients').select('*').eq('organization_id', user.org_id).order('full_name', { ascending: true }),
      supabase
        .from('leases')
        .select('*, clients(full_name), properties(name)')
        .eq('organization_id', user.org_id)
        .in('status', ['active', 'pending'])
        .order('created_at', { ascending: false }),
      supabase
        .from('payments')
        .select('*')
        .eq('organization_id', user.org_id)
        .order('payment_date', { ascending: false })
        .limit(50),
    ]);

  const shapedInvoices = (invoices ?? []).map((row) => {
    const r = row as Record<string, unknown> & {
      clients?: unknown;
      properties?: unknown;
      leases?: unknown;
      payments?: unknown;
    };
    const cli = Array.isArray(r.clients) ? r.clients[0] : r.clients;
    const prop = Array.isArray(r.properties) ? r.properties[0] : r.properties;
    const lea = Array.isArray(r.leases) ? r.leases[0] : r.leases;
    const pays = Array.isArray(r.payments) ? r.payments : [];
    const { clients: _c, properties: _p, leases: _l, payments: _pay, ...rest } = r;
    return {
      ...rest,
      client_name: (cli as { full_name?: string } | null)?.full_name ?? null,
      property_name: (prop as { name?: string } | null)?.name ?? null,
      lease_reference: (lea as { reference?: string } | null)?.reference ?? null,
      paid_total: (pays as { amount: number | null }[]).reduce((sum, p) => sum + Number(p.amount ?? 0), 0),
    };
  }) as unknown as InvoiceWithRelations[];

  const shapedLeases = (leases ?? []).map((row) => {
    const r = row as Record<string, unknown> & { clients?: unknown; properties?: unknown };
    const cli = Array.isArray(r.clients) ? r.clients[0] : r.clients;
    const prop = Array.isArray(r.properties) ? r.properties[0] : r.properties;
    const { clients: _c, properties: _p, ...rest } = r;
    return {
      ...rest,
      client_name: (cli as { full_name?: string } | null)?.full_name ?? null,
      property_name: (prop as { name?: string } | null)?.name ?? null,
    };
  }) as unknown as (Lease & { client_name: string | null; property_name: string | null })[];

  return (
    <InvoicesClient
      invoices={shapedInvoices}
      properties={(properties ?? []) as Property[]}
      clients={(clients ?? []) as Client[]}
      leases={shapedLeases}
      payments={(payments ?? []) as Payment[]}
    />
  );
}

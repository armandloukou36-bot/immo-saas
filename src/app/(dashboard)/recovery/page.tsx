import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';
import { RecoveryClient } from './RecoveryClient';
import type { InvoiceWithRelations, RecoveryWithRelations } from '@/lib/types';

export const metadata = { title: 'Recouvrement — IMMO SAAS' };

export default async function RecoveryPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const supabase = createServerSupabase();

  const [{ data: cases }, { data: allInvoices }, { data: openCases }] = await Promise.all([
    supabase
      .from('recovery_cases')
      .select('*, clients(full_name), properties(name), invoices(invoice_number)')
      .eq('organization_id', user.org_id)
      .order('created_at', { ascending: false }),
    supabase
      .from('invoices')
      .select('*, clients(full_name), properties(name), leases(reference), payments(amount)')
      .eq('organization_id', user.org_id)
      .in('status', ['pending', 'overdue'])
      .order('due_date', { ascending: true }),
    supabase
      .from('recovery_cases')
      .select('invoice_id')
      .eq('organization_id', user.org_id)
      .not('status', 'in', '("resolved","closed","waived")'),
  ]);

  const shapeInvoice = (row: Record<string, unknown>) => {
    const cli = Array.isArray(row.clients) ? row.clients[0] : row.clients;
    const prop = Array.isArray(row.properties) ? row.properties[0] : row.properties;
    const lea = Array.isArray(row.leases) ? row.leases[0] : row.leases;
    const pays = Array.isArray(row.payments) ? row.payments : [];
    const { clients: _c, properties: _p, leases: _l, payments: _pay, ...rest } = row;
    return {
      ...rest,
      id: row.id as string,
      client_name: (cli as { full_name?: string } | null)?.full_name ?? null,
      property_name: (prop as { name?: string } | null)?.name ?? null,
      lease_reference: (lea as { reference?: string } | null)?.reference ?? null,
      paid_total: (pays as { amount: number | null }[]).reduce((sum, p) => sum + Number(p.amount ?? 0), 0),
    };
  };

  const shapedCases = (cases ?? []).map((row) => {
    const r = row as Record<string, unknown> & { clients?: unknown; properties?: unknown; invoices?: unknown };
    const cli = Array.isArray(r.clients) ? r.clients[0] : r.clients;
    const prop = Array.isArray(r.properties) ? r.properties[0] : r.properties;
    const inv = Array.isArray(r.invoices) ? r.invoices[0] : r.invoices;
    const { clients: _c, properties: _p, invoices: _i, ...rest } = r;
    return {
      ...rest,
      client_name: (cli as { full_name?: string } | null)?.full_name ?? null,
      property_name: (prop as { name?: string } | null)?.name ?? null,
      invoice_number: (inv as { invoice_number?: string } | null)?.invoice_number ?? null,
    };
  }) as unknown as RecoveryWithRelations[];

  // Factures impayées sans dossier de recouvrement ouvert.
  const withCase = new Set((openCases ?? []).map((c) => c.invoice_id as string).filter(Boolean));
  const eligibleInvoices = (allInvoices ?? [])
    .map((row) => shapeInvoice(row as Record<string, unknown>))
    .filter((inv) => !withCase.has(inv.id as string)) as unknown as InvoiceWithRelations[];

  return <RecoveryClient cases={shapedCases} eligibleInvoices={eligibleInvoices} currentUser={user.full_name} />;
}

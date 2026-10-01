import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';
import { RemindersClient } from './RemindersClient';
import type { Client, InvoiceWithRelations, ReminderWithRelations } from '@/lib/types';

export const metadata = { title: 'Relances — IMMO SAAS' };

export default async function RemindersPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const supabase = createServerSupabase();

  const [{ data: reminders }, { data: clients }, { data: unpaid }] = await Promise.all([
    supabase
      .from('reminders')
      .select('*, clients(full_name), invoices(invoice_number)')
      .eq('organization_id', user.org_id)
      .order('scheduled_date', { ascending: false }),
    supabase.from('clients').select('*').eq('organization_id', user.org_id).order('full_name', { ascending: true }),
    supabase
      .from('invoices')
      .select('*, clients(full_name), properties(name), leases(reference), payments(amount)')
      .eq('organization_id', user.org_id)
      .in('status', ['pending', 'overdue'])
      .order('due_date', { ascending: true }),
  ]);

  const shapedReminders = (reminders ?? []).map((row) => {
    const r = row as Record<string, unknown> & { clients?: unknown; invoices?: unknown };
    const cli = Array.isArray(r.clients) ? r.clients[0] : r.clients;
    const inv = Array.isArray(r.invoices) ? r.invoices[0] : r.invoices;
    const { clients: _c, invoices: _i, ...rest } = r;
    return {
      ...rest,
      client_name: (cli as { full_name?: string } | null)?.full_name ?? null,
      invoice_number: (inv as { invoice_number?: string } | null)?.invoice_number ?? null,
    };
  }) as unknown as ReminderWithRelations[];

  const shapedUnpaid = (unpaid ?? []).map((row) => {
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

  return (
    <RemindersClient
      reminders={shapedReminders}
      clients={(clients ?? []) as Client[]}
      unpaidInvoices={shapedUnpaid}
    />
  );
}

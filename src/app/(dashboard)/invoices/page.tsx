import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { InvoicesClient } from './InvoicesClient';
import type { Client, InvoiceWithRelations, Lease, Payment, Property } from '@/lib/types';

export const metadata = { title: 'Factures — IMMO SAAS' };

export default function InvoicesPage() {
  const user = getSession();
  if (!user) redirect('/login');
  const db = getDb();

  const invoices = db
    .prepare(
      `SELECT i.*, c.full_name AS client_name, p.name AS property_name, l.reference AS lease_reference,
              (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = i.id) AS paid_total
       FROM invoices i
       LEFT JOIN clients c ON c.id = i.client_id
       LEFT JOIN properties p ON p.id = i.property_id
       LEFT JOIN leases l ON l.id = i.lease_id
       WHERE i.org_id = ?
       ORDER BY i.created_at DESC, i.due_date DESC`
    )
    .all(user.org_id) as InvoiceWithRelations[];

  const properties = db
    .prepare('SELECT * FROM properties WHERE org_id = ? ORDER BY name ASC')
    .all(user.org_id) as Property[];

  const clients = db.prepare('SELECT * FROM clients WHERE org_id = ? ORDER BY full_name ASC').all(user.org_id) as Client[];

  const leases = db
    .prepare(
      `SELECT l.*, c.full_name AS client_name, p.name AS property_name
       FROM leases l
       LEFT JOIN clients c ON c.id = l.client_id
       LEFT JOIN properties p ON p.id = l.property_id
       WHERE l.org_id = ? AND l.status IN ('active','pending')
       ORDER BY l.created_at DESC`
    )
    .all(user.org_id) as (Lease & { client_name: string | null; property_name: string | null })[];

  const payments = db
    .prepare('SELECT * FROM payments WHERE org_id = ? ORDER BY payment_date DESC, created_at DESC LIMIT 50')
    .all(user.org_id) as Payment[];

  return <InvoicesClient invoices={invoices} properties={properties} clients={clients} leases={leases} payments={payments} />;
}

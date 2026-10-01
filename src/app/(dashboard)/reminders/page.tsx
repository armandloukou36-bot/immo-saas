import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { RemindersClient } from './RemindersClient';
import type { Client, InvoiceWithRelations, ReminderWithRelations } from '@/lib/types';

export const metadata = { title: 'Relances — IMMO SAAS' };

export default function RemindersPage() {
  const user = getSession();
  if (!user) redirect('/login');
  const db = getDb();

  const reminders = db
    .prepare(
      `SELECT r.*, c.full_name AS client_name, i.invoice_number AS invoice_number
       FROM reminders r
       LEFT JOIN clients c ON c.id = r.client_id
       LEFT JOIN invoices i ON i.id = r.invoice_id
       WHERE r.org_id = ?
       ORDER BY r.scheduled_date DESC`
    )
    .all(user.org_id) as ReminderWithRelations[];

  const clients = db.prepare('SELECT * FROM clients WHERE org_id = ? ORDER BY full_name ASC').all(user.org_id) as Client[];

  // Factures non soldées : candidates à une relance.
  const unpaidInvoices = db
    .prepare(
      `SELECT i.*, c.full_name AS client_name, p.name AS property_name, l.reference AS lease_reference,
              (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = i.id) AS paid_total
       FROM invoices i
       LEFT JOIN clients c ON c.id = i.client_id
       LEFT JOIN properties p ON p.id = i.property_id
       LEFT JOIN leases l ON l.id = i.lease_id
       WHERE i.org_id = ? AND i.status IN ('pending','overdue')
       ORDER BY i.due_date ASC`
    )
    .all(user.org_id) as InvoiceWithRelations[];

  return <RemindersClient reminders={reminders} clients={clients} unpaidInvoices={unpaidInvoices} />;
}

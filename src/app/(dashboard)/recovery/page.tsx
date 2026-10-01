import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { RecoveryClient } from './RecoveryClient';
import type { InvoiceWithRelations, RecoveryWithRelations } from '@/lib/types';

export const metadata = { title: 'Recouvrement — IMMO SAAS' };

export default function RecoveryPage() {
  const user = getSession();
  if (!user) redirect('/login');
  const db = getDb();

  const cases = db
    .prepare(
      `SELECT rc.*, c.full_name AS client_name, p.name AS property_name, i.invoice_number AS invoice_number
       FROM recovery_cases rc
       LEFT JOIN clients c ON c.id = rc.client_id
       LEFT JOIN properties p ON p.id = rc.property_id
       LEFT JOIN invoices i ON i.id = rc.invoice_id
       WHERE rc.org_id = ?
       ORDER BY rc.created_at DESC`
    )
    .all(user.org_id) as RecoveryWithRelations[];

  // Factures impayées sans dossier de recouvrement ouvert.
  const eligibleInvoices = db
    .prepare(
      `SELECT i.*, c.full_name AS client_name, p.name AS property_name, l.reference AS lease_reference,
              (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = i.id) AS paid_total
       FROM invoices i
       LEFT JOIN clients c ON c.id = i.client_id
       LEFT JOIN properties p ON p.id = i.property_id
       LEFT JOIN leases l ON l.id = i.lease_id
       WHERE i.org_id = ?
         AND i.status IN ('pending','overdue')
         AND i.id NOT IN (
           SELECT invoice_id FROM recovery_cases
           WHERE org_id = ? AND invoice_id IS NOT NULL AND status NOT IN ('resolved','closed','waived')
         )
       ORDER BY i.due_date ASC`
    )
    .all(user.org_id, user.org_id) as InvoiceWithRelations[];

  return <RecoveryClient cases={cases} eligibleInvoices={eligibleInvoices} currentUser={user.full_name} />;
}

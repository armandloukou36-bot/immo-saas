import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { LeasesClient } from './LeasesClient';
import type { Client, LeaseWithRelations, Property } from '@/lib/types';

export const metadata = { title: 'Baux — IMMO SAAS' };

export default function LeasesPage() {
  const user = getSession();
  if (!user) redirect('/login');
  const db = getDb();

  const leases = db
    .prepare(
      `SELECT l.*, p.name AS property_name, c.full_name AS client_name
       FROM leases l
       LEFT JOIN properties p ON p.id = l.property_id
       LEFT JOIN clients c ON c.id = l.client_id
       WHERE l.org_id = ?
       ORDER BY l.created_at DESC`
    )
    .all(user.org_id) as LeaseWithRelations[];

  const properties = db
    .prepare('SELECT * FROM properties WHERE org_id = ? ORDER BY name ASC')
    .all(user.org_id) as Property[];

  const clients = db
    .prepare(`SELECT * FROM clients WHERE org_id = ? AND type IN ('locataire','prospect','vendeur','autre') ORDER BY full_name ASC`)
    .all(user.org_id) as Client[];

  return <LeasesClient leases={leases} properties={properties} clients={clients} />;
}

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { all } from '@/lib/db';
import { ClientsClient } from './ClientsClient';
import type { ClientWithProperty, Property } from '@/lib/types';

export const metadata = { title: 'Clients — IMMO SAAS' };

export default function ClientsPage() {
  const user = getSession();
  if (!user) redirect('/login');

  const clients = all<ClientWithProperty>(
    `SELECT c.*, p.name AS property_name
       FROM clients c
       LEFT JOIN properties p ON p.id = c.property_id
       WHERE c.org_id = ?
       ORDER BY c.created_at DESC`,
    user.org_id
  );

  const properties = all<Property>('SELECT * FROM properties WHERE org_id = ? ORDER BY name ASC', user.org_id);

  return <ClientsClient clients={clients} properties={properties} />;
}

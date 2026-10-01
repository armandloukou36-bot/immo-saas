import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { all } from '@/lib/db';
import { PropertiesClient } from './PropertiesClient';
import type { Property } from '@/lib/types';

export const metadata = { title: 'Biens — IMMO SAAS' };

export default function PropertiesPage() {
  const user = getSession();
  if (!user) redirect('/login');

  const properties = all<Property>('SELECT * FROM properties WHERE org_id = ? ORDER BY featured DESC, created_at DESC', user.org_id);

  return <PropertiesClient properties={properties} />;
}

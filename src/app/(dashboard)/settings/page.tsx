import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { SettingsClient } from './SettingsClient';
import type { Organization, TeamUser } from '@/lib/types';

export const metadata = { title: 'Paramètres — IMMO SAAS' };

export default function SettingsPage() {
  const user = getSession();
  if (!user) redirect('/login');
  const db = getDb();

  const organization = db.prepare('SELECT * FROM organizations WHERE id = ?').get(user.org_id) as Organization;

  const users = db
    .prepare(
      `SELECT id, email, full_name, role, enabled, last_login_at, created_at
       FROM users WHERE org_id = ? ORDER BY created_at ASC`
    )
    .all(user.org_id) as TeamUser[];

  return <SettingsClient organization={organization} users={users} currentUser={user} />;
}

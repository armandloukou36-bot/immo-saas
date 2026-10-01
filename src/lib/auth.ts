import 'server-only';
import { cookies } from 'next/headers';
import { randomBytes, randomUUID } from 'node:crypto';
import { getDb, hashPassword, one, verifyPassword } from './db';

const COOKIE = 'immo_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

export type SessionUser = {
  id: string;
  org_id: string;
  email: string;
  full_name: string;
  role: string;
  org_name: string;
};

type UserRow = {
  id: string;
  org_id: string;
  email: string;
  full_name: string;
  password_hash: string;
  role: string;
  enabled: number;
};

/** Crée une session et pose le cookie. */
export function createSession(userId: string): void {
  const db = getDb();
  const token = randomBytes(32).toString('hex');
  const now = new Date();
  const expires = new Date(now.getTime() + MAX_AGE * 1000);

  db.prepare('INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)').run(
    token,
    userId,
    expires.toISOString(),
    now.toISOString()
  );
  db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(now.toISOString(), userId);
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now.toISOString());

  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
}

/** Supprime la session courante. */
export function destroySession(): void {
  const token = cookies().get(COOKIE)?.value;
  if (token) {
    getDb().prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
  cookies().delete(COOKIE);
}

/** Retourne l'utilisateur connecté, ou null. */
export function getSession(): SessionUser | null {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;

  const row = one<SessionUser & { enabled: number }>(
    `SELECT u.id, u.org_id, u.email, u.full_name, u.role, u.enabled, o.name AS org_name
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     JOIN organizations o ON o.id = u.org_id
     WHERE s.token = ? AND s.expires_at > ?`,
    token,
    new Date().toISOString()
  );

  if (!row || row.enabled !== 1) return null;
  return {
    id: row.id,
    org_id: row.org_id,
    email: row.email,
    full_name: row.full_name,
    role: row.role,
    org_name: row.org_name,
  };
}

/* ------------------------------------------------------------------ */
/* Actions d'authentification                                          */
/* ------------------------------------------------------------------ */

export type AuthResult = { ok: true } | { ok: false; error: string };

export function login(email: string, password: string): AuthResult {
  const db = getDb();
  const user = one<UserRow>('SELECT * FROM users WHERE lower(email) = lower(?)', email.trim());

  if (!user || !verifyPassword(password, user.password_hash)) {
    return { ok: false, error: 'Email ou mot de passe incorrect.' };
  }
  if (user.enabled !== 1) {
    return { ok: false, error: 'Ce compte est désactivé.' };
  }

  createSession(user.id);
  db.prepare('INSERT INTO activity_log (id, org_id, user_id, action, detail, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    randomUUID(),
    user.org_id,
    user.id,
    'Connexion',
    `${user.full_name} s'est connecté`,
    new Date().toISOString()
  );
  return { ok: true };
}

export function register(input: {
  organizationName: string;
  fullName: string;
  email: string;
  password: string;
}): AuthResult {
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  const organizationName = input.organizationName.trim();
  const fullName = input.fullName.trim();

  if (!organizationName) return { ok: false, error: "Le nom de l'entreprise est requis." };
  if (!fullName) return { ok: false, error: 'Votre nom complet est requis.' };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: 'Adresse email invalide.' };
  if (input.password.length < 8) return { ok: false, error: 'Le mot de passe doit contenir au moins 8 caractères.' };

  const existing = db.prepare('SELECT id FROM users WHERE lower(email) = lower(?)').get(email);
  if (existing) return { ok: false, error: 'Un compte existe déjà avec cet email.' };

  const slugBase =
    organizationName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'agence';

  let slug = slugBase;
  let n = 1;
  while (db.prepare('SELECT id FROM organizations WHERE slug = ?').get(slug)) {
    slug = `${slugBase}-${n++}`;
  }

  const orgId = randomUUID();
  const userId = randomUUID();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO organizations (id, name, slug, plan, status, address, email, phone, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(orgId, organizationName, slug, 'free', 'active', null, email, null, now);

  db.prepare(
    `INSERT INTO users (id, org_id, email, full_name, password_hash, role, enabled, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(userId, orgId, email, fullName, hashPassword(input.password), 'admin', 1, now);

  db.prepare('INSERT INTO activity_log (id, org_id, user_id, action, detail, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    randomUUID(),
    orgId,
    userId,
    'Création de compte',
    `Organisation « ${organizationName} » créée`,
    now
  );

  createSession(userId);
  return { ok: true };
}

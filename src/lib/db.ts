import 'server-only';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID, scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'immo.db');

/* ------------------------------------------------------------------ */
/* Hachage de mot de passe (scrypt)                                    */
/* ------------------------------------------------------------------ */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

/* ------------------------------------------------------------------ */
/* Schéma                                                              */
/* ------------------------------------------------------------------ */

const SCHEMA = `
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'pro',
  status TEXT NOT NULL DEFAULT 'active',
  address TEXT,
  email TEXT,
  phone TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  enabled INTEGER NOT NULL DEFAULT 1,
  last_login_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'appartement',
  address TEXT NOT NULL,
  city TEXT,
  surface REAL,
  rooms INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  price REAL,
  rental_price REAL,
  status TEXT NOT NULL DEFAULT 'disponible',
  featured INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'locataire',
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  status TEXT NOT NULL DEFAULT 'actif',
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS leases (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  reference TEXT NOT NULL,
  property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
  client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
  start_date TEXT NOT NULL,
  end_date TEXT,
  monthly_rent REAL NOT NULL DEFAULT 0,
  deposit REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lease_id TEXT REFERENCES leases(id) ON DELETE SET NULL,
  client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
  property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  due_date TEXT NOT NULL,
  paid_date TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  recurrence TEXT NOT NULL DEFAULT 'monthly',
  description TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_id TEXT REFERENCES invoices(id) ON DELETE CASCADE,
  amount REAL NOT NULL DEFAULT 0,
  payment_date TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'cash',
  reference TEXT,
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_id TEXT REFERENCES invoices(id) ON DELETE CASCADE,
  client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'rent_reminder',
  subject TEXT,
  message TEXT,
  scheduled_date TEXT NOT NULL,
  sent_at TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  channel TEXT NOT NULL DEFAULT 'email',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS recovery_cases (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  reference TEXT NOT NULL,
  invoice_id TEXT REFERENCES invoices(id) ON DELETE CASCADE,
  client_id TEXT REFERENCES clients(id) ON DELETE SET NULL,
  property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
  amount_due REAL NOT NULL DEFAULT 0,
  opened_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  assigned_to TEXT,
  resolution TEXT,
  notes TEXT,
  closure_date TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  user_id TEXT,
  action TEXT NOT NULL,
  detail TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_properties_org ON properties(org_id);
CREATE INDEX IF NOT EXISTS idx_clients_org ON clients(org_id);
CREATE INDEX IF NOT EXISTS idx_leases_org ON leases(org_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org ON invoices(org_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_reminders_org ON reminders(org_id);
CREATE INDEX IF NOT EXISTS idx_recovery_org ON recovery_cases(org_id);
CREATE INDEX IF NOT EXISTS idx_activity_org ON activity_log(org_id);
`;

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

function iso(d: Date): string {
  return d.toISOString();
}

function dateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return dateOnly(d);
}

function monthsFromNow(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + n);
  return dateOnly(d);
}

/* ------------------------------------------------------------------ */
/* Jeu de données de démonstration                                     */
/* ------------------------------------------------------------------ */

function seed(db: DatabaseSync) {
  const orgId = randomUUID();
  const userId = randomUUID();
  const now = iso(new Date());

  db.prepare(
    `INSERT INTO organizations (id, name, slug, plan, status, address, email, phone, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    orgId,
    'Mon Agence Immobilière',
    'mon-agence',
    'pro',
    'active',
    "Cocody Angré, Abidjan — Côte d'Ivoire",
    'contact@mon-agence.ci',
    '+225 27 22 58 09 36',
    now
  );

  db.prepare(
    `INSERT INTO users (id, org_id, email, full_name, password_hash, role, enabled, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    userId,
    orgId,
    'demo@immo-saas.app',
    'Administrateur',
    hashPassword('demo1234'),
    'admin',
    1,
    now
  );

  db.prepare(
    `INSERT INTO users (id, org_id, email, full_name, password_hash, role, enabled, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(randomUUID(), orgId, 'gestion@immo-saas.app', 'Mme Koné Solange', hashPassword('agent1234'), 'agent', 1, now);

  /* --- Biens --- */
  const propertiesData: [string, string, string, string, number, number, number, number, number, number, string, number][] = [
    ['Villa Cocody', 'villa', 'Cocody Angré, Abidjan', 'Cocody', 280, 5, 4, 3, 45000000, 2500000, 'loué', 1],
    ['Appartement Les Palmiers', 'appartement', 'Les Palmiers, Cocody', 'Cocody', 145, 3, 2, 2, 18500000, 1800000, 'disponible', 1],
    ['Terrain Angré', 'terrain', 'Angré, Cocody', 'Cocody', 500, 0, 0, 0, 12000000, 0, 'disponible', 0],
    ['Villa Monte-Carlo', 'villa', 'Monte-Carlo, Cocody', 'Cocody', 350, 6, 5, 4, 68000000, 3200000, 'loué', 1],
    ['Appartement Résidence du Lac', 'appartement', 'Résidence du Lac, Cocody', 'Cocody', 98, 3, 2, 1, 22000000, 1500000, 'loué', 0],
    ['Local Commercial Cocody Centre', 'local', 'Cocody Centre', 'Cocody', 120, 1, 0, 1, 9500000, 700000, 'en_negociation', 0],
    ['Villa Angré Residence', 'villa', 'Angré Residence, Cocody', 'Cocody', 420, 5, 4, 3, 55000000, 3200000, 'loué', 0],
    ['Bureau Plateau', 'bureau', 'Plateau, Abidjan', 'Plateau', 85, 2, 0, 1, 3500000, 450000, 'disponible', 0],
  ];

  const propertyIds: string[] = [];
  const insertProperty = db.prepare(
    `INSERT INTO properties (id, org_id, name, type, address, city, surface, rooms, bedrooms, bathrooms, price, rental_price, status, featured, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const p of propertiesData) {
    const id = randomUUID();
    propertyIds.push(id);
    insertProperty.run(id, orgId, p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], p[9], p[10], p[11], now);
  }

  /* --- Clients --- */
  const clientsData: [string, string, string, string, string, string, string][] = [
    ['locataire', 'M. Kouassi Jean-Baptiste', 'jean.kouassi@email.com', '+225 05 05 12 34 56', 'Cocody Angré', 'actif', '0'],
    ['locataire', 'Mme Diallo Amina', 'amina.diallo@email.com', '+225 07 07 98 76 54', 'Cocody', 'actif', '1'],
    ['locataire', 'M. Traoré Idriss', 'idriss.traore@email.com', '+225 05 05 23 45 67', 'Cocody', 'actif', '6'],
    ['propriétaire', 'Mme Koné Fatoumata', 'fatoumata.kone@email.com', '+225 07 07 34 56 78', 'Cocody', 'actif', '4'],
    ['locataire', 'M. Bamba Seydou', 'seydou.bamba@email.com', '+225 05 05 45 67 89', 'Cocody', 'actif', '3'],
    ['prospect', 'M. Guessan Koffi', 'koffi.guessan@email.com', '+225 07 07 56 78 90', 'Abidjan', 'lead', ''],
  ];

  const clientIds: string[] = [];
  const insertClient = db.prepare(
    `INSERT INTO clients (id, org_id, property_id, type, full_name, email, phone, city, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const c of clientsData) {
    const id = randomUUID();
    clientIds.push(id);
    insertClient.run(id, orgId, c[6] ? propertyIds[Number(c[6])] : null, c[0], c[1], c[2], c[3], c[4], c[5], now);
  }

  /* --- Baux --- */
  const leasesData: [number, number, number, number, number, number, string][] = [
    [0, 0, 2500000, 5000000, -9, 3, 'active'],
    [1, 1, 1800000, 3600000, -8, 4, 'active'],
    [6, 2, 3200000, 6400000, -10, 2, 'active'],
    [4, 3, 1500000, 3000000, -11, 1, 'active'],
    [3, 4, 3200000, 6400000, -7, 5, 'active'],
    [2, 5, 0, 0, -1, 0, 'draft'],
  ];

  const leaseIds: string[] = [];
  const insertLease = db.prepare(
    `INSERT INTO leases (id, org_id, reference, property_id, client_id, start_date, end_date, monthly_rent, deposit, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  leasesData.forEach((l, i) => {
    const id = randomUUID();
    leaseIds.push(id);
    insertLease.run(
      id,
      orgId,
      `LE-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
      propertyIds[l[0]],
      clientIds[l[1]],
      monthsFromNow(l[4]),
      l[5] > 0 ? monthsFromNow(l[4] + 12) : null,
      l[2],
      l[3],
      l[6],
      now
    );
  });

  /* --- Factures --- */
  const year = new Date().getFullYear();
  const invoicesData: [number, number, number, number, number, string, string | null, string][] = [
    [0, 0, 0, 2500000, 15, 'pending', null, 'monthly'],
    [1, 1, 1, 1800000, 10, 'paid', daysFromNow(-6), 'monthly'],
    [2, 2, 6, 3200000, 1, 'overdue', null, 'monthly'],
    [3, 3, 4, 1500000, 28, 'paid', daysFromNow(-12), 'monthly'],
    [4, 4, 3, 3200000, 1, 'pending', null, 'monthly'],
  ];

  const invoiceIds: string[] = [];
  const insertInvoice = db.prepare(
    `INSERT INTO invoices (id, org_id, lease_id, client_id, property_id, invoice_number, amount, due_date, paid_date, status, recurrence, description, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  invoicesData.forEach((inv, i) => {
    const id = randomUUID();
    invoiceIds.push(id);
    insertInvoice.run(
      id,
      orgId,
      leaseIds[inv[0]],
      clientIds[inv[1]],
      propertyIds[inv[2]],
      `INV-${year}-${String(i + 45).padStart(4, '0')}`,
      inv[3],
      daysFromNow(inv[4] - 30),
      inv[6],
      inv[5],
      inv[7],
      `Loyer mensuel — ${propertiesData[inv[2]][0]}`,
      now
    );
  });

  /* --- Paiements --- */
  const insertPayment = db.prepare(
    `INSERT INTO payments (id, org_id, invoice_id, amount, payment_date, method, reference, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  insertPayment.run(randomUUID(), orgId, invoiceIds[1], 1800000, daysFromNow(-6), 'mobile_money', 'MM-889201', now);
  insertPayment.run(randomUUID(), orgId, invoiceIds[3], 1500000, daysFromNow(-12), 'bank_transfer', 'BT-441209', now);

  /* --- Relances --- */
  const insertReminder = db.prepare(
    `INSERT INTO reminders (id, org_id, invoice_id, client_id, type, subject, message, scheduled_date, sent_at, status, channel, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  insertReminder.run(randomUUID(), orgId, invoiceIds[2], clientIds[2], 'rent_reminder', 'Rappel de loyer', 'Votre loyer est arrivé à échéance.', daysFromNow(-5), null, 'pending', 'email', now);
  insertReminder.run(randomUUID(), orgId, invoiceIds[4], clientIds[4], 'payment_reminder', 'Rappel de paiement', 'Merci de régulariser votre situation.', daysFromNow(3), null, 'pending', 'sms', now);
  insertReminder.run(randomUUID(), orgId, invoiceIds[2], clientIds[2], 'recovery_notice', 'Avis de recouvrement', 'Dossier transmis au service recouvrement.', daysFromNow(7), null, 'pending', 'email', now);
  insertReminder.run(randomUUID(), orgId, invoiceIds[1], clientIds[1], 'rent_reminder', 'Rappel de loyer', 'Loyer de mars à régler.', daysFromNow(-15), daysFromNow(-15), 'sent', 'email', now);
  insertReminder.run(randomUUID(), orgId, invoiceIds[0], clientIds[0], 'rent_reminder', 'Rappel de loyer', 'Loyer à régler avant échéance.', daysFromNow(-2), null, 'pending', 'email', now);
  insertReminder.run(randomUUID(), orgId, null, clientIds[5], 'general', 'Message général', 'Suite à votre demande de visite.', daysFromNow(-1), null, 'pending', 'sms', now);

  /* --- Recouvrement --- */
  const insertRecovery = db.prepare(
    `INSERT INTO recovery_cases (id, org_id, reference, invoice_id, client_id, property_id, amount_due, opened_at, status, assigned_to, notes, closure_date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  insertRecovery.run(randomUUID(), orgId, `REC-${year}-0001`, invoiceIds[2], clientIds[2], propertyIds[6], 3200000, daysFromNow(-20), 'investigating', 'Administrateur', "Le locataire n'a pas répondu aux relances. Contact téléphonique en cours.", null, now);
  insertRecovery.run(randomUUID(), orgId, `REC-${year}-0002`, invoiceIds[4], clientIds[4], propertyIds[3], 3200000, daysFromNow(-9), 'open', null, 'Nouveau dossier de recouvrement.', null, now);
  insertRecovery.run(randomUUID(), orgId, `REC-${year - 1}-0089`, null, null, null, 850000, daysFromNow(-120), 'resolved', 'Agent Locatif', 'Paiement effectué par virement. Montant intégralement récupéré.', daysFromNow(-95), now);

  /* --- Activité --- */
  const insertActivity = db.prepare(
    `INSERT INTO activity_log (id, org_id, user_id, action, detail, created_at) VALUES (?, ?, ?, ?, ?, ?)`
  );
  insertActivity.run(randomUUID(), orgId, userId, 'Facture payée', 'INV-2026-0044 — Mme Diallo Amina', iso(new Date(Date.now() - 2 * 3600e3)));
  insertActivity.run(randomUUID(), orgId, userId, 'Nouveau bail créé', 'LE-2026-0005 — M. Bamba Seydou', iso(new Date(Date.now() - 4 * 3600e3)));
  insertActivity.run(randomUUID(), orgId, userId, 'Bien ajouté', 'Villa Monte-Carlo — Cocody Angré', iso(new Date(Date.now() - 6 * 3600e3)));
  insertActivity.run(randomUUID(), orgId, userId, 'Relance envoyée', 'INV-2026-0043 — M. Traoré Idriss', iso(new Date(Date.now() - 8 * 3600e3)));
  insertActivity.run(randomUUID(), orgId, userId, 'Paiement enregistré', '1 500 000 FCFA — Mme Koné Fatoumata', iso(new Date(Date.now() - 26 * 3600e3)));
}

/* ------------------------------------------------------------------ */
/* Singleton                                                           */
/* ------------------------------------------------------------------ */

declare global {
  // eslint-disable-next-line no-var
  var __immoDb: DatabaseSync | undefined;
}

/**
 * `node:sqlite` renvoie des objets à prototype nul, que React refuse de
 * sérialiser vers un composant client. On normalise chaque ligne lue en
 * objet simple, une fois pour toutes.
 */
function normalizeRows(db: DatabaseSync): DatabaseSync {
  const originalPrepare = db.prepare.bind(db);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (db as any).prepare = (sql: string) => {
    const statement = originalPrepare(sql);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalAll = (statement as any).all.bind(statement);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalGet = (statement as any).get.bind(statement);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (statement as any).all = (...params: any[]) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      originalAll(...params).map((row: any) => ({ ...row }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (statement as any).get = (...params: any[]) => {
      const row = originalGet(...params);
      return row === undefined ? undefined : { ...row };
    };
    return statement;
  };
  return db;
}

export function getDb(): DatabaseSync {
  if (!globalThis.__immoDb) {
    fs.mkdirSync(DB_DIR, { recursive: true });
    const db = normalizeRows(new DatabaseSync(DB_PATH));
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec(SCHEMA);

    const count = db.prepare('SELECT COUNT(*) AS n FROM organizations').get() as { n: number };
    if (!count || count.n === 0) {
      seed(db);
    }
    globalThis.__immoDb = db;
  }
  return globalThis.__immoDb;
}

/** Journalise une action dans le fil d'activité. */
export function logActivity(orgId: string, userId: string | null, action: string, detail: string) {
  getDb()
    .prepare('INSERT INTO activity_log (id, org_id, user_id, action, detail, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(randomUUID(), orgId, userId, action, detail, iso(new Date()));
}

/* ------------------------------------------------------------------ */
/* Lecture normalisée                                                  */
/* ------------------------------------------------------------------ */

type Param = string | number | null;

/**
 * `node:sqlite` renvoie des objets à prototype nul, que React ne sait pas
 * sérialiser vers un composant client. Ces helpers les convertissent en
 * objets simples.
 */
export function all<T extends object>(sql: string, ...params: Param[]): T[] {
  return (getDb().prepare(sql).all(...params) as T[]).map((row) => ({ ...row }) as T);
}

export function one<T extends object>(sql: string, ...params: Param[]): T | undefined {
  const row = getDb().prepare(sql).get(...params) as T | undefined;
  return row === undefined ? undefined : ({ ...row } as T);
}

/** Exécute une requête d'écriture. */
export function run(sql: string, ...params: Param[]) {
  return getDb().prepare(sql).run(...params);
}

/** Génère un numéro de facture séquentiel pour l'organisation. */
export function nextInvoiceNumber(orgId: string): string {
  const year = new Date().getFullYear();
  const row = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM invoices WHERE org_id = ?`)
    .get(orgId) as { n: number };
  return `INV-${year}-${String((row?.n ?? 0) + 1).padStart(4, '0')}`;
}

/** Génère une référence séquentielle (bail, dossier de recouvrement...). */
export function nextReference(orgId: string, table: 'leases' | 'recovery_cases', prefix: string): string {
  const year = new Date().getFullYear();
  const row = getDb()
    .prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE org_id = ?`)
    .get(orgId) as { n: number };
  return `${prefix}-${year}-${String((row?.n ?? 0) + 1).padStart(4, '0')}`;
}

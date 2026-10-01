'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'node:crypto';
import {
  getDb,
  hashPassword,
  logActivity,
  nextInvoiceNumber,
  nextReference,
  verifyPassword,
} from '@/lib/db';
import { login, register, destroySession, getSession } from '@/lib/auth';

/* ------------------------------------------------------------------ */
/* Type de retour commun                                               */
/* ------------------------------------------------------------------ */

export type ActionState = { ok: boolean; error?: string; message?: string };

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? '').trim();
}

function num(fd: FormData, key: string): number {
  const raw = str(fd, key).replace(/\s/g, '').replace(',', '.');
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function optNum(fd: FormData, key: string): number | null {
  const raw = str(fd, key);
  if (!raw) return null;
  return num(fd, key);
}

function nullable(fd: FormData, key: string): string | null {
  const v = str(fd, key);
  return v === '' ? null : v;
}

async function requireUser() {
  const user = getSession();
  if (!user) redirect('/login');
  return user;
}

function refresh(paths: string[]) {
  for (const p of paths) revalidatePath(p);
}

/* ------------------------------------------------------------------ */
/* Authentification                                                    */
/* ------------------------------------------------------------------ */

export async function loginAction(formData: FormData): Promise<ActionState> {
  const email = str(formData, 'email');
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { ok: false, error: 'Veuillez remplir tous les champs.' };
  }

  const result = login(email, password);
  if (!result.ok) return result;

  redirect('/dashboard');
}

export async function registerAction(formData: FormData): Promise<ActionState> {
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (password !== confirmPassword) {
    return { ok: false, error: 'Les mots de passe ne correspondent pas.' };
  }

  const result = register({
    organizationName: str(formData, 'organizationName'),
    fullName: str(formData, 'fullName'),
    email: str(formData, 'email'),
    password,
  });
  if (!result.ok) return result;

  redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
  destroySession();
  redirect('/login');
}

/* ------------------------------------------------------------------ */
/* Biens                                                               */
/* ------------------------------------------------------------------ */

export async function createProperty(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const name = str(formData, 'name');
  const address = str(formData, 'address');

  if (!name) return { ok: false, error: 'Le nom du bien est requis.' };
  if (!address) return { ok: false, error: "L'adresse est requise." };

  getDb()
    .prepare(
      `INSERT INTO properties (id, org_id, name, type, address, city, surface, rooms, bedrooms, bathrooms, price, rental_price, status, featured, description, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      randomUUID(),
      user.org_id,
      name,
      str(formData, 'type') || 'appartement',
      address,
      nullable(formData, 'city'),
      optNum(formData, 'surface'),
      optNum(formData, 'rooms'),
      optNum(formData, 'bedrooms'),
      optNum(formData, 'bathrooms'),
      optNum(formData, 'price'),
      optNum(formData, 'rental_price'),
      str(formData, 'status') || 'disponible',
      formData.get('featured') ? 1 : 0,
      nullable(formData, 'description'),
      new Date().toISOString()
    );

  logActivity(user.org_id, user.id, 'Bien ajouté', `${name} — ${address}`);
  refresh(['/properties', '/dashboard']);
  return { ok: true, message: `Le bien « ${name} » a été ajouté.` };
}

export async function updateProperty(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const id = str(formData, 'id');
  const name = str(formData, 'name');
  if (!id || !name) return { ok: false, error: 'Données incomplètes.' };

  getDb()
    .prepare(
      `UPDATE properties SET name = ?, type = ?, address = ?, city = ?, surface = ?, rooms = ?, bedrooms = ?,
        bathrooms = ?, price = ?, rental_price = ?, status = ?, featured = ?, description = ?
       WHERE id = ? AND org_id = ?`
    )
    .run(
      name,
      str(formData, 'type') || 'appartement',
      str(formData, 'address'),
      nullable(formData, 'city'),
      optNum(formData, 'surface'),
      optNum(formData, 'rooms'),
      optNum(formData, 'bedrooms'),
      optNum(formData, 'bathrooms'),
      optNum(formData, 'price'),
      optNum(formData, 'rental_price'),
      str(formData, 'status') || 'disponible',
      formData.get('featured') ? 1 : 0,
      nullable(formData, 'description'),
      id,
      user.org_id
    );

  logActivity(user.org_id, user.id, 'Bien modifié', name);
  refresh(['/properties', '/dashboard']);
  return { ok: true, message: `Le bien « ${name} » a été mis à jour.` };
}

export async function deleteProperty(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const id = str(formData, 'id');
  const name = str(formData, 'name');
  if (!id) return { ok: false, error: 'Identifiant manquant.' };

  getDb().prepare('DELETE FROM properties WHERE id = ? AND org_id = ?').run(id, user.org_id);
  logActivity(user.org_id, user.id, 'Bien supprimé', name);
  refresh(['/properties', '/dashboard', '/leases']);
  return { ok: true, message: `Le bien « ${name} » a été supprimé.` };
}

/* ------------------------------------------------------------------ */
/* Clients                                                             */
/* ------------------------------------------------------------------ */

export async function createClient(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const fullName = str(formData, 'full_name');
  if (!fullName) return { ok: false, error: 'Le nom du client est requis.' };

  getDb()
    .prepare(
      `INSERT INTO clients (id, org_id, property_id, type, full_name, email, phone, address, city, status, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      randomUUID(),
      user.org_id,
      nullable(formData, 'property_id'),
      str(formData, 'type') || 'locataire',
      fullName,
      nullable(formData, 'email'),
      nullable(formData, 'phone'),
      nullable(formData, 'address'),
      nullable(formData, 'city'),
      str(formData, 'status') || 'actif',
      nullable(formData, 'notes'),
      new Date().toISOString()
    );

  logActivity(user.org_id, user.id, 'Client ajouté', fullName);
  refresh(['/clients', '/dashboard']);
  return { ok: true, message: `Le client « ${fullName} » a été ajouté.` };
}

export async function updateClient(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const id = str(formData, 'id');
  const fullName = str(formData, 'full_name');
  if (!id || !fullName) return { ok: false, error: 'Données incomplètes.' };

  getDb()
    .prepare(
      `UPDATE clients SET property_id = ?, type = ?, full_name = ?, email = ?, phone = ?, address = ?, city = ?, status = ?, notes = ?
       WHERE id = ? AND org_id = ?`
    )
    .run(
      nullable(formData, 'property_id'),
      str(formData, 'type') || 'locataire',
      fullName,
      nullable(formData, 'email'),
      nullable(formData, 'phone'),
      nullable(formData, 'address'),
      nullable(formData, 'city'),
      str(formData, 'status') || 'actif',
      nullable(formData, 'notes'),
      id,
      user.org_id
    );

  logActivity(user.org_id, user.id, 'Client modifié', fullName);
  refresh(['/clients', '/dashboard']);
  return { ok: true, message: `Le client « ${fullName} » a été mis à jour.` };
}

export async function deleteClient(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const id = str(formData, 'id');
  const fullName = str(formData, 'name');
  if (!id) return { ok: false, error: 'Identifiant manquant.' };

  getDb().prepare('DELETE FROM clients WHERE id = ? AND org_id = ?').run(id, user.org_id);
  logActivity(user.org_id, user.id, 'Client supprimé', fullName);
  refresh(['/clients', '/dashboard', '/leases']);
  return { ok: true, message: `Le client « ${fullName} » a été supprimé.` };
}

/* ------------------------------------------------------------------ */
/* Baux                                                                */
/* ------------------------------------------------------------------ */

export async function createLease(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const propertyId = str(formData, 'property_id');
  const clientId = str(formData, 'client_id');
  const startDate = str(formData, 'start_date');

  if (!propertyId) return { ok: false, error: 'Sélectionnez un bien.' };
  if (!clientId) return { ok: false, error: 'Sélectionnez un locataire.' };
  if (!startDate) return { ok: false, error: 'La date de début est requise.' };

  const rent = num(formData, 'monthly_rent');
  if (rent <= 0) return { ok: false, error: 'Le loyer mensuel doit être supérieur à 0.' };

  const db = getDb();
  const id = randomUUID();
  const reference = nextReference(user.org_id, 'leases', 'LE');

  db.prepare(
    `INSERT INTO leases (id, org_id, reference, property_id, client_id, start_date, end_date, monthly_rent, deposit, status, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    user.org_id,
    reference,
    propertyId,
    clientId,
    startDate,
    nullable(formData, 'end_date'),
    rent,
    num(formData, 'deposit'),
    str(formData, 'status') || 'active',
    nullable(formData, 'notes'),
    new Date().toISOString()
  );

  // Le bien passe automatiquement en « loué » lorsqu'un bail actif est créé.
  if ((str(formData, 'status') || 'active') === 'active') {
    db.prepare(`UPDATE properties SET status = 'loué' WHERE id = ? AND org_id = ?`).run(propertyId, user.org_id);
  }

  logActivity(user.org_id, user.id, 'Nouveau bail créé', `${reference} — ${str(formData, 'client_name')}`);
  refresh(['/leases', '/properties', '/dashboard']);
  return { ok: true, message: `Le bail ${reference} a été créé.` };
}

export async function updateLease(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const id = str(formData, 'id');
  if (!id) return { ok: false, error: 'Identifiant manquant.' };

  getDb()
    .prepare(
      `UPDATE leases SET property_id = ?, client_id = ?, start_date = ?, end_date = ?, monthly_rent = ?, deposit = ?, status = ?, notes = ?
       WHERE id = ? AND org_id = ?`
    )
    .run(
      str(formData, 'property_id'),
      str(formData, 'client_id'),
      str(formData, 'start_date'),
      nullable(formData, 'end_date'),
      num(formData, 'monthly_rent'),
      num(formData, 'deposit'),
      str(formData, 'status') || 'active',
      nullable(formData, 'notes'),
      id,
      user.org_id
    );

  logActivity(user.org_id, user.id, 'Bail modifié', str(formData, 'reference'));
  refresh(['/leases', '/properties', '/dashboard']);
  return { ok: true, message: 'Le bail a été mis à jour.' };
}

export async function deleteLease(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const id = str(formData, 'id');
  if (!id) return { ok: false, error: 'Identifiant manquant.' };

  getDb().prepare('DELETE FROM leases WHERE id = ? AND org_id = ?').run(id, user.org_id);
  logActivity(user.org_id, user.id, 'Bail supprimé', str(formData, 'reference'));
  refresh(['/leases', '/dashboard']);
  return { ok: true, message: 'Le bail a été supprimé.' };
}

/* ------------------------------------------------------------------ */
/* Factures                                                            */
/* ------------------------------------------------------------------ */

export async function createInvoice(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const amount = num(formData, 'amount');
  const dueDate = str(formData, 'due_date');

  if (amount <= 0) return { ok: false, error: 'Le montant doit être supérieur à 0.' };
  if (!dueDate) return { ok: false, error: "La date d'échéance est requise." };

  const db = getDb();
  const id = randomUUID();
  const invoiceNumber = nextInvoiceNumber(user.org_id);
  let clientId = nullable(formData, 'client_id');
  let propertyId = nullable(formData, 'property_id');
  const leaseId = nullable(formData, 'lease_id');

  // Si la facture est rattachée à un bail, on hérite du client et du bien.
  if (leaseId) {
    const lease = db
      .prepare('SELECT property_id, client_id FROM leases WHERE id = ? AND org_id = ?')
      .get(leaseId, user.org_id) as { property_id: string; client_id: string } | undefined;
    if (lease) {
      propertyId = lease.property_id;
      clientId = clientId ?? lease.client_id;
    }
  }

  db.prepare(
    `INSERT INTO invoices (id, org_id, lease_id, client_id, property_id, invoice_number, amount, due_date, paid_date, status, recurrence, description, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    user.org_id,
    leaseId,
    clientId,
    propertyId,
    invoiceNumber,
    amount,
    dueDate,
    null,
    str(formData, 'status') || 'pending',
    str(formData, 'recurrence') || 'monthly',
    nullable(formData, 'description'),
    new Date().toISOString()
  );

  logActivity(user.org_id, user.id, 'Facture créée', `${invoiceNumber} — ${str(formData, 'client_name')}`);
  refresh(['/invoices', '/dashboard']);
  return { ok: true, message: `La facture ${invoiceNumber} a été créée.` };
}

export async function updateInvoice(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const id = str(formData, 'id');
  if (!id) return { ok: false, error: 'Identifiant manquant.' };

  getDb()
    .prepare(
      `UPDATE invoices SET client_id = ?, property_id = ?, amount = ?, due_date = ?, status = ?, recurrence = ?, description = ?
       WHERE id = ? AND org_id = ?`
    )
    .run(
      nullable(formData, 'client_id'),
      nullable(formData, 'property_id'),
      num(formData, 'amount'),
      str(formData, 'due_date'),
      str(formData, 'status') || 'pending',
      str(formData, 'recurrence') || 'monthly',
      nullable(formData, 'description'),
      id,
      user.org_id
    );

  logActivity(user.org_id, user.id, 'Facture modifiée', str(formData, 'invoice_number'));
  refresh(['/invoices', '/dashboard']);
  return { ok: true, message: 'La facture a été mise à jour.' };
}

export async function deleteInvoice(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const id = str(formData, 'id');
  if (!id) return { ok: false, error: 'Identifiant manquant.' };

  getDb().prepare('DELETE FROM invoices WHERE id = ? AND org_id = ?').run(id, user.org_id);
  logActivity(user.org_id, user.id, 'Facture supprimée', str(formData, 'invoice_number'));
  refresh(['/invoices', '/dashboard']);
  return { ok: true, message: 'La facture a été supprimée.' };
}

/** Enregistre un paiement et solde la facture associée. */
export async function recordPayment(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const invoiceId = str(formData, 'invoice_id');
  const amount = num(formData, 'amount');
  const paymentDate = str(formData, 'payment_date') || new Date().toISOString().slice(0, 10);

  if (!invoiceId) return { ok: false, error: 'Facture introuvable.' };
  if (amount <= 0) return { ok: false, error: 'Le montant doit être supérieur à 0.' };

  const db = getDb();
  const invoice = db
    .prepare('SELECT id, invoice_number, amount FROM invoices WHERE id = ? AND org_id = ?')
    .get(invoiceId, user.org_id) as { id: string; invoice_number: string; amount: number } | undefined;

  if (!invoice) return { ok: false, error: 'Facture introuvable.' };

  db.prepare(
    `INSERT INTO payments (id, org_id, invoice_id, amount, payment_date, method, reference, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    randomUUID(),
    user.org_id,
    invoiceId,
    amount,
    paymentDate,
    str(formData, 'method') || 'cash',
    nullable(formData, 'reference'),
    nullable(formData, 'notes'),
    new Date().toISOString()
  );

  // Une facture est considérée payée dès que le total des paiements couvre le montant dû.
  const totalPaid = db
    .prepare('SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE invoice_id = ?')
    .get(invoiceId) as { total: number };

  if (totalPaid.total >= invoice.amount) {
    db.prepare(`UPDATE invoices SET status = 'paid', paid_date = ? WHERE id = ?`).run(paymentDate, invoiceId);
  }

  logActivity(user.org_id, user.id, 'Paiement enregistré', `${formatAmount(amount)} FCFA — ${invoice.invoice_number}`);
  refresh(['/invoices', '/dashboard', '/recovery']);
  return { ok: true, message: `Paiement de ${formatAmount(amount)} FCFA enregistré sur ${invoice.invoice_number}.` };
}

function formatAmount(n: number): string {
  return Math.round(n).toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ');
}

/* ------------------------------------------------------------------ */
/* Relances                                                            */
/* ------------------------------------------------------------------ */

export async function createReminder(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const scheduledDate = str(formData, 'scheduled_date');
  if (!scheduledDate) return { ok: false, error: 'La date de programmation est requise.' };

  const db = getDb();
  const invoiceId = nullable(formData, 'invoice_id');
  let clientId = nullable(formData, 'client_id');

  if (invoiceId && !clientId) {
    const inv = db
      .prepare('SELECT client_id FROM invoices WHERE id = ? AND org_id = ?')
      .get(invoiceId, user.org_id) as { client_id: string | null } | undefined;
    clientId = inv?.client_id ?? null;
  }

  db.prepare(
    `INSERT INTO reminders (id, org_id, invoice_id, client_id, type, subject, message, scheduled_date, sent_at, status, channel, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    randomUUID(),
    user.org_id,
    invoiceId,
    clientId,
    str(formData, 'type') || 'rent_reminder',
    nullable(formData, 'subject'),
    nullable(formData, 'message'),
    scheduledDate,
    null,
    'pending',
    str(formData, 'channel') || 'email',
    new Date().toISOString()
  );

  logActivity(user.org_id, user.id, 'Relance programmée', str(formData, 'subject') || 'Relance');
  refresh(['/reminders', '/dashboard']);
  return { ok: true, message: 'La relance a été programmée.' };
}

export async function updateReminder(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const id = str(formData, 'id');
  if (!id) return { ok: false, error: 'Identifiant manquant.' };

  getDb()
    .prepare(
      `UPDATE reminders SET invoice_id = ?, client_id = ?, type = ?, subject = ?, message = ?, scheduled_date = ?, status = ?, channel = ?
       WHERE id = ? AND org_id = ?`
    )
    .run(
      nullable(formData, 'invoice_id'),
      nullable(formData, 'client_id'),
      str(formData, 'type') || 'rent_reminder',
      nullable(formData, 'subject'),
      nullable(formData, 'message'),
      str(formData, 'scheduled_date'),
      str(formData, 'status') || 'pending',
      str(formData, 'channel') || 'email',
      id,
      user.org_id
    );

  logActivity(user.org_id, user.id, 'Relance modifiée', str(formData, 'subject') || 'Relance');
  refresh(['/reminders', '/dashboard']);
  return { ok: true, message: 'La relance a été mise à jour.' };
}

/** Marque une relance comme envoyée (action rapide). */
export async function sendReminder(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const id = str(formData, 'id');
  if (!id) return { ok: false, error: 'Identifiant manquant.' };

  getDb()
    .prepare(`UPDATE reminders SET status = 'sent', sent_at = ? WHERE id = ? AND org_id = ?`)
    .run(new Date().toISOString(), id, user.org_id);

  logActivity(user.org_id, user.id, 'Relance envoyée', str(formData, 'subject') || 'Relance');
  refresh(['/reminders', '/dashboard']);
  return { ok: true, message: 'La relance a été marquée comme envoyée.' };
}

export async function deleteReminder(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const id = str(formData, 'id');
  if (!id) return { ok: false, error: 'Identifiant manquant.' };

  getDb().prepare('DELETE FROM reminders WHERE id = ? AND org_id = ?').run(id, user.org_id);
  logActivity(user.org_id, user.id, 'Relance supprimée', str(formData, 'subject') || 'Relance');
  refresh(['/reminders', '/dashboard']);
  return { ok: true, message: 'La relance a été supprimée.' };
}

/* ------------------------------------------------------------------ */
/* Recouvrement                                                        */
/* ------------------------------------------------------------------ */

export async function createRecoveryCase(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const invoiceId = str(formData, 'invoice_id');
  if (!invoiceId) return { ok: false, error: 'Sélectionnez une facture impayée.' };

  const db = getDb();
  const invoice = db
    .prepare(
      `SELECT i.id, i.amount, i.client_id, i.property_id, i.invoice_number
       FROM invoices i WHERE i.id = ? AND i.org_id = ?`
    )
    .get(invoiceId, user.org_id) as
    | { id: string; amount: number; client_id: string | null; property_id: string | null; invoice_number: string }
    | undefined;

  if (!invoice) return { ok: false, error: 'Facture introuvable.' };

  const already = db
    .prepare(`SELECT id FROM recovery_cases WHERE invoice_id = ? AND status NOT IN ('resolved','closed','waived')`)
    .get(invoiceId);
  if (already) return { ok: false, error: 'Un dossier de recouvrement est déjà ouvert pour cette facture.' };

  const reference = nextReference(user.org_id, 'recovery_cases', 'REC');

  db.prepare(
    `INSERT INTO recovery_cases (id, org_id, reference, invoice_id, client_id, property_id, amount_due, opened_at, status, assigned_to, resolution, notes, closure_date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    randomUUID(),
    user.org_id,
    reference,
    invoiceId,
    invoice.client_id,
    invoice.property_id,
    num(formData, 'amount_due') || invoice.amount,
    new Date().toISOString(),
    str(formData, 'status') || 'open',
    nullable(formData, 'assigned_to') ?? user.full_name,
    null,
    nullable(formData, 'notes'),
    null,
    new Date().toISOString()
  );

  logActivity(user.org_id, user.id, 'Dossier de recouvrement ouvert', `${reference} — ${invoice.invoice_number}`);
  refresh(['/recovery', '/dashboard']);
  return { ok: true, message: `Le dossier ${reference} a été ouvert.` };
}

export async function updateRecoveryCase(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const id = str(formData, 'id');
  if (!id) return { ok: false, error: 'Identifiant manquant.' };

  const status = str(formData, 'status') || 'open';
  const closed = ['resolved', 'closed', 'waived'].includes(status);

  getDb()
    .prepare(
      `UPDATE recovery_cases SET amount_due = ?, status = ?, assigned_to = ?, resolution = ?, notes = ?, closure_date = ?
       WHERE id = ? AND org_id = ?`
    )
    .run(
      num(formData, 'amount_due'),
      status,
      nullable(formData, 'assigned_to'),
      nullable(formData, 'resolution'),
      nullable(formData, 'notes'),
      closed ? new Date().toISOString().slice(0, 10) : null,
      id,
      user.org_id
    );

  logActivity(user.org_id, user.id, 'Dossier de recouvrement mis à jour', str(formData, 'reference'));
  refresh(['/recovery', '/dashboard']);
  return { ok: true, message: 'Le dossier a été mis à jour.' };
}

export async function deleteRecoveryCase(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const id = str(formData, 'id');
  if (!id) return { ok: false, error: 'Identifiant manquant.' };

  getDb().prepare('DELETE FROM recovery_cases WHERE id = ? AND org_id = ?').run(id, user.org_id);
  logActivity(user.org_id, user.id, 'Dossier de recouvrement supprimé', str(formData, 'reference'));
  refresh(['/recovery', '/dashboard']);
  return { ok: true, message: 'Le dossier a été supprimé.' };
}

/* ------------------------------------------------------------------ */
/* Paramètres                                                          */
/* ------------------------------------------------------------------ */

export async function updateOrganization(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const name = str(formData, 'name');
  if (!name) return { ok: false, error: "Le nom de l'entreprise est requis." };

  getDb()
    .prepare('UPDATE organizations SET name = ?, address = ?, email = ?, phone = ? WHERE id = ?')
    .run(
      name,
      nullable(formData, 'address'),
      nullable(formData, 'email'),
      nullable(formData, 'phone'),
      user.org_id
    );

  logActivity(user.org_id, user.id, 'Organisation modifiée', name);
  refresh(['/settings', '/dashboard']);
  return { ok: true, message: 'Les informations ont été enregistrées.' };
}

export async function updateSubscription(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const plan = str(formData, 'plan');
  const allowed = ['free', 'basic', 'pro', 'enterprise'];
  if (!allowed.includes(plan)) return { ok: false, error: 'Plan invalide.' };

  getDb().prepare('UPDATE organizations SET plan = ? WHERE id = ?').run(plan, user.org_id);
  logActivity(user.org_id, user.id, 'Changement de plan', `Nouveau plan : ${plan}`);
  refresh(['/settings']);
  return { ok: true, message: `Le plan a été changé pour « ${plan} ».` };
}

export async function createUser(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (user.role !== 'admin') return { ok: false, error: 'Seul un administrateur peut inviter des utilisateurs.' };

  const email = str(formData, 'email').toLowerCase();
  const fullName = str(formData, 'full_name');
  const password = String(formData.get('password') ?? '');

  if (!fullName) return { ok: false, error: 'Le nom est requis.' };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: 'Adresse email invalide.' };
  if (password.length < 8) return { ok: false, error: 'Le mot de passe doit contenir au moins 8 caractères.' };

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE lower(email) = lower(?)').get(email);
  if (existing) return { ok: false, error: 'Un utilisateur existe déjà avec cet email.' };

  db.prepare(
    `INSERT INTO users (id, org_id, email, full_name, password_hash, role, enabled, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    randomUUID(),
    user.org_id,
    email,
    fullName,
    hashPassword(password),
    str(formData, 'role') || 'agent',
    1,
    new Date().toISOString()
  );

  logActivity(user.org_id, user.id, 'Utilisateur invité', `${fullName} (${email})`);
  refresh(['/settings']);
  return { ok: true, message: `L'utilisateur « ${fullName} » a été créé.` };
}

export async function toggleUser(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (user.role !== 'admin') return { ok: false, error: 'Action réservée aux administrateurs.' };

  const id = str(formData, 'id');
  if (!id) return { ok: false, error: 'Identifiant manquant.' };
  if (id === user.id) return { ok: false, error: 'Vous ne pouvez pas désactiver votre propre compte.' };

  const db = getDb();
  const target = db.prepare('SELECT enabled, full_name FROM users WHERE id = ? AND org_id = ?').get(id, user.org_id) as
    | { enabled: number; full_name: string }
    | undefined;
  if (!target) return { ok: false, error: 'Utilisateur introuvable.' };

  const next = target.enabled === 1 ? 0 : 1;
  db.prepare('UPDATE users SET enabled = ? WHERE id = ? AND org_id = ?').run(next, id, user.org_id);
  if (next === 0) db.prepare('DELETE FROM sessions WHERE user_id = ?').run(id);

  logActivity(user.org_id, user.id, next === 1 ? 'Utilisateur activé' : 'Utilisateur désactivé', target.full_name);
  refresh(['/settings']);
  return { ok: true, message: next === 1 ? 'Utilisateur activé.' : 'Utilisateur désactivé.' };
}

export async function updateUser(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (user.role !== 'admin') return { ok: false, error: 'Action réservée aux administrateurs.' };

  const id = str(formData, 'id');
  const fullName = str(formData, 'full_name');
  if (!id || !fullName) return { ok: false, error: 'Données incomplètes.' };

  getDb()
    .prepare('UPDATE users SET full_name = ?, role = ? WHERE id = ? AND org_id = ?')
    .run(fullName, str(formData, 'role') || 'agent', id, user.org_id);

  logActivity(user.org_id, user.id, 'Utilisateur modifié', fullName);
  refresh(['/settings']);
  return { ok: true, message: 'Utilisateur mis à jour.' };
}

export async function updateProfile(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const fullName = str(formData, 'full_name');
  if (!fullName) return { ok: false, error: 'Le nom est requis.' };

  getDb().prepare('UPDATE users SET full_name = ? WHERE id = ?').run(fullName, user.id);
  refresh(['/settings', '/dashboard']);
  return { ok: true, message: 'Votre profil a été mis à jour.' };
}

export async function changePassword(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const current = String(formData.get('current_password') ?? '');
  const next = String(formData.get('new_password') ?? '');
  const confirm = String(formData.get('confirm_password') ?? '');

  if (next.length < 8) return { ok: false, error: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' };
  if (next !== confirm) return { ok: false, error: 'Les mots de passe ne correspondent pas.' };

  const row = getDb().prepare('SELECT password_hash FROM users WHERE id = ?').get(user.id) as
    | { password_hash: string }
    | undefined;

  if (!row || !verifyPassword(current, row.password_hash)) {
    return { ok: false, error: 'Le mot de passe actuel est incorrect.' };
  }

  getDb().prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(next), user.id);
  refresh(['/settings']);
  return { ok: true, message: 'Votre mot de passe a été modifié.' };
}

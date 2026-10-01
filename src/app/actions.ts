'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase';
import { login, register, logout, requireUser, type SessionUser } from '@/lib/auth';

/* ------------------------------------------------------------------ */
/* Type de retour commun                                               */
/* ------------------------------------------------------------------ */

export type ActionState = { ok: boolean; error?: string; message?: string };

const GENERIC_ERROR = 'Une erreur est survenue. Veuillez réessayer.';

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? '').trim();
}

function num(fd: FormData, key: string): number {
  const raw = str(fd, key).replace(/\s/g, '').replace(',', '.');
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function optNum(fd: FormData, key: string): number | null {
  return str(fd, key) === '' ? null : num(fd, key);
}

function nullable(fd: FormData, key: string): string | null {
  const v = str(fd, key);
  return v === '' ? null : v;
}

function refresh(paths: string[]) {
  for (const p of paths) revalidatePath(p);
}

type Supabase = ReturnType<typeof createServerSupabase>;

/** Journalise une action dans le fil d'activité de l'organisation. */
async function logActivity(supabase: Supabase, user: SessionUser, action: string, detail: string) {
  await supabase.from('activity_log').insert({
    organization_id: user.org_id,
    user_id: user.id,
    action,
    detail,
  });
}

/** Génère une référence séquentielle (bail, dossier de recouvrement). */
async function nextReference(
  supabase: Supabase,
  orgId: string,
  table: 'leases' | 'recovery_cases',
  prefix: string
): Promise<string> {
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', orgId);
  return `${prefix}-${year}-${String((count ?? 0) + 1).padStart(4, '0')}`;
}

function formatAmount(n: number): string {
  return Math.round(n).toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ');
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

  const result = await login(email, password);
  if (!result.ok) return result;

  redirect('/dashboard');
}

export async function registerAction(formData: FormData): Promise<ActionState> {
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (password !== confirmPassword) {
    return { ok: false, error: 'Les mots de passe ne correspondent pas.' };
  }
  if (password.length < 8) {
    return { ok: false, error: 'Le mot de passe doit contenir au moins 8 caractères.' };
  }

  const result = await register({
    organizationName: str(formData, 'organizationName'),
    fullName: str(formData, 'fullName'),
    email: str(formData, 'email'),
    password,
  });
  if (!result.ok) return result;

  redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
  await logout();
  redirect('/login');
}

/* ------------------------------------------------------------------ */
/* Biens                                                               */
/* ------------------------------------------------------------------ */

export async function createProperty(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const supabase = createServerSupabase();
  const name = str(formData, 'name');
  const address = str(formData, 'address');

  if (!name) return { ok: false, error: 'Le nom du bien est requis.' };
  if (!address) return { ok: false, error: "L'adresse est requise." };

  const { error } = await supabase.from('properties').insert({
    organization_id: user.org_id,
    name,
    type: str(formData, 'type') || 'appartement',
    address,
    city: nullable(formData, 'city'),
    surface: optNum(formData, 'surface'),
    rooms: optNum(formData, 'rooms'),
    bedrooms: optNum(formData, 'bedrooms'),
    bathrooms: optNum(formData, 'bathrooms'),
    price: optNum(formData, 'price'),
    rental_price: optNum(formData, 'rental_price'),
    status: str(formData, 'status') || 'disponible',
    featured: formData.get('featured') !== null,
    description: nullable(formData, 'description'),
  });

  if (error) return { ok: false, error: GENERIC_ERROR };

  await logActivity(supabase, user, 'Bien ajouté', `${name} — ${address}`);
  refresh(['/properties', '/dashboard']);
  return { ok: true, message: `Le bien « ${name} » a été ajouté.` };
}

export async function updateProperty(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const supabase = createServerSupabase();
  const id = str(formData, 'id');
  const name = str(formData, 'name');
  if (!id || !name) return { ok: false, error: 'Données incomplètes.' };

  const { error } = await supabase
    .from('properties')
    .update({
      name,
      type: str(formData, 'type') || 'appartement',
      address: str(formData, 'address'),
      city: nullable(formData, 'city'),
      surface: optNum(formData, 'surface'),
      rooms: optNum(formData, 'rooms'),
      bedrooms: optNum(formData, 'bedrooms'),
      bathrooms: optNum(formData, 'bathrooms'),
      price: optNum(formData, 'price'),
      rental_price: optNum(formData, 'rental_price'),
      status: str(formData, 'status') || 'disponible',
      featured: formData.get('featured') !== null,
      description: nullable(formData, 'description'),
    })
    .eq('id', id)
    .eq('organization_id', user.org_id);

  if (error) return { ok: false, error: GENERIC_ERROR };

  await logActivity(supabase, user, 'Bien modifié', name);
  refresh(['/properties', '/dashboard']);
  return { ok: true, message: `Le bien « ${name} » a été mis à jour.` };
}

export async function deleteProperty(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const supabase = createServerSupabase();
  const id = str(formData, 'id');
  const name = str(formData, 'name');
  if (!id) return { ok: false, error: 'Identifiant manquant.' };

  const { error } = await supabase.from('properties').delete().eq('id', id).eq('organization_id', user.org_id);
  if (error) return { ok: false, error: GENERIC_ERROR };

  await logActivity(supabase, user, 'Bien supprimé', name);
  refresh(['/properties', '/dashboard', '/leases']);
  return { ok: true, message: `Le bien « ${name} » a été supprimé.` };
}

/* ------------------------------------------------------------------ */
/* Clients                                                             */
/* ------------------------------------------------------------------ */

export async function createClient(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const supabase = createServerSupabase();
  const fullName = str(formData, 'full_name');
  if (!fullName) return { ok: false, error: 'Le nom du client est requis.' };

  const { error } = await supabase.from('clients').insert({
    organization_id: user.org_id,
    property_id: nullable(formData, 'property_id'),
    type: str(formData, 'type') || 'locataire',
    full_name: fullName,
    email: nullable(formData, 'email'),
    phone: nullable(formData, 'phone'),
    address: nullable(formData, 'address'),
    city: nullable(formData, 'city'),
    status: str(formData, 'status') || 'actif',
    notes: nullable(formData, 'notes'),
  });

  if (error) return { ok: false, error: GENERIC_ERROR };

  await logActivity(supabase, user, 'Client ajouté', fullName);
  refresh(['/clients', '/dashboard']);
  return { ok: true, message: `Le client « ${fullName} » a été ajouté.` };
}

export async function updateClient(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const supabase = createServerSupabase();
  const id = str(formData, 'id');
  const fullName = str(formData, 'full_name');
  if (!id || !fullName) return { ok: false, error: 'Données incomplètes.' };

  const { error } = await supabase
    .from('clients')
    .update({
      property_id: nullable(formData, 'property_id'),
      type: str(formData, 'type') || 'locataire',
      full_name: fullName,
      email: nullable(formData, 'email'),
      phone: nullable(formData, 'phone'),
      address: nullable(formData, 'address'),
      city: nullable(formData, 'city'),
      status: str(formData, 'status') || 'actif',
      notes: nullable(formData, 'notes'),
    })
    .eq('id', id)
    .eq('organization_id', user.org_id);

  if (error) return { ok: false, error: GENERIC_ERROR };

  await logActivity(supabase, user, 'Client modifié', fullName);
  refresh(['/clients', '/dashboard']);
  return { ok: true, message: `Le client « ${fullName} » a été mis à jour.` };
}

export async function deleteClient(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const supabase = createServerSupabase();
  const id = str(formData, 'id');
  const fullName = str(formData, 'name');
  if (!id) return { ok: false, error: 'Identifiant manquant.' };

  const { error } = await supabase.from('clients').delete().eq('id', id).eq('organization_id', user.org_id);
  if (error) return { ok: false, error: GENERIC_ERROR };

  await logActivity(supabase, user, 'Client supprimé', fullName);
  refresh(['/clients', '/dashboard', '/leases']);
  return { ok: true, message: `Le client « ${fullName} » a été supprimé.` };
}

/* ------------------------------------------------------------------ */
/* Baux                                                                */
/* ------------------------------------------------------------------ */

export async function createLease(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const supabase = createServerSupabase();
  const propertyId = str(formData, 'property_id');
  const clientId = str(formData, 'client_id');
  const startDate = str(formData, 'start_date');

  if (!propertyId) return { ok: false, error: 'Sélectionnez un bien.' };
  if (!clientId) return { ok: false, error: 'Sélectionnez un locataire.' };
  if (!startDate) return { ok: false, error: 'La date de début est requise.' };

  const rent = num(formData, 'monthly_rent');
  if (rent <= 0) return { ok: false, error: 'Le loyer mensuel doit être supérieur à 0.' };

  const status = str(formData, 'status') || 'active';
  const reference = await nextReference(supabase, user.org_id, 'leases', 'LE');

  const { error } = await supabase.from('leases').insert({
    organization_id: user.org_id,
    reference,
    property_id: propertyId,
    client_id: clientId,
    start_date: startDate,
    end_date: nullable(formData, 'end_date'),
    monthly_rent: rent,
    deposit: num(formData, 'deposit'),
    status,
    notes: nullable(formData, 'notes'),
  });

  if (error) return { ok: false, error: GENERIC_ERROR };

  // Un bail actif fait passer le bien en « loué ».
  if (status === 'active') {
    await supabase.from('properties').update({ status: 'loué' }).eq('id', propertyId).eq('organization_id', user.org_id);
  }

  await logActivity(supabase, user, 'Nouveau bail créé', `${reference} — ${str(formData, 'client_name')}`);
  refresh(['/leases', '/properties', '/dashboard']);
  return { ok: true, message: `Le bail ${reference} a été créé.` };
}

export async function updateLease(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const supabase = createServerSupabase();
  const id = str(formData, 'id');
  if (!id) return { ok: false, error: 'Identifiant manquant.' };

  const { error } = await supabase
    .from('leases')
    .update({
      property_id: str(formData, 'property_id'),
      client_id: str(formData, 'client_id'),
      start_date: str(formData, 'start_date'),
      end_date: nullable(formData, 'end_date'),
      monthly_rent: num(formData, 'monthly_rent'),
      deposit: num(formData, 'deposit'),
      status: str(formData, 'status') || 'active',
      notes: nullable(formData, 'notes'),
    })
    .eq('id', id)
    .eq('organization_id', user.org_id);

  if (error) return { ok: false, error: GENERIC_ERROR };

  await logActivity(supabase, user, 'Bail modifié', str(formData, 'reference'));
  refresh(['/leases', '/properties', '/dashboard']);
  return { ok: true, message: 'Le bail a été mis à jour.' };
}

export async function deleteLease(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const supabase = createServerSupabase();
  const id = str(formData, 'id');
  if (!id) return { ok: false, error: 'Identifiant manquant.' };

  const { error } = await supabase.from('leases').delete().eq('id', id).eq('organization_id', user.org_id);
  if (error) return { ok: false, error: GENERIC_ERROR };

  await logActivity(supabase, user, 'Bail supprimé', str(formData, 'reference'));
  refresh(['/leases', '/dashboard']);
  return { ok: true, message: 'Le bail a été supprimé.' };
}

/* ------------------------------------------------------------------ */
/* Factures                                                            */
/* ------------------------------------------------------------------ */

export async function createInvoice(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const supabase = createServerSupabase();
  const amount = num(formData, 'amount');
  const dueDate = str(formData, 'due_date');

  if (amount <= 0) return { ok: false, error: 'Le montant doit être supérieur à 0.' };
  if (!dueDate) return { ok: false, error: "La date d'échéance est requise." };

  let clientId = nullable(formData, 'client_id');
  let propertyId = nullable(formData, 'property_id');
  const leaseId = nullable(formData, 'lease_id');

  // Une facture rattachée à un bail hérite du client et du bien.
  if (leaseId) {
    const { data: lease } = await supabase
      .from('leases')
      .select('property_id, client_id')
      .eq('id', leaseId)
      .eq('organization_id', user.org_id)
      .maybeSingle();
    if (lease) {
      propertyId = lease.property_id as string;
      clientId = clientId ?? (lease.client_id as string);
    }
  }

  const { data: generated } = await supabase.rpc('next_invoice_number', { p_org: user.org_id });
  const invoiceNumber = (generated as string) ?? `INV-${new Date().getFullYear()}-0001`;

  const { error } = await supabase.from('invoices').insert({
    organization_id: user.org_id,
    lease_id: leaseId,
    client_id: clientId,
    property_id: propertyId,
    invoice_number: invoiceNumber,
    amount,
    due_date: dueDate,
    status: str(formData, 'status') || 'pending',
    recurrence: str(formData, 'recurrence') || 'monthly',
    description: nullable(formData, 'description'),
  });

  if (error) return { ok: false, error: GENERIC_ERROR };

  await logActivity(supabase, user, 'Facture créée', `${invoiceNumber} — ${str(formData, 'client_name')}`);
  refresh(['/invoices', '/dashboard']);
  return { ok: true, message: `La facture ${invoiceNumber} a été créée.` };
}

export async function updateInvoice(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const supabase = createServerSupabase();
  const id = str(formData, 'id');
  if (!id) return { ok: false, error: 'Identifiant manquant.' };

  const { error } = await supabase
    .from('invoices')
    .update({
      client_id: nullable(formData, 'client_id'),
      property_id: nullable(formData, 'property_id'),
      amount: num(formData, 'amount'),
      due_date: str(formData, 'due_date'),
      status: str(formData, 'status') || 'pending',
      recurrence: str(formData, 'recurrence') || 'monthly',
      description: nullable(formData, 'description'),
    })
    .eq('id', id)
    .eq('organization_id', user.org_id);

  if (error) return { ok: false, error: GENERIC_ERROR };

  await logActivity(supabase, user, 'Facture modifiée', str(formData, 'invoice_number'));
  refresh(['/invoices', '/dashboard']);
  return { ok: true, message: 'La facture a été mise à jour.' };
}

export async function deleteInvoice(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const supabase = createServerSupabase();
  const id = str(formData, 'id');
  if (!id) return { ok: false, error: 'Identifiant manquant.' };

  const { error } = await supabase.from('invoices').delete().eq('id', id).eq('organization_id', user.org_id);
  if (error) return { ok: false, error: GENERIC_ERROR };

  await logActivity(supabase, user, 'Facture supprimée', str(formData, 'invoice_number'));
  refresh(['/invoices', '/dashboard']);
  return { ok: true, message: 'La facture a été supprimée.' };
}

/** Enregistre un paiement et solde la facture si le total est atteint. */
export async function recordPayment(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const supabase = createServerSupabase();
  const invoiceId = str(formData, 'invoice_id');
  const amount = num(formData, 'amount');
  const paymentDate = str(formData, 'payment_date') || new Date().toISOString().slice(0, 10);

  if (!invoiceId) return { ok: false, error: 'Facture introuvable.' };
  if (amount <= 0) return { ok: false, error: 'Le montant doit être supérieur à 0.' };

  const { data: invoice } = await supabase
    .from('invoices')
    .select('id, invoice_number, amount')
    .eq('id', invoiceId)
    .eq('organization_id', user.org_id)
    .maybeSingle();

  if (!invoice) return { ok: false, error: 'Facture introuvable.' };

  const { error } = await supabase.from('payments').insert({
    organization_id: user.org_id,
    invoice_id: invoiceId,
    amount,
    payment_date: paymentDate,
    method: str(formData, 'method') || 'cash',
    reference: nullable(formData, 'reference'),
    notes: nullable(formData, 'notes'),
  });

  if (error) return { ok: false, error: GENERIC_ERROR };

  const { data: payments } = await supabase.from('payments').select('amount').eq('invoice_id', invoiceId);
  const totalPaid = (payments ?? []).reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  if (totalPaid >= Number(invoice.amount)) {
    await supabase
      .from('invoices')
      .update({ status: 'paid', paid_date: paymentDate })
      .eq('id', invoiceId)
      .eq('organization_id', user.org_id);
  }

  await logActivity(supabase, user, 'Paiement enregistré', `${formatAmount(amount)} FCFA — ${invoice.invoice_number}`);
  refresh(['/invoices', '/dashboard', '/recovery']);
  return { ok: true, message: `Paiement de ${formatAmount(amount)} FCFA enregistré sur ${invoice.invoice_number}.` };
}

/* ------------------------------------------------------------------ */
/* Relances                                                            */
/* ------------------------------------------------------------------ */

export async function createReminder(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const supabase = createServerSupabase();
  const scheduledDate = str(formData, 'scheduled_date');
  if (!scheduledDate) return { ok: false, error: 'La date de programmation est requise.' };

  const invoiceId = nullable(formData, 'invoice_id');
  let clientId = nullable(formData, 'client_id');

  if (invoiceId && !clientId) {
    const { data: inv } = await supabase
      .from('invoices')
      .select('client_id')
      .eq('id', invoiceId)
      .eq('organization_id', user.org_id)
      .maybeSingle();
    clientId = (inv?.client_id as string) ?? null;
  }

  const { error } = await supabase.from('reminders').insert({
    organization_id: user.org_id,
    invoice_id: invoiceId,
    client_id: clientId,
    type: str(formData, 'type') || 'rent_reminder',
    subject: nullable(formData, 'subject'),
    message: nullable(formData, 'message'),
    scheduled_date: scheduledDate,
    status: 'pending',
    channel: str(formData, 'channel') || 'email',
  });

  if (error) return { ok: false, error: GENERIC_ERROR };

  await logActivity(supabase, user, 'Relance programmée', str(formData, 'subject') || 'Relance');
  refresh(['/reminders', '/dashboard']);
  return { ok: true, message: 'La relance a été programmée.' };
}

export async function updateReminder(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const supabase = createServerSupabase();
  const id = str(formData, 'id');
  if (!id) return { ok: false, error: 'Identifiant manquant.' };

  const { error } = await supabase
    .from('reminders')
    .update({
      invoice_id: nullable(formData, 'invoice_id'),
      client_id: nullable(formData, 'client_id'),
      type: str(formData, 'type') || 'rent_reminder',
      subject: nullable(formData, 'subject'),
      message: nullable(formData, 'message'),
      scheduled_date: str(formData, 'scheduled_date'),
      status: str(formData, 'status') || 'pending',
      channel: str(formData, 'channel') || 'email',
    })
    .eq('id', id)
    .eq('organization_id', user.org_id);

  if (error) return { ok: false, error: GENERIC_ERROR };

  await logActivity(supabase, user, 'Relance modifiée', str(formData, 'subject') || 'Relance');
  refresh(['/reminders', '/dashboard']);
  return { ok: true, message: 'La relance a été mise à jour.' };
}

/** Marque une relance comme envoyée (action rapide). */
export async function sendReminder(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const supabase = createServerSupabase();
  const id = str(formData, 'id');
  if (!id) return { ok: false, error: 'Identifiant manquant.' };

  const { error } = await supabase
    .from('reminders')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', id)
    .eq('organization_id', user.org_id);

  if (error) return { ok: false, error: GENERIC_ERROR };

  await logActivity(supabase, user, 'Relance envoyée', str(formData, 'subject') || 'Relance');
  refresh(['/reminders', '/dashboard']);
  return { ok: true, message: 'La relance a été marquée comme envoyée.' };
}

export async function deleteReminder(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const supabase = createServerSupabase();
  const id = str(formData, 'id');
  if (!id) return { ok: false, error: 'Identifiant manquant.' };

  const { error } = await supabase.from('reminders').delete().eq('id', id).eq('organization_id', user.org_id);
  if (error) return { ok: false, error: GENERIC_ERROR };

  await logActivity(supabase, user, 'Relance supprimée', str(formData, 'subject') || 'Relance');
  refresh(['/reminders', '/dashboard']);
  return { ok: true, message: 'La relance a été supprimée.' };
}

/* ------------------------------------------------------------------ */
/* Recouvrement                                                        */
/* ------------------------------------------------------------------ */

export async function createRecoveryCase(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const supabase = createServerSupabase();
  const invoiceId = str(formData, 'invoice_id');
  if (!invoiceId) return { ok: false, error: 'Sélectionnez une facture impayée.' };

  const { data: invoice } = await supabase
    .from('invoices')
    .select('id, amount, client_id, property_id, invoice_number')
    .eq('id', invoiceId)
    .eq('organization_id', user.org_id)
    .maybeSingle();

  if (!invoice) return { ok: false, error: 'Facture introuvable.' };

  const { data: existing } = await supabase
    .from('recovery_cases')
    .select('id')
    .eq('invoice_id', invoiceId)
    .not('status', 'in', '("resolved","closed","waived")')
    .maybeSingle();

  if (existing) return { ok: false, error: 'Un dossier de recouvrement est déjà ouvert pour cette facture.' };

  const reference = await nextReference(supabase, user.org_id, 'recovery_cases', 'REC');

  const { error } = await supabase.from('recovery_cases').insert({
    organization_id: user.org_id,
    reference,
    invoice_id: invoiceId,
    client_id: invoice.client_id,
    property_id: invoice.property_id,
    amount_due: num(formData, 'amount_due') || Number(invoice.amount),
    status: str(formData, 'status') || 'open',
    assigned_to: nullable(formData, 'assigned_to') ?? user.full_name,
    notes: nullable(formData, 'notes'),
  });

  if (error) return { ok: false, error: GENERIC_ERROR };

  await logActivity(supabase, user, 'Dossier de recouvrement ouvert', `${reference} — ${invoice.invoice_number}`);
  refresh(['/recovery', '/dashboard']);
  return { ok: true, message: `Le dossier ${reference} a été ouvert.` };
}

export async function updateRecoveryCase(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const supabase = createServerSupabase();
  const id = str(formData, 'id');
  if (!id) return { ok: false, error: 'Identifiant manquant.' };

  const status = str(formData, 'status') || 'open';
  const closed = ['resolved', 'closed', 'waived'].includes(status);

  const { error } = await supabase
    .from('recovery_cases')
    .update({
      amount_due: num(formData, 'amount_due'),
      status,
      assigned_to: nullable(formData, 'assigned_to'),
      resolution: nullable(formData, 'resolution'),
      notes: nullable(formData, 'notes'),
      closure_date: closed ? new Date().toISOString().slice(0, 10) : null,
    })
    .eq('id', id)
    .eq('organization_id', user.org_id);

  if (error) return { ok: false, error: GENERIC_ERROR };

  await logActivity(supabase, user, 'Dossier de recouvrement mis à jour', str(formData, 'reference'));
  refresh(['/recovery', '/dashboard']);
  return { ok: true, message: 'Le dossier a été mis à jour.' };
}

export async function deleteRecoveryCase(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const supabase = createServerSupabase();
  const id = str(formData, 'id');
  if (!id) return { ok: false, error: 'Identifiant manquant.' };

  const { error } = await supabase.from('recovery_cases').delete().eq('id', id).eq('organization_id', user.org_id);
  if (error) return { ok: false, error: GENERIC_ERROR };

  await logActivity(supabase, user, 'Dossier de recouvrement supprimé', str(formData, 'reference'));
  refresh(['/recovery', '/dashboard']);
  return { ok: true, message: 'Le dossier a été supprimé.' };
}

/* ------------------------------------------------------------------ */
/* Paramètres                                                          */
/* ------------------------------------------------------------------ */

export async function updateOrganization(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const supabase = createServerSupabase();
  const name = str(formData, 'name');
  if (!name) return { ok: false, error: "Le nom de l'entreprise est requis." };

  const { error } = await supabase
    .from('organizations')
    .update({
      name,
      address: nullable(formData, 'address'),
      email: nullable(formData, 'email'),
      phone: nullable(formData, 'phone'),
    })
    .eq('id', user.org_id);

  if (error) return { ok: false, error: GENERIC_ERROR };

  await logActivity(supabase, user, 'Organisation modifiée', name);
  refresh(['/settings', '/dashboard']);
  return { ok: true, message: 'Les informations ont été enregistrées.' };
}

export async function updateSubscription(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const supabase = createServerSupabase();
  const plan = str(formData, 'plan');
  const allowed = ['free', 'basic', 'pro', 'enterprise'];
  if (!allowed.includes(plan)) return { ok: false, error: 'Plan invalide.' };

  const { error } = await supabase.from('organizations').update({ plan }).eq('id', user.org_id);
  if (error) return { ok: false, error: GENERIC_ERROR };

  await logActivity(supabase, user, 'Changement de plan', `Nouveau plan : ${plan}`);
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

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return {
      ok: false,
      error:
        "L'invitation d'utilisateur nécessite la clé « service_role » du projet. Ajoutez SUPABASE_SERVICE_ROLE_KEY dans .env.local.",
    };
  }

  const supabase = createServerSupabase();

  // L'utilisateur est créé via l'API d'administration ; le trigger lui crée
  // une organisation, que l'on remplace ensuite par celle de l'invitant.
  const { createClient: createAdminClient } = await import('@supabase/supabase-js');
  const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { organization_name: user.org_name, full_name: fullName },
  });

  if (createError) {
    const m = createError.message.toLowerCase();
    if (m.includes('already') || m.includes('registered') || m.includes('exists')) {
      return { ok: false, error: 'Un utilisateur existe déjà avec cet email.' };
    }
    return { ok: false, error: GENERIC_ERROR };
  }

  const newId = created.user?.id;

  if (newId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', newId)
      .maybeSingle();

    await admin
      .from('profiles')
      .update({
        organization_id: user.org_id,
        full_name: fullName,
        role: str(formData, 'role') || 'agent',
      })
      .eq('id', newId);

    // Supprime l'organisation créée en trop par le trigger d'inscription.
    const orphan = profile?.organization_id as string | undefined;
    if (orphan && orphan !== user.org_id) {
      await admin.from('activity_log').delete().eq('organization_id', orphan);
      await admin.from('organizations').delete().eq('id', orphan);
    }
  }

  await logActivity(supabase, user, 'Utilisateur invité', `${fullName} (${email})`);
  refresh(['/settings']);
  return { ok: true, message: `L'utilisateur « ${fullName} » a été créé.` };
}

export async function toggleUser(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (user.role !== 'admin') return { ok: false, error: 'Action réservée aux administrateurs.' };

  const id = str(formData, 'id');
  if (!id) return { ok: false, error: 'Identifiant manquant.' };
  if (id === user.id) return { ok: false, error: 'Vous ne pouvez pas désactiver votre propre compte.' };

  const supabase = createServerSupabase();
  const { data: target } = await supabase
    .from('profiles')
    .select('enabled, full_name')
    .eq('id', id)
    .eq('organization_id', user.org_id)
    .maybeSingle();

  if (!target) return { ok: false, error: 'Utilisateur introuvable.' };

  const next = !target.enabled;
  const { error } = await supabase
    .from('profiles')
    .update({ enabled: next })
    .eq('id', id)
    .eq('organization_id', user.org_id);

  if (error) return { ok: false, error: GENERIC_ERROR };

  await logActivity(supabase, user, next ? 'Utilisateur activé' : 'Utilisateur désactivé', target.full_name as string);
  refresh(['/settings']);
  return { ok: true, message: next ? 'Utilisateur activé.' : 'Utilisateur désactivé.' };
}

export async function updateUser(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (user.role !== 'admin') return { ok: false, error: 'Action réservée aux administrateurs.' };

  const id = str(formData, 'id');
  const fullName = str(formData, 'full_name');
  if (!id || !fullName) return { ok: false, error: 'Données incomplètes.' };

  const supabase = createServerSupabase();
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, role: str(formData, 'role') || 'agent' })
    .eq('id', id)
    .eq('organization_id', user.org_id);

  if (error) return { ok: false, error: GENERIC_ERROR };

  await logActivity(supabase, user, 'Utilisateur modifié', fullName);
  refresh(['/settings']);
  return { ok: true, message: 'Utilisateur mis à jour.' };
}

export async function updateProfile(formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const fullName = str(formData, 'full_name');
  if (!fullName) return { ok: false, error: 'Le nom est requis.' };

  const supabase = createServerSupabase();
  const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
  if (error) return { ok: false, error: GENERIC_ERROR };

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

  const supabase = createServerSupabase();

  // Vérifie le mot de passe actuel en tentant une reconnexion.
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (verifyError) return { ok: false, error: 'Le mot de passe actuel est incorrect.' };

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) return { ok: false, error: GENERIC_ERROR };

  refresh(['/settings']);
  return { ok: true, message: 'Votre mot de passe a été modifié.' };
}

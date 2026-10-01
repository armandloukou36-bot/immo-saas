'use client';

import { useState } from 'react';
import { ActionForm, SubmitButton } from '@/components/ui/ActionForm';
import { Modal } from '@/components/ui/Modal';
import { ConfirmAction } from '@/components/ui/ConfirmAction';
import { INVOICE_STATUS, PAYMENT_METHOD, StatusBadge, statusOf } from '@/components/ui/StatusBadge';
import { createInvoice, updateInvoice, deleteInvoice, recordPayment } from '@/app/actions';
import { formatDate, formatFCFA, today } from '@/lib/format';
import type { Client, InvoiceWithRelations, Lease, Payment, Property } from '@/lib/types';

const STATUSES = ['pending', 'paid', 'overdue', 'cancelled', 'write_off'];
const RECURRENCES: Record<string, string> = {
  monthly: 'Mensuel',
  yearly: 'Annuel',
  weekly: 'Hebdomadaire',
  'one-time': 'Unique',
};

type LeaseOption = Lease & { client_name: string | null; property_name: string | null };

function InvoiceFields({
  invoice,
  properties,
  clients,
  leases,
}: {
  invoice?: InvoiceWithRelations;
  properties: Property[];
  clients: Client[];
  leases: LeaseOption[];
}) {
  return (
    <>
      {invoice && <input type="hidden" name="id" value={invoice.id} />}
      {invoice && <input type="hidden" name="invoice_number" value={invoice.invoice_number} />}
      {invoice && <input type="hidden" name="client_name" value={invoice.client_name ?? ''} />}

      {!invoice && (
        <div className="form-section">
          <label className="form-label" htmlFor="lease_id">
            Bail associé
          </label>
          <select id="lease_id" name="lease_id" className="input-base" defaultValue="">
            <option value="">— Facture libre (sans bail) —</option>
            {leases.map((l) => (
              <option key={l.id} value={l.id}>
                {l.reference} · {l.property_name} · {l.client_name}
              </option>
            ))}
          </select>
          <p className="form-hint">Sélectionner un bail pré-remplit automatiquement le client et le bien.</p>
        </div>
      )}

      <div className="form-section">
        <label className="form-label" htmlFor="client_id">
          Client
        </label>
        <select id="client_id" name="client_id" className="input-base" defaultValue={invoice?.client_id ?? ''}>
          <option value="">— Aucun —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-section">
        <label className="form-label" htmlFor="property_id">
          Bien
        </label>
        <select id="property_id" name="property_id" className="input-base" defaultValue={invoice?.property_id ?? ''}>
          <option value="">— Aucun —</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="form-section">
          <label className="form-label" htmlFor="amount">
            Montant (FCFA) *
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="1"
            step="1"
            className="input-base"
            defaultValue={invoice?.amount ?? ''}
            required
          />
        </div>
        <div className="form-section">
          <label className="form-label" htmlFor="due_date">
            Date d&apos;échéance *
          </label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            className="input-base"
            defaultValue={invoice ? invoice.due_date.slice(0, 10) : today()}
            required
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="form-section">
          <label className="form-label" htmlFor="recurrence">
            Récurrence
          </label>
          <select id="recurrence" name="recurrence" className="input-base" defaultValue={invoice?.recurrence ?? 'monthly'}>
            {Object.entries(RECURRENCES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-section">
          <label className="form-label" htmlFor="status">
            Statut
          </label>
          <select id="status" name="status" className="input-base" defaultValue={invoice?.status ?? 'pending'}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusOf(INVOICE_STATUS, s).label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-section">
        <label className="form-label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          className="input-base"
          defaultValue={invoice?.description ?? ''}
        />
      </div>
    </>
  );
}

export function InvoicesClient({
  invoices,
  properties,
  clients,
  leases,
  payments,
}: {
  invoices: InvoiceWithRelations[];
  properties: Property[];
  clients: Client[];
  leases: LeaseOption[];
  payments: Payment[];
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<InvoiceWithRelations | null>(null);
  const [paying, setPaying] = useState<InvoiceWithRelations | null>(null);

  const filtered = invoices.filter((i) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      i.invoice_number.toLowerCase().includes(q) ||
      (i.client_name ?? '').toLowerCase().includes(q) ||
      (i.property_name ?? '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totals = {
    pending: invoices.filter((i) => i.status === 'pending').reduce((s, i) => s + i.amount, 0),
    paid: invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0),
    overdue: invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.amount, 0),
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-navy-900 font-serif">Factures</h2>
          <p className="text-navy-500 mt-1">
            {invoices.length} facture{invoices.length > 1 ? 's' : ''} enregistrée{invoices.length > 1 ? 's' : ''}
          </p>
        </div>
        <button type="button" onClick={() => setCreateOpen(true)} className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle facture
        </button>
      </div>

      {/* Totaux */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'En attente', value: totals.pending, color: 'bg-amber-400' },
          { label: 'Payées', value: totals.paid, color: 'bg-green-500' },
          { label: 'En retard', value: totals.overdue, color: 'bg-red-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-navy-100 p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-navy-500 mb-1">{s.label}</div>
              <div className="text-lg font-bold text-navy-900 font-serif">{formatFCFA(s.value)}</div>
            </div>
            <div className={`w-4 h-4 rounded-full ${s.color}`} />
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une facture..."
            className="input-base"
            aria-label="Rechercher une facture"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-base w-auto"
          aria-label="Filtrer par statut"
        >
          <option value="all">Toutes les factures</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusOf(INVOICE_STATUS, s).label}
            </option>
          ))}
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-navy-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>N° Facture</th>
                <th>Client</th>
                <th>Bien</th>
                <th className="text-right">Montant</th>
                <th className="text-right">Encaissé</th>
                <th>Échéance</th>
                <th>Payée le</th>
                <th>Type</th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => {
                const s = statusOf(INVOICE_STATUS, inv.status);
                return (
                  <tr key={inv.id}>
                    <td className="font-mono text-xs text-navy-600">{inv.invoice_number}</td>
                    <td className="font-medium text-navy-900">{inv.client_name ?? '—'}</td>
                    <td className="text-navy-600 text-sm">{inv.property_name ?? '—'}</td>
                    <td className="text-right font-medium whitespace-nowrap">{formatFCFA(inv.amount)}</td>
                    <td className="text-right text-sm whitespace-nowrap text-navy-600">{formatFCFA(inv.paid_total)}</td>
                    <td className="text-navy-600 text-sm whitespace-nowrap">{formatDate(inv.due_date)}</td>
                    <td className="text-navy-600 text-sm whitespace-nowrap">{formatDate(inv.paid_date)}</td>
                    <td className="text-navy-500 text-xs whitespace-nowrap">{RECURRENCES[inv.recurrence] ?? inv.recurrence}</td>
                    <td>
                      <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => setPaying(inv)}
                            className="text-xs text-green-600 hover:text-green-700 font-medium px-2 py-1 whitespace-nowrap"
                          >
                            Paiement
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditing(inv)}
                          className="text-xs text-gold-500 hover:text-gold-600 font-medium px-2 py-1"
                        >
                          Modifier
                        </button>
                        <ConfirmAction
                          action={deleteInvoice}
                          hidden={{ id: inv.id, invoice_number: inv.invoice_number }}
                          title="Supprimer cette facture ?"
                          description={
                            <>
                              La facture <strong>{inv.invoice_number}</strong> et ses paiements associés seront
                              définitivement supprimés.
                            </>
                          }
                          confirmLabel="Supprimer"
                          triggerTitle="Supprimer"
                          trigger={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          }
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-navy-500">
              {invoices.length === 0 ? 'Aucune facture enregistrée.' : 'Aucune facture ne correspond à votre recherche.'}
            </p>
          </div>
        )}
      </div>

      {/* Historique des paiements */}
      <div className="bg-white rounded-xl border border-navy-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-100">
          <h3 className="font-semibold text-navy-900">Derniers paiements</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Facture</th>
                <th className="text-right">Montant</th>
                <th>Moyen</th>
                <th>Référence</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const inv = invoices.find((i) => i.id === p.invoice_id);
                return (
                  <tr key={p.id}>
                    <td className="text-navy-600 text-sm whitespace-nowrap">{formatDate(p.payment_date)}</td>
                    <td className="font-mono text-xs text-navy-600">{inv?.invoice_number ?? '—'}</td>
                    <td className="text-right font-medium whitespace-nowrap">{formatFCFA(p.amount)}</td>
                    <td className="text-navy-600 text-sm">{PAYMENT_METHOD[p.method] ?? p.method}</td>
                    <td className="text-navy-500 text-xs">{p.reference ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {payments.length === 0 && <div className="py-8 text-center text-navy-500 text-sm">Aucun paiement enregistré.</div>}
      </div>

      {/* Modale de création */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nouvelle facture"
        subtitle="Le numéro est généré automatiquement"
        size="lg"
      >
        <ActionForm action={createInvoice} onSuccess={() => setCreateOpen(false)}>
          <InvoiceFields properties={properties} clients={clients} leases={leases} />
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn btn-ghost">
              Annuler
            </button>
            <SubmitButton pendingLabel="Enregistrement…">Créer la facture</SubmitButton>
          </div>
        </ActionForm>
      </Modal>

      {/* Modale de modification */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Modifier la facture"
        subtitle={editing?.invoice_number}
        size="lg"
      >
        {editing && (
          <ActionForm action={updateInvoice} onSuccess={() => setEditing(null)}>
            <InvoiceFields invoice={editing} properties={properties} clients={clients} leases={leases} />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="btn btn-ghost">
                Annuler
              </button>
              <SubmitButton pendingLabel="Enregistrement…">Enregistrer les modifications</SubmitButton>
            </div>
          </ActionForm>
        )}
      </Modal>

      {/* Modale de paiement */}
      <Modal
        open={paying !== null}
        onClose={() => setPaying(null)}
        title="Enregistrer un paiement"
        subtitle={paying ? `${paying.invoice_number} — ${formatFCFA(paying.amount)}` : undefined}
      >
        {paying && (
          <ActionForm action={recordPayment} onSuccess={() => setPaying(null)}>
            <input type="hidden" name="invoice_id" value={paying.id} />

            <div className="p-3 rounded-lg bg-navy-50 border border-navy-100 text-sm text-navy-600">
              Montant dû : <strong>{formatFCFA(paying.amount)}</strong> · Déjà encaissé :{' '}
              <strong>{formatFCFA(paying.paid_total)}</strong> · Reste :{' '}
              <strong>{formatFCFA(Math.max(0, paying.amount - paying.paid_total))}</strong>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="form-section">
                <label className="form-label" htmlFor="amount">
                  Montant reçu (FCFA) *
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="1"
                  step="1"
                  className="input-base"
                  defaultValue={Math.max(0, paying.amount - paying.paid_total) || paying.amount}
                  required
                />
              </div>
              <div className="form-section">
                <label className="form-label" htmlFor="payment_date">
                  Date du paiement
                </label>
                <input id="payment_date" name="payment_date" type="date" className="input-base" defaultValue={today()} />
              </div>
            </div>

            <div className="form-section">
              <label className="form-label" htmlFor="method">
                Moyen de paiement
              </label>
              <select id="method" name="method" className="input-base" defaultValue="mobile_money">
                {Object.entries(PAYMENT_METHOD).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-section">
              <label className="form-label" htmlFor="reference">
                Référence
              </label>
              <input id="reference" name="reference" type="text" className="input-base" placeholder="Ex : MM-889201" />
            </div>

            <div className="form-section">
              <label className="form-label" htmlFor="notes">
                Notes
              </label>
              <textarea id="notes" name="notes" rows={2} className="input-base" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setPaying(null)} className="btn btn-ghost">
                Annuler
              </button>
              <SubmitButton className="btn btn-gold" pendingLabel="Enregistrement…">
                Enregistrer le paiement
              </SubmitButton>
            </div>
          </ActionForm>
        )}
      </Modal>
    </div>
  );
}

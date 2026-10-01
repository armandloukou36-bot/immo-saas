'use client';

import { useState } from 'react';
import { ActionForm, SubmitButton } from '@/components/ui/ActionForm';
import { Modal } from '@/components/ui/Modal';
import { ConfirmAction } from '@/components/ui/ConfirmAction';
import { RECOVERY_STATUS, StatusBadge, statusOf } from '@/components/ui/StatusBadge';
import { createRecoveryCase, updateRecoveryCase, deleteRecoveryCase } from '@/app/actions';
import { formatDate, formatFCFA } from '@/lib/format';
import type { InvoiceWithRelations, RecoveryWithRelations } from '@/lib/types';

const STATUSES = ['open', 'investigating', 'notice_sent', 'legal_action', 'resolved', 'closed', 'waived'];
const CLOSED = ['resolved', 'closed', 'waived'];

function RecoveryFields({ item, currentUser }: { item?: RecoveryWithRelations; currentUser: string }) {
  return (
    <>
      {item && <input type="hidden" name="id" value={item.id} />}
      {item && <input type="hidden" name="reference" value={item.reference} />}

      <div className="form-section">
        <label className="form-label" htmlFor="amount_due">
          Montant dû (FCFA) *
        </label>
        <input
          id="amount_due"
          name="amount_due"
          type="number"
          min="1"
          step="1"
          className="input-base"
          defaultValue={item?.amount_due ?? ''}
          required
        />
      </div>

      <div className="form-section">
        <label className="form-label" htmlFor="status">
          Statut du dossier
        </label>
        <select id="status" name="status" className="input-base" defaultValue={item?.status ?? 'open'}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusOf(RECOVERY_STATUS, s).label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-section">
        <label className="form-label" htmlFor="assigned_to">
          Assigné à
        </label>
        <input
          id="assigned_to"
          name="assigned_to"
          type="text"
          className="input-base"
          defaultValue={item?.assigned_to ?? currentUser}
        />
      </div>

      {item && (
        <div className="form-section">
          <label className="form-label" htmlFor="resolution">
            Résolution
          </label>
          <textarea id="resolution" name="resolution" rows={2} className="input-base" defaultValue={item?.resolution ?? ''} />
        </div>
      )}

      <div className="form-section">
        <label className="form-label" htmlFor="notes">
          Notes
        </label>
        <textarea id="notes" name="notes" rows={3} className="input-base" defaultValue={item?.notes ?? ''} />
      </div>
    </>
  );
}

export function RecoveryClient({
  cases,
  eligibleInvoices,
  currentUser,
}: {
  cases: RecoveryWithRelations[];
  eligibleInvoices: InvoiceWithRelations[];
  currentUser: string;
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<RecoveryWithRelations | null>(null);

  const filtered = cases.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.reference.toLowerCase().includes(q) ||
      (c.client_name ?? '').toLowerCase().includes(q) ||
      (c.invoice_number ?? '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openAmount = cases
    .filter((c) => !CLOSED.includes(c.status))
    .reduce((sum, c) => sum + c.amount_due, 0);

  const counters = [
    { label: 'Ouverts', count: cases.filter((c) => c.status === 'open').length, color: 'bg-amber-400' },
    { label: 'En cours', count: cases.filter((c) => c.status === 'investigating' || c.status === 'notice_sent').length, color: 'bg-blue-500' },
    { label: 'Action légale', count: cases.filter((c) => c.status === 'legal_action').length, color: 'bg-red-500' },
    { label: 'Résolus / clôturés', count: cases.filter((c) => CLOSED.includes(c.status)).length, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-navy-900 font-serif">Recouvrement</h2>
          <p className="text-navy-500 mt-1">Gestion des impayés et des dossiers de recouvrement</p>
        </div>
        <button type="button" onClick={() => setCreateOpen(true)} className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouveau dossier
        </button>
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {counters.map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-navy-100 p-3 flex items-center justify-between">
            <div className="text-xs text-navy-500">{s.label}</div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
              <span className="text-lg font-bold text-navy-900">{s.count}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-navy-600">
        Montant total à récupérer : <strong className="text-red-600 font-serif">{formatFCFA(openAmount)}</strong>
      </p>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un dossier..."
            className="input-base"
            aria-label="Rechercher un dossier"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-base w-auto"
          aria-label="Filtrer par statut"
        >
          <option value="all">Tous les statuts</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusOf(RECOVERY_STATUS, s).label}
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
                <th>Référence</th>
                <th>Client</th>
                <th>Facture</th>
                <th>Bien</th>
                <th className="text-right">Montant dû</th>
                <th>Ouvert le</th>
                <th>Assigné à</th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const s = statusOf(RECOVERY_STATUS, c.status);
                return (
                  <tr key={c.id}>
                    <td className="font-mono text-xs text-navy-600">{c.reference}</td>
                    <td className="font-medium text-navy-900">{c.client_name ?? '—'}</td>
                    <td className="text-navy-500 text-xs font-mono">{c.invoice_number ?? '—'}</td>
                    <td className="text-navy-600 text-sm">{c.property_name ?? '—'}</td>
                    <td className="text-right font-medium text-red-600 font-serif whitespace-nowrap">
                      {formatFCFA(c.amount_due)}
                    </td>
                    <td className="text-navy-600 text-sm whitespace-nowrap">{formatDate(c.opened_at)}</td>
                    <td className="text-navy-600 text-sm">{c.assigned_to ?? 'Non assigné'}</td>
                    <td>
                      <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(c)}
                          className="text-xs text-gold-500 hover:text-gold-600 font-medium px-2 py-1"
                        >
                          Modifier
                        </button>
                        <ConfirmAction
                          action={deleteRecoveryCase}
                          hidden={{ id: c.id, reference: c.reference }}
                          title="Supprimer ce dossier ?"
                          description={<>Le dossier <strong>{c.reference}</strong> sera définitivement supprimé.</>}
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
              {cases.length === 0 ? 'Aucun dossier de recouvrement.' : 'Aucun dossier ne correspond à votre recherche.'}
            </p>
          </div>
        )}
      </div>

      {/* Légende */}
      <div className="bg-white rounded-xl border border-navy-100 p-4">
        <h3 className="font-semibold text-navy-900 text-sm mb-3">📋 État des dossiers</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-2 rounded bg-amber-50 border border-amber-100">
            <span className="font-medium text-amber-700">Ouvert</span>
            <p className="text-navy-500 mt-0.5">Dossier créé, en attente d&apos;action</p>
          </div>
          <div className="p-2 rounded bg-blue-50 border border-blue-100">
            <span className="font-medium text-blue-700">Investigation</span>
            <p className="text-navy-500 mt-0.5">Contact en cours, vérification des informations</p>
          </div>
          <div className="p-2 rounded bg-green-50 border border-green-100">
            <span className="font-medium text-green-700">Résolu / Clôturé</span>
            <p className="text-navy-500 mt-0.5">Paiement récupéré, dossier terminé</p>
          </div>
          <div className="p-2 rounded bg-red-50 border border-red-100">
            <span className="font-medium text-red-700">Action légale</span>
            <p className="text-navy-500 mt-0.5">Procédure judiciaire engagée</p>
          </div>
        </div>
      </div>

      {/* Modale de création */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nouveau dossier de recouvrement"
        subtitle="Ouvrez un dossier pour une facture impayée"
        size="lg"
      >
        <ActionForm action={createRecoveryCase} onSuccess={() => setCreateOpen(false)}>
          <div className="form-section">
            <label className="form-label" htmlFor="invoice_id">
              Facture impayée *
            </label>
            <select id="invoice_id" name="invoice_id" className="input-base" required defaultValue="">
              <option value="">— Sélectionner une facture —</option>
              {eligibleInvoices.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.invoice_number} · {i.client_name ?? 'Sans client'} · {formatFCFA(i.amount)} · échéance{' '}
                  {formatDate(i.due_date)}
                </option>
              ))}
            </select>
            {eligibleInvoices.length === 0 && (
              <p className="form-hint text-amber-600">
                Aucune facture impayée éligible : toutes les factures en attente ont déjà un dossier ouvert.
              </p>
            )}
          </div>

          <RecoveryFields currentUser={currentUser} />

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn btn-ghost">
              Annuler
            </button>
            <SubmitButton pendingLabel="Création…">Ouvrir le dossier</SubmitButton>
          </div>
        </ActionForm>
      </Modal>

      {/* Modale de modification */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Modifier le dossier"
        subtitle={editing?.reference}
        size="lg"
      >
        {editing && (
          <ActionForm action={updateRecoveryCase} onSuccess={() => setEditing(null)}>
            <RecoveryFields item={editing} currentUser={currentUser} />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="btn btn-ghost">
                Annuler
              </button>
              <SubmitButton pendingLabel="Enregistrement…">Enregistrer les modifications</SubmitButton>
            </div>
          </ActionForm>
        )}
      </Modal>
    </div>
  );
}

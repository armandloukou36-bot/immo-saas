'use client';

import { useState } from 'react';
import { ActionForm, SubmitButton } from '@/components/ui/ActionForm';
import { Modal } from '@/components/ui/Modal';
import { ConfirmAction } from '@/components/ui/ConfirmAction';
import { LEASE_STATUS, StatusBadge, statusOf } from '@/components/ui/StatusBadge';
import { createLease, updateLease, deleteLease } from '@/app/actions';
import { formatDate, formatFCFA, monthsRemaining, today } from '@/lib/format';
import type { Client, LeaseWithRelations, Property } from '@/lib/types';

const STATUSES = ['active', 'pending', 'draft', 'terminated', 'expired'];

function LeaseFields({
  lease,
  properties,
  clients,
}: {
  lease?: LeaseWithRelations;
  properties: Property[];
  clients: Client[];
}) {
  return (
    <>
      {lease && <input type="hidden" name="id" value={lease.id} />}
      {lease && <input type="hidden" name="reference" value={lease.reference} />}

      <div className="form-section">
        <label className="form-label" htmlFor="property_id">
          Bien concerné *
        </label>
        <select id="property_id" name="property_id" className="input-base" defaultValue={lease?.property_id ?? ''} required>
          <option value="">— Sélectionner un bien —</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} {p.city ? `— ${p.city}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="form-section">
        <label className="form-label" htmlFor="client_id">
          Locataire *
        </label>
        <select id="client_id" name="client_id" className="input-base" defaultValue={lease?.client_id ?? ''} required>
          <option value="">— Sélectionner un client —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name} ({c.type})
            </option>
          ))}
        </select>
        {clients.length === 0 && (
          <p className="form-hint text-amber-600">Aucun client disponible : créez d&apos;abord une fiche client.</p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="form-section">
          <label className="form-label" htmlFor="start_date">
            Date de début *
          </label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            className="input-base"
            defaultValue={lease ? lease.start_date.slice(0, 10) : today()}
            required
          />
        </div>
        <div className="form-section">
          <label className="form-label" htmlFor="end_date">
            Date de fin
          </label>
          <input
            id="end_date"
            name="end_date"
            type="date"
            className="input-base"
            defaultValue={lease?.end_date ? lease.end_date.slice(0, 10) : ''}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="form-section">
          <label className="form-label" htmlFor="monthly_rent">
            Loyer mensuel (FCFA) *
          </label>
          <input
            id="monthly_rent"
            name="monthly_rent"
            type="number"
            min="1"
            step="1"
            className="input-base"
            defaultValue={lease?.monthly_rent ?? ''}
            required
          />
        </div>
        <div className="form-section">
          <label className="form-label" htmlFor="deposit">
            Dépôt de garantie (FCFA)
          </label>
          <input
            id="deposit"
            name="deposit"
            type="number"
            min="0"
            step="1"
            className="input-base"
            defaultValue={lease?.deposit ?? ''}
          />
        </div>
      </div>

      <div className="form-section">
        <label className="form-label" htmlFor="status">
          Statut
        </label>
        <select id="status" name="status" className="input-base" defaultValue={lease?.status ?? 'active'}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusOf(LEASE_STATUS, s).label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-section">
        <label className="form-label" htmlFor="notes">
          Conditions / notes
        </label>
        <textarea id="notes" name="notes" rows={3} className="input-base" defaultValue={lease?.notes ?? ''} />
      </div>
    </>
  );
}

export function LeasesClient({
  leases,
  properties,
  clients,
}: {
  leases: LeaseWithRelations[];
  properties: Property[];
  clients: Client[];
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<LeaseWithRelations | null>(null);

  const filtered = leases.filter((l) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      l.reference.toLowerCase().includes(q) ||
      (l.property_name ?? '').toLowerCase().includes(q) ||
      (l.client_name ?? '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const active = leases.filter((l) => l.status === 'active');
  const monthlyRevenue = active.reduce((sum, l) => sum + l.monthly_rent, 0);
  const totalDeposits = active.reduce((sum, l) => sum + l.deposit, 0);

  const counters = [
    { label: 'Baux actifs', value: String(active.length), color: 'bg-green-500' },
    { label: 'Brouillons', value: String(leases.filter((l) => l.status === 'draft').length), color: 'bg-navy-400' },
    { label: 'Terminés / expirés', value: String(leases.filter((l) => l.status === 'terminated' || l.status === 'expired').length), color: 'bg-amber-500' },
    { label: 'Revenu mensuel', value: formatFCFA(monthlyRevenue), color: 'bg-gold-400' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-navy-900 font-serif">Baux &amp; Contrats</h2>
          <p className="text-navy-500 mt-1">
            {leases.length} bail{leases.length > 1 ? 'x' : ''} enregistré{leases.length > 1 ? 's' : ''}
          </p>
        </div>
        <button type="button" onClick={() => setCreateOpen(true)} className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouveau bail
        </button>
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {counters.map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-navy-100 p-3">
            <div className="text-xs text-navy-500 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
              {s.label}
            </div>
            <div className="text-lg font-bold text-navy-900 mt-1 truncate">{s.value}</div>
          </div>
        ))}
      </div>

      <p className="text-xs text-navy-500">
        Dépôts de garantie détenus : <strong>{formatFCFA(totalDeposits)}</strong>
      </p>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un bail..."
            className="input-base"
            aria-label="Rechercher un bail"
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
              {statusOf(LEASE_STATUS, s).label}
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
                <th>N° Bail</th>
                <th>Bien</th>
                <th>Locataire</th>
                <th>Début</th>
                <th>Fin</th>
                <th className="text-right">Loyer</th>
                <th className="text-right">Dépôt</th>
                <th>Restant</th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lease) => {
                const s = statusOf(LEASE_STATUS, lease.status);
                return (
                  <tr key={lease.id}>
                    <td className="font-mono text-xs text-navy-600">{lease.reference}</td>
                    <td className="font-medium text-navy-900">{lease.property_name ?? '—'}</td>
                    <td className="text-navy-600">{lease.client_name ?? '—'}</td>
                    <td className="text-navy-600 text-sm whitespace-nowrap">{formatDate(lease.start_date)}</td>
                    <td className="text-navy-600 text-sm whitespace-nowrap">{formatDate(lease.end_date)}</td>
                    <td className="text-right font-medium whitespace-nowrap">{formatFCFA(lease.monthly_rent)}</td>
                    <td className="text-right text-navy-600 text-sm whitespace-nowrap">{formatFCFA(lease.deposit)}</td>
                    <td className="text-navy-600 text-sm whitespace-nowrap">{monthsRemaining(lease.end_date)}</td>
                    <td>
                      <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(lease)}
                          className="text-xs text-gold-500 hover:text-gold-600 font-medium px-2 py-1"
                        >
                          Modifier
                        </button>
                        <ConfirmAction
                          action={deleteLease}
                          hidden={{ id: lease.id, reference: lease.reference }}
                          title="Supprimer ce bail ?"
                          description={
                            <>
                              Le bail <strong>{lease.reference}</strong> sera définitivement supprimé. Les factures liées
                              resteront mais ne seront plus rattachées à un bail.
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
              {leases.length === 0 ? 'Aucun bail enregistré. Créez votre premier bail.' : 'Aucun bail ne correspond à votre recherche.'}
            </p>
          </div>
        )}
      </div>

      {/* Modale de création */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nouveau bail"
        subtitle="Associez un bien à un locataire"
        size="lg"
      >
        <ActionForm action={createLease} onSuccess={() => setCreateOpen(false)}>
          <LeaseFields properties={properties} clients={clients} />
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn btn-ghost">
              Annuler
            </button>
            <SubmitButton pendingLabel="Enregistrement…">Créer le bail</SubmitButton>
          </div>
        </ActionForm>
      </Modal>

      {/* Modale de modification */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Modifier le bail"
        subtitle={editing?.reference}
        size="lg"
      >
        {editing && (
          <ActionForm action={updateLease} onSuccess={() => setEditing(null)}>
            <LeaseFields lease={editing} properties={properties} clients={clients} />
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

'use client';

import { useState } from 'react';
import { ActionForm, SubmitButton } from '@/components/ui/ActionForm';
import { Modal } from '@/components/ui/Modal';
import { ConfirmAction } from '@/components/ui/ConfirmAction';
import { CLIENT_STATUS, StatusBadge, statusOf } from '@/components/ui/StatusBadge';
import { TypeIcon } from '@/components/ui/TypeIcon';
import { createClient, updateClient, deleteClient } from '@/app/actions';
import { formatDate } from '@/lib/format';
import type { ClientWithProperty, Property } from '@/lib/types';

const TYPES = ['locataire', 'propriétaire', 'prospect', 'vendeur', 'autre'];
const STATUSES = ['actif', 'lead', 'inactif', 'negotiation'];

function ClientFields({ client, properties }: { client?: ClientWithProperty; properties: Property[] }) {
  return (
    <>
      {client && <input type="hidden" name="id" value={client.id} />}

      <div className="form-section">
        <label className="form-label" htmlFor="full_name">
          Nom complet *
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          className="input-base"
          defaultValue={client?.full_name ?? ''}
          placeholder="Ex : M. Kouassi Jean-Baptiste"
          required
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="form-section">
          <label className="form-label" htmlFor="type">
            Type
          </label>
          <select id="type" name="type" className="input-base" defaultValue={client?.type ?? 'locataire'}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="form-section">
          <label className="form-label" htmlFor="status">
            Statut
          </label>
          <select id="status" name="status" className="input-base" defaultValue={client?.status ?? 'actif'}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusOf(CLIENT_STATUS, s).label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="form-section">
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" className="input-base" defaultValue={client?.email ?? ''} />
        </div>
        <div className="form-section">
          <label className="form-label" htmlFor="phone">
            Téléphone
          </label>
          <input id="phone" name="phone" type="tel" className="input-base" defaultValue={client?.phone ?? ''} />
        </div>
      </div>

      <div className="form-section">
        <label className="form-label" htmlFor="property_id">
          Bien associé
        </label>
        <select id="property_id" name="property_id" className="input-base" defaultValue={client?.property_id ?? ''}>
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
          <label className="form-label" htmlFor="address">
            Adresse
          </label>
          <input id="address" name="address" type="text" className="input-base" defaultValue={client?.address ?? ''} />
        </div>
        <div className="form-section">
          <label className="form-label" htmlFor="city">
            Ville
          </label>
          <input id="city" name="city" type="text" className="input-base" defaultValue={client?.city ?? ''} />
        </div>
      </div>

      <div className="form-section">
        <label className="form-label" htmlFor="notes">
          Notes
        </label>
        <textarea id="notes" name="notes" rows={3} className="input-base" defaultValue={client?.notes ?? ''} />
      </div>
    </>
  );
}

export function ClientsClient({ clients, properties }: { clients: ClientWithProperty[]; properties: Property[] }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<ClientWithProperty | null>(null);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.full_name.toLowerCase().includes(q) ||
      (c.email ?? '').toLowerCase().includes(q) ||
      (c.phone ?? '').toLowerCase().includes(q);
    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-navy-900 font-serif">Clients</h2>
          <p className="text-navy-500 mt-1">
            {clients.length} client{clients.length > 1 ? 's' : ''} enregistré{clients.length > 1 ? 's' : ''}
          </p>
        </div>
        <button type="button" onClick={() => setCreateOpen(true)} className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouveau client
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <svg
            className="w-4 h-4 text-navy-400 absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.394 10.394z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un client..."
            className="input-base pl-10"
            aria-label="Rechercher un client"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input-base w-auto"
          aria-label="Filtrer par type"
        >
          <option value="all">Tous les types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-base w-auto"
          aria-label="Filtrer par statut"
        >
          <option value="all">Tous les statuts</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusOf(CLIENT_STATUS, s).label}
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
                <th>Client</th>
                <th>Contact</th>
                <th>Type</th>
                <th>Bien</th>
                <th>Statut</th>
                <th>Créé le</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => {
                const s = statusOf(CLIENT_STATUS, client.status);
                return (
                  <tr key={client.id}>
                    <td className="font-medium text-navy-900">{client.full_name}</td>
                    <td className="text-navy-600 text-sm">
                      {client.email && <div>{client.email}</div>}
                      {client.phone && <div className="text-navy-500">{client.phone}</div>}
                      {!client.email && !client.phone && '—'}
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <TypeIcon type={client.type} />
                        <span className="text-sm text-navy-700 capitalize">{client.type}</span>
                      </div>
                    </td>
                    <td className="text-navy-600">{client.property_name ?? '—'}</td>
                    <td>
                      <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
                    </td>
                    <td className="text-navy-500 text-sm whitespace-nowrap">{formatDate(client.created_at)}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(client)}
                          className="text-xs text-gold-500 hover:text-gold-600 font-medium px-2 py-1"
                        >
                          Modifier
                        </button>
                        <ConfirmAction
                          action={deleteClient}
                          hidden={{ id: client.id, name: client.full_name }}
                          title="Supprimer ce client ?"
                          description={
                            <>
                              Le client <strong>{client.full_name}</strong> sera définitivement supprimé, ainsi que ses
                              baux et factures. Cette action est irréversible.
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
              {clients.length === 0 ? 'Aucun client enregistré. Ajoutez votre premier client.' : 'Aucun client ne correspond à votre recherche.'}
            </p>
          </div>
        )}
      </div>

      {/* Modale de création */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nouveau client"
        subtitle="Renseignez les informations du client"
        size="lg"
      >
        <ActionForm action={createClient} onSuccess={() => setCreateOpen(false)}>
          <ClientFields properties={properties} />
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn btn-ghost">
              Annuler
            </button>
            <SubmitButton pendingLabel="Enregistrement…">Ajouter le client</SubmitButton>
          </div>
        </ActionForm>
      </Modal>

      {/* Modale de modification */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Modifier le client"
        subtitle={editing?.full_name}
        size="lg"
      >
        {editing && (
          <ActionForm action={updateClient} onSuccess={() => setEditing(null)}>
            <ClientFields client={editing} properties={properties} />
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

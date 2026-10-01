'use client';

import { useState } from 'react';
import { ActionForm, SubmitButton } from '@/components/ui/ActionForm';
import { Modal } from '@/components/ui/Modal';
import { ConfirmAction } from '@/components/ui/ConfirmAction';
import { PROPERTY_STATUS, PROPERTY_TYPE_LABEL, StatusBadge, statusOf } from '@/components/ui/StatusBadge';
import { TypeIcon } from '@/components/ui/TypeIcon';
import { createProperty, updateProperty, deleteProperty } from '@/app/actions';
import { formatFCFA, humanize } from '@/lib/format';
import type { Property } from '@/lib/types';

const TYPES = ['villa', 'appartement', 'terrain', 'local', 'bureau', 'hotel', 'autre'];
const STATUSES = ['disponible', 'loué', 'en_negociation', 'vendu', 'reserve', 'en_construction'];

/** Champs communs aux formulaires de création et de modification. */
function PropertyFields({ property }: { property?: Property }) {
  return (
    <>
      {property && <input type="hidden" name="id" value={property.id} />}

      <div className="form-section">
        <label className="form-label" htmlFor="name">
          Nom du bien *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className="input-base"
          defaultValue={property?.name ?? ''}
          placeholder="Ex : Villa Cocody"
          required
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="form-section">
          <label className="form-label" htmlFor="type">
            Type
          </label>
          <select id="type" name="type" className="input-base" defaultValue={property?.type ?? 'appartement'}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {PROPERTY_TYPE_LABEL[t] ?? humanize(t)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-section">
          <label className="form-label" htmlFor="status">
            Statut
          </label>
          <select id="status" name="status" className="input-base" defaultValue={property?.status ?? 'disponible'}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusOf(PROPERTY_STATUS, s).label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-section">
        <label className="form-label" htmlFor="address">
          Adresse *
        </label>
        <input
          id="address"
          name="address"
          type="text"
          className="input-base"
          defaultValue={property?.address ?? ''}
          placeholder="Ex : Cocody Angré, Abidjan"
          required
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="form-section">
          <label className="form-label" htmlFor="city">
            Ville / Commune
          </label>
          <input id="city" name="city" type="text" className="input-base" defaultValue={property?.city ?? ''} />
        </div>
        <div className="form-section">
          <label className="form-label" htmlFor="surface">
            Surface (m²)
          </label>
          <input
            id="surface"
            name="surface"
            type="number"
            min="0"
            step="0.01"
            className="input-base"
            defaultValue={property?.surface ?? ''}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="form-section">
          <label className="form-label" htmlFor="rooms">
            Pièces
          </label>
          <input id="rooms" name="rooms" type="number" min="0" className="input-base" defaultValue={property?.rooms ?? ''} />
        </div>
        <div className="form-section">
          <label className="form-label" htmlFor="bedrooms">
            Chambres
          </label>
          <input
            id="bedrooms"
            name="bedrooms"
            type="number"
            min="0"
            className="input-base"
            defaultValue={property?.bedrooms ?? ''}
          />
        </div>
        <div className="form-section">
          <label className="form-label" htmlFor="bathrooms">
            Salles de bain
          </label>
          <input
            id="bathrooms"
            name="bathrooms"
            type="number"
            min="0"
            className="input-base"
            defaultValue={property?.bathrooms ?? ''}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="form-section">
          <label className="form-label" htmlFor="price">
            Prix de vente (FCFA)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="1"
            className="input-base"
            defaultValue={property?.price ?? ''}
          />
        </div>
        <div className="form-section">
          <label className="form-label" htmlFor="rental_price">
            Loyer mensuel (FCFA)
          </label>
          <input
            id="rental_price"
            name="rental_price"
            type="number"
            min="0"
            step="1"
            className="input-base"
            defaultValue={property?.rental_price ?? ''}
          />
        </div>
      </div>

      <div className="form-section">
        <label className="form-label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="input-base"
          defaultValue={property?.description ?? ''}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-navy-700 cursor-pointer">
        <input type="checkbox" name="featured" defaultChecked={(property?.featured ?? 0) === 1} className="w-4 h-4" />
        Mettre en vedette
      </label>
    </>
  );
}

export function PropertiesClient({ properties }: { properties: Property[] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);

  const filtered = properties.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q || p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q) || (p.city ?? '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const counters = [
    { label: 'Disponibles', count: properties.filter((p) => p.status === 'disponible').length, color: 'bg-green-500' },
    { label: 'Loués', count: properties.filter((p) => p.status === 'loué').length, color: 'bg-blue-500' },
    { label: 'En négociation', count: properties.filter((p) => p.status === 'en_negociation').length, color: 'bg-amber-500' },
    { label: 'Vendus', count: properties.filter((p) => p.status === 'vendu').length, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-navy-900 font-serif">Biens immobiliers</h2>
          <p className="text-navy-500 mt-1">
            {properties.length} bien{properties.length > 1 ? 's' : ''} enregistré{properties.length > 1 ? 's' : ''}
          </p>
        </div>
        <button type="button" onClick={() => setCreateOpen(true)} className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouveau bien
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
            placeholder="Rechercher un bien..."
            className="input-base pl-10"
            aria-label="Rechercher un bien"
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
              {statusOf(PROPERTY_STATUS, s).label}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input-base w-auto"
          aria-label="Filtrer par type"
        >
          <option value="all">Tous les types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {PROPERTY_TYPE_LABEL[t] ?? humanize(t)}
            </option>
          ))}
        </select>
      </div>

      {/* Grille */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((property) => {
          const s = statusOf(PROPERTY_STATUS, property.status);
          return (
            <div
              key={property.id}
              className="bg-white rounded-xl border border-navy-100 shadow-sm overflow-hidden card-hover flex flex-col"
            >
              <div className="h-28 bg-navy-100 relative flex items-center justify-center">
                <div className="text-navy-300">
                  <TypeIcon type={property.type} className="w-12 h-12" />
                </div>
                {property.featured === 1 && (
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-400 text-navy-900 text-[10px] font-bold tracking-wider">
                      ★ VEDETTE
                    </span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2">
                  <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-navy-900 truncate">{property.name}</h3>
                    <p className="text-xs text-navy-500 mt-0.5 truncate">{property.address}</p>
                  </div>
                  <div className="text-navy-400 flex-shrink-0">
                    <TypeIcon type={property.type} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-navy-600 mb-3">
                  {property.surface != null && <span>{property.surface} m²</span>}
                  {property.bedrooms != null && property.bedrooms > 0 && <span>{property.bedrooms} ch.</span>}
                  {property.bathrooms != null && property.bathrooms > 0 && <span>{property.bathrooms} sdb</span>}
                </div>

                <div className="mt-auto flex items-center justify-between pt-3 border-t border-navy-50 gap-2">
                  <span className="text-base font-bold text-navy-900 font-serif truncate">
                    {property.price != null && property.price > 0 ? formatFCFA(property.price) : 'Prix non défini'}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditing(property)}
                      className="text-xs text-gold-500 hover:text-gold-600 font-medium px-2 py-1"
                    >
                      Modifier
                    </button>
                    <ConfirmAction
                      action={deleteProperty}
                      hidden={{ id: property.id, name: property.name }}
                      title="Supprimer ce bien ?"
                      description={
                        <>
                          Le bien <strong>{property.name}</strong> sera définitivement supprimé, ainsi que les baux et
                          factures qui y sont rattachés. Cette action est irréversible.
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
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center bg-white rounded-xl border border-navy-100">
          <svg
            className="w-12 h-12 mx-auto text-navy-300 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" />
          </svg>
          <p className="text-navy-500">
            {properties.length === 0 ? 'Aucun bien enregistré. Ajoutez votre premier bien.' : 'Aucun bien ne correspond à votre recherche.'}
          </p>
        </div>
      )}

      {/* Modale de création */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nouveau bien"
        subtitle="Renseignez les informations du bien immobilier"
        size="lg"
      >
        <ActionForm action={createProperty} onSuccess={() => setCreateOpen(false)}>
          <PropertyFields />
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn btn-ghost">
              Annuler
            </button>
            <SubmitButton pendingLabel="Enregistrement…">Ajouter le bien</SubmitButton>
          </div>
        </ActionForm>
      </Modal>

      {/* Modale de modification */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Modifier le bien"
        subtitle={editing?.name}
        size="lg"
      >
        {editing && (
          <ActionForm action={updateProperty} onSuccess={() => setEditing(null)}>
            <PropertyFields property={editing} />
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

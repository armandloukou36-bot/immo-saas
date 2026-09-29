'use client';

import { useState } from 'react';
import Link from 'next/link';

// Données démonstration
const clients = [
  { id: '1', name: 'M. Kouassi Jean-Baptiste', email: 'jean.kouassi@email.com', phone: '+225 05 05 12 34 56', type: 'locataire', status: 'actif', property: 'Villa Cocody', rent: '2 500 000', created: '12 Jan 2026' },
  { id: '2', name: 'Mme Diallo Amina', email: 'amina.diallo@email.com', phone: '+225 07 07 98 76 54', type: 'locataire', status: 'actif', property: 'Appart Les Palmiers', rent: '1 800 000', created: '05 Fév 2026' },
  { id: '3', name: 'M. Traoré Idriss', email: 'idriss.traore@email.com', phone: '+225 05 05 23 45 67', type: 'locataire', status: 'actif', property: 'Villa Angré', rent: '3 200 000', created: '20 Déc 2025' },
  { id: '4', name: 'Mme Koné Fatoumata', email: 'fatoumata.kone@email.com', phone: '+225 07 07 34 56 78', type: 'propriétaire', status: 'actif', property: 'Appart Résidence du Lac', rent: '1 500 000', created: '15 Nov 2025' },
  { id: '5', name: 'M. Bamba Seydou', email: 'seydou.bamba@email.com', phone: '+225 05 05 45 67 89', type: 'locataire', status: 'actif', property: 'Appart Cocody Centre', rent: '1 200 000', created: '08 Mar 2026' },
  { id: '6', name: 'M. Guessan Koffi', email: 'koffi.guessan@email.com', phone: '+225 07 07 56 78 90', type: 'prospect', status: 'lead', property: '—', rent: '—', created: 'Aujourd\'hui' },
];

const statuses = ['actif', 'lead', 'inactif', 'negotiation'];
const types = ['locataire', 'propriétaire', 'prospect', 'vendeur'];

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const TypeIcon = ({ type }: { type: string }) => {
    const iconMap: Record<string, JSX.Element> = {
      locataire: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M6.75 15h.008v.008H6.75V15zm0 0h.008v.008H6.75V15z" />
        </svg>
      ),
      propriétaire: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M2.25 21V3m2.25 3l10.5 4.5L21 12v9M3.75 12l3-4.5M13.5 12L21 7.5" />
        </svg>
      ),
      prospect: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.105a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.678 0-5.216-.5-7.499-1.437m.979 1.953a7.5 7.5 0 0014.998 0 17.933 17.933 0 007.499-1.437m-.979-1.953a7.5 7.5 0 01-14.998 0 17.933 17.933 0 01-7.499-1.437" />
        </svg>
      ),
    };
    return iconMap[type] || <span className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-900 font-serif">Clients</h2>
          <p className="text-navy-500 mt-1">{clients.length} clients enregistrés</p>
        </div>
        <button className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouveau client
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <svg className="w-4 h-4 text-navy-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.394 10.394z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un client..."
            className="input-base pl-10"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input-base w-auto"
        >
          <option value="all">Tous les types</option>
          {types.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-navy-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Type</th>
                <th>Bien</th>
                <th>Loyer</th>
                <th>Status</th>
                <th>Créé le</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr key={client.id} className="cursor-pointer hover:bg-navy-50 transition-colors">
                  <td className="font-medium text-navy-900">{client.name}</td>
                  <td className="text-navy-600 text-sm">{client.email}</td>
                  <td className="text-navy-600 text-sm">{client.phone}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <TypeIcon type={client.type} />
                      <span className="text-sm text-navy-700 capitalize">{client.type}</span>
                    </div>
                  </td>
                  <td className="text-navy-600">{client.property}</td>
                  <td className="font-medium text-navy-900">
                    {client.rent !== '—' ? `${client.rent} FCFA` : '—'}
                  </td>
                  <td>
                    <span className={`status-badge ${
                      client.status === 'actif' ? 'status-active' :
                      client.status === 'lead' ? 'status-pending' :
                      'status-pending'
                    }`}>
                      {client.status === 'actif' && '✓'}
                      {client.status}
                    </span>
                  </td>
                  <td className="text-navy-500 text-sm">{client.created}</td>
                  <td className="text-right">
                    <button className="text-navy-400 hover:text-gold-500 p-2 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <svg className="w-12 h-12 mx-auto text-navy-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-navy-500">Aucun client trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}

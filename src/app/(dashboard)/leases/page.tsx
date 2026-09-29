'use client';

import { useState } from 'react';

const leases = [
  { id: 'LE-2026-0001', property: 'Villa Cocody', client: 'M. Kouassi Jean-Baptiste', startDate: '01 Jan 2026', endDate: '31 Déc 2026', rent: '2 500 000', deposit: '5 000 000', status: 'active', remaining: '10 mois' },
  { id: 'LE-2026-0002', property: 'Appartement Les Palmiers', client: 'Mme Diallo Amina', startDate: '15 Fév 2026', endDate: '14 Fév 2027', rent: '1 800 000', deposit: '3 600 000', status: 'active', remaining: '10 mois' },
  { id: 'LE-2026-0003', property: 'Villa Angré', client: 'M. Traoré Idriss', startDate: '01 Déc 2025', endDate: '30 Nov 2026', rent: '3 200 000', deposit: '6 400 000', status: 'active', remaining: '7 mois' },
  { id: 'LE-2026-0004', property: 'Appartement Résidence du Lac', client: 'Mme Koné Fatoumata', startDate: '01 Nov 2025', endDate: '31 Oct 2026', rent: '1 500 000', deposit: '3 000 000', status: 'active', remaining: '8 mois' },
  { id: 'LE-2026-0005', property: 'Appartement Cocody Centre', client: 'M. Bamba Seydou', startDate: '01 Mar 2026', endDate: '28 Fév 2027', rent: '1 200 000', deposit: '2 400 000', status: 'active', remaining: '11 mois' },
  { id: 'LE-2026-0006', property: 'Terrain Angré', client: 'M. AG | Investisseur', startDate: '01 Jan 2026', endDate: '—', rent: '—', deposit: '—', status: 'draft', remaining: '—' },
];

const statusesMap = {
  active: { label: 'Actif', color: 'status-active' },
  terminated: { label: 'Terminé', color: 'status-pending' },
  expired: { label: 'Expiré', color: 'status-pending' },
  pending: { label: 'En attente', color: 'status-pending' },
  draft: { label: 'Brouillon', color: 'status-pending' },
};

export default function LeasesPage() {
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = leases.filter(l => statusFilter === 'all' || l.status === statusFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-900 font-serif">Baux & Contrats</h2>
          <p className="text-navy-500 mt-1">{leases.length} baux enregistrés</p>
        </div>
        <button className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouveau bail
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Baux actifs', count: leases.filter(l => l.status === 'active').length, color: 'bg-green-500' },
          { label: 'En attente', count: leases.filter(l => l.status === 'pending').length, color: 'bg-amber-500' },
          { label: 'Terminés', count: leases.filter(l => l.status === 'terminated').length, color: 'bg-navy-400' },
          { label: 'CA mensuel', count: leases.filter(l => l.status === 'active').reduce((s, l) => s + (parseInt(l.rent.replace(/\s/g, '') || 0), 0), 0).toLocaleString(), color: 'bg-gold-400' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-navy-100 p-3 flex items-center justify-between">
            <div className="text-xs text-navy-500">{s.label}</div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
              <span className="text-lg font-bold text-navy-900">{typeof s.count === 'number' ? `${s.count} FCFA` : s.count}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-base w-auto"
        >
          <option value="all">Tous les statuts</option>
          {Object.entries(statusesMap).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
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
                <th>Loyer mensuel</th>
                <th>Dépôt garantie</th>
                <th>Restant</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lease) => (
                <tr key={lease.id} className="cursor-pointer hover:bg-navy-50 transition-colors">
                  <td className="font-mono text-xs text-navy-600">{lease.id}</td>
                  <td className="font-medium text-navy-900">{lease.property}</td>
                  <td className="text-navy-600">{lease.client}</td>
                  <td className="text-navy-600 text-sm">{lease.startDate}</td>
                  <td className="text-navy-600 text-sm">{lease.endDate}</td>
                  <td className="font-medium">
                    {lease.rent !== '—' ? `${lease.rent} FCFA` : '—'}
                  </td>
                  <td className="text-navy-600 text-sm">
                    {lease.deposit !== '—' ? `${lease.deposit} FCFA` : '—'}
                  </td>
                  <td className="text-navy-600 text-sm">{lease.remaining}</td>
                  <td>
                    <span className={`status-badge ${statusesMap[lease.status]?.color || 'status-pending'}`}>
                      {statusesMap[lease.status]?.label || lease.status}
                    </span>
                  </td>
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
            <p className="text-navy-500">Aucun bail trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}

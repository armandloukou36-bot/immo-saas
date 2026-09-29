'use client';

import { useState } from 'react';

const recoveryCases = [
  { id: 'REC-2026-0001', client: 'M. Traoré Idriss', invoice: 'INV-2026-0043', property: 'Villa Angré', amount: '3 200 000', opened: '02 Mar 2026', status: 'investigating', assigned: 'Administrateur', notes: 'Locataire n\'a pas répondu aux relances. Contact téléphonique en cours.' },
  { id: 'REC-2026-0002', client: 'M. Bamba Seydou', invoice: 'INV-2026-0041', property: 'Appart Cocody Centre', amount: '1 200 000', opened: '10 Mar 2026', status: 'open', assigned: 'Non assigné', notes: 'Nouveau dossier de recouvrement. Facture pour avril 2026.' },
  { id: 'REC-2025-0089', client: 'M. Koné Jacques', invoice: 'INV-2025-0095', property: 'Appart Plateau', amount: '850 000', opened: '15 Nov 2025', status: 'resolved', assigned: 'Agent Locat', closed: '28 Nov 2025', notes: 'Paiement effectué par virement. Montant intégralement récupéré.' },
  { id: 'REC-2025-0045', client: 'Mme Yéo Solange', invoice: 'INV-2025-0048', property: 'Villa Bingerville', amount: '2 100 000', opened: '05 Août 2025', status: 'closed', assigned: 'Manager', closed: '30 Sep 2025', notes: 'Accord de paiement échelonné. 3 mensualités de 700 000 FCFA. Dossier clôturé.' },
];

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  open: { label: 'Ouvert', color: 'status-pending', icon: '📋' },
  investigating: { label: 'Investigation', color: 'status-pending', icon: '🔍' },
  notice_sent: { label: 'Avis envoyé', color: 'status-active', icon: '📤' },
  legal_action: { label: 'Action légale', color: 'status-overdue', icon: '⚖' },
  resolved: { label: 'Résolu', color: 'status-active', icon: '✓' },
  closed: { label: 'Clôturé', color: 'status-active', icon: '✓' },
  waived: { label: 'Renoncé', color: 'status-pending', icon: '—' },
};

export default function RecoveryPage() {
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = recoveryCases.filter(c => statusFilter === 'all' || c.status === statusFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-900 font-serif">Recouvrement</h2>
          <p className="text-navy-500 mt-1">Gestion des impayés et des dossiers de recouvrement</p>
        </div>
        <button className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouveau dossier
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {([
          { label: 'Ouverts', count: recoveryCases.filter(c => c.status === 'open').length, color: 'bg-amber-400' },
          { label: 'En cours', count: recoveryCases.filter(c => c.status === 'investigating').length, color: 'bg-blue-500' },
          { label: 'Résolus', count: recoveryCases.filter(c => c.status === 'resolved').length, color: 'bg-green-500' },
          { label: 'Montant dû', count: recoveryCases.filter(c => c.status !== 'closed' && c.status !== 'waived').reduce((s, c) => s + parseInt(c.amount.replace(/\s/g, '')), 0).toLocaleString(), color: 'bg-red-500' },
        ] as { label: string; count: string | number; color: string }[]).map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-navy-100 p-3 flex items-center justify-between">
            <div className="text-xs text-navy-500">{s.label}</div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
              <span className="text-lg font-bold text-navy-900">
                {typeof s.count === 'number' ? s.count.toLocaleString() : s.count}
                {typeof s.count === 'number' && s.label.includes('Montant') ? ' FCFA' : ''}
              </span>
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
          {Object.entries(statusConfig).map(([key, { label }]) => (
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
                <th>ID</th>
                <th>Client</th>
                <th>Facture</th>
                <th>Bien</th>
                <th>Montant dû</th>
                <th>Ouvert le</th>
                <th>Assigné à</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="cursor-pointer hover:bg-navy-50 transition-colors">
                  <td className="font-mono text-xs text-navy-600">{c.id}</td>
                  <td className="font-medium text-navy-900">{c.client}</td>
                  <td className="text-navy-500 text-xs font-mono">{c.invoice}</td>
                  <td className="text-navy-600 text-sm">{c.property}</td>
                  <td className="font-medium text-red-600 font-serif">
                    {parseInt(c.amount.replace(/\s/g, '')).toLocaleString()} <span className="text-xs font-normal text-navy-500">FCFA</span>
                  </td>
                  <td className="text-navy-600 text-sm">{c.opened}</td>
                  <td className="text-navy-600 text-sm">{c.assigned}</td>
                  <td>
                    <span className={`status-badge ${statusConfig[c.status]?.color || 'status-pending'}`}>
                      {statusConfig[c.status]?.icon}
                      {statusConfig[c.status]?.label}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="text-navy-400 hover:text-gold-500 p-1.5 transition-colors">
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
            <p className="text-navy-500">Aucun dossier de recouvrement</p>
          </div>
        )}
      </div>

      {/* Légende */}
      <div className="bg-white rounded-xl border border-navy-100 p-4">
        <h3 className="font-semibold text-navy-900 text-sm mb-3">📋 État des dossiers</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-2 rounded bg-amber-50 border border-amber-100">
            <span className="font-medium text-amber-700">Ouvert</span>
            <p className="text-navy-500 mt-0.5">Dossier créé, en attente d'action</p>
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
    </div>
  );
}

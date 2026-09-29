'use client';

import { useState } from 'react';

const invoices = [
  { id: 'INV-2026-0045', client: 'M. Kouassi Jean-Baptiste', property: 'Villa Cocody', lease: 'LE-2026-0001', amount: '2 500 000', dueDate: '15 Mar 2026', paidDate: null, status: 'pending', recurrence: 'mensuel' },
  { id: 'INV-2026-0044', client: 'Mme Diallo Amina', property: 'Appart Les Palmiers', lease: 'LE-2026-0002', amount: '1 800 000', dueDate: '10 Mar 2026', paidDate: '08 Mar 2026', status: 'paid', recurrence: 'mensuel' },
  { id: 'INV-2026-0043', client: 'M. Traoré Idriss', property: 'Villa Angré', lease: 'LE-2026-0003', amount: '3 200 000', dueDate: '01 Mar 2026', paidDate: null, status: 'overdue', recurrence: 'mensuel' },
  { id: 'INV-2026-0042', client: 'Mme Koné Fatoumata', property: 'Appart Résidence du Lac', lease: 'LE-2026-0004', amount: '1 500 000', dueDate: '28 Fév 2026', paidDate: '25 Fév 2026', status: 'paid', recurrence: 'mensuel' },
  { id: 'INV-2026-0041', client: 'M. Bamba Seydou', property: 'Appart Cocody Centre', lease: 'LE-2026-0005', amount: '1 200 000', dueDate: '01 Avr 2026', paidDate: null, status: 'pending', recurrence: 'mensuel' },
  { id: 'INV-2025-0120', client: 'M. Guessan Koffi', property: 'Villa Monte-Carlo', lease: 'LE-2025-0050', amount: '500 000', dueDate: '15 Déc 2025', paidDate: '14 Déc 2025', status: 'paid', recurrence: 'un_times' },
];

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'En attente', color: 'status-pending', icon: '⏳' },
  paid: { label: 'Payée', color: 'status-paid', icon: '✓' },
  overdue: { label: 'En retard', color: 'status-overdue', icon: '⚠' },
  cancelled: { label: 'Annulée', color: 'status-pending', icon: '✕' },
  write_off: { label: 'Radiation', color: 'status-pending', icon: '✕' },
};

const statusTotals = {
  pending: invoices.filter(i => i.status === 'pending').reduce((s, i) => s + parseInt(i.amount.replace(/\s/g, '')), 0),
  paid: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + parseInt(i.amount.replace(/\s/g, '')), 0),
  overdue: invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + parseInt(i.amount.replace(/\s/g, '')), 0),
};

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = invoices.filter(i => statusFilter === 'all' || i.status === statusFilter);

  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return date.replace(/(\d+)\s+(\w+)\s+(\d+)/, '$2 $3');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-900 font-serif">Factures</h2>
          <p className="text-navy-500 mt-1">{invoices.length} factures enregistrées</p>
        </div>
        <button className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle facture
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'En attente', value: statusTotals.pending.toLocaleString(), color: 'bg-amber-400', status: 'pending' },
          { label: 'Payées', value: statusTotals.paid.toLocaleString(), color: 'bg-green-500', status: 'paid' },
          { label: 'En retard', value: statusTotals.overdue.toLocaleString(), color: 'bg-red-500', status: 'overdue' },
        ].map(s => (
          <div key={s.status} className="bg-white rounded-lg border border-navy-100 p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-navy-500 mb-1">{s.label}</div>
              <div className="text-lg font-bold text-navy-900 font-serif">{parseInt(s.value).toLocaleString()} <span className="text-sm font-normal">FCFA</span></div>
            </div>
            <div className={`w-4 h-4 rounded-full ${s.color}`} />
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
          <option value="all">Toutes les factures</option>
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
                <th>N° Facture</th>
                <th>Client</th>
                <th>Bien</th>
                <th>Bail</th>
                <th>Montant</th>
                <th>Échéance</th>
                <th>Payée le</th>
                <th>Type</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} className="cursor-pointer hover:bg-navy-50 transition-colors">
                  <td className="font-mono text-xs text-navy-600">{inv.id}</td>
                  <td className="font-medium text-navy-900">{inv.client}</td>
                  <td className="text-navy-600 text-sm">{inv.property}</td>
                  <td className="text-navy-500 text-xs font-mono">{inv.lease}</td>
                  <td className="font-medium text-navy-900">
                    {parseInt(inv.amount.replace(/\s/g, '')).toLocaleString()} <span className="text-xs font-normal text-navy-500">FCFA</span>
                  </td>
                  <td className="text-navy-600 text-sm">{inv.dueDate}</td>
                  <td className="text-navy-600 text-sm">{formatDate(inv.paidDate)}</td>
                  <td className="text-navy-500 text-xs">{inv.recurrence === 'mensuel' ? 'Mensuel' : 'Unique'}</td>
                  <td>
                    <span className={`status-badge ${statusConfig[inv.status]?.color || 'status-pending'}`}>
                      {statusConfig[inv.status]?.icon}
                      {statusConfig[inv.status]?.label}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {inv.status !== 'paid' && (
                        <button className="text-navy-400 hover:text-gold-500 p-1.5 transition-colors" title="Enregistrer paiement">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 10.5M21 12c0 1.26-0.296 2.43-0.78 3.441m-0.78-3.441c0-1.26.296-2.43.78-3.441m7.64 6.366a1 1 0 001.414-1.414m-1.707-6.293a1 1 0 01-1.414 0m1.414 1.414a1 1 0 001.414 0m-2.121 2.121a1 1 0 01-1.414 0" />
                          </svg>
                        </button>
                      )}
                      <button className="text-navy-400 hover:text-navy-600 p-1.5 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-navy-500">Aucune facture trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}

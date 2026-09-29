'use client';

import { useState } from 'react';

const reminders = [
  { id: 'REM-2026-0012', type: 'rent_reminder', client: 'M. Traoré Idriss', invoice: 'INV-2026-0043', dueDate: '01 Mar 2026', scheduled: '25 Fév 2026', sent: null, status: 'pending', channel: 'email' },
  { id: 'REM-2026-0011', type: 'payment_reminder', client: 'M. Bamba Seydou', invoice: 'INV-2026-0041', dueDate: '01 Avr 2026', scheduled: '25 Mar 2026', sent: null, status: 'pending', channel: 'sms' },
  { id: 'REM-2026-0010', type: 'recovery_notice', client: 'M. Traoré Idriss', invoice: 'INV-2026-0043', dueDate: '01 Mar 2026', scheduled: '05 Mar 2026', sent: null, status: 'pending', channel: 'email' },
  { id: 'REM-2026-0009', type: 'rent_reminder', client: 'Mme Diallo Amina', invoice: 'INV-2026-0044', dueDate: '10 Mar 2026', scheduled: '05 Mar 2026', sent: '05 Mar 2026', status: 'sent', channel: 'email' },
  { id: 'REM-2026-0008', type: 'rent_reminder', client: 'M. Kouassi Jean-Baptiste', invoice: 'INV-2026-0045', dueDate: '15 Mar 2026', scheduled: '10 Mar 2026', sent: null, status: 'pending', channel: 'email' },
  { id: 'REM-2026-0007', type: 'general', client: 'M. Guessan Koffi', invoice: null, dueDate: '—', scheduled: '01 Mar 2026', sent: null, status: 'pending', channel: 'sms' },
];

const typeLabels: Record<string, string> = {
  rent_reminder: 'Relance loyer',
  payment_reminder: 'Relance paiement',
  recovery_notice: 'Avis recouvrement',
  general: 'Message général',
};

const typeIcons: Record<string, JSX.Element> = {
  rent_reminder: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  payment_reminder: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m0 0l-3-3m3 3V6" />
    </svg>
  ),
  recovery_notice: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h-3m-2.25 3.75h-2.25a2.25 2.25 0 01-2.25-2.25V6.75a2.25 2.25 0 012.25-2.25H9.75a2.25 2.25 0 012.25 2.25v3.75z" />
    </svg>
  ),
  general: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM18 12.75a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM14.25 17.25a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
};

export default function RemindersPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = reminders.filter(r => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesType = typeFilter === 'all' || r.type === typeFilter;
    return matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-900 font-serif">Relances</h2>
          <p className="text-navy-500 mt-1">{reminders.length} relances programmées</p>
        </div>
        <button className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle relance
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'En attente', count: reminders.filter(r => r.status === 'pending').length, color: 'bg-amber-400' },
          { label: 'Envoyées', count: reminders.filter(r => r.status === 'sent').length, color: 'bg-green-500' },
          { label: 'Échecs', count: reminders.filter(r => r.status === 'failed').length, color: 'bg-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-navy-100 p-3 flex items-center justify-between">
            <div className="text-xs text-navy-500">{s.label}</div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
              <span className="text-lg font-bold text-navy-900">{s.count}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-base w-auto">
          <option value="all">Tous les types</option>
          {Object.entries(typeLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-base w-auto">
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="sent">Envoyées</option>
          <option value="failed">Échecs</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-navy-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Client</th>
                <th>Facture</th>
                <th>Échéance</th>
                <th>Programmée</th>
                <th>Envoyée</th>
                <th>Canal</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rem) => (
                <tr key={rem.id} className="cursor-pointer hover:bg-navy-50 transition-colors">
                  <td className="font-mono text-xs text-navy-600">{rem.id}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      {typeIcons[rem.type]}
                      <span className="text-sm text-navy-700">{typeLabels[rem.type]}</span>
                    </div>
                  </td>
                  <td className="font-medium text-navy-900 text-sm">{rem.client}</td>
                  <td className="text-navy-500 text-xs font-mono">{rem.invoice || '—'}</td>
                  <td className="text-navy-600 text-sm">{rem.dueDate}</td>
                  <td className="text-navy-600 text-sm">{formatDate(rem.scheduled)}</td>
                  <td className="text-navy-600 text-sm">
                    {rem.sent ? (
                      <span className="text-green-600 font-medium">{formatDate(rem.sent)}</span>
                    ) : (
                      <span className="text-navy-400">—</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${
                      rem.channel === 'email' ? 'status-active' :
                      rem.channel === 'sms' ? 'status-pending' :
                      'status-pending'
                    }`}>
                      {rem.channel === 'email' && '📧'}
                      {rem.channel === 'sms' && '📱'}
                      {rem.channel}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${
                      rem.status === 'pending' ? 'status-pending' :
                      rem.status === 'sent' ? 'status-active' :
                      'status-overdue'
                    }`}>
                      {rem.status === 'pending' && '⏳'}
                      {rem.status === 'sent' && '✓'}
                      {rem.status === 'failed' && '✕'}
                      {rem.status}
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
            <p className="text-navy-500">Aucune relance trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(date: string): string {
  return date.replace(/(\d+)\s+(\w+)\s+(\d+)/, '$2 $3');
}

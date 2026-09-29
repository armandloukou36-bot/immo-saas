import Link from 'next/link';

// Statistiques du dashboard (demo mode - données simulées)
const stats = [
  { label: 'Biens totaux', value: '24', change: '+3', positive: true, href: '/properties' },
  { label: 'Locataires actifs', value: '47', change: '+5', positive: true, href: '/clients' },
  { label: 'Baux actifs', value: '38', change: '+2', positive: true, href: '/leases' },
  { label: 'Factures en attente', value: '12', change: '-4', positive: false, href: '/invoices' },
  { label: 'Montant en attente', value: '4 200 000', change: '+850 000', positive: false, href: '/invoices' },
  { label: 'Relances à faire', value: '8', change: '-2', positive: true, href: '/reminders' },
  { label: 'Dossiers recouvrement', value: '3', change: '0', positive: null, href: '/recovery' },
  { label: 'CA ce mois', value: '18 500 000', change: '+12%', positive: true, href: '/invoices' },
];

const recentInvoices = [
  { id: 'INV-2026-0045', client: 'M. Kouassi Jean', property: 'Villa Cocody', amount: '2 500 000', due: '15 Mar 2026', status: 'pending' },
  { id: 'INV-2026-0044', client: 'Mme Diallo Amina', property: 'Appart Les Palmiers', amount: '1 800 000', due: '10 Mar 2026', status: 'paid' },
  { id: 'INV-2026-0043', client: 'M. Traoré Idriss', property: 'Villa Angré', amount: '3 200 000', due: '01 Mar 2026', status: 'overdue' },
  { id: 'INV-2026-0042', client: 'Mme Koné Fatoumata', property: 'Appart Résidence du Lac', amount: '1 500 000', due: '28 Fév 2026', status: 'paid' },
];

const recentActivity = [
  { action: 'Facture payée', detail: 'INV-2026-0044 — Mme Diallo Amina', time: 'Il y a 2h' },
  { action: 'Nouveau bail créé', detail: 'Bail #LE-2026-0018 — M. Bamba Seydou', time: 'Il y a 4h' },
  { action: 'Bien ajouté', detail: 'Villa Monte-Carlo — Cocody Angré', time: 'Il y a 6h' },
  { action: 'Relance envoyée', detail: 'INV-2026-0043 — M. Traoré Idriss', time: 'Il y a 8h' },
  { action: 'Paiement enregistré', detail: '1 500 000 FCFA — Mme Koné Fatoumata', time: 'Il y a 1 jour' },
];

const statusColors: Record<string, string> = {
  pending: 'status-pending',
  paid: 'status-paid',
  overdue: 'status-overdue',
  active: 'status-active',
  available: 'status-available',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Titre */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-navy-900 font-serif">Tableau de bord</h2>
          <p className="text-navy-500 mt-1">Aperçu de votre activité immobilière</p>
        </div>
        <Link href="/invoices" className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle facture
        </Link>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={stat.label} className="stat-card animate-slide-in" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="stat-card-label">{stat.label}</div>
            <div className="stat-card-value">{stat.value}</div>
            <div className={`stat-card-change ${stat.positive === true ? 'positive' : stat.positive === false ? 'negative' : ''}`}>
              {stat.positive === true && <svg className="w-3 h-3 inline mr-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15.586l-5.293-5.293a1 1 0 011.414-1.414l5.293 5.293a1 1 0 01-1.414 1.414z" /><path d="M10 18a8 8 0 100-16 8 8 0 000 16z" /></svg>}
              {stat.positive === false && <svg className="w-3 h-3 inline mr-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 4.414l5.293 5.293a1 1 0 01-1.414 1.414l-5.293-5.293a1 1 0 011.414-1.414z" /><path d="M10 2a8 8 0 100 16 8 8 0 000-16z" /></svg>}
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Tableauments : Factures récentes + Activité */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Factures récentes */}
        <div className="bg-white rounded-xl border border-navy-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between">
            <h3 className="font-semibold text-navy-900">Factures récentes</h3>
            <Link href="/invoices" className="text-xs text-gold-500 hover:text-gold-600 font-medium">Voir tout →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Client</th>
                  <th>Biens</th>
                  <th className="text-right">Montant</th>
                  <th>Échéance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="font-mono text-xs text-navy-600">{inv.id}</td>
                    <td className="font-medium text-navy-900">{inv.client}</td>
                    <td className="text-navy-600">{inv.property}</td>
                    <td className="text-right font-semibold">{inv.amount} FCFA</td>
                    <td className="text-navy-600">{inv.due}</td>
                    <td>
                      <span className={`status-badge ${statusColors[inv.status]}`}>
                        {inv.status === 'pending' && '⏳'}
                        {inv.status === 'paid' && '✓'}
                        {inv.status === 'overdue' && '⚠'}
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-white rounded-xl border border-navy-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between">
            <h3 className="font-semibold text-navy-900">Activité récente</h3>
          </div>
          <div className="divide-y divide-navy-50">
            {recentActivity.map((activity, i) => (
              <div key={i} className="px-5 py-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-navy-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy-900 truncate">{activity.action}</p>
                  <p className="text-xs text-navy-500 truncate">{activity.detail}</p>
                </div>
                <span className="text-xs text-navy-400 flex-shrink-0 mt-0.5">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-xl border border-navy-100 shadow-sm p-5">
        <h3 className="font-semibold text-navy-900 mb-3">⚠ Alertes & Actions requises</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-red-50 border border-red-100">
            <div className="flex items-center gap-2 text-red-700 font-medium text-sm mb-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L8.586 12.828l1.293 1.293a1 1 0 001.414-1.414L8.586 11.414l1.293-1.293a1 1 0 00-1.414-1.414L8.586 8.707l-1.293-1.293z" />
              </svg>
              3 factures en retard
            </div>
            <p className="text-xs text-red-600">Montant total: 8 400 000 FCFA — Action: Relancer les locataires</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
            <div className="flex items-center gap-2 text-amber-700 font-medium text-sm mb-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                <path d="M10 1.5a9 9 0 100 18 9 9 0 000-18zM14.5 10a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              2 contrats expirent ce mois
            </div>
            <p className="text-xs text-amber-600">Renouvellement des baux à prévoir</p>
          </div>
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
            <div className="flex items-center gap-2 text-blue-700 font-medium text-sm mb-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.963 7.963 0 005.5 4c-1.732 0-3 .586-4.208 1.656C2.5 6.668 1.5 8.716 1.5 11h11c0-2.284-.5-3.832-1.196-4.896-.704-.964-1.966-1.45-3.208-1.45z" />
                <path d="M12.5 15.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
              </svg>
              Nouveau lead
            </div>
            <p className="text-xs text-blue-600">M. Guessan Koffi — Villa request — À contacter</p>
          </div>
        </div>
      </div>

      {/* Billets rapides */}
      <div className="bg-white rounded-xl border border-navy-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-navy-900">📊 Billets rapides</h3>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Mars', value: 92, color: 'bg-green-500' },
            { label: 'Avr', value: 88, color: 'bg-green-400' },
            { label: 'Mai', value: 95, color: 'bg-green-500' },
            { label: 'Jun', value: 85, color: 'bg-green-400' },
            { label: 'Juil', value: 78, color: 'bg-yellow-400' },
          ].map((m) => (
            <div key={m.label} className="text-center">
              <div className="text-xs text-navy-500 mb-1">{m.label}</div>
              <div className="w-full bg-navy-100 rounded-full h-2 mb-1">
                <div className={`${m.color} h-2 rounded-full`} style={{ width: `${m.value}%` }} />
              </div>
              <div className="text-xs font-medium text-navy-700">{m.value}%</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-navy-400 mt-3 text-center">Taux de recouvrement des loyers — 5 derniers mois</p>
      </div>
    </div>
  );
}

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';
import { formatFCFA, formatDate, timeAgo } from '@/lib/format';
import { INVOICE_STATUS, StatusBadge, statusOf } from '@/components/ui/StatusBadge';
import type { InvoiceWithRelations } from '@/lib/types';
import Link from 'next/link';

type Stats = {
  total_properties: number;
  available_properties: number;
  leased_properties: number;
  total_clients: number;
  active_leases: number;
  pending_invoices: number;
  overdue_invoices: number;
  pending_amount: number;
  overdue_amount: number;
  open_recovery_cases: number;
  recovery_amount: number;
  paid_this_month: number;
  revenue_this_month: number;
};

type Activity = { id: string; action: string; detail: string | null; created_at: string };

/** Compte les lignes d'une table pour l'organisation, avec un filtre optionnel. */
async function countRows(
  supabase: ReturnType<typeof createServerSupabase>,
  table: 'properties' | 'clients' | 'leases',
  orgId: string,
  filters?: Record<string, string>
): Promise<number> {
  let query = supabase.from(table).select('id', { count: 'exact', head: true }).eq('organization_id', orgId);
  if (filters) {
    for (const [column, value] of Object.entries(filters)) {
      query = query.eq(column, value);
    }
  }
  const { count: n } = await query;
  return n ?? 0;
}

function sumAmount(rows: { amount?: number | null; amount_due?: number | null }[] | null, key: 'amount' | 'amount_due') {
  return (rows ?? []).reduce((s, r) => s + Number(r[key] ?? 0), 0);
}

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect('/login');

  const orgId = user.org_id;
  const supabase = createServerSupabase();

  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().slice(0, 10);

  const [
    totalProperties,
    availableProperties,
    leasedProperties,
    totalClients,
    activeLeases,
    pendingRows,
    overdueRows,
    openRecoveryRows,
    paidThisMonthRows,
    recentInvoicesRes,
    activityRes,
    upcomingRes,
  ] = await Promise.all([
    countRows(supabase, 'properties', orgId),
    countRows(supabase, 'properties', orgId, { status: 'disponible' }),
    countRows(supabase, 'properties', orgId, { status: 'loué' }),
    countRows(supabase, 'clients', orgId),
    countRows(supabase, 'leases', orgId, { status: 'active' }),
    supabase.from('invoices').select('amount').eq('organization_id', orgId).eq('status', 'pending'),
    supabase.from('invoices').select('amount').eq('organization_id', orgId).eq('status', 'overdue'),
    supabase
      .from('recovery_cases')
      .select('amount_due')
      .eq('organization_id', orgId)
      .in('status', ['open', 'investigating', 'notice_sent', 'legal_action']),
    supabase
      .from('invoices')
      .select('amount')
      .eq('organization_id', orgId)
      .eq('status', 'paid')
      .gte('paid_date', monthStartStr),
    supabase
      .from('invoices')
      .select('*, clients(full_name), properties(name), leases(reference), payments(amount)')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('activity_log')
      .select('id, action, detail, created_at')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('leases')
      .select('reference, end_date, properties(name), clients(full_name)')
      .eq('organization_id', orgId)
      .eq('status', 'active')
      .not('end_date', 'is', null)
      .order('end_date', { ascending: true })
      .limit(3),
  ]);

  const stats: Stats = {
    total_properties: totalProperties,
    available_properties: availableProperties,
    leased_properties: leasedProperties,
    total_clients: totalClients,
    active_leases: activeLeases,
    pending_invoices: pendingRows.data?.length ?? 0,
    overdue_invoices: overdueRows.data?.length ?? 0,
    pending_amount: sumAmount(pendingRows.data, 'amount'),
    overdue_amount: sumAmount(overdueRows.data, 'amount'),
    open_recovery_cases: openRecoveryRows.data?.length ?? 0,
    recovery_amount: sumAmount(openRecoveryRows.data, 'amount_due'),
    paid_this_month: paidThisMonthRows.data?.length ?? 0,
    revenue_this_month: sumAmount(paidThisMonthRows.data, 'amount'),
  };

  const recentInvoices = (recentInvoicesRes.data ?? []).map((row) => {
    const r = row as Record<string, unknown> & {
      clients?: unknown;
      properties?: unknown;
      leases?: unknown;
      payments?: unknown;
    };
    const cli = Array.isArray(r.clients) ? r.clients[0] : r.clients;
    const prop = Array.isArray(r.properties) ? r.properties[0] : r.properties;
    const lea = Array.isArray(r.leases) ? r.leases[0] : r.leases;
    const pays = Array.isArray(r.payments) ? r.payments : [];
    const { clients: _c, properties: _p, leases: _l, payments: _pay, ...rest } = r;
    return {
      ...rest,
      client_name: (cli as { full_name?: string } | null)?.full_name ?? null,
      property_name: (prop as { name?: string } | null)?.name ?? null,
      lease_reference: (lea as { reference?: string } | null)?.reference ?? null,
      paid_total: (pays as { amount: number | null }[]).reduce((s, p) => s + Number(p.amount ?? 0), 0),
    };
  }) as unknown as InvoiceWithRelations[];

  const activity = (activityRes.data ?? []) as Activity[];

  const upcomingLeases = (upcomingRes.data ?? []).map((row) => {
    const r = row as Record<string, unknown> & { properties?: unknown; clients?: unknown };
    const prop = Array.isArray(r.properties) ? r.properties[0] : r.properties;
    const cli = Array.isArray(r.clients) ? r.clients[0] : r.clients;
    return {
      reference: r.reference as string,
      end_date: r.end_date as string,
      property_name: (prop as { name?: string } | null)?.name ?? null,
      client_name: (cli as { full_name?: string } | null)?.full_name ?? null,
    };
  });

  const collectionRate =
    stats.revenue_this_month + stats.overdue_amount > 0
      ? Math.round((stats.revenue_this_month / (stats.revenue_this_month + stats.overdue_amount)) * 100)
      : 100;

  const cards = [
    { label: 'Biens totaux', value: String(stats.total_properties), hint: `${stats.available_properties} disponibles`, href: '/properties' },
    { label: 'Clients', value: String(stats.total_clients), hint: 'Fiches enregistrées', href: '/clients' },
    { label: 'Baux actifs', value: String(stats.active_leases), hint: `${stats.leased_properties} biens loués`, href: '/leases' },
    { label: 'Factures en attente', value: String(stats.pending_invoices), hint: formatFCFA(stats.pending_amount), href: '/invoices' },
    { label: 'Factures en retard', value: String(stats.overdue_invoices), hint: formatFCFA(stats.overdue_amount), href: '/invoices' },
    { label: 'Recouvrement', value: String(stats.open_recovery_cases), hint: formatFCFA(stats.recovery_amount), href: '/recovery' },
    { label: 'Encaissé ce mois', value: formatFCFA(stats.revenue_this_month), hint: `${stats.paid_this_month} factures payées`, href: '/invoices' },
    { label: 'Taux de recouvrement', value: `${collectionRate}%`, hint: 'Mois en cours', href: '/invoices' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Titre */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
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
        {cards.map((card, i) => (
          <Link
            key={card.label}
            href={card.href}
            className="stat-card card-hover animate-slide-in block"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="stat-card-label">{card.label}</div>
            <div className="stat-card-value">{card.value}</div>
            <div className="stat-card-change text-navy-500">{card.hint}</div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Factures récentes */}
        <div className="bg-white rounded-xl border border-navy-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between">
            <h3 className="font-semibold text-navy-900">Factures récentes</h3>
            <Link href="/invoices" className="text-xs text-gold-500 hover:text-gold-600 font-medium">
              Voir tout →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Client</th>
                  <th className="text-right">Montant</th>
                  <th>Échéance</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv) => {
                  const s = statusOf(INVOICE_STATUS, inv.status);
                  return (
                    <tr key={inv.id}>
                      <td className="font-mono text-xs text-navy-600">{inv.invoice_number}</td>
                      <td className="font-medium text-navy-900">{inv.client_name ?? '—'}</td>
                      <td className="text-right font-semibold whitespace-nowrap">{formatFCFA(inv.amount)}</td>
                      <td className="text-navy-600 text-sm whitespace-nowrap">{formatDate(inv.due_date)}</td>
                      <td>
                        <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {recentInvoices.length === 0 && (
            <div className="py-10 text-center text-navy-500 text-sm">Aucune facture pour le moment.</div>
          )}
        </div>

        {/* Activité récente */}
        <div className="bg-white rounded-xl border border-navy-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-navy-100">
            <h3 className="font-semibold text-navy-900">Activité récente</h3>
          </div>
          <div className="divide-y divide-navy-50">
            {activity.map((item) => (
              <div key={item.id} className="px-5 py-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-navy-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy-900 truncate">{item.action}</p>
                  <p className="text-xs text-navy-500 truncate">{item.detail}</p>
                </div>
                <span className="text-xs text-navy-400 flex-shrink-0 mt-0.5">{timeAgo(item.created_at)}</span>
              </div>
            ))}
            {activity.length === 0 && (
              <div className="py-10 text-center text-navy-500 text-sm">Aucune activité enregistrée.</div>
            )}
          </div>
        </div>
      </div>

      {/* Alertes */}
      <div className="bg-white rounded-xl border border-navy-100 shadow-sm p-5">
        <h3 className="font-semibold text-navy-900 mb-3">⚠ Alertes &amp; actions requises</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border ${stats.overdue_invoices > 0 ? 'bg-red-50 border-red-100' : 'bg-navy-50 border-navy-100'}`}>
            <div className={`font-medium text-sm mb-1 ${stats.overdue_invoices > 0 ? 'text-red-700' : 'text-navy-600'}`}>
              {stats.overdue_invoices} facture{stats.overdue_invoices > 1 ? 's' : ''} en retard
            </div>
            <p className="text-xs text-navy-600">
              Montant total : {formatFCFA(stats.overdue_amount)}
              {stats.overdue_invoices > 0 && (
                <>
                  {' — '}
                  <Link href="/reminders" className="underline font-medium">
                    Relancer les locataires
                  </Link>
                </>
              )}
            </p>
          </div>

          <div className={`p-4 rounded-lg border ${upcomingLeases.length > 0 ? 'bg-amber-50 border-amber-100' : 'bg-navy-50 border-navy-100'}`}>
            <div className={`font-medium text-sm mb-1 ${upcomingLeases.length > 0 ? 'text-amber-700' : 'text-navy-600'}`}>
              {upcomingLeases.length} contrat{upcomingLeases.length > 1 ? 's' : ''} à échéance
            </div>
            <p className="text-xs text-navy-600">
              {upcomingLeases.length > 0
                ? `Prochain : ${upcomingLeases[0].property_name} — ${formatDate(upcomingLeases[0].end_date)}`
                : 'Aucun renouvellement à venir'}
            </p>
          </div>

          <div className={`p-4 rounded-lg border ${stats.open_recovery_cases > 0 ? 'bg-blue-50 border-blue-100' : 'bg-navy-50 border-navy-100'}`}>
            <div className={`font-medium text-sm mb-1 ${stats.open_recovery_cases > 0 ? 'text-blue-700' : 'text-navy-600'}`}>
              {stats.open_recovery_cases} dossier{stats.open_recovery_cases > 1 ? 's' : ''} de recouvrement
            </div>
            <p className="text-xs text-navy-600">
              {formatFCFA(stats.recovery_amount)} à récupérer
              {stats.open_recovery_cases > 0 && (
                <>
                  {' — '}
                  <Link href="/recovery" className="underline font-medium">
                    Voir les dossiers
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Indicateur de recouvrement */}
      <div className="bg-white rounded-xl border border-navy-100 shadow-sm p-5">
        <h3 className="font-semibold text-navy-900 mb-3">📊 Taux de recouvrement — mois en cours</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-navy-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${collectionRate >= 80 ? 'bg-green-500' : collectionRate >= 50 ? 'bg-yellow-400' : 'bg-red-500'}`}
              style={{ width: `${collectionRate}%` }}
            />
          </div>
          <span className="text-lg font-bold text-navy-900 font-serif">{collectionRate}%</span>
        </div>
        <p className="text-xs text-navy-400 mt-3">
          {formatFCFA(stats.revenue_this_month)} encaissés · {formatFCFA(stats.overdue_amount)} en retard
        </p>
      </div>
    </div>
  );
}

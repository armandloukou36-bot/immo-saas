'use client';

import { useState } from 'react';
import { ActionForm, SubmitButton } from '@/components/ui/ActionForm';
import { Modal } from '@/components/ui/Modal';
import { ConfirmAction } from '@/components/ui/ConfirmAction';
import { CHANNEL_LABEL, REMINDER_STATUS, REMINDER_TYPE, StatusBadge, statusOf } from '@/components/ui/StatusBadge';
import { createReminder, updateReminder, deleteReminder, sendReminder } from '@/app/actions';
import { formatDate, today } from '@/lib/format';
import type { Client, InvoiceWithRelations, ReminderWithRelations } from '@/lib/types';

const STATUSES = ['pending', 'sent', 'failed', 'cancelled'];

function ReminderFields({
  reminder,
  clients,
  unpaidInvoices,
}: {
  reminder?: ReminderWithRelations;
  clients: Client[];
  unpaidInvoices: InvoiceWithRelations[];
}) {
  return (
    <>
      {reminder && <input type="hidden" name="id" value={reminder.id} />}
      {reminder && <input type="hidden" name="subject" value={reminder.subject ?? ''} />}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="form-section">
          <label className="form-label" htmlFor="type">
            Type de relance
          </label>
          <select id="type" name="type" className="input-base" defaultValue={reminder?.type ?? 'rent_reminder'}>
            {Object.entries(REMINDER_TYPE).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-section">
          <label className="form-label" htmlFor="channel">
            Canal
          </label>
          <select id="channel" name="channel" className="input-base" defaultValue={reminder?.channel ?? 'email'}>
            {Object.entries(CHANNEL_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-section">
        <label className="form-label" htmlFor="invoice_id">
          Facture concernée
        </label>
        <select id="invoice_id" name="invoice_id" className="input-base" defaultValue={reminder?.invoice_id ?? ''}>
          <option value="">— Aucune —</option>
          {unpaidInvoices.map((i) => (
            <option key={i.id} value={i.id}>
              {i.invoice_number} · {i.client_name ?? 'Sans client'} · {formatDate(i.due_date)}
            </option>
          ))}
        </select>
      </div>

      <div className="form-section">
        <label className="form-label" htmlFor="client_id">
          Destinataire
        </label>
        <select id="client_id" name="client_id" className="input-base" defaultValue={reminder?.client_id ?? ''}>
          <option value="">— Déduit de la facture —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-section">
        <label className="form-label" htmlFor="subject">
          Objet
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          className="input-base"
          defaultValue={reminder?.subject ?? ''}
          placeholder="Ex : Rappel de loyer"
        />
      </div>

      <div className="form-section">
        <label className="form-label" htmlFor="message">
          Message
        </label>
        <textarea id="message" name="message" rows={3} className="input-base" defaultValue={reminder?.message ?? ''} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="form-section">
          <label className="form-label" htmlFor="scheduled_date">
            Date d&apos;envoi programmée *
          </label>
          <input
            id="scheduled_date"
            name="scheduled_date"
            type="date"
            className="input-base"
            defaultValue={reminder ? reminder.scheduled_date.slice(0, 10) : today()}
            required
          />
        </div>
        {reminder && (
          <div className="form-section">
            <label className="form-label" htmlFor="status">
              Statut
            </label>
            <select id="status" name="status" className="input-base" defaultValue={reminder.status}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusOf(REMINDER_STATUS, s).label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </>
  );
}

export function RemindersClient({
  reminders,
  clients,
  unpaidInvoices,
}: {
  reminders: ReminderWithRelations[];
  clients: Client[];
  unpaidInvoices: InvoiceWithRelations[];
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<ReminderWithRelations | null>(null);

  const filtered = reminders.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || (r.client_name ?? '').toLowerCase().includes(q) || (r.invoice_number ?? '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesType = typeFilter === 'all' || r.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const counters = [
    { label: 'En attente', count: reminders.filter((r) => r.status === 'pending').length, color: 'bg-amber-400' },
    { label: 'Envoyées', count: reminders.filter((r) => r.status === 'sent').length, color: 'bg-green-500' },
    { label: 'Échecs', count: reminders.filter((r) => r.status === 'failed').length, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-navy-900 font-serif">Relances</h2>
          <p className="text-navy-500 mt-1">
            {reminders.length} relance{reminders.length > 1 ? 's' : ''} programmée{reminders.length > 1 ? 's' : ''}
          </p>
        </div>
        <button type="button" onClick={() => setCreateOpen(true)} className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle relance
        </button>
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-3 gap-3">
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
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un client ou une facture..."
            className="input-base"
            aria-label="Rechercher une relance"
          />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-base w-auto" aria-label="Filtrer par type">
          <option value="all">Tous les types</option>
          {Object.entries(REMINDER_TYPE).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
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
              {statusOf(REMINDER_STATUS, s).label}
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
                <th>Type</th>
                <th>Destinataire</th>
                <th>Facture</th>
                <th>Objet</th>
                <th>Programmée</th>
                <th>Envoyée</th>
                <th>Canal</th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rem) => {
                const s = statusOf(REMINDER_STATUS, rem.status);
                return (
                  <tr key={rem.id}>
                    <td className="text-sm text-navy-700 whitespace-nowrap">{REMINDER_TYPE[rem.type] ?? rem.type}</td>
                    <td className="font-medium text-navy-900 text-sm">{rem.client_name ?? '—'}</td>
                    <td className="text-navy-500 text-xs font-mono">{rem.invoice_number ?? '—'}</td>
                    <td className="text-navy-600 text-sm">{rem.subject ?? '—'}</td>
                    <td className="text-navy-600 text-sm whitespace-nowrap">{formatDate(rem.scheduled_date)}</td>
                    <td className="text-sm whitespace-nowrap">
                      {rem.sent_at ? <span className="text-green-600 font-medium">{formatDate(rem.sent_at)}</span> : <span className="text-navy-400">—</span>}
                    </td>
                    <td className="text-navy-600 text-xs">{CHANNEL_LABEL[rem.channel] ?? rem.channel}</td>
                    <td>
                      <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {rem.status === 'pending' && (
                          <ActionForm action={sendReminder} className="inline">
                            <input type="hidden" name="id" value={rem.id} />
                            <input type="hidden" name="subject" value={rem.subject ?? ''} />
                            <SubmitButton
                              className="text-xs text-green-600 hover:text-green-700 font-medium px-2 py-1 whitespace-nowrap"
                              pendingLabel="…"
                            >
                              Envoyer
                            </SubmitButton>
                          </ActionForm>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditing(rem)}
                          className="text-xs text-gold-500 hover:text-gold-600 font-medium px-2 py-1"
                        >
                          Modifier
                        </button>
                        <ConfirmAction
                          action={deleteReminder}
                          hidden={{ id: rem.id, subject: rem.subject ?? '' }}
                          title="Supprimer cette relance ?"
                          description={<>La relance pour <strong>{rem.client_name ?? 'ce client'}</strong> sera définitivement supprimée.</>}
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
              {reminders.length === 0 ? 'Aucune relance programmée.' : 'Aucune relance ne correspond à votre recherche.'}
            </p>
          </div>
        )}
      </div>

      {/* Modale de création */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nouvelle relance"
        subtitle="Programmez un rappel pour un client"
        size="lg"
      >
        <ActionForm action={createReminder} onSuccess={() => setCreateOpen(false)}>
          <ReminderFields clients={clients} unpaidInvoices={unpaidInvoices} />
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn btn-ghost">
              Annuler
            </button>
            <SubmitButton pendingLabel="Enregistrement…">Programmer la relance</SubmitButton>
          </div>
        </ActionForm>
      </Modal>

      {/* Modale de modification */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Modifier la relance"
        subtitle={editing?.subject ?? undefined}
        size="lg"
      >
        {editing && (
          <ActionForm action={updateReminder} onSuccess={() => setEditing(null)}>
            <ReminderFields reminder={editing} clients={clients} unpaidInvoices={unpaidInvoices} />
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

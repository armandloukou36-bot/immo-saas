import type { ReactNode } from 'react';

type BadgeTone = 'active' | 'pending' | 'overdue' | 'info' | 'neutral';

const TONES: Record<BadgeTone, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  overdue: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-navy-100 text-navy-600 border-navy-200',
};

export function StatusBadge({
  tone = 'neutral',
  icon,
  children,
}: {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium whitespace-nowrap ${TONES[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}

/* ---------------- Statuts métier ---------------- */

export const PROPERTY_STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  disponible: { label: 'Disponible', tone: 'active' },
  loué: { label: 'Loué', tone: 'info' },
  en_negociation: { label: 'En négociation', tone: 'pending' },
  vendu: { label: 'Vendu', tone: 'neutral' },
  reserve: { label: 'Réservé', tone: 'pending' },
  en_construction: { label: 'En construction', tone: 'pending' },
};

export const CLIENT_STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  actif: { label: 'Actif', tone: 'active' },
  inactif: { label: 'Inactif', tone: 'neutral' },
  lead: { label: 'Prospect', tone: 'info' },
  negotiation: { label: 'Négociation', tone: 'pending' },
};

export const LEASE_STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  active: { label: 'Actif', tone: 'active' },
  pending: { label: 'En attente', tone: 'pending' },
  draft: { label: 'Brouillon', tone: 'neutral' },
  terminated: { label: 'Terminé', tone: 'neutral' },
  expired: { label: 'Expiré', tone: 'overdue' },
};

export const INVOICE_STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  pending: { label: 'En attente', tone: 'pending' },
  paid: { label: 'Payée', tone: 'active' },
  overdue: { label: 'En retard', tone: 'overdue' },
  cancelled: { label: 'Annulée', tone: 'neutral' },
  write_off: { label: 'Radiée', tone: 'neutral' },
};

export const REMINDER_STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  pending: { label: 'En attente', tone: 'pending' },
  sent: { label: 'Envoyée', tone: 'active' },
  failed: { label: 'Échec', tone: 'overdue' },
  cancelled: { label: 'Annulée', tone: 'neutral' },
};

export const RECOVERY_STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  open: { label: 'Ouvert', tone: 'pending' },
  investigating: { label: 'Investigation', tone: 'info' },
  notice_sent: { label: 'Avis envoyé', tone: 'info' },
  legal_action: { label: 'Action légale', tone: 'overdue' },
  resolved: { label: 'Résolu', tone: 'active' },
  closed: { label: 'Clôturé', tone: 'neutral' },
  waived: { label: 'Renoncé', tone: 'neutral' },
};

export const REMINDER_TYPE: Record<string, string> = {
  rent_reminder: 'Relance loyer',
  payment_reminder: 'Relance paiement',
  recovery_notice: 'Avis recouvrement',
  general: 'Message général',
};

export const CHANNEL_LABEL: Record<string, string> = {
  email: 'Email',
  sms: 'SMS',
  in_app: 'Application',
  none: 'Aucun',
};

export const PAYMENT_METHOD: Record<string, string> = {
  cash: 'Espèces',
  bank_transfer: 'Virement bancaire',
  card: 'Carte bancaire',
  cheque: 'Chèque',
  mobile_money: 'Mobile Money',
  stripe: 'Stripe',
  other: 'Autre',
};

export const PROPERTY_TYPE_LABEL: Record<string, string> = {
  villa: 'Villa',
  appartement: 'Appartement',
  terrain: 'Terrain',
  local: 'Local commercial',
  bureau: 'Bureau',
  hotel: 'Hôtel',
  autre: 'Autre',
};

/** Récupère le libellé/ton d'un statut en repli sûr. */
export function statusOf(map: Record<string, { label: string; tone: BadgeTone }>, key: string) {
  return map[key] ?? { label: key, tone: 'neutral' as BadgeTone };
}

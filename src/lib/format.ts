/** Formatage partagé (serveur + client). */

const MONTHS = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];

/** 1500000 -> "1 500 000" */
export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '0';
  return Math.round(n).toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ');
}

/** 1500000 -> "1 500 000 FCFA" */
export function formatFCFA(n: number | null | undefined): string {
  return `${formatNumber(n)} FCFA`;
}

/** "2026-03-15" -> "15 mars 2026" */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "2026-03-15" -> "15/03/2026" */
export function formatShortDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
}

/** Date lisible pour un champ <input type="date"> */
export function toInputDate(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

/** Nombre de mois restants avant une échéance, arrondi. */
export function monthsRemaining(endDate: string | null | undefined): string {
  if (!endDate) return '—';
  const end = new Date(endDate).getTime();
  if (Number.isNaN(end)) return '—';
  const months = Math.round((end - Date.now()) / (1000 * 60 * 60 * 24 * 30.44));
  if (months <= 0) return 'Échu';
  return `${months} mois`;
}

/** Il y a X — à partir d'un timestamp ISO. */
export function timeAgo(value: string): string {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Hier';
  if (days < 30) return `Il y a ${days} jours`;
  return formatDate(value);
}

/** Capitalise la première lettre. */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "en_negociation" -> "En negociation" */
export function humanize(s: string): string {
  return capitalize(s.replace(/_/g, ' '));
}

/** Aujourd'hui au format YYYY-MM-DD. */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

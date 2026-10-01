'use client';

import { useState } from 'react';
import { ActionForm, SubmitButton } from '@/components/ui/ActionForm';
import { Modal } from '@/components/ui/Modal';
import { ConfirmAction } from '@/components/ui/ConfirmAction';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { createUser, toggleUser, updateOrganization, updateProfile, updateSubscription, changePassword } from '@/app/actions';
import { formatDate, formatFCFA } from '@/lib/format';
import type { Organization, TeamUser } from '@/lib/types';
import type { SessionUser } from '@/lib/auth';

const PLANS: { id: string; name: string; price: number; features: string[] }[] = [
  { id: 'free', name: 'Free', price: 0, features: ['10 biens', '2 utilisateurs', 'Facturation de base', 'Support par email'] },
  {
    id: 'basic',
    name: 'Basic',
    price: 50000,
    features: ['25 biens', '5 utilisateurs', 'CRM complet', 'Relances', 'Support prioritaire'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 150000,
    features: ['Biens illimités', '10 utilisateurs', 'CRM + Biens', 'Facturation + Recouvrement', 'Support 24/7'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 300000,
    features: ['Tout illimité', 'Utilisateurs illimités', 'Multi-sites', 'Marque blanche', 'SLA 99,9 %'],
  },
];

const ROLES = ['admin', 'manager', 'agent', 'viewer'];

const TABS = [
  { id: 'general', label: 'Organisation' },
  { id: 'users', label: 'Utilisateurs' },
  { id: 'subscription', label: 'Abonnement' },
  { id: 'profile', label: 'Mon profil' },
];

export function SettingsClient({
  organization,
  users,
  currentUser,
}: {
  organization: Organization;
  users: TeamUser[];
  currentUser: SessionUser;
}) {
  const [activeTab, setActiveTab] = useState('general');
  const [inviteOpen, setInviteOpen] = useState(false);

  const currentPlan = PLANS.find((p) => p.id === organization.plan) ?? PLANS[0];
  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-bold text-navy-900 font-serif">Paramètres</h2>
        <p className="text-navy-500 mt-1">Configuration de votre organisation et de votre compte</p>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-white rounded-lg border border-navy-100 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-gold-400 text-navy-900' : 'text-navy-600 hover:bg-navy-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-navy-100 shadow-sm">
        {/* Organisation */}
        {activeTab === 'general' && (
          <ActionForm action={updateOrganization} className="p-6 space-y-4">
            <h3 className="font-semibold text-navy-900">Informations de l&apos;organisation</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="form-section">
                <label className="form-label" htmlFor="name">
                  Nom de l&apos;entreprise *
                </label>
                <input id="name" name="name" type="text" defaultValue={organization.name} className="input-base" required />
              </div>
              <div className="form-section">
                <label className="form-label" htmlFor="slug">
                  Identifiant (URL)
                </label>
                <input
                  id="slug"
                  type="text"
                  value={organization.slug}
                  readOnly
                  className="input-base font-mono text-sm bg-navy-50 text-navy-400"
                />
                <p className="form-hint">Identifiant unique de votre espace (non modifiable)</p>
              </div>
            </div>

            <div className="form-section">
              <label className="form-label" htmlFor="address">
                Adresse
              </label>
              <input id="address" name="address" type="text" defaultValue={organization.address ?? ''} className="input-base" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="form-section">
                <label className="form-label" htmlFor="email">
                  Email de contact
                </label>
                <input id="email" name="email" type="email" defaultValue={organization.email ?? ''} className="input-base" />
              </div>
              <div className="form-section">
                <label className="form-label" htmlFor="phone">
                  Téléphone
                </label>
                <input id="phone" name="phone" type="tel" defaultValue={organization.phone ?? ''} className="input-base" />
              </div>
            </div>

            <SubmitButton pendingLabel="Enregistrement…">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Enregistrer les modifications
            </SubmitButton>
          </ActionForm>
        )}

        {/* Utilisateurs */}
        {activeTab === 'users' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h3 className="font-semibold text-navy-900">Utilisateurs ({users.length})</h3>
              {isAdmin && (
                <button type="button" onClick={() => setInviteOpen(true)} className="btn btn-ghost text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Inviter un utilisateur
                </button>
              )}
            </div>

            <div className="border-t border-navy-100">
              {users.map((u) => (
                <div key={u.id} className="py-4 border-b border-navy-50 last:border-0 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center text-navy-600 font-bold flex-shrink-0">
                      {u.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-navy-900 truncate">
                        {u.full_name}
                        {u.id === currentUser.id && <span className="text-xs text-gold-600 ml-2">(vous)</span>}
                      </div>
                      <div className="text-xs text-navy-500 truncate">{u.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge tone={u.enabled === 1 ? 'active' : 'neutral'}>
                      {u.enabled === 1 ? 'Actif' : 'Désactivé'}
                    </StatusBadge>
                    <span className="status-badge status-pending">{u.role}</span>
                    <span className="text-xs text-navy-400 hidden sm:inline">
                      {u.last_login_at ? formatDate(u.last_login_at) : 'Jamais connecté'}
                    </span>
                    {isAdmin && u.id !== currentUser.id && (
                      <ConfirmAction
                        action={toggleUser}
                        hidden={{ id: u.id }}
                        title={u.enabled === 1 ? 'Désactiver cet utilisateur ?' : 'Réactiver cet utilisateur ?'}
                        description={
                          u.enabled === 1 ? (
                            <>
                              <strong>{u.full_name}</strong> ne pourra plus se connecter et ses sessions actives seront
                              fermées.
                            </>
                          ) : (
                            <>
                              <strong>{u.full_name}</strong> pourra à nouveau se connecter.
                            </>
                          )
                        }
                        confirmLabel={u.enabled === 1 ? 'Désactiver' : 'Réactiver'}
                        danger={u.enabled === 1}
                        triggerTitle={u.enabled === 1 ? 'Désactiver' : 'Réactiver'}
                        triggerClassName="text-navy-400 hover:text-gold-500 p-1.5 transition-colors"
                        trigger={
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d={u.enabled === 1 ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' : 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'}
                            />
                          </svg>
                        }
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!isAdmin && (
              <p className="form-hint">Seul un administrateur peut inviter ou désactiver des utilisateurs.</p>
            )}
          </div>
        )}

        {/* Abonnement */}
        {activeTab === 'subscription' && (
          <div className="p-6 space-y-6">
            <div className="p-4 rounded-lg bg-navy-50 border border-navy-100">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-xs text-navy-500 uppercase tracking-wider font-medium">Plan actuel</div>
                  <div className="text-xl font-bold text-navy-900 font-serif">{currentPlan.name}</div>
                  <div className="mt-1">
                    <StatusBadge tone={organization.status === 'active' ? 'active' : 'overdue'}>
                      {organization.status === 'active' ? 'Actif' : organization.status}
                    </StatusBadge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-navy-900 font-serif">
                    {formatFCFA(currentPlan.price)} <span className="text-sm font-normal text-navy-500">/ mois</span>
                  </div>
                  <div className="text-xs text-navy-500">
                    {users.length} utilisateur{users.length > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-navy-900 text-sm mb-3">Comparaison des plans</h4>
              <div className="grid gap-3 md:grid-cols-2">
                {PLANS.map((plan) => {
                  const isCurrent = plan.id === organization.plan;
                  return (
                    <div
                      key={plan.id}
                      className={`p-4 rounded-lg border ${isCurrent ? 'border-gold-400 bg-gold-50' : 'border-navy-100 bg-white'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-semibold text-navy-900">{plan.name}</div>
                          <div className="text-lg font-bold text-navy-900 font-serif">
                            {formatFCFA(plan.price)} <span className="text-sm font-normal text-navy-500">/ mois</span>
                          </div>
                        </div>
                        {isCurrent && <span className="status-badge status-active text-[10px]">ACTUEL</span>}
                      </div>
                      <ul className="space-y-1 text-sm text-navy-600 mb-3">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2">
                            <svg className="w-3.5 h-3.5 text-gold-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" />
                            </svg>
                            {f}
                          </li>
                        ))}
                      </ul>
                      {!isCurrent && isAdmin && (
                        <ActionForm action={updateSubscription} className="mt-2">
                          <input type="hidden" name="plan" value={plan.id} />
                          <SubmitButton className="btn btn-ghost text-xs w-full justify-center" pendingLabel="…">
                            Passer à ce plan
                          </SubmitButton>
                        </ActionForm>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Profil */}
        {activeTab === 'profile' && (
          <div className="p-6 space-y-8">
            <ActionForm action={updateProfile} className="space-y-4">
              <h3 className="font-semibold text-navy-900">Mon profil</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="form-section">
                  <label className="form-label" htmlFor="full_name">
                    Nom complet *
                  </label>
                  <input id="full_name" name="full_name" type="text" defaultValue={currentUser.full_name} className="input-base" required />
                </div>
                <div className="form-section">
                  <label className="form-label" htmlFor="email_readonly">
                    Email
                  </label>
                  <input
                    id="email_readonly"
                    type="email"
                    value={currentUser.email}
                    readOnly
                    className="input-base bg-navy-50 text-navy-400"
                  />
                </div>
              </div>
              <SubmitButton pendingLabel="Enregistrement…">Enregistrer mon profil</SubmitButton>
            </ActionForm>

            <div className="border-t border-navy-100 pt-6">
              <ActionForm action={changePassword} className="space-y-4">
                <h3 className="font-semibold text-navy-900">Changer de mot de passe</h3>
                <div className="form-section">
                  <label className="form-label" htmlFor="current_password">
                    Mot de passe actuel *
                  </label>
                  <input
                    id="current_password"
                    name="current_password"
                    type="password"
                    className="input-base"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="form-section">
                    <label className="form-label" htmlFor="new_password">
                      Nouveau mot de passe *
                    </label>
                    <input
                      id="new_password"
                      name="new_password"
                      type="password"
                      minLength={8}
                      className="input-base"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  <div className="form-section">
                    <label className="form-label" htmlFor="confirm_password">
                      Confirmer *
                    </label>
                    <input
                      id="confirm_password"
                      name="confirm_password"
                      type="password"
                      minLength={8}
                      className="input-base"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>
                <SubmitButton className="btn btn-ghost" pendingLabel="Modification…">
                  Modifier le mot de passe
                </SubmitButton>
              </ActionForm>
            </div>
          </div>
        )}
      </div>

      {/* Modale d'invitation */}
      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Inviter un utilisateur"
        subtitle="Créez un accès pour un membre de votre équipe"
      >
        <ActionForm action={createUser} onSuccess={() => setInviteOpen(false)}>
          <div className="form-section">
            <label className="form-label" htmlFor="invite_name">
              Nom complet *
            </label>
            <input id="invite_name" name="full_name" type="text" className="input-base" required />
          </div>
          <div className="form-section">
            <label className="form-label" htmlFor="invite_email">
              Email *
            </label>
            <input id="invite_email" name="email" type="email" className="input-base" required />
          </div>
          <div className="form-section">
            <label className="form-label" htmlFor="invite_password">
              Mot de passe provisoire *
            </label>
            <input
              id="invite_password"
              name="password"
              type="password"
              minLength={8}
              className="input-base"
              placeholder="Min. 8 caractères"
              required
            />
          </div>
          <div className="form-section">
            <label className="form-label" htmlFor="invite_role">
              Rôle
            </label>
            <select id="invite_role" name="role" className="input-base" defaultValue="agent">
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => setInviteOpen(false)} className="btn btn-ghost">
              Annuler
            </button>
            <SubmitButton pendingLabel="Création…">Créer l&apos;utilisateur</SubmitButton>
          </div>
        </ActionForm>
      </Modal>
    </div>
  );
}

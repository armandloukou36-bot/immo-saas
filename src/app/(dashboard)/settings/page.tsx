'use client';

import { useState } from 'react';

const org = {
  name: 'SCONVEGE IMMOBILIER',
  slug: 'sconverge',
  plan: 'pro',
  status: 'active',
  startDate: '01 Jan 2025',
  endDate: '31 Déc 2026',
  licenses: 5,
  usedLicenses: 3,
};

const plans = [
  { id: 'free', name: 'Free', price: '0', features: ['10 biens', '2 utilisateurs', 'Facturation basic', 'Support par email'] },
  { id: 'basic', name: 'Basic', price: '50 000', features: ['25 biens', '5 utilisateurs', 'CRM complet', 'Relances automatiques', 'Support priorité'] },
  { id: 'pro', name: 'Pro', price: '150 000', features: ['Illimité biens', '10 utilisateurs', 'CRM + Biens complet', 'Facturation + Recouvrement', 'API access', 'Support 24/7'] },
  { id: 'enterprise', name: 'Enterprise', price: '300 000', features: ['Illimité tout', 'Utilisateurs illimités', 'Multi-sites', 'White-label', 'Dédicacé support', 'SLA 99.9%'] },
];

const users = [
  { name: 'Administrateur', email: 'admin@sconverge.com', role: 'admin', status: 'active', lastLogin: 'Aujourd\'hui' },
  { name: 'M. Loukou Armand', email: 'armand@sconverge.com', role: 'manager', status: 'active', lastLogin: 'Hier' },
  { name: 'Mme Koné Solange', email: 'solange@sconverge.com', role: 'agent', status: 'active', lastLogin: 'Il y a 3 jours' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-navy-900 font-serif">Paramètres</h2>
        <p className="text-navy-500 mt-1">Configuration de votre organisation et de votre compte</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-lg border border-navy-100 overflow-x-auto">
        {[
          { id: 'general', label: 'Organisation', icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          )},
          { id: 'users', label: 'Utilisateurs', icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.105a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.678 0-5.216-.5-7.499-1.437m.979 1.953a7.5 7.5 0 0014.998 0 17.933 17.933 0 007.499-1.437m-.979-1.953a7.5 7.5 0 01-14.998 0 17.933 17.933 0 01-7.499-1.437" />
            </svg>
          )},
          { id: 'subscription', label: 'Abonnement', icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M2.25 21V3m2.25 3l10.5 4.5L21 12v9M3.75 12l3-4.5M13.5 12L21 7.5" />
            </svg>
          )},
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-gold-400 text-navy-900'
                : 'text-navy-600 hover:bg-navy-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="bg-white rounded-xl border border-navy-100 shadow-sm overflow-hidden">
        {/* Onglet Général */}
        {activeTab === 'general' && (
          <div className="p-6 space-y-6">
            <h3 className="font-semibold text-navy-900">Informações de l'organisation</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="form-section">
                <label className="form-label">Nom de l'entreprise</label>
                <input
                  type="text"
                  defaultValue={org.name}
                  className="input-base"
                />
              </div>
              <div className="form-section">
                <label className="form-label">Slug (URL)</label>
                <input
                  type="text"
                  defaultValue={org.slug}
                  className="input-base font-mono text-sm bg-navy-50 text-navy-400"
                />
                <p className="form-hint">Identifiant unique pour votre espace</p>
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">Adresse</label>
              <input
                type="text"
                defaultValue="Cocody Angré, Abidjan — Côte d'Ivoire"
                className="input-base"
              />
            </div>

            <div className="form-section">
              <label className="form-label">Email de contact</label>
              <input
                type="email"
                defaultValue="contact@sconverge.com"
                className="input-base"
              />
            </div>

            <div className="form-section">
              <label className="form-label">Téléphone</label>
              <input
                type="tel"
                defaultValue="+225 27 22 58 09 36"
                className="input-base"
              />
            </div>

            <button className="btn btn-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Enregistrer les modifications
            </button>
          </div>
        )}

        {/* Onglet Utilisateurs */}
        {activeTab === 'users' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-navy-900">Utilisateurs</h3>
              <button className="btn btn-ghost text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Inviter un utilisateur
              </button>
            </div>

            <div className="border-t border-navy-100">
              {users.map((user, i) => (
                <div key={i} className="px-6 py-4 border-b border-navy-50 last:border-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center text-navy-600 font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-navy-900">{user.name}</div>
                      <div className="text-xs text-navy-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`status-badge ${
                      user.role === 'admin' ? 'status-active' :
                      user.role === 'manager' ? 'status-pending' :
                      'status-pending'
                    }`}>
                      {user.role}
                    </span>
                    <span className="text-xs text-navy-400">{user.lastLogin}</span>
                    <button className="text-navy-400 hover:text-red-500 p-1.5 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Onglet Abonnement */}
        {activeTab === 'subscription' && (
          <div className="p-6 space-y-6">
            {/* Plan actuel */}
            <div className="p-4 rounded-lg bg-navy-50 border border-navy-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-navy-500 uppercase tracking-wider font-medium">Plan actuel</div>
                  <div className="text-xl font-bold text-navy-900 font-serif">{plans.find(p => p.id === org.plan)?.name}</div>
                  <div className="text-sm text-navy-600 mt-1">
                    {org.status === 'active' ? (
                      <span className="status-badge status-active">● Actif</span>
                    ) : (
                      <span className="status-badge status-pending">● Inactif</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-navy-900 font-serif">
                    {plans.find(p => p.id === org.plan)?.price} <span className="text-sm font-normal text-navy-500">FCFA/mois</span>
                  </div>
                  <div className="text-xs text-navy-500">
                    Renouvellement: {org.endDate}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-navy-600">
                <span className="text-xs bg-navy-100 px-2 py-0.5 rounded">Licences: {org.usedLicenses}/{org.licenses} utilisés</span>
                <button className="ml-auto btn btn-gold text-xs py-1.5 px-3">
                  Changer de plan
                </button>
              </div>
            </div>

            {/* Comparaison des plans */}
            <div>
              <h4 className="font-semibold text-navy-900 text-sm mb-3">Comparaison des plans</h4>
              <div className="grid gap-3">
                {plans.map(plan => (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-lg border ${
                      org.plan === plan.id
                        ? 'border-gold-400 bg-gold-50'
                        : 'border-navy-100 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold text-navy-900">{plan.name}</div>
                        <div className="text-lg font-bold text-navy-900 font-serif">{plan.price} <span className="text-sm font-normal text-navy-500">FCFA/mois</span></div>
                      </div>
                      {org.plan === plan.id && (
                        <span className="status-badge status-active text-[10px]">ACTUEL</span>
                      )}
                    </div>
                    <ul className="space-y-1 text-sm text-navy-600">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2">
                          <svg className="w-3.5 h-3.5 text-gold-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 15.586l-5.293-5.293a1 1 0 011.414-1.414l5.293 5.293a1 1 0 01-1.414 1.414z" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    {org.plan !== plan.id && (
                      <button className="mt-2 btn btn-ghost text-xs w-full justify-center">
                        Passer à ce plan
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

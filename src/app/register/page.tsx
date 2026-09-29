'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    organizationName: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setLoading(true);
    setError('');

    setTimeout(() => {
      router.push('/dashboard');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-navy-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-900 text-gold-400 text-xs font-bold tracking-wider uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-gold-400" />
            Immo SaaS
          </div>
          <h1 className="text-2xl font-bold text-navy-900 font-serif">Créer un compte</h1>
          <p className="text-navy-500 mt-2">Commencez votre gestion immobilière</p>
        </div>

        <div className="bg-white rounded-xl border border-navy-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="form-section">
              <label className="form-label" htmlFor="orgName">Nom de l'entreprise</label>
              <input
                id="orgName"
                type="text"
                value={form.organizationName}
                onChange={(e) => handleChange('organizationName', e.target.value)}
                className="input-base"
                placeholder="Ex: SCONVEGE IMMOBILIER"
                required
              />
            </div>

            <div className="form-section">
              <label className="form-label" htmlFor="fullName">Votre nom complet</label>
              <input
                id="fullName"
                type="text"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="input-base"
                placeholder="Jean Dupont"
                required
              />
            </div>

            <div className="form-section">
              <label className="form-label" htmlFor="email">Adresse email</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="input-base"
                placeholder="admin@agence.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-section">
              <label className="form-label" htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="input-base"
                placeholder="Min. 8 caractères"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="form-section">
              <label className="form-label" htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className="input-base"
                placeholder="Répétez le mot de passe"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="form-section">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-gold w-full justify-center"
              >
                {loading ? 'Création...' : 'Créer mon compte'}
              </button>
            </div>

            <p className="text-xs text-navy-400 mt-3 text-center">
              En créant un compte, vous acceptez nos conditions d'utilisation.
            </p>

            <div className="border-t border-navy-100 pt-4 text-center">
              <p className="text-xs text-navy-400">
                Déjà un compte?{' '}
                <Link href="/login" className="text-gold-500 hover:text-gold-600 font-medium">
                  Se connecter
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

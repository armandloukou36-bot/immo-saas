'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Demo mode: répondre directement
    if (email && password) {
      setTimeout(() => {
        router.push('/dashboard');
        setLoading(false);
      }, 800);
      return;
    }

    setError('Veuillez remplir tous les champs');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-navy-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-900 text-gold-400 text-xs font-bold tracking-wider uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-gold-400" />
            Immo SaaS
          </div>
          <h1 className="text-2xl font-bold text-navy-900 font-serif">Connexion</h1>
          <p className="text-navy-500 mt-2">Accès à votre gestion immobilière</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-navy-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="form-section">
              <label className="form-label" htmlFor="email">Adresse email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base"
                placeholder="admin@agence.com"
                autoComplete="email"
              />
            </div>

            <div className="form-section">
              <label className="form-label" htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <div className="form-section">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full justify-center"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Connexion...
                  </span>
                ) : (
                  'Se connecter'
                )}
              </button>
            </div>

            <div className="border-t border-navy-100 pt-4 text-center">
              <p className="text-xs text-navy-400">
                Pas encore de compte?{' '}
                <Link href="/register" className="text-gold-500 hover:text-gold-600 font-medium">
                  Créer un compte
                </Link>
              </p>
              <p className="text-xs text-navy-400 mt-2">
                <Link href="/dashboard" className="text-navy-500 hover:text-navy-600 font-medium">
                  Accès direct (demo)
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-navy-400 mt-6">
          © 2026 Immo SaaS — Gestion immobilière 360°
        </p>
      </div>
    </div>
  );
}

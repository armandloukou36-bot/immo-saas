import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { loginAction } from '@/app/actions';
import { ActionForm, SubmitButton } from '@/components/ui/ActionForm';

export const metadata = { title: 'Connexion — IMMO SAAS' };

export default async function LoginPage() {
  if (await getSession()) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-navy-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-900 text-gold-400 text-xs font-bold tracking-wider uppercase mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-gold-400" />
            Immo SaaS
          </Link>
          <h1 className="text-2xl font-bold text-navy-900 font-serif">Connexion</h1>
          <p className="text-navy-500 mt-2">Accès à votre gestion immobilière</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-xl border border-navy-100 shadow-sm p-6">
          <ActionForm action={loginAction}>
            <div className="form-section">
              <label className="form-label" htmlFor="email">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="input-base"
                placeholder="admin@agence.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-section">
              <label className="form-label" htmlFor="password">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="input-base"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="form-section">
              <SubmitButton className="btn btn-primary w-full justify-center" pendingLabel="Connexion…">
                Se connecter
              </SubmitButton>
            </div>

            <div className="border-t border-navy-100 pt-4 text-center">
              <p className="text-xs text-navy-400">
                Pas encore de compte ?{' '}
                <Link href="/register" className="text-gold-500 hover:text-gold-600 font-medium">
                  Créer un compte
                </Link>
              </p>
            </div>
          </ActionForm>

          {/* Compte de démonstration */}
          <div className="mt-5 p-3 rounded-lg bg-navy-50 border border-navy-100">
            <p className="text-xs font-semibold text-navy-700 mb-1">Compte de démonstration</p>
            <p className="text-xs text-navy-500 font-mono">demo@immo-saas.app</p>
            <p className="text-xs text-navy-500 font-mono">demo1234</p>
          </div>
        </div>

        <p className="text-center text-xs text-navy-400 mt-6">© 2026 IMMO SAAS — Gestion immobilière 360°</p>
      </div>
    </div>
  );
}

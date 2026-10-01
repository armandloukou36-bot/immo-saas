import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { registerAction } from '@/app/actions';
import { ActionForm, SubmitButton } from '@/components/ui/ActionForm';

export const metadata = { title: 'Créer un compte — IMMO SAAS' };

export default async function RegisterPage() {
  if (await getSession()) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-navy-50 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-900 text-gold-400 text-xs font-bold tracking-wider uppercase mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-gold-400" />
            Immo SaaS
          </Link>
          <h1 className="text-2xl font-bold text-navy-900 font-serif">Créer un compte</h1>
          <p className="text-navy-500 mt-2">Commencez votre gestion immobilière</p>
        </div>

        <div className="bg-white rounded-xl border border-navy-100 shadow-sm p-6">
          <ActionForm action={registerAction}>
            <div className="form-section">
              <label className="form-label" htmlFor="organizationName">
                Nom de l&apos;entreprise
              </label>
              <input
                id="organizationName"
                name="organizationName"
                type="text"
                className="input-base"
                placeholder="Ex : Mon Agence Immobilière"
                required
              />
            </div>

            <div className="form-section">
              <label className="form-label" htmlFor="fullName">
                Votre nom complet
              </label>
              <input id="fullName" name="fullName" type="text" className="input-base" placeholder="Jean Dupont" required />
            </div>

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
                placeholder="Min. 8 caractères"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <div className="form-section">
              <label className="form-label" htmlFor="confirmPassword">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="input-base"
                placeholder="Répétez le mot de passe"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <div className="form-section">
              <SubmitButton className="btn btn-gold w-full justify-center" pendingLabel="Création…">
                Créer mon compte
              </SubmitButton>
            </div>

            <p className="text-xs text-navy-400 mt-3 text-center">
              En créant un compte, vous acceptez nos conditions d&apos;utilisation.
            </p>

            <div className="border-t border-navy-100 pt-4 text-center">
              <p className="text-xs text-navy-400">
                Déjà un compte ?{' '}
                <Link href="/login" className="text-gold-500 hover:text-gold-600 font-medium">
                  Se connecter
                </Link>
              </p>
            </div>
          </ActionForm>
        </div>
      </div>
    </div>
  );
}

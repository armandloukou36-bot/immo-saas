import Link from 'next/link';

export const metadata = {
  title: 'IMMO SAAS — Logiciel de gestion immobilière 360°',
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-navy-50">
      <main className="flex-1 relative overflow-hidden flex items-center">
        {/* Fond */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900" />
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.05" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        {/* Contenu */}
        <div className="relative w-full max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-700/50 border border-navy-600/50 text-navy-200 text-xs font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
            Logiciel de gestion immobilière
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white font-serif leading-tight">
            Bienvenue sur <span className="text-gold-400">IMMO SAAS</span>
          </h1>

          <p className="text-lg md:text-2xl text-navy-200 mt-6 max-w-2xl mx-auto font-light">
            Votre logiciel de gestion 360° de votre agence immobilière
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 bg-gold-400 text-navy-900 font-semibold rounded-lg hover:bg-gold-300 transition-colors shadow-lg shadow-gold-400/20"
            >
              Accéder au tableau de bord
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 border border-navy-500 text-white font-semibold rounded-lg hover:bg-navy-700/50 transition-colors"
            >
              Se connecter
            </Link>
          </div>

          <p className="text-navy-300 mt-8 text-sm">
            Pas encore de compte ?{' '}
            <Link
              href="/register"
              className="text-gold-400 hover:text-gold-300 font-medium underline-offset-4 hover:underline"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </main>

      <footer className="bg-navy-950 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-navy-400 text-sm">
          © 2026 IMMO SAAS — Logiciel de gestion immobilière 360°
        </div>
      </footer>
    </div>
  );
}

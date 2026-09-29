import Link from 'next/link';
import { TypeIcon } from '@/components/ui/TypeIcon';

const services = [
  { icon: '🏢', title: 'Gestion immobilière', desc: 'Gestion complète de vos biens immobiliers' },
  { icon: '💰', title: 'Encaissement de loyer', desc: 'Suivi et recouvrement des loyers' },
  { icon: '🏗️', title: 'Construction de maisons', desc: 'Construction sur mesure' },
  { icon: '📋', title: 'Plans et devis', desc: 'Plans architecturaux et devis détaillés' },
  { icon: '🏠', title: 'Vente de maisons', desc: 'Vente de propriétés immobilières' },
  { icon: '🌍', title: 'Vente de terrains', desc: 'Terrain disponible à l\'vente' },
];

const stats = [
  { label: 'Biens gérés', value: '150+' },
  { label: 'Clients satisfaits', value: '850+' },
  { label: 'Années d\'expérience', value: '10+' },
  { label: 'Transactions/an', value: '200+' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-navy-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
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
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-700/50 border border-navy-600/50 text-navy-200 text-xs font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
              Agence immobilière premium
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white font-serif leading-tight">
              SCONVERGE
              <span className="block text-gold-400 mt-2">IMMOBILIER</span>
            </h1>
            <p className="text-xl md:text-2xl text-navy-200 mt-6 max-w-3xl mx-auto font-light">
              Votre projet, notre priorité.
              <br />
              Expertise immobilière de A à Z en Côte d'Ivoire
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Link href="/dashboard" className="px-8 py-4 bg-gold-400 text-navy-900 font-semibold rounded-lg hover:bg-gold-300 transition-colors shadow-lg shadow-gold-400/20">
                Accéder au tableau de bord
              </Link>
              <a href="tel:+2252722580936" className="px-8 py-4 border border-navy-500 text-white font-semibold rounded-lg hover:bg-navy-700/50 transition-colors">
                📞 2722580936
              </a>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-navy-300 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0v4a1 1 0 01-1 1h-4a1 1 0 00-1 1v-1.5a3 3 0 016 0v1.5a1 1 0 001 1h4a1 1 0 011 1v4a3 3 0 11-6 0v-4a1 1 0 00-1-1h-4a1 1 0 01-1-1v-1.5a3 3 0 016 0v1.5a1 1 0 001 1h4a1 1 0 011 1v4a3 3 0 016 0v-4a1 1 0 00-1-1h-4a1 1 0 01-1-1v-1.5a3 3 0 016 0v1.5a1 1 0 001 1h4a1 1 0 011 1v4a3 3 0 11-6 0v-4a1 1 0 00-1-1h-4a1 1 0 01-1-1v-1.5a3 3 0 016 0z" />
                </svg>
                Cocody Angré, Abidjan
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Lun - Sam: 8h - 18h
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-navy-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-navy-900 font-serif">{s.value}</div>
                <div className="text-navy-500 mt-1 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 font-serif">Nos Services</h2>
            <p className="text-navy-500 mt-3 max-w-2xl mx-auto">Une expertise complète pour tous vos besoins immobiliers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <div key={i} className="group p-6 rounded-xl border border-navy-100 bg-navy-50/50 hover:bg-white hover:shadow-lg hover:shadow-navy-900/5 transition-all duration-300">
                <div className="text-3xl mb-4">{s.icon}</div>
                <h3 className="text-lg font-bold text-navy-900 font-serif">{s.title}</h3>
                <p className="text-navy-500 mt-2 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-navy-800 rounded-2xl p-8 md:p-12 border border-navy-700">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white font-serif">Contactez-nous</h2>
                <p className="text-navy-300 mt-3">Une question ? Notre équipe est à votre disposition</p>
                <div className="mt-6 space-y-4">
                  <a href="tel:+2252722580936" className="flex items-center gap-3 text-navy-200 hover:text-gold-400 transition-colors">
                    <svg className="w-6 h-6 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">+225 27 22 58 09 36</span>
                  </a>
                  <a href="tel:+2250566161117" className="flex items-center gap-3 text-navy-200 hover:text-gold-400 transition-colors">
                    <svg className="w-6 h-6 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">+225 05 66 16 11 17</span>
                  </a>
                  <div className="flex items-start gap-3 text-navy-300">
                    <svg className="w-5 h-5 mt-0.5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0v4a1 1 0 01-1 1h-4a1 1 0 00-1 1v-1.5a3 3 0 016 0v1.5a1 1 0 001 1h4a1 1 0 011 1v4a3 3 0 11-6 0v-4a1 1 0 00-1-1h-4a1 1 0 01-1-1v-1.5a3 3 0 016 0z" />
                    </svg>
                    <div>
                      <div className="font-medium text-navy-200">Adresse</div>
                      <div className="text-sm">Cocody Angré, Abidjan, Côte d'Ivoire</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-navy-900/50 rounded-xl p-6 border border-navy-700">
                <h3 className="text-lg font-semibold text-white mb-4">Services en ligne</h3>
                <div className="space-y-3">
                  <Link href="/dashboard" className="block p-3 rounded-lg bg-navy-800 hover:bg-navy-700 text-navy-200 text-sm transition-colors">
                    <span className="font-medium">Tableau de bord</span>
                    <span className="text-navy-400 block mt-1">Gestion de vos biens et clients</span>
                  </Link>
                  <Link href="/login" className="block p-3 rounded-lg bg-navy-800 hover:bg-navy-700 text-navy-200 text-sm transition-colors">
                    <span className="font-medium">Connexion</span>
                    <span className="text-navy-400 block mt-1">Accès à votre espace personnel</span>
                  </Link>
                </div>
                <div className="mt-6 pt-6 border-t border-navy-700">
                  <p className="text-navy-400 text-sm">
                    <span className="text-gold-400">Dépôt de garantie</span>
                    <span className="block mt-1 text-navy-300">Mesure de sécurité pour vos transactions</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-950 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-navy-400 text-sm">
              © 2026 SCONVERGE IMMOBILIER. Tous droits réservés.
            </div>
            <div className="flex items-center gap-4 text-navy-500">
              <span className="text-xs">Construit avec ❤️ pour l'immobilier ivoirien</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

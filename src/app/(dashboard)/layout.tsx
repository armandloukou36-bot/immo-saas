import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { getSession } from '@/lib/auth';
import { logoutAction } from '@/app/actions';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = getSession();
  if (!user) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <Sidebar orgName={user.org_name} />
      <main className="main-content">
        <div className="page-header">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="page-title">Immo SaaS</h1>
              <p className="page-subtitle truncate">{user.org_name} · Gestion immobilière 360°</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-navy-500">Connecté en tant que</div>
                <div className="text-xs font-medium text-navy-700">
                  {user.full_name} <span className="text-navy-400">· {user.role}</span>
                </div>
              </div>
              <form action={logoutAction}>
                <button type="submit" className="btn btn-ghost text-xs" title="Se déconnecter">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                    />
                  </svg>
                  Déconnexion
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}

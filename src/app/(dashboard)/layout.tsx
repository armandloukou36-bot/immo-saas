import { Sidebar } from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Immo SaaS</h1>
              <p className="page-subtitle">Gestion immobilière 360°</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-navy-500">Connecté en tant qu'administrateur</div>
                <div className="text-xs text-navy-400 mt-0.5">Demo mode</div>
              </div>
            </div>
          </div>
        </div>
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}

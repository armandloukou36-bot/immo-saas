'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  {
    section: 'Principal',
    items: [
      { href: '/dashboard', label: 'Tableau de bord', icon: DashboardIcon },
      { href: '/clients', label: 'Clients', icon: ClientsIcon },
      { href: '/properties', label: 'Biens', icon: PropertiesIcon },
    ],
  },
  {
    section: 'Gestion',
    items: [
      { href: '/leases', label: 'Baux', icon: LeasesIcon },
      { href: '/invoices', label: 'Factures', icon: InvoicesIcon },
      { href: '/reminders', label: 'Relances', icon: RemindersIcon },
      { href: '/recovery', label: 'Recouvrement', icon: RecoveryIcon },
    ],
  },
  {
    section: 'Paramètres',
    items: [
      { href: '/settings', label: 'Paramètres', icon: SettingsIcon },
    ],
  },
];

function DashboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75v.75A2.25 2.25 0 013.75 6h2.25M3.75 6a2.25 2.25 0 002.25 2.25h?.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m0 0l-3.75-3.75M12 12l3.75-3.75" />
    </svg>
  );
}

function ClientsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.105a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.678 0-5.216-.5-7.499-1.437m.979 1.953a7.5 7.5 0 0014.998 0 17.933 17.933 0 007.499-1.437m-.979-1.953a7.5 7.5 0 01-14.998 0 17.933 17.933 0 01-7.499-1.437" />
    </svg>
  );
}

function PropertiesIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m0 0l-3.75-3.75M12 12l3.75 3.75M12 6l3.75 3.75M12 6l-3.75 3.75M12 18l3.75-3.75M12 12l-3.75-3.75M16.5 12l3.75-3.75M7.5 12l-3.75 3.75" />
    </svg>
  );
}

function LeasesIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5A3.375 3.375 0 0010.125 2.25H8.25m0 2.25H4.875c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function InvoicesIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0018 4.5h-1.5a2.25 2.25 0 00-2.25 2.25v12.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function RemindersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function RecoveryIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 6.594l-1.263 1.263a1.5 1.5 0 11-2.122-2.122l2.526-2.526A1.5 1.5 0 0110.878 4.5l-2.526 2.526a1.5 1.5 0 01-2.122-2.122l1.263-1.263A1.5 1.5 0 018.354 3l-1.263 1.263A1.5 1.5 0 016.5 5.122V8.5a1.5 1.5 0 01-3 0V5.122A1.5 1.5 0 016.5 2.25l1.263 1.263a1.5 1.5 0 012.122 2.122l-2.526 2.526a1.5 1.5 0 01-2.122 2.122l1.263 1.263A1.5 1.5 0 018.354 9.5V14.5a1.5 1.5 0 01-3 0V9.5a1.5 1.5 0 012.122-2.122l2.526-2.526a1.5 1.5 0 012.122 2.122l-1.263 1.263A1.5 1.5 0 018.354 15.5V19.5a1.5 1.5 0 01-3 0V9.5a1.5 1.5 0 012.122-2.122l2.526-2.526a1.5 1.5 0 012.122 2.122l-1.263 1.263A1.5 1.5 0 018.354 21.5V24a1.5 1.5 0 01-3 0v-5.5a1.5 1.5 0 012.122-2.122l2.526-2.526a1.5 1.5 0 012.122 2.122l-1.263 1.263A1.5 1.5 0 018.354 18.5V20.5a1.5 1.5 0 01-3 0V14.5a1.5 1.5 0 012.122-2.122l2.526-2.526a1.5 1.5 0 012.122 2.122l-1.263 1.263A1.5 1.5 0 018.354 12.5V9.5z" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">Immo<span className="text-white">SaaS</span></div>
        <p className="text-[10px] text-navy-500 mt-0.5 text-center">Gestion Immobilière 360°</p>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.section} className="sidebar-section">
            <div className="sidebar-section-title">{section.section}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="text-xs text-navy-500 text-center">
          v0.1.0 · Immo SaaS
        </div>
      </div>
    </aside>
  );
}

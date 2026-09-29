import { JSX } from 'react';

interface TypeIconProps {
  type: string;
  className?: string;
}

const iconMap: Record<string, JSX.Element> = {
  locataire: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M6.75 15h.008v.008H6.75V15zm0 0h.008v.008H6.75V15z" />
    </svg>
  ),
  propriétaire: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M2.25 21V3m2.25 3l10.5 4.5L21 12v9M3.75 12l3-4.5M13.5 12L21 7.5" />
    </svg>
  ),
  prospect: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.105a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.678 0-5.216-.5-7.499-1.437m.979 1.953a7.5 7.5 0 0014.998 0 17.933 17.933 0 007.499-1.437m-.979-1.953a7.5 7.5 0 01-14.998 0 17.933 17.933 0 01-7.499-1.437" />
    </svg>
  ),
  vendeur: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.105a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.678 0-5.216-.5-7.499-1.437m.979 1.953a7.5 7.5 0 0014.998 0 17.933 17.933 0 007.499-1.437m-.979-1.953a7.5 7.5 0 01-14.998 0 17.933 17.933 0 01-7.499-1.437" />
    </svg>
  ),
  admin: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75h.008v.008h-.008v-.008z" />
    </svg>
  ),
  manager: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 3h16.5M3.75 21h16.5" />
    </svg>
  ),
  agent: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.105a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.678 0-5.216-.5-7.499-1.437m.979 1.953a7.5 7.5 0 0014.998 0 17.933 17.933 0 007.499-1.437m-.979-1.953a7.5 7.5 0 01-14.998 0 17.933 17.933 0 01-7.499-1.437" />
    </svg>
  ),
  viewer: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.18.07.362 0 .542-1.383 4.171-5.307 7.178-9.963 7.178C4.57 17.568 1.254 15.173.472 11.688.308 11.387.304 11.068.304 10.746l.012-.036a1 1 0 11.492-.873z" />
    </svg>
  ),
  villa: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
    </svg>
  ),
  appartement: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0 4.142-3.358 7.5-7.5 7.5a7.5 7.5 0 10-7.5-7.5H5.25m6.75-3.75h-3m3 3v-3m-6 6h12a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  terrain: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 16.5V3m0 0a2.25 2.25 0 012.25-2.25m0 0a2.25 2.25 0 012.25 2.25m0 0v12.75m0-12.75h16.5m-16.5 0H3" />
    </svg>
  ),
  local: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21.75v-1.5a2.25 2.25 0 00-2.25-2.25h-3A2.25 2.25 0 0012 18.75v3m6.75-10.5a2.25 2.25 0 00-2.25-2.25H9.75A2.25 2.25 0 007.5 10.5h.75a2.25 2.25 0 012.25 2.25v.75m2.25 1.5a2.25 2.25 0 010 3h1.5a2.25 2.25 0 010-3m-10.5-3l1.5 1.5m0 0l2.25 2.25M12 10.5l1.5 1.5M16.5 8.25L15 6.75" />
    </svg>
  ),
  bureau: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5M3.75 15h16.5M5.25 3h13.5A2.25 2.25 0 0121 5.25v13.5A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75V5.25A2.25 2.25 0 015.25 3z" />
    </svg>
  ),
  hotel: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3v8.25a3 3 0 01-3 3H6a3 3 0 01-3-3V8.25a3 3 0 013-3h1.5m1.5 0H9m3 0h3m-.75 4.5a5.25 5.25 0 00-5.25 5.25v1.5a5.25 5.25 0 005.25 5.25h1.5a5.25 5.25 0 005.25-5.25v-1.5A5.25 5.25 0 0015 9.75h-1.5z" />
    </svg>
  ),
  autre: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 6.594l-1.263 1.263a1.5 1.5 0 11-2.122-2.122l2.526-2.526A1.5 1.5 0 0110.878 4.5l-2.526 2.526a1.5 1.5 0 01-2.122-2.122l1.263-1.263A1.5 1.5 0 018.354 3l-1.263 1.263A1.5 1.5 0 016.5 5.122V8.5a1.5 1.5 0 01-3 0V5.122A1.5 1.5 0 016.5 2.25l1.263 1.263a1.5 1.5 0 012.122 2.122l-2.526 2.526a1.5 1.5 0 01-2.122 2.122l1.263 1.263A1.5 1.5 0 018.354 9.5V14.5a1.5 1.5 0 01-3 0V9.5a1.5 1.5 0 012.122-2.122l2.526-2.526a1.5 1.5 0 012.122 2.122l-1.263 1.263A1.5 1.5 0 018.354 15.5V19.5a1.5 1.5 0 01-3 0V9.5a1.5 1.5 0 012.122-2.122l2.526-2.526a1.5 1.5 0 012.122 2.122l-1.263 1.263A1.5 1.5 0 018.354 21.5V24a1.5 1.5 0 01-3 0v-5.5a1.5 1.5 0 012.122-2.122l2.526-2.526a1.5 1.5 0 012.122 2.122l-1.263 1.263A1.5 1.5 0 018.354 18.5V20.5a1.5 1.5 0 01-3 0V14.5a1.5 1.5 0 012.122-2.122l2.526-2.526a1.5 1.5 0 012.122 2.122l-1.263 1.263A1.5 1.5 0 018.354 12.5V9.5z" />
    </svg>
  ),
};

export function TypeIcon({ type, className = 'w-4 h-4' }: TypeIconProps) {
  return iconMap[type] || <span className={className} />;
}

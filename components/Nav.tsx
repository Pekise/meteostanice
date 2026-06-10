'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/',         label: 'Domů',   icon: '🏠' },
  { href: '/stanice',  label: 'Stanice', icon: '📡' },
  { href: '/radar',    label: 'Radar',   icon: '🌧' },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-around items-center h-16 sm:relative sm:border-t-0 sm:border-b sm:h-14 sm:px-6 sm:justify-start sm:gap-6">
      {links.map(l => (
        <Link key={l.href} href={l.href}
          className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium px-3 py-1 rounded-lg transition-all
            ${path === l.href ? 'text-blue-600' : 'text-gray-400 hover:text-gray-700'}`}>
          <span className="text-lg sm:text-base">{l.icon}</span>
          <span>{l.label}</span>
        </Link>
      ))}
      <div className="hidden sm:flex ml-auto text-xs text-gray-300 font-mono items-center">
        Meteorologická stanice · Ostrava
      </div>
    </nav>
  );
}

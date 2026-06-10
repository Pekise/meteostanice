import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Meteorologická stanice — Ostrava',
  description: 'Živá data z meteorologické stanice Vevor YT60307',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body className="bg-gray-100 min-h-screen pb-16 sm:pb-0">
        <Nav />
        {children}
      </body>
    </html>
  );
}

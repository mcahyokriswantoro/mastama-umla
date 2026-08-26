import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';

export const metadata: Metadata = {
  title: 'Digital Student Passport — MASTAMA UMLA 2026',
  description: 'Aplikasi resmi Digital Student Passport Universitas Muhammadiyah Lamongan (UMLA). Your Journey Starts Here.',
  keywords: ['MASTAMA UMLA', 'Digital Student Passport', 'UMLA 2026', 'Muhammadiyah Lamongan', 'Student Journey'],
  icons: {
    icon: [
      { url: '/logo-mastama.png', type: 'image/png' },
      { url: '/icon.png', type: 'image/png' }
    ],
    shortcut: '/logo-mastama.png',
    apple: '/logo-mastama.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="antialiased min-h-screen flex flex-col selection:bg-umla-gold selection:text-umla-navy-950">
        <Navbar />
        <main className="flex-1 pb-20 md:pb-10">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Target, Award, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on auth pages and admin/mentor desktop workflows
  if (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/' ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/mentor')
  ) {
    return null;
  }

  const navItems = [
    { label: 'Home', href: '/dashboard', icon: Home },
    { label: 'Journey', href: '/journey', icon: Compass },
    { label: 'Missions', href: '/missions', icon: Target },
    { label: 'Passport', href: '/passport', icon: Award, highlight: true },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-umla-navy-950/95 backdrop-blur-lg border-t border-umla-gold/25 px-2 py-2 shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center relative -top-3 group"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                  isActive
                    ? 'bg-gradient-to-tr from-umla-gold-600 via-umla-gold to-yellow-200 text-umla-navy-950 ring-4 ring-umla-navy-950 shadow-umla-gold/40'
                    : 'bg-umla-navy-800 text-umla-gold border-2 border-umla-gold/50 shadow-black/40'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-bold mt-1 tracking-tight ${isActive ? 'text-umla-gold' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-umla-gold font-bold scale-105' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

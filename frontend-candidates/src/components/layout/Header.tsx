"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MobileMenu from './MobileMenu';

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Về chúng tôi', href: '/#about' },
    { label: 'Sản phẩm & Giải pháp', href: '/#products' },
    { label: 'Công nghệ', href: '/#tech' },
    { label: 'Sự nghiệp', href: '/#careers' },
    { label: 'Tin tức', href: '/#news' },
    { label: 'Liên hệ', href: '/#footer' },
    { label: 'Tuyển dụng', href: '/jobs' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-900/50 bg-slate-950/80 backdrop-blur-md text-white">
      <div className="mx-auto flex max-w-7xl h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-base shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            TC
          </span>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors duration-200">
            Talent<span className="text-blue-500">Core</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 text-[13px] xl:text-sm font-semibold">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/jobs' && pathname?.startsWith('/jobs'));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <Link
            href="/login"
            className="flex h-10 items-center justify-center rounded-lg bg-blue-600 px-5 text-[13px] xl:text-sm font-bold text-white hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-200 whitespace-nowrap"
          >
            Đăng nhập
          </Link>
        </div>

        {/* Mobile Actions & Menu */}
        <div className="flex lg:hidden items-center">
          <MobileMenu navItems={navItems} />
        </div>
      </div>
    </header>
  );
}

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/src/providers/AuthProvider';
import { LogOut, User, ChevronDown, BookCheck } from 'lucide-react';
import MobileMenu from './MobileMenu';
import userImage from '../../../public/user.png'
import Image from 'next/image';

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Về chúng tôi', href: '/#about' },
    { label: 'Sản phẩm & Giải pháp', href: '/#products' },
    { label: 'Sự nghiệp', href: '/#careers' },
    { label: 'Tin tức', href: '/#news' },
    { label: 'Tuyển dụng', href: '/jobs' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-all duration-300 ease-in-out text-white ${
        isScrolled
          ? 'border-slate-800/80 bg-slate-950/95 backdrop-blur-xl shadow-xl shadow-black/20'
          : 'border-slate-900/50 bg-slate-950/80 backdrop-blur-md'
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300 ease-in-out ${
          isScrolled ? 'h-14 sm:h-16' : 'h-20'
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span
            className={`rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-extrabold shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all duration-300 ${
              isScrolled ? 'w-8 h-8 text-sm' : 'w-9 h-9 text-base'
            }`}
          >
            TC
          </span>
          <span
            className={`font-bold tracking-tight text-white group-hover:text-blue-400 transition-all duration-300 ${
              isScrolled ? 'text-lg' : 'text-xl'
            }`}
          >
            Talent<span className="text-blue-500">Core</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 text-[13px] xl:text-sm font-semibold">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === '/jobs' && pathname?.startsWith('/jobs'));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 transition-all duration-200 whitespace-nowrap rounded-lg ${
                  isScrolled ? 'py-1.5' : 'py-2'
                } ${
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
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-2 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer ${
                  isScrolled ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
                }`}
              >
                <Image
                  src={userImage}
                  alt="User avatar"
                  width={80}
                  height={80}
                  className={`rounded-2xl object-cover shadow-md shadow-blue-500/20 shrink-0 transition-all duration-300 ${
                    isScrolled ? 'w-7 h-7' : 'w-8 h-8'
                  }`}
                />
                <span className="font-medium text-slate-200 max-w-[120px] truncate">
                  {user.email}
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-white truncate">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    href="/user/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800/70 hover:text-blue-400 transition-colors"
                  >
                    <User size={14} className="text-slate-400" />
                    <span>Hồ sơ của tôi</span>
                  </Link>

                  <Link
                    href="/user/applications"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800/70 hover:text-blue-400 transition-colors"
                  >
                    <BookCheck size={14} className="text-slate-400" />
                    <span>Công việc đã ứng tuyển</span>
                  </Link>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer border-t border-slate-800"
                  >
                    <LogOut size={14} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className={`flex items-center justify-center rounded-lg bg-blue-600 font-bold text-white hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-200 whitespace-nowrap ${
                isScrolled ? 'h-8 px-4 text-xs' : 'h-10 px-5 text-[13px] xl:text-sm'
              }`}
            >
              Đăng nhập
            </Link>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex lg:hidden items-center">
          <MobileMenu navItems={navItems} />
        </div>
      </div>
    </header>
  );
}
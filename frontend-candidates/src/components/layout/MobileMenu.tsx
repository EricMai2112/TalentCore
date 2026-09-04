'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, ArrowRight, User, BookCheck, LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/src/providers/AuthProvider';
import userImage from '../../../public/user.png';

interface NavItem {
  label: string;
  href: string;
}

interface MobileMenuProps {
  navItems: NavItem[];
}

export default function MobileMenu({ navItems }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const drawerContent = (
    <div className="fixed inset-0 z-[9999] lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
        onClick={() => setIsOpen(false)}
      />

      {/* Panel Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-slate-950 text-white border-l border-slate-900 p-6 shadow-2xl z-[10000] flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-900">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="text-xl font-bold tracking-tight text-white flex items-center gap-2"
            >
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-blue-500/20">
                TC
              </span>
              Talent<span className="text-blue-500">Core</span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-3.5 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-900/80 rounded-xl transition-all"
              >
                <span>{item.label}</span>
                <ArrowRight className="w-4 h-4 text-slate-600" />
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Account & Actions */}
        <div className="flex flex-col gap-3 pt-6 mt-6 border-t border-slate-900">
          {user ? (
            <div className="space-y-3">
              {/* Account Header */}
              <div className="flex items-center gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl">
                <Image
                  src={userImage}
                  alt="User avatar"
                  width={80}
                  height={80}
                  className="w-10 h-10 rounded-2xl object-cover shadow-md shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-400">Tài khoản</p>
                  <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                </div>
              </div>

              {/* Profile Link */}
              <Link
                href="/user/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-sm font-semibold text-slate-200 hover:text-blue-400 hover:bg-slate-900 transition-all"
              >
                <User size={18} className="text-blue-400" />
                <span>Hồ sơ của tôi</span>
              </Link>

              {/* Applied Jobs Link */}
              <Link
                href="/user/applications"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-sm font-semibold text-slate-200 hover:text-blue-400 hover:bg-slate-900 transition-all"
              >
                <BookCheck size={18} className="text-blue-400" />
                <span>Công việc đã ứng tuyển</span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-sm font-bold transition-all cursor-pointer"
              >
                <LogOut size={16} />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center h-12 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-sm font-bold shadow-lg shadow-blue-500/20 transition-all"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="lg:hidden">
      {/* Menu Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer"
        aria-label="Toggle Menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Slide-out Drawer via React Portal */}
      {isOpen && mounted && createPortal(drawerContent, document.body)}
    </div>
  );
}

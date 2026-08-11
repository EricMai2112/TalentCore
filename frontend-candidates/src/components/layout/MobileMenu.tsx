'use client';

import { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface NavItem {
  label: string;
  href: string;
}

interface MobileMenuProps {
  navItems: NavItem[];
}

export default function MobileMenu({ navItems }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      {/* Menu Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
        aria-label="Toggle Menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Slide-out Drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-slate-950 border-l border-slate-900 p-6 shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-900">
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-brand-blue/30">
                    TC
                  </span>
                  TalentCore
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Links */}
              <nav className="mt-8 flex flex-col gap-1.5">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-4 py-3.5 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-900/60 rounded-xl transition-all"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white" />
                  </Link>
                ))}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-3 pt-6 border-t border-slate-900">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center h-12 rounded-xl bg-brand-blue text-white hover:bg-blue-700 text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import React from 'react';

export interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export default function GlassBadge({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}: GlassBadgeProps) {
  const baseClasses =
    'inline-flex items-center font-bold rounded-full backdrop-blur-xs transition-all border';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  const variantClasses = {
    primary: 'bg-[#1261A6]/15 text-[#1261A6] border-[#1261A6]/30',
    secondary: 'bg-[#126DA6]/15 text-[#126DA6] border-[#126DA6]/30',
    accent: 'bg-[#2A95BF]/15 text-[#1261A6] border-[#2A95BF]/35',
    success: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-700 border-rose-500/30',
    info: 'bg-sky-500/15 text-sky-700 border-sky-500/30',
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}

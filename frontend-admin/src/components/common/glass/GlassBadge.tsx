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
    md: 'px-2.5 py-1 text-[11px]',
  };

  const variantClasses = {
    primary: 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30',
    secondary: 'bg-white/60 text-[#334155] border-white/80',
    accent: 'bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30',
    violet: 'bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30',
    cyan: 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/30',
    teal: 'bg-[#14B8A6]/15 text-[#14B8A6] border-[#14B8A6]/30',
    success: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
    warning: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',
    danger: 'bg-rose-500/15 text-rose-700 border-rose-500/30',
    info: 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30',
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}

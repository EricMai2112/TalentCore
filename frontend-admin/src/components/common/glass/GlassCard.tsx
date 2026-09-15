'use client';

import React from 'react';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'hover' | 'solid' | 'primary';
  className?: string;
}

export default function GlassCard({
  children,
  variant = 'default',
  className = '',
  ...props
}: GlassCardProps) {
  const baseClasses = 'rounded-3xl transition-all duration-300 relative overflow-hidden';
  
  const variantClasses = {
    default:
      'bg-white/75 backdrop-blur-md border border-white/85 shadow-md shadow-[#1261A6]/5',
    hover:
      'bg-white/75 backdrop-blur-md border border-white/85 shadow-md shadow-[#1261A6]/5 hover:bg-white/90 hover:border-[#2A95BF]/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#1261A6]/12 cursor-pointer',
    solid:
      'bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-lg shadow-slate-900/5',
    primary:
      'bg-gradient-to-br from-[#1261A6] via-[#126DA6] to-[#2A95BF] text-white backdrop-blur-xl border border-white/20 shadow-xl shadow-[#1261A6]/25',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}

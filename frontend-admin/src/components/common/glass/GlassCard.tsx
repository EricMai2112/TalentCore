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
      'bg-white/55 backdrop-blur-md border border-white/65 shadow-md shadow-blue-500/5',
    hover:
      'bg-white/55 backdrop-blur-md border border-white/65 shadow-md shadow-blue-500/5 hover:bg-white/80 hover:border-white/85 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer',
    solid:
      'bg-white/80 backdrop-blur-xl border border-white/90 shadow-lg shadow-slate-900/5',
    primary:
      'bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#06B6D4] text-white backdrop-blur-xl border border-white/30 shadow-xl shadow-purple-500/25',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}

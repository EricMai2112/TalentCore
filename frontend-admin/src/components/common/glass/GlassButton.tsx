'use client';

import React from 'react';

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export default function GlassButton({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}: GlassButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none gap-2';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  const variantClasses = {
    primary:
      'bg-[#1261A6] text-white hover:bg-[#126DA6] shadow-md shadow-[#1261A6]/25 hover:shadow-lg hover:shadow-[#1261A6]/35 border border-white/20',
    secondary:
      'bg-white/70 backdrop-blur-md text-[#1261A6] border border-white/80 hover:bg-white hover:border-[#2A95BF]/40 shadow-xs text-slate-800',
    accent:
      'bg-[#2A95BF] text-white hover:bg-[#217a9e] shadow-md shadow-[#2A95BF]/30 border border-white/20',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/25 border border-white/20',
    ghost:
      'bg-transparent text-slate-700 hover:bg-white/50 hover:backdrop-blur-sm border border-transparent hover:border-white/60',
  };

  return (
    <button
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'gradient' | 'outline' | 'danger' | 'ghost' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode | React.ElementType;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export default function CustomButton({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  fullWidth = false,
  ...props
}: CustomButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-bold transition-all duration-200 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none gap-2 select-none';

  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs rounded-xl',
    md: 'px-4.5 py-2.5 text-xs sm:text-sm rounded-2xl',
    lg: 'px-6 py-3.5 text-sm sm:text-base rounded-2xl',
  };

  const variantClasses = {
    primary:
      'bg-[#3B82F6] text-white hover:bg-[#1D4ED8] shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 border border-white/20',
    gradient:
      'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white hover:opacity-95 shadow-md shadow-purple-500/30 hover:shadow-lg hover:shadow-purple-500/40 border border-white/30',
    secondary:
      'bg-white/55 backdrop-blur-md text-[#3B82F6] border border-white/65 hover:bg-white/80 hover:text-[#1D4ED8] shadow-xs',
    accent:
      'bg-[#06B6D4] text-white hover:bg-[#0891b2] shadow-md shadow-cyan-500/30 border border-white/20',
    outline:
      'bg-transparent text-[#3B82F6] border border-[#3B82F6]/40 hover:bg-[#3B82F6]/10 hover:border-[#3B82F6]',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/25 border border-white/20',
    warning:
      'bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/25 border border-white/20',
    ghost:
      'bg-slate-700/5 text-slate-700 hover:bg-slate-700/10 hover:text-slate-900 border border-transparent',
  };

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return <span className="shrink-0">{icon}</span>;
    const IconComponent = icon as React.ElementType;
    const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;
    return <IconComponent size={iconSize} className="shrink-0" />;
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="animate-spin shrink-0" />
      ) : (
        renderIcon()
      )}
      <span>{children}</span>
    </button>
  );
}

'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'danger' | 'ghost';
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
      'bg-[#1261A6] text-white hover:bg-[#126DA6] shadow-md shadow-[#1261A6]/25 hover:shadow-lg hover:shadow-[#1261A6]/35 border border-white/20',
    secondary:
      'bg-white/80 backdrop-blur-md text-[#1261A6] border border-[#1261A6]/30 hover:bg-white hover:border-[#1261A6] hover:text-[#0e4e85] shadow-xs',
    accent:
      'bg-[#2A95BF] text-white hover:bg-[#217a9e] shadow-md shadow-[#2A95BF]/30 border border-white/20',
    outline:
      'bg-transparent text-[#1261A6] border border-[#1261A6]/40 hover:bg-[#1261A6]/10 hover:border-[#1261A6]',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/25 border border-white/20',
    ghost:
      'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-transparent',
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

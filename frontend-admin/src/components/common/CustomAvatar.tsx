'use client';

import React, { useState } from 'react';

export interface CustomAvatarProps {
  name?: string;
  src?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'rounded-lg' | 'rounded-xl' | 'rounded-2xl' | 'rounded-full';
  className?: string;
}

export function getAvatarInitial(name?: string): string {
  if (!name) return 'U';
  const trimmed = name.trim();
  if (!trimmed) return 'U';
  // Strip leading non-alphabetic/punctuation like "(", "[", etc.
  const cleaned = trimmed.replace(/^[^a-zA-Z0-9\u00C0-\u024F\u1EA0-\u1EF9]+/, '');
  return (cleaned.charAt(0) || trimmed.charAt(0) || 'U').toUpperCase();
}

const SIZE_CLASSES: Record<NonNullable<CustomAvatarProps['size']>, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-2xs',
  md: 'w-9 h-9 text-xs',
  lg: 'w-10 h-10 text-sm',
  xl: 'w-12 h-12 text-base',
};

export const CustomAvatar: React.FC<CustomAvatarProps> = ({
  name = '',
  src,
  size = 'md',
  rounded = 'rounded-xl',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const initial = getAvatarInitial(name);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  const hasValidImage = Boolean(src && !imgError);

  return (
    <div
      title={name || undefined}
      className={`relative flex items-center justify-center font-bold text-white shrink-0 overflow-hidden shadow-2xs select-none ${sizeClass} ${rounded} ${
        hasValidImage ? 'bg-slate-100' : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
      } ${className}`}
    >
      {hasValidImage ? (
        <img
          src={src!}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
};

export default CustomAvatar;

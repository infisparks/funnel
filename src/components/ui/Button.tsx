'use client';

import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  style,
  disabled,
  ...props
}: ButtonProps) {
  const { accentColor } = useTheme();

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-base rounded-xl gap-2.5',
  };

  const baseClasses =
    'inline-flex items-center justify-center font-semibold transition-all duration-200 active:scale-98 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none';

  if (variant === 'primary') {
    return (
      <button
        className={`${baseClasses} ${sizeClasses[size]} text-white shadow-2xs hover:opacity-90 ${className}`}
        style={{ backgroundColor: accentColor.primary, ...style }}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }

  if (variant === 'secondary') {
    return (
      <button
        className={`${baseClasses} ${sizeClasses[size]} hover:opacity-90 ${className}`}
        style={{
          backgroundColor: accentColor.light,
          color: accentColor.primary,
          ...style,
        }}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }

  if (variant === 'outline') {
    return (
      <button
        className={`${baseClasses} ${sizeClasses[size]} border border-[#E5E7EB] bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-300 shadow-2xs ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }

  if (variant === 'danger') {
    return (
      <button
        className={`${baseClasses} ${sizeClasses[size]} bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }

  if (variant === 'success') {
    return (
      <button
        className={`${baseClasses} ${sizeClasses[size]} bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }

  // Ghost
  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
}

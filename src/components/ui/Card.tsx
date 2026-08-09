'use client';

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  children?: React.ReactNode;
}

export function Card({
  title,
  subtitle,
  action,
  padding = 'md',
  interactive = false,
  children,
  className = '',
  style,
  ...props
}: CardProps) {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      style={style}
      className={`bg-white border border-[#E5E7EB] rounded-2xl shadow-2xs transition-all duration-200 ${
        paddingClasses[padding]
      } ${
        interactive
          ? 'cursor-pointer hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5'
          : ''
      } ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-gray-100">
          <div>
            {title && (
              <h3 className="font-bold text-base sm:text-lg text-[#111827]">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

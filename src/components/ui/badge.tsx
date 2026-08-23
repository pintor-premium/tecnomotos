import React, { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export function Badge({
  children,
  className = '',
  variant = 'neutral',
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-wider skew-x-[-6deg]';

  const variants = {
    success: 'bg-green-950/80 text-green-400 border border-green-800/40',
    warning: 'bg-yellow-950/80 text-yellow-500 border border-yellow-800/40',
    danger: 'bg-red-950/80 text-brand-red border border-brand-red/40',
    info: 'bg-blue-950/80 text-blue-400 border border-blue-800/40',
    neutral: 'bg-brand-darkgrey text-brand-silver border border-brand-grey/25',
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      <span className="skew-x-[6deg]">{children}</span>
    </span>
  );
}

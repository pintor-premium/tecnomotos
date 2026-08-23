import React, { ButtonHTMLAttributes } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled,
  href,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200 outline-none skew-x-[-6deg] focus:ring-1 focus:ring-brand-red disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-brand-red text-white hover:bg-brand-darkred shadow-[0_4px_12px_rgba(225,6,0,0.3)] hover:shadow-[0_4px_16px_rgba(225,6,0,0.5)] border border-brand-red',
    secondary: 'bg-brand-darkgrey text-brand-silver border border-brand-grey/30 hover:border-brand-red hover:text-white',
    danger: 'bg-brand-darkred text-white hover:bg-red-800 border border-brand-darkred',
    ghost: 'bg-transparent text-brand-grey hover:text-white hover:bg-white/5',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };

  const combinedClasses = cn(baseStyles, variants[variant], sizes[size], className);

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        <span className="skew-x-[6deg] inline-flex items-center gap-2">{children}</span>
      </Link>
    );
  }

  return (
    <button
      className={combinedClasses}
      disabled={disabled}
      {...props}
    >
      <span className="skew-x-[6deg] inline-flex items-center gap-2">{children}</span>
    </button>
  );
}

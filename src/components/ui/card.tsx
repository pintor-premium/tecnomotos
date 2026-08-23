import React, { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  withStripe?: boolean;
  telemetryBg?: boolean;
}

export function Card({
  children,
  className = '',
  hoverEffect = false,
  withStripe = false,
  telemetryBg = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-brand-card border border-brand-grey/15 text-white p-6 relative overflow-hidden transition-all duration-300 shadow-2xl',
        hoverEffect && 'hover:border-brand-red/40 hover:shadow-[0_0_15px_rgba(225,6,0,0.1)]',
        withStripe && 'border-l-4 border-l-brand-red',
        telemetryBg && 'telemetry-grid',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

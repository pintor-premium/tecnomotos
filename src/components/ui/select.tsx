import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, options, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1 text-left">
        {label && (
          <label className="text-xs uppercase font-mono tracking-widest text-brand-grey font-bold">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full bg-brand-darkgrey text-white border border-brand-grey/20 py-2.5 px-4 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red transition-all duration-200 cursor-pointer font-sans appearance-none',
            error && 'border-brand-red focus:ring-brand-red',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-brand-black text-white">
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-xs text-brand-red font-mono mt-0.5 font-semibold">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

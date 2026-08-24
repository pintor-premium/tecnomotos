import React, { InputHTMLAttributes, forwardRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Search, Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isSearch?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, isSearch = false, type = 'text', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full flex flex-col gap-1 text-left">
        {label && (
          <label className="text-xs uppercase font-mono tracking-widest text-brand-grey font-bold">
            {label}
          </label>
        )}
        <div className="relative">
          {isSearch && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-grey">
              <Search className="h-4 w-4" />
            </div>
          )}
          <input
            type={inputType}
            ref={ref}
            className={cn(
              'w-full bg-brand-darkgrey text-white border border-brand-grey/20 py-2.5 px-4 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red transition-all duration-200 placeholder-brand-grey/50 font-sans',
              isSearch && 'pl-9',
              isPassword && 'pr-10',
              error && 'border-brand-red focus:ring-brand-red',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-grey hover:text-white cursor-pointer select-none"
            >
              {showPassword ? (
                <EyeOff className="h-4.5 w-4.5" />
              ) : (
                <Eye className="h-4.5 w-4.5" />
              )}
            </button>
          )}
        </div>
        {error && (
          <span className="text-xs text-brand-red font-mono mt-0.5 font-semibold">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

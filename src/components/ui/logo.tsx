import React from 'react';

interface LogoProps {
  compact?: boolean;
  light?: boolean;
  className?: string;
}

export function Logo({ compact = false, light = false, className = '' }: LogoProps) {
  // Define heights based on layout context
  const heightClass = compact ? 'h-7' : 'h-10';
  
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/logo.png"
        alt="TECNOMOTOS"
        className={`${heightClass} w-auto object-contain select-none`}
      />
    </div>
  );
}

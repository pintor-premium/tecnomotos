import React from 'react';
import Image from 'next/image';

interface LogoProps {
  compact?: boolean;
  className?: string;
}

export function Logo({ compact = false, className = '' }: LogoProps) {
  // Define heights based on layout context
  const heightClass = compact ? 'h-7' : 'h-10';
  
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/logo.png"
        alt="TECNOMOTOS"
        width={200}
        height={50}
        className={`${heightClass} w-auto object-contain select-none`}
        priority
      />
    </div>
  );
}
export type { LogoProps };

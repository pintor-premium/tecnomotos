import React from 'react';

interface LogoProps {
  compact?: boolean;
  light?: boolean;
  className?: string;
}

export function Logo({ compact = false, light = false, className = '' }: LogoProps) {
  // Color variables depending on light/dark mode
  const redColor = '#E10600';
  const textColor = light ? '#080808' : '#FFFFFF';
  const secondaryColor = light ? '#8C8C8C' : '#D9D9D9';

  if (compact) {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block ${className}`}
      >
        {/* Dynamic shape mimicking a motorcycle engine cylinder / speed wing */}
        {/* Aerodynamic background wing */}
        <path
          d="M10 30L90 10L75 75L10 90L10 30Z"
          fill="url(#compact-grad-bg)"
        />
        
        {/* Sharp racing arrow representing acceleration */}
        <path
          d="M30 45L80 25L55 60L30 65L30 45Z"
          fill={redColor}
        />
        
        {/* Foreground metallic accents */}
        <path
          d="M45 42L75 30L62 48L45 52V42Z"
          fill={secondaryColor}
        />

        <defs>
          <linearGradient id="compact-grad-bg" x1="10" y1="30" x2="75" y2="75" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1a1a1a" />
            <stop offset="1" stopColor="#080808" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon portion */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-10 h-10 shrink-0"
      >
        <path
          d="M10 30L90 10L75 75L10 90L10 30Z"
          fill="url(#full-grad-bg)"
        />
        <path
          d="M30 45L80 25L55 60L30 65L30 45Z"
          fill={redColor}
        />
        <path
          d="M45 42L75 30L62 48L45 52V42Z"
          fill={secondaryColor}
        />
        <defs>
          <linearGradient id="full-grad-bg" x1="10" y1="30" x2="75" y2="75" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1a1a1a" />
            <stop offset="1" stopColor="#080808" />
          </linearGradient>
        </defs>
      </svg>

      {/* Typography portion */}
      <div className="flex flex-col justify-center leading-none">
        <span
          className="font-black italic tracking-tighter text-2xl uppercase"
          style={{ color: textColor }}
        >
          TECNO
          <span style={{ color: redColor }}>MOTOS</span>
        </span>
        <span
          className="text-[9px] uppercase tracking-[0.25em] font-mono mt-0.5"
          style={{ color: secondaryColor }}
        >
          High Performance
        </span>
      </div>
    </div>
  );
}

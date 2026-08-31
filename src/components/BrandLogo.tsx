import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'icon' | 'mark' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  subtitle?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  subtitle
}) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-14'
  };

  const iconSizes = {
    sm: { w: 24, h: 28 },
    md: { w: 32, h: 36 },
    lg: { w: 40, h: 46 },
    xl: { w: 56, h: 64 }
  };

  if (variant === 'icon') {
    const dim = iconSizes[size];
    return (
      <svg
        id="estudy-brand-icon"
        width={dim.w}
        height={dim.h}
        viewBox="0 0 100 115"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
      >
        {/* Navy teardrop / pin body */}
        <path
          d="M50 0C22.3858 0 0 22.3858 0 50C0 72 25 96 46 112.5C48.3 114.3 51.7 114.3 54 112.5C75 96 100 72 100 50C100 22.3858 77.6142 0 50 0Z"
          fill="#052B66"
        />
        {/* Inner white rim circle */}
        <circle cx="50" cy="50" r="38" fill="white" />
        {/* Green inner circle */}
        <circle cx="50" cy="50" r="28" fill="#45CC42" />
        {/* White lowercase 'e' letter */}
        <path
          d="M50 35C41.7 35 35 41.7 35 50C35 58.3 41.7 65 50 65C55.5 65 60.2 62 62.8 57.5L56.5 54.5C55 57 52.8 58.5 50 58.5C45.8 58.5 42.5 55.5 41.8 51.5H64C64.3 50 64.5 48.5 64.5 47C64.5 40.5 58 35 50 35ZM42 46.5C42.8 42.8 46 40.2 50 40.2C54 40.2 57.2 42.8 58 46.5H42Z"
          fill="white"
        />
      </svg>
    );
  }

  return (
    <div id="estudy-brand-header-logo" className={`flex items-center gap-2 select-none ${className}`}>
      <div className="flex items-center">
        {/* Wordmark eSTUDY matching exact company brand typography */}
        <span className="font-extrabold text-2xl tracking-tighter leading-none flex items-center font-sans">
          <span className="text-[#45CC42] font-black text-3xl -mr-0.5 inline-block transform -translate-y-0.5">
            e
          </span>
          <span className="text-[#052B66] font-black tracking-tight text-2xl">
            STUDY
          </span>
        </span>
      </div>
      {subtitle && (
        <div className="flex items-center pl-2 border-l border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
};

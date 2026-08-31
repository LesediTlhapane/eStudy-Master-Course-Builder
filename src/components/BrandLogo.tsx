import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'icon' | 'mark' | 'white';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  subtitle?: string;
  invertText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  subtitle,
  invertText = false
}) => {
  const heightClasses = {
    xs: 'h-4 max-h-4',
    sm: 'h-5 max-h-5',
    md: 'h-6 max-h-6',
    lg: 'h-8 max-h-8',
    xl: 'h-10 max-h-10'
  };

  const iconDimClasses = {
    xs: 'w-5 h-5',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <img
          src="/assets/eSTUDY Icon_Blue & Green (1).jpg"
          alt="eSTUDY Icon"
          className={`${iconDimClasses[size]} object-contain rounded shadow-2xs`}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Full Wordmark Logo using the newly uploaded PNG
  const isDarkBg = variant === 'white' || invertText;

  return (
    <div id="estudy-brand-header-logo" className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className={`inline-flex items-center ${isDarkBg ? 'bg-white px-2 py-1 rounded-md shadow-xs border border-white/20' : ''}`}>
        <img
          src="/assets/New logo bright green (1).png"
          alt="eSTUDY Logo"
          className={`${heightClasses[size]} w-auto object-contain shrink-0`}
          referrerPolicy="no-referrer"
        />
      </div>
      {subtitle && (
        <div className={`flex items-center pl-2 border-l ${isDarkBg ? 'border-white/20' : 'border-slate-300'}`}>
          <span className={`text-[10px] font-bold tracking-wider uppercase ${isDarkBg ? 'text-slate-300' : 'text-slate-500'}`}>
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
};

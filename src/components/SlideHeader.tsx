import React from 'react';

interface SlideHeaderProps {
  sectionNumber: string;
  title: string;
  subtitle?: string;
  slideNumber?: string;
  totalSlides?: string;
  badgeText?: string;
}

export const SlideHeader: React.FC<SlideHeaderProps> = ({
  sectionNumber,
  title,
  subtitle,
  slideNumber,
  totalSlides = '39',
  badgeText
}) => {
  return (
    <div className="border-b border-slate-200 pb-5 space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl sm:text-3xl font-black font-mono text-[#052B66] bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
            {sectionNumber}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#052B66] tracking-tight">
                {title}
              </h1>
              {badgeText && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#45CC42]/20 text-[#052B66] border border-[#45CC42]/40">
                  {badgeText}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-600 font-normal mt-0.5 max-w-3xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {slideNumber && (
          <div className="text-xs font-mono text-slate-400 font-medium self-start sm:self-center shrink-0">
            Slide <span className="font-bold text-[#052B66]">{slideNumber}</span> / {totalSlides}
          </div>
        )}
      </div>

      {/* Iconic Green Accent Bar matching PowerPoint Slide Theme */}
      <div className="w-24 h-1 bg-[#45CC42] rounded-full mt-2" />
    </div>
  );
};

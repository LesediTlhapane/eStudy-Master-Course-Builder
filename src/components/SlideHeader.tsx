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
  badgeText
}) => {
  return (
    <div className="border-b border-slate-200 pb-5 space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center justify-center bg-[#052B66] text-[#45CC42] px-3.5 py-1.5 rounded-xl border border-[#042150] shadow-sm font-mono text-2xl sm:text-3xl font-black shrink-0">
            {sectionNumber}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-[#052B66] tracking-tight">
                {title}
              </h1>
              {badgeText && (
                <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-[#45CC42]/20 text-[#052B66] border border-[#45CC42]/50 shadow-xs">
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

        <div className="text-[11.5px] font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl self-start sm:self-center shrink-0">
          * All fields marked with a red star (*) are compulsory.
        </div>
      </div>

      {/* Iconic Green Accent Bar matching eStudy Theme */}
      <div className="w-28 h-1.5 bg-[#45CC42] rounded-full mt-2 shadow-[0_2px_8px_rgba(69,204,66,0.35)]" />
    </div>
  );
};

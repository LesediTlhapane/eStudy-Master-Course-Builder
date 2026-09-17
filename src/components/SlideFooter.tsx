import React from 'react';

interface SlideFooterProps {
  currentSlide?: string;
  totalSlides?: string;
  frameworkVersion?: string;
}

export const SlideFooter: React.FC<SlideFooterProps> = ({
  currentSlide,
  totalSlides = '39',
  frameworkVersion = 'v9.0'
}) => {
  return (
    <div className="pt-6 mt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 select-none font-sora">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#45CC42] shadow-[0_0_6px_rgba(69,204,66,0.6)]" />
        <span className="font-bold text-[#052B66]">eStudy South Africa</span>
        <span className="text-slate-300">·</span>
        <span className="font-medium text-slate-600">Master Course Generation Prompt Template {frameworkVersion}</span>
      </div>

      {currentSlide && (
        <div className="font-mono text-xs font-semibold bg-white px-2.5 py-1 rounded-md border border-slate-200 text-[#052B66] shadow-2xs">
          Slide {currentSlide} of {totalSlides}
        </div>
      )}
    </div>
  );
};

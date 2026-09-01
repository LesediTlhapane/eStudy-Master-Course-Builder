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
    <div className="pt-6 mt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 select-none">
      <div className="flex items-center gap-2">
        <span className="font-medium text-slate-600">eStudy South Africa</span>
        <span>·</span>
        <span>Master Course Generation Prompt Template {frameworkVersion}</span>
      </div>

      {currentSlide && (
        <div className="font-mono text-slate-500 font-medium">
          {currentSlide} / {totalSlides}
        </div>
      )}
    </div>
  );
};

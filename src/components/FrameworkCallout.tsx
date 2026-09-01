import React from 'react';
import { ShieldCheck, Sparkles, AlertCircle, Info } from 'lucide-react';

interface FrameworkCalloutProps {
  title?: string;
  requirement: string;
  variant?: 'requirement' | 'recommendation' | 'ethics' | 'ai';
  className?: string;
}

export const FrameworkCallout: React.FC<FrameworkCalloutProps> = ({
  title = 'Framework Requirement',
  requirement,
  variant = 'requirement',
  className = ''
}) => {
  const getColors = () => {
    switch (variant) {
      case 'ai':
        return {
          bg: 'bg-indigo-50/70 border-indigo-500 text-[#052B66]',
          icon: <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />,
          tag: 'bg-indigo-100 text-indigo-800'
        };
      case 'ethics':
        return {
          bg: 'bg-emerald-50/70 border-[#45CC42] text-[#052B66]',
          icon: <ShieldCheck className="w-4 h-4 text-[#45CC42] shrink-0 mt-0.5" />,
          tag: 'bg-[#45CC42]/20 text-[#052B66]'
        };
      case 'recommendation':
        return {
          bg: 'bg-amber-50/70 border-amber-400 text-slate-800',
          icon: <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />,
          tag: 'bg-amber-100 text-amber-800'
        };
      default:
        return {
          bg: 'bg-[#45CC42]/10 border-l-4 border-[#45CC42] text-[#052B66]',
          icon: <ShieldCheck className="w-4 h-4 text-[#45CC42] shrink-0 mt-0.5" />,
          tag: 'bg-[#45CC42]/20 text-[#052B66]'
        };
    }
  };

  const style = getColors();

  return (
    <div
      className={`p-3.5 rounded-lg border-l-4 ${style.bg} flex items-start gap-3 text-xs leading-relaxed ${className}`}
    >
      {style.icon}
      <div>
        <span className="font-bold tracking-tight mr-1.5">{title}:</span>
        <span className="font-medium text-slate-700">{requirement}</span>
      </div>
    </div>
  );
};

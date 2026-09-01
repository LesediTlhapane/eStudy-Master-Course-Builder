import React from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';

interface EditorialFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  example?: string;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  tag?: string;
  id?: string;
}

export const EditorialField: React.FC<EditorialFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  helperText,
  example,
  multiline = false,
  rows = 3,
  required = false,
  tag,
  id
}) => {
  // Format label into PowerPoint style bracket format if not already formatted
  const formattedLabel = label.startsWith('[') && label.endsWith(']') ? label : `[${label.toUpperCase()}]`;

  return (
    <div className="space-y-1.5" id={id}>
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-extrabold tracking-wider text-[#052B66] uppercase flex items-center gap-1.5">
          <span>{formattedLabel}</span>
          {required && <span className="text-red-500 font-normal">*</span>}
        </label>
        {tag && (
          <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            {tag}
          </span>
        )}
      </div>

      {helperText && (
        <p className="text-[11.5px] text-slate-500 leading-snug">
          {helperText}
        </p>
      )}

      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full text-xs font-normal text-slate-900 bg-white border border-slate-300 rounded-lg p-3 focus:border-[#052B66] focus:ring-1 focus:ring-[#052B66] outline-none transition-all placeholder:text-slate-400 leading-relaxed resize-y"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-xs font-normal text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2.5 focus:border-[#052B66] focus:ring-1 focus:ring-[#052B66] outline-none transition-all placeholder:text-slate-400"
        />
      )}

      {example && (
        <div className="text-[10.5px] text-slate-400 italic">
          <span className="font-semibold text-slate-500 not-italic">Example:</span> {example}
        </div>
      )}
    </div>
  );
};

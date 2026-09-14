import React, { useState } from 'react';
import { Sparkles, Check, RotateCcw, Edit2 } from 'lucide-react';

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
  requiredText?: string;
  tag?: string;
  id?: string;
  allowSkip?: boolean;
  defaultAiValue?: string;
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
  requiredText,
  tag,
  id,
  allowSkip = true,
  defaultAiValue
}) => {
  const [isEditingSkipped, setIsEditingSkipped] = useState(false);

  // Format label into PowerPoint style bracket format if not already formatted
  const formattedLabel = label.startsWith('[') && label.endsWith(']') ? label : `[${label.toUpperCase()}]`;
  const isSkipped = value && value.includes('[AI Auto-Complete');

  const handleSkip = () => {
    const aiDefault = defaultAiValue || `[AI Auto-Complete: AI engine will formulate optimal ${label.replace(/[\[\]]/g, '')} during course synthesis]`;
    onChange(aiDefault);
    setIsEditingSkipped(false);
  };

  const handleClearSkip = () => {
    onChange('');
    setIsEditingSkipped(true);
  };

  return (
    <div className="space-y-1.5 font-sora" id={id}>
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-extrabold tracking-wider text-[#052B66] uppercase flex items-center flex-wrap gap-1.5">
          <span>{formattedLabel}</span>
          {required && (
            <span className="text-red-500 font-bold text-xs">
              *{requiredText ? <span className="text-[10.5px] font-semibold ml-1">({requiredText})</span> : ''}
            </span>
          )}
        </label>

        <div className="flex items-center gap-2">
          {tag && (
            <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              {tag}
            </span>
          )}

          {allowSkip && !required && !isSkipped && (
            <button
              type="button"
              onClick={handleSkip}
              className="text-[10px] font-semibold text-slate-500 hover:text-[#052B66] hover:bg-[#45CC42]/10 px-2 py-0.5 rounded transition-all flex items-center gap-1 cursor-pointer"
              title="Skip this field if you don't know it. The AI engine will formulate it for you."
            >
              <Sparkles className="w-3 h-3 text-[#45CC42]" />
              <span>Skip (AI will formulate)</span>
            </button>
          )}
        </div>
      </div>

      {helperText && (
        <p className="text-[11.5px] text-slate-500 leading-snug">
          {helperText}
        </p>
      )}

      {isSkipped && !isEditingSkipped ? (
        <div className="p-3 bg-emerald-50/60 border border-[#45CC42]/40 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#052B66]">
            <span className="w-4 h-4 rounded-full bg-[#45CC42] text-white flex items-center justify-center text-[10px] font-bold">
              ✓
            </span>
            <span className="font-semibold">Skipped — AI will automatically formulate this section</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditingSkipped(true)}
              className="text-[11px] font-medium text-slate-600 hover:text-[#052B66] flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>Customize</span>
            </button>
            <button
              type="button"
              onClick={handleClearSkip}
              className="text-[11px] font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      ) : multiline ? (
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

      {example && !isSkipped && (
        <div className="text-[10.5px] text-slate-400 italic">
          <span className="font-semibold text-slate-500 not-italic">Example:</span> {example}
        </div>
      )}
    </div>
  );
};

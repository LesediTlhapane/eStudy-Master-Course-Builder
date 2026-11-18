import React, { useState } from 'react';
import { Sparkles, RotateCcw, Edit2, AlertTriangle, Check } from 'lucide-react';

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
  flaggedNote?: string;
  onConfirmFlag?: () => void;
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
  defaultAiValue,
  flaggedNote,
  onConfirmFlag
}) => {
  const [isEditingSkipped, setIsEditingSkipped] = useState(false);

  const formattedLabel = label.startsWith('[') && label.endsWith(']') ? label : `[${label.toUpperCase()}]`;
  const safeVal = typeof value === 'string' ? value : '';
  const isSkipped = Boolean(safeVal && safeVal.includes('[AI Auto-Complete'));

  const handleSetUnknownValue = (unknownText: string) => {
    onChange(unknownText);
    setIsEditingSkipped(true);
  };

  const handleClearSkip = () => {
    onChange('');
    setIsEditingSkipped(true);
  };

  return (
    <div className="space-y-1.5 font-sora" id={id}>
      <div className="flex items-center justify-between flex-wrap gap-1.5">
        <label className="text-[11px] font-extrabold tracking-wider text-[#052B66] uppercase flex items-center flex-wrap gap-1">
          <span>{formattedLabel}</span>
          {required && (
            <span className="text-red-600 font-extrabold text-sm leading-none" title="Compulsory field">
              *{requiredText ? <span className="text-[10.5px] font-semibold ml-1">({requiredText})</span> : ''}
            </span>
          )}
        </label>

        <div className="flex items-center flex-wrap gap-1.5">
          {tag && (
            <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              {tag}
            </span>
          )}

          {allowSkip && !isSkipped && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleSetUnknownValue('To Be Confirmed')}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-all cursor-pointer ${
                  safeVal === 'To Be Confirmed'
                    ? 'bg-[#052B66] text-white border-[#052B66]'
                    : 'text-slate-500 border-slate-200 bg-slate-50 hover:text-[#052B66] hover:border-[#052B66]/40'
                }`}
                title="Mark this field as 'To Be Confirmed' per the official eStudy template rules"
              >
                To Be Confirmed
              </button>
              <button
                type="button"
                onClick={() => handleSetUnknownValue('Requires SME/Stakeholder Validation')}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-all cursor-pointer ${
                  safeVal === 'Requires SME/Stakeholder Validation'
                    ? 'bg-[#052B66] text-white border-[#052B66]'
                    : 'text-slate-500 border-slate-200 bg-slate-50 hover:text-[#052B66] hover:border-[#052B66]/40'
                }`}
                title="Flag this item as requiring Subject Matter Expert or Stakeholder validation"
              >
                Requires SME Validation
              </button>
              {!required && (
                <button
                  type="button"
                  onClick={() => handleSetUnknownValue('Not Applicable — ')}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-all cursor-pointer ${
                    safeVal.startsWith('Not Applicable')
                      ? 'bg-[#052B66] text-white border-[#052B66]'
                      : 'text-slate-500 border-slate-200 bg-slate-50 hover:text-[#052B66] hover:border-[#052B66]/40'
                  }`}
                  title="Mark as Not Applicable and state a brief reason"
                >
                  Not Applicable
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {helperText && (
        <p className="text-[11.5px] text-slate-600 leading-snug">
          {helperText}
        </p>
      )}

      {flaggedNote && (
        <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg flex items-center justify-between gap-2 text-[11px] text-amber-900">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              <strong>Extracted from upload — Needs Confirmation:</strong> {flaggedNote}
            </span>
          </div>
          {onConfirmFlag && (
            <button
              type="button"
              onClick={onConfirmFlag}
              className="px-2 py-0.5 rounded bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-[10px] flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Check className="w-3 h-3" />
              <span>Confirm</span>
            </button>
          )}
        </div>
      )}

      {isSkipped && !isEditingSkipped ? (
        <div className="p-3 bg-emerald-50/60 border border-[#45CC42]/40 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#052B66]">
            <span className="w-4 h-4 rounded-full bg-[#45CC42] text-white flex items-center justify-center text-[10px] font-bold">
              ✓
            </span>
            <span className="font-semibold">Marked for AI Assistance — Click Customise to enter your own value</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditingSkipped(true)}
              className="text-[11px] font-medium text-slate-600 hover:text-[#052B66] flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>Customise</span>
            </button>
            <button
              type="button"
              onClick={handleClearSkip}
              className="text-[11px] font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      ) : multiline ? (
        <textarea
          value={safeVal}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full text-xs font-normal text-slate-900 bg-white border border-slate-300 rounded-lg p-3 focus:border-[#052B66] focus:ring-1 focus:ring-[#052B66] outline-none transition-all placeholder:text-slate-400 leading-relaxed resize-y"
        />
      ) : (
        <input
          type="text"
          value={safeVal}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-xs font-normal text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2.5 focus:border-[#052B66] focus:ring-1 focus:ring-[#052B66] outline-none transition-all placeholder:text-slate-400"
        />
      )}

      {example && !isSkipped && (
        <div className="text-[10.5px] text-slate-500 italic bg-slate-50/80 px-2.5 py-1.5 rounded border border-slate-200/70">
          <span className="font-semibold text-[#052B66] not-italic">Example:</span> {example}
        </div>
      )}
    </div>
  );
};

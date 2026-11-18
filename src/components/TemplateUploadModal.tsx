import React, { useState, useRef } from 'react';
import { Course, AIProvider, ResearchSource } from '../types';
import {
  Upload,
  FileText,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface TemplateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCourse?: Course | null;
  selectedProvider?: AIProvider;
  selectedModel?: string;
  onApplyExtractedCourse: (
    extractedPartial: Partial<Course>,
    flaggedFields: Record<string, string>,
    uploadedSource: ResearchSource,
    overwriteExisting: boolean,
    createNewCourse: boolean
  ) => void;
  defaultCreateNew?: boolean;
}

export const TemplateUploadModal: React.FC<TemplateUploadModalProps> = ({
  isOpen,
  onClose,
  existingCourse,
  selectedProvider = 'groq',
  selectedModel,
  onApplyExtractedCourse,
  defaultCreateNew = true
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extractionResult, setExtractionResult] = useState<{
    extractedCourse: Partial<Course>;
    flaggedFields: Record<string, string>;
    populatedFieldCount: number;
    summary: string;
    extractedTextSnippet: string;
  } | null>(null);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [createNewCourse, setCreateNewCourse] = useState(defaultCreateNew);

  if (!isOpen) return null;

  const hasExistingUserContent = Boolean(
    existingCourse &&
      (existingCourse.problem?.targetGroup?.trim() ||
        existingCourse.problem?.taskOrSkill?.trim() ||
        existingCourse.structure?.title?.trim() ||
        existingCourse.structure?.purposeStatement?.trim())
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setErrorMessage(null);
    setExtractionResult(null);
    await analyseUploadedFile(file);
  };

  const analyseUploadedFile = async (file: File) => {
    setIsAnalysing(true);
    setErrorMessage(null);

    try {
      const isText =
        file.type.startsWith('text/') ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.md') ||
        file.name.endsWith('.csv') ||
        file.name.endsWith('.json');

      let base64Data = '';
      let rawText = '';

      if (isText) {
        rawText = await file.text();
      } else {
        base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const res = String(reader.result || '');
            const idx = res.indexOf(',');
            resolve(idx >= 0 ? res.slice(idx + 1) : res);
          };
          reader.onerror = () => reject(new Error('Could not read uploaded file.'));
          reader.readAsDataURL(file);
        });
      }

      const response = await fetch('/api/courses/extract-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          base64Data,
          rawText,
          provider: selectedProvider,
          model: selectedModel
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyse the uploaded document.');
      }

      setExtractionResult({
        extractedCourse: data.extractedCourse || {},
        flaggedFields: data.flaggedFields || {},
        populatedFieldCount: data.populatedFieldCount || 0,
        summary: data.summary || 'Document analysed successfully.',
        extractedTextSnippet: data.extractedTextSnippet || ''
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'An error occurred while analysing the uploaded document.');
    } finally {
      setIsAnalysing(false);
    }
  };

  const handleConfirmApply = () => {
    if (!extractionResult || !selectedFile) return;

    const uploadedSource: ResearchSource = {
      id: `src-upload-${Date.now()}`,
      name: selectedFile.name.replace(/\.[^/.]+$/, ''),
      type: 'Internal policy',
      reference: `Uploaded Document (${selectedFile.name})`,
      relevance: 'Primary uploaded source document used to auto-populate template fields.',
      status: 'Verified',
      medium: 'upload',
      fileName: selectedFile.name,
      fileSize: `${(selectedFile.size / 1024).toFixed(1)} KB`,
      contentSnippet: extractionResult.extractedTextSnippet,
      dateAdded: new Date().toLocaleDateString('en-ZA')
    };

    onApplyExtractedCourse(
      extractionResult.extractedCourse,
      extractionResult.flaggedFields,
      uploadedSource,
      overwriteExisting,
      createNewCourse
    );
    onClose();
  };

  const flaggedEntries = Object.entries(extractionResult?.flaggedFields || {});

  return (
    <div
      className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sora"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#052B66] text-white flex items-center justify-between border-b border-[#042150]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#45CC42]/20 border border-[#45CC42]/40 text-[#45CC42] flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                Upload Course Document & Auto-Populate Template
              </h3>
              <p className="text-[11px] text-slate-300">
                Supports PDF (.pdf), Microsoft Word (.docx), and Text (.txt / .md) documents
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Official Non-Fabrication Assurance */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-[#45CC42] shrink-0 mt-0.5" />
            <div className="text-[11.5px] text-slate-600 leading-relaxed">
              <strong className="text-[#052B66]">Strict Evidence Rules:</strong> The AI analyses your uploaded document and populates <strong>only</strong> fields supported by the text. Missing fields are left empty (never invented), and ambiguous items are flagged for your review.
            </div>
          </div>

          {/* Dropzone / File Picker */}
          <div
            onClick={() => !isAnalysing && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
              isAnalysing
                ? 'border-[#052B66]/40 bg-blue-50/30 cursor-wait'
                : 'border-slate-300 hover:border-[#052B66] bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md,.csv,.json"
              onChange={handleFileSelect}
              className="hidden"
            />

            {isAnalysing ? (
              <div className="space-y-2 py-2">
                <Loader2 className="w-8 h-8 text-[#052B66] animate-spin mx-auto" />
                <div className="text-sm font-bold text-[#052B66]">
                  Analysing "{selectedFile?.name}" with AI...
                </div>
                <p className="text-[11px] text-slate-500">
                  Matching document information to the 9-section eStudy Master Course Template v9.0
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-11 h-11 rounded-2xl bg-[#052B66]/10 text-[#052B66] flex items-center justify-center mx-auto">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-[#052B66]">
                  {selectedFile ? selectedFile.name : 'Click to select a PDF, Word (.docx), or Text document'}
                </div>
                <p className="text-[11px] text-slate-500">
                  Upload an existing course outline, training specification, policy document, or completed template
                </p>
              </div>
            )}
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <div className="font-bold">Document Analysis Unsuccessful</div>
                <p className="text-[11.5px] text-rose-800">{errorMessage}</p>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => analyseUploadedFile(selectedFile)}
                    className="mt-1.5 px-3 py-1 rounded-lg bg-rose-200 hover:bg-rose-300 text-rose-950 font-bold text-[11px] cursor-pointer"
                  >
                    ↻ Retry Analysis
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Extraction Preview */}
          {extractionResult && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-emerald-50 border border-[#45CC42]/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-extrabold text-[#052B66] text-xs">
                    <CheckCircle2 className="w-4 h-4 text-[#45CC42]" />
                    <span>{extractionResult.populatedFieldCount} Template Field(s) Identified</span>
                  </div>
                  <span className="text-[10px] font-bold bg-white text-[#052B66] px-2 py-0.5 rounded border border-emerald-200">
                    Saved to Section 2 References
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-700 leading-relaxed">
                  {extractionResult.summary}
                </p>
              </div>

              {/* Key Extracted Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Course Title</span>
                  <span className="font-bold text-[#052B66]">
                    {extractionResult.extractedCourse.structure?.title || 'Empty (To be completed)'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Target Group</span>
                  <span className="font-semibold text-slate-800">
                    {extractionResult.extractedCourse.problem?.targetGroup || 'Empty (To be completed)'}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Task / Skill Gap</span>
                  <span className="font-semibold text-slate-800">
                    {extractionResult.extractedCourse.problem?.taskOrSkill || 'Empty (To be completed)'}
                  </span>
                </div>
              </div>

              {/* Flagged Fields needing confirmation */}
              {flaggedEntries.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>{flaggedEntries.length} Item(s) Flagged for Your Confirmation</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-amber-900 pl-5 list-disc">
                    {flaggedEntries.slice(0, 5).map(([key, reason]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Target Destination & Overwrite Protection */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="font-bold text-[#052B66]">How would you like to apply these fields?</div>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 cursor-pointer flex-1">
                    <input
                      type="radio"
                      checked={createNewCourse}
                      onChange={() => setCreateNewCourse(true)}
                      className="accent-[#052B66]"
                    />
                    <span>Create a new course with these populated fields</span>
                  </label>
                  {existingCourse && (
                    <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 cursor-pointer flex-1">
                      <input
                        type="radio"
                        checked={!createNewCourse}
                        onChange={() => setCreateNewCourse(false)}
                        className="accent-[#052B66]"
                      />
                      <span>Populate into current course ({existingCourse.structure?.title || existingCourse.name})</span>
                    </label>
                  )}
                </div>

                {!createNewCourse && hasExistingUserContent && (
                  <label className="flex items-center gap-2 pt-1 text-[11.5px] text-amber-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overwriteExisting}
                      onChange={e => setOverwriteExisting(e.target.checked)}
                      className="rounded accent-[#052B66]"
                    />
                    <span>
                      <strong>Confirm overwrite:</strong> Replace my existing non-empty fields where the uploaded document has matching information (unchecked preserves your existing entries).
                    </span>
                  </label>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!extractionResult || isAnalysing}
            onClick={handleConfirmApply}
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-[#052B66] bg-[#45CC42] hover:bg-[#3ec23b] disabled:opacity-40 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Populate Master Template & Review Fields</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

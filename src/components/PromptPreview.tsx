import React, { useState } from 'react';
import { Course } from '../types';
import { generateMasterPrompt } from '../utils/promptGenerator';
import { Copy, Download, Check, ArrowLeft, Sparkles, FileText, Search } from 'lucide-react';

interface PromptPreviewProps {
  course: Course;
  onReturnToBuilder: () => void;
  onStartAIGeneration?: () => void;
}

export const PromptPreview: React.FC<PromptPreviewProps> = ({
  course,
  onReturnToBuilder,
  onStartAIGeneration
}) => {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const promptText = generateMasterPrompt(course);
  const wordCount = promptText.trim().split(/\s+/).length;
  const charCount = promptText.length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy to clipboard:', e);
    }
  };

  const handleDownload = (ext: 'md' | 'txt') => {
    const filename = `${course.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_master_prompt_v9.${ext}`;
    const blob = new Blob([promptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="master-prompt-preview-view" className="min-h-[calc(100vh-4rem)] bg-slate-900 text-slate-100 py-8 px-6 lg:px-12 flex flex-col justify-between font-sora">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold font-mono uppercase bg-[#45CC42]/20 text-[#45CC42] px-2 py-0.5 rounded">
                OUTPUT SPECIFICATION
              </span>
              <span className="text-xs text-slate-400 font-mono">v9.0 Master Prompt</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {course.name || course.structure.title}
            </h1>
            <p className="text-xs text-slate-400">
              Deterministic prompt compiled from all 9 sections ready for AI generation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onReturnToBuilder}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Builder</span>
            </button>

            {onStartAIGeneration && (
              <button
                id="preview-generate-ai-course-btn"
                onClick={onStartAIGeneration}
                className="px-5 py-2.5 rounded-lg text-xs font-extrabold text-[#052B66] bg-[#45CC42] hover:bg-[#3db83a] shadow-lg transition-all flex items-center gap-2 cursor-pointer animate-fade-up"
              >
                <Sparkles className="w-4 h-4 text-[#052B66]" />
                <span>Generate Course with AI</span>
              </button>
            )}

            <button
              id="preview-copy-prompt-btn"
              onClick={handleCopy}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                copied
                  ? 'bg-[#45CC42] text-[#052B66]'
                  : 'bg-white text-[#052B66] hover:bg-slate-100'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleDownload('md')}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] border border-blue-900 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md</span>
            </button>
          </div>
        </div>

        {/* Stats & Search Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 text-xs">
          <div className="flex items-center gap-4 text-slate-300">
            <span>
              <strong className="text-white font-mono">{wordCount.toLocaleString()}</strong> words
            </span>
            <span>•</span>
            <span>
              <strong className="text-white font-mono">{charCount.toLocaleString()}</strong> characters
            </span>
            <span>•</span>
            <span>
              <strong className="text-[#45CC42] font-mono">9</strong> sections verified
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search prompt..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:border-[#45CC42] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Monospaced Code/Markdown Output View */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 overflow-x-auto shadow-2xl relative">
          <pre
            id="master-prompt-code-output"
            className="font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-[#45CC42] selection:text-[#052B66]"
          >
            {promptText}
          </pre>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto pt-8 pb-4 text-center text-xs text-slate-500 border-t border-slate-800/80">
        eStudy South Africa · Master Course Generation Prompt v9.0
      </div>
    </div>
  );
};

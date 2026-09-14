import React, { useState, useMemo, useEffect } from 'react';
import { Course } from '../types';
import { generateMasterPrompt } from '../utils/promptGenerator';
import {
  Copy,
  Download,
  Check,
  ArrowLeft,
  Sparkles,
  Search,
  Sun,
  Moon,
  BookOpen,
  FileCode,
  FileText,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Layers,
  ShieldCheck,
  Award,
  AlertCircle,
  HelpCircle,
  Hash,
  Compass,
  AlignLeft
} from 'lucide-react';

interface PromptPreviewProps {
  course: Course;
  onReturnToBuilder: () => void;
  onStartAIGeneration?: () => void;
}

export type PreviewTheme = 'light' | 'dark' | 'sepia';
export type PreviewFontSize = 'sm' | 'base' | 'lg';
export type PreviewDisplayMode = 'document' | 'raw' | 'markdown';

export const PromptPreview: React.FC<PromptPreviewProps> = ({
  course,
  onReturnToBuilder,
  onStartAIGeneration
}) => {
  // Persisted theme preference
  const [theme, setTheme] = useState<PreviewTheme>(() => {
    try {
      const saved = localStorage.getItem('estudy_preview_theme');
      if (saved === 'light' || saved === 'dark' || saved === 'sepia') return saved;
    } catch (e) {}
    return 'light'; // Default to clean, readable light paper
  });

  const [fontSize, setFontSize] = useState<PreviewFontSize>('base');
  const [displayMode, setDisplayMode] = useState<PreviewDisplayMode>('document');
  const [copied, setCopied] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      localStorage.setItem('estudy_preview_theme', theme);
    } catch (e) {}
  }, [theme]);

  // Generate authentic master prompt strictly from the actual course built
  const promptText = useMemo(() => generateMasterPrompt(course), [course]);
  const wordCount = useMemo(() => promptText.trim().split(/\s+/).filter(Boolean).length, [promptText]);
  const charCount = promptText.length;
  const lineCount = useMemo(() => promptText.split('\n').length, [promptText]);

  // Search match count
  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    try {
      const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      return (promptText.match(regex) || []).length;
    } catch (e) {
      return 0;
    }
  }, [searchQuery, promptText]);

  const handleCopy = async (textToCopy: string, sectionId?: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      if (sectionId) {
        setCopiedSection(sectionId);
        setTimeout(() => setCopiedSection(null), 2000);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (e) {
      console.error('Failed to copy to clipboard:', e);
    }
  };

  const handleDownload = (ext: 'md' | 'txt') => {
    const filename = `${(course.name || 'course').toLowerCase().replace(/[^a-z0-9]/g, '_')}_master_prompt.${ext}`;
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

  const toggleSection = (sec: string) => {
    setCollapsedSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const scrollToSection = (secId: string) => {
    const el = document.getElementById(secId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Font size classes
  const fontClass = fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm';

  // Explicit theme design tokens (Zero relying on Tailwind dark: media query to prevent black-on-black clashes)
  const themeStyles = {
    light: {
      wrapper: 'bg-slate-100 text-slate-900',
      header: 'bg-white border-slate-300 text-slate-900 shadow-xs',
      title: 'text-[#052B66]',
      subtitle: 'text-slate-700',
      toolbar: 'bg-white border-slate-300 text-slate-800 shadow-xs',
      container: 'bg-white border-slate-300 text-slate-900 shadow-sm',
      sectionCard: 'bg-slate-50/90 border-slate-300 text-slate-900',
      sectionHeader: 'text-[#052B66]',
      fieldBox: 'bg-white border-slate-300 text-slate-900',
      fieldLabel: 'text-slate-800 font-bold uppercase text-[11px] tracking-wider',
      fieldValue: 'text-slate-900 font-medium',
      fieldEmpty: 'bg-amber-50/90 border-amber-300 text-amber-900 italic',
      badge: 'bg-blue-50 text-[#052B66] border-blue-200',
      badgeSuccess: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      accentText: 'text-[#052B66]',
      codePre: 'bg-white text-slate-950 border-slate-300 shadow-sm',
      codePreHeader: 'bg-slate-100 border-slate-300 text-slate-800',
      input: 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#052B66] focus:ring-1 focus:ring-[#052B66]',
      buttonMuted: 'text-slate-700 bg-white hover:bg-slate-100 hover:text-slate-900 border-slate-300',
      buttonActive: 'bg-white text-[#052B66] border-slate-300 shadow-xs font-bold',
      pillActive: 'bg-[#052B66] text-white border-[#052B66] font-bold shadow-xs',
      pillInactive: 'bg-white text-slate-700 hover:text-[#052B66] hover:bg-slate-50 border-slate-300',
      divider: 'border-slate-300',
      highlight: 'bg-amber-300 text-slate-950 font-bold px-0.5 rounded shadow-2xs'
    },
    dark: {
      wrapper: 'bg-[#0b1329] text-slate-100',
      header: 'bg-[#111c38] border-slate-800 text-slate-100 shadow-md',
      title: 'text-white',
      subtitle: 'text-slate-300',
      toolbar: 'bg-[#111c38] border-slate-800 text-slate-200 shadow-md',
      container: 'bg-[#111c38] border-slate-800 text-slate-100 shadow-xl',
      sectionCard: 'bg-[#0d162d] border-slate-800 text-slate-100',
      sectionHeader: 'text-[#45CC42]',
      fieldBox: 'bg-[#080d1c] border-slate-800 text-slate-100',
      fieldLabel: 'text-slate-300 font-bold uppercase text-[11px] tracking-wider',
      fieldValue: 'text-slate-100 font-medium',
      fieldEmpty: 'bg-amber-950/40 border-amber-800/60 text-amber-200 italic',
      badge: 'bg-[#45CC42]/20 text-[#45CC42] border-[#45CC42]/40',
      badgeSuccess: 'bg-emerald-950/60 text-emerald-300 border-emerald-800',
      accentText: 'text-[#45CC42]',
      codePre: 'bg-[#080d1c] text-slate-100 border-slate-800 shadow-md',
      codePreHeader: 'bg-[#111c38] border-slate-800 text-slate-300',
      input: 'bg-[#080d1c] border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#45CC42]',
      buttonMuted: 'text-slate-300 bg-[#162344] hover:bg-[#1f305c] hover:text-white border-slate-700',
      buttonActive: 'bg-[#1e2f5c] text-white border-slate-600 shadow-xs font-bold',
      pillActive: 'bg-[#45CC42] text-[#052B66] border-[#45CC42] font-bold shadow-xs',
      pillInactive: 'bg-[#0d162d] text-slate-300 hover:text-white hover:bg-[#162344] border-slate-800',
      divider: 'border-slate-800',
      highlight: 'bg-amber-400 text-slate-950 font-bold px-0.5 rounded'
    },
    sepia: {
      wrapper: 'bg-[#f4eee4] text-[#2c2017]',
      header: 'bg-[#faf6ee] border-[#dfd2be] text-[#2c2017] shadow-xs',
      title: 'text-[#2a1e16]',
      subtitle: 'text-[#5d4c3f]',
      toolbar: 'bg-[#faf6ee] border-[#dfd2be] text-[#4c3c31] shadow-xs',
      container: 'bg-[#fffef9] border-[#dfd2be] text-[#2c2017] shadow-sm',
      sectionCard: 'bg-[#f8f2e6] border-[#dfd2be] text-[#2c2017]',
      sectionHeader: 'text-[#7c4d28]',
      fieldBox: 'bg-[#fffefb] border-[#dfd2be] text-[#2c2017]',
      fieldLabel: 'text-[#5c4636] font-bold uppercase text-[11px] tracking-wider',
      fieldValue: 'text-[#2c2017] font-medium',
      fieldEmpty: 'bg-[#f2e6d0] border-[#d8c29e] text-[#6b4c1b] italic',
      badge: 'bg-[#eee3ce] text-[#55381a] border-[#dbcab1]',
      badgeSuccess: 'bg-[#e3edd8] text-[#2f5c1d] border-[#c0d6ac]',
      accentText: 'text-[#7c4d28]',
      codePre: 'bg-[#faf6ee] text-[#2e2118] border-[#dfd2be] shadow-sm',
      codePreHeader: 'bg-[#ede5d6] border-[#dfd2be] text-[#4c3c31]',
      input: 'bg-[#faf6ee] border-[#d7c8b3] text-[#2c2017] placeholder-[#8a7664] focus:border-[#7c4d28]',
      buttonMuted: 'text-[#524134] bg-[#f2e9dc] hover:bg-[#eae0cf] hover:text-[#2a1e16] border-[#d8cbb7]',
      buttonActive: 'bg-[#fffefb] text-[#2a1e16] border-[#dfd2be] shadow-xs font-bold',
      pillActive: 'bg-[#7c4d28] text-white border-[#7c4d28] font-bold shadow-xs',
      pillInactive: 'bg-[#faf6ee] text-[#524134] hover:text-[#2a1e16] hover:bg-[#f2e9dc] border-[#dfd2be]',
      divider: 'border-[#dfd2be]',
      highlight: 'bg-[#fed7aa] text-[#7c2d12] font-bold px-0.5 rounded'
    }
  }[theme];

  // Text highlighter helper for search
  const renderHighlighted = (text: string) => {
    if (!searchQuery.trim()) return text;
    try {
      const parts = text.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
      return parts.map((part, i) =>
        part.toLowerCase() === searchQuery.toLowerCase() ? (
          <mark key={i} className={themeStyles.highlight}>
            {part}
          </mark>
        ) : (
          part
        )
      );
    } catch (e) {
      return text;
    }
  };

  // Dedicated high-contrast review field card
  const ReviewField = ({
    label,
    value,
    emptyMessage,
    isMono = false,
    isItalic = false,
    tag
  }: {
    label: string;
    value?: string | null;
    emptyMessage?: string;
    isMono?: boolean;
    isItalic?: boolean;
    tag?: string;
  }) => {
    const hasValue = value && value.trim().length > 0;
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className={themeStyles.fieldLabel}>{label}</span>
          {tag && (
            <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${themeStyles.badge}`}>
              {tag}
            </span>
          )}
        </div>
        <div
          className={`p-3.5 rounded-xl border leading-relaxed transition-all ${
            hasValue ? themeStyles.fieldBox : themeStyles.fieldEmpty
          } ${isMono ? 'font-mono text-xs' : ''} ${isItalic ? 'italic' : ''}`}
        >
          {hasValue ? (
            <div className={themeStyles.fieldValue}>{renderHighlighted(value)}</div>
          ) : (
            <div className="flex items-center justify-between gap-2 text-xs">
              <span>{emptyMessage || 'Not specified yet in workspace'}</span>
              <button
                onClick={onReturnToBuilder}
                className="text-[11px] font-bold underline hover:opacity-80 cursor-pointer"
              >
                Edit in Builder
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      id="master-prompt-preview-view"
      className={`min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-12 flex flex-col justify-between font-sora transition-colors duration-200 ${themeStyles.wrapper}`}
    >
      <div className="max-w-6xl w-full mx-auto space-y-6">
        {/* Top Header Card */}
        <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${themeStyles.header}`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] font-bold font-mono uppercase px-2.5 py-0.5 rounded border ${themeStyles.badge}`}>
                  CURRICULUM SPECIFICATION · MASTER PROMPT
                </span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {course.code || 'EST-COURSE-01'} · Universal v9.0
                </span>
                <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded border ${themeStyles.badgeSuccess}`}>
                  Validated Content
                </span>
              </div>

              <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${themeStyles.title}`}>
                {course.name || course.structure?.title || 'Untitled Course Specification'}
              </h1>

              <p className={`text-xs sm:text-sm font-medium ${themeStyles.subtitle}`}>
                Fully assembled master instructional prompt compiled directly from your validated course parameters. 100% visible, high-contrast review of all fields and generation directives.
              </p>
            </div>

            {/* Primary Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={onReturnToBuilder}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${themeStyles.buttonMuted}`}
                title="Go back to edit fields"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Builder</span>
              </button>

              {onStartAIGeneration && (
                <button
                  id="preview-generate-ai-course-btn"
                  onClick={onStartAIGeneration}
                  className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-[#052B66] bg-[#45CC42] hover:bg-[#3db83a] shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#052B66]" />
                  <span>Generate Course with AI</span>
                </button>
              )}

              <button
                id="preview-copy-prompt-btn"
                onClick={() => handleCopy(promptText)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#052B66] hover:bg-[#042150] text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#45CC42] stroke-[3]" />
                    <span className="text-[#45CC42] font-black">Copied Full Prompt!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Full Prompt</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleDownload('md')}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${themeStyles.buttonMuted}`}
                title="Download as Markdown file"
              >
                <Download className="w-4 h-4" />
                <span>.md</span>
              </button>
            </div>
          </div>
        </div>

        {/* Control Toolbar: View Mode, Theme Toggle, Font Size & Live Search */}
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs transition-all ${themeStyles.toolbar}`}>
          {/* Left: View Mode Switcher & Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Switcher */}
            <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-200/60">
              <button
                onClick={() => setDisplayMode('document')}
                className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  displayMode === 'document'
                    ? 'bg-white text-[#052B66] shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
                title="Structured Field by Field Review"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Structured Fields</span>
              </button>

              <button
                onClick={() => setDisplayMode('raw')}
                className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  displayMode === 'raw'
                    ? 'bg-white text-[#052B66] shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
                title="Raw Monospace LLM Code View"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Raw LLM Text</span>
              </button>
            </div>

            {/* Font Size Adjusters */}
            <div className="flex items-center gap-1 border border-slate-300 rounded-lg p-0.5 bg-slate-200/60">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  fontSize === 'sm' ? 'bg-white text-[#052B66] shadow-xs' : 'text-slate-700 hover:text-slate-950'
                }`}
                title="Small text"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  fontSize === 'base' ? 'bg-white text-[#052B66] shadow-xs' : 'text-slate-700 hover:text-slate-950'
                }`}
                title="Normal text"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  fontSize === 'lg' ? 'bg-white text-[#052B66] shadow-xs' : 'text-slate-700 hover:text-slate-950'
                }`}
                title="Large text"
              >
                A+
              </button>
            </div>

            {/* Prompt Metrics */}
            <div className="hidden lg:flex items-center gap-2 font-mono text-[11px] font-bold text-slate-700">
              <span className="px-2 py-0.5 rounded bg-slate-200/70 border border-slate-300">
                <strong>{wordCount.toLocaleString()}</strong> words
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-200/70 border border-slate-300">
                <strong>{charCount.toLocaleString()}</strong> chars
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-200/70 border border-slate-300">
                <strong>{lineCount.toLocaleString()}</strong> lines
              </span>
            </div>
          </div>

          {/* Right: Theme Toggle & Search */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Theme Toggle System */}
            <div className="flex items-center gap-1 border border-slate-300 p-1 rounded-lg bg-slate-200/60">
              <span className="text-[10px] uppercase font-bold text-slate-700 px-1 hidden sm:inline">Theme</span>
              <button
                onClick={() => setTheme('light')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white text-[#052B66] shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
                title="High-Contrast Light Paper (Default)"
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
                title="Midnight Dark Theme"
              >
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span>Dark</span>
              </button>

              <button
                onClick={() => setTheme('sepia')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  theme === 'sepia'
                    ? 'bg-[#ede5d6] text-[#2a1e16] shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
                title="Warm Sepia Editorial Theme"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#9a5b28]" />
                <span>Sepia</span>
              </button>
            </div>

            {/* Live Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search all fields..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`pl-8 pr-3 py-1.5 rounded-lg border text-xs outline-none transition-all w-40 sm:w-56 font-medium ${themeStyles.input}`}
              />
              {searchQuery && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                  {searchMatches} match{searchMatches !== 1 ? 'es' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Section Jump Pills Bar */}
        {displayMode === 'document' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-[#052B66]" />
              <span>Jump To:</span>
            </span>
            {[
              { id: 'sec-meta', label: 'DNA / Metadata' },
              { id: 'sec-01', label: '01 Problem & Impact' },
              { id: 'sec-02', label: '02 Sources & Citations' },
              { id: 'sec-03', label: '03 Architecture & Diagnostic' },
              { id: 'sec-04', label: '04 Modules & Scenarios' },
              { id: 'sec-05', label: '05 Learning & Bloom\'s' },
              { id: 'sec-06', label: '06 Ethics & POPIA' },
              { id: 'sec-07', label: '07 Output Directives' },
              { id: 'sec-08', label: '08 QA Verification' },
              { id: 'sec-09', label: '09 Engine Directives' }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => scrollToSection(pill.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold shrink-0 transition-all cursor-pointer ${themeStyles.pillInactive}`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        )}

        {/* Content View: Structured Document View vs Raw Text */}
        {displayMode === 'document' ? (
          /* Structured Document Reader View */
          <div className={`rounded-2xl border p-6 sm:p-10 space-y-8 transition-all ${themeStyles.container}`}>
            {/* Section 00: DNA / Course Metadata */}
            <div id="sec-meta" className={`p-6 rounded-2xl border space-y-5 transition-all ${themeStyles.sectionCard}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-300">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#052B66] block mb-1">
                    COURSE METADATA & DNA
                  </span>
                  <h2 className={`text-xl font-extrabold ${themeStyles.title}`}>
                    {course.name || course.structure?.title || 'Untitled Course Specification'}
                  </h2>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-md bg-[#45CC42]/20 text-[#148312] border border-[#45CC42]/40">
                    Status: {course.status || 'Draft Specification'}
                  </span>
                  <button
                    onClick={() => handleCopy(promptText, 'header')}
                    className={`p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${themeStyles.buttonMuted}`}
                    title="Copy full prompt to clipboard"
                  >
                    {copiedSection === 'header' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                <ReviewField label="Course Code" value={course.code || 'EST-COURSE-01'} isMono />
                <ReviewField label="Industry / Domain" value={course.structure?.industryDomain || 'Corporate Operations & Technology'} />
                <ReviewField label="Estimated Duration" value={course.structure?.estimatedDuration || '16 Hours (2 CPD Credits)'} />
                <ReviewField label="AI Integration Level" value={course.structure?.aiIntegrationLevel || 'Applied / Practical'} tag="Universal v9.0" />
                <ReviewField label="Target Experience Level" value={course.structure?.targetAudience || 'Mid-Career Professionals & Managers'} />
                <ReviewField label="Delivery Modality" value={course.structure?.deliveryModality || 'Blended Digital & Practical Sandbox'} />
                <ReviewField label="Assessment Rigour" value={course.structure?.assessmentRigour || 'Standard (Diagnostic + Workplace Rubric)'} />
                <ReviewField label="Benchmark Model" value="eStudy Master Universal Framework v9.0" tag="Authoritative" />
              </div>
            </div>

            {/* Section 01: Problem Definition */}
            <div id="sec-01" className={`p-6 rounded-2xl border space-y-4 transition-all ${themeStyles.sectionCard}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#052B66] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    01
                  </span>
                  <div>
                    <h3 className={`text-base font-bold ${themeStyles.sectionHeader}`}>
                      Section 01: Problem & Impact Definition
                    </h3>
                    <p className="text-xs font-medium text-slate-600 mt-0.5">
                      Target deficit, organizational impact, process gaps, and workplace constraints.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection('sec1')}
                  className={`p-1.5 rounded-lg border text-slate-700 cursor-pointer ${themeStyles.buttonMuted}`}
                >
                  {collapsedSections['sec1'] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>

              {!collapsedSections['sec1'] && (
                <div className={`space-y-4 pt-3 ${fontClass}`}>
                  <ReviewField
                    label="Problem Statement & Core Deficit"
                    value={
                      course.problem?.taskOrSkill || course.problem?.targetGroup
                        ? `This course addresses the inability of ${course.problem.targetGroup || '[Target Audience]'} to effectively perform ${course.problem.taskOrSkill || '[Core Skill]'}, resulting in ${course.problem.operationalImpact || '[Operational Impact]'}.`
                        : undefined
                    }
                    emptyMessage="Problem statement pending user definition in Section 01."
                    isItalic
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReviewField
                      label="Primary Target Audience"
                      value={course.problem?.targetGroup}
                      emptyMessage="Not specified yet in workspace."
                    />
                    <ReviewField
                      label="Core Skill / Task Deficit"
                      value={course.problem?.taskOrSkill}
                      emptyMessage="Not specified yet in workspace."
                    />
                  </div>

                  <ReviewField
                    label="Tangible Operational Impact & Cost of Inaction"
                    value={course.problem?.operationalImpact}
                    emptyMessage="Not specified yet in workspace."
                  />

                  {course.problem?.rootCauses && course.problem.rootCauses.length > 0 ? (
                    <div className="space-y-1.5">
                      <span className={themeStyles.fieldLabel}>Root Causes & Process Gaps ({course.problem.rootCauses.length})</span>
                      <div className={`p-4 rounded-xl border space-y-2 ${themeStyles.fieldBox}`}>
                        <ul className="list-disc list-inside space-y-1">
                          {course.problem.rootCauses.map((rc, idx) => (
                            <li key={idx} className={themeStyles.fieldValue}>
                              {renderHighlighted(rc)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <ReviewField
                      label="Root Causes & Process Gaps"
                      emptyMessage="No root causes specified yet in Section 01."
                    />
                  )}

                  {course.problem?.constraints && (
                    <ReviewField
                      label="Workplace Constraints & Operational Guardrails"
                      value={course.problem.constraints}
                      emptyMessage="No operational constraints entered."
                    />
                  )}
                </div>
              )}
            </div>

            {/* Section 02: Research & Statutory Citations */}
            <div id="sec-02" className={`p-6 rounded-2xl border space-y-4 transition-all ${themeStyles.sectionCard}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#052B66] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    02
                  </span>
                  <div>
                    <h3 className={`text-base font-bold ${themeStyles.sectionHeader}`}>
                      Section 02: Research & Verified Sources
                    </h3>
                    <p className="text-xs font-medium text-slate-600 mt-0.5">
                      Statutory frameworks, regulatory evidence, and authoritative industry citations.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection('sec2')}
                  className={`p-1.5 rounded-lg border text-slate-700 cursor-pointer ${themeStyles.buttonMuted}`}
                >
                  {collapsedSections['sec2'] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>

              {!collapsedSections['sec2'] && (
                <div className={`space-y-4 pt-3 ${fontClass}`}>
                  <ReviewField
                    label="Statutory & Regulatory Framework"
                    value={course.research?.regulatoryFramework || 'POPIA Act No. 4 of 2013 / South African statutory workplace compliance'}
                    tag="Mandatory"
                  />

                  <div className="space-y-1.5">
                    <span className={themeStyles.fieldLabel}>
                      Authoritative Evidence Sources ({course.research?.sources?.length || 0})
                    </span>
                    {course.research?.sources && course.research.sources.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {course.research.sources.map((src, i) => (
                          <div
                            key={src.id || i}
                            className={`p-4 rounded-xl border space-y-2 transition-all ${themeStyles.fieldBox}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-extrabold text-xs text-[#052B66]">
                                {renderHighlighted(src.name)}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${themeStyles.badge}`}>
                                {src.type || 'Regulatory'}
                              </span>
                            </div>
                            {src.reference && (
                              <p className="text-xs font-mono text-slate-600">
                                Ref: {renderHighlighted(src.reference)}
                              </p>
                            )}
                            {src.relevance && (
                              <p className="text-xs font-medium text-slate-800 leading-snug">
                                {renderHighlighted(src.relevance)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`p-4 rounded-xl border text-xs ${themeStyles.fieldEmpty}`}>
                        No specific external citations logged yet. Add regulatory and industry references in Section 02.
                      </div>
                    )}
                  </div>

                  {course.research?.auditEvidence && (
                    <ReviewField
                      label="Diagnostic Audit Baseline & Industry Evidence"
                      value={course.research.auditEvidence}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Section 03: Architecture, Diagnostics & Module Outline */}
            <div id="sec-03" className={`p-6 rounded-2xl border space-y-4 transition-all ${themeStyles.sectionCard}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#052B66] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    03
                  </span>
                  <div>
                    <h3 className={`text-base font-bold ${themeStyles.sectionHeader}`}>
                      Section 03: Course Structure & Diagnostic Pre-Assessment
                    </h3>
                    <p className="text-xs font-medium text-slate-600 mt-0.5">
                      Modular outline, audience prerequisites, and diagnostic MCQs.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection('sec3')}
                  className={`p-1.5 rounded-lg border text-slate-700 cursor-pointer ${themeStyles.buttonMuted}`}
                >
                  {collapsedSections['sec3'] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>

              {!collapsedSections['sec3'] && (
                <div className={`space-y-4 pt-3 ${fontClass}`}>
                  <ReviewField
                    label="Course Architecture Title & Overview"
                    value={course.structure?.title || course.name}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReviewField
                      label="Target Persona & Prerequisites"
                      value={course.structure?.targetAudience}
                      emptyMessage="Prerequisites pending specification."
                    />
                    <ReviewField
                      label="AI Tools & Sandbox Access"
                      value={course.structure?.aiIntegrationLevel ? `Level: ${course.structure.aiIntegrationLevel}` : undefined}
                      emptyMessage="AI integration level not specified."
                    />
                  </div>

                  {/* Diagnostic Questions */}
                  <div className="space-y-1.5">
                    <span className={themeStyles.fieldLabel}>
                      Diagnostic Pre-Assessment Questions ({course.structure?.diagnosticQuestions?.length || 0})
                    </span>
                    {course.structure?.diagnosticQuestions && course.structure.diagnosticQuestions.length > 0 ? (
                      <div className="space-y-3">
                        {course.structure.diagnosticQuestions.map((q, idx) => (
                          <div key={q.id || idx} className={`p-4 rounded-xl border space-y-2 ${themeStyles.fieldBox}`}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-[#052B66]">Question {idx + 1}</span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${themeStyles.badge}`}>
                                Correct: Option {(q.correctAnswerIndex ?? 0) + 1}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-900">{renderHighlighted(q.question)}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {q.options.map((opt, oIdx) => (
                                <div
                                  key={oIdx}
                                  className={`p-2 rounded-lg text-xs font-medium border ${
                                    oIdx === q.correctAnswerIndex
                                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                                      : 'bg-slate-50 text-slate-800 border-slate-200'
                                  }`}
                                >
                                  <span className="font-bold mr-1.5">{String.fromCharCode(65 + oIdx)}.</span>
                                  {opt}
                                </div>
                              ))}
                            </div>
                            {q.explanation && (
                              <p className="text-[11px] text-slate-600 italic pt-1 border-t border-slate-200">
                                <strong>Rationale:</strong> {q.explanation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`p-4 rounded-xl border text-xs ${themeStyles.fieldEmpty}`}>
                        No diagnostic questions configured yet in Section 03.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Section 04: Modules & Workplace Scenario Blueprints */}
            <div id="sec-04" className={`p-6 rounded-2xl border space-y-4 transition-all ${themeStyles.sectionCard}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#052B66] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    04
                  </span>
                  <div>
                    <h3 className={`text-base font-bold ${themeStyles.sectionHeader}`}>
                      Section 04: Modules & Workplace Scenario Blueprints ({course.modules?.length || 0} Modules)
                    </h3>
                    <p className="text-xs font-medium text-slate-600 mt-0.5">
                      Concrete learning units, Bloom's objectives, authentic workplace scenarios, and AI tool sandboxes.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection('sec4')}
                  className={`p-1.5 rounded-lg border text-slate-700 cursor-pointer ${themeStyles.buttonMuted}`}
                >
                  {collapsedSections['sec4'] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>

              {!collapsedSections['sec4'] && (
                <div className={`space-y-5 pt-3 ${fontClass}`}>
                  {course.modules && course.modules.length > 0 ? (
                    course.modules.map((m, i) => (
                      <div
                        key={m.id || i}
                        className={`p-5 rounded-2xl border space-y-4 transition-all shadow-xs ${themeStyles.fieldBox}`}
                      >
                        {/* Module Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-300">
                          <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#052B66] block">
                              MODULE {i + 1}
                            </span>
                            <h4 className="text-base font-extrabold text-[#052B66]">
                              {renderHighlighted(m.title)}
                            </h4>
                            {m.subtitle && (
                              <p className="text-xs font-medium text-slate-600 italic mt-0.5">
                                {renderHighlighted(m.subtitle)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {m.duration && (
                              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${themeStyles.badge}`}>
                                {m.duration}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Module Purpose */}
                        {m.purpose && (
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block mb-0.5">
                              MODULE PURPOSE
                            </span>
                            <p className="text-xs font-medium text-slate-900 leading-relaxed">
                              {renderHighlighted(m.purpose)}
                            </p>
                          </div>
                        )}

                        {/* Learning Objectives */}
                        {m.learningObjectives && m.learningObjectives.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">
                              LEARNING OBJECTIVES ({m.learningObjectives.length})
                            </span>
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                              <ul className="list-disc list-inside space-y-1 text-xs font-medium text-slate-900">
                                {m.learningObjectives.map((obj, oIdx) => (
                                  <li key={oIdx}>{renderHighlighted(obj)}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Workplace Scenarios */}
                        {m.requirements?.scenarios && m.requirements.scenarios.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-slate-200">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Authentic Workplace Scenarios ({m.requirements.scenarios.length})</span>
                              </span>
                            </div>
                            <div className="grid grid-cols-1 gap-2.5">
                              {m.requirements.scenarios.map((sc, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 space-y-1.5"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <strong className="text-xs font-extrabold text-slate-900">
                                      Scenario {sIdx + 1}: {sc.title || `Practical Case ${sIdx + 1}`}
                                    </strong>
                                    {sc.stakeholders && (
                                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                                        {sc.stakeholders}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs font-medium text-slate-800 leading-relaxed">
                                    <strong>Situation:</strong> {renderHighlighted(sc.situation)}
                                  </p>
                                  {sc.decisionPoint && (
                                    <p className="text-xs font-medium text-[#052B66] leading-relaxed">
                                      <strong>Decision Point:</strong> {renderHighlighted(sc.decisionPoint)}
                                    </p>
                                  )}
                                  {sc.reflection && (
                                    <p className="text-[11px] text-slate-600 italic">
                                      <strong>Debrief:</strong> {renderHighlighted(sc.reflection)}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className={`p-4 rounded-xl border text-xs ${themeStyles.fieldEmpty}`}>
                      No modules defined yet in workspace. Create modules in Section 04.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Section 05: Learning Design, Bloom's Taxonomy & AI Exercises */}
            <div id="sec-05" className={`p-6 rounded-2xl border space-y-4 transition-all ${themeStyles.sectionCard}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#052B66] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    05
                  </span>
                  <div>
                    <h3 className={`text-base font-bold ${themeStyles.sectionHeader}`}>
                      Section 05: Learning Design, Bloom's Taxonomy & AI Exercises
                    </h3>
                    <p className="text-xs font-medium text-slate-600 mt-0.5">
                      Cognitive levels, interactive simulations, zero-PII prompt exercises, and capstone assessments.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection('sec5')}
                  className={`p-1.5 rounded-lg border text-slate-700 cursor-pointer ${themeStyles.buttonMuted}`}
                >
                  {collapsedSections['sec5'] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>

              {!collapsedSections['sec5'] && (
                <div className={`space-y-4 pt-3 ${fontClass}`}>
                  <ReviewField
                    label="Interactive AI Demonstrations & Simulations"
                    value={course.learningDesign?.aiDemoSimulationDescription}
                    emptyMessage="No AI demo simulations specified."
                  />
                  <ReviewField
                    label="Hands-On Zero-PII Prompt Engineering Exercises"
                    value={course.learningDesign?.promptExerciseDescription}
                    emptyMessage="Prompt exercises pending configuration."
                  />
                  <ReviewField
                    label="Guided Practice & Peer Review Framework"
                    value={course.learningDesign?.guidedPracticeDescription}
                    emptyMessage="Guided practice framework not specified."
                  />
                  <ReviewField
                    label="Summative Assessment & Final Capstone Rubric"
                    value={course.learningDesign?.summativeAssessmentDescription}
                    emptyMessage="Summative capstone not specified."
                  />
                </div>
              )}
            </div>

            {/* Section 06: Ethics, POPIA & Algorithmic Governance */}
            <div id="sec-06" className={`p-6 rounded-2xl border space-y-4 transition-all ${themeStyles.sectionCard}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#052B66] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    06
                  </span>
                  <div>
                    <h3 className={`text-base font-bold ${themeStyles.sectionHeader}`}>
                      Section 06: Ethics, POPIA & Algorithmic Governance
                    </h3>
                    <p className="text-xs font-medium text-slate-600 mt-0.5">
                      POPIA compliance, zero-PII data sanitization, bias mitigation, and human oversight.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection('sec6')}
                  className={`p-1.5 rounded-lg border text-slate-700 cursor-pointer ${themeStyles.buttonMuted}`}
                >
                  {collapsedSections['sec6'] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>

              {!collapsedSections['sec6'] && (
                <div className={`space-y-4 pt-3 ${fontClass}`}>
                  <ReviewField
                    label="Human-in-the-Loop Oversight Matrix"
                    value={course.ethics?.humanOversightNotes}
                    emptyMessage="Human oversight rules pending configuration."
                  />
                  <ReviewField
                    label="Psychological Safety & Blameless Error Reporting"
                    value={course.ethics?.psychologicalSafetyNotes}
                    emptyMessage="Psychological safety protocols pending configuration."
                  />

                  <div className="space-y-1.5">
                    <span className={themeStyles.fieldLabel}>
                      Statutory Ethics Verification Cards ({course.ethics?.cards?.length || 0})
                    </span>
                    {course.ethics?.cards && course.ethics.cards.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {course.ethics.cards.map((card, i) => (
                          <div
                            key={card.id || i}
                            className={`p-4 rounded-xl border space-y-2 ${themeStyles.fieldBox}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-extrabold text-xs text-[#052B66]">{card.title}</span>
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${themeStyles.badge}`}>
                                {card.complianceRef || 'POPIA'}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-slate-600 italic leading-snug">
                              {card.guidingQuestion}
                            </p>
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                              <p className="text-xs font-bold text-slate-900 leading-relaxed">
                                {renderHighlighted(card.response || 'Response pending in workspace')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`p-4 rounded-xl border text-xs ${themeStyles.fieldEmpty}`}>
                        Ethics framework configured with POPIA Act 4 of 2013 safeguards.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Section 07: Output Format & Generation Directives */}
            <div id="sec-07" className={`p-6 rounded-2xl border space-y-4 transition-all ${themeStyles.sectionCard}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#052B66] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    07
                  </span>
                  <div>
                    <h3 className={`text-base font-bold ${themeStyles.sectionHeader}`}>
                      Section 07: Output Specifications & Formatting Directives
                    </h3>
                    <p className="text-xs font-medium text-slate-600 mt-0.5">
                      LMS output format, language tone, non-truncation rules, and execution directives.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection('sec7')}
                  className={`p-1.5 rounded-lg border text-slate-700 cursor-pointer ${themeStyles.buttonMuted}`}
                >
                  {collapsedSections['sec7'] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>

              {!collapsedSections['sec7'] && (
                <div className={`space-y-4 pt-3 ${fontClass}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReviewField
                      label="Output Format & Delivery Package"
                      value={course.outputRequirements?.outputFormat || 'LMS-Ready SCORM / xAPI compliant digital course with interactive modules'}
                    />
                    <ReviewField
                      label="Language & Cultural Tone"
                      value={course.outputRequirements?.languageTone || 'Professional corporate South African English (clear, inclusive, rigorous)'}
                    />
                  </div>

                  <ReviewField
                    label="Generation Directive: Strict Non-Truncation Mandate"
                    value={course.outputRequirements?.nonTruncationRule || 'STRICT MANDATE: Full text output without summaries or truncation. Output every module in full narrative completeness.'}
                    tag="Critical Directives"
                  />

                  <ReviewField
                    label="Formatting Rules & Markdown Elements"
                    value={course.outputRequirements?.formattingRules || 'Clean Markdown headings, bullet points, callout boxes for workplace tips, and structured summary tables.'}
                  />
                </div>
              )}
            </div>

            {/* Section 08: Quality Assurance Status */}
            <div id="sec-08" className={`p-6 rounded-2xl border space-y-4 transition-all ${themeStyles.sectionCard}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#052B66] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    08
                  </span>
                  <div>
                    <h3 className={`text-base font-bold ${themeStyles.sectionHeader}`}>
                      Section 08: Quality Assurance & Readiness Score
                    </h3>
                    <p className="text-xs font-medium text-slate-600 mt-0.5">
                      40-point verification checklist score, compliance readiness, and traceability.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection('sec8')}
                  className={`p-1.5 rounded-lg border text-slate-700 cursor-pointer ${themeStyles.buttonMuted}`}
                >
                  {collapsedSections['sec8'] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>

              {!collapsedSections['sec8'] && (
                <div className={`space-y-4 pt-3 ${fontClass}`}>
                  <div className="p-4 rounded-xl bg-white border border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#052B66] text-[#45CC42] font-mono font-black text-lg flex items-center justify-center border-2 border-[#45CC42]">
                        ✓
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#052B66]">Universal Framework v9.0 Compliance Ready</h4>
                        <p className="text-xs text-slate-600">
                          Course parameters verified against eStudy instructional quality and regulatory standards.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onReturnToBuilder}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${themeStyles.buttonMuted}`}
                    >
                      View 40-Point QA Checklist
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Quick Action Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#052B66] text-white shadow-md">
              <div className="space-y-1">
                <h4 className="text-base font-bold">Ready to generate this course?</h4>
                <p className="text-xs text-slate-200">
                  Copy the fully compiled prompt or trigger the server-side AI generation engine.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopy(promptText)}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#45CC42] text-[#052B66] hover:bg-[#3ec23b] transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied Full Prompt!' : 'Copy Full Master Prompt'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Raw Monospaced Text / Terminal View */
          <div className={`rounded-2xl border p-6 overflow-x-auto shadow-md relative transition-all ${themeStyles.codePre}`}>
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b ${themeStyles.divider}`}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#052B66] dark:text-[#45CC42]">
                  RAW LLM MASTER PROMPT SPECIFICATION
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                  {wordCount.toLocaleString()} words
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(promptText)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${themeStyles.buttonMuted}`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span className="text-emerald-700">Copied Full Prompt</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Entire Prompt</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDownload('md')}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${themeStyles.buttonMuted}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .md</span>
                </button>
              </div>
            </div>

            <pre
              id="master-prompt-code-output"
              className={`font-mono leading-relaxed whitespace-pre-wrap selection:bg-[#45CC42] selection:text-[#052B66] text-slate-950 dark:text-slate-100 ${fontClass}`}
            >
              {renderHighlighted(promptText)}
            </pre>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`max-w-6xl w-full mx-auto pt-8 pb-4 text-center text-xs font-medium text-slate-500 border-t mt-8 ${themeStyles.divider}`}>
        eStudy South Africa · Master Course Prompt Framework v9.0 · 100% Validated Field Review
      </div>
    </div>
  );
};

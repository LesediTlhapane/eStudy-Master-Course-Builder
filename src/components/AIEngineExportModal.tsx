import React, { useState } from 'react';
import { Course } from '../types';
import { generateMasterPrompt } from '../utils/promptGenerator';
import { generateCourseDocx } from '../utils/docxExport';
import { printCoursePdf } from '../utils/pdfExport';
import {
  X,
  Sparkles,
  Download,
  Copy,
  Check,
  Star,
  ExternalLink,
  FileText,
  Printer,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AIEngineExportModalProps {
  isOpen: boolean;
  course: Course;
  onClose: () => void;
  onStartAIGeneration: () => void;
}

export interface AIEngineOption {
  id: string;
  name: string;
  provider: string;
  rating: number;
  reviewCount: number;
  badge: string;
  description: string;
  strengths: string[];
  webUrl: string;
  recommendedFor: string;
  color: string;
}

export const AI_ENGINES: AIEngineOption[] = [
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    rating: 4.9,
    reviewCount: 3840,
    badge: 'Instructional Design Top Choice',
    description: 'Gold standard for pedagogical nuance, South African workplace scenarios, and authentic workplace dialogues.',
    strengths: ['Bloom’s Taxonomy Precision', 'Empathetic Workplace Scenarios', 'Zero-fluff Content Body'],
    webUrl: 'https://claude.ai',
    recommendedFor: 'Best for corporate training, ethics, and interactive learner journeys',
    color: '#D97706'
  },
  {
    id: 'gemini-2-5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google DeepMind',
    rating: 4.9,
    reviewCount: 4210,
    badge: 'Fastest & Deepest Context',
    description: 'Ultra-fast structured generation with 1M+ token context window. Ingests full textbooks and statutory frameworks effortlessly.',
    strengths: ['Massive Research Ingestion', 'Lightning Generation Speed', 'Structured Tabular Blueprints'],
    webUrl: 'https://gemini.google.com',
    recommendedFor: 'Best for data-heavy courses, statutory compliance, and fast generation',
    color: '#2563EB'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    rating: 4.8,
    reviewCount: 5120,
    badge: 'Enterprise Versatility',
    description: 'Strong generalist engine with high adherence to strict prompt guidelines and corporate diagnostic quizzes.',
    strengths: ['Strict Guideline Compliance', 'Diverse Quiz Formats', 'Executive Summaries'],
    webUrl: 'https://chatgpt.com',
    recommendedFor: 'Best for standard corporate SOPs and multi-choice assessments',
    color: '#059669'
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1 / V3',
    provider: 'DeepSeek',
    rating: 4.7,
    reviewCount: 2950,
    badge: 'Technical & Systems Rigor',
    description: 'Open-weight reasoning model excelling in procedural logic, systems troubleshooting, and analytical checklists.',
    strengths: ['Step-by-Step Logic', 'Process Failure Analysis', 'Technical Procedures'],
    webUrl: 'https://chat.deepseek.com',
    recommendedFor: 'Best for IT, engineering, software workflows, and complex operational procedures',
    color: '#4F46E5'
  },
  {
    id: 'mistral-large-2',
    name: 'Mistral Large 2',
    provider: 'Mistral AI',
    rating: 4.6,
    reviewCount: 1840,
    badge: 'European & African Governance',
    description: 'Compact high-power model tuned for governance, concise plain language, and international regulatory standards.',
    strengths: ['Plain Language Clarity', 'Governance Frameworks', 'Concise SOP Outlines'],
    webUrl: 'https://chat.mistral.ai',
    recommendedFor: 'Best for compliance officers and concise micro-learning sprints',
    color: '#EA580C'
  }
];

export const AIEngineExportModal: React.FC<AIEngineExportModalProps> = ({
  isOpen,
  course,
  onClose,
  onStartAIGeneration
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'documents'>('ai');
  const [selectedEngineId, setSelectedEngineId] = useState<string>('claude-3-5-sonnet');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);

  if (!isOpen) return null;

  const selectedEngine = AI_ENGINES.find(e => e.id === selectedEngineId) || AI_ENGINES[0];
  const promptText = generateMasterPrompt(course);
  const wordCount = promptText.trim().split(/\s+/).length;

  const handleCopyPrompt = async () => {
    try {
      const specializedPrompt = `### [SYSTEM DIRECTIVE FOR ${selectedEngine.name.toUpperCase()}]\nYou are acting as eStudy South Africa's Senior Instructional Designer.\nAdhere strictly to the eStudy Master Course Prompt Framework v9.0 below.\n\n${promptText}`;
      await navigator.clipboard.writeText(specializedPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch (e) {
      console.error('Failed to copy prompt:', e);
    }
  };

  const handleDownloadDocx = async () => {
    try {
      setIsDownloadingDocx(true);
      const blob = await generateCourseDocx(course);
      const filename = `${(course.name || 'estudy_course').toLowerCase().replace(/[^a-z0-9]/g, '_')}_master_specification.docx`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate Word document:', err);
      alert('Could not generate Word document. Please try again.');
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  const handleDownloadPdf = () => {
    printCoursePdf(course);
  };

  const handleDownloadMarkdown = () => {
    const filename = `${(course.name || 'estudy_course').toLowerCase().replace(/[^a-z0-9]/g, '_')}_master_prompt_v9.md`;
    const blob = new Blob([promptText], { type: 'text/markdown;charset=utf-8' });
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sora">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#052B66] text-[#45CC42] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#052B66]">
                Generate Course & Export Template
              </h2>
              <p className="text-xs text-slate-500">
                Pick your preferred AI generation tool or export to Word / PDF documents.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-4">
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ai'
                ? 'border-[#45CC42] text-[#052B66] text-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4 text-[#45CC42]" />
            <span>1. Pick AI Generation Tool (with Ratings)</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'documents'
                ? 'border-[#45CC42] text-[#052B66]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4 text-[#45CC42]" />
            <span>2. Download Document (Word .docx / PDF)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'ai' ? (
            <div className="space-y-6">
              {/* Highlight Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#052B66] to-[#0d3f8f] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-[#45CC42] shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-bold uppercase bg-[#45CC42] text-[#052B66] px-2 py-0.5 rounded">
                      eStudy Universal Template Ready
                    </span>
                    <span className="text-xs text-slate-300 font-mono">
                      {wordCount.toLocaleString()} words compiled
                    </span>
                  </div>
                  <h3 className="text-sm font-bold">
                    {course.name || course.structure.title || 'Course Blueprint'}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onStartAIGeneration();
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#45CC42] hover:bg-[#3ec23b] text-[#052B66] transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Course Now</span>
                </button>
              </div>

              {/* AI Engine Selection Cards */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#052B66]">
                  Select AI Tool for Course Generation:
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {AI_ENGINES.map(engine => {
                    const isSelected = selectedEngineId === engine.id;
                    return (
                      <div
                        key={engine.id}
                        onClick={() => setSelectedEngineId(engine.id)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                          isSelected
                            ? 'border-[#45CC42] bg-[#45CC42]/5 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-sm text-[#052B66]">
                              {engine.name}
                            </span>
                            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span className="text-xs font-bold text-amber-900">
                                {engine.rating.toFixed(1)}
                              </span>
                              <span className="text-[10px] text-amber-700">
                                ({engine.reviewCount.toLocaleString()})
                              </span>
                            </div>
                          </div>

                          <div className="text-[11px] font-semibold text-slate-500">
                            by {engine.provider} • <span className="text-[#052B66] font-bold">{engine.badge}</span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {engine.description}
                          </p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <div className="flex flex-wrap gap-1.5">
                            {engine.strengths.map((str, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                              >
                                {str}
                              </span>
                            ))}
                          </div>
                          <div className="text-[11px] text-[#052B66] font-medium italic">
                            💡 {engine.recommendedFor}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#45CC42]" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Engine Action Strip */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-700">
                  Selected: <strong className="text-[#052B66]">{selectedEngine.name}</strong> ({selectedEngine.rating} ★)
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCopyPrompt}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                      copiedPrompt
                        ? 'bg-[#45CC42] text-[#052B66]'
                        : 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Prompt Copied for {selectedEngine.name}!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Prompt for {selectedEngine.name}</span>
                      </>
                    )}
                  </button>

                  <a
                    href={selectedEngine.webUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={handleCopyPrompt}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Open in {selectedEngine.name}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            /* Document Download Tab */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Word Document (.docx) */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-[#45CC42] transition-all space-y-4 shadow-xs border-l-4 border-l-[#45CC42]">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-[#052B66]">
                      Microsoft Word Document (.docx)
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Download an editable, styled Microsoft Word document with tables, module specifications, South African workplace scenarios, and regulatory evidence tables.
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadDocx}
                    disabled={isDownloadingDocx}
                    className="w-full py-3 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 text-[#45CC42]" />
                    <span>{isDownloadingDocx ? 'Generating Word Document...' : 'Download as Word Document (.docx)'}</span>
                  </button>
                </div>

                {/* PDF Document (.pdf) */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-[#45CC42] transition-all space-y-4 shadow-xs border-l-4 border-l-[#45CC42]">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                    <Printer className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-[#052B66]">
                      Printable PDF Document (.pdf)
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Opens a print-ready document formatted to A4 pages with eStudy branding, client cover logo, and full curriculum architecture. Save directly as PDF.
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadPdf}
                    className="w-full py-3 rounded-xl text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3ec23b] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Generate & Print / Save as PDF (.pdf)</span>
                  </button>
                </div>
              </div>

              {/* Developer / Raw Markdown Options */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Raw Markdown & Plain Text Specification
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    For AI coding editors, local LLM scripts, or text-based archival.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadMarkdown}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .md</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>eStudy South Africa · Master Course Builder v9.0</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

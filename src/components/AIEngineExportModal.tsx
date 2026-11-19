import React, { useState } from 'react';
import { Course, AIProvider } from '../types';
import { generateMasterPrompt } from '../utils/promptGenerator';
import { generateCourseDocx, generateMasterTemplateDocx } from '../utils/docxExport';
import { printCoursePdf, printMasterTemplatePdf } from '../utils/pdfExport';
import { getClientModels, getDefaultModel } from '../utils/aiModels';
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
  Cpu,
  Zap,
  ArrowRight,
  Sliders,
  ClipboardCheck,
  BookOpen
} from 'lucide-react';

interface AIEngineExportModalProps {
  isOpen: boolean;
  course: Course;
  selectedProvider: AIProvider;
  selectedModel: string;
  onSelectProvider: (provider: AIProvider) => void;
  onSelectModel: (model: string) => void;
  onClose: () => void;
  onStartAIGeneration: (provider?: AIProvider, model?: string) => void;
}

export interface ExternalAIToolOption {
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
}

export const EXTERNAL_AI_TOOLS: ExternalAIToolOption[] = [
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    rating: 4.9,
    reviewCount: 3840,
    badge: 'Pedagogical Nuance',
    description: 'Premier model for instructional design, authentic South African workplace scenarios, and empathetic learner journeys.',
    strengths: ['Bloom’s Taxonomy Precision', 'Empathetic Workplace Scenarios', 'Zero-fluff Content Body'],
    webUrl: 'https://claude.ai',
    recommendedFor: 'Best for corporate training, ethics, and interactive learner journeys'
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
    recommendedFor: 'Best for standard corporate SOPs and multi-choice assessments'
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    rating: 4.7,
    reviewCount: 2950,
    badge: 'Reasoning & Logic',
    description: 'Open-weight reasoning model excelling in procedural logic, systems troubleshooting, and analytical checklists.',
    strengths: ['Step-by-Step Logic', 'Process Failure Analysis', 'Technical Procedures'],
    webUrl: 'https://chat.deepseek.com',
    recommendedFor: 'Best for IT, engineering, software workflows, and complex operational procedures'
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
    recommendedFor: 'Best for compliance officers and concise micro-learning sprints'
  }
];

export const AIEngineExportModal: React.FC<AIEngineExportModalProps> = ({
  isOpen,
  course,
  selectedProvider,
  selectedModel,
  onSelectProvider,
  onSelectModel,
  onClose,
  onStartAIGeneration
}) => {
  const [activeTab, setActiveTab] = useState<'direct_ai' | 'documents' | 'external_ai'>('direct_ai');
  const [selectedExternalToolId, setSelectedExternalToolId] = useState<string>('claude-3-5-sonnet');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isDownloadingTemplateDocx, setIsDownloadingTemplateDocx] = useState(false);
  const [isDownloadingCourseDocx, setIsDownloadingCourseDocx] = useState(false);
  const [generationTask, setGenerationTask] = useState<'complete_course'>('complete_course');

  if (!isOpen) return null;

  const promptText = generateMasterPrompt(course);
  const wordCount = promptText.trim().split(/\s+/).filter(Boolean).length;

  const availableModelsForProvider = getClientModels(selectedProvider, 'course_generation');
  const currentModelMeta = availableModelsForProvider.find(m => m.id === selectedModel) || availableModelsForProvider[0];
  const selectedExternalTool = EXTERNAL_AI_TOOLS.find(t => t.id === selectedExternalToolId) || EXTERNAL_AI_TOOLS[0];

  const handleProviderChange = (newProvider: AIProvider) => {
    onSelectProvider(newProvider);
    const defModel = getDefaultModel(newProvider, 'course_generation');
    onSelectModel(defModel);
  };

  const handleLaunchGeneration = () => {
    onClose();
    onStartAIGeneration(selectedProvider, selectedModel);
  };

  const handleCopyPrompt = async (targetToolName: string) => {
    try {
      const specializedPrompt = `### [SYSTEM DIRECTIVE FOR ${targetToolName.toUpperCase()}]\nYou are acting as eStudy South Africa's Senior Instructional Designer.\nAdhere strictly to the eStudy Master Course Prompt Framework v9.0 below.\n\n${promptText}`;
      await navigator.clipboard.writeText(specializedPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch (e) {
      console.error('Failed to copy prompt:', e);
    }
  };

  // Download 1: Completed Master Course Template (.docx)
  const handleDownloadTemplateDocx = async () => {
    try {
      setIsDownloadingTemplateDocx(true);
      const blob = await generateMasterTemplateDocx(course);
      const filename = `${(course.structure?.title || course.name || 'estudy_course')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')}_completed_master_template_v9.docx`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate Completed Template Word document:', err);
    } finally {
      setIsDownloadingTemplateDocx(false);
    }
  };

  // Download 1: Completed Master Course Template (.pdf)
  const handleDownloadTemplatePdf = () => {
    printMasterTemplatePdf(course);
  };

  // Download 2: Generated Training Course (.docx)
  const handleDownloadCourseDocx = async () => {
    try {
      setIsDownloadingCourseDocx(true);
      const blob = await generateCourseDocx(course);
      const filename = `${(course.structure?.title || course.name || 'estudy_course')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')}_generated_training_course.docx`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate Training Course Word document:', err);
    } finally {
      setIsDownloadingCourseDocx(false);
    }
  };

  // Download 2: Generated Training Course (.pdf)
  const handleDownloadCoursePdf = () => {
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
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sora"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Modal Top Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#052B66] text-[#45CC42] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#052B66]">
                AI Course Generation & Downloads Hub
              </h2>
              <p className="text-xs text-slate-500">
                Generate your complete course with AI, or download the Completed Master Template and Generated Training Course.
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
        <div className="flex border-b border-slate-200 px-6 bg-white gap-3 sm:gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('direct_ai')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'direct_ai'
                ? 'border-[#45CC42] text-[#052B66]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 text-[#45CC42]" />
            <span>1. Direct AI Generation (Groq Cloud)</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'documents'
                ? 'border-[#45CC42] text-[#052B66]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4 text-[#45CC42]" />
            <span>2. Download Completed Template & Generated Course</span>
          </button>

          <button
            onClick={() => setActiveTab('external_ai')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'external_ai'
                ? 'border-[#45CC42] text-[#052B66]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4 text-[#052B66]" />
            <span>3. Copy Prompt for External Tools</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: DIRECT AI GENERATION */}
          {activeTab === 'direct_ai' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#052B66] to-[#0d3f8f] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-[#45CC42] shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-bold uppercase bg-[#45CC42] text-[#052B66] px-2 py-0.5 rounded">
                      Master Course Template v9.0
                    </span>
                    <span className="text-xs text-slate-300 font-mono">
                      {wordCount.toLocaleString()} words compiled
                    </span>
                  </div>
                  <h3 className="text-sm font-bold">
                    {course.structure?.title || course.name || 'Course Specification'}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-300 block">Selected Engine:</span>
                  <span className="text-xs font-bold text-[#45CC42]">
                    {selectedProvider === 'gemini' ? 'Google Gemini' : 'Groq Cloud'} · {currentModelMeta?.displayName || selectedModel}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#052B66]">
                  <Sliders className="w-4 h-4 text-[#45CC42]" />
                  <span>AI Engine & Model Configuration</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      AI Provider:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectProvider('groq');
                          onSelectModel(getDefaultModel('groq', 'course_generation'));
                        }}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          selectedProvider === 'groq'
                            ? 'border-[#052B66] bg-orange-50/80 ring-2 ring-[#052B66]/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-[#EA580C]">Groq</span>
                          {selectedProvider === 'groq' && <Check className="w-3.5 h-3.5 text-[#EA580C] stroke-[3]" />}
                        </div>
                        <span className="text-[10px] text-slate-500 block">Fast LPU</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectProvider('gemini');
                          onSelectModel(getDefaultModel('gemini', 'course_generation'));
                        }}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          selectedProvider === 'gemini'
                            ? 'border-[#052B66] bg-blue-50/80 ring-2 ring-[#052B66]/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-[#052B66]">Gemini</span>
                          {selectedProvider === 'gemini' && <Check className="w-3.5 h-3.5 text-[#052B66] stroke-[3]" />}
                        </div>
                        <span className="text-[10px] text-slate-500 block">Google AI</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      AI Model ({selectedProvider === 'gemini' ? 'Gemini' : 'Groq'} Models):
                    </label>
                    <select
                      value={selectedModel}
                      onChange={e => onSelectModel(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:border-[#052B66] focus:ring-1 focus:ring-[#052B66] cursor-pointer"
                    >
                      {availableModelsForProvider.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.displayName} {m.isDefault ? '★ (Recommended)' : ''}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10.5px] text-slate-500 block truncate">
                      {currentModelMeta?.description}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Generation Task:
                    </label>
                    <select
                      value={generationTask}
                      onChange={(e: any) => setGenerationTask(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:border-[#052B66] focus:ring-1 focus:ring-[#052B66] cursor-pointer"
                    >
                      <option value="complete_course">Complete Course (Master Prompt v9.0)</option>
                    </select>
                    <span className="text-[10.5px] text-slate-500 block">
                      Curriculum, lessons, scenarios, diagnostic & capstone
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500">
                    Generates a complete, structured training course in South African English aligned with your Master Template inputs.
                  </div>

                  <button
                    onClick={handleLaunchGeneration}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-extrabold bg-[#45CC42] hover:bg-[#3ec23b] text-[#052B66] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-4 h-4 text-[#052B66]" />
                    <span>Generate Course with {currentModelMeta?.displayName || selectedModel}</span>
                    <ArrowRight className="w-4 h-4 text-[#052B66]" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DUAL DOCUMENT DOWNLOADS (Download 1: Completed Master Template & Download 2: Generated Training Course) */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              {/* DOWNLOAD 1: COMPLETED MASTER COURSE TEMPLATE */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs border-l-4 border-l-[#052B66]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#052B66] text-[#45CC42] flex items-center justify-center shrink-0">
                      <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#052B66]/10 px-2 py-0.5 rounded inline-block mb-1">
                        DOWNLOAD 1 · OFFICIAL MASTER TEMPLATE SPECIFICATION
                      </span>
                      <h3 className="text-sm font-extrabold text-[#052B66]">
                        Completed Master Course Template (v9.0)
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                        Downloads your completed 9-section eStudy Master Course Generation Template (Sections 1 to 9 with official headings, tables, and embedded Course Logo & Banner).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={handleDownloadTemplateDocx}
                    disabled={isDownloadingTemplateDocx}
                    className="py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <FileText className="w-4 h-4 text-[#45CC42]" />
                    <span>
                      {isDownloadingTemplateDocx
                        ? 'Preparing Template (.docx)...'
                        : 'Download Completed Template (.docx)'}
                    </span>
                  </button>

                  <button
                    onClick={handleDownloadTemplatePdf}
                    className="py-3 px-4 rounded-xl text-xs font-bold text-[#052B66] bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-[#052B66]" />
                    <span>Download / Print Completed Template (.pdf)</span>
                  </button>
                </div>
              </div>

              {/* DOWNLOAD 2: GENERATED TRAINING COURSE */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-xs border-l-4 border-l-[#45CC42]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#45CC42]/20 text-[#052B66] flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#052B66] bg-[#45CC42]/25 px-2 py-0.5 rounded inline-block mb-1">
                        DOWNLOAD 2 · COMPLETE TRAINING COURSE MANUAL
                      </span>
                      <h3 className="text-sm font-extrabold text-[#052B66]">
                        Generated Training Course (Modules, Scenarios, Quizzes & Assessments)
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                        Downloads the complete training course manual including executive overview, pre-course diagnostics, full module lessons, South African workplace scenarios, formative quizzes, and summative final assessment (with embedded Course Logo & Banner).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={handleDownloadCourseDocx}
                    disabled={isDownloadingCourseDocx}
                    className="py-3 px-4 rounded-xl text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3ec23b] shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 text-[#052B66]" />
                    <span>
                      {isDownloadingCourseDocx
                        ? 'Preparing Course (.docx)...'
                        : 'Download Generated Course (.docx)'}
                    </span>
                  </button>

                  <button
                    onClick={handleDownloadCoursePdf}
                    className="py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-[#45CC42]" />
                    <span>Download / Print Generated Course (.pdf)</span>
                  </button>
                </div>
              </div>

              {/* Raw Markdown Master Prompt */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Compiled Master Prompt (.md)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Download the raw markdown Master Course Prompt text file.
                  </p>
                </div>

                <button
                  onClick={handleDownloadMarkdown}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Prompt (.md)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: EXTERNAL AI TOOLS */}
          {activeTab === 'external_ai' && (
            <div className="space-y-6">
              <div className="text-xs text-slate-600">
                Copy the compiled Master Prompt tailored for external web tools like Claude 3.5 Sonnet, ChatGPT GPT-4o, DeepSeek, or Mistral.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {EXTERNAL_AI_TOOLS.map(tool => {
                  const isSelected = selectedExternalToolId === tool.id;
                  return (
                    <div
                      key={tool.id}
                      onClick={() => setSelectedExternalToolId(tool.id)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                        isSelected
                          ? 'border-[#45CC42] bg-[#45CC42]/5 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-sm text-[#052B66]">
                            {tool.name}
                          </span>
                          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span className="text-xs font-bold text-amber-900">
                              {tool.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] font-semibold text-slate-500">
                          by {tool.provider} • <span className="text-[#052B66] font-bold">{tool.badge}</span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-700">
                  Selected: <strong className="text-[#052B66]">{selectedExternalTool.name}</strong>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleCopyPrompt(selectedExternalTool.name)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                      copiedPrompt
                        ? 'bg-[#45CC42] text-[#052B66]'
                        : 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Prompt Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Prompt for {selectedExternalTool.name}</span>
                      </>
                    )}
                  </button>

                  <a
                    href={selectedExternalTool.webUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleCopyPrompt(selectedExternalTool.name)}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Open {selectedExternalTool.name}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
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

import React, { useState, useEffect } from 'react';
import { Course, AIProvider, AIModelMeta } from '../types';
import { generateMasterPrompt } from '../utils/promptGenerator';
import { generateCourseDocx } from '../utils/docxExport';
import { printCoursePdf } from '../utils/pdfExport';
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
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
  ChevronDown,
  Info,
  Sliders
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
  const [activeTab, setActiveTab] = useState<'direct_ai' | 'external_ai' | 'documents'>('direct_ai');
  const [selectedExternalToolId, setSelectedExternalToolId] = useState<string>('claude-3-5-sonnet');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);
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
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#052B66] text-[#45CC42] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#052B66]">
                AI Course Generation & Export Hub
              </h2>
              <p className="text-xs text-slate-500">
                Choose an AI provider and model to generate directly, or export specification to Word/PDF.
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
            <span>1. Direct AI Generation (Gemini & Groq)</span>
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
            <span>2. Copy Prompt for External Tools (Claude, GPT-4o)</span>
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
            <span>3. Download Word / PDF Documents</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: DIRECT AI GENERATION (Requirements 4 & 5) */}
          {activeTab === 'direct_ai' && (
            <div className="space-y-6">
              {/* Highlight Status Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#052B66] to-[#0d3f8f] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-[#45CC42] shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-bold uppercase bg-[#45CC42] text-[#052B66] px-2 py-0.5 rounded">
                      Universal Specification Ready
                    </span>
                    <span className="text-xs text-slate-300 font-mono">
                      {wordCount.toLocaleString()} words compiled
                    </span>
                  </div>
                  <h3 className="text-sm font-bold">
                    {course.name || course.structure?.title || 'Course Blueprint'}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-300 block">Selected Engine:</span>
                  <span className="text-xs font-bold text-[#45CC42]">
                    {selectedProvider === 'groq' ? 'Groq Cloud' : 'Google Gemini'} · {currentModelMeta?.displayName || selectedModel}
                  </span>
                </div>
              </div>

              {/* GENERATION CONFIGURATION AREA (Required by Prompt) */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#052B66]">
                  <Sliders className="w-4 h-4 text-[#45CC42]" />
                  <span>AI Engine & Model Configuration</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 1. AI Provider Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      AI Provider:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleProviderChange('gemini')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                          selectedProvider === 'gemini'
                            ? 'border-[#052B66] bg-blue-50/80 ring-2 ring-[#052B66]/20'
                            : 'border-slate-200 bg-white hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-[#052B66]">Google Gemini</span>
                          {selectedProvider === 'gemini' && <Check className="w-3.5 h-3.5 text-[#052B66] stroke-[3]" />}
                        </div>
                        <span className="text-[10px] text-slate-500">1M Token Context, Fast</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleProviderChange('groq')}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                          selectedProvider === 'groq'
                            ? 'border-[#052B66] bg-orange-50/80 ring-2 ring-[#052B66]/20'
                            : 'border-slate-200 bg-white hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-[#EA580C]">Groq Cloud</span>
                          {selectedProvider === 'groq' && <Check className="w-3.5 h-3.5 text-[#EA580C] stroke-[3]" />}
                        </div>
                        <span className="text-[10px] text-slate-500">LPU Ultra-Low Latency</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. AI Model Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      AI Model ({selectedProvider === 'groq' ? 'Groq Models' : 'Gemini Models'}):
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => onSelectModel(e.target.value)}
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

                  {/* 3. Generation Task Selection */}
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

                {/* Selected Model Capabilities Badges */}
                {currentModelMeta && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#052B66]">{currentModelMeta.displayName}</span>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        ID: {currentModelMeta.id}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      {currentModelMeta.capabilities.structuredOutput && (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                          Structured JSON
                        </span>
                      )}
                      {currentModelMeta.capabilities.longContext && (
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold border border-blue-200">
                          Long Context Window
                        </span>
                      )}
                      {currentModelMeta.capabilities.fastInference && (
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                          Fast Inference
                        </span>
                      )}
                      {currentModelMeta.capabilities.reasoning && (
                        <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-semibold border border-purple-200">
                          Reasoning
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Primary Action Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500">
                    The generated course will conform strictly to the <strong>GeneratedCourse</strong> schema with POPIA validation.
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

              {/* Supported Models Cards Comparison */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#052B66]">
                    Available {selectedProvider === 'groq' ? 'Groq' : 'Google Gemini'} Models:
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Task-specific capability filtered
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableModelsForProvider.map(m => {
                    const isSelected = selectedModel === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => onSelectModel(m.id)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 relative ${
                          isSelected
                            ? 'border-[#45CC42] bg-[#45CC42]/5 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-[#052B66]">
                              {m.displayName}
                            </span>
                            {m.recommendedBadge && (
                              <span className="text-[10px] font-bold bg-[#45CC42]/20 text-[#052B66] px-2 py-0.5 rounded-full">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                            {m.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                          <span>Context: {(m.contextWindow / 1024).toFixed(0)}k tokens</span>
                          <span className="font-mono text-slate-600">{m.id}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXTERNAL AI TOOLS (Preserved optional prompt-copy workflow) */}
          {activeTab === 'external_ai' && (
            <div className="space-y-6">
              <div className="text-xs text-slate-600">
                You can copy the compiled Master Prompt tailored for external web tools like Claude 3.5 Sonnet, ChatGPT GPT-4o, DeepSeek, or Mistral.
              </div>

              {/* External Cards */}
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
                            <span className="text-[10px] text-amber-700">
                              ({tool.reviewCount.toLocaleString()})
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

                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex flex-wrap gap-1.5">
                          {tool.strengths.map((str, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                            >
                              {str}
                            </span>
                          ))}
                        </div>
                        <div className="text-[11px] text-[#052B66] font-medium italic">
                          💡 {tool.recommendedFor}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected External Tool Action Strip */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-700">
                  Selected: <strong className="text-[#052B66]">{selectedExternalTool.name}</strong> ({selectedExternalTool.rating} ★)
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
                        <span>Prompt Copied for {selectedExternalTool.name}!</span>
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
                    <span>Open in {selectedExternalTool.name}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENT DOWNLOADS (.docx / .pdf / .md) */}
          {activeTab === 'documents' && (
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

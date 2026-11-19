import React, { useState, useEffect } from 'react';
import { Course, AIProvider } from '../types';
import { CourseTemplateOption, availableTemplates as defaultTemplates } from '../data/initialCourseData';
import { getClientModels, getDefaultModel } from '../utils/aiModels';
import { 
  Sparkles, 
  BookOpen, 
  X, 
  ArrowRight, 
  Layers, 
  Sliders, 
  Clock, 
  GraduationCap, 
  Building2, 
  Target, 
  Plus, 
  Trash2, 
  Check, 
  Cpu, 
  ShieldCheck,
  ChevronDown,
  Info
} from 'lucide-react';

export interface QuickCourseFormData {
  title: string;
  description: string;
  targetAudience: string;
  industryDomain: string;
  difficultyLevel: string;
  estimatedDuration: string;
  learningObjectives: string[];
  templateId: string;
  provider: AIProvider;
  model: string;
}

interface QuickAICourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTemplates?: CourseTemplateOption[];
  initialTemplateId?: string;
  defaultProvider?: AIProvider;
  defaultModel?: string;
  onCreateAndGenerate: (data: QuickCourseFormData) => void;
  onOpenAdvancedBuilder: (data: QuickCourseFormData) => void;
}

const INDUSTRY_OPTIONS = [
  'Corporate Enterprise & Operations',
  'Banking, Financial Services & Insurance',
  'Information Technology & Cyber Security',
  'Healthcare & Pharmaceuticals',
  'Retail, Supply Chain & Logistics',
  'Manufacturing & Engineering',
  'Public Sector & Governance',
  'Professional Services & Legal',
  'Education & Non-Profit'
];

const DIFFICULTY_LEVELS = [
  { id: 'Beginner', label: 'Beginner / Foundational', desc: 'Core literacy and basic principles' },
  { id: 'Intermediate', label: 'Intermediate / Applied', desc: 'Workplace application and procedures' },
  { id: 'Advanced', label: 'Advanced / Strategic', desc: 'Complex problem-solving and audits' }
];

const DURATION_OPTIONS = [
  { id: '45 Minutes', label: 'Micro-Course (45 Mins)' },
  { id: '2 Hours', label: 'Short Course (2 Hours)' },
  { id: '4 Hours', label: 'Half Day (4 Hours)' },
  { id: '8 Hours', label: 'Full Day (8 Hours)' },
  { id: '16 Hours / 2 CPD Credits', label: 'Accredited (16 Hours / CPD)' }
];

export const QuickAICourseModal: React.FC<QuickAICourseModalProps> = ({
  isOpen,
  onClose,
  availableTemplates = defaultTemplates,
  initialTemplateId,
  defaultProvider = 'groq',
  defaultModel = 'openai/gpt-oss-120b',
  onCreateAndGenerate,
  onOpenAdvancedBuilder
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'advanced_preview'>('quick');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplateId || 'scratch');
  
  // Simplified fields for non-technical users
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [industryDomain, setIndustryDomain] = useState(INDUSTRY_OPTIONS[0]);
  const [difficultyLevel, setDifficultyLevel] = useState('Intermediate');
  const [estimatedDuration, setEstimatedDuration] = useState('4 Hours');
  const [objectives, setObjectives] = useState<string[]>(['']);
  
  // AI Engine
  const [provider, setProvider] = useState<AIProvider>(defaultProvider);
  const [model, setModel] = useState<string>(defaultModel);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  useEffect(() => {
    setProvider(defaultProvider);
    setModel(defaultModel);
  }, [defaultProvider, defaultModel]);

  useEffect(() => {
    if (isOpen) {
      const tplToUse = initialTemplateId || 'scratch';
      handleTemplateChange(tplToUse);
    }
  }, [isOpen, initialTemplateId]);

  if (!isOpen) return null;

  // Handle template selection auto-fill
  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplateId(tplId);
    if (tplId === 'scratch') {
      setTitle('');
      setDescription('');
      setTargetAudience('');
      setIndustryDomain(INDUSTRY_OPTIONS[0]);
      setDifficultyLevel('Intermediate');
      setEstimatedDuration('4 Hours');
      setObjectives(['']);
      return;
    }

    const tpl = availableTemplates.find(t => t.id === tplId);
    if (tpl && tpl.course) {
      const c = tpl.course;
      setTitle(c.name || c.structure?.title || '');
      setDescription(c.structure?.purposeStatement || c.problem?.taskOrSkill || '');
      setTargetAudience(c.structure?.targetRoles || c.problem?.targetGroup || '');
      if (c.structure?.industryDomain) {
        setIndustryDomain(c.structure.industryDomain);
      }
      if (c.structure?.difficultyLevel) {
        setDifficultyLevel(c.structure.difficultyLevel);
      }
      if (c.structure?.estimatedDuration) {
        setEstimatedDuration(c.structure.estimatedDuration);
      }
      if (c.learningDesign?.learningObjectivesList && c.learningDesign.learningObjectivesList.length > 0) {
        setObjectives(c.learningDesign.learningObjectivesList);
      } else {
        setObjectives(['']);
      }
    }
  };

  const handleAddObjective = () => {
    setObjectives(prev => [...prev, '']);
  };

  const handleUpdateObjective = (index: number, val: string) => {
    setObjectives(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives(prev => prev.filter((_, idx) => idx !== index));
  };

  const cleanObjectives = objectives.map(o => o.trim()).filter(Boolean);

  const getFormData = (): QuickCourseFormData => ({
    title: title.trim() || 'Workplace Capabilities Course',
    description: description.trim() || `Equip learners with practical competencies, standard operating procedures, and risk compliance.`,
    targetAudience: targetAudience.trim() || 'Corporate team members, consultants, and supervisors',
    industryDomain,
    difficultyLevel,
    estimatedDuration,
    learningObjectives: cleanObjectives,
    templateId: selectedTemplateId,
    provider,
    model
  });

  const handleGenerateClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a course title to continue.');
      return;
    }
    onCreateAndGenerate(getFormData());
    onClose();
  };

  const handleAdvancedClick = () => {
    if (!title.trim()) {
      alert('Please enter a course title to continue.');
      return;
    }
    onOpenAdvancedBuilder(getFormData());
    onClose();
  };

  const availableModels = getClientModels(provider, 'course_generation');

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
    >
      <div 
        id="quick-ai-course-creation-modal"
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 border border-slate-200 text-slate-900 overflow-hidden flex flex-col font-sora animate-in fade-in zoom-in-95"
      >
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-[#052B66] to-[#0a3d8f] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#45CC42] flex items-center justify-center text-[#052B66] shadow-md">
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-tight">Quick AI Course Creator</h2>
                <span className="text-[10px] font-bold uppercase bg-[#45CC42] text-[#052B66] px-2 py-0.5 rounded">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Provide basic goals — AI automatically generates the 9-section curriculum & scenarios.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleGenerateClick} className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[calc(85vh-160px)]">
          
          {/* 1. Optional Template Preset Auto-Fill Bar */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#052B66] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#45CC42]" />
                <span>Choose a Starting Template (Optional)</span>
              </label>
              <span className="text-[11px] text-slate-400">Pre-populates fields with proven outlines</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTemplateChange('scratch')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex flex-col justify-between ${
                  selectedTemplateId === 'scratch'
                    ? 'border-[#052B66] bg-blue-50/80 font-bold text-[#052B66] ring-2 ring-[#052B66]/20'
                    : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>Blank Blueprint</span>
                <span className="text-[10px] text-slate-400 font-normal">Custom course from scratch</span>
              </button>

              {availableTemplates.slice(0, 2).map(tpl => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleTemplateChange(tpl.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex flex-col justify-between truncate ${
                    selectedTemplateId === tpl.id
                      ? 'border-[#052B66] bg-blue-50/80 font-bold text-[#052B66] ring-2 ring-[#052B66]/20'
                      : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                  title={tpl.name}
                >
                  <span className="truncate">{tpl.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal truncate">{tpl.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Core Course Essentials */}
          <div className="space-y-4">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Workplace Cybersecurity & POPIA Data Protection"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-[#052B66] focus:ring-2 focus:ring-[#052B66]/15 outline-none font-semibold placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            {/* Topic & Description */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Course Topic or Core Problem to Solve
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="e.g. Equipping employees with practical knowledge to identify phishing emails, handle client records lawfully, and avoid data breach liabilities under South African POPIA regulations."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-[#052B66] focus:ring-2 focus:ring-[#052B66]/15 outline-none placeholder:text-slate-400 leading-relaxed"
              />
            </div>

            {/* Target Audience & Industry in 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Target Audience / Roles
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                  placeholder="e.g. Team leads, consultants, customer agents"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-[#052B66] focus:ring-1 focus:ring-[#052B66] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Industry / Sector
                </label>
                <select
                  value={industryDomain}
                  onChange={e => setIndustryDomain(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:border-[#052B66] focus:ring-1 focus:ring-[#052B66] outline-none cursor-pointer"
                >
                  {INDUSTRY_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Learning Level & Duration in 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Learning Difficulty Level
                </label>
                <select
                  value={difficultyLevel}
                  onChange={e => setDifficultyLevel(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:border-[#052B66] focus:ring-1 focus:ring-[#052B66] outline-none cursor-pointer"
                >
                  {DIFFICULTY_LEVELS.map(lvl => (
                    <option key={lvl.id} value={lvl.id}>{lvl.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Target Duration
                </label>
                <select
                  value={estimatedDuration}
                  onChange={e => setEstimatedDuration(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:border-[#052B66] focus:ring-1 focus:ring-[#052B66] outline-none cursor-pointer"
                >
                  {DURATION_OPTIONS.map(dur => (
                    <option key={dur.id} value={dur.id}>{dur.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Key Learning Objectives */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Optional Key Objectives (or let AI formulate them)
                </label>
                <button
                  type="button"
                  onClick={handleAddObjective}
                  className="text-[11px] font-bold text-[#052B66] hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Goal</span>
                </button>
              </div>

              <div className="space-y-2">
                {objectives.map((obj, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 font-mono w-4">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={obj}
                      onChange={e => handleUpdateObjective(idx, e.target.value)}
                      placeholder={
                        idx === 0
                          ? 'e.g. Identify common cyber vulnerabilities and phishing warning signs'
                          : idx === 1
                          ? 'e.g. Apply POPIA conditions when processing customer personal identifiers'
                          : 'e.g. Execute verified escalation protocols without unauthorized workarounds'
                      }
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-[#052B66] focus:ring-1 focus:ring-[#052B66] outline-none"
                    />
                    {objectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveObjective(idx)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Engine & Advanced Details Accordion */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAdvancedSettings(prev => !prev)}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer py-1"
              >
                <Sliders className="w-3.5 h-3.5 text-[#052B66]" />
                <span>AI Engine Settings ({provider === 'gemini' ? 'Google Gemini' : 'Groq Cloud'})</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvancedSettings ? 'rotate-180' : ''}`} />
              </button>

              {showAdvancedSettings && (
                <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      AI Provider:
                    </label>
                    <select
                      value={provider}
                      onChange={e => {
                        const nextP = e.target.value as AIProvider;
                        setProvider(nextP);
                        setModel(getDefaultModel(nextP, 'course_generation'));
                      }}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
                    >
                      <option value="groq">Groq Cloud (Fast LPU)</option>
                      <option value="gemini">Google Gemini (1M Context)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Model:
                    </label>
                    <select
                      value={model}
                      onChange={e => setModel(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
                    >
                      {availableModels.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.displayName} {m.isDefault ? '★' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Action Strip: Primary Generate CTA vs Advanced Builder Link */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Option B: Advanced Link */}
            <button
              type="button"
              onClick={handleAdvancedClick}
              className="text-xs font-bold text-slate-600 hover:text-[#052B66] underline cursor-pointer text-left"
              title="Open full 9-section manual editor"
            >
              Option B: Open in Advanced 9-Section Builder →
            </button>

            {/* Option A: Primary AI Generation Button */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                id="quick-modal-generate-btn"
                className="px-6 py-3 rounded-xl text-xs font-black text-[#052B66] bg-[#45CC42] hover:bg-[#3ec23b] shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#052B66] stroke-[2.5]" />
                <span>GENERATE COMPLETE COURSE WITH AI</span>
                <ArrowRight className="w-4 h-4 text-[#052B66]" />
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

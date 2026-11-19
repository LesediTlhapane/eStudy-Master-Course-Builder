import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Minus, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw,
  Layers,
  BookOpen,
  Cpu,
  Copy,
  Check,
  MessageSquarePlus
} from 'lucide-react';
import { Course, SectionId, AIProvider, CopilotAgreedRequirements, CopilotMode } from '../types';
import { QAResult } from '../utils/qaEngine';
import { AppView } from '../hooks/useCourseStore';
import { processLocalCopilotChat } from '../utils/localCourseEngine';
import { createScratchCourse } from '../data/initialCourseData';
import { getClientModels, getDefaultModel } from '../utils/aiModels';

interface FloatingCourseCopilotProps {
  course: Course;
  activeSection: SectionId;
  view: AppView;
  qaResult: QAResult;
  selectedProvider?: AIProvider;
  selectedModel?: string;
  onSelectProvider?: (provider: AIProvider) => void;
  onSelectModel?: (model: string) => void;
  onUpdateCourse: (updater: Partial<Course> | ((prev: Course) => Course)) => void;
  onJumpToSection: (section: SectionId, fieldId?: string) => void;
  onStartAIGeneration: () => void;
  onNavigateView: (view: AppView) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode?: CopilotMode;
  suggestedActions?: Array<{
    id: string;
    label: string;
    actionType: 'generate_course' | 'apply_course_patch' | 'jump_to_section' | 'send_prompt' | 'add_knowledge_check' | 'open_builder';
    payload?: any;
  }>;
  courseBrief?: {
    ready: boolean;
    title: string;
    targetAudience: string;
    industryContext: string;
    duration: string;
    moduleCount: number;
  };
  coursePatch?: Partial<Course>;
}

const SECTION_TITLES: Record<SectionId, string> = {
  '01': 'Section 01 — Problem & Course Context',
  '02': 'Section 02 — Learner Profile & Sources',
  '03': 'Section 03 — Course Structure & Outcomes',
  '04': 'Section 04 — Curriculum & Modules',
  '05': 'Section 05 — Learning Design & Scenarios',
  '06': 'Section 06 — Ethics & Responsible AI',
  '07': 'Section 07 — Output Format & Deliverables',
  '08': 'Section 08 — QA & Framework Validation',
  '09': 'Section 09 — Customisation & Delivery'
};

/**
 * Distinctive eStudy AI Robot Icon SVG
 * Friendly, professional, line-based digital learning assistant robot face
 */
const EStudyRobotIcon: React.FC<{ size?: number; className?: string; color?: string }> = ({ 
  size = 28, 
  className = '', 
  color = '#052B66' 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Antenna / Digital Node */}
      <circle cx="24" cy="6" r="3" fill={color} />
      <path d="M24 9V14" stroke={color} strokeWidth="3" strokeLinecap="round" />
      
      {/* Ears / Side audio receptors */}
      <rect x="5" y="20" width="4" height="12" rx="2" fill={color} />
      <rect x="39" y="20" width="4" height="12" rx="2" fill={color} />

      {/* Robot Head Body */}
      <rect x="8" y="14" width="32" height="24" rx="8" stroke={color} strokeWidth="3.5" fill="none" />
      
      {/* Visor Area */}
      <rect x="13" y="19" width="22" height="9" rx="4.5" fill={color} />
      
      {/* Friendly Glowing Eyes */}
      <circle cx="19" cy="23.5" r="2.2" fill="#45CC42" />
      <circle cx="29" cy="23.5" r="2.2" fill="#45CC42" />
      
      {/* Digital Grid / Smile Line */}
      <path d="M19 32H29" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="16" cy="32" r="1" fill={color} />
      <circle cx="32" cy="32" r="1" fill={color} />
    </svg>
  );
};

function createWelcomeMessage(): ChatMessage {
  return {
    id: `msg-init-${Date.now()}`,
    role: 'assistant',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    mode: 'chat',
    content: `Hi! I'm your **eStudy Course Copilot**.\n\nChat with me naturally to **ask questions, brainstorm ideas, or plan a training programme** step by step—or ask me to **populate all 9 template sections** whenever you're ready!`,
    suggestedActions: [
      { id: 'act-plan-cloud', label: '☁️ Plan: Cloud Engineering for Beginners', actionType: 'send_prompt', payload: { prompt: 'I want to create a Cloud Engineering course for beginners.' } },
      { id: 'act-mech', label: '⚙️ Build Template: AI in Mechanical Engineering', actionType: 'send_prompt', payload: { prompt: 'Build a template for me "The use of AI in mechanical engineering"' } },
      { id: 'act-check', label: '🔍 Check Framework Compliance', actionType: 'send_prompt', payload: { prompt: 'Check my course framework compliance' } }
    ]
  };
}

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={i} className="px-1 py-0.5 rounded bg-slate-800 text-[#45CC42] font-mono text-[11px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function renderMessageMarkdown(content: string): React.ReactNode {
  const blocks = content.split(/\n\n+/);
  return blocks.map((block, bIdx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('### ')) {
      return (
        <h4 key={bIdx} className="font-bold text-sm text-[#45CC42] pt-1">
          {renderInlineMarkdown(trimmed.replace(/^###\s+/, ''))}
        </h4>
      );
    }

    const lines = trimmed.split('\n');
    const isBulletBlock = lines.every(l => /^\s*[-*•]\s+/.test(l));
    if (isBulletBlock) {
      return (
        <ul key={bIdx} className="list-disc pl-4 space-y-1">
          {lines.map((l, lIdx) => (
            <li key={lIdx}>{renderInlineMarkdown(l.replace(/^\s*[-*•]\s+/, ''))}</li>
          ))}
        </ul>
      );
    }

    const isNumberedBlock = lines.every(l => /^\s*\d+[.)]\s+/.test(l));
    if (isNumberedBlock) {
      return (
        <ol key={bIdx} className="list-decimal pl-4 space-y-1">
          {lines.map((l, lIdx) => (
            <li key={lIdx}>{renderInlineMarkdown(l.replace(/^\s*\d+[.)]\s+/, ''))}</li>
          ))}
        </ol>
      );
    }

    return (
      <p key={bIdx} className="whitespace-pre-wrap">
        {lines.map((line, lIdx) => (
          <React.Fragment key={lIdx}>
            {lIdx > 0 && <br />}
            {renderInlineMarkdown(line)}
          </React.Fragment>
        ))}
      </p>
    );
  });
}

function applyCleanCoursePatch(prev: Course, patch: Partial<Course>): Course {
  const cleanTitle = patch.structure?.title || patch.name || 'Untitled Course';
  const scratchBase = createScratchCourse(cleanTitle);

  return {
    ...scratchBase,
    id: prev.id,
    uploadedTemplateName: prev.uploadedTemplateName,
    flaggedFields: prev.flaggedFields && prev.name === cleanTitle ? prev.flaggedFields : {},
    ...patch,
    name: patch.name || patch.structure?.title || cleanTitle,
    code: patch.code || patch.structure?.code || scratchBase.code,
    structure: {
      ...scratchBase.structure,
      ...(patch.structure || {}),
      title: patch.structure?.title || patch.name || cleanTitle
    },
    problem: {
      ...scratchBase.problem,
      ...(patch.problem || {})
    },
    research: {
      ...scratchBase.research,
      ...(patch.research || {}),
      learnerProfile: {
        ...(scratchBase.research?.learnerProfile || ({} as any)),
        ...(patch.research?.learnerProfile || {})
      }
    },
    modules: patch.modules && patch.modules.length > 0 ? patch.modules : scratchBase.modules,
    learningDesign: {
      ...scratchBase.learningDesign,
      ...(patch.learningDesign || {})
    },
    ethics: {
      ...scratchBase.ethics,
      ...(patch.ethics || {})
    },
    outputRequirements: {
      ...scratchBase.outputRequirements,
      ...(patch.outputRequirements || {})
    },
    qa: {
      ...scratchBase.qa,
      ...(patch.qa || {}),
      checklistItems: {
        ...(scratchBase.qa?.checklistItems || {}),
        ...(patch.qa?.checklistItems || {})
      }
    },
    customisation: {
      ...scratchBase.customisation,
      ...(patch.customisation || {})
    }
  };
}

export const FloatingCourseCopilot: React.FC<FloatingCourseCopilotProps> = ({
  course,
  activeSection,
  view,
  qaResult,
  selectedProvider = 'groq',
  selectedModel = 'openai/gpt-oss-120b',
  onSelectProvider,
  onSelectModel,
  onUpdateCourse,
  onJumpToSection,
  onStartAIGeneration,
  onNavigateView
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [lastViewedSection, setLastViewedSection] = useState<SectionId>(activeSection);

  // Per-conversation isolated state
  const [conversationId, setConversationId] = useState<string>(() => `conv-${Date.now()}`);
  const [agreedRequirements, setAgreedRequirements] = useState<CopilotAgreedRequirements | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createWelcomeMessage()]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Section change contextual notification
  useEffect(() => {
    if (activeSection !== lastViewedSection && isOpen) {
      setLastViewedSection(activeSection);
    }
  }, [activeSection, lastViewedSection, isOpen]);

  // Start a fresh conversation with complete context isolation
  const handleNewConversation = () => {
    setConversationId(`conv-${Date.now()}`);
    setAgreedRequirements(null);
    setCopiedMessageId(null);
    setInputText('');
    setMessages([createWelcomeMessage()]);
  };

  // Copy an individual assistant message cleanly
  const handleCopyMessage = async (msgId: string, content: string) => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(content);
      } else {
        const ta = document.createElement('textarea');
        ta.value = content;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedMessageId(msgId);
      setTimeout(() => {
        setCopiedMessageId(prev => (prev === msgId ? null : prev));
      }, 2000);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  // Handle sending a message
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInputText('');
    setIsLoading(true);

    try {
      let data: any = null;

      try {
        const response = await fetch('/api/copilot/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: nextHistory.map(m => ({ role: m.role, content: m.content })),
            currentCourse: course,
            activeSection: activeSection,
            qaResult: qaResult,
            provider: selectedProvider,
            model: selectedModel,
            agreedRequirements,
            conversationId
          })
        });

        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          console.warn(`Copilot API response was not JSON or not OK (${response.status}). Engaging local framework engine.`);
          data = processLocalCopilotChat({
            messages: nextHistory,
            currentCourse: course,
            activeSection: activeSection,
            qaResult: qaResult,
            agreedRequirements,
            conversationId
          });
        }
      } catch (fetchErr: any) {
        console.warn('Backend copilot fetch failed, executing via client framework engine:', fetchErr);
        data = processLocalCopilotChat({
          messages: nextHistory,
          currentCourse: course,
          activeSection: activeSection,
          qaResult: qaResult,
          agreedRequirements,
          conversationId
        });
      }

      if (!data) {
        throw new Error('No response returned from copilot engine');
      }

      // Sync isolated conversation requirements state
      if ('agreedRequirements' in data) {
        setAgreedRequirements(data.agreedRequirements || null);
      }

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        mode: data.mode || (data.coursePatch ? 'course_creation' : 'chat'),
        content: data.message || 'I have processed your request.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: data.suggestedActions || [],
        courseBrief: data.courseBrief,
        coursePatch: data.coursePatch
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Apply 9-section template patch ONLY when explicitly in course creation mode
      if (data.coursePatch) {
        onUpdateCourse(prev => applyCleanCoursePatch(prev, data.coursePatch));

        if (view === 'cover' || view === 'dashboard') {
          onNavigateView('builder');
        }
      }

      if (!isOpen) {
        setHasNewNotification(true);
      }
    } catch (err: any) {
      console.error('Failed to get copilot chat response:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        mode: 'chat',
        content: `Something went wrong while generating the response. Please check your network or try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          {
            id: 'retry',
            label: '🔄 Try Again',
            actionType: 'send_prompt',
            payload: { prompt: messageContent }
          }
        ]
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggested action clicks
  const handleActionClick = (action: { actionType: string; payload?: any }) => {
    if (action.actionType === 'generate_course') {
      onStartAIGeneration();
    } else if (action.actionType === 'open_builder') {
      onNavigateView('builder');
      if (action.payload?.section) {
        onJumpToSection(action.payload.section as SectionId);
      }
    } else if (action.actionType === 'open_preview') {
      onNavigateView('preview');
    } else if (action.actionType === 'jump_to_section') {
      const targetSec = (action.payload?.section as SectionId) || '01';
      onNavigateView('builder');
      onJumpToSection(targetSec);
    } else if (action.actionType === 'apply_course_patch' && action.payload) {
      onUpdateCourse(prev => applyCleanCoursePatch(prev, action.payload));
      onNavigateView('builder');

      const confirmMsg: ChatMessage = {
        id: `ast-confirm-${Date.now()}`,
        role: 'assistant',
        mode: 'course_creation',
        content: `✅ **Updates applied to Course Builder!**\n\nAll 9 section parameters have been updated in your active workspace.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { id: 'view-qa', label: '🔍 Check Framework Readiness', actionType: 'send_prompt', payload: { prompt: 'Check my course framework compliance' } },
          { id: 'gen-course-now', label: '⚡ Generate Full Course', actionType: 'generate_course' }
        ]
      };
      setMessages(prev => [...prev, confirmMsg]);
    } else if (action.actionType === 'send_prompt' && action.payload?.prompt) {
      handleSendMessage(action.payload.prompt);
    }
  };

  // Toggle chat open/close
  const toggleChat = () => {
    setIsOpen(prev => {
      const next = !prev;
      if (next) {
        setHasNewNotification(false);
      }
      return next;
    });
  };

  return (
    <div id="estudy-floating-copilot-container" className="fixed z-50 bottom-6 right-6">
      {/* Floating Robot Button */}
      <div className="relative flex items-center justify-end">
        {/* Tooltip on hover (when chat is closed) */}
        <AnimatePresence>
          {isHovered && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-20 bottom-2 bg-[#052B66] text-white px-3.5 py-2 rounded-xl shadow-xl border border-slate-700/60 pointer-events-none whitespace-nowrap z-50 flex flex-col items-end"
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#45CC42]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>eStudy Course Copilot</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">Build, improve & validate your course</p>
              {/* Tooltip arrow */}
              <div className="absolute right-[-6px] bottom-4 w-3 h-3 bg-[#052B66] rotate-45 border-r border-t border-slate-700/60" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Robot Action Button */}
        <motion.button
          id="estudy-copilot-toggle-button"
          onClick={toggleChat}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          animate={{
            y: isOpen ? 0 : [0, -4, 0],
            boxShadow: isOpen 
              ? '0 8px 25px rgba(5, 43, 102, 0.4)' 
              : hasNewNotification 
                ? ['0 4px 20px rgba(69,204,66,0.6)', '0 4px 30px rgba(69,204,66,0.9)', '0 4px 20px rgba(69,204,66,0.6)']
                : '0 6px 24px rgba(69, 204, 66, 0.45)'
          }}
          transition={{
            y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            boxShadow: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
          }}
          aria-label={isOpen ? "Close eStudy Course Copilot" : "Open eStudy Course Copilot"}
          className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#45CC42] flex items-center justify-center cursor-pointer border-2 border-white/80 shadow-xl transition-colors focus:outline-none focus:ring-4 focus:ring-[#45CC42]/50 ${
            isOpen ? 'bg-[#052B66] text-[#45CC42] border-[#45CC42]' : 'text-[#052B66]'
          }`}
        >
          {isOpen ? (
            <X className="w-7 h-7 text-[#45CC42] transition-transform duration-200 hover:rotate-90" />
          ) : (
            <div className="relative flex items-center justify-center">
              <EStudyRobotIcon size={34} color="#052B66" />
              {/* Subtle green active light */}
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#45CC42] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#45CC42] border-2 border-[#052B66]"></span>
              </span>
            </div>
          )}
        </motion.button>
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="estudy-copilot-chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-4 sm:right-6 bottom-[92px] sm:bottom-[100px] w-[calc(100vw-32px)] sm:w-[410px] h-[580px] max-h-[calc(100vh-130px)] bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden z-50 backdrop-blur-lg"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#052B66] to-[#0a3d8f] px-4 py-3.5 border-b border-slate-700/60 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#45CC42] flex items-center justify-center shadow-md">
                  <EStudyRobotIcon size={24} color="#052B66" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-white tracking-tight">eStudy Course Copilot</h3>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#45CC42]/20 text-[#45CC42] border border-[#45CC42]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#45CC42] animate-pulse"></span>
                      Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">AI-powered course authoring assistant</p>
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-1">
                <button
                  id="copilot-new-chat-btn"
                  onClick={handleNewConversation}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-200 hover:text-white hover:bg-white/15 transition-colors cursor-pointer flex items-center gap-1 border border-white/15"
                  title="Start New Conversation (clears chat history & planned requirements)"
                  aria-label="Start New Conversation"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5 text-[#45CC42]" />
                  <span>New Chat</span>
                </button>
                <button
                  id="copilot-minimise-btn"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Minimise Copilot"
                  aria-label="Minimise Copilot"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  id="copilot-close-btn"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close Copilot"
                  aria-label="Close Copilot"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Current Context Banner */}
            <div className="bg-[#052B66]/60 border-b border-slate-800/80 px-3.5 py-2 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-1.5 truncate">
                <BookOpen className="w-3.5 h-3.5 text-[#45CC42] flex-shrink-0" />
                <span className="truncate font-medium text-slate-200">
                  {agreedRequirements?.subject
                    ? `Plan: ${agreedRequirements.subject}${agreedRequirements.difficultyLevel ? ` (${agreedRequirements.difficultyLevel})` : ''}`
                    : course.name || course.structure.title || 'Untitled Course'}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 pl-2 text-[11px] text-slate-400">
                <span>Sec {activeSection}</span>
                <span className="text-[#45CC42] font-semibold">({qaResult.scorePercent}%)</span>
              </div>
            </div>

            {/* AI Engine Indicator & Model Selector */}
            <div className="bg-slate-800/80 border-b border-slate-700/60 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#45CC42]" />
                <span className="text-slate-400">Engine:</span>
                <select
                  value="groq"
                  onChange={(e) => {
                    const p = e.target.value as AIProvider;
                    if (onSelectProvider) onSelectProvider(p);
                    if (onSelectModel) onSelectModel(getDefaultModel(p, 'copilot'));
                  }}
                  className="bg-transparent text-white font-bold cursor-pointer border-0 p-0 text-[11px] focus:ring-0"
                >
                  <option value="groq" className="bg-slate-900 text-white">Groq Cloud</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <select
                  value={selectedModel}
                  onChange={(e) => {
                    if (onSelectModel) onSelectModel(e.target.value);
                  }}
                  className="bg-transparent text-[#45CC42] font-semibold cursor-pointer border-0 p-0 text-[10.5px] focus:ring-0 max-w-[170px] truncate"
                >
                  {getClientModels(selectedProvider, 'copilot').map(m => (
                    <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                      {m.displayName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Messages Content Area (Explicitly Mouse-Selectable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-slate-950/70 select-text">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed select-text cursor-text ${
                      msg.role === 'user'
                        ? 'bg-[#052B66] text-white border border-blue-800/60 rounded-br-none shadow-md'
                        : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none shadow-md'
                    }`}
                  >
                    {/* Message Body */}
                    <div className="space-y-2 select-text">
                      {renderMessageMarkdown(msg.content)}
                    </div>

                    {/* Render Ready Course Brief Card if present */}
                    {msg.courseBrief && msg.courseBrief.ready && (
                      <div className="mt-3 p-3 bg-[#052B66]/80 rounded-xl border border-[#45CC42]/40 text-xs space-y-2 select-text">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-700/50">
                          <span className="font-bold text-[#45CC42] uppercase text-[10px] tracking-wider">
                            MASTER COURSE BRIEF
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-[#45CC42]/20 text-[#45CC42] text-[10px] font-bold">
                            Ready to Generate
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-1 text-slate-300">
                          <div><span className="text-slate-400 font-semibold">Course:</span> {msg.courseBrief.title}</div>
                          <div><span className="text-slate-400 font-semibold">Audience:</span> {msg.courseBrief.targetAudience}</div>
                          <div><span className="text-slate-400 font-semibold">Context:</span> {msg.courseBrief.industryContext}</div>
                          <div><span className="text-slate-400 font-semibold">Duration:</span> {msg.courseBrief.duration}</div>
                          <div><span className="text-slate-400 font-semibold">Curriculum:</span> {msg.courseBrief.moduleCount} Standard Modules</div>
                        </div>
                      </div>
                    )}

                    {/* Timestamp & Copy Button */}
                    <div className={`mt-2 flex items-center justify-between gap-3 text-[10px] ${msg.role === 'user' ? 'justify-end' : ''}`}>
                      {msg.role === 'assistant' && (
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/70 transition-colors cursor-pointer select-none"
                          title="Copy response text"
                          aria-label="Copy response text"
                        >
                          {copiedMessageId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#45CC42]" />
                              <span className="text-[#45CC42] font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}
                      <span className="opacity-60 select-none">{msg.timestamp}</span>
                    </div>
                  </div>

                  {/* Render Suggested Action Buttons */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[92%]">
                      {msg.suggestedActions.map(action => (
                        <button
                          key={action.id}
                          onClick={() => handleActionClick(action)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                            action.actionType === 'generate_course'
                              ? 'bg-[#45CC42] text-[#052B66] font-bold hover:bg-[#3db83a] shadow-[0_2px_10px_rgba(69,204,66,0.3)]'
                              : action.actionType === 'open_builder'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-500 hover:to-indigo-500 shadow-md border border-blue-400/40'
                                : action.actionType === 'apply_course_patch'
                                  ? 'bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 border border-blue-500/40'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 hover:text-white'
                          }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-400 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 w-fit">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#45CC42]" />
                  <span>eStudy Copilot is formulating course recommendations...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Context Action Bar */}
            <div className="px-3 py-1.5 bg-slate-900 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-400 scrollbar-none">
              <button
                onClick={() => handleSendMessage('Check my course framework compliance')}
                className="whitespace-nowrap px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              >
                <ShieldCheck className="w-3 h-3 text-[#45CC42]" />
                Check QA
              </button>
              <button
                onClick={() => handleSendMessage('Make scenarios authentic to South African workplaces')}
                className="whitespace-nowrap px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-[#45CC42]" />
                SA Scenarios
              </button>
              <button
                onClick={() => handleSendMessage(`Help me complete ${SECTION_TITLES[activeSection]}`)}
                className="whitespace-nowrap px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              >
                <Layers className="w-3 h-3 text-[#45CC42]" />
                Sec {activeSection} Guide
              </button>
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <textarea
                  id="copilot-user-input"
                  ref={textareaRef}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask anything, brainstorm a programme, or request a course..."
                  rows={1}
                  disabled={isLoading}
                  className="flex-1 bg-slate-950 text-slate-100 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-slate-800 focus:border-[#45CC42] focus:outline-none focus:ring-1 focus:ring-[#45CC42] resize-none max-h-24 placeholder:text-slate-500 disabled:opacity-50 select-text"
                  aria-label="Ask anything, brainstorm a programme, or request a course"
                />

                <button
                  id="copilot-send-btn"
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  aria-label="Send message to Course Copilot"
                  className="h-10 w-10 rounded-xl bg-[#45CC42] text-[#052B66] flex items-center justify-center font-bold hover:bg-[#3db83a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md flex-shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

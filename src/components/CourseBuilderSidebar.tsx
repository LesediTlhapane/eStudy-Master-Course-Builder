import React from 'react';
import { SectionId, SectionMeta } from '../types';
import { QAResult } from '../utils/qaEngine';
import { 
  Check, 
  Sparkles, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Award, 
  HelpCircle,
  FileCheck2,
  ChevronRight
} from 'lucide-react';

export const SECTIONS: SectionMeta[] = [
  {
    id: '01',
    number: '01',
    title: 'Problem & Needs',
    shortTitle: '01 Problem',
    description: 'Workplace Challenge & Target Audience'
  },
  {
    id: '02',
    number: '02',
    title: 'Sources & Evidence',
    shortTitle: '02 Sources',
    description: 'Statutory Citations, Standards & Policies'
  },
  {
    id: '03',
    number: '03',
    title: 'Structure & Outcomes',
    shortTitle: '03 Structure',
    description: 'Course Architecture & Core Deliverables'
  },
  {
    id: '04',
    number: '04',
    title: 'Modules & Scenarios',
    shortTitle: '04 Modules',
    description: 'Module Breakdown & Workplace Scenarios'
  },
  {
    id: '05',
    number: '05',
    title: 'Learning Design',
    shortTitle: '05 Learning Design',
    description: 'Pedagogical Framework & Rubrics'
  },
  {
    id: '06',
    number: '06',
    title: 'Ethics & AI Responsibility',
    shortTitle: '06 Ethics',
    description: 'POPIA Compliance & Responsible AI'
  },
  {
    id: '07',
    number: '07',
    title: 'Output Specifications',
    shortTitle: '07 Output',
    description: 'Deliverables & Formatting Directives'
  },
  {
    id: '08',
    number: '08',
    title: 'Quality Assurance',
    shortTitle: '08 QA',
    description: 'Readiness Audit & Compliance Scoring'
  },
  {
    id: '09',
    number: '09',
    title: 'Customisation & Branding',
    shortTitle: '09 Customisation',
    description: 'Corporate Branding & Adaptation Ledger'
  }
];

interface CourseBuilderSidebarProps {
  activeSection: SectionId;
  qaResult: QAResult;
  onSelectSection: (sectionId: SectionId) => void;
  onStartAIGeneration?: () => void;
  onOpenPreview?: () => void;
}

export const CourseBuilderSidebar: React.FC<CourseBuilderSidebarProps> = ({
  activeSection,
  qaResult,
  onSelectSection,
  onStartAIGeneration,
  onOpenPreview
}) => {
  // Count how many sections are marked as complete
  const completedSectionsCount = Object.values(qaResult.sectionProgress).filter(
    (s: { status: string }) => s.status === 'Complete'
  ).length;

  const phaseGroups = [
    {
      label: 'PHASE 1 · FOUNDATIONS',
      sections: SECTIONS.slice(0, 3)
    },
    {
      label: 'PHASE 2 · CURRICULUM',
      sections: SECTIONS.slice(3, 5)
    },
    {
      label: 'PHASE 3 · GOVERNANCE & QA',
      sections: SECTIONS.slice(5, 9)
    }
  ];

  return (
    <aside
      id="course-builder-sidebar"
      className="w-68 bg-[#052B66] text-white flex flex-col justify-between shrink-0 select-none h-[calc(100vh-4rem)] sticky top-16 shadow-inner z-20 border-r border-[#042150] overflow-y-auto"
    >
      {/* Navigation Header & Section List */}
      <div className="flex flex-col py-4 px-3 space-y-4">
        
        {/* Header */}
        <div className="px-2 pt-1 pb-2 border-b border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#45CC42] uppercase block">
              COURSE OUTLINE GUIDE
            </span>
            <span className="text-[11px] text-slate-300 font-medium">
              9-Section Enterprise Standard
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-[#45CC42] bg-[#45CC42]/20 px-2 py-0.5 rounded font-mono">
              {qaResult.scorePercent}% QA
            </span>
          </div>
        </div>

        {/* Client-Friendly Assistant Note */}
        <div className="mx-1 p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-[#45CC42]" />
            <span>AI Fast-Track Ready</span>
          </div>
          <p className="text-[10.5px] text-slate-300 leading-tight">
            You don't need to fill every detail manually. Set basic goals and let AI generate the full curriculum.
          </p>
        </div>

        {/* 3 Logical Phases */}
        <nav className="space-y-3.5">
          {phaseGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-2 text-[9.5px] font-bold tracking-wider text-slate-400 uppercase font-mono">
                {group.label}
              </div>

              <div className="space-y-0.5">
                {group.sections.map(sec => {
                  const isCurrent = activeSection === sec.id;
                  const progress = qaResult.sectionProgress[sec.id];
                  const isComplete = progress?.status === 'Complete';

                  return (
                    <button
                      key={sec.id}
                      id={`sidebar-nav-section-${sec.id}`}
                      onClick={() => onSelectSection(sec.id)}
                      className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer group relative ${
                        isCurrent
                          ? 'bg-white/15 text-white font-bold shadow-xs border-l-4 border-[#45CC42]'
                          : 'text-slate-200 hover:text-white hover:bg-white/5 font-medium'
                      }`}
                    >
                      {/* State Checkmark / Dot */}
                      <span className="shrink-0 flex items-center justify-center w-3.5 h-3.5">
                        {isComplete ? (
                          <Check className="w-3.5 h-3.5 text-[#45CC42] stroke-[3]" />
                        ) : isCurrent ? (
                          <span className="w-2 h-2 rounded-full bg-[#45CC42] ring-3 ring-[#45CC42]/30" />
                        ) : (
                          <span className="w-2 h-2 rounded-full border border-slate-400 group-hover:border-white" />
                        )}
                      </span>

                      {/* Number and Title */}
                      <div className="flex items-center gap-1.5 truncate flex-1">
                        <span className={`font-mono text-[10.5px] ${isCurrent ? 'text-[#45CC42] font-bold' : 'text-slate-300'}`}>
                          {sec.number}
                        </span>
                        <span className="truncate tracking-tight text-[11.5px]">
                          {sec.title}
                        </span>
                      </div>

                      {/* Score badge for Section 8 */}
                      {sec.id === '08' && (
                        <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-white/10 text-white font-medium shrink-0">
                          {qaResult.scorePercent}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Sticky Action Area: Progress & AI Generation CTA */}
      <div className="p-4 bg-[#042150] border-t border-white/10 space-y-3 shrink-0">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium mb-1">
            <span>{completedSectionsCount} of 9 sections</span>
            <span className="font-semibold text-[#45CC42]">
              {Math.round((completedSectionsCount / 9) * 100)}%
            </span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#45CC42] h-full transition-all duration-500 rounded-full"
              style={{ width: `${Math.max(10, (completedSectionsCount / 9) * 100)}%` }}
            />
          </div>
        </div>

        {/* Primary Action Button */}
        {onStartAIGeneration && (
          <button
            id="sidebar-generate-ai-btn"
            onClick={onStartAIGeneration}
            className="w-full py-2.5 px-3 rounded-xl bg-[#45CC42] hover:bg-[#3ec23b] text-[#052B66] text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#052B66]" />
            <span>Generate Course with AI</span>
          </button>
        )}

        {onOpenPreview && (
          <button
            onClick={onOpenPreview}
            className="w-full py-1.5 text-center text-[11px] text-slate-300 hover:text-white hover:underline cursor-pointer"
          >
            View Compiled Master Prompt →
          </button>
        )}
      </div>
    </aside>
  );
};

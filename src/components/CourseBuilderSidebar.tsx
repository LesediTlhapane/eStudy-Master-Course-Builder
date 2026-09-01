import React from 'react';
import { SectionId, SectionMeta } from '../types';
import { QAResult } from '../utils/qaEngine';
import { Check, Lock, ShieldCheck, Sparkles } from 'lucide-react';

export const SECTIONS: SectionMeta[] = [
  {
    id: '01',
    number: '01',
    title: 'Problem & Challenge',
    shortTitle: '01 Problem',
    description: 'Problem Definition & Operational Context'
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
    title: 'Structure & Diagnostics',
    shortTitle: '03 Structure',
    description: 'Course Architecture & Diagnostic Pre-Assessment'
  },
  {
    id: '04',
    number: '04',
    title: 'Modules & Scenarios',
    shortTitle: '04 Modules',
    description: '3-Module Architecture & Workplace Scenarios'
  },
  {
    id: '05',
    number: '05',
    title: 'Learning Design',
    shortTitle: '05 Learning Design',
    description: 'Pedagogical Framework, Bloom Taxonomy & Rubrics'
  },
  {
    id: '06',
    number: '06',
    title: 'Ethics & AI Responsibility',
    shortTitle: '06 Ethics',
    description: 'POPIA Compliance, 8 Ethical Dimensions & Human Oversight'
  },
  {
    id: '07',
    number: '07',
    title: 'Output Specifications',
    shortTitle: '07 Output',
    description: 'Formatting Directives & Zero-Truncation Rules'
  },
  {
    id: '08',
    number: '08',
    title: 'Quality Assurance',
    shortTitle: '08 QA',
    description: '40-Criterion Quality Audit Rubric'
  },
  {
    id: '09',
    number: '09',
    title: 'Customisation & History',
    shortTitle: '09 Customisation',
    description: 'Enterprise Branding, Adaptation Ledger & Version Log'
  }
];

interface CourseBuilderSidebarProps {
  activeSection: SectionId;
  qaResult: QAResult;
  onSelectSection: (sectionId: SectionId) => void;
}

export const CourseBuilderSidebar: React.FC<CourseBuilderSidebarProps> = ({
  activeSection,
  qaResult,
  onSelectSection
}) => {
  // Count how many sections are marked as complete
  const completedSectionsCount = Object.values(qaResult.sectionProgress).filter(
    (s: { status: string }) => s.status === 'Complete'
  ).length;

  return (
    <aside
      id="course-builder-sidebar"
      className="w-64 bg-[#052B66] text-white flex flex-col justify-between shrink-0 select-none h-[calc(100vh-4rem)] sticky top-16 shadow-inner z-20 border-r border-[#042150]"
    >
      {/* Navigation Header & Section List */}
      <div className="flex flex-col py-5">
        <div className="px-5 pb-4 border-b border-white/10">
          <span className="text-[11px] font-bold tracking-widest text-[#45CC42] uppercase block">
            MASTER COURSE BUILDER
          </span>
          <span className="text-[10px] text-slate-300 font-medium tracking-wide">
            Universal Framework v9.0
          </span>
        </div>

        {/* 9 Sections matching the PowerPoint Master Sidebar */}
        <nav className="mt-3 px-2 space-y-1">
          {SECTIONS.map(sec => {
            const isCurrent = activeSection === sec.id;
            const progress = qaResult.sectionProgress[sec.id];
            const isComplete = progress?.status === 'Complete';

            return (
              <button
                key={sec.id}
                id={`sidebar-nav-section-${sec.id}`}
                onClick={() => onSelectSection(sec.id)}
                className={`w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs transition-all cursor-pointer group relative ${
                  isCurrent
                    ? 'bg-white/15 text-white font-bold shadow-xs border-l-4 border-[#45CC42]'
                    : 'text-slate-200 hover:text-white hover:bg-white/5 font-medium'
                }`}
              >
                {/* State Bullet: ○ = idle, ● = active, ✓ = complete */}
                <span className="shrink-0 flex items-center justify-center w-4 h-4">
                  {isComplete ? (
                    <Check className="w-4 h-4 text-[#45CC42] stroke-[2.5]" />
                  ) : isCurrent ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#45CC42] ring-3 ring-[#45CC42]/30" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full border border-slate-400 group-hover:border-white" />
                  )}
                </span>

                {/* Section Number & PowerPoint Name */}
                <div className="flex items-center gap-2 truncate">
                  <span className={`font-mono text-[11px] ${isCurrent ? 'text-[#45CC42] font-bold' : 'text-slate-300'}`}>
                    {sec.number}
                  </span>
                  <span className="truncate tracking-tight text-[12px]">
                    {sec.title}
                  </span>
                </div>

                {/* Sub status pill for section 8 QA */}
                {sec.id === '08' && (
                  <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white font-medium">
                    {qaResult.scorePercent}%
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Progress & Master Status */}
      <div className="p-4 bg-[#042150] border-t border-white/10 space-y-3">
        {/* Progress Display */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium mb-1.5">
            <span>{completedSectionsCount} of 9 sections</span>
            <span className="font-semibold text-[#45CC42]">
              {Math.round((completedSectionsCount / 9) * 100)}%
            </span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#45CC42] h-full transition-all duration-500 rounded-full"
              style={{ width: `${Math.max(5, (completedSectionsCount / 9) * 100)}%` }}
            />
          </div>
        </div>

        {/* Framework Status matching PowerPoint footer */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10.5px]">
          <div className="flex flex-col">
            <span className="text-slate-300 font-medium">Master Prompt v9.0</span>
            <span className="text-[10px] text-slate-400">Framework workspace</span>
          </div>
          <span className="text-[10px] text-[#052B66] font-bold bg-[#45CC42] px-2 py-0.5 rounded-md shadow-xs">
            {completedSectionsCount === 9 ? 'Ready for AI' : 'Draft'}
          </span>
        </div>
      </div>
    </aside>
  );
};

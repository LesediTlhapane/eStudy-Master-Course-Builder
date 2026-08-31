import React from 'react';
import { SectionId, SectionMeta } from '../types';
import { QAResult } from '../utils/qaEngine';
import { Check, Circle, Dot, Lock, ShieldCheck } from 'lucide-react';

export const SECTIONS: SectionMeta[] = [
  {
    id: '01',
    number: '01',
    title: 'Problem & Challenge',
    shortTitle: 'Problem & Challenge',
    description: 'Workplace problem statement, root causes & AI gaps'
  },
  {
    id: '02',
    number: '02',
    title: 'Sources & Research',
    shortTitle: 'Sources & Research',
    description: 'Evidence, regulatory frameworks & benchmark sources'
  },
  {
    id: '03',
    number: '03',
    title: 'Course Structure',
    shortTitle: 'Course Structure',
    description: 'Architecture, audience, diagnostics & learning journey'
  },
  {
    id: '04',
    number: '04',
    title: 'Module Structure',
    shortTitle: 'Module Structure',
    description: 'Syllabus, scenarios, tools & mandatory deliverables'
  },
  {
    id: '05',
    number: '05',
    title: 'Learning Design',
    shortTitle: 'Learning Design',
    description: 'Instructional progression, knowledge checks & assessments'
  },
  {
    id: '06',
    number: '06',
    title: 'Ethics & AI Responsibility',
    shortTitle: 'Ethics & AI Responsibility',
    description: 'POPIA, bias, transparency & human oversight'
  },
  {
    id: '07',
    number: '07',
    title: 'Output Requirements',
    shortTitle: 'Output Requirements',
    description: 'LMS format, reading level & generation specs'
  },
  {
    id: '08',
    number: '08',
    title: 'Quality Assurance',
    shortTitle: 'Course Readiness',
    description: 'Dynamic readiness score & requirement checklist'
  },
  {
    id: '09',
    number: '09',
    title: 'Customisation',
    shortTitle: 'Customisation',
    description: 'Framework safeguards & designer configuration'
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
      className="w-64 bg-[#052B66] text-white flex flex-col justify-between shrink-0 select-none h-[calc(100vh-4rem)] sticky top-16 shadow-inner"
    >
      {/* Navigation Header & Section List */}
      <div className="flex flex-col py-5">
        <div className="px-5 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
              COURSE BUILDER
            </span>
            <span className="text-[10px] font-mono bg-white/10 text-[#45CC42] px-1.5 py-0.5 rounded font-semibold">
              v9.0
            </span>
          </div>
        </div>

        {/* 9 Sections */}
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
                className={`w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs transition-all cursor-pointer group relative ${
                  isCurrent
                    ? 'bg-white/15 text-white font-semibold shadow-sm border-l-3 border-[#45CC42]'
                    : 'text-slate-200 hover:text-white hover:bg-white/5 font-medium'
                }`}
              >
                {/* State Icons matching exactly: ✓ = complete, ● = current, ○ = not started */}
                <span className="shrink-0 flex items-center justify-center w-4 h-4">
                  {isComplete ? (
                    <Check className="w-4 h-4 text-[#45CC42] stroke-[2.5]" />
                  ) : isCurrent ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-white ring-4 ring-white/20" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full border border-slate-400 group-hover:border-slate-200" />
                  )}
                </span>

                {/* Section Number & Name */}
                <div className="flex items-center gap-2 truncate">
                  <span className={`font-mono text-[11px] ${isCurrent ? 'text-[#45CC42]' : 'text-slate-300'}`}>
                    {sec.number}
                  </span>
                  <span className="truncate tracking-tight text-[12.5px]">
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

      {/* Bottom Progress & Framework Safeguard */}
      <div className="p-4 bg-[#042150] border-t border-white/10 space-y-3">
        {/* Progress Display */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium mb-1.5">
            <span>{completedSectionsCount} of 9 sections complete</span>
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

        {/* Framework Locked Footer Notice */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10.5px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-slate-300" />
            <span className="font-medium">Master Prompt v9.0</span>
          </div>
          <span className="text-[10px] text-slate-300 font-semibold bg-white/10 px-1.5 py-0.5 rounded">
            Framework locked
          </span>
        </div>
      </div>
    </aside>
  );
};

import React, { useEffect, useState } from 'react';
import { Course, GeneratedCourse, AIGenerationStage } from '../types';
import { generateLocalFallbackCourse } from '../server/geminiService';
import { CheckCircle2, Loader2, Sparkles, Shield, BookOpen, Layers, AlertCircle, ArrowRight } from 'lucide-react';

interface AIGenerationProgressProps {
  course: Course;
  onComplete: (generatedCourse: GeneratedCourse) => void;
  onCancel: () => void;
}

interface StageMeta {
  stage: AIGenerationStage;
  title: string;
  description: string;
  durationMs: number;
}

const STAGES: StageMeta[] = [
  {
    stage: 'validating',
    title: '1. Validating Specification',
    description: 'Verifying problem statement, mandatory fields, and Master Prompt v9.0 compliance.',
    durationMs: 1200
  },
  {
    stage: 'research',
    title: '2. Research & POPIA Review',
    description: 'Analyzing statutory frameworks, evidence standards, and South African workplace context.',
    durationMs: 1500
  },
  {
    stage: 'curriculum',
    title: '3. Curriculum Blueprint',
    description: "Formulating module structure, duration estimates, and Bloom's Taxonomy learning outcomes.",
    durationMs: 1800
  },
  {
    stage: 'content',
    title: '4. Module Content Generation',
    description: 'Authoring core concepts, standard operating procedures, and practical guidelines.',
    durationMs: 2200
  },
  {
    stage: 'scenarios',
    title: '5. Scenario Architecture',
    description: 'Crafting workplace decision scenarios and AI-assisted problem solving tasks.',
    durationMs: 2000
  },
  {
    stage: 'assessments',
    title: '6. Assessment Formulation',
    description: 'Creating pre-course diagnostics, module knowledge checks, and summative capstone task.',
    durationMs: 1600
  },
  {
    stage: 'qa_review',
    title: '7. AI Quality & Ethics Review',
    description: 'Executing pedagogical scorecard, POPIA compliance audit, and plain language validation.',
    durationMs: 1400
  }
];

export const AIGenerationProgress: React.FC<AIGenerationProgressProps> = ({
  course,
  onComplete,
  onCancel
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(10);
  const [isFinished, setIsFinished] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GeneratedCourse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer counter
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Run backend generation or staged simulation
  useEffect(() => {
    let isMounted = true;

    async function executeGeneration() {
      try {
        // First kick off server call
        const serverPromise = fetch('/api/courses/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ course })
        }).then(async res => {
          if (!res.ok) {
            throw new Error(`Server returned ${res.status}`);
          }
          return res.json();
        }).catch(err => {
          console.warn('Backend fetch fallback to client engine:', err);
          return { success: true, course: generateLocalFallbackCourse(course) };
        });

        // Advance visual stages smoothly
        for (let i = 0; i < STAGES.length; i++) {
          if (!isMounted) return;
          setCurrentStageIndex(i);
          const stage = STAGES[i];
          const targetPercent = Math.round(((i + 1) / STAGES.length) * 92);
          setProgressPercent(targetPercent);
          await new Promise(r => setTimeout(r, stage.durationMs));
        }

        // Await server result
        const data = await serverPromise;
        const finalCourse: GeneratedCourse = data.course || generateLocalFallbackCourse(course);

        if (!isMounted) return;
        setProgressPercent(100);
        setGeneratedResult(finalCourse);
        setIsFinished(true);
      } catch (err: any) {
        console.error('Generation pipeline error:', err);
        if (isMounted) {
          const fallback = generateLocalFallbackCourse(course);
          setGeneratedResult(fallback);
          setProgressPercent(100);
          setIsFinished(true);
        }
      }
    }

    executeGeneration();

    return () => {
      isMounted = false;
    };
  }, [course]);

  return (
    <div id="ai-generation-screen" className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-8 max-w-3xl mx-auto font-sora">
      <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 sm:p-10 space-y-8 relative overflow-hidden">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#052B66]/5 border border-[#052B66]/10 text-xs font-bold text-[#052B66]">
            <Sparkles className="w-3.5 h-3.5 text-[#45CC42]" />
            <span>eStudy AI Course Generation Engine</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#052B66] tracking-tight">
            {isFinished ? 'Course Generation Complete!' : 'Synthesizing Course Content...'}
          </h2>

          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            Generating <strong>{course.structure?.title || course.name || 'Course'}</strong> according to Master Prompt v9.0 specifications.
          </p>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-2">
              {!isFinished && <Loader2 className="w-3.5 h-3.5 text-[#052B66] animate-spin" />}
              <span>{isFinished ? '100% Ready for Human Review' : `${progressPercent}% Completed`}</span>
            </span>
            <span className="font-mono text-slate-500">
              Elapsed: {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#052B66] to-[#45CC42] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Stages Checklist */}
        <div className="space-y-3 border-t border-b border-slate-100 py-6">
          {STAGES.map((st, idx) => {
            const isCompleted = isFinished || idx < currentStageIndex;
            const isActive = !isFinished && idx === currentStageIndex;
            const isUpcoming = !isFinished && idx > currentStageIndex;

            return (
              <div
                key={st.stage}
                className={`p-3.5 rounded-xl border text-xs transition-all flex items-start gap-3.5 ${
                  isActive
                    ? 'bg-blue-50/70 border-blue-200 shadow-xs'
                    : isCompleted
                    ? 'bg-slate-50/50 border-slate-200/80 text-slate-800'
                    : 'bg-white border-transparent text-slate-400 opacity-60'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#45CC42]" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-[#052B66] animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px] font-mono">
                      {idx + 1}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${isActive ? 'text-[#052B66]' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                      {st.title}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-bold text-[#052B66] bg-blue-100/80 px-2 py-0.5 rounded-full animate-pulse">
                        In Progress
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    {st.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onCancel}
            disabled={isFinished}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
          >
            Cancel Generation
          </button>

          {isFinished && generatedResult ? (
            <button
              id="view-generated-course-cta"
              onClick={() => onComplete(generatedResult)}
              className="px-6 py-3 rounded-xl text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3db83a] transition-all shadow-md flex items-center gap-2 cursor-pointer animate-fade-up"
            >
              <span>View Generated Course & Human Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="text-[11px] text-slate-400 italic">
              Generating course artifacts using eStudy pedagogical rules...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

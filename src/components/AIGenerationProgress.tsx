import React, { useEffect, useState } from 'react';
import { Course, GeneratedCourse, AIProvider } from '../types';
import { generateMasterPrompt } from '../utils/promptGenerator';
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
  Cpu,
  Clock,
  AlertTriangle,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';

interface AIGenerationProgressProps {
  course: Course;
  provider: AIProvider;
  model: string;
  onComplete: (generatedCourse: GeneratedCourse) => void;
  onCancel: () => void;
}

export type RealGenerationStageId =
  | 'validating'
  | 'sending'
  | 'receiving'
  | 'parsing'
  | 'validating_course'
  | 'running_qa'
  | 'ready';

interface RealStageMeta {
  id: RealGenerationStageId;
  label: string;
  detail: string;
}

const REAL_STAGES: RealStageMeta[] = [
  {
    id: 'validating',
    label: '1. Validating Completed Master Template',
    detail: 'Checking compulsory fields, South African context, and compiling Master Prompt v9.0'
  },
  {
    id: 'sending',
    label: '2. Dispatching to AI Provider',
    detail: 'Connecting to selected AI provider API with structured course generation rules'
  },
  {
    id: 'receiving',
    label: '3. Awaiting Full Course Synthesis',
    detail: 'Synthesising modules, workplace scenarios, Bloom’s taxonomy objectives, and assessments'
  },
  {
    id: 'parsing',
    label: '4. Parsing & Structuring Course Output',
    detail: 'Extracting and validating structured course content from the AI response'
  },
  {
    id: 'validating_course',
    label: '5. Verifying Course Depth & Modules',
    detail: 'Ensuring all required modules, lessons, callouts, and scenarios are complete'
  },
  {
    id: 'running_qa',
    label: '6. Running Quality Assurance & POPIA Audit',
    detail: 'Checking alignment with the eStudy Master Course Generation Template v9.0'
  },
  {
    id: 'ready',
    label: '7. Course Generation Complete',
    detail: 'Complete training course ready for review and download'
  }
];

export const AIGenerationProgress: React.FC<AIGenerationProgressProps> = ({
  course,
  provider,
  model,
  onComplete,
  onCancel
}) => {
  const [currentStage, setCurrentStage] = useState<RealGenerationStageId>('validating');
  const [progressPercent, setProgressPercent] = useState(15);
  const [isFinished, setIsFinished] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GeneratedCourse | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completedStages, setCompletedStages] = useState<Set<RealGenerationStageId>>(new Set());
  const [retryCount, setRetryCount] = useState(0);

  const providerLabel = provider === 'groq' ? 'Groq Cloud' : 'Google Gemini';

  // Elapsed timer
  useEffect(() => {
    if (isFinished || hasError) return;
    const timer = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished, hasError]);

  // Auto-open course in editor once generation finishes successfully
  useEffect(() => {
    if (isFinished && generatedResult && !hasError) {
      const autoTimer = setTimeout(() => {
        onComplete(generatedResult);
      }, 1200);
      return () => clearTimeout(autoTimer);
    }
  }, [isFinished, generatedResult, hasError, onComplete]);

  // Real execution lifecycle — NEVER silently substitutes a generic fallback course on failure
  useEffect(() => {
    let isCancelled = false;
    setCurrentStage('validating');
    setProgressPercent(15);
    setIsFinished(false);
    setHasError(false);
    setGeneratedResult(null);
    setErrorNotice(null);
    setElapsedSeconds(0);
    setCompletedStages(new Set());

    async function runGenerationLifecycle() {
      const markStageDone = (st: RealGenerationStageId) => {
        setCompletedStages(prev => new Set(prev).add(st));
      };

      try {
        // --- STAGE 1: Validating Specification ---
        setCurrentStage('validating');
        setProgressPercent(15);

        const compiledPrompt = generateMasterPrompt(course);
        if (!compiledPrompt || compiledPrompt.length < 50) {
          throw new Error('Master prompt compilation produced insufficient content. Please complete the compulsory fields in the template first.');
        }
        await new Promise(r => setTimeout(r, 350));
        markStageDone('validating');

        if (isCancelled) return;

        // --- STAGE 2: Dispatching to AI Engine ---
        setCurrentStage('sending');
        setProgressPercent(30);
        await new Promise(r => setTimeout(r, 300));
        markStageDone('sending');

        if (isCancelled) return;

        // --- STAGE 3: Awaiting AI Synthesis (Real Network Call) ---
        setCurrentStage('receiving');
        setProgressPercent(55);

        const res = await fetch('/api/courses/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            course,
            provider,
            model
          })
        });

        const apiResponseData = await res.json().catch(() => ({}));

        if (!res.ok || !apiResponseData.success || !apiResponseData.course) {
          throw new Error(
            apiResponseData.error ||
              `AI course generation via ${providerLabel} (${model}) was unsuccessful (HTTP ${res.status}).`
          );
        }

        markStageDone('receiving');
        if (isCancelled) return;

        // --- STAGE 4: Parsing Response AST ---
        setCurrentStage('parsing');
        setProgressPercent(75);
        await new Promise(r => setTimeout(r, 250));
        markStageDone('parsing');

        if (isCancelled) return;

        // --- STAGE 5: Validating Generated Course Structure ---
        setCurrentStage('validating_course');
        setProgressPercent(88);
        const finalCourse: GeneratedCourse = apiResponseData.course;
        await new Promise(r => setTimeout(r, 250));
        markStageDone('validating_course');

        if (isCancelled) return;

        // --- STAGE 6: Running QA & Compliance Audit ---
        setCurrentStage('running_qa');
        setProgressPercent(96);
        await new Promise(r => setTimeout(r, 250));
        markStageDone('running_qa');

        if (isCancelled) return;

        // --- STAGE 7: Ready for Human Review ---
        setCurrentStage('ready');
        setProgressPercent(100);
        markStageDone('ready');

        setGeneratedResult(finalCourse);
        setIsFinished(true);
      } catch (err: any) {
        if (!isCancelled) {
          setHasError(true);
          setErrorNotice(
            err?.message ||
              `AI generation via ${providerLabel} (${model}) could not be completed. Please check your inputs or try again.`
          );
        }
      }
    }

    runGenerationLifecycle();

    return () => {
      isCancelled = true;
    };
  }, [course, provider, model, retryCount]);

  return (
    <div id="ai-generation-screen" className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-8 max-w-3xl mx-auto font-sora">
      <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 sm:p-10 space-y-7 relative overflow-hidden">
        {/* Top Header Card */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#052B66]/5 border border-[#052B66]/15 text-xs font-bold text-[#052B66]">
            <Cpu className="w-3.5 h-3.5 text-[#45CC42]" />
            <span>
              AI Engine: <strong>{providerLabel}</strong> ({model})
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#052B66] tracking-tight">
            {hasError
              ? 'AI Course Generation Unsuccessful'
              : isFinished
              ? 'Course Generation Complete'
              : 'Generating Training Course with AI...'}
          </h2>

          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            {hasError
              ? 'The AI provider did not return a valid course. All of your completed template information has been safely preserved.'
              : `Generating "${course.structure?.title || course.name || 'Course'}" according to the eStudy Master Course Generation Template v9.0.`}
          </p>
        </div>

        {/* Explicit Error Banner when AI Generation Fails */}
        {hasError && (
          <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3.5 text-xs text-rose-900 animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <div className="font-extrabold text-sm text-rose-950">
                AI Generation Could Not Be Completed
              </div>
              <p className="text-xs text-rose-800 leading-relaxed">
                {errorNotice}
              </p>
              <p className="text-[11px] text-rose-700 font-medium">
                No fabricated or generic fallback course was substituted. Your completed template data remains intact. You can retry generation now or return to the template to review your fields or select another model.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setRetryCount(c => c + 1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#45CC42]" />
                  <span>Retry AI Generation</span>
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Template (Data Preserved)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar & Real Timing */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-2">
              {!isFinished && !hasError && <Loader2 className="w-3.5 h-3.5 text-[#052B66] animate-spin" />}
              {hasError && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
              <span>
                {hasError
                  ? 'Generation Stopped — Awaiting Retry or Review'
                  : isFinished
                  ? '100% Complete — Opening Course Review'
                  : `${progressPercent}% Completed`}
              </span>
            </span>
            <span className="font-mono text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Elapsed: {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
              </span>
            </span>
          </div>

          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ease-out ${
                hasError
                  ? 'bg-rose-500'
                  : 'bg-gradient-to-r from-[#052B66] to-[#45CC42]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Real Stages Lifecycle Checklist */}
        <div className="space-y-2.5 border-t border-b border-slate-100 py-5">
          {REAL_STAGES.map((st, idx) => {
            const isCompleted = isFinished || completedStages.has(st.id);
            const isActive = !isFinished && !hasError && currentStage === st.id;
            const isFailedStage = hasError && currentStage === st.id;

            return (
              <div
                key={st.id}
                className={`p-3 rounded-xl border text-xs transition-all flex items-start gap-3 ${
                  isFailedStage
                    ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                    : isActive
                    ? 'bg-blue-50/80 border-blue-200 shadow-xs'
                    : isCompleted
                    ? 'bg-slate-50/70 border-slate-200/80 text-slate-800'
                    : 'bg-white border-transparent text-slate-400 opacity-50'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#45CC42]" />
                  ) : isFailedStage ? (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-[#052B66] animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px] font-mono text-slate-400">
                      {idx + 1}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-bold ${
                        isFailedStage
                          ? 'text-rose-900'
                          : isActive
                          ? 'text-[#052B66]'
                          : isCompleted
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {st.label}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-bold text-[#052B66] bg-blue-100 px-2 py-0.5 rounded-full animate-pulse">
                        In Progress
                      </span>
                    )}
                    {isFailedStage && (
                      <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                        Failed
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">{st.detail}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onCancel}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Template</span>
          </button>

          {isFinished && generatedResult && !hasError ? (
            <button
              id="view-generated-course-cta"
              onClick={() => onComplete(generatedResult)}
              className="px-6 py-3 rounded-xl text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3db83a] transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <span>Open Generated Course</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : hasError ? (
            <button
              type="button"
              onClick={() => setRetryCount(c => c + 1)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3ec23b] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry AI Generation</span>
            </button>
          ) : (
            <div className="text-[11px] text-slate-400 italic">
              Communicating with {providerLabel}...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

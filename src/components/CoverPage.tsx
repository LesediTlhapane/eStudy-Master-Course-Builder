import React, { useEffect, useRef, useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { Course } from '../types';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Shield,
  Cpu,
  Layers,
  HelpCircle,
  X,
  ChevronRight,
  LayoutTemplate,
  Building2,
  Calendar,
  Upload,
  Image as ImageIcon,
  Trash2,
  Camera
} from 'lucide-react';
import { CourseTemplateOption } from '../data/initialCourseData';

interface CoverPageProps {
  course?: Course;
  onUpdateCourse?: (updater: (prev: Course) => Course) => void;
  onStartBuilding: () => void;
  onEnterDashboard: () => void;
  onStartFromScratch?: (title?: string) => void;
  onContinueFromTemplate?: (templateId: string) => void;
  availableTemplates?: CourseTemplateOption[];
}

export const CoverPage: React.FC<CoverPageProps> = ({
  course,
  onUpdateCourse,
  onStartBuilding,
  onEnterDashboard,
  onStartFromScratch,
  onContinueFromTemplate,
  availableTemplates = []
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const visualInputRef = useRef<HTMLInputElement | null>(null);

  const [showFrameworkModal, setShowFrameworkModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [localLogo, setLocalLogo] = useState<string>(() => {
    return course?.coverLogoUrl || localStorage.getItem('estudy_cover_logo') || '';
  });
  const [localVisual, setLocalVisual] = useState<string>(() => {
    return course?.coverVisualUrl || localStorage.getItem('estudy_cover_visual') || '';
  });

  // Keep in sync with course if provided
  useEffect(() => {
    if (course?.coverLogoUrl) setLocalLogo(course.coverLogoUrl);
    if (course?.coverVisualUrl) setLocalVisual(course.coverVisualUrl);
  }, [course?.coverLogoUrl, course?.coverVisualUrl]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        setLocalLogo(dataUrl);
        localStorage.setItem('estudy_cover_logo', dataUrl);
        if (onUpdateCourse) {
          onUpdateCourse(prev => ({
            ...prev,
            coverLogoUrl: dataUrl
          }));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVisualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        setLocalVisual(dataUrl);
        localStorage.setItem('estudy_cover_visual', dataUrl);
        if (onUpdateCourse) {
          onUpdateCourse(prev => ({
            ...prev,
            coverVisualUrl: dataUrl
          }));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLocalLogo('');
    localStorage.removeItem('estudy_cover_logo');
    if (onUpdateCourse) {
      onUpdateCourse(prev => ({
        ...prev,
        coverLogoUrl: undefined
      }));
    }
  };

  const handleRemoveVisual = () => {
    setLocalVisual('');
    localStorage.removeItem('estudy_cover_visual');
    if (onUpdateCourse) {
      onUpdateCourse(prev => ({
        ...prev,
        coverVisualUrl: undefined
      }));
    }
  };

  // Subtle background constellation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const nodeCount = Math.min(25, Math.floor((width * height) / 45000));
    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseAlpha: number;
      isAccent: boolean;
    }> = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 2 + 1,
        baseAlpha: Math.random() * 0.2 + 0.08,
        isAccent: Math.random() > 0.75
      });
    }

    let isRunning = true;
    const handleVisibilityChange = () => {
      isRunning = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      if (!isRunning) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 150;

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.08;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = nodes[i].isAccent || nodes[j].isAccent
              ? `rgba(69, 204, 66, ${alpha * 1.2})`
              : `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0) node.x = width;
        if (node.x > width) node.x = 0;
        if (node.y < 0) node.y = height;
        if (node.y > height) node.y = 0;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.isAccent
          ? `rgba(69, 204, 66, ${node.baseAlpha})`
          : `rgba(255, 255, 255, ${node.baseAlpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div id="cover-page-root" className="min-h-screen bg-[#052B66] text-white flex flex-col relative overflow-hidden font-sora selection:bg-[#45CC42] selection:text-[#052B66]">
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 opacity-20"
      />

      {/* Subtle Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4">
          <BrandLogo size="md" invertText />
          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-white/15">
            <span className="text-[10px] font-bold tracking-widest text-[#45CC42] uppercase bg-[#45CC42]/10 px-2.5 py-1 rounded-md border border-[#45CC42]/30">
              Master Course Builder
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (onStartFromScratch) onStartFromScratch();
              else onStartBuilding();
            }}
            className="text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3ec23b] px-3 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start from Scratch</span>
          </button>

          <button
            id="cover-view-templates-header-btn"
            onClick={() => setShowTemplateModal(true)}
            className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 border border-white/15 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#45CC42]" />
            <span>Templates</span>
          </button>

          <button
            id="cover-enter-builder-header-btn"
            onClick={onEnterDashboard}
            className="text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/20 px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 hover:border-white/40"
          >
            <span>Workspace</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Slide 1 Blueprint Container */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-6 py-8 max-w-7xl mx-auto w-full">
        <div className="bg-white/5 backdrop-blur-xs border border-white/15 rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: PowerPoint Slide 1 Typography & Structure */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
                  eStudy South Africa
                </p>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-wider text-[#45CC42] uppercase">
                  MASTER COURSE TEMPLATE
                </h2>
              </div>

              {/* [COURSE TITLE] */}
              <div className="space-y-2 pt-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.15]">
                  {course?.name || course?.structure?.title || 'AI-Powered Master Course Authoring'}
                </h1>
                <p className="text-sm text-slate-300 font-medium tracking-wide">
                  Enterprise Instructional Design Workspace · Universal Framework v9.0
                </p>
              </div>

              {/* Metadata row: [CLIENT / ORGANISATION] [DATE] */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    [CLIENT / ORGANISATION]
                  </span>
                  <div className="text-slate-200 font-medium truncate">
                    {course?.structure?.industryDomain || 'eStudy South Africa Enterprise Cohort'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    [DATE]
                  </span>
                  <div className="text-slate-200 font-medium">
                    {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Green Accent Line & Professional Workspace Tag */}
              <div className="pt-3 space-y-2">
                <div className="w-40 h-1 bg-[#45CC42] rounded-full" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-300 gap-2">
                  <span className="font-medium">
                    Professional course design workspace · Master Prompt v9.0
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {course?.code || '[COURSE DESIGNER SPEC]'}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Clean Start From Scratch vs. Continue on Existing Template */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
                <button
                  id="cover-start-scratch-btn"
                  onClick={() => {
                    if (onStartFromScratch) {
                      onStartFromScratch();
                    } else {
                      onStartBuilding();
                    }
                  }}
                  className="px-7 py-3.5 rounded-xl text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3ec23b] active:scale-98 transition-all shadow-lg hover:shadow-[#45CC42]/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start from Scratch</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="cover-choose-template-btn"
                  onClick={() => setShowTemplateModal(true)}
                  className="px-6 py-3.5 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-[#45CC42]" />
                  <span>Continue on Existing Template</span>
                </button>

                <button
                  id="cover-enter-dashboard-btn"
                  onClick={onEnterDashboard}
                  className="px-5 py-3.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-transparent hover:bg-white/5 border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LayoutTemplate className="w-4 h-4 text-slate-400" />
                  <span>Courses</span>
                </button>
              </div>
            </div>

            {/* Right Column: Interactive Logo and Visual Frames */}
            <div className="lg:col-span-5 space-y-4">
              {/* Insert Client Logo Frame */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-dashed border-white/25 relative overflow-hidden transition-all hover:border-[#45CC42]">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                {localLogo ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-14 bg-white/95 rounded-xl p-1.5 flex items-center justify-center shadow-xs">
                        <img
                          src={localLogo}
                          alt="Client Logo"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#45CC42] block">
                          [CLIENT LOGO ATTACHED]
                        </span>
                        <span className="text-xs text-white font-medium">
                          Branded on cover & exports
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-xs font-medium cursor-pointer"
                        title="Replace Logo"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleRemoveLogo}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors text-xs font-medium cursor-pointer"
                        title="Remove Logo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => logoInputRef.current?.click()}
                    className="flex flex-col items-center justify-center text-center cursor-pointer py-3 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#45CC42]/20 text-[#45CC42] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Upload className="w-4 h-4" />
                    </div>
                    <span className="font-bold tracking-wider uppercase text-[10.5px] text-white group-hover:text-[#45CC42] transition-colors">
                      [INSERT CLIENT LOGO]
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      Click to upload organization logo (PNG, JPG, SVG)
                    </span>
                  </div>
                )}
              </div>

              {/* Insert Course Visual Frame */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-dashed border-white/20 relative overflow-hidden group transition-all hover:border-[#45CC42]/60 min-h-[190px] flex flex-col justify-center items-center text-center">
                <input
                  ref={visualInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleVisualUpload}
                  className="hidden"
                />

                {localVisual ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <img
                      src={localVisual}
                      alt="Course Banner"
                      className="max-h-36 w-full object-cover rounded-xl shadow-md mb-2"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => visualInputRef.current?.click()}
                        className="text-[11px] text-slate-300 hover:text-white bg-white/10 px-2.5 py-1 rounded-md cursor-pointer"
                      >
                        Replace Visual
                      </button>
                      <button
                        onClick={handleRemoveVisual}
                        className="text-[11px] text-rose-300 hover:text-rose-200 bg-rose-500/20 px-2 py-1 rounded-md cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => visualInputRef.current?.click()}
                    className="cursor-pointer flex flex-col items-center justify-center py-2"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#45CC42]/20 text-[#45CC42] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <span className="font-bold tracking-wider uppercase text-[11px] text-white">
                      [INSERT COURSE VISUAL]
                    </span>
                    <p className="text-[11px] text-slate-300 max-w-xs mt-1 leading-relaxed">
                      Click to upload course header image or use standard curriculum branding.
                    </p>
                    <span className="inline-block mt-2 text-[10px] text-[#45CC42] font-semibold bg-[#45CC42]/10 border border-[#45CC42]/25 px-2 py-0.5 rounded">
                      + Upload Visual
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4 Core Pillars Overview */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 text-left">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:border-[#45CC42]/40 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-[#45CC42]/20 text-[#45CC42] flex items-center justify-center mb-2.5">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-white mb-1">1. Guided Authoring</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Step-by-step master prompt fields with skip-unknown assistance.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:border-[#45CC42]/40 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-[#45CC42]/20 text-[#45CC42] flex items-center justify-center mb-2.5">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-white mb-1">2. Scenario-Driven</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Real South African workplace contexts, King IV & POPIA compliance.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:border-[#45CC42]/40 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-[#45CC42]/20 text-[#45CC42] flex items-center justify-center mb-2.5">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-white mb-1">3. AI Engine Selection</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Select Claude 3.5, Gemini 2.5, GPT-4o, or DeepSeek with ratings.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:border-[#45CC42]/40 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-[#45CC42]/20 text-[#45CC42] flex items-center justify-center mb-2.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-white mb-1">4. Word & PDF Export</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Instantly download structured Word (.docx) or print-ready PDF blueprints.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
        <div>
          eStudy South Africa · Master Course Generation Platform
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span>POPIA Aligned</span>
          <span>·</span>
          <span>Version 9.0</span>
          <span>·</span>
          <span className="text-[#45CC42] font-semibold">Ready for Synthesis</span>
        </div>
      </footer>

      {/* Framework Modal */}
      {showFrameworkModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sora text-slate-900">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#45CC42]" />
                <h3 className="text-sm font-bold text-[#052B66]">
                  eStudy Master Course Prompt Framework v9.0
                </h3>
              </div>
              <button
                onClick={() => setShowFrameworkModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              The eStudy Master Framework standardizes instructional design specifications into prompt-ready templates for advanced AI generation (Claude 3.5 Sonnet, Gemini 2.5 Flash, GPT-4o, DeepSeek R1).
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold block text-[#052B66]">1. Problem & Roots</span>
                Target audience, operational breakdown, and skill gaps.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold block text-[#052B66]">2. Grounded Sources</span>
                POPIA, King IV, and statutory citations.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold block text-[#052B66]">3. Course Architecture</span>
                NQF alignment, duration, and Bloom's outcomes.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold block text-[#052B66]">4. Workplace Modules</span>
                Step-by-step procedures, role responsibilities & scenarios.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowFrameworkModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sora">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 text-white relative">
            <button
              onClick={() => setShowTemplateModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[11px] font-bold font-mono uppercase text-[#45CC42] tracking-wider block mb-1">
                COURSE TEMPLATE ARCHITECTURE
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Continue on an Existing Template
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Select a template below to load its pre-configured structure into your workspace.
              </p>
            </div>

            <div className="space-y-4">
              {availableTemplates.map(tpl => (
                <div
                  key={tpl.id}
                  className="p-5 rounded-xl border border-slate-700 bg-slate-800/80 hover:border-[#45CC42] hover:bg-slate-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {tpl.badge}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-[#45CC42] transition-colors">
                        {tpl.name}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {tpl.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (onContinueFromTemplate) {
                        onContinueFromTemplate(tpl.id);
                        setShowTemplateModal(false);
                      }
                    }}
                    className="px-4 py-2.5 rounded-lg text-xs font-bold bg-[#45CC42] text-[#052B66] hover:bg-[#3ec23b] transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-md"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Prefer starting with an empty workspace?</span>
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  if (onStartFromScratch) onStartFromScratch();
                  else onStartBuilding();
                }}
                className="font-bold text-[#45CC42] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Start from scratch instead</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

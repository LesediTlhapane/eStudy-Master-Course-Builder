import React, { useEffect, useRef, useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { ArrowRight, BookOpen, CheckCircle2, Sparkles, Shield, Cpu, Layers, HelpCircle, X, ChevronRight } from 'lucide-react';

interface CoverPageProps {
  onStartBuilding: () => void;
  onEnterDashboard: () => void;
}

export const CoverPage: React.FC<CoverPageProps> = ({
  onStartBuilding,
  onEnterDashboard
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showFrameworkModal, setShowFrameworkModal] = useState(false);

  // Animated knowledge graph background
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

    // Node particle definition
    const nodeCount = Math.min(45, Math.floor((width * height) / 25000));
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
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2.5 + 1.2,
        baseAlpha: Math.random() * 0.4 + 0.2,
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

      // Draw connection lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 160;

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.18;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = nodes[i].isAccent || nodes[j].isAccent
              ? `rgba(69, 204, 66, ${alpha * 1.5})`
              : `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw and update nodes
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
          ? `rgba(69, 204, 66, ${node.baseAlpha * 1.4})`
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
        className="absolute inset-0 pointer-events-none z-0 opacity-40"
      />

      {/* Decorative Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#45CC42]/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4">
          <BrandLogo size="md" invertText />
          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-white/15">
            <span className="text-[11px] font-bold tracking-widest text-[#45CC42] uppercase bg-[#45CC42]/10 px-2.5 py-1 rounded-md border border-[#45CC42]/30">
              Master Course Builder
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="cover-view-framework-header-btn"
            onClick={() => setShowFrameworkModal(true)}
            className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#45CC42]" />
            <span>Framework v9.0</span>
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

      {/* Main Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 py-12 max-w-5xl mx-auto text-center">
        {/* Organization Tag */}
        <div className="animate-fade-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold tracking-wider uppercase text-slate-200 mb-6 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-[#45CC42] animate-pulse" />
          <span>eStudy South Africa · Authoring Platform</span>
        </div>

        {/* Main Heading */}
        <h1 className="animate-fade-up text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.15] text-white max-w-4xl mb-6">
          Build <span className="text-[#45CC42]">smarter courses</span> with AI.
        </h1>

        {/* Subheading */}
        <p className="animate-fade-up text-base sm:text-lg text-slate-200 max-w-2xl font-normal leading-relaxed mb-4">
          A guided digital workspace for designing, validating and generating high-quality learning experiences.
        </p>

        {/* Supporting Explanation */}
        <p className="animate-fade-up text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed mb-8">
          Transform the eStudy Master Course Generation Framework into a structured course, then use AI to turn your course specification into complete learning content.
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-up flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-12">
          <button
            id="cover-start-building-btn"
            onClick={onStartBuilding}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-extrabold text-[#052B66] bg-[#45CC42] hover:bg-[#3ec23b] active:scale-97 transition-all shadow-lg hover:shadow-[#45CC42]/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Start Building</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="cover-view-framework-btn"
            onClick={() => setShowFrameworkModal(true)}
            className="w-full sm:w-auto px-6 py-4 rounded-xl text-sm font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#45CC42]" />
            <span>View Framework</span>
          </button>
        </div>

        {/* Trust Indicator */}
        <div className="animate-fade-up inline-flex items-center gap-2.5 text-xs text-slate-300 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#45CC42]" />
          <span>Built around the eStudy Master Course Generation Framework v9.0</span>
          <span className="text-[#45CC42] font-semibold pl-1 border-l border-white/15">● Framework ready</span>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 text-left">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:border-[#45CC42]/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#45CC42]/20 text-[#45CC42] flex items-center justify-center mb-3">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">1. Guided Authoring</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Complete the 9-section master prompt with real-time field validation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:border-[#45CC42]/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#45CC42]/20 text-[#45CC42] flex items-center justify-center mb-3">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">2. Scenario-Driven</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Enforce realistic South African workplace scenarios, ethics & POPIA compliance.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:border-[#45CC42]/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#45CC42]/20 text-[#45CC42] flex items-center justify-center mb-3">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">3. AI Generation</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Turn verified specifications into complete module content and assessments.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:border-[#45CC42]/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[#45CC42]/20 text-[#45CC42] flex items-center justify-center mb-3">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">4. Human Review</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Review AI scorecard, edit granular components, and sign off before deployment.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <div>
          eStudy South Africa · Master Course Generation Platform
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>NQF & POPIA Aligned</span>
          <span>·</span>
          <span>Version 9.0</span>
          <span>·</span>
          <button
            onClick={onEnterDashboard}
            className="text-slate-200 hover:text-[#45CC42] transition-colors cursor-pointer"
          >
            Enter Dashboard →
          </button>
        </div>
      </footer>

      {/* Framework Modal */}
      {showFrameworkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fade-up">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#052B66] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-[#45CC42]" />
                <div>
                  <h3 className="text-sm font-bold">eStudy Master Course Generation Framework</h3>
                  <p className="text-[11px] text-slate-300">Authoritative Source of Truth · Version 9.0</p>
                </div>
              </div>
              <button
                onClick={() => setShowFrameworkModal(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-[#052B66] text-sm mb-1">Core Pedagogical Standard</h4>
                <p className="text-slate-600">
                  Built on the benchmark foundation of the <em>Use of Artificial Intelligence in Financial Literacy</em> course.
                  The framework guarantees high instructional quality, strict South African regulatory and POPIA compliance, and immediate LMS readiness.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-[#052B66] uppercase tracking-wider text-[11px]">
                  9 Mandatory Architectural Sections
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-[11px]">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-[#052B66]">01.</span> Problem & Challenge Definition
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-[#052B66]">02.</span> Authoritative Research Sources
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-[#052B66]">03.</span> Core Structure & Diagnostics
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-[#052B66]">04.</span> Module & Scenario Breakdown
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-[#052B66]">05.</span> Learning Design & Assessments
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-[#052B66]">06.</span> Ethics, Compliance & AI Governance
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-[#052B66]">07.</span> Output Format & Plain Language
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-[#052B66]">08.</span> Course Readiness & QA Sign-Off
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 sm:col-span-2">
                    <span className="font-bold text-[#052B66]">09.</span> Customisation & Safeguards
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">eStudy South Africa Internal Standard</span>
              <button
                onClick={() => {
                  setShowFrameworkModal(false);
                  onStartBuilding();
                }}
                className="px-5 py-2 rounded-lg text-xs font-bold text-[#052B66] bg-[#45CC42] hover:bg-[#3db83a] transition-all shadow-xs cursor-pointer"
              >
                Start Designing Now →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

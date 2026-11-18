import React, { useRef, useState, useEffect } from 'react';
import { Course } from '../types';
import { BrandLogo } from './BrandLogo';
import { Download, Upload, RotateCcw, X, ShieldCheck, Sparkles, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  courses: Course[];
  onClose: () => void;
  onResetSampleData: () => void;
  onImportCourses: (imported: Course[]) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  courses,
  onClose,
  onResetSampleData,
  onImportCourses
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backendStatus, setBackendStatus] = useState<{
    checked: boolean;
    online: boolean;
    hasKey: boolean;
    platform?: string;
    message?: string;
  }>({ checked: false, online: false, hasKey: false });

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    fetch('/api/health')
      .then(res => {
        if (!res.ok) throw new Error('Not OK');
        return res.json();
      })
      .then(data => {
        if (!isMounted) return;
        setBackendStatus({
          checked: true,
          online: true,
          hasKey: Boolean(data.hasGroqKey),
          platform: data.platform || 'API Server',
          message: data.message
        });
      })
      .catch(() => {
        if (!isMounted) return;
        setBackendStatus({
          checked: true,
          online: false,
          hasKey: false,
          platform: 'Client Resilient Engine',
          message: 'Client-side fallback engine active. All chatbot & course authoring features work directly in the browser.'
        });
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExportJson = () => {
    const dataStr = JSON.stringify(courses, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `estudy_courses_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onImportCourses(parsed);
          alert(`Successfully imported ${parsed.length} course(s).`);
          onClose();
        } else {
          alert('Invalid course data file format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-6 border border-slate-200"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <BrandLogo variant="icon" size="sm" />
            <div>
              <h3 className="text-base font-bold text-[#052B66]">
                Workspace Settings & Data Management
              </h3>
              <p className="text-xs text-slate-500">
                eStudy Course Builder v9.0
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Data Persistence & Backup Actions */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Backup & Migration
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExportJson}
              className="p-4 rounded-xl border border-slate-200 hover:border-[#052B66] bg-slate-50 hover:bg-white transition-all text-left space-y-1.5 cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#052B66]">
                <Download className="w-4 h-4 text-[#45CC42]" />
                <span>Export JSON</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Download all {courses.length} courses as a JSON backup file.
              </p>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-xl border border-slate-200 hover:border-[#052B66] bg-slate-50 hover:bg-white transition-all text-left space-y-1.5 cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#052B66]">
                <Upload className="w-4 h-4 text-[#052B66]" />
                <span>Import JSON</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Restore courses from a previously exported JSON file.
              </p>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Reset Sample Data */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800">
                Reset Sample Courses
              </h4>
              <p className="text-[11px] text-slate-500">
                Reload default eStudy South Africa sample courses.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Reset workspace to initial sample courses?')) {
                  onResetSampleData();
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* AI Backend & Vercel Diagnostics */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#45CC42]" />
              <h4 className="text-xs font-bold text-[#052B66]">
                AI Copilot & Vercel Status
              </h4>
            </div>
            {backendStatus.checked && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                backendStatus.online && backendStatus.hasKey
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  backendStatus.online && backendStatus.hasKey ? 'bg-emerald-500' : 'bg-amber-500'
                }`}></span>
                {backendStatus.online && backendStatus.hasKey ? 'Live Groq Active' : 'Resilient Engine Active'}
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-600 space-y-1">
            <p>
              {backendStatus.hasKey
                ? '✓ Groq Cloud API key(s) detected and operational with automatic rate-limit failover.'
                : '⚡ The AI chatbot has built-in offline intelligence for all 9 course sections, curriculum generation, and QA reviews.'}
            </p>
            <p className="text-slate-500">
              <strong>Hosting on Vercel?</strong> Serverless functions are enabled in <code className="bg-slate-200/70 px-1 py-0.5 rounded font-mono text-[10px]">/api</code>. To enable live Groq LLM on Vercel, add <code className="bg-slate-200/70 px-1 py-0.5 rounded font-mono text-[10px]">GROQ_API_KEY</code> (and optional <code className="bg-slate-200/70 px-1 py-0.5 rounded font-mono text-[10px]">GROQ_API_KEY_2</code>) under <em>Project Settings → Environment Variables</em> and redeploy.
            </p>
          </div>
        </div>

        {/* Framework Lock Info */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[#45CC42] shrink-0" />
          <div className="text-xs text-slate-600">
            <span className="font-bold text-[#052B66]">Framework Locked: </span>
            eStudy Master Course Generation Prompt v9.0 schema active.
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#052B66] hover:bg-[#042150] cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useRef } from 'react';
import { Course } from '../types';
import { BrandLogo } from './BrandLogo';
import { Download, Upload, RotateCcw, X, ShieldCheck, FileJson, Check } from 'lucide-react';

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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-6 border border-slate-200">
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

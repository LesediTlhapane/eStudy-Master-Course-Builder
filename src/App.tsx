import React, { useState } from 'react';
import { useCourseStore } from './hooks/useCourseStore';
import { TopBar } from './components/TopBar';
import { CoverPage } from './components/CoverPage';
import { CourseBuilderSidebar, SECTIONS } from './components/CourseBuilderSidebar';
import { Dashboard } from './components/Dashboard';
import { SafePromptPreview as PromptPreview } from './components/PromptPreview';
import { AIGenerationProgress } from './components/AIGenerationProgress';
import { GeneratedCourseView } from './components/GeneratedCourseView';
import { SettingsModal } from './components/SettingsModal';
import { AIEngineExportModal } from './components/AIEngineExportModal';
import { TemplateUploadModal } from './components/TemplateUploadModal';
import { Section01Problem } from './components/Section01Problem';
import { Section02Sources } from './components/Section02Sources';
import { Section03Structure } from './components/Section03Structure';
import { Section04Modules } from './components/Section04Modules';
import { Section05LearningDesign } from './components/Section05LearningDesign';
import { Section06Ethics } from './components/Section06Ethics';
import { Section07Output } from './components/Section07Output';
import { Section08QA } from './components/Section08QA';
import { Section09Customisation } from './components/Section09Customisation';
import { FloatingCourseCopilot } from './components/FloatingCourseCopilot';
import { Course, ResearchSource, SectionId } from './types';

function mergeWithoutOverwriting<T extends Record<string, any>>(
  target: T,
  source: Partial<T> | undefined,
  overwrite: boolean
): T {
  if (!source) return target;
  const result: any = { ...target };
  for (const key of Object.keys(source)) {
    const srcVal = (source as any)[key];
    const tgtVal = result[key];
    if (srcVal === undefined || srcVal === null || srcVal === '') continue;

    if (Array.isArray(srcVal)) {
      if (srcVal.length === 0) continue;
      const tgtIsEmptyArray =
        !Array.isArray(tgtVal) ||
        tgtVal.length === 0 ||
        tgtVal.every((item: any) =>
          typeof item === 'string'
            ? item.trim() === ''
            : item && typeof item === 'object'
              ? Object.values(item).every(v => !v || (typeof v === 'string' && v.trim() === ''))
              : !item
        );
      if (overwrite || tgtIsEmptyArray) {
        result[key] = srcVal;
      }
    } else if (typeof srcVal === 'object') {
      result[key] = mergeWithoutOverwriting(tgtVal || {}, srcVal, overwrite);
    } else {
      const tgtIsEmpty = tgtVal === undefined || tgtVal === null || String(tgtVal).trim() === '';
      if (overwrite || tgtIsEmpty) {
        result[key] = srcVal;
      }
    }
  }
  return result;
}

export function App() {
  const {
    courses,
    activeCourse,
    activeSection,
    view,
    saveStatus,
    qaResult,
    availableTemplates,
    selectedAIProvider,
    selectedAIModel,
    setAIProvider,
    setAIModel,
    setView,
    setActiveSection,
    updateActiveCourse,
    switchCourse,
    createNewCourse,
    createQuickCourse,
    startFromScratch,
    continueFromTemplate,
    startFromMasterTemplate,
    deleteCourse,
    duplicateCourse,
    saveAsCustomTemplate,
    exportWorkspace,
    importWorkspace,
    jumpToSection,
    resetToSampleData,
    startAIGeneration,
    setGeneratedCourseForActive
  } = useCourseStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Helper for sequential section navigation
  const handleContinueSection = (currentSec: SectionId) => {
    const currentIndex = SECTIONS.findIndex(s => s.id === currentSec);
    if (currentIndex >= 0 && currentIndex < SECTIONS.length - 1) {
      setActiveSection(SECTIONS[currentIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setView('preview');
    }
  };

  const handleBackSection = (currentSec: SectionId) => {
    const currentIndex = SECTIONS.findIndex(s => s.id === currentSec);
    if (currentIndex > 0) {
      setActiveSection(SECTIONS[currentIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setView('dashboard');
    }
  };

  const handleUpdateCourseTitle = (newTitle: string) => {
    updateActiveCourse(prev => ({
      ...prev,
      name: newTitle,
      structure: {
        ...prev.structure,
        title: newTitle
      }
    }));
  };

  const handleApplyExtractedCourse = (
    extracted: Partial<Course>,
    flaggedFields: Record<string, string>,
    uploadedSource: ResearchSource,
    overwriteExisting: boolean,
    createNew: boolean
  ) => {
    if (createNew || view === 'cover' || view === 'dashboard') {
      startFromScratch();
    }

    setTimeout(() => {
      updateActiveCourse(prev => {
        const mergedProblem = mergeWithoutOverwriting(prev.problem, extracted.problem, overwriteExisting);
        const mergedResearch = mergeWithoutOverwriting(prev.research, extracted.research, overwriteExisting);
        const mergedStructure = mergeWithoutOverwriting(prev.structure, extracted.structure, overwriteExisting);
        const mergedLearningDesign = mergeWithoutOverwriting(
          prev.learningDesign,
          extracted.learningDesign,
          overwriteExisting
        );
        const mergedEthics = mergeWithoutOverwriting(prev.ethics, extracted.ethics, overwriteExisting);
        const mergedOutput = mergeWithoutOverwriting(
          prev.outputRequirements,
          extracted.outputRequirements,
          overwriteExisting
        );
        const mergedCustomisation = mergeWithoutOverwriting(
          prev.customisation,
          extracted.customisation,
          overwriteExisting
        );

        const newTitle =
          mergedStructure.title && mergedStructure.title.trim().length > 0
            ? mergedStructure.title
            : extracted.name && extracted.name.trim().length > 0
              ? extracted.name
              : prev.name;

        const newCode =
          mergedStructure.code && mergedStructure.code.trim().length > 0
            ? mergedStructure.code
            : extracted.code && extracted.code.trim().length > 0
              ? extracted.code
              : prev.code;

        const existingSources = Array.isArray(mergedResearch.sources) ? mergedResearch.sources : [];
        const hasUploadedSource = existingSources.some(s => s.fileName === uploadedSource.fileName);

        return {
          ...prev,
          name: newTitle,
          code: newCode,
          uploadedTemplateName: uploadedSource.fileName || uploadedSource.name,
          flaggedFields: {
            ...(prev.flaggedFields || {}),
            ...(extracted.flaggedFields || {}),
            ...(flaggedFields || {})
          },
          problem: mergedProblem,
          research: {
            ...mergedResearch,
            sources: hasUploadedSource ? existingSources : [uploadedSource, ...existingSources]
          },
          structure: {
            ...mergedStructure,
            title: newTitle,
            code: newCode
          },
          modules:
            Array.isArray(extracted.modules) &&
            extracted.modules.length > 0 &&
            (overwriteExisting || prev.modules.every(m => !m.title))
              ? extracted.modules
              : prev.modules,
          learningDesign: mergedLearningDesign,
          ethics: mergedEthics,
          outputRequirements: mergedOutput,
          customisation: mergedCustomisation
        };
      });

      setActiveSection('01');
      setView('builder');
    }, 30);
  };

  // Map App view state to TopBar activeView
  const topBarView =
    view === 'generating'
      ? 'ai_generating'
      : view === 'generated'
        ? 'generated_course'
        : view;

  const handleTopBarNavigate = (
    nextView: 'cover' | 'dashboard' | 'builder' | 'preview' | 'ai_generating' | 'generated_course'
  ) => {
    if (nextView === 'ai_generating') setView('generating');
    else if (nextView === 'generated_course') setView('generated');
    else setView(nextView);
  };

  // 1. Cover Page Fullscreen view
  if (view === 'cover') {
    return (
      <>
        <CoverPage
          activeCourse={activeCourse}
          courses={courses}
          onUpdateCourse={updateActiveCourse}
          onStartBuilding={() => setView('builder')}
          onSelectCourse={courseId => {
            switchCourse(courseId);
            setView('builder');
          }}
          onCreateNewCourse={title => {
            startFromScratch(title);
          }}
          onGoToDashboard={() => setView('dashboard')}
          onOpenUploadTemplate={() => setIsUploadModalOpen(true)}
        />
        <TemplateUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          existingCourse={activeCourse}
          selectedProvider={selectedAIProvider}
          selectedModel={selectedAIModel}
          onApplyExtractedCourse={handleApplyExtractedCourse}
          defaultCreateNew={true}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sora flex flex-col selection:bg-[#45CC42] selection:text-[#052B66]">
      {/* Global Top Bar */}
      <TopBar
        activeView={topBarView}
        activeCourse={activeCourse}
        qaResult={qaResult}
        onNavigate={handleTopBarNavigate}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onUpdateCourseTitle={handleUpdateCourseTitle}
        onStartAIGeneration={startAIGeneration}
        onOpenUploadTemplate={() => setIsUploadModalOpen(true)}
        onOpenExportHub={() => setIsExportModalOpen(true)}
      />

      {/* Main View Router */}
      {view === 'dashboard' && (
        <Dashboard
          courses={courses}
          activeCourseId={activeCourse.id}
          onSelectCourse={switchCourse}
          onCreateNewCourse={title => startFromScratch(title)}
          onDeleteCourse={deleteCourse}
          onOpenBuilder={() => setView('builder')}
          onOpenUploadTemplate={() => setIsUploadModalOpen(true)}
          onViewGeneratedCourse={courseId => {
            switchCourse(courseId);
            setView('generated');
          }}
        />
      )}

      {view === 'preview' && (
        <PromptPreview
          course={activeCourse}
          selectedProvider={selectedAIProvider}
          selectedModel={selectedAIModel}
          onSelectProvider={setAIProvider}
          onSelectModel={setAIModel}
          onReturnToBuilder={() => setView('builder')}
          onStartAIGeneration={startAIGeneration}
        />
      )}

      {view === 'generating' && (
        <AIGenerationProgress
          course={activeCourse}
          provider={selectedAIProvider}
          model={selectedAIModel}
          onComplete={generated => setGeneratedCourseForActive(generated)}
          onCancel={() => setView('preview')}
        />
      )}

      {view === 'generated' && (
        activeCourse.generatedCourse ? (
          <GeneratedCourseView
            course={activeCourse}
            generatedCourse={activeCourse.generatedCourse}
            selectedProvider={selectedAIProvider}
            selectedModel={selectedAIModel}
            onUpdateGeneratedCourse={updated => {
              updateActiveCourse({ generatedCourse: updated });
            }}
            onBackToBuilder={() => setView('builder')}
            onBackToDashboard={() => setView('dashboard')}
          />
        ) : (
          <PromptPreview
            course={activeCourse}
            selectedProvider={selectedAIProvider}
            selectedModel={selectedAIModel}
            onSelectProvider={setAIProvider}
            onSelectModel={setAIModel}
            onReturnToBuilder={() => setView('builder')}
            onStartAIGeneration={startAIGeneration}
          />
        )
      )}

      {view === 'builder' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation Sidebar */}
          <CourseBuilderSidebar
            activeSection={activeSection}
            qaResult={qaResult}
            onSelectSection={secId => {
              setActiveSection(secId);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onStartAIGeneration={startAIGeneration}
            onOpenPreview={() => setView('preview')}
          />

          {/* Center Main Guided Form Canvas */}
          <main className="flex-1 overflow-y-auto bg-slate-50/80 p-8 lg:p-12">
            <div className="max-w-5xl mx-auto">
              {activeSection === '01' && (
                <Section01Problem
                  course={activeCourse}
                  onUpdate={updateActiveCourse}
                  onContinue={() => handleContinueSection('01')}
                />
              )}

              {activeSection === '02' && (
                <Section02Sources
                  course={activeCourse}
                  onUpdate={updateActiveCourse}
                  onContinue={() => handleContinueSection('02')}
                  onBack={() => handleBackSection('02')}
                  onStartAIGeneration={startAIGeneration}
                  onOpenPreview={() => setView('preview')}
                  onOpenExportModal={() => setIsExportModalOpen(true)}
                />
              )}

              {activeSection === '03' && (
                <Section03Structure
                  course={activeCourse}
                  onUpdate={updateActiveCourse}
                  onContinue={() => handleContinueSection('03')}
                  onBack={() => handleBackSection('03')}
                />
              )}

              {activeSection === '04' && (
                <Section04Modules
                  course={activeCourse}
                  onUpdate={updateActiveCourse}
                  onContinue={() => handleContinueSection('04')}
                  onBack={() => handleBackSection('04')}
                />
              )}

              {activeSection === '05' && (
                <Section05LearningDesign
                  course={activeCourse}
                  onUpdate={updateActiveCourse}
                  onContinue={() => handleContinueSection('05')}
                  onBack={() => handleBackSection('05')}
                />
              )}

              {activeSection === '06' && (
                <Section06Ethics
                  course={activeCourse}
                  onUpdate={updateActiveCourse}
                  onContinue={() => handleContinueSection('06')}
                  onBack={() => handleBackSection('06')}
                />
              )}

              {activeSection === '07' && (
                <Section07Output
                  course={activeCourse}
                  onUpdate={updateActiveCourse}
                  onContinue={() => handleContinueSection('07')}
                  onBack={() => handleBackSection('07')}
                />
              )}

              {activeSection === '08' && (
                <Section08QA
                  course={activeCourse}
                  qaResult={qaResult}
                  onUpdate={updateActiveCourse}
                  onNavigateSection={(sec, field) => jumpToSection(sec, field)}
                  onPreviewPrompt={() => setView('preview')}
                  onBack={() => handleBackSection('08')}
                />
              )}

              {activeSection === '09' && (
                <Section09Customisation
                  course={activeCourse}
                  onUpdate={updateActiveCourse}
                  onPreviewPrompt={() => setView('preview')}
                  onBack={() => handleBackSection('09')}
                />
              )}
            </div>
          </main>
        </div>
      )}

      {/* Floating AI Course Copilot */}
      <FloatingCourseCopilot
        course={activeCourse}
        activeSection={activeSection}
        view={view}
        qaResult={qaResult}
        selectedProvider={selectedAIProvider}
        selectedModel={selectedAIModel}
        onSelectProvider={setAIProvider}
        onSelectModel={setAIModel}
        onUpdateCourse={updateActiveCourse}
        onJumpToSection={(sec, field) => jumpToSection(sec, field)}
        onStartAIGeneration={startAIGeneration}
        onNavigateView={setView}
      />

      {/* Upload Document & Auto-Populate Template Modal */}
      <TemplateUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        existingCourse={activeCourse}
        selectedProvider={selectedAIProvider}
        selectedModel={selectedAIModel}
        onApplyExtractedCourse={handleApplyExtractedCourse}
        defaultCreateNew={view !== 'builder'}
      />

      {/* AI Engine & Word / PDF Export Modal */}
      <AIEngineExportModal
        isOpen={isExportModalOpen}
        course={activeCourse}
        selectedProvider={selectedAIProvider}
        selectedModel={selectedAIModel}
        onSelectProvider={setAIProvider}
        onSelectModel={setAIModel}
        onClose={() => setIsExportModalOpen(false)}
        onStartAIGeneration={startAIGeneration}
      />

      {/* Settings / Backup Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        courses={courses}
        onClose={() => setIsSettingsOpen(false)}
        onResetSampleData={resetToSampleData}
        onImportCourses={imported => {
          updateActiveCourse(imported[0]);
        }}
      />
    </div>
  );
}

export default App;

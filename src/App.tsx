import React, { useState } from 'react';
import { useCourseStore } from './hooks/useCourseStore';
import { TopBar } from './components/TopBar';
import { CourseBuilderSidebar, SECTIONS } from './components/CourseBuilderSidebar';
import { Dashboard } from './components/Dashboard';
import { PromptPreview } from './components/PromptPreview';
import { SettingsModal } from './components/SettingsModal';
import { Section01Problem } from './components/Section01Problem';
import { Section02Sources } from './components/Section02Sources';
import { Section03Structure } from './components/Section03Structure';
import { Section04Modules } from './components/Section04Modules';
import { Section05LearningDesign } from './components/Section05LearningDesign';
import { Section06Ethics } from './components/Section06Ethics';
import { Section07Output } from './components/Section07Output';
import { Section08QA } from './components/Section08QA';
import { Section09Customisation } from './components/Section09Customisation';
import { SectionId } from './types';

export function App() {
  const {
    courses,
    activeCourse,
    activeSection,
    view,
    saveStatus,
    qaResult,
    targetFocusField,
    setView,
    setActiveSection,
    updateActiveCourse,
    switchCourse,
    createNewCourse,
    startFromMasterTemplate,
    deleteCourse,
    jumpToSection,
    clearTargetFocusField,
    resetToSampleData
  } = useCourseStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-[#45CC42] selection:text-[#052B66]">
      {/* Global Top Bar */}
      <TopBar
        course={activeCourse}
        view={view}
        saveStatus={saveStatus}
        onNavigateView={setView}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onUpdateTitle={handleUpdateCourseTitle}
      />

      {/* Main View Router */}
      {view === 'dashboard' && (
        <Dashboard
          courses={courses}
          onSelectCourse={switchCourse}
          onCreateNew={createNewCourse}
          onStartFromMasterTemplate={startFromMasterTemplate}
        />
      )}

      {view === 'preview' && (
        <PromptPreview
          course={activeCourse}
          onReturnToBuilder={() => setView('builder')}
        />
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
          />

          {/* Center Main Guided Form Canvas */}
          <main className="flex-1 overflow-y-auto bg-slate-50/80 p-8 lg:p-12">
            <div className="max-w-5xl mx-auto">
              {activeSection === '01' && (
                <Section01Problem
                  course={activeCourse}
                  onUpdate={updateActiveCourse}
                  onContinue={() => handleContinueSection('01')}
                  onBack={() => setView('dashboard')}
                />
              )}

              {activeSection === '02' && (
                <Section02Sources
                  course={activeCourse}
                  onUpdate={updateActiveCourse}
                  onContinue={() => handleContinueSection('02')}
                  onBack={() => handleBackSection('02')}
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

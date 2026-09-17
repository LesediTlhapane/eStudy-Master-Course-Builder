import { useState, useEffect, useCallback, useRef } from 'react';
import { Course, SectionId, GeneratedCourse } from '../types';
import { sampleCourses, blankMasterTemplate, createScratchCourse, availableTemplates, CourseTemplateOption } from '../data/initialCourseData';
import { evaluateCourseQA, QAResult } from '../utils/qaEngine';
import { sanitizeCourse } from '../utils/courseSanitizer';

const STORAGE_KEY = 'estudy_course_builder_courses_v14';
const ACTIVE_COURSE_KEY = 'estudy_course_builder_active_id_v14';

export type AppView = 'cover' | 'dashboard' | 'builder' | 'preview' | 'generating' | 'generated';

export interface UseCourseStoreReturn {
  courses: Course[];
  activeCourse: Course;
  activeSection: SectionId;
  view: AppView;
  saveStatus: 'saved' | 'saving';
  qaResult: QAResult;
  targetFocusField: string | null;
  availableTemplates: CourseTemplateOption[];
  setView: (view: AppView) => void;
  setActiveSection: (section: SectionId) => void;
  updateActiveCourse: (updater: Partial<Course> | ((prev: Course) => Course)) => void;
  switchCourse: (courseId: string) => void;
  createNewCourse: (title?: string) => void;
  startFromScratch: (title?: string) => void;
  continueFromTemplate: (templateId: string) => void;
  startFromMasterTemplate: () => void;
  deleteCourse: (courseId: string) => void;
  jumpToSection: (section: SectionId, fieldId?: string) => void;
  clearTargetFocusField: () => void;
  resetToSampleData: () => void;
  startAIGeneration: () => void;
  setGeneratedCourseForActive: (generated: GeneratedCourse) => void;
}

export function useCourseStore(): UseCourseStoreReturn {
  // When launching this web application, default to starting from scratch (no pre-existing course info)
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: any) => sanitizeCourse(c));
        }
      }
    } catch (e) {
      console.error('Failed to load courses from localStorage:', e);
    }
    return [createScratchCourse('Untitled Course')];
  });

  const [activeCourseId, setActiveCourseId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_COURSE_KEY);
      if (savedId) return savedId;
    } catch (e) {}
    return courses[0]?.id || 'scratch-new-course';
  });

  const [activeSection, setActiveSection] = useState<SectionId>('01');
  const [view, setView] = useState<AppView>('cover');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [targetFocusField, setTargetFocusField] = useState<string | null>(null);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Active course reference - fallback to a fresh scratch course, fully sanitized
  const rawActive = courses.find(c => c.id === activeCourseId) || courses[0] || createScratchCourse('Untitled Course');
  const activeCourse = sanitizeCourse(rawActive);

  // QA calculation
  const qaResult = evaluateCourseQA(activeCourse);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
    } catch (e) {
      console.error('Failed to save courses to localStorage:', e);
    }
  }, [courses]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_COURSE_KEY, activeCourseId);
    } catch (e) {}
  }, [activeCourseId]);

  const updateActiveCourse = useCallback((updater: Partial<Course> | ((prev: Course) => Course)) => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    setCourses(prevCourses => {
      return prevCourses.map(c => {
        if (c.id === activeCourseId) {
          const updated = typeof updater === 'function' ? updater(c) : { ...c, ...updater };
          return {
            ...updated,
            lastModified: 'Just now'
          };
        }
        return c;
      });
    });

    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus('saved');
    }, 600);
  }, [activeCourseId]);

  const switchCourse = useCallback((courseId: string) => {
    setActiveCourseId(courseId);
    setView('builder');
    setActiveSection('01');
  }, []);

  // Explicit Start from Scratch: creates a completely empty course with zero existing information
  const startFromScratch = useCallback((title: string = 'Untitled Course') => {
    const freshCourse = createScratchCourse(title);
    setCourses(prev => [freshCourse, ...prev]);
    setActiveCourseId(freshCourse.id);
    setActiveSection('01');
    setView('builder');
  }, []);

  // Explicit Continue from an Existing Template
  const continueFromTemplate = useCallback((templateId: string) => {
    const templateOpt = availableTemplates.find(t => t.id === templateId) || availableTemplates[0];
    const newId = `course-from-${templateOpt.id}-${Date.now()}`;
    const newCourse: Course = {
      ...JSON.parse(JSON.stringify(templateOpt.course)),
      id: newId,
      name: `${templateOpt.course.name} (Copy)`,
      lastModified: 'Just now'
    };

    setCourses(prev => [newCourse, ...prev]);
    setActiveCourseId(newId);
    setActiveSection('01');
    setView('builder');
  }, []);

  const createNewCourse = useCallback((title: string = 'Untitled Course') => {
    startFromScratch(title);
  }, [startFromScratch]);

  const startFromMasterTemplate = useCallback(() => {
    continueFromTemplate('master-template-v9');
  }, [continueFromTemplate]);

  const startAIGeneration = useCallback(() => {
    setView('generating');
  }, []);

  const setGeneratedCourseForActive = useCallback((generated: GeneratedCourse) => {
    updateActiveCourse({
      generatedCourse: generated,
      approvalStatus: generated.qa?.status === 'approved' && generated.approvedAt ? 'approved' : 'ai_generated'
    });
    setView('generated');
  }, [updateActiveCourse]);

  const deleteCourse = useCallback((courseId: string) => {
    setCourses(prev => {
      const remaining = prev.filter(c => c.id !== courseId);
      if (remaining.length === 0) {
        return [createScratchCourse('Untitled Course')];
      }
      return remaining;
    });

    if (activeCourseId === courseId) {
      const remaining = courses.filter(c => c.id !== courseId);
      const nextId = remaining[0]?.id || createScratchCourse('Untitled Course').id;
      setActiveCourseId(nextId);
    }
  }, [activeCourseId, courses]);

  const jumpToSection = useCallback((section: SectionId, fieldId?: string) => {
    setView('builder');
    setActiveSection(section);
    if (fieldId) {
      setTargetFocusField(fieldId);
    }
  }, []);

  const clearTargetFocusField = useCallback(() => {
    setTargetFocusField(null);
  }, []);

  const resetToSampleData = useCallback(() => {
    setCourses(sampleCourses);
    setActiveCourseId(sampleCourses[0].id);
    setActiveSection('01');
    setView('dashboard');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleCourses));
      localStorage.setItem(ACTIVE_COURSE_KEY, sampleCourses[0].id);
    } catch (e) {}
  }, []);

  return {
    courses,
    activeCourse,
    activeSection,
    view,
    saveStatus,
    qaResult,
    targetFocusField,
    availableTemplates,
    setView,
    setActiveSection,
    updateActiveCourse,
    switchCourse,
    createNewCourse,
    startFromScratch,
    continueFromTemplate,
    startFromMasterTemplate,
    deleteCourse,
    jumpToSection,
    clearTargetFocusField,
    resetToSampleData,
    startAIGeneration,
    setGeneratedCourseForActive
  };
}


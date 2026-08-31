import { useState, useEffect, useCallback, useRef } from 'react';
import { Course, SectionId } from '../types';
import { sampleCourses, blankMasterTemplate } from '../data/initialCourseData';
import { evaluateCourseQA, QAResult } from '../utils/qaEngine';

const STORAGE_KEY = 'estudy_course_builder_courses_v9';
const ACTIVE_COURSE_KEY = 'estudy_course_builder_active_id_v9';

export type AppView = 'dashboard' | 'builder' | 'preview';

export interface UseCourseStoreReturn {
  courses: Course[];
  activeCourse: Course;
  activeSection: SectionId;
  view: AppView;
  saveStatus: 'saved' | 'saving';
  qaResult: QAResult;
  targetFocusField: string | null;
  setView: (view: AppView) => void;
  setActiveSection: (section: SectionId) => void;
  updateActiveCourse: (updater: Partial<Course> | ((prev: Course) => Course)) => void;
  switchCourse: (courseId: string) => void;
  createNewCourse: (title?: string) => void;
  startFromMasterTemplate: () => void;
  deleteCourse: (courseId: string) => void;
  jumpToSection: (section: SectionId, fieldId?: string) => void;
  clearTargetFocusField: () => void;
  resetToSampleData: () => void;
}

export function useCourseStore(): UseCourseStoreReturn {
  // Load courses from localStorage or default to sampleCourses
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load courses from localStorage:', e);
    }
    return sampleCourses;
  });

  const [activeCourseId, setActiveCourseId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_COURSE_KEY);
      if (savedId) return savedId;
    } catch (e) {}
    return sampleCourses[0]?.id || 'course-ai-literacy-2026';
  });

  const [activeSection, setActiveSection] = useState<SectionId>('01');
  const [view, setView] = useState<AppView>('dashboard');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [targetFocusField, setTargetFocusField] = useState<string | null>(null);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Active course reference
  const activeCourse = courses.find(c => c.id === activeCourseId) || courses[0] || blankMasterTemplate;

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

  const createNewCourse = useCallback((title: string = 'Untitled eStudy Course') => {
    const newId = `course-${Date.now()}`;
    const newCourse: Course = {
      ...blankMasterTemplate,
      id: newId,
      name: title,
      code: `EST-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      lastModified: 'Just now',
      structure: {
        ...blankMasterTemplate.structure,
        title: title
      }
    };

    setCourses(prev => [newCourse, ...prev]);
    setActiveCourseId(newId);
    setActiveSection('01');
    setView('builder');
  }, []);

  const startFromMasterTemplate = useCallback(() => {
    const newId = `course-${Date.now()}`;
    const newCourse: Course = {
      ...blankMasterTemplate,
      id: newId,
      name: 'New Course from Master Template v9.0',
      code: `EST-V9-${Math.floor(100 + Math.random() * 900)}`,
      lastModified: 'Just now',
      structure: {
        ...blankMasterTemplate.structure,
        title: 'New Course from Master Template v9.0'
      }
    };

    setCourses(prev => [newCourse, ...prev]);
    setActiveCourseId(newId);
    setActiveSection('01');
    setView('builder');
  }, []);

  const deleteCourse = useCallback((courseId: string) => {
    setCourses(prev => {
      const remaining = prev.filter(c => c.id !== courseId);
      if (remaining.length === 0) {
        return [blankMasterTemplate];
      }
      return remaining;
    });

    if (activeCourseId === courseId) {
      const remaining = courses.filter(c => c.id !== courseId);
      const nextId = remaining[0]?.id || blankMasterTemplate.id;
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
  };
}

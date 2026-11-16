import { useState, useEffect, useCallback, useRef } from 'react';
import { Course, SectionId, GeneratedCourse, AIProvider } from '../types';
import { 
  sampleCourses, 
  blankMasterTemplate, 
  createScratchCourse, 
  availableTemplates as defaultTemplates, 
  CourseTemplateOption,
  emotionalIntelligenceTemplateCourse,
  financialLiteracyBenchmarkCourse
} from '../data/initialCourseData';
import { evaluateCourseQA, QAResult } from '../utils/qaEngine';
import { sanitizeCourse } from '../utils/courseSanitizer';

const STORAGE_KEY = 'estudy_course_builder_courses_v14';
const ACTIVE_COURSE_KEY = 'estudy_course_builder_active_id_v14';
const CUSTOM_TEMPLATES_KEY = 'estudy_custom_templates_v1';
const AI_PROVIDER_KEY = 'estudy_ai_provider_v1';
const AI_MODEL_KEY = 'estudy_ai_model_v1';

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
  selectedAIProvider: AIProvider;
  selectedAIModel: string;
  setAIProvider: (provider: AIProvider) => void;
  setAIModel: (model: string) => void;
  setView: (view: AppView) => void;
  setActiveSection: (section: SectionId) => void;
  updateActiveCourse: (updater: Partial<Course> | ((prev: Course) => Course)) => void;
  switchCourse: (courseId: string) => void;
  createNewCourse: (title?: string) => void;
  createQuickCourse: (
    payload: {
      title: string;
      description: string;
      targetAudience: string;
      industryDomain: string;
      difficultyLevel: string;
      estimatedDuration: string;
      learningObjectives?: string[];
      templateId?: string;
    },
    options?: {
      generateImmediately?: boolean;
      provider?: AIProvider;
      model?: string;
    }
  ) => void;
  startFromScratch: (title?: string) => void;
  continueFromTemplate: (templateId: string) => void;
  startFromMasterTemplate: () => void;
  deleteCourse: (courseId: string) => void;
  duplicateCourse: (courseId: string) => void;
  saveAsCustomTemplate: (courseId: string) => void;
  exportWorkspace: () => void;
  importWorkspace: (fileContent: string) => { success: boolean; message: string };
  jumpToSection: (section: SectionId, fieldId?: string) => void;
  clearTargetFocusField: () => void;
  resetToSampleData: () => void;
  startAIGeneration: (provider?: AIProvider, model?: string) => void;
  setGeneratedCourseForActive: (generated: GeneratedCourse) => void;
}

export function useCourseStore(): UseCourseStoreReturn {
  // Custom templates stored in localStorage
  const [customTemplates, setCustomTemplates] = useState<CourseTemplateOption[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load custom templates:', e);
    }
    return [];
  });

  // Workspace courses initialization
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map((c: any) => sanitizeCourse(c));
          // Ensure the Emotional Intelligence template is in workspace
          const hasEQ = sanitized.some(
            (c: Course) =>
              c.id === emotionalIntelligenceTemplateCourse.id ||
              c.code === 'EST-EQ-01' ||
              (c.name && c.name.toLowerCase().includes('emotional intelligence'))
          );
          if (!hasEQ) {
            return [emotionalIntelligenceTemplateCourse, ...sanitized];
          }
          return sanitized;
        }
      }

      // Check older storage keys to recover any courses the user created previously
      const fallbackKeys = [
        'estudy_course_builder_courses_v13',
        'estudy_course_builder_courses_v12',
        'estudy_course_builder_courses_v11',
        'estudy_course_builder_courses_v10',
        'estudy_course_builder_courses'
      ];
      for (const fKey of fallbackKeys) {
        const fallbackSaved = localStorage.getItem(fKey);
        if (fallbackSaved) {
          const parsed = JSON.parse(fallbackSaved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const sanitized = parsed.map((c: any) => sanitizeCourse(c));
            const hasEQ = sanitized.some(
              (c: Course) =>
                c.id === emotionalIntelligenceTemplateCourse.id ||
                c.code === 'EST-EQ-01' ||
                (c.name && c.name.toLowerCase().includes('emotional intelligence'))
            );
            return hasEQ ? sanitized : [emotionalIntelligenceTemplateCourse, ...sanitized];
          }
        }
      }
    } catch (e) {
      console.error('Failed to load courses from localStorage:', e);
    }

    // Default for fresh sessions / Vercel deployments:
    return [
      emotionalIntelligenceTemplateCourse,
      financialLiteracyBenchmarkCourse,
      blankMasterTemplate
    ];
  });

  const [activeCourseId, setActiveCourseId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_COURSE_KEY);
      if (savedId) return savedId;
    } catch (e) {}
    return courses[0]?.id || emotionalIntelligenceTemplateCourse.id;
  });

  const [activeSection, setActiveSection] = useState<SectionId>('01');
  const [view, setView] = useState<AppView>('dashboard');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [targetFocusField, setTargetFocusField] = useState<string | null>(null);

  // Provider-agnostic AI engine selection state
  const [selectedAIProvider, setSelectedAIProviderState] = useState<AIProvider>(() => {
    try {
      const saved = localStorage.getItem(AI_PROVIDER_KEY);
      if (saved === 'groq' || saved === 'gemini') return saved;
    } catch (e) {}
    return 'gemini';
  });

  const [selectedAIModel, setSelectedAIModelState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(AI_MODEL_KEY);
      if (saved && saved.trim()) return saved;
    } catch (e) {}
    return 'gemini-3.8-flash';
  });

  const setAIProvider = useCallback((provider: AIProvider) => {
    setSelectedAIProviderState(provider);
    const defaultModel = provider === 'groq' ? 'openai/gpt-oss-120b' : 'gemini-3.8-flash';
    setSelectedAIModelState(defaultModel);
    try {
      localStorage.setItem(AI_PROVIDER_KEY, provider);
      localStorage.setItem(AI_MODEL_KEY, defaultModel);
    } catch (e) {}
  }, []);

  const setAIModel = useCallback((model: string) => {
    setSelectedAIModelState(model);
    try {
      localStorage.setItem(AI_MODEL_KEY, model);
    } catch (e) {}
  }, []);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Combined available templates (built-in + user custom saved templates)
  const allTemplates = [...defaultTemplates, ...customTemplates];

  // Active course reference - fallback to a fresh scratch course, fully sanitized
  const rawActive = courses.find(c => c.id === activeCourseId) || courses[0] || emotionalIntelligenceTemplateCourse;
  const activeCourse = sanitizeCourse(rawActive);

  // QA calculation
  const qaResult = evaluateCourseQA(activeCourse);

  // Sync courses to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
    } catch (e) {
      console.error('Failed to save courses to localStorage:', e);
    }
  }, [courses]);

  // Sync activeCourseId to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_COURSE_KEY, activeCourseId);
    } catch (e) {}
  }, [activeCourseId]);

  // Sync custom templates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(customTemplates));
    } catch (e) {
      console.error('Failed to save custom templates:', e);
    }
  }, [customTemplates]);

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
    }, 500);
  }, [activeCourseId]);

  const switchCourse = useCallback((courseId: string) => {
    setActiveCourseId(courseId);
    setView('builder');
    setActiveSection('01');
  }, []);

  // Explicit Start from Scratch: creates a completely empty course
  const startFromScratch = useCallback((title: string = 'Untitled Course') => {
    const freshCourse = createScratchCourse(title);
    setCourses(prev => [freshCourse, ...prev]);
    setActiveCourseId(freshCourse.id);
    setActiveSection('01');
    setView('builder');
  }, []);

  // Explicit Continue from an Existing Template
  const continueFromTemplate = useCallback((templateId: string) => {
    const templateOpt = allTemplates.find(t => t.id === templateId) || allTemplates[0];
    const newId = `course-from-${templateOpt.id}-${Date.now()}`;
    const newCourse: Course = {
      ...JSON.parse(JSON.stringify(templateOpt.course)),
      id: newId,
      name: `${templateOpt.course.name} (Workspace Copy)`,
      lastModified: 'Just now'
    };

    setCourses(prev => [newCourse, ...prev]);
    setActiveCourseId(newId);
    setActiveSection('01');
    setView('builder');
  }, [allTemplates]);

  // Quick AI Course Creation: maps basic corporate inputs into the 9-section framework
  const createQuickCourse = useCallback((
    payload: {
      title: string;
      description: string;
      targetAudience: string;
      industryDomain: string;
      difficultyLevel: string;
      estimatedDuration: string;
      learningObjectives?: string[];
      templateId?: string;
    },
    options?: {
      generateImmediately?: boolean;
      provider?: AIProvider;
      model?: string;
    }
  ) => {
    // If a template is picked (other than 'scratch'), start from that template as base
    const baseCourse = payload.templateId && payload.templateId !== 'scratch'
      ? (allTemplates.find(t => t.id === payload.templateId)?.course || createScratchCourse(payload.title))
      : createScratchCourse(payload.title);

    const year = new Date().getFullYear();
    const randCode = Math.floor(100 + Math.random() * 900);
    const code = `EST-${year}-${randCode}`;

    const newCourse: Course = {
      ...JSON.parse(JSON.stringify(baseCourse)),
      id: `course-${Date.now()}`,
      name: payload.title,
      code,
      status: 'Draft',
      lastModified: 'Just now',
      problem: {
        ...baseCourse.problem,
        taskOrSkill: payload.description || baseCourse.problem?.taskOrSkill || `Practical workplace competencies and performance excellence in ${payload.title}.`,
        targetGroup: payload.targetAudience || baseCourse.problem?.targetGroup || 'Operational professionals and corporate team members',
        operationalImpact: baseCourse.problem?.operationalImpact || `Enhanced productivity, elimination of errors, and compliance with statutory standards.`,
        skillGaps: baseCourse.problem?.skillGaps || `Need for structured standard operating procedures and verification checklists.`,
        aiLiteracyGap: baseCourse.problem?.aiLiteracyGap || `Understanding practical tool usage, safe data practices, and verification checklists.`
      },
      structure: {
        ...baseCourse.structure,
        title: payload.title,
        code,
        industryDomain: payload.industryDomain || baseCourse.structure?.industryDomain || 'Corporate Enterprise & Operations',
        targetRoles: payload.targetAudience || baseCourse.structure?.targetRoles || 'Corporate employees and team leads',
        difficultyLevel: payload.difficultyLevel || baseCourse.structure?.difficultyLevel || 'Intermediate',
        estimatedDuration: payload.estimatedDuration || baseCourse.structure?.estimatedDuration || '4 Hours',
        purposeStatement: payload.description || baseCourse.structure?.purposeStatement || `Equip learners with actionable skills and compliance readiness in ${payload.title}.`
      }
    };

    if (payload.learningObjectives && payload.learningObjectives.length > 0) {
      newCourse.learningDesign = {
        ...newCourse.learningDesign,
        learningObjectivesList: payload.learningObjectives
      };
    }

    const sanitized = sanitizeCourse(newCourse);
    setCourses(prev => [sanitized, ...prev]);
    setActiveCourseId(sanitized.id);

    if (options?.generateImmediately) {
      if (options.provider) {
        setSelectedAIProviderState(options.provider);
        try { localStorage.setItem(AI_PROVIDER_KEY, options.provider); } catch (e) {}
      }
      if (options.model) {
        setSelectedAIModelState(options.model);
        try { localStorage.setItem(AI_MODEL_KEY, options.model); } catch (e) {}
      }
      setView('generating');
    } else {
      setActiveSection('01');
      setView('builder');
    }
  }, [allTemplates]);

  const createNewCourse = useCallback((title: string = 'Untitled Course') => {
    startFromScratch(title);
  }, [startFromScratch]);

  const startFromMasterTemplate = useCallback(() => {
    continueFromTemplate('emotional-intelligence-template');
  }, [continueFromTemplate]);

  const duplicateCourse = useCallback((courseId: string) => {
    const target = courses.find(c => c.id === courseId);
    if (!target) return;
    const duplicated: Course = {
      ...JSON.parse(JSON.stringify(target)),
      id: `course-copy-${Date.now()}`,
      name: `${target.name || 'Untitled Course'} (Copy)`,
      lastModified: 'Just now'
    };
    setCourses(prev => [duplicated, ...prev]);
    setActiveCourseId(duplicated.id);
  }, [courses]);

  const saveAsCustomTemplate = useCallback((courseId: string) => {
    const target = courses.find(c => c.id === courseId);
    if (!target) return;
    const templateOption: CourseTemplateOption = {
      id: `custom-tpl-${Date.now()}`,
      name: target.name || 'Custom Saved Template',
      badge: 'Custom Template',
      description: target.structure?.purposeStatement || 'Custom workspace template created by user.',
      course: JSON.parse(JSON.stringify(target))
    };
    setCustomTemplates(prev => [templateOption, ...prev]);
  }, [courses]);

  // Export workspace courses as downloadable JSON backup file
  const exportWorkspace = useCallback(() => {
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        version: 'v9.0',
        courses,
        customTemplates
      };
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `estudy-workspace-backup-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error('Failed to export workspace:', e);
    }
  }, [courses, customTemplates]);

  // Import workspace courses from JSON backup
  const importWorkspace = useCallback((fileContent: string) => {
    try {
      const parsed = JSON.parse(fileContent);
      let importedCourses: Course[] = [];
      if (Array.isArray(parsed)) {
        importedCourses = parsed;
      } else if (parsed && Array.isArray(parsed.courses)) {
        importedCourses = parsed.courses;
        if (Array.isArray(parsed.customTemplates)) {
          setCustomTemplates(prev => [...parsed.customTemplates, ...prev]);
        }
      } else if (parsed && parsed.name && parsed.structure) {
        importedCourses = [parsed];
      }

      if (importedCourses.length === 0) {
        return { success: false, message: 'No valid courses found in file.' };
      }

      const sanitized = importedCourses.map(c => sanitizeCourse(c));
      setCourses(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const filteredNew = sanitized.filter(c => !existingIds.has(c.id));
        return [...filteredNew, ...prev];
      });

      if (sanitized[0]?.id) {
        setActiveCourseId(sanitized[0].id);
      }

      return { success: true, message: `Successfully imported ${sanitized.length} course(s) into workspace!` };
    } catch (e: any) {
      return { success: false, message: e.message || 'Invalid JSON format.' };
    }
  }, []);

  const startAIGeneration = useCallback((provider?: AIProvider, model?: string) => {
    if (provider) {
      setSelectedAIProviderState(provider);
      try {
        localStorage.setItem(AI_PROVIDER_KEY, provider);
      } catch (e) {}
    }
    if (model) {
      setSelectedAIModelState(model);
      try {
        localStorage.setItem(AI_MODEL_KEY, model);
      } catch (e) {}
    } else if (provider) {
      const defaultModel = provider === 'groq' ? 'openai/gpt-oss-120b' : 'gemini-3.8-flash';
      setSelectedAIModelState(defaultModel);
      try {
        localStorage.setItem(AI_MODEL_KEY, defaultModel);
      } catch (e) {}
    }
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
        return [emotionalIntelligenceTemplateCourse];
      }
      return remaining;
    });

    if (activeCourseId === courseId) {
      const remaining = courses.filter(c => c.id !== courseId);
      const nextId = remaining[0]?.id || emotionalIntelligenceTemplateCourse.id;
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
    availableTemplates: allTemplates,
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
    clearTargetFocusField,
    resetToSampleData,
    startAIGeneration,
    setGeneratedCourseForActive
  };
}



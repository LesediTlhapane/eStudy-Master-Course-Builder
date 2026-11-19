import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  ImageRun
} from 'docx';
import { Course, GeneratedCourse } from '../types';
import { generateLocalFallbackCourse } from './localCourseEngine';
import { enforceComprehensiveCourseVolume, calculateGeneratedCourseVolume } from './courseVolumeEngine';
import { OFFICIAL_20_QA_CHECKLIST_ITEMS } from '../components/Section08QA';

/**
 * Safely convert a base64 data URL (PNG/JPG) into a Word ImageRun paragraph
 */
function createDocxImageParagraph(
  dataUrl: string | undefined,
  width: number,
  height: number
): Paragraph | null {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return null;
  try {
    const commaIdx = dataUrl.indexOf(',');
    if (commaIdx === -1) return null;
    const header = dataUrl.slice(0, commaIdx).toLowerCase();
    // ImageRun in docx supports png, jpg, gif, bmp
    if (header.includes('svg')) return null;
    const imgType: 'png' | 'jpg' | 'gif' | 'bmp' = header.includes('png')
      ? 'png'
      : header.includes('gif')
      ? 'gif'
      : header.includes('bmp')
      ? 'bmp'
      : 'jpg';

    const base64Data = dataUrl.slice(commaIdx + 1);
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 160 },
      children: [
        new ImageRun({
          data: bytes,
          transformation: { width, height },
          type: imgType
        })
      ]
    });
  } catch {
    return null;
  }
}

function fieldLine(label: string, value: string | undefined, fallback = 'To Be Confirmed'): Paragraph {
  const valText = value && value.trim() ? value : fallback;
  return new Paragraph({
    spacing: { after: 100 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 21, color: '052B66' }),
      new TextRun({ text: valText, size: 21 })
    ]
  });
}

function sectionHeading(title: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 140 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 28,
        color: '052B66'
      })
    ]
  });
}

function subHeading(title: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 220, after: 100 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 24,
        color: '052B66'
      })
    ]
  });
}

/**
 * DOWNLOAD 1: COMPLETED MASTER COURSE TEMPLATE (DOCX)
 * Exports the user's completed 9-section eStudy Master Course Generation Template (v9.0)
 */
export async function generateMasterTemplateDocx(course: Course): Promise<Blob> {
  const p = course.problem || ({} as any);
  const r = course.research || ({} as any);
  const lp = r.learnerProfile || ({} as any);
  const s = course.structure || ({} as any);
  const ld = course.learningDesign || ({} as any);
  const e = course.ethics || ({} as any);
  const o = course.outputRequirements || ({} as any);
  const c = course.customisation || ({} as any);
  const checklistState = course.qa?.checklistItems || {};

  const assembledProblem = `This course addresses the inability of ${
    p.targetGroup?.trim() || '[TARGET GROUP]'
  } to effectively perform ${
    p.taskOrSkill?.trim() || '[TASK / SKILL]'
  }, resulting in ${
    p.operationalImpact?.trim() || '[OPERATIONAL / FINANCIAL / COMPLIANCE / PRODUCTIVITY IMPACT]'
  }.`;

  const children: Paragraph[] = [];

  // Optional Logo & Banner
  const logoPara = createDocxImageParagraph(course.coverLogoUrl, 160, 55);
  if (logoPara) children.push(logoPara);

  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 120 },
      children: [
        new TextRun({
          text: 'UNIVERSAL MASTER COURSE GENERATION TEMPLATE (v9.0)',
          bold: true,
          size: 38,
          color: '052B66'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: s.title || course.name || 'Completed Course Design Specification',
          bold: true,
          size: 26,
          color: '1E701C'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: `eStudy South Africa · Completed Master Course Template · Exported ${new Date().toLocaleDateString('en-ZA')}`,
          italics: true,
          size: 20,
          color: '475569'
        })
      ]
    })
  );

  const bannerPara = createDocxImageParagraph(course.coverVisualUrl, 480, 180);
  if (bannerPara) children.push(bannerPara);

  // =========================================================================
  // SECTION 1: IDENTIFY PROBLEM / CHALLENGE / DEVELOPMENT AREA
  // =========================================================================
  children.push(
    sectionHeading('1. IDENTIFY PROBLEM / CHALLENGE / DEVELOPMENT AREA'),
    subHeading('1.1 Required Problem Statement'),
    fieldLine('Target Group', p.targetGroup),
    fieldLine('Task / Skill', p.taskOrSkill),
    fieldLine('Operational / Financial / Compliance / Productivity Impact', p.operationalImpact),
    fieldLine('Assembled Problem Statement', p.statement || assembledProblem),
    subHeading('1.2 Root Cause Analysis'),
    fieldLine('Root Cause 1', p.rootCause1),
    fieldLine('Root Cause 2', p.rootCause2),
    fieldLine('Process or System Failures', p.processFailures),
    fieldLine('Skills or Knowledge Gaps', p.skillGaps),
    fieldLine('Organisational or Environmental Constraints', p.environmentalConstraints),
    subHeading('1.3 AI-Specific Considerations'),
    fieldLine('AI Literacy Gap', p.aiLiteracyGap),
    fieldLine('Data and Digital Readiness Level', p.digitalReadinessLevel),
    fieldLine('Ethical or Compliance Risks Introduced by AI Use', p.ethicalComplianceRisks)
  );

  // =========================================================================
  // SECTION 2: SOURCES OF INFORMATION (RESEARCH LAYER)
  // =========================================================================
  children.push(
    sectionHeading('2. SOURCES OF INFORMATION (RESEARCH LAYER)'),
    subHeading('2.1 Reference Links & Supporting Documents')
  );

  if (r.sources && r.sources.length > 0) {
    r.sources.forEach((src: any, idx: number) => {
      children.push(
        fieldLine(
          `Link ${idx + 1} (${src.type || 'Source'})`,
          `${src.name} — Ref: ${src.reference || src.url || 'N/A'} (${src.relevance || ''})`
        )
      );
    });
  } else {
    children.push(fieldLine('Reference Links', 'To Be Confirmed'));
  }

  children.push(
    subHeading('2.2 Industry / Regulatory Sources'),
    fieldLine('Regulatory Framework', r.regulatorySources),
    subHeading('2.3 AI & Technology Sources'),
    fieldLine('AI Tools or Platforms Used in This Domain', r.aiToolsReferenced),
    fieldLine('Relevant AI Ethics Framework', r.ethicsFrameworks),
    fieldLine('Industry Case Studies or Use Cases', r.industryUseCases),
    subHeading('Learner Profile and Environment'),
    fieldLine('Learner Job Roles', lp.jobRoles || s.jobRoles),
    fieldLine('Departments', lp.departments || s.departments),
    fieldLine('Experience Levels', lp.experienceLevels || s.experienceLevel),
    fieldLine('Existing Knowledge', lp.existingKnowledge),
    fieldLine('Digital Literacy', lp.digitalLiteracy || s.digitalLiteracyLevel),
    fieldLine('AI Familiarity', lp.aiFamiliarity || s.aiFamiliarityBaseline),
    fieldLine('Workplace Environment', lp.workplaceEnvironment),
    fieldLine('Organisational Constraints', lp.organisationalConstraints),
    fieldLine('Available Tools and Technology', lp.availableToolsAndTechnology)
  );

  // =========================================================================
  // SECTION 3: COURSE STRUCTURE
  // =========================================================================
  children.push(
    sectionHeading('3. COURSE STRUCTURE'),
    subHeading('3.1 Course Details'),
    fieldLine('Course Name', s.title || course.name),
    fieldLine('Course Code / ID', s.code),
    fieldLine('Industry / Domain', s.industryDomain),
    fieldLine('Target Role Group', s.targetRoles),
    fieldLine('AI Integration Level', s.aiIntegrationLevel),
    fieldLine('Accreditation / Qualification / Standards Alignment', s.setaNqfLevel),
    fieldLine('Language(s)', s.deliveryLanguages),
    fieldLine('Estimated Duration', s.estimatedDuration),
    subHeading('3.2 Course Overview'),
    fieldLine('Purpose of the Course', s.purposeStatement),
    fieldLine('Workplace Relevance', s.workplaceRelevance),
    fieldLine('Expected Performance Improvement', s.performanceImprovement),
    fieldLine('AI or Technology Angle', s.aiTechAngle),
    subHeading('3.3 About the Course'),
    fieldLine('What the Course Covers', s.scopeSummary),
    fieldLine('Why It Is Important in Today’s AI-Enabled Workplace', s.aiEraRelevance),
    fieldLine('How It Improves Job Performance', s.performanceLink),
    subHeading('3.4 Benefits of the Course'),
    fieldLine(
      'Organisational Benefits',
      (s.organisationalBenefits || []).filter(Boolean).join('; ')
    ),
    fieldLine(
      'Employee Benefits',
      (s.employeeBenefits || []).filter(Boolean).join('; ')
    ),
    fieldLine(
      'Risk Reduction Outcomes',
      (s.riskReductionOutcomes || []).filter(Boolean).join('; ')
    ),
    subHeading('3.5 Course Description'),
    fieldLine('Scope of Learning', s.scope),
    fieldLine('Key Competencies Developed', s.keyCompetencies),
    fieldLine('Real Workplace Application', s.realWorldApplication),
    fieldLine('AI-Specific Skills Built in This Course', s.aiSkillsDeveloped),
    subHeading('3.6 Target Audience'),
    fieldLine('Job Roles', s.jobRoles),
    fieldLine('Departments', s.departments),
    fieldLine('Experience Level', s.experienceLevel),
    fieldLine('AI Familiarity Level', s.aiFamiliarityBaseline),
    fieldLine('AI Capability Explanation', s.aiFamiliarityExplanation),
    subHeading('3.7 Prerequisites'),
    fieldLine('Required Knowledge', s.prerequisiteKnowledge),
    fieldLine('Required Experience', s.prerequisiteExperience),
    fieldLine('Tool / System Familiarity', s.toolsSystems),
    fieldLine('Digital Literacy Minimum', s.digitalLiteracyLevel),
    subHeading('3.8 Pre-Course Diagnostic Questions')
  );

  (s.diagnosticQuestions || []).forEach((dq: any, idx: number) => {
    children.push(
      fieldLine(`Q${idx + 1} (${dq.category || 'Diagnostic'})`, dq.question)
    );
  });

  children.push(subHeading('3.9 Module Overview Table'));
  (course.modules || []).forEach((mod, idx) => {
    children.push(
      fieldLine(
        `Module ${idx + 1}`,
        `Title: ${mod.title || 'To Be Confirmed'} | Purpose: ${mod.purpose || 'To Be Confirmed'} | Key Skills: ${mod.keySkills || 'To Be Confirmed'}`
      )
    );
  });

  // =========================================================================
  // SECTION 4: MODULE BREAKDOWN
  // =========================================================================
  children.push(sectionHeading('4. MODULE BREAKDOWN'));
  (course.modules || []).forEach((mod, idx) => {
    const req = mod.requirements || ({} as any);
    children.push(
      subHeading(`4.${idx + 1} Module ${idx + 1}: ${mod.title || 'Module Specification'}`),
      fieldLine('Module Purpose', mod.purpose),
      fieldLine(
        'Learning Objectives',
        (mod.learningObjectives || mod.learningOutcomes || []).filter(Boolean).join('; ')
      ),
      fieldLine('Core Content & Problem Definition', req.problemDefinition || mod.coreConcepts),
      fieldLine('Key Terms & Frameworks', req.keyTerms || mod.definitionsFrameworks),
      fieldLine('Causes, Warning Signs & Impact', req.warningSigns || mod.rootCausesExploration),
      fieldLine('Tools, Techniques & Procedures', req.procedureSteps || mod.practicalExercises),
      fieldLine('AI Topic Coverage & Demystification', req.aiDemystification || mod.aiTopicCoverage),
      fieldLine('Responsible AI & Governance', req.responsibleAiPrinciples || mod.aiGovernanceElement),
      fieldLine('Implementation Checklist Title', req.implementationChecklistTitle || mod.sopTemplatesChecklists),
      fieldLine('Rollout Framework / Action Plan', req.rolloutFrameworkTitle || mod.implementationPlan),
      fieldLine('Risk & Compliance Section', req.riskComplianceSectionTitle || mod.kpiMetrics)
    );
  });

  // =========================================================================
  // SECTION 5: LEARNING DESIGN REQUIREMENTS
  // =========================================================================
  children.push(
    sectionHeading('5. LEARNING DESIGN REQUIREMENTS'),
    subHeading('5.1 Core Design Standards'),
    fieldLine('Instructional Approach & Methodology', ld.instructionalApproach),
    fieldLine('Core Standards Summary', ld.coreStandardsSummary),
    fieldLine('Examples & Relevance Strategy', ld.examplesAndRelevance),
    fieldLine('Reflection Prompts', ld.reflectionPrompts),
    fieldLine('Authentic Workplace Activities', (ld.workplaceActivities || []).join('; ')),
    subHeading('5.2 AI-Enhanced Learning Design'),
    fieldLine('AI Demonstration / Simulation Format', ld.aiDemoSimulationDescription),
    fieldLine('Prompting & Evaluation Exercises', ld.promptExerciseDescription),
    fieldLine('Critical Thinking & Verification Rubric', ld.criticalThinkingDescription),
    fieldLine('Human-AI Collaboration Activity', ld.collaborationActivity),
    subHeading('5.3 Assessment Design'),
    fieldLine('Practical Task Weighting (%)', ld.practicalTaskWeighting),
    fieldLine('Final Assessment Pass Mark (%)', ld.finalAssessmentPassMark),
    fieldLine('Formative Knowledge Checks', ld.knowledgeChecksDescription),
    fieldLine('Summative Capstone & Evaluation Task', ld.aiEvaluationTask)
  );

  // =========================================================================
  // SECTION 6: ETHICAL & PROFESSIONAL STANDARDS
  // =========================================================================
  children.push(
    sectionHeading('6. ETHICAL & PROFESSIONAL STANDARDS'),
    subHeading('6.1 Core Ethics Requirements'),
    fieldLine('Ethical Decision-Making Framework', e.decisionMakingFramework),
    fieldLine('Confidentiality & POPIA Requirements', e.confidentialityRequirements),
    fieldLine('Professional Accountability Mechanism', e.accountabilityMechanism),
    fieldLine('Psychological Safety & Inclusivity', e.psychologicalSafetyNotes),
    subHeading('6.2 AI Ethics & Responsible AI'),
    fieldLine('Bias & Fairness', e.aiBiasRisk),
    fieldLine('Data Privacy (POPIA / GDPR)', e.dataPrivacyFramework),
    fieldLine('Transparency & AI Disclosure', e.aiDisclosureRequirement),
    fieldLine('Human-in-the-Loop Override Scenarios', e.humanOverrideScenarios),
    fieldLine('Data Sovereignty', e.dataSovereigntyContext),
    fieldLine('Workforce Impact Narrative', e.aiWorkforceImpactNarrative)
  );

  // =========================================================================
  // SECTION 7: OUTPUT FORMAT REQUIREMENTS
  // =========================================================================
  children.push(
    sectionHeading('7. OUTPUT FORMAT REQUIREMENTS'),
    subHeading('7.1 – 7.4 Output Format & Accessibility'),
    fieldLine('Output Format', o.outputFormat),
    fieldLine('Target Reading Level & Accessibility', o.accessibilityTargetReadingLevel),
    subHeading('7.5 Accreditation & Standards Alignment'),
    fieldLine('Accreditation Body', o.accreditationBody || 'Not Applicable'),
    fieldLine('Qualification / Unit Standard', o.qualificationOrUnitStandard || 'Not Applicable'),
    fieldLine('NQF Level', o.nqfLevel || s.setaNqfLevel || 'Not Applicable'),
    fieldLine('Accreditation Requirements', o.accreditationRequirements || 'Not Applicable'),
    fieldLine('Required Learning Structure', o.requiredLearningStructure || 'Not Applicable'),
    fieldLine('Assessment Requirements', o.accreditationAssessmentRequirements || 'Not Applicable')
  );

  // =========================================================================
  // SECTION 8: QUALITY ASSURANCE & BENCHMARK
  // =========================================================================
  children.push(
    sectionHeading('8. QUALITY ASSURANCE & BENCHMARK'),
    subHeading('8.1 Quality Assurance Checklist (20 Official Items)')
  );
  OFFICIAL_20_QA_CHECKLIST_ITEMS.forEach(item => {
    const checked = checklistState[item.id] ? '[✓] Verified' : '[ ] Pending Verification';
    children.push(
      fieldLine(`Item ${item.number}`, `${checked} — ${item.requirement}`)
    );
  });

  // =========================================================================
  // SECTION 9: CUSTOMISATION GUIDE
  // =========================================================================
  children.push(
    sectionHeading('9. CUSTOMISATION GUIDE'),
    fieldLine('Brand Tone & Communication Style', c.tone),
    fieldLine('Client / Organisation Branding Guidelines', c.branding),
    fieldLine('Target LMS & Delivery Preferences', c.deliveryPreferences),
    fieldLine('Industry Examples & Terminology', c.industryExamples)
  );

  if (c.historicalCourses && c.historicalCourses.length > 0) {
    children.push(subHeading('9.1 Courses Built Using This Template'));
    c.historicalCourses.forEach((h: any, idx: number) => {
      children.push(
        fieldLine(
          `#${idx + 1} ${h.courseTitle}`,
          `Industry: ${h.industry} | Date Built: ${h.dateBuilt} | Version: ${h.version}`
        )
      );
    });
  }

  const doc = new Document({
    creator: 'eStudy South Africa Master Course Builder',
    title: `${s.title || course.name || 'eStudy'} — Completed Master Course Template v9.0`,
    description: 'Completed eStudy Master Course Generation Template (v9.0)',
    sections: [{ properties: {}, children }]
  });

  return await Packer.toBlob(doc);
}

/**
 * Helper to convert markdown-formatted lesson contentBody into clean Word paragraphs
 */
function renderMarkdownToDocxParagraphs(markdown: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const lines = (markdown || '').split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('### ')) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 80 },
          children: [
            new TextRun({
              text: line.replace(/^###\s+/, '').replace(/\*\*/g, ''),
              bold: true,
              size: 22,
              color: '052B66'
            })
          ]
        })
      );
    } else if (line.startsWith('## ')) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 100 },
          children: [
            new TextRun({
              text: line.replace(/^##\s+/, '').replace(/\*\*/g, ''),
              bold: true,
              size: 24,
              color: '052B66'
            })
          ]
        })
      );
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      const cleanBullet = line.replace(/^[-•]\s+/, '');
      const parts = cleanBullet.split('**');
      const runs: TextRun[] = parts.map((part, idx) =>
        new TextRun({
          text: part,
          bold: idx % 2 === 1,
          size: 21
        })
      );
      paragraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 60 },
          children: runs
        })
      );
    } else if (/^\d+\.\s+/.test(line)) {
      const parts = line.split('**');
      const runs: TextRun[] = parts.map((part, idx) =>
        new TextRun({
          text: part,
          bold: idx % 2 === 1,
          size: 21
        })
      );
      paragraphs.push(
        new Paragraph({
          spacing: { before: 60, after: 60 },
          indent: { left: 360 },
          children: runs
        })
      );
    } else {
      const parts = line.split('**');
      const runs: TextRun[] = parts.map((part, idx) =>
        new TextRun({
          text: part,
          bold: idx % 2 === 1,
          size: 21
        })
      );
      paragraphs.push(
        new Paragraph({
          spacing: { after: 120 },
          children: runs
        })
      );
    }
  }

  return paragraphs;
}

/**
 * DOWNLOAD 2: GENERATED TRAINING COURSE (DOCX)
 */
export async function generateCourseDocx(course: Course): Promise<Blob> {
  const p = course.problem || ({} as any);
  const s = course.structure || ({} as any);
  const r = course.research || ({} as any);

  // Preserve genuine AI-generated modules without synthetic fallback padding
  const rawGen: GeneratedCourse = course.generatedCourse
    ? JSON.parse(JSON.stringify(course.generatedCourse))
    : generateLocalFallbackCourse(course);
  const isLocalFallback = !rawGen.generationMetadata || rawGen.generationMetadata.provider === 'local_fallback';
  const gen = isLocalFallback ? enforceComprehensiveCourseVolume(rawGen, course) : rawGen;
  const volume = calculateGeneratedCourseVolume(gen);

  const children: Paragraph[] = [];

  // Embed Course Logo if uploaded
  const logoPara = createDocxImageParagraph(course.coverLogoUrl, 160, 55);
  if (logoPara) children.push(logoPara);

  children.push(
    // =========================================================================
    // COVER PAGE & EXECUTIVE SPECIFICATION
    // =========================================================================
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 150 },
      children: [
        new TextRun({
          text: gen.title || course.name || s.title || 'Course Blueprint & Master Manual',
          bold: true,
          size: 46,
          color: '052B66'
        })
      ]
    }),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: `Code: ${gen.code || course.code || 'EST-COURSE-01'}  |  Version: ${gen.version || 'v9.0'}  |  Estimated ~${volume.estimatedPages} A4 Pages (${volume.totalWords.toLocaleString()} Words)`,
          bold: true,
          size: 22,
          color: '1E701C'
        })
      ]
    }),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 250 },
      children: [
        new TextRun({
          text: `eStudy South Africa — Comprehensive Participant & Facilitator Course Manual`,
          italics: true,
          size: 20,
          color: '475569'
        })
      ]
    })
  );

  // Embed Course Banner if uploaded
  const bannerPara = createDocxImageParagraph(course.coverVisualUrl, 480, 180);
  if (bannerPara) children.push(bannerPara);

  children.push(
    // Section 1: Executive Overview
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 150 },
      children: [
        new TextRun({
          text: '1. Executive Overview, Purpose & Target Audience',
          bold: true,
          size: 28,
          color: '052B66'
        })
      ]
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({ text: 'Executive Course Overview: ', bold: true, size: 21 }),
        new TextRun({ text: gen.overview, size: 21 })
      ]
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({ text: 'Strategic Purpose: ', bold: true, size: 21 }),
        new TextRun({ text: gen.purpose, size: 21 })
      ]
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: 'Target Learner Roles: ', bold: true, size: 21 }),
        new TextRun({ text: gen.targetAudience || s.targetRoles || p.targetGroup || 'Operational personnel, team leads, and specialists', size: 21 })
      ]
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: 'Industry / Domain: ', bold: true, size: 21 }),
        new TextRun({ text: s.industryDomain || 'South African Enterprise Operations', size: 21 })
      ]
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({ text: 'Duration & NQF Level: ', bold: true, size: 21 }),
        new TextRun({ text: `${gen.estimatedDuration || s.estimatedDuration || '16 Hours / 2 CPD Credits'} | ${s.setaNqfLevel || 'To Be Confirmed (Requires SME Validation)'}`, size: 21 })
      ]
    }),

    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: 'Master Programme Learning Outcomes (Bloom’s Taxonomy)',
          bold: true,
          size: 24,
          color: '052B66'
        })
      ]
    }),
    ...gen.learningOutcomes.map(lo =>
      new Paragraph({
        bullet: { level: 0 },
        spacing: { after: 60 },
        children: [new TextRun({ text: lo, size: 21 })]
      })
    ),

    // Section 2: Problem & Challenge
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 350, after: 150 },
      children: [
        new TextRun({
          text: '2. Problem Definition, Root Causes & Regulatory Context',
          bold: true,
          size: 28,
          color: '052B66'
        })
      ]
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: 'Workplace Challenge: ', bold: true, size: 21 }),
        new TextRun({ text: p.taskOrSkill || 'Identified performance bottleneck requiring standardised capability.', size: 21 })
      ]
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: 'Operational Impact: ', bold: true, size: 21 }),
        new TextRun({ text: p.operationalImpact || 'Productivity delays, compliance risks, and unverified outputs.', size: 21 })
      ]
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: 'Skills & Knowledge Gaps: ', bold: true, size: 21 }),
        new TextRun({ text: p.skillGaps || 'Lack of structured methodologies and compliance verification protocols.', size: 21 })
      ]
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({ text: 'Governing Statutory Framework: ', bold: true, size: 21 }),
        new TextRun({ text: r.regulatorySources || r.regulatoryFramework || 'To Be Confirmed (Requires SME Validation)', size: 21 })
      ]
    }),

    // Section 3: Pre-Course Diagnostic
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 350, after: 150 },
      children: [
        new TextRun({
          text: `3. ${gen.assessments.preCourseDiagnostic.title}`,
          bold: true,
          size: 28,
          color: '052B66'
        })
      ]
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({ text: gen.assessments.preCourseDiagnostic.instructions, italics: true, size: 21 })
      ]
    }),
    ...gen.assessments.preCourseDiagnostic.questions.flatMap((dq, qIdx) => [
      new Paragraph({
        spacing: { before: 140, after: 60 },
        children: [
          new TextRun({ text: `Diagnostic Question ${qIdx + 1}: ${dq.question}`, bold: true, size: 21, color: '052B66' })
        ]
      }),
      ...dq.options.map((opt, oIdx) =>
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: `${String.fromCharCode(65 + oIdx)}. ${opt}${oIdx === dq.correctAnswer ? '  [✓ Benchmark Target]' : ''}`,
              bold: oIdx === dq.correctAnswer,
              size: 20
            })
          ]
        })
      ),
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({ text: 'Diagnostic Rationale: ', bold: true, italics: true, size: 20 }),
          new TextRun({ text: dq.rationale, italics: true, size: 20 })
        ]
      })
    ])
  );

  // =========================================================================
  // SECTION 4: FULL MULTI-MODULE TEXTBOOK CURRICULUM
  // =========================================================================
  gen.modules.forEach((mod, idx) => {
    children.push(
      new Paragraph({
        children: [new PageBreak()]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: `MODULE ${mod.moduleNumber || idx + 1}: ${mod.title.toUpperCase()}`,
            bold: true,
            size: 30,
            color: '052B66'
          })
        ]
      }),
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({ text: 'Module Focus: ', bold: true, size: 21 }),
          new TextRun({ text: mod.subtitle || 'Comprehensive Workplace Integration', italics: true, size: 21 })
        ]
      }),
      new Paragraph({
        spacing: { after: 140 },
        children: [
          new TextRun({ text: 'Operational Purpose: ', bold: true, size: 21 }),
          new TextRun({ text: mod.purpose, size: 21 })
        ]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 160, after: 80 },
        children: [
          new TextRun({
            text: `Module ${mod.moduleNumber} Learning Objectives (Bloom's Taxonomy)`,
            bold: true,
            size: 24,
            color: '052B66'
          })
        ]
      }),
      ...mod.learningObjectives.map(lo =>
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 50 },
          children: [
            new TextRun({ text: `${lo.code} [${lo.bloomLevel || 'Apply'}]: `, bold: true, size: 21 }),
            new TextRun({ text: lo.statement, size: 21 })
          ]
        })
      )
    );

    // Module Lessons
    mod.lessons.forEach((lesson, lIdx) => {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 280, after: 80 },
          children: [
            new TextRun({
              text: `Lesson ${mod.moduleNumber}.${lIdx + 1}: ${lesson.title} (${lesson.durationMinutes} mins)`,
              bold: true,
              size: 25,
              color: '052B66'
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: 'Key Concepts Covered: ', bold: true, size: 20, color: '1E701C' }),
            new TextRun({ text: (lesson.concepts || []).join('  •  '), size: 20 })
          ]
        }),
        ...renderMarkdownToDocxParagraphs(lesson.contentBody)
      );

      // Callouts
      if (lesson.callouts && lesson.callouts.length > 0) {
        lesson.callouts.forEach(cal => {
          children.push(
            new Paragraph({
              spacing: { before: 120, after: 120 },
              indent: { left: 360, right: 240 },
              children: [
                new TextRun({ text: `[${cal.type.toUpperCase()} — ${cal.title}]: `, bold: true, size: 20, color: '052B66' }),
                new TextRun({ text: cal.content, size: 20 })
              ]
            })
          );
        });
      }

      // Workplace & AI Applications
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 60 },
          children: [
            new TextRun({ text: 'Workplace Application Protocol: ', bold: true, size: 21, color: '052B66' }),
            new TextRun({ text: lesson.workplaceApplication, size: 21 })
          ]
        }),
        new Paragraph({
          spacing: { after: 180 },
          children: [
            new TextRun({ text: 'AI Tool Integration & Human-in-the-Loop Governance: ', bold: true, size: 21, color: '1E701C' }),
            new TextRun({ text: lesson.aiApplication, size: 21 })
          ]
        })
      );
    });

    // Module Scenarios
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 260, after: 100 },
        children: [
          new TextRun({
            text: `Module ${mod.moduleNumber} Applied Workplace & AI Governance Scenarios`,
            bold: true,
            size: 24,
            color: '052B66'
          })
        ]
      })
    );

    mod.scenarios.forEach((sc, scIdx) => {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 60 },
          children: [
            new TextRun({
              text: `Scenario ${mod.moduleNumber}.${scIdx + 1} [${sc.type}]: ${sc.title}`,
              bold: true,
              size: 22,
              color: '052B66'
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 50 },
          children: [
            new TextRun({ text: 'Situation: ', bold: true, size: 21 }),
            new TextRun({ text: sc.situation, size: 21 })
          ]
        }),
        new Paragraph({
          spacing: { after: 50 },
          children: [
            new TextRun({ text: 'Operational Challenge: ', bold: true, size: 21 }),
            new TextRun({ text: sc.challenge, size: 21 })
          ]
        }),
        new Paragraph({
          spacing: { after: 50 },
          children: [
            new TextRun({ text: 'Critical Decision Point: ', bold: true, size: 21, color: 'B45309' }),
            new TextRun({ text: sc.decisionPoint, size: 21 })
          ]
        }),
        new Paragraph({
          spacing: { after: 50 },
          children: [
            new TextRun({ text: 'Pedagogical Debrief & Analysis: ', bold: true, size: 21, color: '052B66' }),
            new TextRun({ text: sc.debrief, size: 21 })
          ]
        }),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({ text: 'Key Operational Takeaway: ', bold: true, italics: true, size: 21, color: '1E701C' }),
            new TextRun({ text: sc.keyTakeaway, italics: true, size: 21 })
          ]
        })
      );
    });

    // Module Knowledge Checks
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 260, after: 100 },
        children: [
          new TextRun({
            text: `Module ${mod.moduleNumber} Formative Knowledge Checks`,
            bold: true,
            size: 24,
            color: '052B66'
          })
        ]
      })
    );

    mod.knowledgeChecks.forEach((kc, kIdx) => {
      children.push(
        new Paragraph({
          spacing: { before: 140, after: 60 },
          children: [
            new TextRun({
              text: `Question ${mod.moduleNumber}.${kIdx + 1}: ${kc.question}`,
              bold: true,
              size: 21,
              color: '052B66'
            })
          ]
        }),
        ...kc.options.map((opt, oIdx) =>
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: `${String.fromCharCode(65 + oIdx)}. ${opt}${oIdx === kc.correctAnswer ? '  [✓ Correct Answer]' : ''}`,
                bold: oIdx === kc.correctAnswer,
                size: 20
              })
            ]
          })
        ),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: 'Pedagogical Rationale: ', bold: true, italics: true, size: 20 }),
            new TextRun({ text: kc.rationale, italics: true, size: 20 })
          ]
        })
      );
    });

    // Practical Task
    if (mod.practicalTask) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 80 },
          children: [
            new TextRun({
              text: `Module ${mod.moduleNumber} Practical Workplace Application Task: ${mod.practicalTask.title}`,
              bold: true,
              size: 24,
              color: '052B66'
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: 'Task Instructions: ', bold: true, size: 21 }),
            new TextRun({ text: mod.practicalTask.instructions, size: 21 })
          ]
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: 'Required Portfolio Deliverable: ', bold: true, size: 21 }),
            new TextRun({ text: mod.practicalTask.deliverable, size: 21 })
          ]
        }),
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: 'Assessor Evaluation Rubric:', bold: true, size: 21 })
          ]
        }),
        ...mod.practicalTask.evaluationRubric.map(rub =>
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [new TextRun({ text: rub, size: 20 })]
          })
        )
      );
    }

    // Module Summary
    children.push(
      new Paragraph({
        spacing: { before: 160, after: 200 },
        children: [
          new TextRun({ text: `Module ${mod.moduleNumber} Executive Synthesis: `, bold: true, size: 21, color: '052B66' }),
          new TextRun({ text: mod.summary, italics: true, size: 21 })
        ]
      })
    );
  });

  // =========================================================================
  // SECTION 5: SUMMATIVE FINAL ASSESSMENT & CAPSTONE CASE STUDY
  // =========================================================================
  children.push(
    new Paragraph({
      children: [new PageBreak()]
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 120 },
      children: [
        new TextRun({
          text: `${gen.modules.length + 4}. ${gen.assessments.finalAssessment.title} (Pass Mark: ${gen.assessments.finalAssessment.passMark})`,
          bold: true,
          size: 28,
          color: '052B66'
        })
      ]
    }),
    new Paragraph({
      spacing: { after: 140 },
      children: [
        new TextRun({ text: gen.assessments.finalAssessment.instructions, size: 21 })
      ]
    }),
    ...gen.assessments.finalAssessment.questions.flatMap((fq, qIdx) => [
      new Paragraph({
        spacing: { before: 140, after: 60 },
        children: [
          new TextRun({ text: `Exam Question ${qIdx + 1}: ${fq.question}`, bold: true, size: 21, color: '052B66' })
        ]
      }),
      ...fq.options.map((opt, oIdx) =>
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: `${String.fromCharCode(65 + oIdx)}. ${opt}${oIdx === fq.correctAnswer ? '  [✓ Correct Answer]' : ''}`,
              bold: oIdx === fq.correctAnswer,
              size: 20
            })
          ]
        })
      ),
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({ text: 'Assessor Rationale: ', bold: true, italics: true, size: 20 }),
          new TextRun({ text: fq.rationale, italics: true, size: 20 })
        ]
      })
    ])
  );

  if (gen.assessments.finalAssessment.capstoneCaseStudy) {
    const cap = gen.assessments.finalAssessment.capstoneCaseStudy;
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 280, after: 100 },
        children: [
          new TextRun({
            text: `Summative Capstone Case Study: ${cap.title}`,
            bold: true,
            size: 25,
            color: '052B66'
          })
        ]
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({ text: 'Case Scenario Brief: ', bold: true, size: 21 }),
          new TextRun({ text: cap.scenario, size: 21 })
        ]
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: 'Mandatory Candidate Tasks:', bold: true, size: 21 })
        ]
      }),
      ...cap.tasks.map(t =>
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 60 },
          children: [new TextRun({ text: t, size: 21 })]
        })
      ),
      new Paragraph({
        spacing: { before: 100, after: 200 },
        children: [
          new TextRun({ text: 'Summative Portfolio Deliverable: ', bold: true, size: 21, color: '052B66' }),
          new TextRun({ text: cap.deliverable, size: 21 })
        ]
      })
    );
  }

  // Ethics, Governance & Sign-off
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 120 },
      children: [
        new TextRun({
          text: `${gen.modules.length + 5}. Ethics, POPIA Compliance & Quality Assurance Sign-Off`,
          bold: true,
          size: 28,
          color: '052B66'
        })
      ]
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: 'Data Privacy & Safeguards: ', bold: true, size: 21 }),
        new TextRun({ text: course.ethics?.dataPrivacyFramework || 'To Be Confirmed (Requires SME Validation — align data-handling safeguards with applicable privacy policies and statutory requirements).', size: 21 })
      ]
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({ text: 'Human-in-the-Loop Governance: ', bold: true, size: 21 }),
        new TextRun({ text: course.ethics?.humanOverrideScenarios || 'Zero-bias algorithmic oversight and mandatory practitioner sign-off on all AI-assisted deliverables.', size: 21 })
      ]
    }),
    ...gen.qa.passedChecks.map(chk =>
      new Paragraph({
        bullet: { level: 0 },
        spacing: { after: 40 },
        children: [new TextRun({ text: `✓ ${chk}`, size: 20, color: '1E701C' })]
      })
    )
  );

  const doc = new Document({
    creator: 'eStudy South Africa Course Builder',
    title: gen.title || course.name || 'eStudy Master Course Manual',
    description: `Estimated ~${volume.estimatedPages}-page training manual (${volume.totalWords.toLocaleString()} words) generated under eStudy Master Prompt Framework v9.0`,
    sections: [
      {
        properties: {},
        children
      }
    ]
  });

  return await Packer.toBlob(doc);
}

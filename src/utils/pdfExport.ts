import { Course, GeneratedCourse } from '../types';
import { generateLocalFallbackCourse } from './localCourseEngine';
import { enforceComprehensiveCourseVolume, calculateGeneratedCourseVolume } from './courseVolumeEngine';
import { OFFICIAL_20_QA_CHECKLIST_ITEMS } from '../components/Section08QA';

function formatMarkdownToHtml(md: string): string {
  if (!md) return '';
  const lines = md.split('\n');
  const htmlParts: string[] = [];
  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      continue;
    }

    const formattedInline = line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');

    if (line.startsWith('### ')) {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      htmlParts.push(`<h4 class="lesson-subheading">${formattedInline.replace(/^###\s+/, '')}</h4>`);
    } else if (line.startsWith('## ')) {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      htmlParts.push(`<h3 class="lesson-heading">${formattedInline.replace(/^##\s+/, '')}</h3>`);
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      if (!inList) {
        htmlParts.push('<ul class="lesson-list">');
        inList = true;
      }
      htmlParts.push(`<li>${formattedInline.replace(/^[-•]\s+/, '')}</li>`);
    } else if (/^\d+\.\s+/.test(line)) {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      htmlParts.push(`<p class="lesson-step">${formattedInline}</p>`);
    } else {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      htmlParts.push(`<p class="lesson-para">${formattedInline}</p>`);
    }
  }

  if (inList) {
    htmlParts.push('</ul>');
  }

  return htmlParts.join('\n');
}

function triggerHtmlPrint(html: string) {
  let iframe = document.getElementById('estudy-print-iframe') as HTMLIFrameElement;
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'estudy-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 550);
  }
}

function valOrTbc(val?: string | string[] | null, fallback = 'To Be Confirmed'): string {
  if (Array.isArray(val)) {
    const joined = val.filter(Boolean).join(', ');
    return joined.trim() ? joined : fallback;
  }
  return val && val.trim() ? val : fallback;
}

/**
 * DOWNLOAD 1: COMPLETED MASTER COURSE TEMPLATE (PDF)
 * Exports the user's completed 9-section eStudy Master Course Generation Template (v9.0)
 * with embedded Course Logo and Banner Image.
 */
export function printMasterTemplatePdf(course: Course) {
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

  const logoHtml = course.coverLogoUrl
    ? `<img src="${course.coverLogoUrl}" alt="Course Logo" style="max-height: 60px; object-fit: contain; margin-bottom: 10px;" />`
    : `<div style="display:inline-block; background: #052B66; color: #fff; padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 700;">eStudy South Africa</div>`;

  const bannerHtml = course.coverVisualUrl
    ? `<div style="margin: 16px 0;"><img src="${course.coverVisualUrl}" alt="Course Banner" style="width: 100%; max-height: 190px; object-fit: cover; border-radius: 8px; border: 1px solid #cbd5e1;" /></div>`
    : '';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${s.title || course.name || 'eStudy'} — Completed Master Course Template v9.0</title>
  <style>
    @page { size: A4; margin: 16mm 15mm; }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      font-size: 10pt;
      margin: 0;
      padding: 0;
      background: #fff;
    }
    .header-box {
      border-bottom: 3px solid #45CC42;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .brand-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .badge {
      background: #052B66;
      color: #45CC42;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 8.5pt;
      text-transform: uppercase;
    }
    h1 {
      font-size: 18pt;
      color: #052B66;
      margin: 6px 0;
      font-weight: 800;
    }
    h2 {
      font-size: 12.5pt;
      color: #fff;
      background: #052B66;
      padding: 7px 12px;
      border-left: 5px solid #45CC42;
      border-radius: 4px;
      margin: 22px 0 10px 0;
      page-break-after: avoid;
    }
    h3 {
      font-size: 10.5pt;
      color: #052B66;
      margin: 14px 0 6px 0;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 3px;
      page-break-after: avoid;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 14px 0;
      font-size: 9.5pt;
    }
    th {
      background: #052B66;
      color: #fff;
      text-align: left;
      padding: 7px 10px;
      font-weight: 700;
    }
    td {
      border: 1px solid #cbd5e1;
      padding: 7px 10px;
      vertical-align: top;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    .field-row {
      margin: 5px 0;
    }
    .field-row strong {
      color: #052B66;
    }
    .footer-note {
      text-align: center;
      font-size: 8.5pt;
      color: #64748b;
      margin-top: 28px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
    }
    @media print {
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div class="brand-bar">
      <div>${logoHtml}</div>
      <span class="badge">Completed Master Course Template v9.0</span>
    </div>
    <h1>UNIVERSAL MASTER COURSE GENERATION TEMPLATE</h1>
    <div style="font-size: 12pt; font-weight: 700; color: #1e701c;">${valOrTbc(s.title || course.name, 'Untitled Course')}</div>
    ${bannerHtml}
  </div>

  <!-- SECTION 1 -->
  <h2>1. IDENTIFY PROBLEM / CHALLENGE / DEVELOPMENT AREA</h2>
  <h3>1.1 Required Problem Statement</h3>
  <table>
    <tr><td style="width:32%"><strong>Target Group</strong></td><td>${valOrTbc(p.targetGroup)}</td></tr>
    <tr><td><strong>Task / Skill</strong></td><td>${valOrTbc(p.taskOrSkill)}</td></tr>
    <tr><td><strong>Operational / Financial / Compliance / Productivity Impact</strong></td><td>${valOrTbc(p.operationalImpact)}</td></tr>
    <tr><td><strong>Official Problem Statement</strong></td><td>${valOrTbc(p.statement, assembledProblem)}</td></tr>
  </table>

  <h3>1.2 Root Cause Analysis</h3>
  <table>
    <tr><td style="width:32%"><strong>Root Cause 1</strong></td><td>${valOrTbc(p.rootCause1)}</td></tr>
    <tr><td><strong>Root Cause 2</strong></td><td>${valOrTbc(p.rootCause2)}</td></tr>
    <tr><td><strong>Process or System Failures</strong></td><td>${valOrTbc(p.processFailures)}</td></tr>
    <tr><td><strong>Skills or Knowledge Gaps</strong></td><td>${valOrTbc(p.skillGaps)}</td></tr>
    <tr><td><strong>Organisational or Environmental Constraints</strong></td><td>${valOrTbc(p.environmentalConstraints)}</td></tr>
  </table>

  <h3>1.3 AI-Specific Considerations</h3>
  <table>
    <tr><td style="width:32%"><strong>AI Literacy Gap</strong></td><td>${valOrTbc(p.aiLiteracyGap)}</td></tr>
    <tr><td><strong>Data and Digital Readiness Level</strong></td><td>${valOrTbc(p.digitalReadinessLevel)}</td></tr>
    <tr><td><strong>Ethical or Compliance Risks Introduced by AI Use</strong></td><td>${valOrTbc(p.ethicalComplianceRisks)}</td></tr>
  </table>

  <!-- SECTION 2 -->
  <h2>2. SOURCES OF INFORMATION (RESEARCH LAYER)</h2>
  <h3>2.1 Reference Links & Supporting Documents</h3>
  <table>
    <thead><tr><th>#</th><th>Source / Document Title</th><th>Reference / URL</th><th>Relevance</th></tr></thead>
    <tbody>
      ${
        (r.sources || []).length > 0
          ? (r.sources || [])
              .map(
                (src: any, idx: number) =>
                  `<tr><td>Link ${idx + 1}</td><td>${valOrTbc(src.name)}</td><td>${valOrTbc(src.reference || src.url)}</td><td>${valOrTbc(src.relevance)}</td></tr>`
              )
              .join('')
          : `<tr><td colspan="4">To Be Confirmed</td></tr>`
      }
    </tbody>
  </table>

  <h3>2.2 Industry / Regulatory Sources & 2.3 AI & Technology Sources</h3>
  <table>
    <tr><td style="width:32%"><strong>2.2 Regulatory Framework</strong></td><td>${valOrTbc(r.regulatorySources)}</td></tr>
    <tr><td><strong>2.3 AI Tools or Platforms Used</strong></td><td>${valOrTbc(r.aiToolsReferenced)}</td></tr>
    <tr><td><strong>2.3 Relevant AI Ethics Framework</strong></td><td>${valOrTbc(r.ethicsFrameworks)}</td></tr>
    <tr><td><strong>2.3 Industry Case Studies / Use Cases</strong></td><td>${valOrTbc(r.industryUseCases)}</td></tr>
  </table>

  <h3>Learner Profile and Environment</h3>
  <table>
    <tr><td style="width:32%"><strong>Learner Job Roles</strong></td><td>${valOrTbc(lp.jobRoles || s.jobRoles)}</td></tr>
    <tr><td><strong>Departments</strong></td><td>${valOrTbc(lp.departments || s.departments)}</td></tr>
    <tr><td><strong>Experience Levels</strong></td><td>${valOrTbc(lp.experienceLevels || s.experienceLevel)}</td></tr>
    <tr><td><strong>Existing Knowledge</strong></td><td>${valOrTbc(lp.existingKnowledge)}</td></tr>
    <tr><td><strong>Digital Literacy</strong></td><td>${valOrTbc(lp.digitalLiteracy || s.digitalLiteracyLevel)}</td></tr>
    <tr><td><strong>AI Familiarity</strong></td><td>${valOrTbc(lp.aiFamiliarity || s.aiFamiliarityBaseline)}</td></tr>
    <tr><td><strong>Workplace Environment</strong></td><td>${valOrTbc(lp.workplaceEnvironment)}</td></tr>
    <tr><td><strong>Organisational Constraints</strong></td><td>${valOrTbc(lp.organisationalConstraints)}</td></tr>
    <tr><td><strong>Available Tools and Technology</strong></td><td>${valOrTbc(lp.availableToolsAndTechnology)}</td></tr>
  </table>

  <!-- SECTION 3 -->
  <h2>3. COURSE STRUCTURE</h2>
  <h3>3.1 Course Details</h3>
  <table>
    <tr><td style="width:32%"><strong>Course Name</strong></td><td>${valOrTbc(s.title || course.name)}</td></tr>
    <tr><td><strong>Course Code / ID</strong></td><td>${valOrTbc(s.code)}</td></tr>
    <tr><td><strong>Industry / Domain</strong></td><td>${valOrTbc(s.industryDomain)}</td></tr>
    <tr><td><strong>Target Role Group</strong></td><td>${valOrTbc(s.targetRoles)}</td></tr>
    <tr><td><strong>AI Integration Level</strong></td><td>${valOrTbc(s.aiIntegrationLevel)}</td></tr>
    <tr><td><strong>Accreditation / Qualification / Standards Alignment</strong></td><td>${valOrTbc(s.setaNqfLevel)}</td></tr>
    <tr><td><strong>Language(s)</strong></td><td>${valOrTbc(s.deliveryLanguages)}</td></tr>
    <tr><td><strong>Estimated Duration</strong></td><td>${valOrTbc(s.estimatedDuration)}</td></tr>
  </table>

  <h3>3.2 Course Overview & 3.3 About the Course</h3>
  <table>
    <tr><td style="width:32%"><strong>3.2 Purpose of the Course</strong></td><td>${valOrTbc(s.purposeStatement)}</td></tr>
    <tr><td><strong>3.2 Workplace Relevance</strong></td><td>${valOrTbc(s.workplaceRelevance)}</td></tr>
    <tr><td><strong>3.2 Expected Performance Improvement</strong></td><td>${valOrTbc(s.performanceImprovement)}</td></tr>
    <tr><td><strong>3.2 AI or Technology Angle</strong></td><td>${valOrTbc(s.aiTechAngle)}</td></tr>
    <tr><td><strong>3.3 What the Course Covers</strong></td><td>${valOrTbc(s.scopeSummary)}</td></tr>
    <tr><td><strong>3.3 Importance in AI-Enabled Workplace</strong></td><td>${valOrTbc(s.aiEraRelevance)}</td></tr>
    <tr><td><strong>3.3 How It Improves Job Performance</strong></td><td>${valOrTbc(s.performanceLink)}</td></tr>
  </table>

  <h3>3.4 Benefits of the Course & 3.5 Course Description</h3>
  <table>
    <tr><td style="width:32%"><strong>Organisational Benefits</strong></td><td>${valOrTbc((s.organisationalBenefits || []).filter(Boolean).join('; '))}</td></tr>
    <tr><td><strong>Employee Benefits</strong></td><td>${valOrTbc((s.employeeBenefits || []).filter(Boolean).join('; '))}</td></tr>
    <tr><td><strong>Risk Reduction Outcomes</strong></td><td>${valOrTbc((s.riskReductionOutcomes || []).filter(Boolean).join('; '))}</td></tr>
    <tr><td><strong>3.5 Scope of Learning</strong></td><td>${valOrTbc(s.scope)}</td></tr>
    <tr><td><strong>3.5 Key Competencies Developed</strong></td><td>${valOrTbc(s.keyCompetencies)}</td></tr>
    <tr><td><strong>3.5 Real Workplace Application</strong></td><td>${valOrTbc(s.realWorldApplication)}</td></tr>
    <tr><td><strong>3.5 AI-Specific Skills Built</strong></td><td>${valOrTbc(s.aiSkillsDeveloped)}</td></tr>
  </table>

  <h3>3.6 Target Audience & 3.7 Prerequisites</h3>
  <table>
    <tr><td style="width:32%"><strong>3.6 Job Roles & Departments</strong></td><td>${valOrTbc(s.jobRoles)} | ${valOrTbc(s.departments)}</td></tr>
    <tr><td><strong>3.6 Experience Level & AI Familiarity</strong></td><td>${valOrTbc(s.experienceLevel)} | AI Familiarity: ${valOrTbc(s.aiFamiliarityBaseline)} (${valOrTbc(s.aiFamiliarityExplanation)})</td></tr>
    <tr><td><strong>3.7 Required Knowledge & Experience</strong></td><td>${valOrTbc(s.prerequisiteKnowledge)} | ${valOrTbc(s.prerequisiteExperience)}</td></tr>
    <tr><td><strong>3.7 Tool Familiarity & Digital Literacy</strong></td><td>${valOrTbc(s.toolsSystems)} | ${valOrTbc(s.digitalLiteracyLevel)}</td></tr>
  </table>

  <h3>3.8 Pre-Course Diagnostic Questions</h3>
  <table>
    <thead><tr><th style="width:12%">#</th><th style="width:28%">Category</th><th>Diagnostic Question</th></tr></thead>
    <tbody>
      ${(s.diagnosticQuestions || [])
        .map(
          (dq: any, idx: number) =>
            `<tr><td>Q${idx + 1}</td><td>${valOrTbc(dq.category)}</td><td>${valOrTbc(dq.question)}</td></tr>`
        )
        .join('')}
    </tbody>
  </table>

  <h3>3.9 Module Overview Table</h3>
  <table>
    <thead><tr><th style="width:8%">#</th><th style="width:28%">Module Title</th><th style="width:34%">Purpose</th><th>Key Skills</th></tr></thead>
    <tbody>
      ${(course.modules || [])
        .map(
          (m, idx) =>
            `<tr><td>${idx + 1}</td><td>${valOrTbc(m.title)}</td><td>${valOrTbc(m.purpose)}</td><td>${valOrTbc(m.keySkills)}</td></tr>`
        )
        .join('')}
    </tbody>
  </table>

  <!-- SECTION 4 -->
  <h2>4. MODULE BREAKDOWN</h2>
  ${(course.modules || [])
    .map((m, idx) => {
      const req = m.requirements || ({} as any);
      return `
      <h3>4.${idx + 1} Module ${idx + 1}: ${valOrTbc(m.title)}</h3>
      <table>
        <tr><td style="width:32%"><strong>Module Purpose</strong></td><td>${valOrTbc(m.purpose)}</td></tr>
        <tr><td><strong>Learning Objectives</strong></td><td>${valOrTbc((m.learningObjectives || m.learningOutcomes || []).filter(Boolean).join('; '))}</td></tr>
        <tr><td><strong>Core Content & Problem Definition</strong></td><td>${valOrTbc(req.problemDefinition || m.coreConcepts)}</td></tr>
        <tr><td><strong>Key Terms & Frameworks</strong></td><td>${valOrTbc(req.keyTerms || m.definitionsFrameworks)}</td></tr>
        <tr><td><strong>Tools, Techniques & Step-by-Step Procedures</strong></td><td>${valOrTbc(req.procedureSteps || m.practicalExercises)}</td></tr>
        <tr><td><strong>AI Topic Coverage & Responsible AI</strong></td><td>${valOrTbc(req.aiDemystification || m.aiTopicCoverage)} | ${valOrTbc(req.responsibleAiPrinciples || m.aiGovernanceElement)}</td></tr>
        <tr><td><strong>Mandatory Deliverables</strong></td><td>Checklist: ${valOrTbc(req.implementationChecklistTitle)} | Rollout: ${valOrTbc(req.rolloutFrameworkTitle)} | Risk: ${valOrTbc(req.riskComplianceSectionTitle)}</td></tr>
      </table>
    `;
    })
    .join('')}

  <!-- SECTION 5 -->
  <h2>5. LEARNING DESIGN REQUIREMENTS</h2>
  <table>
    <tr><td style="width:32%"><strong>5.1 Instructional Approach</strong></td><td>${valOrTbc(ld.instructionalApproach)}</td></tr>
    <tr><td><strong>5.1 Core Standards Summary</strong></td><td>${valOrTbc(ld.coreStandardsSummary)}</td></tr>
    <tr><td><strong>5.2 AI Demonstration & Prompt Exercises</strong></td><td>${valOrTbc(ld.aiDemoSimulationDescription)} | ${valOrTbc(ld.promptExerciseDescription)}</td></tr>
    <tr><td><strong>5.3 Practical Task Weighting (%)</strong></td><td>${valOrTbc(ld.practicalTaskWeighting)}</td></tr>
    <tr><td><strong>5.3 Final Assessment Pass Mark (%)</strong></td><td>${valOrTbc(ld.finalAssessmentPassMark)}</td></tr>
    <tr><td><strong>5.3 Summative Capstone Task</strong></td><td>${valOrTbc(ld.aiEvaluationTask)}</td></tr>
  </table>

  <!-- SECTION 6 -->
  <h2>6. ETHICAL & PROFESSIONAL STANDARDS</h2>
  <table>
    <tr><td style="width:32%"><strong>6.1 Ethical Decision-Making</strong></td><td>${valOrTbc(e.decisionMakingFramework)}</td></tr>
    <tr><td><strong>6.1 Confidentiality (POPIA)</strong></td><td>${valOrTbc(e.confidentialityRequirements)}</td></tr>
    <tr><td><strong>6.2 Bias & Fairness</strong></td><td>${valOrTbc(e.aiBiasRisk)}</td></tr>
    <tr><td><strong>6.2 Data Privacy Safeguards</strong></td><td>${valOrTbc(e.dataPrivacyFramework)}</td></tr>
    <tr><td><strong>6.2 Transparency & AI Disclosure</strong></td><td>${valOrTbc(e.aiDisclosureRequirement)}</td></tr>
    <tr><td><strong>6.2 Human-in-the-Loop Override</strong></td><td>${valOrTbc(e.humanOverrideScenarios)}</td></tr>
  </table>

  <!-- SECTION 7 -->
  <h2>7. OUTPUT FORMAT REQUIREMENTS</h2>
  <table>
    <tr><td style="width:32%"><strong>7.1–7.4 Output Format & Reading Level</strong></td><td>${valOrTbc(o.outputFormat)} | ${valOrTbc(o.accessibilityTargetReadingLevel)}</td></tr>
    <tr><td><strong>7.5 Accreditation Body</strong></td><td>${valOrTbc(o.accreditationBody, 'Not Applicable')}</td></tr>
    <tr><td><strong>7.5 Qualification / Unit Standard</strong></td><td>${valOrTbc(o.qualificationOrUnitStandard, 'Not Applicable')}</td></tr>
    <tr><td><strong>7.5 NQF Level</strong></td><td>${valOrTbc(o.nqfLevel || s.setaNqfLevel, 'Not Applicable')}</td></tr>
    <tr><td><strong>7.5 Accreditation & Assessment Requirements</strong></td><td>${valOrTbc(o.accreditationRequirements, 'Not Applicable')} | ${valOrTbc(o.accreditationAssessmentRequirements, 'Not Applicable')}</td></tr>
  </table>

  <!-- SECTION 8 -->
  <h2>8. QUALITY ASSURANCE & BENCHMARK (8.1 CHECKLIST)</h2>
  <table>
    <thead><tr><th style="width:8%">#</th><th>Quality Requirement</th><th style="width:16%">Status</th></tr></thead>
    <tbody>
      ${OFFICIAL_20_QA_CHECKLIST_ITEMS.map(
        item =>
          `<tr><td>${item.number}</td><td>${item.requirement}</td><td>${
            checklistState[item.id] ? '✓ Verified' : 'Pending'
          }</td></tr>`
      ).join('')}
    </tbody>
  </table>

  <!-- SECTION 9 -->
  <h2>9. CUSTOMISATION GUIDE</h2>
  <table>
    <tr><td style="width:32%"><strong>Brand Tone & Style</strong></td><td>${valOrTbc(c.tone)}</td></tr>
    <tr><td><strong>Organisation Branding Guidelines</strong></td><td>${valOrTbc(c.branding)}</td></tr>
    <tr><td><strong>Target LMS & Delivery Preferences</strong></td><td>${valOrTbc(c.deliveryPreferences)}</td></tr>
    <tr><td><strong>Industry Examples & Terminology</strong></td><td>${valOrTbc(c.industryExamples)}</td></tr>
  </table>

  <div class="footer-note">
    eStudy South Africa · Completed Master Course Generation Template (v9.0) · Exported ${new Date().toLocaleDateString('en-ZA')}
  </div>
</body>
</html>
  `;

  triggerHtmlPrint(html);
}

/**
 * DOWNLOAD 2: GENERATED TRAINING COURSE (PDF)
 * Exports the complete AI-generated training course with embedded Logo and Banner.
 */
export function printCoursePdf(course: Course) {
  const p = course.problem || ({} as any);
  const s = course.structure || ({} as any);
  const r = course.research || ({} as any);

  const rawGen: GeneratedCourse = course.generatedCourse
    ? JSON.parse(JSON.stringify(course.generatedCourse))
    : generateLocalFallbackCourse(course);
  const isLocalFallback = !rawGen.generationMetadata || rawGen.generationMetadata.provider === 'local_fallback';
  const gen = isLocalFallback ? enforceComprehensiveCourseVolume(rawGen, course) : rawGen;
  const volume = calculateGeneratedCourseVolume(gen);

  const logoHtml = course.coverLogoUrl
    ? `<img src="${course.coverLogoUrl}" alt="Client Logo" style="max-height: 55px; object-fit: contain; margin-bottom: 12px;" />`
    : `<div style="display:inline-block; background: #052B66; color: #fff; padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px;">eStudy South Africa</div>`;

  const bannerHtml = course.coverVisualUrl
    ? `<div style="margin: 18px 0;"><img src="${course.coverVisualUrl}" alt="Course Banner" style="width: 100%; max-height: 210px; object-fit: cover; border-radius: 10px; border: 1px solid #cbd5e1;" /></div>`
    : '';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${gen.title || course.name || 'eStudy Comprehensive Course Manual'}</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm;
    }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.55;
      font-size: 10.5pt;
      margin: 0;
      padding: 0;
      background: #fff;
    }
    .cover-page {
      padding: 36px 0 48px 0;
      border-bottom: 3px solid #45CC42;
      margin-bottom: 28px;
      page-break-after: always;
    }
    .page-break {
      page-break-before: always;
    }
    .brand-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
    }
    .badge-v9 {
      background: #45CC42;
      color: #052B66;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 9pt;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    h1.title {
      font-size: 24pt;
      color: #052B66;
      margin: 10px 0 6px 0;
      font-weight: 800;
      line-height: 1.15;
    }
    .subtitle {
      font-size: 12pt;
      color: #475569;
      margin: 0 0 18px 0;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      background: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      margin-top: 20px;
    }
    .meta-item strong {
      display: block;
      font-size: 8.5pt;
      color: #052B66;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 3px;
    }
    .meta-item span {
      font-size: 10pt;
      color: #334155;
    }
    h2.section-header {
      font-size: 14pt;
      color: #052B66;
      border-left: 4px solid #45CC42;
      padding-left: 10px;
      margin: 26px 0 12px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      page-break-after: avoid;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 14px;
      margin-bottom: 12px;
    }
    .card-title {
      font-size: 11pt;
      font-weight: 700;
      color: #052B66;
      margin-bottom: 6px;
    }
    .card-desc {
      font-size: 10pt;
      color: #334155;
      margin: 4px 0;
    }
    .module-banner {
      background: #052B66;
      color: #ffffff;
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 18px;
      border-left: 6px solid #45CC42;
    }
    .module-banner h2 {
      margin: 0;
      font-size: 15pt;
    }
    .lesson-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 16px 18px;
      margin-bottom: 18px;
      background: #ffffff;
    }
    .lesson-title-bar {
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .lesson-title-bar h3 {
      margin: 0;
      font-size: 12.5pt;
      color: #052B66;
    }
    .lesson-subheading {
      font-size: 10.5pt;
      color: #052B66;
      margin: 14px 0 6px 0;
      font-weight: 700;
      border-bottom: 1px dashed #e2e8f0;
      padding-bottom: 2px;
    }
    .lesson-para, .lesson-step {
      margin: 6px 0;
      font-size: 10pt;
      color: #1e293b;
      text-align: justify;
    }
    .lesson-list {
      margin: 6px 0 10px 18px;
      padding: 0;
    }
    .lesson-list li {
      margin-bottom: 4px;
      font-size: 10pt;
    }
    .callout-box {
      background: #f0f9ff;
      border-left: 4px solid #052B66;
      padding: 10px 14px;
      margin: 10px 0;
      border-radius: 0 6px 6px 0;
      font-size: 9.5pt;
    }
    .scenario-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 4px solid #052B66;
      padding: 12px 16px;
      margin-bottom: 12px;
      border-radius: 6px;
      page-break-inside: avoid;
    }
    .kc-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      padding: 12px 16px;
      margin-bottom: 10px;
      border-radius: 6px;
      page-break-inside: avoid;
    }
    .footer-note {
      text-align: center;
      font-size: 8.5pt;
      color: #64748b;
      margin-top: 36px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>
  <!-- PAGE 1: COVER PAGE & EXECUTIVE SPECIFICATION -->
  <div class="cover-page">
    <div class="brand-bar">
      <div>${logoHtml}</div>
      <span class="badge-v9">Master Framework v9.0 · Est. ~${volume.estimatedPages}-Page Manual</span>
    </div>
    <h1 class="title">${gen.title || course.name || s.title || 'Course Master Manual'}</h1>
    <p class="subtitle">${gen.purpose}</p>
    ${bannerHtml}

    ${isLocalFallback || rawGen.generationMetadata?.isPartial ? `
      <div style="margin: 14px 0; padding: 12px 14px; background: #fef2f2; border: 1.5px solid #dc2626; border-radius: 6px; color: #991b1b; font-size: 9.5pt; font-weight: 700;">
        ${isLocalFallback
          ? 'NOTICE — OFFLINE FALLBACK DRAFT (NOT AI-GENERATED): This document is an offline placeholder draft. Run live AI generation (Google Gemini or Groq Cloud) and complete SME validation before learner release.'
          : `NOTICE — PARTIAL AI DRAFT (${rawGen.generationMetadata?.completedModules ?? rawGen.modules.length}/${rawGen.generationMetadata?.totalModules ?? rawGen.modules.length} MODULES COMPLETED): Live AI generation was interrupted before all modules finished.`}
      </div>
    ` : ''}

    <div class="meta-grid">
      <div class="meta-item">
        <strong>Course Code & Version</strong>
        <span>${gen.code || 'EST-2026-01'} (${gen.version || 'v9.0'})</span>
      </div>
      <div class="meta-item">
        <strong>Target Audience</strong>
        <span>${gen.targetAudience || s.targetRoles || 'Enterprise Employees'}</span>
      </div>
      <div class="meta-item">
        <strong>Duration & Credits</strong>
        <span>${gen.estimatedDuration || s.estimatedDuration || '16 Hours / 2 CPD Credits'}</span>
      </div>
      <div class="meta-item">
        <strong>Estimated Manual Volume</strong>
        <span>Est. ~${volume.estimatedPages} A4 Pages (${volume.totalWords.toLocaleString()} Words · print layout varies)</span>
      </div>
      <div class="meta-item">
        <strong>SETA / NQF Alignment</strong>
        <span>${s.setaNqfLevel || 'To Be Confirmed (Requires SME Validation)'}</span>
      </div>
      <div class="meta-item">
        <strong>Curriculum Scope</strong>
        <span>${volume.moduleCount} Modules · ${volume.lessonCount} Lessons · ${volume.scenarioCount} Scenarios</span>
      </div>
    </div>

    <h2 class="section-header">Executive Course Overview</h2>
    <div class="card">
      <p class="card-desc">${gen.overview}</p>
    </div>

    <h2 class="section-header">Master Programme Learning Outcomes (Bloom's Taxonomy)</h2>
    <div class="card">
      <ul class="lesson-list">
        ${gen.learningOutcomes.map(lo => `<li>${lo}</li>`).join('')}
      </ul>
    </div>

    <h2 class="section-header">Problem Definition & Statutory Compliance Context</h2>
    <div class="card">
      <p class="card-desc"><strong>Workplace Challenge:</strong> ${p.taskOrSkill || 'Identified workplace capability gap.'}</p>
      <p class="card-desc"><strong>Operational Impact:</strong> ${p.operationalImpact || 'Productivity latency, manual errors, or compliance risks.'}</p>
      <p class="card-desc"><strong>Primary Statutory Anchor:</strong> ${r.regulatorySources || r.regulatoryFramework || 'To Be Confirmed (Requires SME Validation)'}</p>
    </div>
  </div>

  <!-- PRE-COURSE DIAGNOSTIC -->
  <h2 class="section-header">Pre-Course Knowledge & Readiness Diagnostic (5 Items)</h2>
  <p class="card-desc" style="margin-bottom: 12px;">${gen.assessments.preCourseDiagnostic.instructions}</p>
  ${gen.assessments.preCourseDiagnostic.questions.map((dq, qIdx) => `
    <div class="kc-box">
      <div class="card-title">Diagnostic ${qIdx + 1}: ${dq.question}</div>
      <ul class="lesson-list">
        ${dq.options.map((opt, oIdx) => `
          <li style="${oIdx === dq.correctAnswer ? 'font-weight:700; color:#052B66;' : ''}">
            ${String.fromCharCode(65 + oIdx)}. ${opt} ${oIdx === dq.correctAnswer ? ' ✓' : ''}
          </li>
        `).join('')}
      </ul>
      <div style="font-size: 9pt; color: #475569; margin-top: 6px;"><strong>Diagnostic Rationale:</strong> ${dq.rationale}</div>
    </div>
  `).join('')}

  <!-- MODULES 1 TO N -->
  ${gen.modules.map((mod, idx) => `
    <div class="page-break">
      <div class="module-banner">
        <h2>MODULE ${mod.moduleNumber || idx + 1}: ${mod.title}</h2>
        <div style="font-size: 10pt; opacity: 0.9; margin-top: 4px;">${mod.subtitle || ''}</div>
        <div style="font-size: 9.5pt; margin-top: 8px; opacity: 0.95;"><strong>Purpose:</strong> ${mod.purpose}</div>
      </div>

      <div class="card">
        <div class="card-title">Module ${mod.moduleNumber} Learning Objectives (Bloom's Taxonomy)</div>
        <ul class="lesson-list">
          ${mod.learningObjectives.map(lo => `<li><strong>${lo.code} [${lo.bloomLevel || 'Apply'}]:</strong> ${lo.statement}</li>`).join('')}
        </ul>
      </div>

      ${mod.lessons.map((lesson, lIdx) => `
        <div class="lesson-card">
          <div class="lesson-title-bar">
            <h3>Lesson ${mod.moduleNumber}.${lIdx + 1}: ${lesson.title}</h3>
            <span style="font-size: 9pt; color: #64748b; font-weight: 600;">Duration: ${lesson.durationMinutes} mins</span>
          </div>
          <div style="font-size: 9pt; color: #1e701c; font-weight: 600; margin-bottom: 10px;">
            Core Concepts: ${(lesson.concepts || []).join(' • ')}
          </div>
          ${formatMarkdownToHtml(lesson.contentBody)}

          ${(lesson.callouts || []).map(cal => `
            <div class="callout-box">
              <strong>● ${cal.type.toUpperCase()} — ${cal.title}:</strong><br/>
              ${cal.content}
            </div>
          `).join('')}

          <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #f1f5f9; font-size: 9.5pt;">
            <p style="margin: 4px 0;"><strong>🏢 Workplace Application Protocol:</strong> ${lesson.workplaceApplication}</p>
            <p style="margin: 4px 0;"><strong>🤖 AI Tool Integration & Human Oversight:</strong> ${lesson.aiApplication}</p>
          </div>
        </div>
      `).join('')}

      <h2 class="section-header">Module ${mod.moduleNumber} Workplace & AI Governance Scenarios</h2>
      ${mod.scenarios.map((sc, sIdx) => `
        <div class="scenario-box">
          <div style="font-weight: 800; color: #052B66; font-size: 10.5pt; margin-bottom: 6px;">
            Scenario ${mod.moduleNumber}.${sIdx + 1} [${sc.type}]: ${sc.title}
          </div>
          <p class="card-desc"><strong>Situation:</strong> ${sc.situation}</p>
          <p class="card-desc"><strong>Operational Challenge:</strong> ${sc.challenge}</p>
          <p class="card-desc" style="color: #92400e;"><strong>Decision Point:</strong> ${sc.decisionPoint}</p>
          <p class="card-desc"><strong>Pedagogical Debrief:</strong> ${sc.debrief}</p>
          <p class="card-desc" style="color: #1e701c; font-weight: 600;"><strong>Key Takeaway:</strong> ${sc.keyTakeaway}</p>
        </div>
      `).join('')}

      <h2 class="section-header">Module ${mod.moduleNumber} Formative Knowledge Checks (5 Items)</h2>
      ${mod.knowledgeChecks.map((kc, kIdx) => `
        <div class="kc-box">
          <div class="card-title">Question ${mod.moduleNumber}.${kIdx + 1}: ${kc.question}</div>
          <ul class="lesson-list">
            ${kc.options.map((opt, oIdx) => `
              <li style="${oIdx === kc.correctAnswer ? 'font-weight:700; color:#052B66;' : ''}">
                ${String.fromCharCode(65 + oIdx)}. ${opt} ${oIdx === kc.correctAnswer ? ' ✓ (Correct)' : ''}
              </li>
            `).join('')}
          </ul>
          <div style="font-size: 9pt; color: #475569; margin-top: 4px;"><strong>Pedagogical Rationale:</strong> ${kc.rationale}</div>
        </div>
      `).join('')}

      ${mod.practicalTask ? `
        <div class="card" style="background: #f8fafc; border-left: 4px solid #45CC42;">
          <div class="card-title">Practical Workplace Application Task: ${mod.practicalTask.title}</div>
          <p class="card-desc"><strong>Instructions:</strong> ${mod.practicalTask.instructions}</p>
          <p class="card-desc"><strong>Required Deliverable:</strong> ${mod.practicalTask.deliverable}</p>
          <div style="margin-top: 6px; font-size: 9.5pt;">
            <strong>Assessor Evaluation Rubric:</strong>
            <ul class="lesson-list">
              ${mod.practicalTask.evaluationRubric.map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>
        </div>
      ` : ''}

      <div class="card">
        <div class="card-title">Module ${mod.moduleNumber} Executive Synthesis</div>
        <p class="card-desc">${mod.summary}</p>
      </div>
    </div>
  `).join('')}

  <!-- SUMMATIVE FINAL ASSESSMENT & CAPSTONE -->
  <div class="page-break">
    <h2 class="section-header">${gen.assessments.finalAssessment.title} (Pass Mark: ${gen.assessments.finalAssessment.passMark})</h2>
    <p class="card-desc" style="margin-bottom: 14px;">${gen.assessments.finalAssessment.instructions}</p>

    ${gen.assessments.finalAssessment.questions.map((fq, qIdx) => `
      <div class="kc-box">
        <div class="card-title">Exam Question ${qIdx + 1}: ${fq.question}</div>
        <ul class="lesson-list">
          ${fq.options.map((opt, oIdx) => `
            <li style="${oIdx === fq.correctAnswer ? 'font-weight:700; color:#052B66;' : ''}">
              ${String.fromCharCode(65 + oIdx)}. ${opt} ${oIdx === fq.correctAnswer ? ' ✓ (Correct)' : ''}
            </li>
          `).join('')}
        </ul>
        <div style="font-size: 9pt; color: #475569; margin-top: 4px;"><strong>Assessor Rationale:</strong> ${fq.rationale}</div>
      </div>
    `).join('')}

    ${gen.assessments.finalAssessment.capstoneCaseStudy ? `
      <h2 class="section-header">Summative Capstone Case Study: ${gen.assessments.finalAssessment.capstoneCaseStudy.title}</h2>
      <div class="card">
        <p class="card-desc"><strong>Case Scenario Brief:</strong> ${gen.assessments.finalAssessment.capstoneCaseStudy.scenario}</p>
        <div style="margin-top: 10px;">
          <strong style="color: #052B66;">Candidate Tasks:</strong>
          <ul class="lesson-list">
            ${gen.assessments.finalAssessment.capstoneCaseStudy.tasks.map(t => `<li>${t}</li>`).join('')}
          </ul>
        </div>
        <p class="card-desc" style="margin-top: 10px;"><strong>Portfolio Deliverable:</strong> ${gen.assessments.finalAssessment.capstoneCaseStudy.deliverable}</p>
      </div>
    ` : ''}

    <h2 class="section-header">Quality Assurance & Regulatory Compliance Sign-Off</h2>
    <div class="card">
      <ul class="lesson-list">
        ${gen.qa.passedChecks.map(c => `<li>✓ ${c}</li>`).join('')}
      </ul>
    </div>
  </div>

  <div class="footer-note">
    eStudy South Africa · Universal Master Course Builder Framework v9.0 · Est. ~${volume.estimatedPages}-Page Edition (${volume.totalWords.toLocaleString()} Words) · Generated ${new Date().toLocaleDateString('en-ZA')}
  </div>
</body>
</html>
  `;

  triggerHtmlPrint(html);
}

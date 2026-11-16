import { Course, GeneratedCourse } from '../types';
import { generateLocalFallbackCourse } from './localCourseEngine';
import { enforceComprehensiveCourseVolume, calculateGeneratedCourseVolume } from './courseVolumeEngine';

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

    const formattedInline = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');

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

export function printCoursePdf(course: Course) {
  const p = course.problem || ({} as any);
  const s = course.structure || ({} as any);
  const r = course.research || ({} as any);

  const rawGen: GeneratedCourse = course.generatedCourse
    ? JSON.parse(JSON.stringify(course.generatedCourse))
    : generateLocalFallbackCourse(course);
  const gen = enforceComprehensiveCourseVolume(rawGen, course);
  const volume = calculateGeneratedCourseVolume(gen);

  const logoHtml = course.coverLogoUrl
    ? `<img src="${course.coverLogoUrl}" alt="Client Logo" style="max-height: 55px; object-fit: contain; margin-bottom: 12px;" />`
    : `<div style="display:inline-block; background: #052B66; color: #fff; padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px;">eStudy South Africa</div>`;

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
      <span class="badge-v9">Master Framework v9.0 · ${volume.estimatedPages}-Page Manual</span>
    </div>
    <h1 class="title">${gen.title || course.name || s.title || 'Course Master Manual'}</h1>
    <p class="subtitle">${gen.purpose}</p>

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
        <strong>Manual Volume</strong>
        <span>${volume.estimatedPages} Pages (${volume.totalWords.toLocaleString()} Words)</span>
      </div>
      <div class="meta-item">
        <strong>SETA / NQF Alignment</strong>
        <span>${s.setaNqfLevel || 'NQF Level 5 Alignment'}</span>
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
      <p class="card-desc"><strong>Primary Statutory Anchor:</strong> ${r.regulatoryFramework || 'POPIA Act 4 of 2013, King IV Principle 12, SAQA standards'}</p>
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
    eStudy South Africa · Universal Master Course Builder Framework v9.0 · ${volume.estimatedPages}-Page Comprehensive Edition (${volume.totalWords.toLocaleString()} Words) · Generated ${new Date().toLocaleDateString('en-ZA')}
  </div>
</body>
</html>
  `;

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
    }, 400);
  }
}

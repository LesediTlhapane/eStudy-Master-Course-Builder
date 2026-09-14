import { Course } from '../types';

export function printCoursePdf(course: Course) {
  const p = course.problem;
  const s = course.structure;
  const r = course.research;
  const modules = course.modules || [];

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups to generate and download the PDF document.');
    return;
  }

  const logoHtml = course.coverLogoUrl
    ? `<img src="${course.coverLogoUrl}" alt="Client Logo" style="max-height: 55px; object-fit: contain; margin-bottom: 12px;" />`
    : `<div style="display:inline-block; background: #052B66; color: #fff; padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px;">eStudy South Africa</div>`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${course.name || 'eStudy Master Course Specification'}</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm;
    }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      font-size: 11pt;
      margin: 0;
      padding: 0;
      background: #fff;
    }
    .cover-page {
      padding: 40px 0 60px 0;
      border-bottom: 3px solid #45CC42;
      margin-bottom: 30px;
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
      font-size: 26pt;
      color: #052B66;
      margin: 10px 0 6px 0;
      font-weight: 800;
      line-height: 1.15;
    }
    .subtitle {
      font-size: 13pt;
      color: #64748b;
      margin: 0 0 20px 0;
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
      margin: 30px 0 12px 0;
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
      page-break-inside: avoid;
    }
    .card-title {
      font-size: 11pt;
      font-weight: 700;
      color: #052B66;
      margin-bottom: 6px;
    }
    .card-desc {
      font-size: 10pt;
      color: #475569;
    }
    .tag {
      display: inline-block;
      background: #e2e8f0;
      color: #334155;
      font-size: 8pt;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 4px;
      margin-right: 6px;
    }
    .tag-green {
      background: #e9f9e9;
      color: #1e701c;
      border: 1px solid #45CC42;
    }
    .module-container {
      margin-bottom: 24px;
      page-break-inside: avoid;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
    }
    .module-header {
      background: #052B66;
      color: #ffffff;
      padding: 12px 16px;
    }
    .module-header h3 {
      margin: 0;
      font-size: 12pt;
    }
    .module-body {
      padding: 14px 16px;
      background: #fdfdfd;
    }
    .scenario-box {
      background: #f8fafc;
      border-left: 3px solid #052B66;
      padding: 10px 14px;
      margin-top: 10px;
      border-radius: 0 6px 6px 0;
    }
    .footer-note {
      text-align: center;
      font-size: 8pt;
      color: #94a3b8;
      margin-top: 40px;
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
  <div class="cover-page">
    <div class="brand-bar">
      <div>${logoHtml}</div>
      <span class="badge-v9">Master Framework v9.0</span>
    </div>
    <h1 class="title">${course.name || s.title || 'Course Master Blueprint'}</h1>
    <p class="subtitle">${s.purposeStatement || 'Instructional design specification & AI generation blueprint'}</p>

    <div class="meta-grid">
      <div class="meta-item">
        <strong>Course Code</strong>
        <span>${course.code || s.code || 'EST-2026-01'}</span>
      </div>
      <div class="meta-item">
        <strong>Target Audience</strong>
        <span>${s.targetRoles || p.targetGroup || 'Enterprise Employees'}</span>
      </div>
      <div class="meta-item">
        <strong>Duration & Credits</strong>
        <span>${s.estimatedDuration || '16 Hours / 2 CPD Credits'}</span>
      </div>
      <div class="meta-item">
        <strong>Industry Domain</strong>
        <span>${s.industryDomain || 'Corporate Operations'}</span>
      </div>
      <div class="meta-item">
        <strong>SETA / NQF Level</strong>
        <span>${s.setaNqfLevel || 'NQF Level 5 Alignment'}</span>
      </div>
      <div class="meta-item">
        <strong>Delivery Format</strong>
        <span>${s.deliveryFormat || 'Blended Digital E-Learning'}</span>
      </div>
    </div>
  </div>

  <h2 class="section-header">1. Problem Definition & Operational Gap</h2>
  <div class="card">
    <div class="card-title">Workplace Challenge:</div>
    <p class="card-desc">${p.taskOrSkill || 'Identified workplace capability gap.'}</p>
    <div class="card-title" style="margin-top: 12px;">Operational Impact:</div>
    <p class="card-desc">${p.operationalImpact || 'Productivity latency, manual errors, or compliance risks.'}</p>
    <div class="card-title" style="margin-top: 12px;">Skill & Process Failures:</div>
    <p class="card-desc">${p.skillGaps || 'Lack of standardized training and verification protocols.'}</p>
  </div>

  <h2 class="section-header">2. Authoritative Evidence & Regulatory Sources</h2>
  <div class="card">
    <p class="card-desc"><strong>Primary Statutory Anchor:</strong> ${r.regulatoryFramework || 'POPIA Act 4 of 2013, King IV, SAQA unit standards'}</p>
  </div>
  ${r.sources.map(src => `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <span class="card-title">${src.name}</span>
        <span class="tag tag-green">${src.status}</span>
      </div>
      <p class="card-desc" style="margin: 4px 0;"><strong>Category:</strong> <span class="tag">${src.type}</span> | <strong>Reference:</strong> ${src.reference || 'Official documentation'}</p>
      ${src.relevance ? `<p class="card-desc" style="margin: 4px 0 0 0;"><em>${src.relevance}</em></p>` : ''}
    </div>
  `).join('')}

  <h2 class="section-header">3. Curriculum Architecture & Modules</h2>
  ${modules.map((mod, idx) => `
    <div class="module-container">
      <div class="module-header">
        <h3>Module ${mod.moduleNumber || idx + 1}: ${mod.title || 'Course Module'}</h3>
        <div style="font-size: 9pt; opacity: 0.9; margin-top: 2px;">${mod.subtitle || ''}</div>
      </div>
      <div class="module-body">
        <p><strong>Purpose:</strong> ${mod.purpose || 'Deliver hands-on capability in operational scenarios.'}</p>
        ${mod.requirements?.workplaceContext ? `<p><strong>Workplace Setting:</strong> ${mod.requirements.workplaceContext}</p>` : ''}
        ${mod.requirements?.scenarios && mod.requirements.scenarios.length > 0 ? `
          <div style="margin-top: 12px;">
            <strong style="color: #052B66; font-size: 10pt;">Workplace Application Scenarios:</strong>
            ${mod.requirements.scenarios.map((sc, sIdx) => `
              <div class="scenario-box">
                <strong>Scenario ${sIdx + 1}: ${sc.title || 'Practical Case'}</strong>
                <div style="font-size: 9.5pt; color: #334155; margin-top: 3px;">${sc.situation || ''} ${sc.challenge || ''}</div>
                ${sc.decisionPoint ? `<div style="font-size: 9pt; color: #052B66; margin-top: 4px;"><strong>Decision Point:</strong> ${sc.decisionPoint}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `).join('')}

  <h2 class="section-header">4. Ethics, POPIA & AI Governance</h2>
  <div class="card">
    <div class="card-title">POPIA & Data Privacy Compliance:</div>
    <p class="card-desc">${course.ethics?.dataPrivacyFramework || 'Strict adherence to POPIA Section 19 technical and organisational safeguards.'}</p>
    <div class="card-title" style="margin-top: 10px;">Human Oversight & Ethics:</div>
    <p class="card-desc">${course.ethics?.ethicsStandards || 'Mandatory human review of high-impact automated outputs.'}</p>
  </div>

  <div class="footer-note">
    eStudy South Africa · Universal Master Course Builder Framework v9.0 · Generated ${new Date().toLocaleDateString('en-ZA')}
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

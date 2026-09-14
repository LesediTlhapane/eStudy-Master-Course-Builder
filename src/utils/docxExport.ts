import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType
} from 'docx';
import { Course } from '../types';

export async function generateCourseDocx(course: Course): Promise<Blob> {
  const p = course.problem;
  const s = course.structure;
  const r = course.research;
  const modules = course.modules || [];

  const children: Paragraph[] = [
    // Document Title
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: course.name || s.title || 'Course Blueprint & Master Specification',
          bold: true,
          size: 44,
          color: '052B66'
        })
      ]
    }),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: `Code: ${course.code || s.code || 'EST-COURSE-01'}  |  eStudy South Africa Master Prompt Framework v9.0`,
          italics: true,
          size: 20,
          color: '45CC42'
        })
      ]
    }),

    // Section 1: Executive Overview
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 150 },
      children: [
        new TextRun({
          text: '1. Executive Overview & Target Audience',
          bold: true,
          size: 28,
          color: '052B66'
        })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Target Learner Roles: ', bold: true }),
        new TextRun(s.targetRoles || p.targetGroup || 'Operational personnel, team leads, and specialists')
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Industry / Domain: ', bold: true }),
        new TextRun(s.industryDomain || 'Enterprise Operations')
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Duration & NQF Level: ', bold: true }),
        new TextRun(`${s.estimatedDuration || '16 Hours / 2 CPD Credits'} | ${s.setaNqfLevel || 'NQF Level 5 Alignment'}`)
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Course Purpose: ', bold: true }),
        new TextRun(s.purposeStatement || 'Equip learners with structured skills and accountable practices.')
      ]
    }),

    // Section 2: Problem & Challenge
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 350, after: 150 },
      children: [
        new TextRun({
          text: '2. Problem Definition & Workplace Challenge',
          bold: true,
          size: 28,
          color: '052B66'
        })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Workplace Problem: ', bold: true }),
        new TextRun(p.taskOrSkill || 'Identified performance bottleneck requiring standardized capability.')
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Operational Impact: ', bold: true }),
        new TextRun(p.operationalImpact || 'Productivity delays, compliance risks, and unverified outputs.')
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Skill & Knowledge Gaps: ', bold: true }),
        new TextRun(p.skillGaps || 'Lack of structured methodologies and compliance verification protocols.')
      ]
    }),

    // Section 3: Sources & Authoritative Evidence
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 350, after: 150 },
      children: [
        new TextRun({
          text: '3. Authoritative Sources & Regulatory Standards',
          bold: true,
          size: 28,
          color: '052B66'
        })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Governing Framework: ', bold: true }),
        new TextRun(r.regulatoryFramework || 'POPIA (Act 4 of 2013), King IV Principle 12, South African National Standards')
      ]
    }),
    ...r.sources.map((src, idx) =>
      new Paragraph({
        bullet: { level: 0 },
        children: [
          new TextRun({ text: `${src.name} `, bold: true }),
          new TextRun(`[${src.type} - ${src.status}]: `),
          new TextRun(src.relevance || src.reference || 'Authoritative reference standard')
        ]
      })
    ),

    // Section 4: Curriculum Modules
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 350, after: 150 },
      children: [
        new TextRun({
          text: '4. Curriculum Structure & Modules',
          bold: true,
          size: 28,
          color: '052B66'
        })
      ]
    })
  ];

  // Add each module
  modules.forEach((mod, idx) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 250, after: 100 },
        children: [
          new TextRun({
            text: `Module ${mod.moduleNumber || idx + 1}: ${mod.title || 'Curriculum Module'}`,
            bold: true,
            size: 24,
            color: '052B66'
          })
        ]
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Subtitle / Focus: ', bold: true }),
          new TextRun(mod.subtitle || 'Foundational competencies and practical application')
        ]
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Purpose: ', bold: true }),
          new TextRun(mod.purpose || 'Deliver measurable behavioral improvement in daily workflows.')
        ]
      })
    );

    if (mod.requirements?.workplaceContext) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Workplace Context: ', bold: true }),
            new TextRun(mod.requirements.workplaceContext)
          ]
        })
      );
    }

    if (mod.requirements?.scenarios && mod.requirements.scenarios.length > 0) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 150, after: 50 },
          children: [
            new TextRun({
              text: 'Workplace Scenarios & Decision Points',
              bold: true,
              italics: true,
              size: 20
            })
          ]
        })
      );
      mod.requirements.scenarios.forEach((sc, scIdx) => {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: `Scenario ${scIdx + 1}: ${sc.title || 'Workplace Challenge'} - `, bold: true }),
              new TextRun(`${sc.situation || ''} ${sc.challenge || ''}`)
            ]
          })
        );
      });
    }
  });

  // Ethics & Governance section
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 350, after: 150 },
      children: [
        new TextRun({
          text: '5. Ethics, POPIA Compliance & Governance',
          bold: true,
          size: 28,
          color: '052B66'
        })
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Data Privacy & POPIA: ', bold: true }),
        new TextRun(course.ethics?.dataPrivacyFramework || 'Compliance with POPIA Section 19 security measures and lawful conditions.')
      ]
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Ethical Standards: ', bold: true }),
        new TextRun(course.ethics?.ethicsStandards || 'Zero-bias algorithmic oversight and human-in-the-loop sign-off.')
      ]
    })
  );

  const doc = new Document({
    creator: 'eStudy South Africa Course Builder',
    title: course.name || 'eStudy Master Course Specification',
    description: 'Generated from eStudy South Africa Master Prompt Framework v9.0',
    sections: [
      {
        properties: {},
        children
      }
    ]
  });

  return await Packer.toBlob(doc);
}

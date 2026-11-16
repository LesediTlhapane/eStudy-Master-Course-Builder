import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak
} from 'docx';
import { Course, GeneratedCourse } from '../types';
import { generateLocalFallbackCourse } from './localCourseEngine';
import { enforceComprehensiveCourseVolume, calculateGeneratedCourseVolume } from './courseVolumeEngine';

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

export async function generateCourseDocx(course: Course): Promise<Blob> {
  const p = course.problem || ({} as any);
  const s = course.structure || ({} as any);
  const r = course.research || ({} as any);

  // Ensure we always export the full 22–30 page comprehensive generated course manual
  const rawGen: GeneratedCourse = course.generatedCourse
    ? JSON.parse(JSON.stringify(course.generatedCourse))
    : generateLocalFallbackCourse(course);
  const gen = enforceComprehensiveCourseVolume(rawGen, course);
  const volume = calculateGeneratedCourseVolume(gen);

  const children: Paragraph[] = [
    // =========================================================================
    // COVER PAGE & EXECUTIVE SPECIFICATION
    // =========================================================================
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 150 },
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
          text: `Code: ${gen.code || course.code || 'EST-COURSE-01'}  |  Version: ${gen.version || 'v9.0'}  |  ${volume.estimatedPages} Pages (${volume.totalWords.toLocaleString()} Words)`,
          bold: true,
          size: 22,
          color: '1E701C'
        })
      ]
    }),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 350 },
      children: [
        new TextRun({
          text: `eStudy South Africa — Comprehensive Participant & Facilitator Course Manual (22–30 Page Standard)`,
          italics: true,
          size: 20,
          color: '475569'
        })
      ]
    }),

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
        new TextRun({ text: `${gen.estimatedDuration || s.estimatedDuration || '16 Hours / 2 CPD Credits'} | ${s.setaNqfLevel || 'NQF Level 5 Alignment'}`, size: 21 })
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
        new TextRun({ text: p.taskOrSkill || 'Identified performance bottleneck requiring standardized capability.', size: 21 })
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
        new TextRun({ text: 'Skill & Knowledge Gaps: ', bold: true, size: 21 }),
        new TextRun({ text: p.skillGaps || 'Lack of structured methodologies and compliance verification protocols.', size: 21 })
      ]
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({ text: 'Governing Statutory Framework: ', bold: true, size: 21 }),
        new TextRun({ text: r.regulatoryFramework || 'POPIA (Act 4 of 2013), King IV Principle 12, South African National Standards', size: 21 })
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
  ];

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
        new TextRun({ text: 'Data Privacy & POPIA Safeguards: ', bold: true, size: 21 }),
        new TextRun({ text: course.ethics?.dataPrivacyFramework || 'Strict adherence to POPIA Act 4 of 2013 Conditions 1–8 and Section 19 security safeguards.', size: 21 })
      ]
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({ text: 'Human-in-the-Loop Governance: ', bold: true, size: 21 }),
        new TextRun({ text: course.ethics?.humanOversightNotes || 'Zero-bias algorithmic oversight and mandatory practitioner sign-off on all AI-assisted deliverables.', size: 21 })
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
    description: `Comprehensive ${volume.estimatedPages}-page training manual generated under eStudy Master Prompt Framework v9.0`,
    sections: [
      {
        properties: {},
        children
      }
    ]
  });

  return await Packer.toBlob(doc);
}

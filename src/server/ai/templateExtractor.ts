import zlib from 'zlib';
import { GoogleGenAI } from '@google/genai';
import { AIProvider, Course } from '../../types';
import { aiRouter } from './aiRouter';
import { extractAndParseJSON } from './courseValidator';
import { getDefaultModelForProvider } from './modelRegistry';

export interface TemplateExtractionRequest {
  fileName: string;
  mimeType: string;
  base64Data?: string;
  rawText?: string;
  provider?: AIProvider;
  model?: string;
}

export interface TemplateExtractionResult {
  success: boolean;
  extractedCourse: Partial<Course>;
  flaggedFields: Record<string, string>;
  populatedFieldCount: number;
  summary: string;
  extractedTextSnippet: string;
  error?: string;
}

/**
 * Extracts text from a .docx buffer by reading the ZIP local file headers
 * and decompressing word/document.xml using Node's built-in zlib.
 */
function extractTextFromDocxBuffer(buffer: Buffer): string {
  try {
    let offset = 0;
    const textParts: string[] = [];

    while (offset + 30 <= buffer.length) {
      const signature = buffer.readUInt32LE(offset);
      if (signature !== 0x04034b50) {
        offset++;
        continue;
      }

      const compressionMethod = buffer.readUInt16LE(offset + 8);
      const compressedSize = buffer.readUInt32LE(offset + 18);
      const fileNameLength = buffer.readUInt16LE(offset + 26);
      const extraFieldLength = buffer.readUInt16LE(offset + 28);
      const dataStart = offset + 30 + fileNameLength + extraFieldLength;

      if (dataStart > buffer.length) break;

      const entryName = buffer.subarray(offset + 30, offset + 30 + fileNameLength).toString('utf8');

      if (entryName === 'word/document.xml' || entryName.startsWith('word/header') || entryName.startsWith('word/footer')) {
        let compressedSlice = buffer.subarray(dataStart, Math.min(buffer.length, dataStart + (compressedSize || buffer.length - dataStart)));
        // If data descriptor is used (compressedSize === 0), find next PK signature
        if (compressedSize === 0) {
          const nextPk = buffer.indexOf(Buffer.from([0x50, 0x4b]), dataStart);
          if (nextPk > dataStart) {
            compressedSlice = buffer.subarray(dataStart, nextPk);
          }
        }

        let xmlContent = '';
        if (compressionMethod === 0) {
          xmlContent = compressedSlice.toString('utf8');
        } else if (compressionMethod === 8) {
          try {
            xmlContent = zlib.inflateRawSync(compressedSlice).toString('utf8');
          } catch {
            // Try scanning up to next PK header if size was in data descriptor
            const nextHeader = buffer.indexOf(Buffer.from([0x50, 0x4b, 0x03, 0x04]), dataStart);
            const endIdx = nextHeader > dataStart ? nextHeader : buffer.length;
            for (let trim = 0; trim <= 24 && endIdx - trim > dataStart; trim++) {
              try {
                xmlContent = zlib.inflateRawSync(buffer.subarray(dataStart, endIdx - trim)).toString('utf8');
                break;
              } catch {}
            }
          }
        }

        if (xmlContent) {
          const plain = xmlContent
            .replace(/<\/w:p>/g, '\n')
            .replace(/<\/w:tr>/g, '\n')
            .replace(/<w:tab\/>/g, '\t')
            .replace(/<[^>]+>/g, '')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/\n{3,}/g, '\n\n')
            .trim();
          if (plain) textParts.push(plain);
        }
      }

      offset = dataStart + Math.max(1, compressedSize);
    }

    return textParts.join('\n\n').trim();
  } catch (err) {
    console.warn('DOCX XML extraction warning:', err);
    return '';
  }
}

/**
 * Extracts readable text streams from a PDF buffer using Node's built-in zlib
 * for FlateDecode streams and PDF text operators.
 */
function extractTextFromPdfBuffer(buffer: Buffer): string {
  try {
    const rawStr = buffer.toString('latin1');
    const chunks: string[] = [];

    const decodePdfLiteral = (s: string) =>
      s
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, ' ')
        .replace(/\\t/g, ' ')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\');

    const extractFromStreamText = (streamText: string) => {
      // Match (...) Tj and [(...)] TJ patterns
      const tjRegex = /\(([^()\\]*(?:\\.[^()\\]*)*)\)\s*Tj/g;
      let match: RegExpExecArray | null;
      while ((match = tjRegex.exec(streamText)) !== null) {
        const cleaned = decodePdfLiteral(match[1]).trim();
        if (cleaned) chunks.push(cleaned);
      }

      const tjArrayRegex = /\[([\s\S]*?)\]\s*TJ/g;
      while ((match = tjArrayRegex.exec(streamText)) !== null) {
        const inner = match[1];
        const litRegex = /\(([^()\\]*(?:\\.[^()\\]*)*)\)/g;
        let litMatch: RegExpExecArray | null;
        const lineParts: string[] = [];
        while ((litMatch = litRegex.exec(inner)) !== null) {
          lineParts.push(decodePdfLiteral(litMatch[1]));
        }
        if (lineParts.length > 0) {
          chunks.push(lineParts.join(''));
        }
      }
    };

    let searchIdx = 0;
    while (searchIdx < rawStr.length) {
      const streamStart = rawStr.indexOf('stream', searchIdx);
      if (streamStart === -1) break;
      const streamEnd = rawStr.indexOf('endstream', streamStart + 6);
      if (streamEnd === -1) break;

      let dataOffset = streamStart + 6;
      if (rawStr[dataOffset] === '\r' && rawStr[dataOffset + 1] === '\n') dataOffset += 2;
      else if (rawStr[dataOffset] === '\n' || rawStr[dataOffset] === '\r') dataOffset += 1;

      const streamBuf = buffer.subarray(dataOffset, streamEnd);
      try {
        const inflated = zlib.inflateSync(streamBuf).toString('latin1');
        extractFromStreamText(inflated);
      } catch {
        extractFromStreamText(streamBuf.toString('latin1'));
      }

      searchIdx = streamEnd + 9;
    }

    return chunks.join(' ').replace(/\s{2,}/g, ' ').trim();
  } catch (err) {
    console.warn('PDF text extraction warning:', err);
    return '';
  }
}

const EXTRACTION_SYSTEM_PROMPT = `You are eStudy South Africa's Senior Instructional Design Document Analyst.
Your task is to read an uploaded course document or template and extract ONLY information that is explicitly stated in the document to populate the official eStudy Master Course Template (v9.0).

STRICT RULES (NON-NEGOTIABLE):
1. Do NOT invent, fabricate, or assume missing information.
2. Leave any field as an empty string "" if the uploaded document does not contain clear evidence for that field.
3. Do NOT fabricate legislation, qualification codes, SAQA IDs, NQF levels, or statistics.
4. Where information in the uploaded document is ambiguous, incomplete, or requires Subject Matter Expert verification, include that field key and a short explanation in "flaggedFields".
5. Use South African English spelling throughout (e.g. Organisation, Programme, Customisation, Analyse, Behaviour, Centre, Summarise, Standardise).

Return ONLY a valid JSON object with the following structure:
{
  "summary": "Brief 1-2 sentence summary of the uploaded document and what fields were identified.",
  "flaggedFields": {
    "structure.setaNqfLevel": "Example reason why this extracted value needs SME confirmation"
  },
  "extractedCourse": {
    "problem": {
      "targetGroup": "",
      "taskOrSkill": "",
      "operationalImpact": "",
      "rootCauses": ["", ""],
      "processFailures": "",
      "skillGaps": "",
      "constraints": "",
      "aiLiteracyGap": "",
      "digitalReadinessLevel": "",
      "aiEthicsComplianceRisk": ""
    },
    "research": {
      "regulatoryFramework": "",
      "aiToolsPlatformName": "",
      "aiEthicsFramework": "",
      "caseStudyUseCases": "",
      "learnerProfile": {
        "jobRoles": "",
        "departments": "",
        "experienceLevels": "",
        "existingKnowledge": "",
        "digitalLiteracy": "",
        "aiFamiliarity": "",
        "workplaceEnvironment": "",
        "organisationalConstraints": "",
        "availableToolsAndTechnology": ""
      }
    },
    "structure": {
      "title": "",
      "code": "",
      "industryDomain": "",
      "targetRoles": "",
      "aiIntegrationLevel": "Applied",
      "setaNqfLevel": "",
      "deliveryLanguages": "",
      "estimatedDuration": "",
      "purposeStatement": "",
      "workplaceRelevance": "",
      "performanceImprovement": "",
      "aiTechAngle": "",
      "scopeSummary": "",
      "aiEraRelevance": "",
      "performanceLink": "",
      "organisationalBenefits": [],
      "employeeBenefits": [],
      "riskReductionOutcomes": [],
      "scope": "",
      "keyCompetencies": "",
      "realWorldApplication": "",
      "aiSkillsDeveloped": "",
      "jobRoles": "",
      "departments": "",
      "experienceLevel": "",
      "aiFamiliarityBaseline": "Basic",
      "aiFamiliarityExplanation": "",
      "prerequisiteKnowledge": "",
      "prerequisiteExperience": "",
      "toolsSystems": "",
      "digitalLiteracyLevel": "",
      "diagnosticQuestions": []
    },
    "modules": [
      {
        "moduleNumber": 1,
        "title": "",
        "subtitle": "",
        "purpose": "",
        "keySkills": [],
        "learningObjectives": []
      }
    ],
    "learningDesign": {
      "coreStandardsSummary": "",
      "aiDemoSimulationDescription": "",
      "promptExerciseDescription": "",
      "aiEvaluationTask": "",
      "collaborationActivity": "",
      "practicalTaskWeighting": "",
      "finalAssessmentPassMark": ""
    },
    "ethics": {
      "confidentialityRequirements": "",
      "dataPrivacyFramework": "",
      "ethicsStandards": "",
      "psychologicalSafetyNotes": "",
      "decisionMakingFramework": "",
      "accountabilityMechanism": "",
      "aiBiasRisk": "",
      "aiDisclosureRequirement": "",
      "humanOverrideScenarios": "",
      "dataSovereigntyContext": "",
      "aiWorkforceImpactNarrative": "",
      "aiGovernanceReference": ""
    },
    "outputRequirements": {
      "outputFormat": "",
      "accessibilityTargetReadingLevel": "",
      "culturalInclusivityNotes": "",
      "formattingRequirements": "",
      "accreditationBody": "",
      "qualificationOrUnitStandard": "",
      "nqfLevel": "",
      "accreditationRequirements": "",
      "requiredLearningStructure": "",
      "accreditationAssessmentRequirements": ""
    },
    "customisation": {
      "branding": "",
      "tone": "",
      "audienceContext": "",
      "industryExamples": "",
      "terminology": "",
      "deliveryPreferences": ""
    }
  }
}`;

function countPopulatedStrings(obj: any): number {
  if (!obj || typeof obj !== 'object') return 0;
  let count = 0;
  for (const val of Object.values(obj)) {
    if (typeof val === 'string' && val.trim().length > 0) {
      count++;
    } else if (Array.isArray(val)) {
      const nonEmpty = val.filter(v => (typeof v === 'string' ? v.trim().length > 0 : Boolean(v)));
      if (nonEmpty.length > 0) count++;
    } else if (val && typeof val === 'object') {
      count += countPopulatedStrings(val);
    }
  }
  return count;
}

export async function extractCourseFieldsFromDocument(
  req: TemplateExtractionRequest
): Promise<TemplateExtractionResult> {
  const { fileName, mimeType, base64Data, rawText, provider = 'gemini', model } = req;

  let extractedDocumentText = (rawText || '').trim();
  const isPdf = mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
  const isDocx =
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.toLowerCase().endsWith('.docx');

  if (!extractedDocumentText && base64Data) {
    const buffer = Buffer.from(base64Data, 'base64');
    if (isDocx) {
      extractedDocumentText = extractTextFromDocxBuffer(buffer);
    } else if (isPdf) {
      extractedDocumentText = extractTextFromPdfBuffer(buffer);
    } else {
      extractedDocumentText = buffer.toString('utf8');
    }
  }

  let aiJsonText = '';

  // If PDF and Gemini key is available, use Gemini multimodal native PDF understanding for highest accuracy
  if (isPdf && base64Data && process.env.GEMINI_API_KEY && (provider === 'gemini' || !extractedDocumentText)) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const targetModel = model && model.startsWith('gemini') ? model : 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model: targetModel,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: base64Data
              }
            },
            {
              text: `Read the attached PDF document ("${fileName}") and extract only explicitly stated course information into the eStudy Master Course Template v9.0 JSON structure. Leave any unestablished fields empty ("").`
            }
          ]
        }
      ],
      config: {
        systemInstruction: EXTRACTION_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });
    aiJsonText = response.text || '';
  } else {
    if (!extractedDocumentText || extractedDocumentText.length < 15) {
      throw new Error(
        `Could not extract readable text from "${fileName}". Please upload a text-based PDF, DOCX, TXT, or Markdown document.`
      );
    }

    const activeProvider: AIProvider = provider === 'groq' ? 'groq' : 'gemini';
    const activeModel = model?.trim() || getDefaultModelForProvider(activeProvider, 'copilot');

    const aiResponse = await aiRouter.execute({
      provider: activeProvider,
      model: activeModel,
      systemInstruction: EXTRACTION_SYSTEM_PROMPT,
      prompt: `Uploaded Document Filename: "${fileName}"\n\nDocument Content:\n"""\n${extractedDocumentText.slice(0, 45000)}\n"""\n\nExtract only explicitly supported fields into the JSON structure.`,
      responseFormat: 'json',
      temperature: 0.1,
      maxTokens: 4096,
      timeoutMs: 45000
    });
    aiJsonText = aiResponse.text;
  }

  const parsed = extractAndParseJSON(aiJsonText);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('The AI service returned an unreadable response while analysing the document.');
  }

  const extractedCourse: Partial<Course> = parsed.extractedCourse || parsed;
  const flaggedFields: Record<string, string> =
    parsed.flaggedFields && typeof parsed.flaggedFields === 'object' ? parsed.flaggedFields : {};
  const populatedFieldCount = countPopulatedStrings(extractedCourse);

  return {
    success: true,
    extractedCourse,
    flaggedFields,
    populatedFieldCount,
    summary:
      parsed.summary ||
      `Analysed "${fileName}" and matched ${populatedFieldCount} field(s) to the eStudy Master Course Template. Unestablished fields were left empty.`,
    extractedTextSnippet: (extractedDocumentText || `Uploaded PDF document: ${fileName}`).slice(0, 4000)
  };
}

/**
 * Refines user-entered Problem Statement fields in Section 1 using AI
 * WITHOUT inventing facts or fabricating missing context.
 */
export async function refineProblemStatementWithAI(params: {
  targetGroup: string;
  taskOrSkill: string;
  operationalImpact: string;
  rootCauses?: string[];
  processFailures?: string;
  skillGaps?: string;
  constraints?: string;
  provider?: AIProvider;
  model?: string;
}): Promise<{
  targetGroup: string;
  taskOrSkill: string;
  operationalImpact: string;
  processFailures?: string;
  skillGaps?: string;
  constraints?: string;
}> {
  const provider: AIProvider = params.provider === 'groq' ? 'groq' : 'gemini';
  const model = params.model?.trim() || getDefaultModelForProvider(provider, 'copilot');

  const systemInstruction = `You are eStudy South Africa's Senior Instructional Designer.
Improve the clarity, grammar, and professional South African English phrasing of the user's Problem Statement inputs so they fit cleanly into the official eStudy formula:
"This course addresses the inability of [TARGET GROUP] to effectively perform [TASK / SKILL], resulting in [OPERATIONAL / FINANCIAL / COMPLIANCE / PRODUCTIVITY IMPACT]."

STRICT RULES:
1. Do NOT invent new facts, statistics, legislation, or claims that the user did not provide.
2. Only refine fields where the user has already entered text. If a field is empty, return it as an empty string "".
3. Use South African English spelling (e.g. organisation, programme, behaviour, analyse).
4. Return ONLY valid JSON with keys: targetGroup, taskOrSkill, operationalImpact, processFailures, skillGaps, constraints.`;

  const prompt = `User's current inputs:\n${JSON.stringify(params, null, 2)}\n\nRefine the wording for clarity and alignment with the official formula without inventing facts.`;

  const res = await aiRouter.execute({
    provider,
    model,
    systemInstruction,
    prompt,
    responseFormat: 'json',
    temperature: 0.2,
    maxTokens: 1024,
    timeoutMs: 25000
  });

  const parsed = extractAndParseJSON(res.text);
  return {
    targetGroup: params.targetGroup ? (parsed?.targetGroup || params.targetGroup) : '',
    taskOrSkill: params.taskOrSkill ? (parsed?.taskOrSkill || params.taskOrSkill) : '',
    operationalImpact: params.operationalImpact ? (parsed?.operationalImpact || params.operationalImpact) : '',
    processFailures: params.processFailures ? (parsed?.processFailures || params.processFailures) : '',
    skillGaps: params.skillGaps ? (parsed?.skillGaps || params.skillGaps) : '',
    constraints: params.constraints ? (parsed?.constraints || params.constraints) : ''
  };
}

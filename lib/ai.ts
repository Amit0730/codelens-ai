import { GoogleGenerativeAI } from '@google/generative-ai';
import { ReviewResult, CodeIssue, Severity, IssueCategory } from './types';
import { calculateScore } from './utils';
import { v4 as uuidv4 } from 'uuid';

const API_KEY = process.env.GEMINI_API_KEY;

export function isAIAvailable(): boolean {
  return Boolean(API_KEY && API_KEY.length > 10);
}

const REVIEW_PROMPT = (code: string, language: string) => `You are an expert code reviewer specializing in ${language}. Analyze the following ${language} code thoroughly and return a structured JSON review.

IMPORTANT RULES:
1. Only report REAL issues. Do NOT invent problems for code that is correct.
2. If the code is clean and well-written, return an empty issues array and a high score.
3. Be specific — cite exact code snippets and line numbers where possible.
4. Provide actionable, concrete fix suggestions with actual code.

Analyze for:
- Bugs (logic errors, off-by-one errors, null pointer issues, type mismatches)
- Potential runtime errors (uncaught exceptions, division by zero, buffer overflows)
- Security vulnerabilities (injection, XSS, insecure deserialization, exposed secrets, OWASP Top 10)
- Performance issues (inefficient algorithms, unnecessary loops, N+1 queries, memory leaks)
- Bad practices (code duplication, magic numbers, poor naming, missing error handling)
- Code readability (complex logic, missing comments for non-obvious code, dead code)
- Edge cases (empty input, large input, integer overflow, timezone issues)

Return ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "score": <integer 0-100, 100 = perfect code>,
  "summary": "<2-3 sentence overall assessment>",
  "issues": [
    {
      "severity": "<critical|high|medium|low|suggestion>",
      "category": "<bug|security|performance|suggestion|style>",
      "title": "<concise issue title>",
      "explanation": "<clear explanation of why this is a problem>",
      "problematicCode": "<the exact code snippet with the issue, or null>",
      "suggestedFix": "<concrete code fix or recommendation>",
      "lineNumber": <line number or null>
    }
  ]
}

CODE TO REVIEW (${language}):
\`\`\`${language}
${code}
\`\`\``;

export async function runAIAnalysis(code: string, language: string): Promise<ReviewResult> {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
      maxOutputTokens: 4096,
    },
  });

  const prompt = REVIEW_PROMPT(code, language);
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  let parsed: {
    score: number;
    summary: string;
    issues: Array<{
      severity: string;
      category: string;
      title: string;
      explanation: string;
      problematicCode?: string;
      suggestedFix?: string;
      lineNumber?: number;
    }>;
  };

  try {
    parsed = JSON.parse(text);
  } catch {
    // Attempt to extract JSON from response if wrapped in markdown
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('AI returned non-JSON response');
    }
  }

  const validSeverities: Severity[] = ['critical', 'high', 'medium', 'low', 'suggestion'];
  const validCategories: IssueCategory[] = ['bug', 'security', 'performance', 'suggestion', 'style'];

  const issues: CodeIssue[] = (parsed.issues || []).map(issue => ({
    id: uuidv4(),
    severity: validSeverities.includes(issue.severity as Severity)
      ? (issue.severity as Severity)
      : 'medium',
    category: validCategories.includes(issue.category as IssueCategory)
      ? (issue.category as IssueCategory)
      : 'suggestion',
    title: issue.title || 'Issue detected',
    explanation: issue.explanation || '',
    problematicCode: issue.problematicCode || undefined,
    suggestedFix: issue.suggestedFix || undefined,
    lineNumber: issue.lineNumber || undefined,
  }));

  // Use AI score or recalculate for consistency
  const score = typeof parsed.score === 'number'
    ? Math.max(0, Math.min(100, Math.round(parsed.score)))
    : calculateScore(issues);

  return {
    score,
    summary: parsed.summary || 'Review complete.',
    issues,
    language,
    timestamp: new Date().toISOString(),
    codeSnippet: code.slice(0, 200),
    mode: 'ai',
  };
}

// Shared TypeScript types for CodeLens AI

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'suggestion';

export type IssueCategory = 'bug' | 'security' | 'performance' | 'suggestion' | 'style';

export interface CodeIssue {
  id: string;
  severity: Severity;
  category: IssueCategory;
  title: string;
  explanation: string;
  problematicCode?: string;
  suggestedFix?: string;
  lineNumber?: number;
}

export interface ReviewResult {
  score: number;
  summary: string;
  issues: CodeIssue[];
  language: string;
  timestamp: string;
  codeSnippet: string;
  mode: 'ai' | 'demo';
}

export interface ReviewStats {
  bugs: number;
  security: number;
  performance: number;
  suggestions: number;
  total: number;
}

export interface HistoryEntry {
  id: string;
  language: string;
  timestamp: string;
  score: number;
  summary: string;
  result: ReviewResult;
  code: string;
}

export const SUPPORTED_LANGUAGES = [
  { value: 'c', label: 'C', monacoLang: 'c' },
  { value: 'cpp', label: 'C++', monacoLang: 'cpp' },
  { value: 'java', label: 'Java', monacoLang: 'java' },
  { value: 'python', label: 'Python', monacoLang: 'python' },
  { value: 'javascript', label: 'JavaScript', monacoLang: 'javascript' },
  { value: 'typescript', label: 'TypeScript', monacoLang: 'typescript' },
  { value: 'sql', label: 'SQL', monacoLang: 'sql' },
  { value: 'html', label: 'HTML', monacoLang: 'html' },
  { value: 'css', label: 'CSS', monacoLang: 'css' },
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]['value'];

export const SEVERITY_CONFIG: Record<Severity, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  weight: number;
}> = {
  critical: {
    label: 'Critical',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    icon: '🔴',
    weight: 20,
  },
  high: {
    label: 'High',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    icon: '🟠',
    weight: 12,
  },
  medium: {
    label: 'Medium',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    icon: '🟡',
    weight: 6,
  },
  low: {
    label: 'Low',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    icon: '🔵',
    weight: 2,
  },
  suggestion: {
    label: 'Suggestion',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    icon: '💡',
    weight: 1,
  },
};

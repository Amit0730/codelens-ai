import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { type ReviewResult, type ReviewStats, SEVERITY_CONFIG } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateScore(issues: ReviewResult['issues']): number {
  if (issues.length === 0) return 100;
  const totalPenalty = issues.reduce((acc, issue) => {
    return acc + SEVERITY_CONFIG[issue.severity].weight;
  }, 0);
  return Math.max(0, Math.min(100, Math.round(100 - totalPenalty)));
}

export function getReviewStats(issues: ReviewResult['issues']): ReviewStats {
  return {
    bugs: issues.filter(i => i.category === 'bug').length,
    security: issues.filter(i => i.category === 'security').length,
    performance: issues.filter(i => i.category === 'performance').length,
    suggestions: issues.filter(i => i.category === 'suggestion' || i.category === 'style').length,
    total: issues.length,
  };
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-400';
  if (score >= 70) return 'text-yellow-400';
  if (score >= 50) return 'text-orange-400';
  return 'text-red-400';
}

export function getScoreRingColor(score: number): string {
  if (score >= 90) return '#4ade80';
  if (score >= 70) return '#facc15';
  if (score >= 50) return '#fb923c';
  return '#f87171';
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 30) return 'Poor';
  return 'Critical';
}

export function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncateCode(code: string, maxLength = 100): string {
  if (code.length <= maxLength) return code;
  return code.slice(0, maxLength).trim() + '…';
}

'use client';

import { useState } from 'react';
import { ReviewResult, ReviewStats } from '@/lib/types';
import { getReviewStats, formatTimestamp } from '@/lib/utils';
import ScoreRing from './ScoreRing';
import IssueCard from './IssueCard';
import {
  Bug, ShieldAlert, Zap, Lightbulb, LayoutDashboard,
  Copy, Check, Bot, FlaskConical, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'overview' | 'bugs' | 'security' | 'performance' | 'suggestions';

interface ReviewPanelProps {
  result: ReviewResult;
}

const TABS: { id: Tab; label: string; icon: React.ElementType; countKey: keyof ReviewStats | null }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, countKey: null },
  { id: 'bugs', label: 'Bugs', icon: Bug, countKey: 'bugs' },
  { id: 'security', label: 'Security', icon: ShieldAlert, countKey: 'security' },
  { id: 'performance', label: 'Performance', icon: Zap, countKey: 'performance' },
  { id: 'suggestions', label: 'Style', icon: Lightbulb, countKey: 'suggestions' },
];

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: number; icon: React.ElementType; color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
      <Icon className={cn('h-5 w-5', color)} />
      <span className="text-2xl font-bold text-white tabular-nums">{value}</span>
      <span className="text-[11px] text-slate-500 text-center leading-tight">{label}</span>
    </div>
  );
}

export default function ReviewPanel({ result }: ReviewPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [copied, setCopied] = useState(false);
  const stats = getReviewStats(result.issues);

  const filteredIssues = result.issues.filter(issue => {
    if (activeTab === 'overview') return true;
    if (activeTab === 'bugs') return issue.category === 'bug';
    if (activeTab === 'security') return issue.category === 'security';
    if (activeTab === 'performance') return issue.category === 'performance';
    if (activeTab === 'suggestions') return issue.category === 'suggestion' || issue.category === 'style';
    return true;
  });

  async function copyReview() {
    const text = [
      `CodeLens AI Review — ${result.language.toUpperCase()}`,
      `Date: ${formatTimestamp(result.timestamp)}`,
      `Score: ${result.score}/100`,
      `Mode: ${result.mode === 'ai' ? 'AI Analysis' : 'Demo Mode'}`,
      '',
      `Summary: ${result.summary}`,
      '',
      `Issues (${result.issues.length}):`,
      ...result.issues.map((issue, i) =>
        [
          `\n[${i + 1}] [${issue.severity.toUpperCase()}] ${issue.title}`,
          `    Category: ${issue.category}`,
          `    ${issue.explanation}`,
          issue.problematicCode ? `    Problem: ${issue.problematicCode}` : '',
          issue.suggestedFix ? `    Fix: ${issue.suggestedFix}` : '',
        ].filter(Boolean).join('\n')
      ),
    ].join('\n');

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07] bg-[#0d1117]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200">Review Results</span>
          {result.mode === 'demo' ? (
            <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
              <FlaskConical className="h-2.5 w-2.5" />
              Demo Mode
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400">
              <Bot className="h-2.5 w-2.5" />
              AI Analysis
            </span>
          )}
        </div>
        <button
          onClick={copyReview}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-white/[0.08] hover:text-slate-200 transition-colors"
        >
          {copied ? <><Check className="h-3 w-3 text-green-400" /> Copied!</> : <><Copy className="h-3 w-3" /> Copy Review</>}
        </button>
      </div>

      {/* Score + stats */}
      <div className="px-4 py-4 border-b border-white/[0.07] bg-[#0d1117]">
        <div className="flex items-center gap-4 mb-4">
          <ScoreRing score={result.score} size={110} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 mb-1">
              {formatTimestamp(result.timestamp)} · {result.language.toUpperCase()}
            </p>
            <p className="text-sm text-slate-300 leading-relaxed line-clamp-4">
              {result.summary}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <StatCard label="Bugs" value={stats.bugs} icon={Bug} color="text-red-400" />
          <StatCard label="Security" value={stats.security} icon={ShieldAlert} color="text-orange-400" />
          <StatCard label="Performance" value={stats.performance} icon={Zap} color="text-yellow-400" />
          <StatCard label="Style" value={stats.suggestions} icon={Lightbulb} color="text-purple-400" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.07] bg-[#0d1117] overflow-x-auto scrollbar-hide">
        {TABS.map(({ id, label, icon: Icon, countKey }) => {
          const count = countKey ? stats[countKey] : stats.total;
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-all duration-150',
                isActive
                  ? 'border-violet-500 text-violet-300 bg-violet-500/5'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {(id === 'overview' ? stats.total : count) > 0 && (
                <span className={cn(
                  'rounded-full px-1.5 py-0.5 text-[9px] font-bold min-w-[16px] text-center',
                  isActive ? 'bg-violet-500/20 text-violet-300' : 'bg-white/10 text-slate-400'
                )}>
                  {id === 'overview' ? stats.total : count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Issues list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0d1117]">
        {filteredIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20">
              <Check className="h-6 w-6 text-green-400" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No issues in this category</p>
            <p className="mt-1 text-xs text-slate-500">
              {activeTab === 'overview' ? 'No issues found — great code!' : `No ${activeTab} issues detected.`}
            </p>
          </div>
        ) : (
          filteredIssues.map((issue, i) => (
            <IssueCard key={issue.id} issue={issue} index={i} />
          ))
        )}

        {/* AI disclaimer */}
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
          <p className="text-[11px] text-amber-300/70 leading-relaxed">
            {result.mode === 'ai'
              ? 'AI analysis is not a substitute for thorough code review. It may miss issues or flag false positives. Always review suggestions in context.'
              : 'Demo mode uses pattern matching. Enable AI mode with a Gemini API key for comprehensive analysis.'}
          </p>
        </div>
      </div>
    </div>
  );
}

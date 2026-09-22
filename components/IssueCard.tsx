'use client';

import { useState } from 'react';
import { CodeIssue, SEVERITY_CONFIG } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface IssueCardProps {
  issue: CodeIssue;
  index: number;
}

export default function IssueCard({ issue, index }: IssueCardProps) {
  const [expanded, setExpanded] = useState(index < 3);
  const [copied, setCopied] = useState(false);
  const config = SEVERITY_CONFIG[issue.severity];

  async function copyFix() {
    if (!issue.suggestedFix) return;
    await navigator.clipboard.writeText(issue.suggestedFix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-200',
        config.bgColor,
        config.borderColor,
        'hover:border-opacity-60'
      )}
    >
      {/* Header — always visible */}
      <button
        className="w-full flex items-start gap-3 p-4 text-left"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
      >
        {/* Severity badge */}
        <span
          className={cn(
            'shrink-0 mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border',
            config.color,
            config.bgColor,
            config.borderColor
          )}
        >
          <span>{config.icon}</span>
          {config.label}
        </span>

        {/* Category chip */}
        <span className="shrink-0 mt-0.5 inline-flex items-center rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400 capitalize">
          {issue.category}
        </span>

        {/* Title */}
        <span className="flex-1 text-sm font-semibold text-slate-200 leading-snug">
          {issue.title}
          {issue.lineNumber && (
            <span className="ml-2 text-xs font-normal text-slate-500">
              Line {issue.lineNumber}
            </span>
          )}
        </span>

        {/* Expand icon */}
        <span className="shrink-0 text-slate-500 mt-0.5">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/[0.05] pt-3">
          {/* Explanation */}
          <p className="text-sm text-slate-300 leading-relaxed">{issue.explanation}</p>

          {/* Problematic code */}
          {issue.problematicCode && (
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-red-400">
                Problematic Code
              </p>
              <pre className="overflow-x-auto rounded-lg bg-black/40 border border-red-500/20 p-3 text-[12px] text-red-200 font-mono leading-relaxed">
                <code>{issue.problematicCode}</code>
              </pre>
            </div>
          )}

          {/* Suggested fix */}
          {issue.suggestedFix && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-green-400">
                  Suggested Fix
                </p>
                <button
                  onClick={copyFix}
                  className="flex items-center gap-1.5 rounded-md bg-green-500/10 border border-green-500/20 px-2.5 py-1 text-[11px] font-medium text-green-400 hover:bg-green-500/20 transition-colors"
                  title="Copy fix to clipboard"
                >
                  {copied ? (
                    <><Check className="h-3 w-3" /> Copied!</>
                  ) : (
                    <><Copy className="h-3 w-3" /> Copy Fix</>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto rounded-lg bg-black/40 border border-green-500/20 p-3 text-[12px] text-green-200 font-mono leading-relaxed">
                <code>{issue.suggestedFix}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HistoryEntry, ReviewResult } from '@/lib/types';
import { getHistory, deleteFromHistory, clearHistory } from '@/lib/storage';
import { getScoreColor, getScoreLabel, formatTimestamp, truncateCode } from '@/lib/utils';
import ReviewPanel from '@/components/ReviewPanel';
import {
  History, Trash2, ChevronRight, X, RotateCcw, Code2, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

function ScoreBadge({ score }: { score: number }) {
  return (
    <span className={cn(
      'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold tabular-nums',
      score >= 90 ? 'bg-green-500/15 text-green-400 border border-green-500/30' :
      score >= 70 ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30' :
      score >= 50 ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' :
                   'bg-red-500/15 text-red-400 border border-red-500/30'
    )}>
      {score}
    </span>
  );
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selected, setSelected] = useState<ReviewResult | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  useEffect(() => {
    // Load history after hydration to avoid SSR mismatch
    const loaded = getHistory();
    if (loaded.length > 0) setHistory(loaded);
  }, []);

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    deleteFromHistory(id);
    setHistory(getHistory());
    if (selectedEntry?.id === id) {
      setSelected(null);
      setSelectedEntry(null);
    }
  }

  function handleClearAll() {
    if (confirm('Clear all review history? This cannot be undone.')) {
      clearHistory();
      setHistory([]);
      setSelected(null);
      setSelectedEntry(null);
    }
  }

  function handleOpen(entry: HistoryEntry) {
    setSelectedEntry(entry);
    setSelected(entry.result);
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6">
        {/* Page header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20">
              <History className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Review History</h1>
              <p className="text-sm text-slate-500">{history.length} saved review{history.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03]">
              <RotateCcw className="h-8 w-8 text-slate-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-400">No reviews yet</h2>
            <p className="mt-2 text-sm text-slate-600 max-w-sm">
              Review some code on the home page and your results will appear here automatically.
            </p>
            <Link
              href="/"
              className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-shadow"
            >
              <Code2 className="h-4 w-4" />
              Start Reviewing
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-5">
            {/* History list */}
            <div className={cn(
              'flex flex-col gap-2',
              selected ? 'lg:w-[380px] xl:w-[420px] shrink-0' : 'w-full max-w-2xl'
            )}>
              {history.map(entry => (
                <div
                  key={entry.id}
                  onClick={() => handleOpen(entry)}
                  className={cn(
                    'group relative cursor-pointer rounded-xl border p-4 transition-all duration-200',
                    selectedEntry?.id === entry.id
                      ? 'border-violet-500/40 bg-violet-500/5'
                      : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-flex items-center rounded-md bg-white/[0.06] border border-white/10 px-2 py-0.5 text-[11px] font-mono font-semibold text-slate-300 uppercase">
                          {entry.language}
                        </span>
                        <ScoreBadge score={entry.score} />
                        <span className={cn('text-xs font-medium', getScoreColor(entry.score))}>
                          {getScoreLabel(entry.score)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-2">
                        {entry.summary}
                      </p>
                      <p className="text-[11px] font-mono text-slate-600 bg-white/[0.03] rounded px-2 py-1 line-clamp-1">
                        {truncateCode(entry.code, 80)}
                      </p>
                      <p className="mt-2 text-xs text-slate-600">
                        {formatTimestamp(entry.timestamp)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={e => handleDelete(entry.id, e)}
                        className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-500 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all"
                        title="Delete this review"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <ChevronRight className={cn(
                        'h-4 w-4 transition-transform',
                        selectedEntry?.id === entry.id ? 'text-violet-400 translate-x-0.5' : 'text-slate-600'
                      )} />
                    </div>
                  </div>

                  {/* Issue count badges */}
                  <div className="mt-2 flex items-center gap-1.5">
                    {entry.result.issues.filter(i => i.category === 'bug').length > 0 && (
                      <span className="rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] text-red-400 font-medium">
                        {entry.result.issues.filter(i => i.category === 'bug').length} bug{entry.result.issues.filter(i => i.category === 'bug').length > 1 ? 's' : ''}
                      </span>
                    )}
                    {entry.result.issues.filter(i => i.category === 'security').length > 0 && (
                      <span className="rounded-full bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-[10px] text-orange-400 font-medium">
                        {entry.result.issues.filter(i => i.category === 'security').length} security
                      </span>
                    )}
                    {entry.result.issues.filter(i => i.category === 'performance').length > 0 && (
                      <span className="rounded-full bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 text-[10px] text-yellow-400 font-medium">
                        {entry.result.issues.filter(i => i.category === 'performance').length} perf
                      </span>
                    )}
                    {entry.result.mode === 'demo' && (
                      <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] text-amber-400 font-medium">
                        Demo
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Review detail panel */}
            {selected && (
              <div className="flex-1 min-w-0 rounded-xl border border-white/[0.07] overflow-hidden flex flex-col" style={{ minHeight: '600px' }}>
                <ReviewPanel result={selected} />
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed">
            Review history is stored locally in your browser&apos;s localStorage and is never sent to any server. Clearing your browser data will remove this history.
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { SUPPORTED_LANGUAGES, SupportedLanguage, ReviewResult, HistoryEntry } from '@/lib/types';
import { saveToHistory } from '@/lib/storage';
import { EXAMPLE_CODE } from '@/lib/examples';
import ReviewPanel from '@/components/ReviewPanel';
import { cn } from '@/lib/utils';
import {
  Play, Trash2, BookOpen, ChevronDown, Loader2,
  Code2, Zap, ShieldCheck, Bug, Sparkles
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const CodeEditor = dynamic(() => import('@/components/CodeEditor'), { ssr: false });

const DEFAULT_CODE = `// Welcome to CodeLens AI 👋
// Paste your code here or click "Load Example" to see a demo.
// Select your language, then click "Review Code" to analyze.

function greet(name) {
  console.log("Hello, " + name + "!");
}

greet("World");
`;

export default function HomePage() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState<SupportedLanguage>('javascript');
  const [langOpen, setLangOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedLang = SUPPORTED_LANGUAGES.find(l => l.value === language)!;

  const handleReview = useCallback(async () => {
    if (!code.trim()) {
      setError('Please enter some code to review.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Review failed');
      }

      const data = await res.json();
      const reviewResult: ReviewResult = data.result;
      setResult(reviewResult);

      // Save to history
      const entry: HistoryEntry = {
        id: uuidv4(),
        language,
        timestamp: reviewResult.timestamp,
        score: reviewResult.score,
        summary: reviewResult.summary.slice(0, 120),
        result: reviewResult,
        code,
      };
      saveToHistory(entry);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [code, language]);

  function handleLoadExample() {
    const example = EXAMPLE_CODE[language];
    setCode(example || DEFAULT_CODE);
    setResult(null);
    setError(null);
  }

  function handleClear() {
    setCode('');
    setResult(null);
    setError(null);
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0d1117]">
      {/* Hero section */}
      <section className="relative overflow-hidden border-b border-white/[0.06] bg-gradient-to-b from-[#0d1117] via-[#0d1117] to-[#0d1117] py-10 px-4 sm:px-6 text-center">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-72 w-[600px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
            <Sparkles className="h-3 w-3" />
            AI-Powered Code Review
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Ship better code with{' '}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              CodeLens AI
            </span>
          </h1>
          <p className="mt-3 text-base text-slate-400 max-w-xl mx-auto">
            Instantly detect bugs, security vulnerabilities, performance issues, and
            code-quality problems in your source code.
          </p>

          {/* Feature pills */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {[
              { icon: Bug, text: 'Bug Detection', color: 'text-red-400' },
              { icon: ShieldCheck, text: 'Security Audit', color: 'text-orange-400' },
              { icon: Zap, text: 'Performance', color: 'text-yellow-400' },
              { icon: Code2, text: 'Code Quality', color: 'text-purple-400' },
            ].map(({ icon: Icon, text, color }) => (
              <div
                key={text}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400"
              >
                <Icon className={cn('h-3 w-3', color)} />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main workspace */}
      <main className="flex-1 mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-5 h-full">
          {/* ── Left: Code Editor ── */}
          <div className="flex flex-col flex-1 min-w-0" style={{ minHeight: '600px' }}>
            {/* Editor toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-xl border border-white/[0.07] border-b-0 bg-[#161b22] px-3 py-2.5">
              {/* Language selector */}
              <div className="relative">
                <button
                  id="language-selector"
                  onClick={() => setLangOpen(o => !o)}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-white/[0.08] transition-colors"
                >
                  <Code2 className="h-3.5 w-3.5 text-violet-400" />
                  {selectedLang.label}
                  <ChevronDown className={cn('h-3.5 w-3.5 text-slate-500 transition-transform', langOpen && 'rotate-180')} />
                </button>

                {langOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                    <div className="absolute left-0 top-full mt-1.5 z-20 min-w-[140px] rounded-xl border border-white/10 bg-[#1c2128] shadow-2xl shadow-black/50 overflow-hidden">
                      {SUPPORTED_LANGUAGES.map(lang => (
                        <button
                          key={lang.value}
                          onClick={() => {
                            setLanguage(lang.value as SupportedLanguage);
                            setLangOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center px-3 py-2 text-sm transition-colors text-left',
                            language === lang.value
                              ? 'bg-violet-500/15 text-violet-300'
                              : 'text-slate-300 hover:bg-white/[0.06]'
                          )}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  id="load-example-btn"
                  onClick={handleLoadExample}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-white/[0.08] hover:text-slate-200 transition-colors"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Load Example
                </button>
                <button
                  id="clear-code-btn"
                  onClick={handleClear}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-white/[0.08] hover:text-red-300 hover:border-red-500/30 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear
                </button>
                <button
                  id="review-code-btn"
                  onClick={handleReview}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing…</>
                  ) : (
                    <><Play className="h-3.5 w-3.5" /> Review Code</>
                  )}
                </button>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 rounded-b-xl border border-white/[0.07] overflow-hidden" style={{ minHeight: '520px' }}>
              <CodeEditor
                code={code}
                language={language}
                onChange={setCode}
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <span className="text-base">⚠️</span>
                {error}
              </div>
            )}
          </div>

          {/* ── Right: Review Results ── */}
          <div className="lg:w-[480px] xl:w-[520px] shrink-0 flex flex-col" style={{ minHeight: '600px' }}>
            {result ? (
              <div className="flex-1 rounded-xl border border-white/[0.07] overflow-hidden flex flex-col">
                <ReviewPanel result={result} />
              </div>
            ) : (
              <div className="flex-1 rounded-xl border border-white/[0.07] border-dashed bg-[#0d1117] flex flex-col items-center justify-center text-center p-8 gap-4">
                {loading ? (
                  <>
                    <div className="relative flex h-16 w-16 items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 animate-ping" />
                      <div className="h-12 w-12 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-300">Analyzing your code…</p>
                      <p className="mt-1 text-sm text-slate-500">This usually takes a few seconds</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/5">
                      <Zap className="h-8 w-8 text-violet-400/50" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-400">Ready to review</p>
                      <p className="mt-1 text-sm text-slate-600 max-w-xs">
                        Paste your code in the editor and click{' '}
                        <span className="text-violet-400 font-medium">Review Code</span> to get started
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 w-full max-w-xs mt-2">
                      {[
                        { label: 'Bugs & Errors', desc: 'Logic & runtime issues' },
                        { label: 'Security', desc: 'Vulnerabilities & risks' },
                        { label: 'Performance', desc: 'Bottlenecks & leaks' },
                        { label: 'Code Quality', desc: 'Best practices & style' },
                      ].map(({ label, desc }) => (
                        <div key={label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-left">
                          <p className="text-xs font-semibold text-slate-400">{label}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5">{desc}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

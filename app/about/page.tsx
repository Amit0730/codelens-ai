import { Info, AlertTriangle, Code2, ShieldAlert, Zap, Bug, Lightbulb, GitBranch, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'About — CodeLens AI',
  description: 'Learn about CodeLens AI, how it works, and the limitations of AI-powered code review.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-500/25">
            <Info className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">About CodeLens AI</h1>
          <p className="mt-3 text-slate-400">
            An AI-powered code review assistant for developers
          </p>
        </div>

        <div className="space-y-8">
          {/* What is it */}
          <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
            <h2 className="mb-4 text-lg font-bold text-white flex items-center gap-2">
              <Code2 className="h-5 w-5 text-violet-400" />
              What is CodeLens AI?
            </h2>
            <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
              <p>
                CodeLens AI is a developer tool that uses Google Gemini (a large language model) to analyze your source code and provide structured feedback on potential issues.
              </p>
              <p>
                You paste code, select a language, and the AI returns a prioritized list of issues organized by category — bugs, security vulnerabilities, performance problems, and code quality suggestions.
              </p>
              <p>
                It supports 9 programming languages: <strong className="text-slate-300">C, C++, Java, Python, JavaScript, TypeScript, SQL, HTML, and CSS</strong>.
              </p>
            </div>
          </section>

          {/* How it works */}
          <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
            <h2 className="mb-4 text-lg font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              How It Works
            </h2>
            <div className="space-y-3">
              {[
                { step: '1', title: 'Code Submission', desc: 'You paste your code and select the programming language.' },
                { step: '2', title: 'Server-side Analysis', desc: 'Your code is sent to a secure server-side API route. It is never executed — only read and analyzed.' },
                { step: '3', title: 'AI Review', desc: 'Google Gemini analyzes the code with a carefully crafted prompt that instructs it to find specific issue categories and return structured JSON.' },
                { step: '4', title: 'Structured Results', desc: 'Issues are displayed by severity (Critical → Suggestion) with explanations, problematic code snippets, and concrete fix suggestions.' },
                { step: '5', title: 'History', desc: 'Results are saved to your browser\'s localStorage for future reference.' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20 border border-violet-500/30 text-xs font-bold text-violet-400">
                    {step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-300">{title}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Analysis categories */}
          <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
            <h2 className="mb-4 text-lg font-bold text-white flex items-center gap-2">
              <Bug className="h-5 w-5 text-red-400" />
              What Gets Analyzed
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: Bug, label: 'Bugs', color: 'text-red-400', desc: 'Logic errors, off-by-one issues, null pointer bugs, type mismatches' },
                { icon: ShieldAlert, label: 'Security', color: 'text-orange-400', desc: 'SQL injection, XSS, OWASP Top 10, exposed secrets, insecure APIs' },
                { icon: Zap, label: 'Performance', color: 'text-yellow-400', desc: 'Inefficient algorithms, memory leaks, N+1 queries, unnecessary work' },
                { icon: Lightbulb, label: 'Code Quality', color: 'text-purple-400', desc: 'Best practices, readability, dead code, missing error handling' },
              ].map(({ icon: Icon, label, color, desc }) => (
                <div key={label} className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${color}`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-300">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Limitations */}
          <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
            <h2 className="mb-4 text-lg font-bold text-amber-300 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Important Limitations
            </h2>
            <ul className="space-y-3 text-sm text-amber-200/70 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span><strong className="text-amber-300">Not a substitute for human review.</strong> AI analysis may miss issues, produce false positives, or misunderstand context-specific logic. Always have experienced developers review critical code.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span><strong className="text-amber-300">Does not guarantee correctness.</strong> A high score does not mean the code is bug-free or secure. The AI can only analyze what it can see.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span><strong className="text-amber-300">No execution.</strong> Code is never run on our servers. We cannot detect runtime-specific bugs that only appear with specific input data.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span><strong className="text-amber-300">Context limitations.</strong> Analysis is limited to the submitted snippet. It cannot see your full codebase, dependencies, or runtime environment.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span><strong className="text-amber-300">50,000 character limit.</strong> Very large files should be split into smaller chunks for analysis.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span><strong className="text-amber-300">Demo mode.</strong> Without an AI API key, only pattern-based analysis is available, which is much more limited.</span>
              </li>
            </ul>
          </section>

          {/* Privacy */}
          <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
            <h2 className="mb-4 text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-green-400" />
              Privacy & Security
            </h2>
            <ul className="space-y-2 text-sm text-slate-400 leading-relaxed">
              <li className="flex gap-2"><span className="text-green-400">✓</span> Code is sent to the AI API only for analysis and is not stored by CodeLens AI.</li>
              <li className="flex gap-2"><span className="text-green-400">✓</span> API keys are kept server-side and never exposed in frontend code.</li>
              <li className="flex gap-2"><span className="text-green-400">✓</span> Review history is stored only in your browser&apos;s localStorage — never on our servers.</li>
              <li className="flex gap-2"><span className="text-green-400">✓</span> Submitted code is never executed on any server.</li>
              <li className="flex gap-2"><span className="text-amber-400">⚠</span> Avoid submitting production secrets, API keys, or sensitive credentials. Use environment variables in your actual code.</li>
            </ul>
          </section>

          {/* Open source */}
          <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
            <h2 className="mb-4 text-lg font-bold text-white flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-slate-400" />
              Open Source
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              CodeLens AI is open source. View the code, report issues, or contribute on GitHub.
            </p>
            <a
              href="https://github.com/search?q=codelens-ai&type=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/[0.08] transition-colors"
            >
              <GitBranch className="h-4 w-4" />
              View on GitHub
              <ExternalLink className="h-3 w-3 text-slate-500" />
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}

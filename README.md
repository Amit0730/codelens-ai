# CodeLens AI

> AI-powered code review assistant for detecting bugs, security issues, performance problems, and code-quality improvements.

![CodeLens AI](https://img.shields.io/badge/CodeLens-AI-violet?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)

## Features

- 🔍 **AI-Powered Analysis** — Uses Google Gemini to provide deep, contextual code review
- 🛡️ **Security Audit** — Detects SQL injection, XSS, hardcoded secrets, OWASP Top 10
- 🐛 **Bug Detection** — Finds logic errors, null pointers, off-by-one bugs, type mismatches
- ⚡ **Performance Analysis** — Identifies bottlenecks, memory leaks, N+1 queries
- 💡 **Code Quality** — Suggests best practices, readability improvements, dead code removal
- 📊 **Quality Score** — 0–100 score based on detected issues
- 🔧 **Monaco Editor** — VS Code-level editor with syntax highlighting and dark theme
- 📋 **Copy Fixes** — One-click copy for every suggested code fix
- 📁 **Review History** — localStorage-persisted history with full review details
- 🎯 **Demo Mode** — Works without an API key using pattern-based analysis

## Supported Languages

C · C++ · Java · Python · JavaScript · TypeScript · SQL · HTML · CSS

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Editor**: Monaco Editor (`@monaco-editor/react`)
- **AI**: Google Gemini (`gemini-1.5-flash`)
- **Icons**: Lucide React

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Amit0730/codelens-ai.git
cd codelens-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Gemini API key:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).

> **Note**: The app works in demo mode without an API key, using pattern-based analysis.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment on Vercel

### Option 1: Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import from GitHub: `Amit0730/codelens-ai`
3. Add environment variable: `GEMINI_API_KEY = your_key`
4. Click **Deploy**

### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

Add the environment variable:
```bash
vercel env add GEMINI_API_KEY
```

## Architecture

```
codelens-ai/
├── app/
│   ├── page.tsx              # Home — code editor + review panel
│   ├── history/page.tsx      # Review history
│   ├── about/page.tsx        # About & limitations
│   ├── layout.tsx            # Root layout
│   └── api/review/route.ts   # Server-side AI review endpoint
├── components/
│   ├── CodeEditor.tsx        # Monaco Editor wrapper
│   ├── ReviewPanel.tsx       # Results dashboard with tabs
│   ├── IssueCard.tsx         # Per-issue display with copy-fix
│   ├── ScoreRing.tsx         # Quality score SVG donut chart
│   └── Navbar.tsx            # Navigation
└── lib/
    ├── types.ts              # Shared TypeScript types
    ├── ai.ts                 # Gemini API client (server-side only)
    ├── demo-analyzer.ts      # Local pattern-based analyzer
    ├── storage.ts            # localStorage history helpers
    ├── examples.ts           # Example code for all languages
    └── utils.ts              # Score calculation & formatting
```

## Security

- ✅ API keys are **never** exposed in client code
- ✅ Submitted code is **never executed** on the server
- ✅ Input is validated and length-limited (50,000 chars max)
- ✅ Security headers (X-Content-Type-Options, X-Frame-Options, XSS protection)
- ✅ Review history stored only in browser localStorage

## Disclaimer

AI analysis does not guarantee that code is bug-free or secure. Always have experienced developers review critical code. See the [About](https://codelens-ai.vercel.app/about) page for full limitations.

## License

MIT

import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'CodeLens AI — AI-Powered Code Review',
    template: '%s | CodeLens AI',
  },
  description:
    'AI-powered code review assistant for detecting bugs, security issues, performance problems, and code-quality improvements in your source code.',
  keywords: [
    'code review', 'AI', 'bug detection', 'security audit', 'static analysis',
    'developer tools', 'JavaScript', 'Python', 'TypeScript', 'code quality',
  ],
  authors: [{ name: 'CodeLens AI' }],
  openGraph: {
    title: 'CodeLens AI — AI-Powered Code Review',
    description: 'Instantly detect bugs, security vulnerabilities, and code-quality issues with AI.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="min-h-screen bg-[#0d1117] text-slate-200 antialiased font-sans">
        <Navbar />
        {children}
        <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-slate-600">
          <p>
            CodeLens AI — AI-powered code review •{' '}
            <span className="text-slate-500">
              AI analysis does not guarantee bug-free or secure code.
            </span>
          </p>
        </footer>
      </body>
    </html>
  );
}

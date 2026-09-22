'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/lib/types';

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(m => m.default),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

function EditorSkeleton() {
  return (
    <div className="flex h-full items-center justify-center bg-[#1e1e1e] rounded-b-lg">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        <span className="text-xs text-slate-500">Loading editor…</span>
      </div>
    </div>
  );
}

interface CodeEditorProps {
  code: string;
  language: SupportedLanguage;
  onChange: (value: string) => void;
}

export default function CodeEditor({ code, language, onChange }: CodeEditorProps) {
  const editorRef = useRef<unknown>(null);

  const monacoLang = SUPPORTED_LANGUAGES.find(l => l.value === language)?.monacoLang ?? language;

  function handleMount(editor: unknown) {
    editorRef.current = editor;
  }

  return (
    <div className="h-full w-full overflow-hidden rounded-b-lg">
      <MonacoEditor
        height="100%"
        language={monacoLang}
        value={code}
        theme="vs-dark"
        onChange={v => onChange(v ?? '')}
        onMount={handleMount}
        options={{
          fontSize: 13.5,
          fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", Menlo, Monaco, monospace',
          fontLigatures: true,
          lineNumbers: 'on',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          tabSize: 2,
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
          smoothScrolling: true,
          cursorSmoothCaretAnimation: 'on',
          padding: { top: 12, bottom: 12 },
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
        }}
      />
    </div>
  );
}

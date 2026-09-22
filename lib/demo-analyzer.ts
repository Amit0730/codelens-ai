import { CodeIssue, ReviewResult } from './types';
import { v4 as uuidv4 } from 'uuid';
import { calculateScore } from './utils';

/**
 * Demo/local analysis mode — runs deterministic pattern-matching checks
 * without requiring an API key. Used as fallback when GEMINI_API_KEY is absent.
 */
export function runDemoAnalysis(code: string, language: string): ReviewResult {
  const issues: CodeIssue[] = [];
  const lines = code.split('\n');

  // ─── Universal checks ────────────────────────────────────────────────────

  // Check for TODO / FIXME / HACK comments
  lines.forEach((line, idx) => {
    if (/\b(TODO|FIXME|HACK|XXX)\b/i.test(line)) {
      issues.push({
        id: uuidv4(),
        severity: 'low',
        category: 'suggestion',
        title: 'Unresolved TODO/FIXME comment',
        explanation: `Line ${idx + 1} contains a TODO/FIXME marker indicating incomplete or problematic code that should be addressed before production deployment.`,
        problematicCode: line.trim(),
        suggestedFix: '// Remove or resolve this comment by implementing the necessary fix.',
        lineNumber: idx + 1,
      });
    }
  });

  // Hardcoded secrets / passwords
  const secretPatterns = [
    { pattern: /password\s*=\s*["'][^"']{3,}["']/i, label: 'Hardcoded password' },
    { pattern: /api[_-]?key\s*=\s*["'][A-Za-z0-9_\-]{10,}["']/i, label: 'Hardcoded API key' },
    { pattern: /secret\s*=\s*["'][^"']{5,}["']/i, label: 'Hardcoded secret' },
    { pattern: /token\s*=\s*["'][A-Za-z0-9_\-.]{10,}["']/i, label: 'Hardcoded token' },
  ];

  lines.forEach((line, idx) => {
    secretPatterns.forEach(({ pattern, label }) => {
      if (pattern.test(line)) {
        issues.push({
          id: uuidv4(),
          severity: 'critical',
          category: 'security',
          title: label,
          explanation: `Line ${idx + 1} appears to contain a hardcoded credential. This is a critical security risk — secrets must never be embedded in source code.`,
          problematicCode: line.trim(),
          suggestedFix: '// Use environment variables or a secrets manager instead:\n// const password = process.env.DB_PASSWORD;',
          lineNumber: idx + 1,
        });
      }
    });
  });

  // ─── Language-specific checks ─────────────────────────────────────────────

  if (language === 'javascript' || language === 'typescript') {
    // eval() usage
    if (/\beval\s*\(/.test(code)) {
      issues.push({
        id: uuidv4(),
        severity: 'critical',
        category: 'security',
        title: 'Use of eval()',
        explanation: '`eval()` executes arbitrary strings as code, creating severe XSS and code injection vulnerabilities. It also prevents JavaScript engine optimizations.',
        problematicCode: code.match(/.*eval\s*\(.*/)?.[0]?.trim(),
        suggestedFix: '// Replace eval() with safer alternatives:\n// - JSON.parse() for data parsing\n// - Function constructors for dynamic behavior\n// - Or refactor to avoid dynamic code execution',
      });
    }

    // console.log in code (warn for production)
    const consoleMatches = code.match(/console\.(log|debug|info)\s*\(/g);
    if (consoleMatches && consoleMatches.length > 2) {
      issues.push({
        id: uuidv4(),
        severity: 'low',
        category: 'style',
        title: 'Excessive console logging',
        explanation: `Found ${consoleMatches.length} console.log/debug/info calls. These should be removed or replaced with a proper logging library before production deployment.`,
        problematicCode: 'console.log(...)',
        suggestedFix: '// Use a logging library like winston or pino:\n// import logger from \'./logger\';\n// logger.debug(\'...\');',
      });
    }

    // var usage
    if (/\bvar\s+/.test(code)) {
      issues.push({
        id: uuidv4(),
        severity: 'medium',
        category: 'style',
        title: 'Use of var instead of let/const',
        explanation: '`var` has function-level scoping and hoisting behavior that can cause subtle bugs. Use `let` for reassignable variables and `const` for constants.',
        problematicCode: code.match(/.*\bvar\s+.*/)?.[0]?.trim(),
        suggestedFix: '// Replace var with const or let:\n// const name = value;  // for constants\n// let counter = 0;      // for mutable variables',
      });
    }

    // == instead of ===
    if (/[^=!<>]==[^=]/.test(code)) {
      issues.push({
        id: uuidv4(),
        severity: 'medium',
        category: 'bug',
        title: 'Loose equality comparison (==)',
        explanation: 'Using `==` performs type coercion, which can produce unexpected results (e.g., `0 == ""` is true). Use strict equality `===` instead.',
        problematicCode: code.match(/.*[^=!<>]==[^=].*/)?.[0]?.trim(),
        suggestedFix: '// Use strict equality:\n// if (value === expected) { ... }',
      });
    }

    // Promise without catch
    if (/\.then\s*\(/.test(code) && !/.catch\s*\(/.test(code) && !/try\s*\{/.test(code)) {
      issues.push({
        id: uuidv4(),
        severity: 'high',
        category: 'bug',
        title: 'Unhandled promise rejection',
        explanation: 'Promise chains with `.then()` but no `.catch()` silently swallow errors, making debugging very difficult.',
        suggestedFix: '// Always handle promise rejections:\npromise\n  .then(result => { /* ... */ })\n  .catch(error => console.error(\'Error:\', error));',
      });
    }
  }

  if (language === 'python') {
    // bare except
    if (/except\s*:/.test(code)) {
      issues.push({
        id: uuidv4(),
        severity: 'high',
        category: 'bug',
        title: 'Bare except clause',
        explanation: 'A bare `except:` catches ALL exceptions including `SystemExit`, `KeyboardInterrupt`, and `GeneratorExit`, which is almost never intended. Specify the exception type.',
        problematicCode: code.match(/.*except\s*:.*/)?.[0]?.trim(),
        suggestedFix: '# Specify the exception type:\ntry:\n    risky_operation()\nexcept ValueError as e:\n    handle_error(e)',
      });
    }

    // mutable default argument
    if (/def\s+\w+\s*\([^)]*=\s*[\[\{]/.test(code)) {
      issues.push({
        id: uuidv4(),
        severity: 'high',
        category: 'bug',
        title: 'Mutable default argument',
        explanation: 'Using a mutable object (list, dict) as a default argument is a classic Python gotcha — the same object is shared across all calls, causing unexpected state accumulation.',
        problematicCode: code.match(/def\s+\w+\s*\([^)]*=\s*[\[\{][^)]*\)/)?.[0],
        suggestedFix: '# Use None as default and create inside function:\ndef func(items=None):\n    if items is None:\n        items = []',
      });
    }

    // print statement (Python 2 style)
    if (/^\s*print\s+(?![(])/.test(code)) {
      issues.push({
        id: uuidv4(),
        severity: 'medium',
        category: 'bug',
        title: 'Python 2 print statement',
        explanation: '`print` without parentheses is Python 2 syntax and will fail in Python 3.',
        problematicCode: code.match(/.*print\s+(?![(]).*/)?.[0]?.trim(),
        suggestedFix: '# Use print() function:\nprint("Hello, World!")',
      });
    }
  }

  if (language === 'sql') {
    // SELECT *
    if (/SELECT\s+\*/i.test(code)) {
      issues.push({
        id: uuidv4(),
        severity: 'medium',
        category: 'performance',
        title: 'SELECT * usage',
        explanation: '`SELECT *` retrieves all columns, which is inefficient and fragile — it transfers unnecessary data and breaks if columns are reordered or renamed.',
        problematicCode: code.match(/.*SELECT\s+\*.*/i)?.[0]?.trim(),
        suggestedFix: '-- Specify only needed columns:\nSELECT id, name, email FROM users;',
      });
    }

    // SQL injection pattern (string concatenation)
    if (/["']\s*\+\s*\w+\s*\+\s*["']/.test(code) || /f["'].*SELECT.*{/.test(code)) {
      issues.push({
        id: uuidv4(),
        severity: 'critical',
        category: 'security',
        title: 'Potential SQL injection vulnerability',
        explanation: 'Concatenating user input directly into SQL queries is the #1 database security vulnerability. An attacker can manipulate the query to bypass authentication, read/delete data, or execute arbitrary SQL.',
        suggestedFix: '-- Use parameterized queries:\nquery = "SELECT * FROM users WHERE id = %s"\ncursor.execute(query, (user_id,))',
      });
    }
  }

  if (language === 'html') {
    // inline styles
    const inlineStyleCount = (code.match(/style\s*=/gi) || []).length;
    if (inlineStyleCount > 3) {
      issues.push({
        id: uuidv4(),
        severity: 'low',
        category: 'style',
        title: 'Excessive inline styles',
        explanation: `Found ${inlineStyleCount} inline style attributes. Inline styles reduce maintainability and make it impossible to override with CSS. Move styles to CSS classes.`,
        suggestedFix: '<!-- Use CSS classes instead:\n<div class="container">\n\n/* In CSS */\n.container { display: flex; } -->',
      });
    }

    // Missing alt on images
    if (/<img(?![^>]*\balt\s*=)[^>]*>/i.test(code)) {
      issues.push({
        id: uuidv4(),
        severity: 'medium',
        category: 'suggestion',
        title: 'Missing alt attribute on image',
        explanation: 'Images without alt attributes are inaccessible to screen readers and fail WCAG 2.1 accessibility guidelines.',
        problematicCode: code.match(/<img(?![^>]*\balt\s*=)[^>]*>/i)?.[0],
        suggestedFix: '<img src="photo.jpg" alt="Description of the image">',
      });
    }
  }

  if (language === 'c' || language === 'cpp') {
    // gets() — buffer overflow
    if (/\bgets\s*\(/.test(code)) {
      issues.push({
        id: uuidv4(),
        severity: 'critical',
        category: 'security',
        title: 'Use of dangerous gets() function',
        explanation: '`gets()` has no bounds checking and is guaranteed to cause a buffer overflow if input exceeds buffer size. It was removed from C11 and C++14 standards.',
        problematicCode: code.match(/.*gets\s*\(.*/)?.[0]?.trim(),
        suggestedFix: '// Use fgets() instead:\nfgets(buffer, sizeof(buffer), stdin);',
      });
    }

    // malloc without NULL check
    if (/malloc\s*\(/.test(code) && !/if\s*\(.*malloc/.test(code) && !/==\s*NULL/.test(code)) {
      issues.push({
        id: uuidv4(),
        severity: 'high',
        category: 'bug',
        title: 'malloc() result not checked for NULL',
        explanation: 'malloc() can return NULL if memory allocation fails. Dereferencing a NULL pointer causes undefined behavior (usually a crash).',
        problematicCode: code.match(/.*malloc\s*\(.*/)?.[0]?.trim(),
        suggestedFix: 'int *ptr = malloc(sizeof(int) * n);\nif (ptr == NULL) {\n    fprintf(stderr, "Memory allocation failed\\n");\n    exit(EXIT_FAILURE);\n}',
      });
    }
  }

  if (language === 'java') {
    // == for string comparison
    if (/[Ss]tring.*==(?!=)|==(?!=).*[Ss]tring/.test(code) || /"[^"]*"\s*==/.test(code)) {
      issues.push({
        id: uuidv4(),
        severity: 'high',
        category: 'bug',
        title: 'String comparison using == instead of .equals()',
        explanation: 'In Java, `==` compares object references, not string content. Two String objects with identical content are different references and `==` will return false.',
        suggestedFix: '// Use .equals() for string content comparison:\nif (name.equals("expected")) { ... }\n// Or equalsIgnoreCase() for case-insensitive:\nif (name.equalsIgnoreCase("Expected")) { ... }',
      });
    }

    // Empty catch block
    if (/catch\s*\([^)]+\)\s*\{\s*\}/.test(code)) {
      issues.push({
        id: uuidv4(),
        severity: 'high',
        category: 'bug',
        title: 'Empty catch block',
        explanation: 'An empty catch block silently swallows exceptions, hiding errors and making debugging impossible.',
        problematicCode: code.match(/catch\s*\([^)]+\)\s*\{\s*\}/)?.[0],
        suggestedFix: 'catch (Exception e) {\n    logger.error("Unexpected error: ", e);\n    throw new RuntimeException(e); // or handle properly\n}',
      });
    }
  }

  // If no issues found, add a positive note
  const score = calculateScore(issues);

  let summary: string;
  if (issues.length === 0) {
    summary = 'No significant issues detected in demo mode. The code appears to follow common best practices for the selected language. Note: This is a pattern-based demo analysis — enable AI mode for a comprehensive review.';
  } else {
    const critical = issues.filter(i => i.severity === 'critical').length;
    const high = issues.filter(i => i.severity === 'high').length;
    summary = `Demo analysis found ${issues.length} issue${issues.length > 1 ? 's' : ''}${critical > 0 ? ` including ${critical} critical` : ''}${high > 0 ? ` and ${high} high-severity` : ''} problem${issues.length > 1 ? 's' : ''}. Enable AI mode for deeper analysis.`;
  }

  return {
    score,
    summary,
    issues,
    language,
    timestamp: new Date().toISOString(),
    codeSnippet: code.slice(0, 200),
    mode: 'demo',
  };
}

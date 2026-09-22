import { NextRequest, NextResponse } from 'next/server';
import { runAIAnalysis, isAIAvailable } from '@/lib/ai';
import { runDemoAnalysis } from '@/lib/demo-analyzer';

export const maxDuration = 30; // Vercel function timeout

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, language } = body;

    // Input validation
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'code is required and must be a string' },
        { status: 400 }
      );
    }

    if (!language || typeof language !== 'string') {
      return NextResponse.json(
        { error: 'language is required' },
        { status: 400 }
      );
    }

    if (code.trim().length === 0) {
      return NextResponse.json(
        { error: 'Code cannot be empty' },
        { status: 400 }
      );
    }

    if (code.length > 50000) {
      return NextResponse.json(
        { error: 'Code exceeds maximum length of 50,000 characters' },
        { status: 400 }
      );
    }

    // Security: Never execute submitted code
    // Use AI analysis if API key is available, otherwise use demo analyzer
    if (isAIAvailable()) {
      try {
        const result = await runAIAnalysis(code, language);
        return NextResponse.json({ result, mode: 'ai' });
      } catch (aiError) {
        console.error('AI analysis failed, falling back to demo mode:', aiError);
        // Fallback to demo mode on AI error
        const result = runDemoAnalysis(code, language);
        return NextResponse.json({ result, mode: 'demo', fallback: true });
      }
    } else {
      const result = runDemoAnalysis(code, language);
      return NextResponse.json({ result, mode: 'demo' });
    }
  } catch (error) {
    console.error('Review API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    aiMode: isAIAvailable(),
    version: '1.0.0',
  });
}

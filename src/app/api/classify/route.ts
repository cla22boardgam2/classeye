import { NextRequest, NextResponse } from 'next/server';
import { openAIClassifyText, mockClassifyText } from '@/lib/classifier';
import { DEFAULT_APP_SETTINGS } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, students, defaultPeriod, apiKey, model, useMock } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text prompt is required' }, { status: 400 });
    }

    const key = apiKey || process.env.OPENAI_API_KEY || '';
    const selectedModel = model || 'gpt-4o-mini';

    // If no key or mock mode requested, use mock classifier
    if (!key || useMock) {
      const result = mockClassifyText(text, students || [], defaultPeriod || '수업 중');
      return NextResponse.json(result);
    }

    // Call OpenAI API
    const result = await openAIClassifyText(
      text,
      students || [],
      defaultPeriod || '수업 중',
      key,
      selectedModel
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API classify route error:', error);
    return NextResponse.json(
      { error: error.message || 'Classification failed' },
      { status: 500 }
    );
  }
}

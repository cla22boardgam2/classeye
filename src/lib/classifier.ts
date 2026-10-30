import { BehaviorRecord, Student, StandardBehaviorTag, StandardPraiseTag } from '@/types';
import { STANDARD_BEHAVIOR_TAGS, STANDARD_PRAISE_TAGS } from './constants';
import { extractPeriodFromText } from './timeHelper';

export interface ParsedItem {
  studentNumber?: number;
  studentName?: string;
  behaviorTag: string;
  rawSummary: string; // 발생 행동 상세
  actionTaken?: string; // 교사 지도 조치 내용
  period?: string;
  recordType?: 'guidance' | 'praise';
}

export interface ParseResult {
  success: boolean;
  items: ParsedItem[];
  unmatchedText?: string;
  error?: string;
}

/**
 * Extract teacher guidance action from text if mentioned
 */
function extractActionTakenFromText(text: string, isPraise: boolean = false): string {
  if (isPraise) {
    if (text.includes('도장') || text.includes('스티커')) return '칭찬 도장/스티커 부여';
    if (text.includes('칭찬함') || text.includes('칭찬했') || text.includes('칭찬')) return '학급 전체 앞 칭찬 및 격려';
    return '교사 격려 및 칭찬';
  }

  // Guidance actions
  if (text.includes('사과') || text.includes('화해')) return '친구에게 사과 및 화해 중재';
  if (text.includes('상담') || text.includes('이야기') || text.includes('면담')) return '쉬는 시간 1:1 개별 상담 및 반성';
  if (text.includes('부모') || text.includes('학부모') || text.includes('전화') || text.includes('문자') || text.includes('연락')) return '학부모 상담 연계 안내';
  if (text.includes('자리') || text.includes('이동') || text.includes('격리')) return '자리 재배치 및 격리 지도';
  if (text.includes('걷기') || text.includes('보행') || text.includes('뛰') || text.includes('달렸') || text.includes('질주')) return '보행 안전 수칙 지도 및 천천히 걷기 교육';
  if (text.includes('반성') || text.includes('생각의자') || text.includes('성찰') || text.includes('약속')) return '스스로 돌아보기 및 행동 실천 약속';
  if (text.includes('주의') || text.includes('지도') || text.includes('경고') || text.includes('타일') || text.includes('조용히')) return '구두 주의 및 학급 규칙 재교육 지도';

  return '구두 주의 및 학급 규칙 지도';
}

/**
 * Intelligent Korean keyword & rule-based classifier (Mock Parser)
 */
export function mockClassifyText(
  input: string,
  students: Student[],
  defaultPeriod: string,
  recordType: 'guidance' | 'praise' = 'guidance'
): ParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { success: false, items: [], error: '입력된 문장이 없습니다.' };
  }

  // 1. Extract Period
  const explicitPeriod = extractPeriodFromText(trimmed);
  const period = explicitPeriod || defaultPeriod;

  // 2. Identify Students mentioned in the sentence
  const detectedStudents: Student[] = [];

  // Match "X번" or "X 번"
  const numberMatches = trimmed.matchAll(/(\d{1,2})\s*번/g);
  for (const match of numberMatches) {
    const num = parseInt(match[1], 10);
    const found = students.find((s) => s.number === num);
    if (found && !detectedStudents.some((d) => d.id === found.id)) {
      detectedStudents.push(found);
    }
  }

  // Match student names directly
  for (const student of students) {
    if (student.name.length >= 2 && trimmed.includes(student.name)) {
      if (!detectedStudents.some((d) => d.id === student.id)) {
        detectedStudents.push(student);
      }
    }
  }

  // 3. Classify Tag
  let matchedTag: string = recordType === 'praise' ? '선행 및 칭찬' : '기타 지도사항';

  if (recordType === 'praise') {
    const praiseKeywords: { tag: StandardPraiseTag; keywords: string[] }[] = [
      {
        tag: '친구 배려/양보',
        keywords: ['배려', '양보', '도와', '돕', '위로', '나눔', '양보함', '도와줌'],
      },
      {
        tag: '수업 적극 참여/경청',
        keywords: ['발표', '경청', '집중', '대답', '호응', '손들고', '수업 잘'],
      },
      {
        tag: '스스로 정리정돈',
        keywords: ['정리', '정돈', '치웠', '깨끗', '사물함', '책상 정리', '쓰레기 주움'],
      },
      {
        tag: '과제/준비물 모범',
        keywords: ['과제 완벽', '숙제 잘', '준비물 잘', '모범', '학습 태도 우수'],
      },
      {
        tag: '교실 환경 봉사',
        keywords: ['봉사', '칠판', '분리수거', '우유', '환경', '솔선수범'],
      },
    ];

    for (const item of praiseKeywords) {
      if (item.keywords.some((kw) => trimmed.includes(kw))) {
        matchedTag = item.tag;
        break;
      }
    }
  } else {
    // Guidance Keywords
    const tagKeywords: { tag: StandardBehaviorTag; keywords: string[] }[] = [
      {
        tag: '복도/계단 보행 안전 위반',
        keywords: ['복도', '계단', '뛰', '달렸', '달리', '질주', '난간', '매달림', '미끄럼', '안전 위반', '넘어짐'],
      },
      {
        tag: '친구 신체 공격/다툼',
        keywords: ['때림', '때렸', '밀침', '밀쳤', '발로', '찼', '싸움', '주먹', '폭력', '꼬집', '할큄', '신체', '멱살', '다툼'],
      },
      {
        tag: '언어폭력/비속어 사용',
        keywords: ['욕', '비속어', '패드립', '쌍욕', '놀림', '비하', '나쁜 말', '모욕', '조롱', '험담', '거친 말'],
      },
      {
        tag: '수업 중 자리 이탈',
        keywords: ['자리 이탈', '자리에서', '돌아다', '교실 밖', '서성', '화장실(수업중)', '무단 이탈'],
      },
      {
        tag: '수업 방해/떠들기',
        keywords: ['떠들', '잡담', '소음', '시끄럽', '노래', '장난', '방해', '수업 중 딴짓', '수업시간에 떠'],
      },
      {
        tag: '과제/준비물 미지참',
        keywords: ['숙제', '과제', '준비물', '교과서', '필기도구', '안가져', '미제출', '미지참'],
      },
      {
        tag: '기본생활습관 미준수',
        keywords: ['새치기', '급식', '청소', '쓰레기', '투기', '정리', '지각', '실내화', '신발', '우유'],
      },
    ];

    for (const item of tagKeywords) {
      if (item.keywords.some((kw) => trimmed.includes(kw))) {
        matchedTag = item.tag;
        break;
      }
    }
  }

  // Extract action taken
  const actionTaken = extractActionTakenFromText(trimmed, recordType === 'praise');

  // Clean student number and name from beginning of sentence for clean behavior summary
  let cleanSummary = trimmed;
  cleanSummary = cleanSummary.replace(/^\d{1,2}\s*번\s*/, '');
  for (const s of detectedStudents) {
    if (cleanSummary.startsWith(s.name)) {
      cleanSummary = cleanSummary.replace(new RegExp(`^${s.name}\\s*(이가|가|이|은|는)?\\s*`), '');
    } else if (s.name.length >= 3 && cleanSummary.startsWith(s.name.slice(1))) {
      cleanSummary = cleanSummary.replace(new RegExp(`^${s.name.slice(1)}\\s*(이가|가|이|은|는)?\\s*`), '');
    }
  }
  const rawSummary = cleanSummary.trim() || trimmed;

  // 4. Return results
  if (detectedStudents.length === 0) {
    return {
      success: false,
      items: [
        {
          behaviorTag: matchedTag,
          rawSummary,
          actionTaken,
          period,
          recordType,
        },
      ],
      unmatchedText: trimmed,
      error: '학생 번호 또는 이름을 파악하지 못했습니다. 학생을 직접 선택해주세요.',
    };
  }

  const items: ParsedItem[] = detectedStudents.map((std) => ({
    studentNumber: std.number,
    studentName: std.name,
    behaviorTag: matchedTag,
    rawSummary,
    actionTaken,
    period,
    recordType,
  }));

  return {
    success: true,
    items,
  };
}

/**
 * OpenAI API Classifier using structured output
 */
export async function openAIClassifyText(
  input: string,
  students: Student[],
  defaultPeriod: string,
  apiKey: string,
  model: string = 'gpt-4o-mini',
  recordType: 'guidance' | 'praise' = 'guidance'
): Promise<ParseResult> {
  const trimmed = input.trim();
  if (!trimmed) {
    return { success: false, items: [], error: '입력된 문장이 없습니다.' };
  }

  const validTags = recordType === 'praise' 
    ? STANDARD_PRAISE_TAGS.map((t) => t.tag)
    : STANDARD_BEHAVIOR_TAGS.map((t) => t.tag);

  const studentListStr = students.map((s) => `${s.number}번: ${s.name}`).join(', ');

  const systemPrompt = `당신은 대한민국 초등학교 교사의 ${recordType === 'praise' ? '칭찬/선행' : '생활지도'} 자연어 기록을 정형화하는 AI 비서입니다.
교사가 입력한 문장을 분석하여 반드시 다음 규칙을 따라 JSON 형식으로 반환하세요.

[학급 학생 명단]
${studentListStr}

[허용된 태그 목록 - 반드시 이 중 1개로 100% 강제 매핑할 것]
${validTags.map((t) => `- "${t}"`).join('\n')}

[출력 형식]
반드시 다음 JSON 스키마를 준수하여 items 배열에 객체들을 담아 반환하세요:
{
  "items": [
    {
      "studentNumber": 숫자 (매칭된 학생 번호, 불확실하면 null),
      "studentName": 문자열 (매칭된 학생 이름, 불확실하면 null),
      "behaviorTag": 문자열 (주어진 태그 중 정확히 일치하는 하나),
      "rawSummary": 문자열 (발생 행동 요약, 예: "2교시 복도 질주"),
      "actionTaken": 문자열 (교사 지도 내용/조치 사항, 예: "보행 안전 수칙 설명 후 천천히 걷기 지도"),
      "period": 문자열 (문장에 언급된 교시 또는 "${defaultPeriod}")
    }
  ]
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: trimmed },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `API 요청 실패 (HTTP ${response.status})`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    const parsed = JSON.parse(content);

    const items: ParsedItem[] = Array.isArray(parsed.items) ? parsed.items : [parsed];
    const validItems = items.filter((item) => item.studentNumber || item.studentName).map(item => ({
      ...item,
      recordType,
    }));

    if (validItems.length === 0) {
      const firstItem = items[0] || {
        behaviorTag: validTags[0],
        rawSummary: trimmed,
        actionTaken: '교사 지도 및 주의',
        period: defaultPeriod,
        recordType,
      };
      return {
        success: false,
        items: [firstItem],
        unmatchedText: trimmed,
        error: '학생 번호 또는 이름을 파악하지 못했습니다. 학생을 직접 선택해주세요.',
      };
    }

    return {
      success: true,
      items: validItems,
    };
  } catch (error: any) {
    console.error('OpenAI classification error, falling back to mock:', error);
    const fallback = mockClassifyText(trimmed, students, defaultPeriod, recordType);
    fallback.error = `OpenAI API 오류 (${error.message || '연결 실패'}). 로컬 규칙 엔진으로 대체 분석했습니다.`;
    return fallback;
  }
}

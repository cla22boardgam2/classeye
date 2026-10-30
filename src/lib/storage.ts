import { AppSettings, BehaviorRecord, Student, StudentBehaviorCounter } from '@/types';
import { DEFAULT_APP_SETTINGS, DEFAULT_STUDENTS, STANDARD_BEHAVIOR_TAGS } from './constants';

const STORAGE_KEYS = {
  STUDENTS: 'elem_behavior_tracker_students_v1',
  RECORDS: 'elem_behavior_tracker_records_v1',
  SETTINGS: 'elem_behavior_tracker_settings_v1',
};

// Default seed records for realistic initial visualization
export const INITIAL_SAMPLE_RECORDS: BehaviorRecord[] = [
  {
    id: 'rec-1',
    studentId: 'std-3',
    studentNumber: 3,
    studentName: '김철수',
    behaviorTag: '복도/계단 보행 안전 위반',
    rawSummary: '2교시 쉬는시간 복도 전력 질주',
    actionTaken: '복도 보행 안전 수칙 설명 후 천천히 걷기 지도',
    period: '2교시',
    recordType: 'guidance',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'rec-2',
    studentId: 'std-3',
    studentNumber: 3,
    studentName: '김철수',
    behaviorTag: '복도/계단 보행 안전 위반',
    rawSummary: '점심시간 계단 난간을 잡고 뛰어내려옴',
    actionTaken: '계단 보행 안전 경고 및 1:1 주의 상담',
    period: '점심시간',
    recordType: 'guidance',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'rec-3',
    studentId: 'std-3',
    studentNumber: 3,
    studentName: '김철수',
    behaviorTag: '수업 방해/떠들기',
    rawSummary: '3교시 수학시간 짝꿍에게 계속 말걸고 소음 유발',
    actionTaken: '수업 후 짝꿍에게 사과 및 집중 약속 지도',
    period: '3교시',
    recordType: 'guidance',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'rec-4',
    studentId: 'std-3',
    studentNumber: 3,
    studentName: '김철수',
    behaviorTag: '복도/계단 보행 안전 위반',
    rawSummary: '1교시 시작 전 복도 달리기',
    actionTaken: '구두 주의 및 생각하는 의자 3분 지도',
    period: '1교시',
    recordType: 'guidance',
    timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
  {
    id: 'rec-5',
    studentId: 'std-5',
    studentNumber: 5,
    studentName: '박영희',
    behaviorTag: '수업 방해/떠들기',
    rawSummary: '4교시 국어시간에 큰 소리로 사담 나눔',
    actionTaken: '발언 신호등 약속 확인 및 조용히 듣기 지도',
    period: '4교시',
    recordType: 'guidance',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'rec-6',
    studentId: 'std-5',
    studentNumber: 5,
    studentName: '박영희',
    behaviorTag: '수업 방해/떠들기',
    rawSummary: '수업시간 소음 유발로 수업 흐름 방해',
    actionTaken: '모둠 학습 태도 점검 및 경고 부여',
    period: '2교시',
    recordType: 'guidance',
    timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    id: 'rec-7',
    studentId: 'std-1',
    studentNumber: 1,
    studentName: '강민우',
    behaviorTag: '과제/준비물 미지참',
    rawSummary: '미술 준비물(사인펜) 미지참',
    actionTaken: '학급 공용 물품 대여 및 알림장에 준비물 메모 지도',
    period: '5교시',
    recordType: 'guidance',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'rec-8',
    studentId: 'std-12',
    studentNumber: 12,
    studentName: '이동현',
    behaviorTag: '친구 신체 공격/다툼',
    rawSummary: '쉬는시간에 복도에서 친구 밀쳐 넘어뜨림',
    actionTaken: '양측 학생 분리 진술 청취, 피해 학생 위로 및 가해 학생 진심어린 사과 중재',
    period: '중간놀이/쉬는시간',
    recordType: 'guidance',
    timestamp: new Date(Date.now() - 3600000 * 26).toISOString(),
  },
  // Sample Praise records
  {
    id: 'praise-1',
    studentId: 'std-2',
    studentNumber: 2,
    studentName: '김도윤',
    behaviorTag: '친구 배려/양보',
    rawSummary: '급식실에서 줄 서다가 양보하고 친구 식판 정리 도와줌',
    actionTaken: '학급 전체 앞에서 칭찬 및 칭찬 도장 1개 부여',
    period: '점심시간',
    recordType: 'praise',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'praise-2',
    studentId: 'std-4',
    studentNumber: 4,
    studentName: '박서준',
    behaviorTag: '스스로 정리정돈',
    rawSummary: '수업 끝나고 교실 바닥 쓰레기 자발적으로 줍고 칠판 청소함',
    actionTaken: '학급 모범 학생 칭찬 및 칭찬 카드 기록',
    period: '4교시',
    recordType: 'praise',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

export function getStoredStudents(): Student[] {
  if (typeof window === 'undefined') return DEFAULT_STUDENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
      return DEFAULT_STUDENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read students from storage:', e);
    return DEFAULT_STUDENTS;
  }
}

export function saveStoredStudents(students: Student[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save students to storage:', e);
  }
}

export function getStoredRecords(): BehaviorRecord[] {
  if (typeof window === 'undefined') return INITIAL_SAMPLE_RECORDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_SAMPLE_RECORDS));
      return INITIAL_SAMPLE_RECORDS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read records from storage:', e);
    return INITIAL_SAMPLE_RECORDS;
  }
}

export function saveStoredRecords(records: BehaviorRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records to storage:', e);
  }
}

export function getStoredSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_APP_SETTINGS as AppSettings;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_APP_SETTINGS));
      return DEFAULT_APP_SETTINGS as AppSettings;
    }
    return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to read settings from storage:', e);
    return DEFAULT_APP_SETTINGS as AppSettings;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to storage:', e);
  }
}

/**
 * Calculate aggregated counter matrix for all students (filtered by recordType)
 */
export function calculateStudentCounters(
  students: Student[],
  records: BehaviorRecord[],
  recordType: 'guidance' | 'praise' = 'guidance'
): StudentBehaviorCounter[] {
  return students.map((student) => {
    const studentRecords = records.filter((r) => {
      const matchStudent = r.studentId === student.id || r.studentNumber === student.number;
      const typeMatch = recordType === 'praise' ? r.recordType === 'praise' : r.recordType !== 'praise';
      return matchStudent && typeMatch;
    });

    const byTag: Record<string, number> = {};
    for (const rec of studentRecords) {
      byTag[rec.behaviorTag] = (byTag[rec.behaviorTag] || 0) + 1;
    }

    const totalCount = studentRecords.length;

    // Get latest record
    const latestRecord = [...studentRecords].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];

    return {
      student,
      totalCount,
      byTag,
      latestRecord,
    };
  });
}

/**
 * Generate CSV text with UTF-8 BOM for Excel compatibility
 */
export function generateCSVExport(
  students: Student[],
  records: BehaviorRecord[],
  tags: string[]
): string {
  const BOM = '\uFEFF';

  // Section 1: Summary matrix
  const header1 = ['번호', '이름', '총누적지도횟수', ...tags].join(',');
  const counters = calculateStudentCounters(students, records, 'guidance');

  const rows1 = counters.map((c) => {
    const tagCols = tags.map((t) => c.byTag[t] || 0);
    return [c.student.number, `"${c.student.name}"`, c.totalCount, ...tagCols].join(',');
  });

  // Section 2: Detailed incidents log
  const header2 = ['구분', '기록일시', '교시', '학생번호', '학생이름', '행동태그', '발생행동상세', '교사지도조치내용'].join(',');
  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const rows2 = sortedRecords.map((r) => {
    return [
      `"${r.recordType === 'praise' ? '칭찬' : '지도'}"`,
      `"${r.timestamp}"`,
      `"${r.period}"`,
      r.studentNumber,
      `"${r.studentName}"`,
      `"${r.behaviorTag}"`,
      `"${(r.rawSummary || '').replace(/"/g, '""')}"`,
      `"${(r.actionTaken || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  return `${BOM}=== 학생별 행동 누적 집계 요약 ===\n${header1}\n${rows1.join('\n')}\n\n=== 상세 생활지도 기록 로그 ===\n${header2}\n${rows2.join('\n')}`;
}

/**
 * Download file helper
 */
export function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper to mask student names for Privacy Protection Mode
 * e.g., "김철수" -> "김*수", "홍길동" -> "홍*동", "이유" -> "이*"
 */
export function maskStudentName(name: string, isPrivacy: boolean): string {
  if (!isPrivacy || !name) return name;
  if (name.length <= 1) return name;
  if (name.length === 2) return name[0] + '*';
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
}

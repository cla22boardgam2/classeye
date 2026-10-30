export interface Student {
  id: string;
  number: number;
  name: string;
  seatRow?: number; // 0-indexed row in seating chart
  seatCol?: number; // 0-indexed column in seating chart
}

export type StandardBehaviorTag =
  | '복도/계단 보행 안전 위반'
  | '수업 방해/떠들기'
  | '수업 중 자리 이탈'
  | '과제/준비물 미지참'
  | '친구 신체 공격/다툼'
  | '언어폭력/비속어 사용'
  | '기본생활습관 미준수'
  | '기타 지도사항';

export type StandardPraiseTag =
  | '친구 배려/양보'
  | '수업 적극 참여/경청'
  | '스스로 정리정돈'
  | '과제/준비물 모범'
  | '교실 환경 봉사'
  | '기본생활습관 모범'
  | '선행 및 칭찬';

export interface BehaviorTagInfo {
  tag: string;
  category: 'safety' | 'disruption' | 'violence' | 'attitude' | 'general' | 'praise';
  description: string;
  defaultSeverity: 'caution' | 'warning' | 'danger';
  color: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconName: string;
}

export interface BehaviorRecord {
  id: string;
  studentId: string;
  studentNumber: number;
  studentName: string;
  behaviorTag: string;
  rawSummary: string; // 발생 행동 상세
  actionTaken?: string; // 교사 지도 내용 및 조치 사항 (예: "보행 안전 수칙 재교육 및 구두 주의")
  period: string; // e.g., '1교시', '2교시', '점심시간'
  timestamp: string; // ISO string
  recordType?: 'guidance' | 'praise'; // Default: 'guidance'
  note?: string;
}

export interface StudentBehaviorCounter {
  student: Student;
  totalCount: number;
  byTag: Record<string, number>;
  latestRecord?: BehaviorRecord;
}

export interface PeriodScheduleItem {
  periodName: string;
  startTime: string; // "09:00"
  endTime: string;   // "09:40"
}

export interface AppSettings {
  apiKey: string;
  model: string;
  useMockParser: boolean;
  thresholds: {
    caution: number; // 1~2
    warning: number; // 3~4
    danger: number;  // 5+
  };
  periodSchedule: PeriodScheduleItem[];
  customTags: string[];
}

import { BehaviorTagInfo, PeriodScheduleItem, StandardBehaviorTag, Student } from '@/types';

export const STANDARD_BEHAVIOR_TAGS: BehaviorTagInfo[] = [
  {
    tag: '복도/계단 보행 안전 위반',
    category: 'safety',
    description: '복도/계단에서 뛰기, 난간 매달리기, 미끄럼틀 타기 등 안전 수칙 위반',
    defaultSeverity: 'caution',
    color: '#f97316', // orange
    badgeBg: 'bg-orange-50 dark:bg-orange-950/40',
    badgeText: 'text-orange-700 dark:text-orange-300',
    badgeBorder: 'border-orange-200 dark:border-orange-800',
    iconName: 'Footprints',
  },
  {
    tag: '수업 방해/떠들기',
    category: 'disruption',
    description: '수업 중 잡담, 소음 유발, 짝꿍에게 장난치기 등 수업 흐름 방해',
    defaultSeverity: 'caution',
    color: '#eab308', // amber
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeBorder: 'border-amber-200 dark:border-amber-800',
    iconName: 'Volume2',
  },
  {
    tag: '수업 중 자리 이탈',
    category: 'disruption',
    description: '수업 중 허락 없이 자리에서 일어나 돌아다니거나 교실 밖으로 나감',
    defaultSeverity: 'caution',
    color: '#8b5cf6', // purple
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
    badgeText: 'text-purple-700 dark:text-purple-300',
    badgeBorder: 'border-purple-200 dark:border-purple-800',
    iconName: 'UserMinus',
  },
  {
    tag: '과제/준비물 미지참',
    category: 'attitude',
    description: '교과서, 학습 준비물, 숙제 등을 지속적으로 가져오지 않음',
    defaultSeverity: 'caution',
    color: '#06b6d4', // cyan
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/40',
    badgeText: 'text-cyan-700 dark:text-cyan-300',
    badgeBorder: 'border-cyan-200 dark:border-cyan-800',
    iconName: 'BookX',
  },
  {
    tag: '친구 신체 공격/다툼',
    category: 'violence',
    description: '친구를 때리거나 밀치기, 발로 차기, 꼬집기, 몸싸움 등 신체적 접촉 폭력',
    defaultSeverity: 'danger',
    color: '#ef4444', // red
    badgeBg: 'bg-red-50 dark:bg-red-950/40',
    badgeText: 'text-red-700 dark:text-red-300',
    badgeBorder: 'border-red-200 dark:border-red-800',
    iconName: 'ShieldAlert',
  },
  {
    tag: '언어폭력/비속어 사용',
    category: 'violence',
    description: '친구에게 욕설, 험담, 비하 발언, 모욕적 별명 부르기 등 언어적 가해',
    defaultSeverity: 'danger',
    color: '#ec4899', // pink
    badgeBg: 'bg-pink-50 dark:bg-pink-950/40',
    badgeText: 'text-pink-700 dark:text-pink-300',
    badgeBorder: 'border-pink-200 dark:border-pink-800',
    iconName: 'MessageSquareWarning',
  },
  {
    tag: '기본생활습관 미준수',
    category: 'attitude',
    description: '급식실 새치기, 청소 불참, 교실/복도 쓰레기 투기, 실내화 미착용 등',
    defaultSeverity: 'caution',
    color: '#10b981', // emerald
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgeBorder: 'border-emerald-200 dark:border-emerald-800',
    iconName: 'Sparkles',
  },
  {
    tag: '기타 지도사항',
    category: 'general',
    description: '위 분류에 속하지 않는 일반적인 교사 지도 및 훈계 사항',
    defaultSeverity: 'caution',
    color: '#64748b', // slate
    badgeBg: 'bg-slate-50 dark:bg-slate-900/40',
    badgeText: 'text-slate-700 dark:text-slate-300',
    badgeBorder: 'border-slate-200 dark:border-slate-800',
    iconName: 'HelpCircle',
  },
];

export const STANDARD_PRAISE_TAGS: BehaviorTagInfo[] = [
  {
    tag: '친구 배려/양보',
    category: 'praise',
    description: '어려운 친구를 돕거나 놀이 및 줄서기에서 배려와 양보를 실천함',
    defaultSeverity: 'caution',
    color: '#10b981', // emerald
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgeBorder: 'border-emerald-200 dark:border-emerald-800',
    iconName: 'Sparkles',
  },
  {
    tag: '수업 적극 참여/경청',
    category: 'praise',
    description: '수업 시간에 선생님과 친구들의 말에 경청하고 훌륭하게 발표함',
    defaultSeverity: 'caution',
    color: '#3b82f6', // blue
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
    badgeText: 'text-blue-700 dark:text-blue-300',
    badgeBorder: 'border-blue-200 dark:border-blue-800',
    iconName: 'Volume2',
  },
  {
    tag: '스스로 정리정돈',
    category: 'praise',
    description: '자신의 자리와 주변 사물함을 솔선수범하여 깨끗이 정돈함',
    defaultSeverity: 'caution',
    color: '#8b5cf6', // purple
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
    badgeText: 'text-purple-700 dark:text-purple-300',
    badgeBorder: 'border-purple-200 dark:border-purple-800',
    iconName: 'Sparkles',
  },
  {
    tag: '과제/준비물 모범',
    category: 'praise',
    description: '모든 수업 과제와 준비물을 완벽하게 챙겨 성실히 학습함',
    defaultSeverity: 'caution',
    color: '#06b6d4', // cyan
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/40',
    badgeText: 'text-cyan-700 dark:text-cyan-300',
    badgeBorder: 'border-cyan-200 dark:border-cyan-800',
    iconName: 'BookX',
  },
  {
    tag: '교실 환경 봉사',
    category: 'praise',
    description: '청소 구역 외에도 쓰레기를 줍거나 칠판을 닦는 등 학급을 위해 헌신함',
    defaultSeverity: 'caution',
    color: '#f59e0b', // amber
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeBorder: 'border-amber-200 dark:border-amber-800',
    iconName: 'Sparkles',
  },
  {
    tag: '선행 및 칭찬',
    category: 'praise',
    description: '기타 칭찬할 만한 훌륭한 선행 및 바른 언어생활 실천',
    defaultSeverity: 'caution',
    color: '#ec4899', // pink
    badgeBg: 'bg-pink-50 dark:bg-pink-950/40',
    badgeText: 'text-pink-700 dark:text-pink-300',
    badgeBorder: 'border-pink-200 dark:border-pink-800',
    iconName: 'Sparkles',
  },
];

export const COMMON_GUIDANCE_ACTIONS: string[] = [
  '구두 주의 및 규칙 재교육',
  '복도 보행 안전 수칙 설명 후 걷기 실천',
  '친구에게 사과 및 상호 화해 지도',
  '쉬는 시간 1:1 개별 상담 및 이유 청취',
  '생각하는 의자 / 성찰의 시간 부여',
  '자리 재배치 및 분리 지도',
  '학부모 유선 상담 및 가정 연계 요청',
  '반성문 작성 및 자기 점검표 작성',
];

export const DEFAULT_PERIOD_SCHEDULE: PeriodScheduleItem[] = [
  { periodName: '아침 자습', startTime: '08:40', endTime: '09:00' },
  { periodName: '1교시', startTime: '09:00', endTime: '09:40' },
  { periodName: '1-2교시 쉬는시간', startTime: '09:40', endTime: '09:50' },
  { periodName: '2교시', startTime: '09:50', endTime: '10:30' },
  { periodName: '중간놀이/쉬는시간', startTime: '10:30', endTime: '10:50' },
  { periodName: '3교시', startTime: '10:50', endTime: '11:30' },
  { periodName: '3-4교시 쉬는시간', startTime: '11:30', endTime: '11:40' },
  { periodName: '4교시', startTime: '11:40', endTime: '12:20' },
  { periodName: '점심시간', startTime: '12:20', endTime: '13:10' },
  { periodName: '5교시', startTime: '13:10', endTime: '13:50' },
  { periodName: '5-6교시 쉬는시간', startTime: '13:50', endTime: '14:00' },
  { periodName: '6교시', startTime: '14:00', endTime: '14:40' },
  { periodName: '방과후/하교', startTime: '14:40', endTime: '17:00' },
];

// 4 rows x 5 columns default seating layout
export const DEFAULT_STUDENTS: Student[] = [
  { id: 'std-1', number: 1, name: '강민우', seatRow: 0, seatCol: 0 },
  { id: 'std-2', number: 2, name: '김도윤', seatRow: 0, seatCol: 1 },
  { id: 'std-3', number: 3, name: '김철수', seatRow: 0, seatCol: 2 },
  { id: 'std-4', number: 4, name: '박서준', seatRow: 0, seatCol: 3 },
  { id: 'std-5', number: 5, name: '박영희', seatRow: 0, seatCol: 4 },
  { id: 'std-6', number: 6, name: '배수진', seatRow: 1, seatCol: 0 },
  { id: 'std-7', number: 7, name: '송지호', seatRow: 1, seatCol: 1 },
  { id: 'std-8', number: 8, name: '신유나', seatRow: 1, seatCol: 2 },
  { id: 'std-9', number: 9, name: '안재현', seatRow: 1, seatCol: 3 },
  { id: 'std-10', number: 10, name: '오하은', seatRow: 1, seatCol: 4 },
  { id: 'std-11', number: 11, name: '윤시우', seatRow: 2, seatCol: 0 },
  { id: 'std-12', number: 12, name: '이동현', seatRow: 2, seatCol: 1 },
  { id: 'std-13', number: 13, name: '이서연', seatRow: 2, seatCol: 2 },
  { id: 'std-14', number: 14, name: '임예준', seatRow: 2, seatCol: 3 },
  { id: 'std-15', number: 15, name: '장민서', seatRow: 2, seatCol: 4 },
  { id: 'std-16', number: 16, name: '정우진', seatRow: 3, seatCol: 0 },
  { id: 'std-17', number: 17, name: '조유빈', seatRow: 3, seatCol: 1 },
  { id: 'std-18', number: 18, name: '최지우', seatRow: 3, seatCol: 2 },
  { id: 'std-19', number: 19, name: '한가온', seatRow: 3, seatCol: 3 },
  { id: 'std-20', number: 20, name: '황보람', seatRow: 3, seatCol: 4 },
];

export const DEFAULT_APP_SETTINGS = {
  apiKey: '',
  model: 'gpt-4o-mini',
  useMockParser: true,
  thresholds: {
    caution: 2, // 1~2회: 블루/그린
    warning: 4, // 3~4회: 오렌지
    danger: 5,  // 5회 이상: 레드
  },
  periodSchedule: DEFAULT_PERIOD_SCHEDULE,
  customTags: [],
};

'use client';

import React, { useState, useMemo } from 'react';
import { X, Check, MessageSquareWarning, Sparkles } from './icons';
import { BehaviorRecord, Student, StudentBehaviorCounter } from '@/types';

interface ParentMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  counter: StudentBehaviorCounter | null;
  records: BehaviorRecord[];
}

export const ParentMessageModal: React.FC<ParentMessageModalProps> = ({
  isOpen,
  onClose,
  student,
  counter,
  records,
}) => {
  const [tone, setTone] = useState<'gentle' | 'formal' | 'urgent'>('gentle');
  const [copied, setCopied] = useState(false);

  // Student specific records
  const studentRecords = useMemo(() => {
    if (!student) return [];
    return records
      .filter((r) => r.studentId === student.id || r.studentNumber === student.number)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [records, student]);

  // Generate SMS Draft Text based on tone and live records
  const messageDraft = useMemo(() => {
    if (!student || !counter) return '';

    const total = counter.totalCount;
    const tagSummary = Object.entries(counter.byTag)
      .filter(([_, count]) => count > 0)
      .map(([tag, count]) => `${tag} ${count}회`)
      .join(', ');

    // Recent actions taken
    const recentActions = studentRecords
      .slice(0, 3)
      .map((r) => `- [${r.period}] ${r.rawSummary} (${r.actionTaken || '규칙 재안내 및 지도'})`)
      .join('\n');

    if (tone === 'gentle') {
      return `[생활지도 및 학교생활 안내]

안녕하세요, ${student.name} 학부모님.
담임교사입니다. 늘 학급 교육활동에 따뜻한 관심 보내주셔서 감사드립니다.

다름이 아니라 학교에서 ${student.name}가 더욱 안전하고 즐겁게 생활할 수 있도록 가정과 연계하여 안내드리고자 연락드렸습니다.

최근 학교 생활 중 다음과 같은 지도가 있었습니다:
• 누적 지도 현황: ${tagSummary || '안전 및 기본생활습관 지도'} (총 ${total}회)
• 최근 주요 지도 사항:
${recentActions}

학교에서는 아이의 눈높이에 맞추어 규칙을 차근차근 다시 설명하고 바른 행동을 약속하였습니다. 가정에서도 ${student.name}와 편안한 시간에 대화 나누어 주시며 따뜻한 격려와 지도 부탁드립니다.

궁금하신 점이나 상담이 필요하시면 편히 말씀해 주세요. 감사합니다.`;
    }

    if (tone === 'formal') {
      return `[초등학교 학생 생활지도 관련 가정 연계 안내]

안녕하십니까, ${student.name} 학생 보호자님.
담임교사입니다.

학교생활 규칙 준수 및 학생의 안전한 학교생활을 위해 최근 교내 지도 사항을 공유해 드립니다.

1. 학생 정보: ${student.number}번 ${student.name}
2. 주요 지도 사유: ${tagSummary || '학급 규칙 위반'} (누적 ${total}회)
3. 최근 지도 내역:
${recentActions}
4. 학교 조치 사항: 학급 안전 수칙 재교육 및 구두 주의, 실천 약속 지도

원활한 기본생활습관 형성을 위해 가정에서도 지도 사항을 함께 확인해 주시기를 당부드립니다. 학생의 변화와 성장을 위해 최선을 다해 지도하겠습니다.`;
    }

    // Urgent / Request Consultation
    return `[생활지도 관련 학부모 상담 요청 안내]

안녕하십니까, ${student.name} 학부모님. 담임교사입니다.

최근 학교 생활 중 ${student.name}의 지속적인 지도 사항(${tagSummary}, 총 ${total}회)과 관련하여, 안전사고 예방과 원만한 학급 생활을 위해 학부모님과 유선 또는 대면 상담을 나누고자 합니다.

• 최근 발생 사항:
${recentActions}

반복적인 행동의 원인을 함께 파악하고 아이에게 가장 도움이 되는 지도 방안을 논의하고자 하오니, 상담 가능하신 시간대(방과 후 등)를 회신해 주시면 감사하겠습니다.`;
  }, [student, counter, studentRecords, tone]);

  if (!isOpen || !student) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <MessageSquareWarning size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {student.name} 학생 학부모 상담 문자 초안 생성
              </h3>
              <p className="text-xs text-slate-400">
                실제 누적 데이터와 교사 지도 내용을 바탕으로 정중한 문자 초안을 작성합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tone Selector */}
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">문구 어조 선택:</span>
          <button
            type="button"
            onClick={() => setTone('gentle')}
            className={`rounded-xl px-3 py-1.5 font-bold transition-all ${
              tone === 'gentle'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            🌱 따뜻하고 정중한 안내
          </button>
          <button
            type="button"
            onClick={() => setTone('formal')}
            className={`rounded-xl px-3 py-1.5 font-bold transition-all ${
              tone === 'formal'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            📑 객관적 공식 서식
          </button>
          <button
            type="button"
            onClick={() => setTone('urgent')}
            className={`rounded-xl px-3 py-1.5 font-bold transition-all ${
              tone === 'urgent'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            ⚠️ 상담 일정 요청용
          </button>
        </div>

        {/* Message Preview Box */}
        <div className="mt-4 flex-1 overflow-y-auto">
          <textarea
            readOnly
            value={messageDraft}
            rows={12}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-sans text-xs leading-relaxed text-slate-800 focus:outline-none dark:border-slate-800 dark:bg-slate-850 dark:text-slate-200 resize-none select-all"
          />
        </div>

        {/* Footer Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-800 text-xs">
          <span className="text-slate-400">
            💡 하단 복사 버튼을 누른 후 문자 또는 학교 알림장 앱에 붙여넣으세요.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 font-semibold"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white hover:bg-indigo-700 shadow-md active:scale-95 transition-all"
            >
              {copied ? (
                <>
                  <Check size={14} />
                  <span>복사 완료!</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>문자 내용 복사하기</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

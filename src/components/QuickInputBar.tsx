'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Clock, RefreshCw, AlertTriangle, Undo2, Check, Calendar } from './icons';
import { AppSettings, BehaviorRecord, Student } from '@/types';
import {
  getCurrentPeriodFromSchedule,
  getKoreanDateString,
  getYesterdayDateString,
  extractDateFromText,
  formatKoreanOnlyDate,
} from '@/lib/timeHelper';
import { mockClassifyText, openAIClassifyText, ParseResult } from '@/lib/classifier';
import { COMMON_GUIDANCE_ACTIONS } from '@/lib/constants';

interface QuickInputBarProps {
  students: Student[];
  settings: AppSettings;
  onRecordsAdded: (records: BehaviorRecord[]) => void;
  onUndoLastRecord?: () => void;
  canUndo?: boolean;
  onUnmatched: (unmatchedResult: { rawText: string; behaviorTag: string; period: string }) => void;
  studentCountersMap: Record<string, Record<string, number>>; // studentId -> { tag: count }
  appMode?: 'guidance' | 'praise';
}

export const QuickInputBar: React.FC<QuickInputBarProps> = ({
  students,
  settings,
  onRecordsAdded,
  onUndoLastRecord,
  canUndo = false,
  onUnmatched,
  studentCountersMap,
  appMode = 'guidance',
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedActionTaken, setSelectedActionTaken] = useState<string>('');
  const [recordDate, setRecordDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAutoPeriod, setCurrentAutoPeriod] = useState('수업 중');
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    subText?: string;
    type: 'success' | 'warning' | 'error';
    recordIds?: string[];
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Set today's date on mount
  useEffect(() => {
    setRecordDate(getKoreanDateString(new Date()));
  }, []);

  // Update current period dynamically
  useEffect(() => {
    const updatePeriod = () => {
      const p = getCurrentPeriodFromSchedule(settings.periodSchedule);
      setCurrentAutoPeriod(p);
    };
    updatePeriod();
    const interval = setInterval(updatePeriod, 60000);
    return () => clearInterval(interval);
  }, [settings.periodSchedule]);

  const activePeriod = selectedPeriod || currentAutoPeriod;

  // Auto dismiss toast after 6 seconds
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isSubmitting) return;

    setIsSubmitting(true);

    try {
      let result: ParseResult;

      // Extract date from text if mentioned (e.g. "어제 3번 철수 복도에서 뜀", "10월 28일 5번 영희...")
      const { dateStr: naturalDate, cleanText } = extractDateFromText(text);
      const effectiveDate = naturalDate || recordDate;
      const textToClassify = cleanText || text;

      if (!settings.useMockParser && settings.apiKey) {
        result = await openAIClassifyText(
          textToClassify,
          students,
          activePeriod,
          settings.apiKey,
          settings.model,
          appMode
        );
      } else {
        result = mockClassifyText(textToClassify, students, activePeriod, appMode);
      }

      if (!result.success || result.items.length === 0) {
        const firstItem = result.items[0];
        onUnmatched({
          rawText: text,
          behaviorTag: firstItem?.behaviorTag || (appMode === 'praise' ? '선행 및 칭찬' : '기타 지도사항'),
          period: firstItem?.period || activePeriod,
        });
        setToastMessage({
          text: '학생 정보를 특정하지 못했습니다.',
          subText: '아래 팝업에서 학생을 직접 선택해주세요.',
          type: 'warning',
        });
        setIsSubmitting(false);
        return;
      }

      // Map parsed items into full BehaviorRecords
      const newRecords: BehaviorRecord[] = [];
      const toastAnnouncements: string[] = [];

      // Calculate effective timestamp
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      let effectiveTimestamp = new Date().toISOString();
      try {
        effectiveTimestamp = new Date(`${effectiveDate}T${timeStr}`).toISOString();
      } catch (e) {
        effectiveTimestamp = new Date().toISOString();
      }

      for (const item of result.items) {
        let matchedStudent: Student | undefined;
        if (item.studentNumber) {
          matchedStudent = students.find((s) => s.number === item.studentNumber);
        }
        if (!matchedStudent && item.studentName) {
          matchedStudent = students.find((s) => s.name === item.studentName);
        }

        if (matchedStudent) {
          const rec: BehaviorRecord = {
            id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            studentId: matchedStudent.id,
            studentNumber: matchedStudent.number,
            studentName: matchedStudent.name,
            behaviorTag: item.behaviorTag,
            rawSummary: item.rawSummary || textToClassify,
            actionTaken: selectedActionTaken || item.actionTaken || (appMode === 'praise' ? '교사 칭찬 및 격려' : '구두 주의 및 규칙 지도'),
            period: item.period || activePeriod,
            recordType: appMode,
            timestamp: effectiveTimestamp,
          };
          newRecords.push(rec);

          const currentCount =
            (studentCountersMap[matchedStudent.id]?.[item.behaviorTag] || 0) + 1;

          const isToday = effectiveDate === getKoreanDateString(new Date());
          const datePrefix = isToday ? '' : `[${effectiveDate}] `;

          toastAnnouncements.push(
            `${datePrefix}${matchedStudent.name} - [${item.behaviorTag}] 누적 ${currentCount}회째 기록되었습니다.`
          );
        }
      }

      if (newRecords.length > 0) {
        onRecordsAdded(newRecords);
        setInputText('');
        setSelectedActionTaken('');
        const actionDetails = newRecords
          .map((r) => `${r.studentName}: 지도조치 [${r.actionTaken}]`)
          .join(' | ');
        setToastMessage({
          text: toastAnnouncements.join(' | '),
          subText: actionDetails,
          type: 'success',
          recordIds: newRecords.map((r) => r.id),
        });
        if (inputRef.current) {
          inputRef.current.focus();
        }
      } else {
        onUnmatched({
          rawText: text,
          behaviorTag: result.items[0]?.behaviorTag || '기타 지도사항',
          period: activePeriod,
        });
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      setToastMessage({
        text: '기록 처리 중 오류가 발생했습니다.',
        subText: err.message || '다시 시도해 주세요.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickPeriodChips = ['1교시', '2교시', '3교시', '4교시', '점심시간', '5교시', '6교시', '쉬는시간'];

  return (
    <div className="relative w-full">
      {/* Container */}
      <div
        className={`rounded-2xl border p-4 shadow-lg backdrop-blur-md transition-all ${
          appMode === 'praise'
            ? 'border-emerald-200/90 bg-emerald-50/20 shadow-emerald-500/5 dark:border-emerald-900/60 dark:bg-emerald-950/20'
            : 'border-slate-200/80 bg-white/95 shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/95'
        }`}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Header row with Date selector, Period badge & Quick Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
            {/* Left side: Date Picker & Period Badge */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {/* Record Date Picker */}
              <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  <Calendar size={13} className="text-indigo-500" />
                  기록 날짜:
                </span>
                <input
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-0.5 text-xs font-bold text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setRecordDate(getKoreanDateString(new Date()))}
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                    recordDate === getKoreanDateString(new Date())
                      ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  오늘
                </button>
                <button
                  type="button"
                  onClick={() => setRecordDate(getYesterdayDateString())}
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                    recordDate === getYesterdayDateString()
                      ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  어제
                </button>
              </div>

              {/* Period Badge */}
              <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  <Clock size={13} className={appMode === 'praise' ? 'text-emerald-500' : 'text-orange-500'} />
                  교시:
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 font-bold whitespace-nowrap ${
                    appMode === 'praise'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                  }`}
                >
                  {activePeriod}
                </span>
                {selectedPeriod && (
                  <button
                    type="button"
                    onClick={() => setSelectedPeriod(null)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline whitespace-nowrap"
                  >
                    현재 시간 리셋
                  </button>
                )}
              </div>
            </div>

            {/* Quick Period Selector Chips */}
            <div className="flex flex-wrap items-center gap-1 shrink-0">
              <span className="text-slate-400 whitespace-nowrap text-[11px]">교시 직접지정:</span>
              {quickPeriodChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setSelectedPeriod(selectedPeriod === chip ? null : chip)}
                  className={`rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedPeriod === chip
                      ? appMode === 'praise'
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'bg-orange-500 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Natural Language Input Field & Record Button */}
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-3.5 text-slate-400">
              <Sparkles
                size={18}
                className={appMode === 'praise' ? 'text-emerald-500 animate-pulse' : 'text-orange-500 animate-pulse'}
              />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                appMode === 'praise'
                  ? '예: "2번 도윤이 점심시간에 친구 식판 정리 도와줌" 또는 "4번 서준이 교실 바닥 쓰레기 자발적으로 주움"'
                  : '예: "3번 김철수 2교시에 복도에서 뛰어서 보행 안전 수칙 지도함" 또는 "5번 영희 수업시간에 짝꿍이랑 떠들어서 구두 주의 줌"'
              }
              disabled={isSubmitting}
              className={`w-full rounded-xl border bg-slate-50/50 py-3.5 pr-28 pl-11 text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-4 focus:outline-none dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:bg-slate-800 transition-all ${
                appMode === 'praise'
                  ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-emerald-700'
                  : 'border-slate-300 focus:border-orange-500 focus:ring-orange-500/10 dark:border-slate-700'
              }`}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSubmitting}
              className={`absolute right-2 flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white shadow-md disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-all ${
                appMode === 'praise'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>분석 중...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>{appMode === 'praise' ? '칭찬 기록' : '지도 기록'}</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Guidance Action Tag Selector */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
              {appMode === 'praise' ? '🌟 칭찬 조치(선택):' : '🛡️ 교사 지도 조치(선택):'}
            </span>
            {appMode === 'guidance' ? (
              <>
                {COMMON_GUIDANCE_ACTIONS.map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() =>
                      setSelectedActionTaken(selectedActionTaken === action ? '' : action)
                    }
                    className={`rounded-lg px-2 py-0.5 text-[11px] font-medium whitespace-nowrap transition-all ${
                      selectedActionTaken === action
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {action}
                  </button>
                ))}
                {selectedActionTaken && (
                  <button
                    type="button"
                    onClick={() => setSelectedActionTaken('')}
                    className="text-[11px] text-rose-500 hover:underline font-bold ml-1"
                  >
                    ✕ 선택 해제
                  </button>
                )}
              </>
            ) : (
              <>
                {['칭찬 도장/스티커 부여', '학급 전체 앞 칭찬 및 박수', '칭찬 카드 작성 및 격려'].map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() =>
                      setSelectedActionTaken(selectedActionTaken === action ? '' : action)
                    }
                    className={`rounded-lg px-2 py-0.5 text-[11px] font-medium whitespace-nowrap transition-all ${
                      selectedActionTaken === action
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'bg-emerald-100/70 text-emerald-800 hover:bg-emerald-200/80 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {action}
                  </button>
                ))}
                {selectedActionTaken && (
                  <button
                    type="button"
                    onClick={() => setSelectedActionTaken('')}
                    className="text-[11px] text-rose-500 hover:underline font-bold ml-1"
                  >
                    ✕ 선택 해제
                  </button>
                )}
              </>
            )}
          </div>

          {/* Guidance Hints */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 dark:text-slate-500">
            <span>
              💡 학생 번호나 이름을 포함해 말하듯이 자유롭게 적으면 AI가 행동과 지도 내용을 자동 정형화합니다.
            </span>
            <span>엔터(Enter) 키로 즉시 전송</span>
          </div>
        </form>
      </div>

      {/* Instant Toast Notification with Undo */}
      {toastMessage && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/95 px-4 py-3 text-sm text-emerald-900 shadow-lg backdrop-blur-md dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-100 transition-all animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check size={14} />
            </div>
            <div>
              <p className="font-bold">{toastMessage.text}</p>
              {toastMessage.subText && (
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  {toastMessage.subText}
                </p>
              )}
            </div>
          </div>

          {canUndo && onUndoLastRecord && (
            <button
              type="button"
              onClick={() => {
                onUndoLastRecord();
                setToastMessage(null);
              }}
              className="flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 shadow-xs dark:border-emerald-700 dark:bg-emerald-900 dark:text-emerald-100 dark:hover:bg-emerald-800 transition-colors"
            >
              <Undo2 size={14} />
              <span>실행 취소 (Undo)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

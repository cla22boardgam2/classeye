'use client';

import React from 'react';
import { Plus, Minus, ChevronRight, AlertTriangle, getBehaviorIcon, Sparkles } from './icons';
import { AppSettings, BehaviorTagInfo, StudentBehaviorCounter } from '@/types';
import { STANDARD_BEHAVIOR_TAGS, STANDARD_PRAISE_TAGS } from '@/lib/constants';
import { maskStudentName } from '@/lib/storage';

interface StudentCardProps {
  counter: StudentBehaviorCounter;
  settings: AppSettings;
  onOpenDetail: (studentId: string, preselectedTag?: string) => void;
  onAdjustCount: (studentId: string, behaviorTag: string, delta: number) => void;
  isPrivacyMode?: boolean;
  appMode?: 'guidance' | 'praise';
}

export const StudentCard: React.FC<StudentCardProps> = ({
  counter,
  settings,
  onOpenDetail,
  onAdjustCount,
  isPrivacyMode = false,
  appMode = 'guidance',
}) => {
  const { student, totalCount, byTag, latestRecord } = counter;

  // Determine card warning level based on thresholds
  const isDanger = appMode === 'guidance' && totalCount >= settings.thresholds.danger;
  const isWarning = appMode === 'guidance' && !isDanger && totalCount >= settings.thresholds.warning;
  const isCaution = appMode === 'guidance' && !isDanger && !isWarning && totalCount > 0;

  // Border & Glow styling
  let borderStyle =
    'border-slate-200/80 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700';
  let totalBadgeStyle =
    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';

  if (appMode === 'praise') {
    if (totalCount > 0) {
      borderStyle =
        'border-emerald-300/80 bg-emerald-50/20 shadow-xs hover:border-emerald-400 dark:border-emerald-900 dark:bg-emerald-950/20';
      totalBadgeStyle = 'bg-emerald-500 text-white font-bold shadow-2xs';
    }
  } else {
    if (isDanger) {
      borderStyle =
        'border-rose-300 bg-rose-50/20 shadow-md shadow-rose-500/10 hover:border-rose-400 dark:border-rose-900 dark:bg-rose-950/20';
      totalBadgeStyle =
        'bg-rose-500 text-white shadow-xs animate-pulse font-bold';
    } else if (isWarning) {
      borderStyle =
        'border-amber-300 bg-amber-50/20 shadow-xs hover:border-amber-400 dark:border-amber-900 dark:bg-amber-950/20';
      totalBadgeStyle =
        'bg-amber-500 text-white font-bold';
    } else if (isCaution) {
      totalBadgeStyle =
        'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold';
    }
  }

  // Active tags dictionary
  const availableTags = appMode === 'praise' ? STANDARD_PRAISE_TAGS : STANDARD_BEHAVIOR_TAGS;

  const activeTags = Object.entries(byTag)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  const displayName = maskStudentName(student.name, isPrivacyMode);

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border p-4 shadow-xs transition-all duration-200 hover:shadow-md ${borderStyle}`}
    >
      <div>
        {/* Card Header: Number, Name, Total Count */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800/80">
          <div
            onClick={() => onOpenDetail(student.id)}
            className="flex cursor-pointer items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-xs dark:bg-slate-100 dark:text-slate-900">
              {student.number}
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {displayName}
                </h3>
                {isDanger && (
                  <span title="상담 필요 (누적 5회 이상)">
                    <AlertTriangle size={15} className="text-rose-500" />
                  </span>
                )}
                {appMode === 'praise' && totalCount >= 3 && (
                  <span title="칭찬 우수 학생">
                    <Sparkles size={14} className="text-amber-500" />
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400">
                {latestRecord ? `최근: ${latestRecord.period}` : '기록 없음'}
              </span>
            </div>
          </div>

          {/* Total Count Badge */}
          <button
            type="button"
            onClick={() => onOpenDetail(student.id)}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs whitespace-nowrap shrink-0 transition-all ${totalBadgeStyle}`}
            title="클릭하여 학생 기록 타임라인 보기"
          >
            <span className="whitespace-nowrap">{appMode === 'praise' ? '칭찬' : '누적'}</span>
            <span className="font-black text-sm">{totalCount}</span>
            <span className="whitespace-nowrap">회</span>
          </button>
        </div>

        {/* Card Body: Tag Badges with Counts & Quick + / - Adjusters */}
        <div className="mt-3 flex flex-col gap-2">
          {activeTags.length === 0 ? (
            <div
              onClick={() => onOpenDetail(student.id)}
              className="flex h-20 cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-xs text-slate-400 hover:bg-slate-100/50 dark:border-slate-800 dark:bg-slate-850/50"
            >
              {appMode === 'praise' ? '칭찬 기록이 없습니다' : '지도 기록이 없습니다'}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {activeTags.map(([tag, count]) => {
                const tagInfo = availableTags.find((t) => t.tag === tag);

                // Warning badge styles
                const isTagDanger = appMode === 'guidance' && count >= settings.thresholds.danger;
                const isTagWarning = appMode === 'guidance' && !isTagDanger && count >= settings.thresholds.warning;

                let badgeColor =
                  tagInfo?.badgeBg || 'bg-slate-100 dark:bg-slate-800';
                let textColor =
                  tagInfo?.badgeText || 'text-slate-700 dark:text-slate-300';
                let borderColor =
                  tagInfo?.badgeBorder || 'border-slate-200 dark:border-slate-700';

                if (appMode === 'praise') {
                  badgeColor = 'bg-emerald-50 dark:bg-emerald-950/40';
                  textColor = 'text-emerald-800 dark:text-emerald-200';
                  borderColor = 'border-emerald-200 dark:border-emerald-800';
                } else if (isTagDanger) {
                  badgeColor = 'bg-rose-100 dark:bg-rose-950/60';
                  textColor = 'text-rose-800 dark:text-rose-200';
                  borderColor = 'border-rose-300 dark:border-rose-800';
                } else if (isTagWarning) {
                  badgeColor = 'bg-amber-100 dark:bg-amber-950/60';
                  textColor = 'text-amber-800 dark:text-amber-200';
                  borderColor = 'border-amber-300 dark:border-amber-800';
                }

                return (
                  <div
                    key={tag}
                    className={`group/tag flex items-center justify-between rounded-xl border px-2.5 py-1.5 text-xs transition-all ${badgeColor} ${borderColor}`}
                  >
                    {/* Tag Label & Count */}
                    <div
                      onClick={() => onOpenDetail(student.id, tag)}
                      className="flex cursor-pointer items-center gap-1.5 truncate pr-2 hover:opacity-80"
                      title="클릭하여 이 행동의 상세 기록 보기"
                    >
                      <span className="shrink-0 text-slate-500">
                        {getBehaviorIcon(tagInfo?.iconName || '', { size: 14 })}
                      </span>
                      <span className={`font-semibold truncate whitespace-nowrap ${textColor}`}>
                        {tag}
                      </span>
                    </div>

                    {/* Count & Quick + / - Adjusters */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Count pill */}
                      <span
                        onClick={() => onOpenDetail(student.id, tag)}
                        className={`cursor-pointer rounded-md px-1.5 py-0.5 text-xs font-black shadow-2xs whitespace-nowrap ${
                          appMode === 'praise'
                            ? 'bg-emerald-600 text-white'
                            : isTagDanger
                            ? 'bg-rose-500 text-white'
                            : isTagWarning
                            ? 'bg-amber-500 text-white'
                            : 'bg-white text-slate-800 dark:bg-slate-700 dark:text-white'
                        }`}
                      >
                        {count}회
                      </span>

                      {/* Quick Adjust Buttons */}
                      <div className="flex items-center opacity-40 group-hover/tag:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAdjustCount(student.id, tag, -1);
                          }}
                          className="rounded-l border-y border-l border-slate-300 bg-white p-1 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          title="1회 차감 (-1)"
                        >
                          <Minus size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAdjustCount(student.id, tag, 1);
                          }}
                          className="rounded-r border border-slate-300 bg-white p-1 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          title="1회 추가 (+1)"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Detail Link */}
      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <button
          type="button"
          onClick={() => onOpenDetail(student.id)}
          className="flex items-center gap-1 font-semibold text-slate-600 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 transition-colors"
        >
          <span>{appMode === 'praise' ? '칭찬 타임라인' : '상담 근거 타임라인'}</span>
          <ChevronRight size={13} />
        </button>

        <button
          type="button"
          onClick={() => onOpenDetail(student.id)}
          className="rounded px-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          기록 추가 +
        </button>
      </div>
    </div>
  );
};

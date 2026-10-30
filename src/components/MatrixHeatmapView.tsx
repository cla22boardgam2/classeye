'use client';

import React from 'react';
import { AppSettings, StudentBehaviorCounter } from '@/types';
import { STANDARD_BEHAVIOR_TAGS, STANDARD_PRAISE_TAGS } from '@/lib/constants';
import { getBehaviorIcon, ChevronRight } from './icons';
import { maskStudentName } from '@/lib/storage';

interface MatrixHeatmapViewProps {
  counters: StudentBehaviorCounter[];
  settings: AppSettings;
  onOpenDetail: (studentId: string, preselectedTag?: string) => void;
  onAdjustCount: (studentId: string, behaviorTag: string, delta: number) => void;
  isPrivacyMode?: boolean;
  appMode?: 'guidance' | 'praise';
}

export const MatrixHeatmapView: React.FC<MatrixHeatmapViewProps> = ({
  counters,
  settings,
  onOpenDetail,
  onAdjustCount,
  isPrivacyMode = false,
  appMode = 'guidance',
}) => {
  // Sort students strictly by student number for clear matrix readability
  const sortedCounters = [...counters].sort((a, b) => a.student.number - b.student.number);
  const availableTags = appMode === 'praise' ? STANDARD_PRAISE_TAGS : STANDARD_BEHAVIOR_TAGS;

  // Compute cell heat color
  const getCellHeatStyle = (count: number) => {
    if (!count || count === 0) {
      return 'text-slate-300 dark:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800';
    }
    if (appMode === 'praise') {
      return 'bg-emerald-500 text-white font-black shadow-xs';
    }
    if (count >= settings.thresholds.danger) {
      return 'bg-rose-500 text-white font-black shadow-xs';
    }
    if (count >= settings.thresholds.warning) {
      return 'bg-amber-400 text-amber-950 font-bold';
    }
    return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-semibold';
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      {/* Table Header Controls / Info */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            학급 전체 {appMode === 'praise' ? '칭찬/선행' : '행동 지도'} 누적 히트맵 매트릭스
          </h2>
          <p className="text-xs text-slate-400">
            가로(학생) x 세로({appMode === 'praise' ? '칭찬 태그' : '행동 태그'}) 빈도수를 한눈에 파악할 수 있는 고밀도 뷰입니다.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          {appMode === 'praise' ? (
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-emerald-500" />
              <span className="text-slate-500 font-semibold">칭찬 누적 달성</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-blue-100 border border-blue-200" />
                <span className="text-slate-500">주의 (1~{settings.thresholds.caution}회)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-amber-400" />
                <span className="text-slate-500">경고 ({settings.thresholds.warning}회)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-rose-500" />
                <span className="text-slate-500 font-semibold text-rose-600">
                  위험 ({settings.thresholds.danger}회+)
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Overflow Scroll Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-850">
              <th className="sticky left-0 z-20 bg-slate-50 p-2.5 font-bold text-slate-600 dark:bg-slate-850 dark:text-slate-300 min-w-[100px] border-r border-slate-200 dark:border-slate-800">
                학생
              </th>
              <th className="p-2.5 text-center font-bold text-slate-700 dark:text-slate-200 min-w-[70px] border-r border-slate-200 dark:border-slate-800">
                총 누적
              </th>
              {availableTags.map((t) => (
                <th
                  key={t.tag}
                  className="p-2.5 text-center font-semibold text-slate-600 dark:text-slate-300 min-w-[90px] border-r border-slate-200 dark:border-slate-800"
                  title={t.description}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-slate-400">
                      {getBehaviorIcon(t.iconName, { size: 14 })}
                    </span>
                    <span className="truncate max-w-[85px]">{t.tag}</span>
                  </div>
                </th>
              ))}
              <th className="p-2.5 text-center font-bold text-slate-600 dark:text-slate-300">
                상세
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {sortedCounters.map((counter) => {
              const { student, totalCount, byTag } = counter;
              const isDanger = appMode === 'guidance' && totalCount >= settings.thresholds.danger;
              const isWarning = appMode === 'guidance' && !isDanger && totalCount >= settings.thresholds.warning;
              const displayName = maskStudentName(student.name, isPrivacyMode);

              return (
                <tr
                  key={student.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Sticky Student Name & Number */}
                  <td
                    onClick={() => onOpenDetail(student.id)}
                    className="sticky left-0 z-10 bg-white p-2.5 font-bold text-slate-800 dark:bg-slate-900 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 cursor-pointer hover:text-orange-600"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {student.number}
                      </span>
                      <span className="truncate">{displayName}</span>
                    </div>
                  </td>

                  {/* Total Count */}
                  <td className="p-2 text-center border-r border-slate-200 dark:border-slate-800 font-black">
                    <span
                      onClick={() => onOpenDetail(student.id)}
                      className={`inline-block min-w-7 rounded-md px-1.5 py-0.5 cursor-pointer ${
                        appMode === 'praise' && totalCount > 0
                          ? 'bg-emerald-500 text-white'
                          : isDanger
                          ? 'bg-rose-500 text-white'
                          : isWarning
                          ? 'bg-amber-400 text-amber-950'
                          : totalCount > 0
                          ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    >
                      {totalCount}
                    </span>
                  </td>

                  {/* Columns for each standard tag */}
                  {availableTags.map((t) => {
                    const count = byTag[t.tag] || 0;
                    return (
                      <td
                        key={t.tag}
                        className="p-1.5 text-center border-r border-slate-200 dark:border-slate-800"
                      >
                        <div
                          onClick={() => count > 0 && onOpenDetail(student.id, t.tag)}
                          className={`flex items-center justify-center h-8 rounded-lg cursor-pointer transition-all ${getCellHeatStyle(
                            count
                          )}`}
                          title={`${displayName} - ${t.tag}: ${count}회`}
                        >
                          {count > 0 ? `${count}회` : '-'}
                        </div>
                      </td>
                    );
                  })}

                  {/* Action Link */}
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => onOpenDetail(student.id)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      title="상세 기록 보기"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

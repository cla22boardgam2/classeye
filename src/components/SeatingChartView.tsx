'use client';

import React from 'react';
import { AppSettings, Student, StudentBehaviorCounter } from '@/types';
import { maskStudentName } from '@/lib/storage';
import { AlertTriangle, Plus, ChevronRight } from './icons';

interface SeatingChartViewProps {
  students: Student[];
  counters: StudentBehaviorCounter[];
  settings: AppSettings;
  isPrivacyMode: boolean;
  onOpenDetail: (studentId: string, preselectedTag?: string) => void;
  onAdjustCount: (studentId: string, behaviorTag: string, delta: number) => void;
  appMode?: 'guidance' | 'praise';
}

export const SeatingChartView: React.FC<SeatingChartViewProps> = ({
  students,
  counters,
  settings,
  isPrivacyMode,
  onOpenDetail,
  onAdjustCount,
  appMode = 'guidance',
}) => {
  // Sort students into 4 rows x 5 cols (or based on seatRow and seatCol)
  const numRows = 4;
  const numCols = 5;

  // Map of (row, col) -> student
  const deskGrid: (Student | null)[][] = Array.from({ length: numRows }, () =>
    Array.from({ length: numCols }, () => null)
  );

  students.forEach((std, idx) => {
    const r = std.seatRow !== undefined ? std.seatRow : Math.floor(idx / numCols);
    const c = std.seatCol !== undefined ? std.seatCol : idx % numCols;
    if (r < numRows && c < numCols) {
      deskGrid[r][c] = std;
    }
  });

  const counterMap: Record<string, StudentBehaviorCounter> = {};
  counters.forEach((c) => {
    counterMap[c.student.id] = c;
  });

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      {/* Blackboard / Teacher Podium Area */}
      <div className="mx-auto mb-8 max-w-md rounded-2xl border-2 border-slate-700 bg-emerald-900/90 py-3 text-center text-xs font-bold text-emerald-100 shadow-md">
        <span>📖 [칠판 / 교탁 앞] 📖</span>
      </div>

      {/* Classroom Desk Grid */}
      <div className="flex flex-col gap-4 max-w-5xl mx-auto">
        {deskGrid.map((row, rowIdx) => (
          <div key={rowIdx} className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {row.map((student, colIdx) => {
              if (!student) {
                return (
                  <div
                    key={colIdx}
                    className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-[11px] text-slate-400"
                  >
                    빈 책상
                  </div>
                );
              }

              const counter = counterMap[student.id];
              const totalCount = counter?.totalCount || 0;
              const isDanger = appMode === 'guidance' && totalCount >= settings.thresholds.danger;
              const isWarning = appMode === 'guidance' && !isDanger && totalCount >= settings.thresholds.warning;

              // Card styling based on count
              let deskStyle =
                'border-slate-200 bg-slate-50/60 hover:border-orange-400 hover:bg-orange-50/30';
              if (appMode === 'praise' && totalCount > 0) {
                deskStyle =
                  'border-emerald-300 bg-emerald-50/30 shadow-xs hover:border-emerald-500';
              } else if (isDanger) {
                deskStyle =
                  'border-rose-400 bg-rose-50/50 shadow-md shadow-rose-500/10 hover:border-rose-500 animate-pulse';
              } else if (isWarning) {
                deskStyle =
                  'border-amber-300 bg-amber-50/40 shadow-xs hover:border-amber-400';
              }

              const displayName = maskStudentName(student.name, isPrivacyMode);

              return (
                <div
                  key={student.id}
                  onClick={() => onOpenDetail(student.id)}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-3.5 transition-all duration-200 cursor-pointer ${deskStyle}`}
                >
                  {/* Top row: Number & Name */}
                  <div className="flex items-center justify-between">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 text-[11px] font-black text-white dark:bg-slate-100 dark:text-slate-900">
                      {student.number}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate max-w-[75px]">
                      {displayName}
                    </span>
                  </div>

                  {/* Middle: Count Badge */}
                  <div className="my-1.5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {appMode === 'praise' ? '누적 칭찬' : '누적 지도'}
                    </span>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-xs font-black shadow-2xs ${
                        appMode === 'praise'
                          ? 'bg-emerald-500 text-white'
                          : isDanger
                          ? 'bg-rose-500 text-white'
                          : isWarning
                          ? 'bg-amber-500 text-white'
                          : totalCount > 0
                          ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    >
                      {totalCount}회
                    </span>
                  </div>

                  {/* Bottom: Quick View Indicator */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 group-hover:text-orange-600 transition-colors">
                    <span>{rowIdx + 1}줄-{colIdx + 1}분단</span>
                    <ChevronRight size={12} />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Classroom Seating Legend */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-4 dark:border-slate-800">
        <span>💡 교실 책상 배치를 그대로 보며 학생을 클릭해 즉시 기록하거나 상세 이력을 확인할 수 있습니다.</span>
      </div>
    </div>
  );
};

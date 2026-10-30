'use client';

import React, { useMemo } from 'react';
import { X, Calendar, Clock, Sparkles, AlertTriangle, ShieldAlert } from './icons';
import { BehaviorRecord, Student, StudentBehaviorCounter } from '@/types';
import { STANDARD_BEHAVIOR_TAGS } from '@/lib/constants';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  records: BehaviorRecord[];
  counters: StudentBehaviorCounter[];
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  students,
  records,
  counters,
}) => {
  if (!isOpen) return null;

  // 1. Day of week distribution (월, 화, 수, 목, 금)
  const dayStats = useMemo(() => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const map: Record<string, number> = { 월: 0, 화: 0, 수: 0, 목: 0, 금: 0 };

    for (const r of records) {
      if (r.recordType === 'praise') continue;
      const d = new Date(r.timestamp);
      const dayName = days[d.getDay()];
      if (map[dayName] !== undefined) {
        map[dayName]++;
      }
    }
    return map;
  }, [records]);

  // 2. Period distribution
  const periodStats = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of records) {
      if (r.recordType === 'praise') continue;
      const p = r.period || '기타';
      map[p] = (map[p] || 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [records]);

  // 3. Top behavior tags
  const topTags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    for (const r of records) {
      if (r.recordType === 'praise') continue;
      tagCount[r.behaviorTag] = (tagCount[r.behaviorTag] || 0) + 1;
    }
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [records]);

  // 4. Trend comparison (Last 7 days vs Prior 7 days)
  const trendComparison = useMemo(() => {
    const now = Date.now();
    const msWeek = 7 * 24 * 60 * 60 * 1000;
    const last7DaysCount = records.filter((r) => {
      const t = new Date(r.timestamp).getTime();
      return now - t <= msWeek && r.recordType !== 'praise';
    }).length;

    const prior7DaysCount = records.filter((r) => {
      const t = new Date(r.timestamp).getTime();
      return now - t > msWeek && now - t <= msWeek * 2 && r.recordType !== 'praise';
    }).length;

    const diff = prior7DaysCount - last7DaysCount;
    const isImproved = diff > 0;
    const pct =
      prior7DaysCount > 0 ? Math.round((Math.abs(diff) / prior7DaysCount) * 100) : 0;

    return {
      last7DaysCount,
      prior7DaysCount,
      isImproved,
      pct,
    };
  }, [records]);

  const maxDayCount = Math.max(...Object.values(dayStats), 1);
  const maxPeriodCount = periodStats.length > 0 ? Math.max(...periodStats.map((p) => p[1]), 1) : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                학급 생활지도 데이터 분석 및 취약 시간대 인사이트
              </h3>
              <p className="text-xs text-slate-400">
                누적 데이터를 기반으로 요일별, 교시별 패턴과 개선 추이를 분석합니다.
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

        {/* Content Body */}
        <div className="mt-4 flex-1 space-y-6 overflow-y-auto pr-1 text-xs">
          {/* Card 1: Trend Improvement Callout */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                  📈 최근 주간 생활지도 개선 추이
                </h4>
                <p className="text-emerald-700 dark:text-emerald-400 mt-1">
                  최근 7일간 {trendComparison.last7DaysCount}건 발생 (이전 7일{' '}
                  {trendComparison.prior7DaysCount}건)
                </p>
              </div>
              <div className="rounded-xl bg-white px-3 py-1.5 shadow-xs dark:bg-slate-800 font-black text-sm">
                {trendComparison.isImproved ? (
                  <span className="text-emerald-600">
                    👏 {trendComparison.pct}% 감소 개선!
                  </span>
                ) : trendComparison.last7DaysCount === trendComparison.prior7DaysCount ? (
                  <span className="text-slate-600">변화 없음 (유지)</span>
                ) : (
                  <span className="text-rose-500">집중 지도 필요</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Day of Week Distribution */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-850">
            <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
              <Calendar size={14} className="text-orange-500" />
              <span>요일별 문제행동 발생 빈도</span>
            </h4>
            <div className="grid grid-cols-5 gap-2 text-center">
              {Object.entries(dayStats).map(([day, count]) => {
                const heightPct = Math.round((count / maxDayCount) * 100);
                const isMax = count === maxDayCount && count > 0;

                return (
                  <div key={day} className="flex flex-col items-center justify-end h-28">
                    <span className="font-black text-xs text-slate-700 dark:text-slate-200 mb-1">
                      {count}회
                    </span>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg h-16 flex items-end p-1">
                      <div
                        style={{ height: `${Math.max(heightPct, 12)}%` }}
                        className={`w-full rounded-md transition-all ${
                          isMax ? 'bg-orange-500' : 'bg-orange-300 dark:bg-orange-700'
                        }`}
                      />
                    </div>
                    <span className="mt-2 font-bold text-slate-600 dark:text-slate-400">
                      {day}요일
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Period Distribution & Top Tags Side by Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Period Breakdown */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-850">
              <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                <Clock size={14} className="text-indigo-500" />
                <span>교시별 취약 시간대</span>
              </h4>
              <div className="space-y-2">
                {periodStats.slice(0, 5).map(([period, count]) => {
                  const widthPct = Math.round((count / maxPeriodCount) * 100);
                  return (
                    <div key={period} className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>{period}</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {count}회
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          style={{ width: `${widthPct}%` }}
                          className="h-full rounded-full bg-indigo-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Behavior Tags */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-850">
              <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-rose-500" />
                <span>학급 최다 빈출 행동 Top 5</span>
              </h4>
              <div className="space-y-2.5">
                {topTags.map(([tag, count], idx) => (
                  <div
                    key={tag}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-2 dark:border-slate-800 dark:bg-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-[10px] font-black text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {tag}
                      </span>
                    </div>
                    <span className="font-black text-orange-600 dark:text-orange-400">
                      {count}회
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-end border-t border-slate-200 pt-3 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 font-bold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 text-xs"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};

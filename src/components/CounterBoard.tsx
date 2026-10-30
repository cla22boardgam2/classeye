'use client';

import React, { useState, useMemo } from 'react';
import { StudentCard } from './StudentCard';
import { Search, ArrowUpDown, Filter, AlertTriangle } from './icons';
import { AppSettings, StudentBehaviorCounter } from '@/types';
import { STANDARD_BEHAVIOR_TAGS } from '@/lib/constants';

interface CounterBoardProps {
  counters: StudentBehaviorCounter[];
  settings: AppSettings;
  onOpenDetail: (studentId: string, preselectedTag?: string) => void;
  onAdjustCount: (studentId: string, behaviorTag: string, delta: number) => void;
  isPrivacyMode?: boolean;
  appMode?: 'guidance' | 'praise';
}

export const CounterBoard: React.FC<CounterBoardProps> = ({
  counters,
  settings,
  onOpenDetail,
  onAdjustCount,
  isPrivacyMode = false,
  appMode = 'guidance',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'total' | 'number' | 'tag' | 'name'>('number');
  const [selectedTagSort, setSelectedTagSort] = useState<string>(
    STANDARD_BEHAVIOR_TAGS[0].tag
  );
  const [filterSeverityOnly, setFilterSeverityOnly] = useState(false);

  // Filter and sort students
  const filteredAndSortedCounters = useMemo(() => {
    let list = [...counters];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.student.name.toLowerCase().includes(q) ||
          String(c.student.number).includes(q)
      );
    }

    // Severity filter
    if (filterSeverityOnly) {
      list = list.filter((c) => c.totalCount >= settings.thresholds.warning);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'total') {
        // High to low
        if (b.totalCount !== a.totalCount) {
          return b.totalCount - a.totalCount;
        }
        return a.student.number - b.student.number;
      }

      if (sortBy === 'tag') {
        // High to low for specific tag
        const countA = a.byTag[selectedTagSort] || 0;
        const countB = b.byTag[selectedTagSort] || 0;
        if (countB !== countA) {
          return countB - countA;
        }
        return a.student.number - b.student.number;
      }

      if (sortBy === 'name') {
        return a.student.name.localeCompare(b.student.name, 'ko');
      }

      // Default: By student number ascending
      return a.student.number - b.student.number;
    });

    return list;
  }, [counters, searchQuery, sortBy, selectedTagSort, filterSeverityOnly, settings.thresholds]);

  return (
    <div className="flex flex-col gap-4">
      {/* Controls Bar: Search & Sort Dropdowns */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900/80 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="학생 이름 또는 번호 검색..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Sort & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Warning filter toggle */}
          <button
            type="button"
            onClick={() => setFilterSeverityOnly(!filterSeverityOnly)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold whitespace-nowrap transition-all ${
              filterSeverityOnly
                ? 'border-rose-400 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300 shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <AlertTriangle size={14} className={filterSeverityOnly ? 'text-rose-500 shrink-0' : 'text-slate-400 shrink-0'} />
            <span className="whitespace-nowrap">경고 이상만 보기 ({settings.thresholds.warning}회+)</span>
          </button>

          {/* Sort selection */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 text-xs dark:border-slate-700 dark:bg-slate-800 whitespace-nowrap shrink-0">
            <span className="flex items-center gap-1 px-2 text-slate-400 whitespace-nowrap">
              <ArrowUpDown size={13} className="shrink-0" />
              정렬:
            </span>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none dark:text-slate-200 cursor-pointer whitespace-nowrap"
            >
              <option value="number">학생 번호순</option>
              <option value="total">총 누적 횟수 많은 순</option>
              <option value="tag">특정 행동 다발자 순</option>
              <option value="name">이름 가나다순</option>
            </select>
          </div>

          {/* If sorting by specific tag, show tag selector */}
          {sortBy === 'tag' && (
            <select
              value={selectedTagSort}
              onChange={(e) => setSelectedTagSort(e.target.value)}
              className="rounded-xl border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-800 focus:outline-none dark:border-orange-800 dark:bg-orange-950/60 dark:text-orange-200 cursor-pointer whitespace-nowrap shrink-0"
            >
              {STANDARD_BEHAVIOR_TAGS.map((t) => (
                <option key={t.tag} value={t.tag}>
                  {t.tag}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Grid of Student Cards */}
      {filteredAndSortedCounters.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            일치하는 학생이 없습니다.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            검색어나 필터를 초기화해 보세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
          {filteredAndSortedCounters.map((counter) => (
            <StudentCard
              key={counter.student.id}
              counter={counter}
              settings={settings}
              onOpenDetail={onOpenDetail}
              onAdjustCount={onAdjustCount}
              isPrivacyMode={isPrivacyMode}
              appMode={appMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

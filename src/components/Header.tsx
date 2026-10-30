'use client';

import React from 'react';
import {
  Download,
  Printer,
  Settings,
  LayoutGrid,
  Table,
  Armchair,
  Sparkles,
  Bot,
  AlertTriangle,
  Eye,
  EyeOff,
  BarChart2,
} from './icons';
import { AppSettings, StudentBehaviorCounter } from '@/types';

interface HeaderProps {
  counters: StudentBehaviorCounter[];
  todayCount: number;
  viewMode: 'grid' | 'matrix' | 'seating';
  onViewModeChange: (mode: 'grid' | 'matrix' | 'seating') => void;
  appMode: 'guidance' | 'praise';
  onAppModeChange: (mode: 'guidance' | 'praise') => void;
  isPrivacyMode: boolean;
  onTogglePrivacyMode: () => void;
  onOpenSettings: () => void;
  onOpenExport: () => void;
  onOpenPrintReport: () => void;
  onOpenAnalytics: () => void;
  settings: AppSettings;
}

export const Header: React.FC<HeaderProps> = ({
  counters,
  todayCount,
  viewMode,
  onViewModeChange,
  appMode,
  onAppModeChange,
  isPrivacyMode,
  onTogglePrivacyMode,
  onOpenSettings,
  onOpenExport,
  onOpenPrintReport,
  onOpenAnalytics,
  settings,
}) => {
  const totalIncidents = counters.reduce((sum, c) => sum + c.totalCount, 0);
  const studentsWithIncidents = counters.filter((c) => c.totalCount > 0).length;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        {/* ROW 1: Brand / Title on Left & Action Controls on Right */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Brand & App Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-md transition-all ${
                appMode === 'praise'
                  ? 'bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 shadow-emerald-500/20'
                  : 'bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 shadow-orange-500/20'
              }`}
            >
              <span className="text-xl">{appMode === 'praise' ? '🌟' : '🏫'}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white sm:text-xl whitespace-nowrap">
                초등 생활지도 행동누적 대시보드
              </h1>

              {/* Mode Toggle Capsule (Guidance vs Praise) */}
              <div className="flex items-center rounded-full border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => onAppModeChange('guidance')}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold transition-all whitespace-nowrap ${
                    appMode === 'guidance'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  지도 모드
                </button>
                <button
                  type="button"
                  onClick={() => onAppModeChange('praise')}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold transition-all whitespace-nowrap ${
                    appMode === 'praise'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  칭찬 모드 🌟
                </button>
              </div>
            </div>
          </div>

          {/* Action Controls & Toggles (Strictly 1 Row, Never Wraps) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 shrink-0">
            {/* Privacy Protection Button (Screen Masking) */}
            <button
              type="button"
              onClick={onTogglePrivacyMode}
              className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                isPrivacyMode
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
              title="교실 스크린 보호 모드 (학생 이름 마스킹)"
            >
              {isPrivacyMode ? (
                <>
                  <EyeOff size={14} className="text-indigo-600" />
                  <span>화면보호 ON</span>
                </>
              ) : (
                <>
                  <Eye size={14} />
                  <span>화면보호 OFF</span>
                </>
              )}
            </button>

            {/* View Mode 3-way Toggle: Card / Matrix / Seating Chart */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800 shrink-0 whitespace-nowrap">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all whitespace-nowrap ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
                title="학생별 요약 카드 그리드 뷰"
              >
                <LayoutGrid size={13} className="shrink-0" />
                <span>카드 뷰</span>
              </button>
              <button
                onClick={() => onViewModeChange('matrix')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all whitespace-nowrap ${
                  viewMode === 'matrix'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
                title="전체 학생 x 행동 매트릭스 히트맵 뷰"
              >
                <Table size={13} className="shrink-0" />
                <span>매트릭스 뷰</span>
              </button>
              <button
                onClick={() => onViewModeChange('seating')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all whitespace-nowrap ${
                  viewMode === 'seating'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
                title="교실 자리배치도 좌석표 뷰"
              >
                <Armchair size={13} className="shrink-0" />
                <span>좌석표 뷰</span>
              </button>
            </div>

            {/* Analytics Button */}
            <button
              onClick={onOpenAnalytics}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80 transition-colors shrink-0 whitespace-nowrap"
              title="학급 데이터 분석 및 개선 추이 통계"
            >
              <BarChart2 size={13} className="text-orange-500 shrink-0" />
              <span>통계/추이</span>
            </button>

            {/* Export Button */}
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80 transition-colors shrink-0 whitespace-nowrap"
              title="엑셀 / CSV 내보내기"
            >
              <Download size={13} className="shrink-0" />
              <span>내보내기</span>
            </button>

            {/* Print Report Button */}
            <button
              onClick={onOpenPrintReport}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80 transition-colors shrink-0 whitespace-nowrap"
              title="학부모 상담용 보고서 인쇄"
            >
              <Printer size={13} className="shrink-0" />
              <span>상담 출력</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition-colors shrink-0 whitespace-nowrap"
              title="학급 명단, 시간표, 태그 설정"
            >
              <Settings size={13} className="shrink-0" />
              <span>설정</span>
            </button>
          </div>
        </div>

        {/* ROW 2: Subtitle Description & Live Stats Capsule Group */}
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {/* Subtitle */}
          <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap truncate">
            {appMode === 'praise'
              ? '🌟 학급 선행 및 칭찬 행동을 한 줄로 기록하여 긍정적 학급 문화를 만듭니다.'
              : '💡 한 줄 자연어 입력 → 행동별 빈도수(Frequency) 자동 집계 및 상담 근거 수치화'}
          </p>

          {/* Live Stats Badges */}
          <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
            {/* Today Count */}
            <div
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs whitespace-nowrap ${
                appMode === 'praise'
                  ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30'
                  : 'border-orange-200/80 bg-orange-50/70 text-orange-800 dark:border-orange-900/60 dark:bg-orange-950/30'
              }`}
            >
              <span className="text-slate-500 dark:text-slate-400">
                {appMode === 'praise' ? '오늘 칭찬' : '오늘 지도'}
              </span>
              <span
                className={`font-black ${
                  appMode === 'praise' ? 'text-emerald-600' : 'text-orange-600'
                }`}
              >
                {todayCount}회
              </span>
            </div>

            {/* Total Count */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800/60 whitespace-nowrap">
              <span className="text-slate-500 dark:text-slate-400">총 누적</span>
              <span className="font-black text-slate-900 dark:text-white">
                {totalIncidents}건
              </span>
            </div>

            {/* Students Count */}
            <div className="flex items-center gap-1.5 rounded-lg border border-indigo-200/80 bg-indigo-50/70 px-2.5 py-1 text-xs dark:border-indigo-900/60 dark:bg-indigo-950/30 whitespace-nowrap">
              <span className="text-slate-500 dark:text-slate-400">
                {appMode === 'praise' ? '칭찬 학생' : '지도 학생'}
              </span>
              <span className="font-black text-indigo-600 dark:text-indigo-400">
                {studentsWithIncidents}/{counters.length}명
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

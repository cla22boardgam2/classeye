'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { QuickInputBar } from '@/components/QuickInputBar';
import { CounterBoard } from '@/components/CounterBoard';
import { MatrixHeatmapView } from '@/components/MatrixHeatmapView';
import { SeatingChartView } from '@/components/SeatingChartView';
import { StudentDetailModal } from '@/components/StudentDetailModal';
import { SettingsModal } from '@/components/SettingsModal';
import { ExportModal } from '@/components/ExportModal';
import { PrintReportModal } from '@/components/PrintReportModal';
import { AnalyticsModal } from '@/components/AnalyticsModal';
import { UnmatchedStudentModal } from '@/components/UnmatchedStudentModal';

import { AppSettings, BehaviorRecord, Student, StudentBehaviorCounter } from '@/types';
import {
  calculateStudentCounters,
  getStoredRecords,
  getStoredSettings,
  getStoredStudents,
  saveStoredRecords,
  saveStoredSettings,
  saveStoredStudents,
  downloadFile,
  INITIAL_SAMPLE_RECORDS,
} from '@/lib/storage';
import { DEFAULT_APP_SETTINGS, DEFAULT_STUDENTS } from '@/lib/constants';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [students, setStudents] = useState<Student[]>(DEFAULT_STUDENTS);
  const [records, setRecords] = useState<BehaviorRecord[]>(INITIAL_SAMPLE_RECORDS);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS as AppSettings);

  // App Modes: Guidance (문제행동 지도) vs Praise (선행/칭찬 모드)
  const [appMode, setAppMode] = useState<'guidance' | 'praise'>('guidance');

  // View Modes: Card Grid ('grid') vs Matrix Heatmap ('matrix') vs Seating Chart ('seating')
  const [viewMode, setViewMode] = useState<'grid' | 'matrix' | 'seating'>('grid');

  // Privacy Protection Mode (Screen Masking for student names)
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<Student | null>(null);

  // Student Detail Modal state
  const [detailStudentId, setDetailStudentId] = useState<string | null>(null);
  const [detailFilterTag, setDetailFilterTag] = useState<string | undefined>(undefined);

  // Unmatched natural language state
  const [unmatchedData, setUnmatchedData] = useState<{
    rawText: string;
    behaviorTag: string;
    period: string;
  } | null>(null);

  // Undo history
  const [lastAddedRecordIds, setLastAddedRecordIds] = useState<string[] | null>(null);

  // Initial load from localStorage
  useEffect(() => {
    setStudents(getStoredStudents());
    setRecords(getStoredRecords());
    setSettings(getStoredSettings());
    setMounted(true);
  }, []);

  // Save changes to localStorage
  const updateRecords = (newRecords: BehaviorRecord[]) => {
    setRecords(newRecords);
    saveStoredRecords(newRecords);
  };

  const updateStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    saveStoredStudents(newStudents);
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  // Aggregated Counters filtered by active appMode ('guidance' vs 'praise')
  const counters: StudentBehaviorCounter[] = useMemo(() => {
    return calculateStudentCounters(students, records, appMode);
  }, [students, records, appMode]);

  // Map studentId -> { tag: count } for quick O(1) lookup
  const studentCountersMap = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    for (const c of counters) {
      map[c.student.id] = c.byTag;
    }
    return map;
  }, [counters]);

  // Today's total count for current mode
  const todayCount = useMemo(() => {
    if (!mounted) return 0;
    const todayStr = new Date().toISOString().split('T')[0];
    return records.filter((r) => {
      const isToday = r.timestamp.startsWith(todayStr);
      const isMode =
        appMode === 'praise' ? r.recordType === 'praise' : r.recordType !== 'praise';
      return isToday && isMode;
    }).length;
  }, [records, mounted, appMode]);

  // Add new records from Quick Input Bar
  const handleRecordsAdded = (newRecords: BehaviorRecord[]) => {
    const updated = [...newRecords, ...records];
    updateRecords(updated);
    setLastAddedRecordIds(newRecords.map((r) => r.id));
  };

  // Undo last action
  const handleUndoLastRecord = () => {
    if (!lastAddedRecordIds || lastAddedRecordIds.length === 0) return;
    const updated = records.filter((r) => !lastAddedRecordIds.includes(r.id));
    updateRecords(updated);
    setLastAddedRecordIds(null);
  };

  // Delete a specific record
  const handleDeleteRecord = (recordId: string) => {
    const updated = records.filter((r) => r.id !== recordId);
    updateRecords(updated);
  };

  // Update a specific record (edit behavior summary or action taken)
  const handleUpdateRecord = (updatedRecord: BehaviorRecord) => {
    const updated = records.map((r) => (r.id === updatedRecord.id ? updatedRecord : r));
    updateRecords(updated);
  };

  // Quick manual +1 / -1 adjuster
  const handleAdjustCount = (studentId: string, behaviorTag: string, delta: number) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    if (delta > 0) {
      const newRec: BehaviorRecord = {
        id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        studentId: student.id,
        studentNumber: student.number,
        studentName: student.name,
        behaviorTag,
        rawSummary: `${behaviorTag} (${appMode === 'praise' ? '칭찬 +1' : '지도 +1'})`,
        actionTaken: appMode === 'praise' ? '교사 칭찬 및 격려' : '구두 주의 및 학급 규칙 지도',
        period: '수업 중',
        recordType: appMode,
        timestamp: new Date().toISOString(),
      };
      updateRecords([newRec, ...records]);
    } else {
      const matchIndex = records.findIndex(
        (r) =>
          (r.studentId === studentId || r.studentNumber === student.number) &&
          r.behaviorTag === behaviorTag &&
          (appMode === 'praise' ? r.recordType === 'praise' : r.recordType !== 'praise')
      );
      if (matchIndex !== -1) {
        const updated = [...records];
        updated.splice(matchIndex, 1);
        updateRecords(updated);
      }
    }
  };

  // Open Detail Modal
  const handleOpenDetail = (studentId: string, preselectedTag?: string) => {
    setDetailStudentId(studentId);
    setDetailFilterTag(preselectedTag);
  };

  // Open Print Report from Detail Modal
  const handlePrintStudentReport = (student: Student) => {
    setSelectedStudentForReport(student);
    setIsPrintReportOpen(true);
  };

  // Select student for unmatched data
  const handleSelectStudentForUnmatched = (student: Student) => {
    if (!unmatchedData) return;

    const newRec: BehaviorRecord = {
      id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      studentId: student.id,
      studentNumber: student.number,
      studentName: student.name,
      behaviorTag: unmatchedData.behaviorTag,
      rawSummary: unmatchedData.rawText,
      actionTaken: appMode === 'praise' ? '교사 칭찬 및 격려' : '구두 주의 및 규칙 지도',
      period: unmatchedData.period,
      recordType: appMode,
      timestamp: new Date().toISOString(),
    };

    updateRecords([newRec, ...records]);
    setUnmatchedData(null);
  };

  // JSON Export & Import
  const handleExportJSON = () => {
    const data = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      students,
      records,
      settings,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    downloadFile(
      `초등생활지도_전체백업_${new Date().toISOString().split('T')[0]}.json`,
      jsonStr,
      'application/json'
    );
  };

  const handleImportJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.students && parsed.records) {
          updateStudents(parsed.students);
          updateRecords(parsed.records);
          if (parsed.settings) updateSettings(parsed.settings);
          alert('데이터가 성공적으로 복원되었습니다!');
          setIsSettingsOpen(false);
        } else {
          alert('올바른 백업 파일 형식이 아닙니다.');
        }
      } catch (err) {
        alert('JSON 파싱 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetAllData = () => {
    updateRecords([]);
    alert('모든 생활지도 기록이 초기화되었습니다.');
  };

  const selectedStudentForDetail = useMemo(
    () => students.find((s) => s.id === detailStudentId) || null,
    [students, detailStudentId]
  );

  const selectedCounterForDetail = useMemo(
    () => counters.find((c) => c.student.id === detailStudentId) || null,
    [counters, detailStudentId]
  );

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <span className="text-xs font-semibold text-slate-500">
            생활지도 대시보드 불러오는 중...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/60 to-orange-50/20 text-slate-900 antialiased dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      {/* 1. Header */}
      <Header
        counters={counters}
        todayCount={todayCount}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        appMode={appMode}
        onAppModeChange={setAppMode}
        isPrivacyMode={isPrivacyMode}
        onTogglePrivacyMode={() => setIsPrivacyMode(!isPrivacyMode)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenPrintReport={() => {
          setSelectedStudentForReport(students[0] || null);
          setIsPrintReportOpen(true);
        }}
        settings={settings}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* 2. Top Natural Language Quick Input Bar */}
        <section aria-label="자연어 빠른 생활지도 입력">
          <QuickInputBar
            students={students}
            settings={settings}
            onRecordsAdded={handleRecordsAdded}
            onUndoLastRecord={handleUndoLastRecord}
            canUndo={!!lastAddedRecordIds}
            onUnmatched={(unmatched) => setUnmatchedData(unmatched)}
            studentCountersMap={studentCountersMap}
            appMode={appMode}
          />
        </section>

        {/* 3. Main Dashboard Body: Card Grid OR Heatmap Matrix OR Seating Chart */}
        <section aria-label="학생별 행동 누적 카운터 보드">
          {viewMode === 'grid' && (
            <CounterBoard
              counters={counters}
              settings={settings}
              onOpenDetail={handleOpenDetail}
              onAdjustCount={handleAdjustCount}
              isPrivacyMode={isPrivacyMode}
              appMode={appMode}
            />
          )}

          {viewMode === 'matrix' && (
            <MatrixHeatmapView
              counters={counters}
              settings={settings}
              onOpenDetail={handleOpenDetail}
              onAdjustCount={handleAdjustCount}
              isPrivacyMode={isPrivacyMode}
              appMode={appMode}
            />
          )}

          {viewMode === 'seating' && (
            <SeatingChartView
              students={students}
              counters={counters}
              settings={settings}
              isPrivacyMode={isPrivacyMode}
              onOpenDetail={handleOpenDetail}
              onAdjustCount={handleAdjustCount}
              onUpdateStudents={updateStudents}
              appMode={appMode}
            />
          )}
        </section>
      </main>

      {/* 4. Modals */}
      {/* Student Detail Timeline Modal */}
      <StudentDetailModal
        isOpen={!!detailStudentId}
        onClose={() => setDetailStudentId(null)}
        student={selectedStudentForDetail}
        counter={selectedCounterForDetail}
        records={records}
        settings={settings}
        onDeleteRecord={handleDeleteRecord}
        onAddRecord={(rec) => updateRecords([rec, ...records])}
        onUpdateRecord={handleUpdateRecord}
        onPrintStudentReport={handlePrintStudentReport}
        initialFilterTag={detailFilterTag}
        appMode={appMode}
      />

      {/* Analytics Modal */}
      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        students={students}
        records={records}
        counters={counters}
      />

      {/* Unmatched Student Popup Modal */}
      <UnmatchedStudentModal
        isOpen={!!unmatchedData}
        onClose={() => setUnmatchedData(null)}
        unmatchedData={unmatchedData}
        students={students}
        onSelectStudent={handleSelectStudentForUnmatched}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        students={students}
        onSaveSettings={updateSettings}
        onSaveStudents={updateStudents}
        onResetAllData={handleResetAllData}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        students={students}
        records={records}
        settings={settings}
      />

      {/* Printable Consultation Report Modal */}
      <PrintReportModal
        isOpen={isPrintReportOpen}
        onClose={() => setIsPrintReportOpen(false)}
        students={students}
        records={records}
        counters={counters}
        selectedStudent={selectedStudentForReport}
        settings={settings}
      />
    </div>
  );
}

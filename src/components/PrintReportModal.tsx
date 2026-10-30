'use client';

import React, { useState } from 'react';
import { X, Printer, Calendar, Clock, User } from './icons';
import { AppSettings, BehaviorRecord, Student, StudentBehaviorCounter } from '@/types';
import { STANDARD_BEHAVIOR_TAGS } from '@/lib/constants';
import { formatKoreanDateTime } from '@/lib/timeHelper';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  records: BehaviorRecord[];
  counters: StudentBehaviorCounter[];
  selectedStudent: Student | null;
  settings: AppSettings;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  students,
  records,
  counters,
  selectedStudent,
  settings,
}) => {
  const [activeStudentId, setActiveStudentId] = useState<string>(
    selectedStudent?.id || students[0]?.id || ''
  );

  if (!isOpen) return null;

  const currentStudent = students.find((s) => s.id === activeStudentId) || students[0];
  const currentCounter = counters.find((c) => c.student.id === activeStudentId);

  // Student specific records
  const studentRecords = records
    .filter((r) => r.studentId === currentStudent?.id || r.studentNumber === currentStudent?.number)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in print:p-0 print:bg-white">
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden print:max-h-none print:shadow-none print:border-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800 bg-slate-50 print:hidden">
          <div className="flex items-center gap-3">
            <span className="text-xl">🖨️</span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                학생 생활지도 및 학부모 상담용 보고서 인쇄
              </h2>
              <p className="text-xs text-slate-500">
                수치화된 행동별 빈도수와 객관적 일시별 타임라인을 근거 자료로 인쇄/PDF 저장합니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Student selector dropdown */}
            <select
              value={activeStudentId}
              onChange={(e) => setActiveStudentId(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.number}번 {s.name}
                </option>
              ))}
            </select>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white hover:bg-orange-700 shadow-md"
            >
              <Printer size={15} />
              <span>지금 인쇄 / PDF 저장</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Paper Area (A4 layout) */}
        <div className="flex-1 overflow-y-auto p-8 print:p-0 text-slate-900 font-sans">
          <div className="border border-slate-300 p-8 rounded-xl bg-white shadow-xs print:border-none print:shadow-none print:p-0">
            {/* Report Document Title */}
            <div className="border-b-2 border-slate-900 pb-4 text-center">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                초등 생활지도 행동 누적 및 상담 근거 보고서
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                출력 일자: {todayStr} | 담당 교사 확인용
              </p>
            </div>

            {/* Student Information Box */}
            <div className="mt-6 grid grid-cols-3 gap-2 border border-slate-300 bg-slate-50/50 p-4 rounded-lg text-xs">
              <div>
                <span className="font-semibold text-slate-500">학생 번호:</span>{' '}
                <span className="font-bold text-slate-900">{currentStudent?.number}번</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500">학생 성명:</span>{' '}
                <span className="font-bold text-slate-900 text-sm">{currentStudent?.name}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500">총 누적 지도 횟수:</span>{' '}
                <span className="font-black text-orange-600 text-sm">
                  {currentCounter?.totalCount || 0}회
                </span>
              </div>
            </div>

            {/* Section 1: Behavior Frequency Matrix Summary */}
            <div className="mt-6">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 border-l-4 border-orange-500 pl-2">
                1. 표준 행동 유형별 누적 발생 빈도
              </h3>
              <table className="w-full text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                    <th className="p-2 border-r border-slate-300 text-left">행동 유형 태그</th>
                    <th className="p-2 border-r border-slate-300 text-center w-24">누적 횟수</th>
                    <th className="p-2 text-left">주요 지도 기준</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {STANDARD_BEHAVIOR_TAGS.map((t) => {
                    const count = currentCounter?.byTag[t.tag] || 0;
                    return (
                      <tr key={t.tag} className={count > 0 ? 'bg-orange-50/30' : ''}>
                        <td className="p-2 border-r border-slate-300 font-semibold">
                          {t.tag}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-center font-bold">
                          {count > 0 ? (
                            <span className={count >= 5 ? 'text-rose-600 font-black' : ''}>
                              {count}회
                            </span>
                          ) : (
                            <span className="text-slate-400">0회</span>
                          )}
                        </td>
                        <td className="p-2 text-slate-500 text-[11px]">{t.description}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Section 2: Chronological Timeline Log */}
            <div className="mt-6">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 border-l-4 border-orange-500 pl-2">
                2. 일시별 세부 지도 기록 타임라인 ({studentRecords.length}건)
              </h3>
              {studentRecords.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 border border-slate-200 rounded-lg">
                  기록된 지도 내역이 없습니다.
                </div>
              ) : (
                <table className="w-full text-xs border border-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                      <th className="p-2 border-r border-slate-300 text-left w-32">발생 일시</th>
                      <th className="p-2 border-r border-slate-300 text-center w-16">교시</th>
                      <th className="p-2 border-r border-slate-300 text-left w-36">분류 태그</th>
                      <th className="p-2 border-r border-slate-300 text-left">발생 문제행동 관찰 상세</th>
                      <th className="p-2 text-left">교사 지도 및 조치 사항</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {studentRecords.map((r, i) => (
                      <tr key={r.id}>
                        <td className="p-2 border-r border-slate-300 font-mono text-[11px]">
                          {formatKoreanDateTime(r.timestamp)}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-center font-medium">
                          {r.period}
                        </td>
                        <td className="p-2 border-r border-slate-300 font-bold text-slate-800">
                          {r.behaviorTag}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-slate-800 font-medium">
                          {r.rawSummary}
                        </td>
                        <td className="p-2 text-indigo-900 bg-indigo-50/20 font-medium">
                          {r.actionTaken || '구두 주의 및 규칙 지도'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Section 3: Consultation Summary Note Space */}
            <div className="mt-6 border border-slate-300 p-4 rounded-lg bg-slate-50/20">
              <h3 className="text-xs font-bold text-slate-700 mb-2">
                3. 상담 결과 및 교사 종합 소견:
              </h3>
              <div className="h-20 border-b border-dashed border-slate-300" />
            </div>

            {/* Signature Area */}
            <div className="mt-8 flex justify-between items-center text-xs text-slate-500 pt-4 border-t border-slate-200">
              <span>초등학교 생활지도 기록부</span>
              <div className="flex gap-6">
                <span>학부모 확인: ____________ (인)</span>
                <span>담임교사: ____________ (인)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

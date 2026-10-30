'use client';

import React, { useState } from 'react';
import {
  X,
  Printer,
  Trash2,
  Calendar,
  Clock,
  Plus,
  AlertTriangle,
  getBehaviorIcon,
  ChevronRight,
  Sparkles,
  MessageSquareWarning,
  Edit,
  Check,
} from './icons';
import { AppSettings, BehaviorRecord, Student, StudentBehaviorCounter } from '@/types';
import { STANDARD_BEHAVIOR_TAGS, STANDARD_PRAISE_TAGS, COMMON_GUIDANCE_ACTIONS } from '@/lib/constants';
import { formatKoreanDateTime } from '@/lib/timeHelper';
import { ParentMessageModal } from './ParentMessageModal';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  counter: StudentBehaviorCounter | null;
  records: BehaviorRecord[];
  settings: AppSettings;
  onDeleteRecord: (recordId: string) => void;
  onAddRecord: (record: BehaviorRecord) => void;
  onUpdateRecord?: (record: BehaviorRecord) => void;
  onPrintStudentReport: (student: Student) => void;
  initialFilterTag?: string;
  appMode?: 'guidance' | 'praise';
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  student,
  counter,
  records,
  settings,
  onDeleteRecord,
  onAddRecord,
  onUpdateRecord,
  onPrintStudentReport,
  initialFilterTag,
  appMode = 'guidance',
}) => {
  const [activeFilterTag, setActiveFilterTag] = useState<string | null>(
    initialFilterTag || null
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [isParentMessageOpen, setIsParentMessageOpen] = useState(false);

  // New manual record state
  const availableTags = appMode === 'praise' ? STANDARD_PRAISE_TAGS : STANDARD_BEHAVIOR_TAGS;
  const [newTag, setNewTag] = useState(availableTags[0].tag);
  const [newPeriod, setNewPeriod] = useState('1교시');
  const [newSummary, setNewSummary] = useState('');
  const [newActionTaken, setNewActionTaken] = useState(COMMON_GUIDANCE_ACTIONS[0]);

  // Inline Record Editing state
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editSummary, setEditSummary] = useState('');
  const [editActionTaken, setEditActionTaken] = useState('');
  const [editPeriod, setEditPeriod] = useState('1교시');
  const [editTag, setEditTag] = useState(availableTags[0].tag);

  const handleStartEdit = (rec: BehaviorRecord) => {
    setEditingRecordId(rec.id);
    setEditSummary(rec.rawSummary);
    setEditActionTaken(rec.actionTaken || (appMode === 'praise' ? '교사 칭찬 및 격려' : '구두 주의 및 학급 규칙 지도'));
    setEditPeriod(rec.period);
    setEditTag(rec.behaviorTag);
  };

  const handleSaveEdit = (recordId: string) => {
    if (!onUpdateRecord) return;
    const target = records.find((r) => r.id === recordId);
    if (!target) return;
    onUpdateRecord({
      ...target,
      behaviorTag: editTag,
      period: editPeriod,
      rawSummary: editSummary.trim() || target.rawSummary,
      actionTaken: editActionTaken.trim() || target.actionTaken,
    });
    setEditingRecordId(null);
  };

  const handleCancelEdit = () => {
    setEditingRecordId(null);
  };

  if (!isOpen || !student) return null;

  const totalCount = counter?.totalCount || 0;
  const isDanger = appMode === 'guidance' && totalCount >= settings.thresholds.danger;
  const isWarning = appMode === 'guidance' && !isDanger && totalCount >= settings.thresholds.warning;

  // Filter student's records
  const studentRecords = records
    .filter((r) => {
      const matchStudent = r.studentId === student.id || r.studentNumber === student.number;
      const typeMatch = appMode === 'praise' ? r.recordType === 'praise' : r.recordType !== 'praise';
      return matchStudent && typeMatch;
    })
    .filter((r) => !activeFilterTag || r.behaviorTag === activeFilterTag)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleCreateManualRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSummary.trim()) return;

    const newRec: BehaviorRecord = {
      id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      studentId: student.id,
      studentNumber: student.number,
      studentName: student.name,
      behaviorTag: newTag,
      rawSummary: newSummary.trim(),
      actionTaken: newActionTaken.trim(),
      period: newPeriod,
      recordType: appMode,
      timestamp: new Date().toISOString(),
    };

    onAddRecord(newRec);
    setNewSummary('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs">
              {student.number}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white whitespace-nowrap">
                  {student.name} 학생 {appMode === 'praise' ? '칭찬/선행' : '생활지도'} 타임라인
                </h2>
                {appMode === 'praise' ? (
                  <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs whitespace-nowrap">
                    칭찬 {totalCount}회 달성 🌟
                  </span>
                ) : isDanger ? (
                  <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs whitespace-nowrap">
                    상담 요망 (누적 {totalCount}회)
                  </span>
                ) : isWarning ? (
                  <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs whitespace-nowrap">
                    경고 (누적 {totalCount}회)
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200 whitespace-nowrap">
                    누적 {totalCount}회
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 whitespace-nowrap">
                발생 행동 및 교사 지도 조치 상세 이력
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Parent Message Draft Button */}
            {appMode === 'guidance' && (
              <button
                type="button"
                onClick={() => setIsParentMessageOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300 whitespace-nowrap shrink-0 transition-colors"
                title="학부모 상담 안내 문자 초안 자동 작성"
              >
                <MessageSquareWarning size={14} className="shrink-0" />
                <span>학부모 문자 초안</span>
              </button>
            )}

            {/* Print Report Button */}
            <button
              type="button"
              onClick={() => onPrintStudentReport(student)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 whitespace-nowrap shrink-0"
              title="학부모/학생 상담용 출력 보고서 생성"
            >
              <Printer size={14} className="shrink-0" />
              <span>상담 리포트 인쇄</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tag Frequency Counter Summary Bar */}
        <div className="border-b border-slate-100 bg-slate-50/30 px-6 py-3 dark:border-slate-800/60 dark:bg-slate-900">
          <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
            {appMode === 'praise' ? '칭찬 유형별 누적 횟수:' : '행동별 누적 발생 빈도:'}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setActiveFilterTag(null)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilterTag === null
                  ? 'bg-slate-900 text-white shadow-xs dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              전체 ({totalCount}건)
            </button>

            {availableTags.map((t) => {
              const count = counter?.byTag[t.tag] || 0;
              if (count === 0 && activeFilterTag !== t.tag) return null;

              const isTagSelected = activeFilterTag === t.tag;
              const isTagDanger = appMode === 'guidance' && count >= settings.thresholds.danger;

              return (
                <button
                  key={t.tag}
                  type="button"
                  onClick={() => setActiveFilterTag(isTagSelected ? null : t.tag)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                    isTagSelected
                      ? 'bg-orange-500 text-white shadow-xs font-bold'
                      : isTagDanger
                      ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-200'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <span className="whitespace-nowrap">{t.tag}</span>
                  <span className="font-bold underline whitespace-nowrap">{count}회</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body: Timeline list & Quick manual add button */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {activeFilterTag ? `[${activeFilterTag}] 이력` : '전체 상세 타임라인'} (
              {studentRecords.length}건)
            </h3>

            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700 hover:bg-orange-100 dark:bg-orange-950/50 dark:text-orange-300 transition-colors"
            >
              <Plus size={13} />
              <span>{showAddForm ? '입력창 닫기' : '수동 지도기록 추가'}</span>
            </button>
          </div>

          {/* Collapsible Manual Add Form */}
          {showAddForm && (
            <form
              onSubmit={handleCreateManualRecord}
              className="mb-5 rounded-2xl border border-orange-200 bg-orange-50/40 p-4 dark:border-orange-900/50 dark:bg-orange-950/20 space-y-3"
            >
              <div className="text-xs font-bold text-orange-900 dark:text-orange-200">
                ✏️ 수동 {appMode === 'praise' ? '칭찬' : '생활지도'} 기록 추가
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500">분류 태그</label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="mt-0.5 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-medium text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {availableTags.map((t) => (
                      <option key={t.tag} value={t.tag}>
                        {t.tag}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500">교시</label>
                  <select
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value)}
                    className="mt-0.5 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-medium text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {['1교시', '2교시', '3교시', '4교시', '점심시간', '5교시', '6교시', '쉬는시간', '방과후'].map(
                      (p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* Behavior summary */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500">
                  {appMode === 'praise' ? '칭찬 행동 내용' : '발생한 문제행동 상세'}
                </label>
                <input
                  type="text"
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="예: 2교시 쉬는시간 복도에서 전력 질주함"
                  className="mt-0.5 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-medium text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Teacher action taken */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500">
                  {appMode === 'praise' ? '칭찬 및 격려 조치' : '교사 지도 조치 내용'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newActionTaken}
                    onChange={(e) => setNewActionTaken(e.target.value)}
                    placeholder="예: 복도 보행 안전 수칙 설명 후 천천히 걷기 지도"
                    className="mt-0.5 flex-1 rounded-lg border border-slate-300 bg-white p-2 text-xs font-medium text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <select
                    onChange={(e) => e.target.value && setNewActionTaken(e.target.value)}
                    className="mt-0.5 w-36 rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <option value="">자주 쓰는 지도조치</option>
                    {COMMON_GUIDANCE_ACTIONS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-lg px-3 py-1 text-xs text-slate-500 hover:bg-slate-100"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!newSummary.trim()}
                  className="rounded-lg bg-orange-600 px-3 py-1 text-xs font-bold text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  기록 저장 (+1 카운트)
                </button>
              </div>
            </form>
          )}

          {/* Timeline Cards */}
          {studentRecords.length === 0 ? (
            <div className="flex h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
              해당 조건의 기록이 없습니다.
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3.5 space-y-4">
              {studentRecords.map((record) => {
                const tagInfo = availableTags.find(
                  (t) => t.tag === record.behaviorTag
                );

                return (
                  <div key={record.id} className="relative pl-6 group">
                    {/* Timeline Node Dot */}
                    <div
                      className={`absolute -left-2 top-2 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white shadow-xs dark:border-slate-900 ${
                        appMode === 'praise' ? 'bg-emerald-500' : 'bg-orange-500'
                      }`}
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>

                    {/* Record Card or Inline Edit Form */}
                    {editingRecordId === record.id ? (
                      <div className="rounded-2xl border-2 border-orange-400 bg-orange-50/50 p-4 shadow-sm dark:border-orange-500 dark:bg-slate-800 space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-orange-900 dark:text-orange-200">
                          <span>✏️ 기록 세부 내용 수정</span>
                          <span className="text-[11px] text-slate-400">{formatKoreanDateTime(record.timestamp)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-500">분류 태그</label>
                            <select
                              value={editTag}
                              onChange={(e) => setEditTag(e.target.value)}
                              className="mt-0.5 w-full rounded-lg border border-slate-300 bg-white p-1.5 text-xs text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            >
                              {availableTags.map((t) => (
                                <option key={t.tag} value={t.tag}>
                                  {t.tag}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-slate-500">교시</label>
                            <select
                              value={editPeriod}
                              onChange={(e) => setEditPeriod(e.target.value)}
                              className="mt-0.5 w-full rounded-lg border border-slate-300 bg-white p-1.5 text-xs text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            >
                              {['1교시', '2교시', '3교시', '4교시', '점심시간', '5교시', '6교시', '쉬는시간', '방과후'].map(
                                (p) => (
                                  <option key={p} value={p}>
                                    {p}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-500">
                            {appMode === 'praise' ? '칭찬 행동 상세' : '발생한 문제행동 상세'}
                          </label>
                          <input
                            type="text"
                            value={editSummary}
                            onChange={(e) => setEditSummary(e.target.value)}
                            className="mt-0.5 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-medium text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-500">
                            {appMode === 'praise' ? '교사 칭찬 조치' : '교사 지도 조치 내용'}
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editActionTaken}
                              onChange={(e) => setEditActionTaken(e.target.value)}
                              className="mt-0.5 flex-1 rounded-lg border border-slate-300 bg-white p-2 text-xs font-medium text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                            {appMode === 'guidance' && (
                              <select
                                onChange={(e) => e.target.value && setEditActionTaken(e.target.value)}
                                className="mt-0.5 w-32 rounded-lg border border-slate-300 bg-white p-1 text-[11px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              >
                                <option value="">추천 조치</option>
                                {COMMON_GUIDANCE_ACTIONS.map((a) => (
                                  <option key={a} value={a}>
                                    {a}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="rounded-lg px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                          >
                            취소
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(record.id)}
                            className="flex items-center gap-1 rounded-lg bg-orange-600 px-3 py-1 text-xs font-bold text-white hover:bg-orange-700 shadow-xs"
                          >
                            <Check size={13} />
                            <span>수정 완료</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs hover:border-slate-300 dark:border-slate-800 dark:bg-slate-850 dark:hover:border-slate-700 transition-colors">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            {/* Tag badge */}
                            <span
                              className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                                tagInfo?.badgeBg || 'bg-slate-100'
                              } ${tagInfo?.badgeText || 'text-slate-800'}`}
                            >
                              {getBehaviorIcon(tagInfo?.iconName || '', { size: 12 })}
                              <span>{record.behaviorTag}</span>
                            </span>

                            {/* Period */}
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {record.period}
                            </span>
                          </div>

                          {/* Date, Edit and Delete Buttons */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-400">
                              {formatKoreanDateTime(record.timestamp)}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleStartEdit(record)}
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors"
                              title="기록 수정 (발생행동 및 교사지도내용 변경)"
                            >
                              <Edit size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  confirm(
                                    `이 기록을 삭제하시겠습니까?\n누적 카운트가 1회 차감됩니다.`
                                  )
                                ) {
                                  onDeleteRecord(record.id);
                                }
                              }}
                              className="rounded p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 transition-colors"
                              title="이 기록 삭제 (카운터 -1)"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Content: What happened & Teacher guidance action */}
                        <div className="space-y-1.5 mt-2">
                          <div className="flex items-start gap-1.5 text-xs text-slate-800 dark:text-slate-200">
                            <span className="font-bold text-slate-500 shrink-0">
                              {appMode === 'praise' ? '칭찬 행동:' : '발생 행동:'}
                            </span>
                            <span className="font-medium">{record.rawSummary}</span>
                          </div>

                          <div className="flex items-start gap-1.5 text-xs text-indigo-900 bg-indigo-50/70 dark:bg-indigo-950/40 dark:text-indigo-200 p-2 rounded-xl">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                              {appMode === 'praise' ? '교사 칭찬 조치:' : '교사 지도 조치:'}
                            </span>
                            <span>
                              {record.actionTaken || '구두 주의 및 학급 규칙 재교육 지도'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-850 flex justify-between items-center text-xs text-slate-500">
          <span>
            💡 개별 기록 삭제 시 누적 카운트가 실시간으로 -1 차감됩니다.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
          >
            닫기
          </button>
        </div>
      </div>

      {/* Parent SMS Draft Modal */}
      <ParentMessageModal
        isOpen={isParentMessageOpen}
        onClose={() => setIsParentMessageOpen(false)}
        student={student}
        counter={counter}
        records={records}
      />
    </div>
  );
};

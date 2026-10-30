'use client';

import React, { useState } from 'react';
import {
  X,
  Settings,
  Bot,
  Clock,
  User,
  Sparkles,
  Trash2,
  Plus,
  Check,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  RefreshCw,
} from './icons';
import { AppSettings, PeriodScheduleItem, Student } from '@/types';
import { DEFAULT_APP_SETTINGS, DEFAULT_PERIOD_SCHEDULE, STANDARD_BEHAVIOR_TAGS } from '@/lib/constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  students: Student[];
  onSaveSettings: (newSettings: AppSettings) => void;
  onSaveStudents: (newStudents: Student[]) => void;
  onResetAllData: () => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  students,
  onSaveSettings,
  onSaveStudents,
  onResetAllData,
  onExportJSON,
  onImportJSON,
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'schedule' | 'ai' | 'threshold' | 'backup'>(
    'roster'
  );

  // Form states
  const [currentSettings, setCurrentSettings] = useState<AppSettings>({ ...settings });
  const [currentStudents, setCurrentStudents] = useState<Student[]>([...students]);

  // Roster bulk paste text state
  const [bulkText, setBulkText] = useState('');
  const [bulkError, setBulkError] = useState('');

  // New student manual form state
  const [newStudentNumber, setNewStudentNumber] = useState(
    students.length > 0 ? Math.max(...students.map((s) => s.number)) + 1 : 1
  );
  const [newStudentName, setNewStudentName] = useState('');

  if (!isOpen) return null;

  // Handle Bulk Paste Roster Parser
  const handleBulkParse = () => {
    setBulkError('');
    if (!bulkText.trim()) {
      setBulkError('명단 텍스트를 입력해주세요.');
      return;
    }

    const lines = bulkText.split('\n');
    const parsedList: Student[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Match patterns: "1 김철수", "1번 김철수", "1. 김철수", "김철수"
      const match = line.match(/^(\d{1,2})[\s번\.\t]+([가-힣a-zA-Z\s]+)$/);
      if (match) {
        parsedList.push({
          id: 'std-' + match[1],
          number: parseInt(match[1], 10),
          name: match[2].trim(),
        });
      } else {
        // If only name provided, assign line index as number
        const cleanName = line.replace(/^\d+[\s번\.]*/, '').trim();
        if (cleanName) {
          parsedList.push({
            id: 'std-' + (i + 1),
            number: i + 1,
            name: cleanName,
          });
        }
      }
    }

    if (parsedList.length === 0) {
      setBulkError('유효한 학생 명단을 파싱하지 못했습니다. 형식을 확인해주세요.');
      return;
    }

    // Sort by student number
    parsedList.sort((a, b) => a.number - b.number);
    setCurrentStudents(parsedList);
    setBulkText('');
    alert(`총 ${parsedList.length}명의 학급 명단이 등록되었습니다!`);
  };

  // Add single student
  const handleAddSingleStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const newStudent: Student = {
      id: 'std-' + Date.now(),
      number: newStudentNumber,
      name: newStudentName.trim(),
    };

    const updated = [...currentStudents, newStudent].sort((a, b) => a.number - b.number);
    setCurrentStudents(updated);
    setNewStudentName('');
    setNewStudentNumber(newStudentNumber + 1);
  };

  // Delete student
  const handleDeleteStudent = (id: string) => {
    setCurrentStudents(currentStudents.filter((s) => s.id !== id));
  };

  // Save changes
  const handleSaveAll = () => {
    onSaveSettings(currentSettings);
    onSaveStudents(currentStudents);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                학급 생활지도 대시보드 환경 설정
              </h2>
              <p className="text-xs text-slate-400">
                학급 명단, 학교별 교시 시간표, AI 및 누적 임계값 관리
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 text-xs font-semibold dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('roster')}
            className={`border-b-2 py-3 px-3 transition-colors ${
              activeTab === 'roster'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            📋 학급 명단 등록 ({currentStudents.length}명)
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`border-b-2 py-3 px-3 transition-colors ${
              activeTab === 'schedule'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            ⏰ 교시 시간표 커스텀
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`border-b-2 py-3 px-3 transition-colors ${
              activeTab === 'ai'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            🤖 AI 파서 및 API 설정
          </button>
          <button
            onClick={() => setActiveTab('threshold')}
            className={`border-b-2 py-3 px-3 transition-colors ${
              activeTab === 'threshold'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            🚨 경고 임계값 설정
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`border-b-2 py-3 px-3 transition-colors ${
              activeTab === 'backup'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            💾 데이터 백업 및 복원
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {/* TAB 1: Roster */}
          {activeTab === 'roster' && (
            <div className="space-y-5">
              {/* Bulk paste box */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-850">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                  나이스 / 엑셀 명단 한 번에 붙여넣기 일괄 등록
                </h3>
                <p className="text-slate-500 mb-3">
                  엑셀이나 나이스에서 복사하여 아래에 붙여넣으세요. (예: "1 김민우 \n 2 김도윤 \n 3 김철수")
                </p>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  rows={4}
                  placeholder={`1 김민우\n2 김도윤\n3 김철수\n4 박서준\n5 박영희`}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-xs text-slate-800 focus:border-orange-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                {bulkError && <p className="mt-1 text-rose-500 font-semibold">{bulkError}</p>}
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleBulkParse}
                    className="flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 font-bold text-white hover:bg-orange-700 shadow-xs"
                  >
                    <Check size={14} />
                    <span>일괄 파싱 및 등록하기</span>
                  </button>
                </div>
              </div>

              {/* Individual Add */}
              <form onSubmit={handleAddSingleStudent} className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={newStudentNumber}
                  onChange={(e) => setNewStudentNumber(parseInt(e.target.value, 10))}
                  placeholder="번호"
                  className="w-20 rounded-xl border border-slate-300 p-2 text-center text-xs font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="새 학생 이름 입력"
                  className="flex-1 rounded-xl border border-slate-300 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!newStudentName.trim()}
                  className="flex items-center gap-1 rounded-xl bg-slate-900 px-4 py-2 font-bold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 disabled:opacity-40"
                >
                  <Plus size={14} />
                  <span>추가</span>
                </button>
              </form>

              {/* Roster table */}
              <div>
                <div className="mb-2 font-bold text-slate-700 dark:text-slate-300">
                  현재 등록된 학생 명단 ({currentStudents.length}명)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
                  {currentStudents.map((std) => (
                    <div
                      key={std.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-[10px] dark:bg-slate-700 dark:text-slate-200">
                          {std.number}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {std.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteStudent(std.id)}
                        className="text-slate-300 hover:text-rose-500 p-1"
                        title="삭제"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Schedule (Custom School Timetable) */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-3 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200">
                💡 <strong>학교별 맞춤 시간표:</strong> 교시별 시작 및 종료 시간을 편집하면, 자연어 입력 시 현재 시스템 시간에 맞는 교시가 자동으로 매핑됩니다.
              </div>

              <div className="space-y-2">
                {currentSettings.periodSchedule.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-800"
                  >
                    <span className="font-bold text-slate-800 dark:text-slate-200 w-36">
                      {item.periodName}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={item.startTime}
                        onChange={(e) => {
                          const updated = [...currentSettings.periodSchedule];
                          updated[idx].startTime = e.target.value;
                          setCurrentSettings({ ...currentSettings, periodSchedule: updated });
                        }}
                        className="rounded-lg border border-slate-300 p-1 font-mono text-xs dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      />
                      <span className="text-slate-400">~</span>
                      <input
                        type="time"
                        value={item.endTime}
                        onChange={(e) => {
                          const updated = [...currentSettings.periodSchedule];
                          updated[idx].endTime = e.target.value;
                          setCurrentSettings({ ...currentSettings, periodSchedule: updated });
                        }}
                        className="rounded-lg border border-slate-300 p-1 font-mono text-xs dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  setCurrentSettings({
                    ...currentSettings,
                    periodSchedule: DEFAULT_PERIOD_SCHEDULE,
                  })
                }
                className="text-xs text-slate-500 hover:text-slate-700 underline"
              >
                기본 표준 시간표로 초기화
              </button>
            </div>
          )}

          {/* TAB 3: AI & API Key */}
          {activeTab === 'ai' && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-850">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      규칙 기반 로컬 AI (Mock) 사용
                    </h3>
                    <p className="text-slate-500">
                      OpenAI API 키 없이도 내장된 한국어 형태소 키워드 엔진으로 즉시 100% 매핑됩니다.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentSettings.useMockParser}
                    onChange={(e) =>
                      setCurrentSettings({
                        ...currentSettings,
                        useMockParser: e.target.checked,
                      })
                    }
                    className="h-5 w-5 accent-orange-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* OpenAI API Key */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  OpenAI API Key 설정 (선택사항)
                </h3>
                <p className="text-slate-500">
                  선생님 개인의 OpenAI API Key를 입력하시면 <code className="font-mono bg-slate-100 p-0.5 rounded">gpt-4o-mini</code>를 통해 고난도 문맥 분석을 수행합니다. (브라우저 로컬스토리지에만 보관됩니다)
                </p>
                <input
                  type="password"
                  value={currentSettings.apiKey}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      apiKey: e.target.value.trim(),
                    })
                  }
                  placeholder="sk-proj-..."
                  className="w-full rounded-xl border border-slate-300 p-3 font-mono text-xs text-slate-800 focus:border-orange-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    모델 선택:
                  </label>
                  <select
                    value={currentSettings.model}
                    onChange={(e) =>
                      setCurrentSettings({ ...currentSettings, model: e.target.value })
                    }
                    className="mt-1 block w-full rounded-xl border border-slate-300 p-2.5 font-semibold text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="gpt-4o-mini">gpt-4o-mini (권장: 빠르고 경제적)</option>
                    <option value="gpt-4o">gpt-4o (최고 성능)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Thresholds */}
          {activeTab === 'threshold' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white">
                행동 누적 횟수에 따른 시각적 경고 단계 설정
              </h3>
              <p className="text-slate-500">
                특정 행동이나 총 누적 횟수가 해당 임계값을 초과하면 색상(주황/빨강)으로 강조됩니다.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
                  <div className="font-bold text-blue-800 dark:text-blue-300 mb-1">
                    주의 단계 (블루)
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={currentSettings.thresholds.caution}
                      onChange={(e) =>
                        setCurrentSettings({
                          ...currentSettings,
                          thresholds: {
                            ...currentSettings.thresholds,
                            caution: parseInt(e.target.value, 10),
                          },
                        })
                      }
                      className="w-20 rounded-lg border border-blue-300 p-1.5 text-center font-bold"
                    />
                    <span>회 이상</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
                  <div className="font-bold text-amber-800 dark:text-amber-300 mb-1">
                    경고 단계 (주황)
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={currentSettings.thresholds.warning}
                      onChange={(e) =>
                        setCurrentSettings({
                          ...currentSettings,
                          thresholds: {
                            ...currentSettings.thresholds,
                            warning: parseInt(e.target.value, 10),
                          },
                        })
                      }
                      className="w-20 rounded-lg border border-amber-300 p-1.5 text-center font-bold"
                    />
                    <span>회 이상</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900 dark:bg-rose-950/20">
                  <div className="font-bold text-rose-800 dark:text-rose-300 mb-1">
                    위험 / 상담 요망 (빨강)
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={currentSettings.thresholds.danger}
                      onChange={(e) =>
                        setCurrentSettings({
                          ...currentSettings,
                          thresholds: {
                            ...currentSettings.thresholds,
                            danger: parseInt(e.target.value, 10),
                          },
                        })
                      }
                      className="w-20 rounded-lg border border-rose-300 p-1.5 text-center font-bold"
                    />
                    <span>회 이상</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Backup & Reset */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-850">
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                  데이터 백업 및 다른 PC 이동
                </h3>
                <p className="text-slate-500 mb-3">
                  전체 기록 및 설정을 JSON 파일로 다운로드하여 다른 컴퓨터에 복원할 수 있습니다.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onExportJSON}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  >
                    <Download size={14} />
                    <span>전체 데이터 백업 (JSON 다운로드)</span>
                  </button>

                  <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
                    <span>백업 파일 복원 (가져오기)</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onImportJSON(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Reset Box */}
              <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-4 dark:border-rose-900 dark:bg-rose-950/20">
                <h3 className="font-bold text-rose-800 dark:text-rose-300 mb-1">
                  데이터 초기화
                </h3>
                <p className="text-slate-500 mb-3">
                  새 학기를 시작할 때 모든 기록을 초기화할 수 있습니다. (되돌릴 수 없습니다)
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        '정말로 모든 생활지도 기록을 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.'
                      )
                    ) {
                      onResetAllData();
                      onClose();
                    }
                  }}
                  className="rounded-xl bg-rose-600 px-4 py-2 font-bold text-white hover:bg-rose-700 shadow-xs"
                >
                  기록 전체 초기화
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-850 flex justify-between items-center text-xs">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 font-bold text-white hover:bg-slate-800 shadow-md dark:bg-slate-100 dark:text-slate-900"
          >
            <Check size={14} />
            <span>설정 저장하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};

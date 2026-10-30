'use client';

import React, { useState, useEffect } from 'react';
import { AppSettings, Student, StudentBehaviorCounter } from '@/types';
import { maskStudentName } from '@/lib/storage';
import {
  AlertTriangle,
  ChevronRight,
  Edit,
  Check,
  X,
  Shuffle,
  ArrowUpDown,
  Plus,
  Minus,
  Sparkles,
} from './icons';

interface SeatingChartViewProps {
  students: Student[];
  counters: StudentBehaviorCounter[];
  settings: AppSettings;
  isPrivacyMode: boolean;
  onOpenDetail: (studentId: string, preselectedTag?: string) => void;
  onAdjustCount: (studentId: string, behaviorTag: string, delta: number) => void;
  onUpdateStudents?: (students: Student[]) => void;
  appMode?: 'guidance' | 'praise';
}

export const SeatingChartView: React.FC<SeatingChartViewProps> = ({
  students,
  counters,
  settings,
  isPrivacyMode,
  onOpenDetail,
  onAdjustCount,
  onUpdateStudents,
  appMode = 'guidance',
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [numRows, setNumRows] = useState(4);
  const [numCols, setNumCols] = useState(5);

  // Local draft state of students during editing
  const [workingStudents, setWorkingStudents] = useState<Student[]>(students);

  // Selected seat for click-to-swap: { row, col }
  const [selectedSeat, setSelectedSeat] = useState<{ row: number; col: number } | null>(null);

  // Selected unseated student ID to place
  const [selectedUnseatedId, setSelectedUnseatedId] = useState<string | null>(null);

  // Toast message
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Load saved seating grid dimensions from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('classeye_seating_dimensions');
      if (saved) {
        const { rows, cols } = JSON.parse(saved);
        if (rows >= 2 && rows <= 8) setNumRows(rows);
        if (cols >= 2 && cols <= 8) setNumCols(cols);
      }
    } catch (e) {
      console.error('Failed to load seating dimensions:', e);
    }
  }, []);

  // Synchronize workingStudents when students prop updates (and not in active edit mode)
  useEffect(() => {
    if (!isEditMode) {
      setWorkingStudents(students);
    }
  }, [students, isEditMode]);

  // Auto clear toast
  useEffect(() => {
    if (!toastMsg) return;
    const timer = setTimeout(() => setToastMsg(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMsg]);

  // Construct Desk Grid: 2D array of (numRows x numCols)
  const currentStudents = isEditMode ? workingStudents : students;

  const deskGrid: (Student | null)[][] = Array.from({ length: numRows }, () =>
    Array.from({ length: numCols }, () => null)
  );

  currentStudents.forEach((std) => {
    if (std.seatRow !== undefined && std.seatCol !== undefined) {
      if (std.seatRow < numRows && std.seatCol < numCols) {
        deskGrid[std.seatRow][std.seatCol] = std;
      }
    }
  });

  // Find unseated students (students whose seatRow/seatCol are undefined or out of current grid bounds)
  const seatedStudentIds = new Set<string>();
  deskGrid.forEach((row) => {
    row.forEach((std) => {
      if (std) seatedStudentIds.add(std.id);
    });
  });
  const unseatedStudents = currentStudents.filter((s) => !seatedStudentIds.has(s.id));

  const counterMap: Record<string, StudentBehaviorCounter> = {};
  counters.forEach((c) => {
    counterMap[c.student.id] = c;
  });

  // Handle Desk Click in Edit Mode
  const handleSeatClick = (row: number, col: number) => {
    if (!isEditMode) {
      const student = deskGrid[row][col];
      if (student) {
        onOpenDetail(student.id);
      }
      return;
    }

    // If an unseated student is selected, place into this desk
    if (selectedUnseatedId) {
      const targetStudent = deskGrid[row][col];
      const updated = workingStudents.map((s) => {
        if (s.id === selectedUnseatedId) {
          return { ...s, seatRow: row, seatCol: col };
        }
        if (targetStudent && s.id === targetStudent.id) {
          // Displace target student to unseated
          return { ...s, seatRow: undefined, seatCol: undefined };
        }
        return s;
      });
      setWorkingStudents(updated);
      setSelectedUnseatedId(null);
      setToastMsg(`학생을 ${row + 1}줄 ${col + 1}분단에 배치했습니다.`);
      return;
    }

    // Click-to-swap between desks
    if (!selectedSeat) {
      setSelectedSeat({ row, col });
    } else {
      if (selectedSeat.row === row && selectedSeat.col === col) {
        // Deselect
        setSelectedSeat(null);
      } else {
        // Perform Swap
        swapSeats(selectedSeat.row, selectedSeat.col, row, col);
        setSelectedSeat(null);
      }
    }
  };

  // Swap Seats logic
  const swapSeats = (r1: number, c1: number, r2: number, c2: number) => {
    const student1 = deskGrid[r1]?.[c1];
    const student2 = deskGrid[r2]?.[c2];

    const updated = workingStudents.map((s) => {
      if (student1 && s.id === student1.id) {
        return { ...s, seatRow: r2, seatCol: c2 };
      }
      if (student2 && s.id === student2.id) {
        return { ...s, seatRow: r1, seatCol: c1 };
      }
      return s;
    });

    setWorkingStudents(updated);
    setToastMsg(`${r1 + 1}줄 ${c1 + 1}분단과 ${r2 + 1}줄 ${c2 + 1}분단 자리를 교환했습니다.`);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, row: number, col: number) => {
    if (!isEditMode) return;
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'seat', row, col }));
  };

  const handleUnseatedDragStart = (e: React.DragEvent, studentId: string) => {
    if (!isEditMode) return;
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'unseated', studentId }));
  };

  const handleDrop = (e: React.DragEvent, targetRow: number, targetCol: number) => {
    e.preventDefault();
    if (!isEditMode) return;

    try {
      const raw = e.dataTransfer.getData('application/json');
      if (!raw) return;
      const data = JSON.parse(raw);

      if (data.type === 'seat') {
        swapSeats(data.row, data.col, targetRow, targetCol);
      } else if (data.type === 'unseated') {
        const studentId = data.studentId;
        const targetStudent = deskGrid[targetRow][targetCol];

        const updated = workingStudents.map((s) => {
          if (s.id === studentId) {
            return { ...s, seatRow: targetRow, seatCol: targetCol };
          }
          if (targetStudent && s.id === targetStudent.id) {
            return { ...s, seatRow: undefined, seatCol: undefined };
          }
          return s;
        });

        setWorkingStudents(updated);
        setToastMsg(`학생을 ${targetRow + 1}줄 ${targetCol + 1}분단에 배치했습니다.`);
      }
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  // Random Shuffle (선생님들의 최애 기능: 🎲 무작위 자리 바꾸기)
  const handleRandomShuffle = () => {
    if (!confirm('현재 학급 학생들의 자리를 무작위(랜덤)로 섞으시겠습니까?')) return;

    // Collect all available seat coordinates
    const allCoords: { row: number; col: number }[] = [];
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        allCoords.push({ row: r, col: c });
      }
    }

    // Shuffle coordinates (Fisher-Yates)
    const shuffledCoords = [...allCoords];
    for (let i = shuffledCoords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledCoords[i], shuffledCoords[j]] = [shuffledCoords[j], shuffledCoords[i]];
    }

    // Assign to students
    const updated = workingStudents.map((s, idx) => {
      const coord = shuffledCoords[idx];
      if (coord) {
        return { ...s, seatRow: coord.row, seatCol: coord.col };
      }
      return { ...s, seatRow: undefined, seatCol: undefined };
    });

    setWorkingStudents(updated);
    setToastMsg('🎲 모든 학생의 자리가 무작위로 섞였습니다! [저장 완료]를 눌러 확정하세요.');
  };

  // Order by Student Number (번호순 정렬)
  const handleResetByNumber = () => {
    if (!confirm('학생 번호 순서(1번부터 차례대로)로 자리를 재배치하시겠습니까?')) return;

    const sorted = [...workingStudents].sort((a, b) => a.number - b.number);
    let seatIndex = 0;

    const updated = sorted.map((s) => {
      const r = Math.floor(seatIndex / numCols);
      const c = seatIndex % numCols;
      seatIndex++;
      if (r < numRows) {
        return { ...s, seatRow: r, seatCol: c };
      }
      return { ...s, seatRow: undefined, seatCol: undefined };
    });

    setWorkingStudents(updated);
    setToastMsg('🔢 학생 번호순으로 자리가 정렬되었습니다.');
  };

  // Save Seating Plan
  const handleSavePlan = () => {
    if (onUpdateStudents) {
      onUpdateStudents(workingStudents);
    }

    // Save dimensions
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'classeye_seating_dimensions',
          JSON.stringify({ rows: numRows, cols: numCols })
        );
      } catch (e) {
        console.error('Failed to save seating dimensions:', e);
      }
    }

    setIsEditMode(false);
    setSelectedSeat(null);
    setSelectedUnseatedId(null);
    setToastMsg('✅ 자리 배치가 성공적으로 저장되었습니다!');
  };

  // Cancel Edit
  const handleCancelEdit = () => {
    setWorkingStudents(students);
    setIsEditMode(false);
    setSelectedSeat(null);
    setSelectedUnseatedId(null);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-900 shadow-xs dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-200 transition-all">
          {toastMsg}
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>교실 좌석표 (자리배치도)</span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {numRows}줄 × {numCols}분단 (총 {numRows * numCols}석)
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isEditMode
              ? '바꾸고 싶은 두 책상을 차례대로 클릭하거나 마우스로 드래그하여 자리를 변경하세요.'
              : '교실 책상 배치를 그대로 보며 학생을 클릭해 즉시 생활지도 이력을 확인합니다.'}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {!isEditMode ? (
            <button
              type="button"
              onClick={() => setIsEditMode(true)}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-2xs transition-all"
            >
              <Edit size={14} />
              <span>자리 바꾸기 / 배치 변경</span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {/* Row & Col adjusters */}
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800">
                <span className="text-slate-500 font-semibold">줄(행):</span>
                <button
                  type="button"
                  onClick={() => numRows > 2 && setNumRows(numRows - 1)}
                  className="rounded p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <Minus size={12} />
                </button>
                <span className="font-bold">{numRows}줄</span>
                <button
                  type="button"
                  onClick={() => numRows < 8 && setNumRows(numRows + 1)}
                  className="rounded p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <Plus size={12} />
                </button>

                <span className="text-slate-300 mx-1">|</span>

                <span className="text-slate-500 font-semibold">분단(열):</span>
                <button
                  type="button"
                  onClick={() => numCols > 2 && setNumCols(numCols - 1)}
                  className="rounded p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <Minus size={12} />
                </button>
                <span className="font-bold">{numCols}분단</span>
                <button
                  type="button"
                  onClick={() => numCols < 8 && setNumCols(numCols + 1)}
                  className="rounded p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Random Shuffle Button */}
              <button
                type="button"
                onClick={handleRandomShuffle}
                className="flex items-center gap-1 rounded-xl bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-300 transition-colors"
                title="학생 자리를 무작위로 섞습니다"
              >
                <Shuffle size={13} />
                <span>랜덤 자리바꾸기</span>
              </button>

              {/* Order by Number Button */}
              <button
                type="button"
                onClick={handleResetByNumber}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
                title="번호순으로 정렬합니다"
              >
                <ArrowUpDown size={13} />
                <span>번호순 정렬</span>
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                취소
              </button>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSavePlan}
                className="flex items-center gap-1 rounded-xl bg-orange-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-orange-700 shadow-md transition-colors"
              >
                <Check size={14} />
                <span>배치 저장 완료</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Editing Guide Banner (when in Edit Mode) */}
      {isEditMode && (
        <div className="mb-6 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 p-3 text-xs text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">💡</span>
            <span>
              <strong>자리 배치 편집 중:</strong> 바꾸고 싶은 첫 번째 책상을 클릭한 뒤, 두 번째
              책상을 클릭하면 자리가 서로 맞바뀝니다. 마우스로 끌어서 놓으셔도 됩니다!
            </span>
          </div>
          {selectedSeat && (
            <span className="rounded-lg bg-indigo-600 px-2 py-0.5 text-[11px] font-bold text-white animate-pulse">
              {selectedSeat.row + 1}줄 {selectedSeat.col + 1}분단 선택됨 (바꿀 자리를 클릭하세요)
            </span>
          )}
        </div>
      )}

      {/* Blackboard / Teacher Podium Area */}
      <div className="mx-auto mb-8 max-w-md rounded-2xl border-2 border-slate-700 bg-emerald-900/90 py-3 text-center text-xs font-bold text-emerald-100 shadow-md">
        <span>📖 [칠판 / 교탁 앞] 📖</span>
      </div>

      {/* Classroom Desk Grid */}
      <div className="flex flex-col gap-4 max-w-5xl mx-auto">
        {deskGrid.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))`,
            }}
          >
            {row.map((student, colIdx) => {
              const isSelected =
                isEditMode && selectedSeat?.row === rowIdx && selectedSeat?.col === colIdx;

              if (!student) {
                return (
                  <div
                    key={colIdx}
                    onClick={() => handleSeatClick(rowIdx, colIdx)}
                    onDragOver={(e) => isEditMode && e.preventDefault()}
                    onDrop={(e) => handleDrop(e, rowIdx, colIdx)}
                    className={`flex h-24 flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/80 ring-4 ring-indigo-500/20'
                        : isEditMode
                        ? 'border-slate-300 bg-slate-50/40 hover:border-indigo-400 hover:bg-indigo-50/20 cursor-pointer'
                        : 'border-slate-200 bg-slate-50/20 text-slate-300'
                    }`}
                  >
                    <span className="text-[11px] font-medium text-slate-400">
                      {isEditMode ? '빈 책상 (배치 가능)' : '빈 책상'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      {rowIdx + 1}줄-{colIdx + 1}분단
                    </span>
                  </div>
                );
              }

              const counter = counterMap[student.id];
              const totalCount = counter?.totalCount || 0;
              const isDanger = appMode === 'guidance' && totalCount >= settings.thresholds.danger;
              const isWarning =
                appMode === 'guidance' && !isDanger && totalCount >= settings.thresholds.warning;

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

              if (isSelected) {
                deskStyle =
                  'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-500/30 shadow-lg scale-102';
              }

              const displayName = maskStudentName(student.name, isPrivacyMode);

              return (
                <div
                  key={student.id}
                  draggable={isEditMode}
                  onDragStart={(e) => handleDragStart(e, rowIdx, colIdx)}
                  onDragOver={(e) => isEditMode && e.preventDefault()}
                  onDrop={(e) => handleDrop(e, rowIdx, colIdx)}
                  onClick={() => handleSeatClick(rowIdx, colIdx)}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-3.5 transition-all duration-200 cursor-pointer ${deskStyle}`}
                >
                  {/* Top row: Number & Name */}
                  <div className="flex items-center justify-between">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 text-[11px] font-black text-white dark:bg-slate-100 dark:text-slate-900">
                      {student.number}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate max-w-[85px]">
                      {displayName}
                    </span>
                  </div>

                  {/* Middle: Count Badge or Edit Mode Indicator */}
                  <div className="my-1.5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {isEditMode ? '이동 가능' : appMode === 'praise' ? '누적 칭찬' : '누적 지도'}
                    </span>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-xs font-black shadow-2xs ${
                        isEditMode
                          ? 'bg-indigo-100 text-indigo-700 font-bold'
                          : appMode === 'praise'
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
                      {isEditMode ? '교환' : `${totalCount}회`}
                    </span>
                  </div>

                  {/* Bottom: Quick View Indicator */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 group-hover:text-orange-600 transition-colors">
                    <span>
                      {rowIdx + 1}줄-{colIdx + 1}분단
                    </span>
                    <ChevronRight size={12} />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Unseated Students Shelf (미배치 학생 보관함) */}
      {isEditMode && unseatedStudents.length > 0 && (
        <div className="mt-8 rounded-2xl border border-amber-300 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
            <span>📌 아직 자리가 배정되지 않은 학생 ({unseatedStudents.length}명)</span>
            <span className="text-[11px] font-normal text-amber-700 dark:text-amber-300">
              학생을 클릭한 뒤 원하는 빈 책상을 클릭하거나 드래그하세요.
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {unseatedStudents.map((std) => (
              <button
                key={std.id}
                type="button"
                draggable
                onDragStart={(e) => handleUnseatedDragStart(e, std.id)}
                onClick={() =>
                  setSelectedUnseatedId(selectedUnseatedId === std.id ? null : std.id)
                }
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                  selectedUnseatedId === std.id
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                    : 'border-amber-300 bg-white text-slate-800 hover:border-amber-400 dark:border-amber-800 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                <span>{std.number}번</span>
                <span>{std.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Classroom Seating Legend */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-4 dark:border-slate-800">
        <span>💡 교실 책상 배치를 그대로 보며 학생을 클릭해 즉시 기록하거나 상세 이력을 확인할 수 있습니다.</span>
      </div>
    </div>
  );
};

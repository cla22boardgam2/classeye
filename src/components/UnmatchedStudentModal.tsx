'use client';

import React from 'react';
import { Student } from '@/types';
import { User, X, Check, AlertTriangle } from './icons';

interface UnmatchedStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  unmatchedData: {
    rawText: string;
    behaviorTag: string;
    period: string;
  } | null;
  students: Student[];
  onSelectStudent: (student: Student) => void;
}

export const UnmatchedStudentModal: React.FC<UnmatchedStudentModalProps> = ({
  isOpen,
  onClose,
  unmatchedData,
  students,
  onSelectStudent,
}) => {
  if (!isOpen || !unmatchedData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              학생을 특정하지 못했습니다
            </h3>
            <p className="text-xs text-slate-500">
              해당 행동을 기록할 학생을 클릭하여 즉시 저장하세요.
            </p>
          </div>
        </div>

        {/* Parsed info card */}
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-850">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-500">분석된 행동:</span>
            <span className="rounded-md bg-orange-100 px-2 py-0.5 font-bold text-orange-700 dark:bg-orange-950 dark:text-orange-300">
              {unmatchedData.behaviorTag}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-semibold text-slate-500">교시:</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {unmatchedData.period}
            </span>
          </div>
          <div className="mt-2 text-slate-600 dark:text-slate-400 italic">
            "{unmatchedData.rawText}"
          </div>
        </div>

        {/* Student Quick Select Grid */}
        <div className="mt-4">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            학생 선택 ({students.length}명)
          </label>
          <div className="mt-2 grid max-h-60 grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto pr-1">
            {students.map((student) => (
              <button
                key={student.id}
                type="button"
                onClick={() => onSelectStudent(student)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 text-left text-xs font-semibold text-slate-800 shadow-xs hover:border-orange-500 hover:bg-orange-50 hover:text-orange-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-orange-500 dark:hover:bg-orange-950/40 dark:hover:text-orange-300 transition-all active:scale-95"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                  {student.number}
                </span>
                <span className="truncate">{student.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cancel button */}
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, Check } from './icons';
import { AppSettings, BehaviorRecord, Student } from '@/types';
import { STANDARD_BEHAVIOR_TAGS } from '@/lib/constants';
import { downloadFile, generateCSVExport } from '@/lib/storage';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  records: BehaviorRecord[];
  settings: AppSettings;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  students,
  records,
  settings,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const tags = STANDARD_BEHAVIOR_TAGS.map((t) => t.tag);

  const handleDownloadCSV = () => {
    const csvContent = generateCSVExport(students, records, tags);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(`초등생활지도_행동누적기록_${dateStr}.csv`, csvContent, 'text/csv;charset=utf-8;');
  };

  const handleCopySummary = () => {
    const csvContent = generateCSVExport(students, records, tags);
    navigator.clipboard.writeText(csvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              데이터 내보내기 (Export)
            </h3>
            <p className="text-xs text-slate-500">
              엑셀 및 CSV 호환 파일로 생활지도 누적 데이터를 다운로드합니다.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {/* CSV / Excel Button */}
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="flex w-full items-center justify-between rounded-2xl border border-emerald-300 bg-emerald-50/50 p-4 text-left hover:bg-emerald-100/60 dark:border-emerald-800 dark:bg-emerald-950/30 transition-all"
          >
            <div>
              <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                <FileSpreadsheet size={18} />
                <span>엑셀 / CSV 파일 다운로드 (.csv)</span>
              </div>
              <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
                UTF-8 BOM 적용으로 한글 깨짐 없이 Excel에서 바로 열립니다.
              </p>
            </div>
            <Download size={18} className="text-emerald-600" />
          </button>

          {/* Copy to clipboard button */}
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 transition-all"
          >
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                클립보드로 전체 데이터 복사
              </div>
              <p className="text-[11px] text-slate-400">
                메신저나 한글 문서에 바로 붙여넣을 수 있습니다.
              </p>
            </div>
            {copied ? (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                <Check size={14} /> 복사됨
              </span>
            ) : (
              <span className="text-xs text-slate-400">복사</span>
            )}
          </button>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

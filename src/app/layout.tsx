import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '초등 생활지도 행동누적 대시보드 | 실시간 카운터 및 상담 근거 시스템',
  description:
    '초등학교 교사용 자연어 기반 학생별 문제행동 빈도수(Frequency) 실시간 집계 및 시각화 대시보드',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans selection:bg-orange-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

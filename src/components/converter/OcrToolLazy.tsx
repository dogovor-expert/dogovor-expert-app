'use client';

import dynamic from 'next/dynamic';

// Ленивая загрузка тяжёлого компонента OCR
const OcrTool = dynamic(
  () => import('./OcrTool').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-gray-500">Загрузка OCR...</div>
      </div>
    ),
  }
);

export function OcrToolLazy() {
  return <OcrTool />;
}
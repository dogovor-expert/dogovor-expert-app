"use client";

import dynamic from "next/dynamic";

const MergePdf = dynamic(() => import("@/components/converter/MergePdf"), { ssr: false });
const SplitPdf = dynamic(() => import("@/components/converter/SplitPdf"), { ssr: false });
const OrganizePages = dynamic(() => import("@/components/converter/OrganizePages"), { ssr: false });
const CompressPdf = dynamic(() => import("@/components/converter/CompressPdf"), { ssr: false });
const ImagesToPdf = dynamic(() => import("@/components/converter/ImagesToPdf"), { ssr: false });
const PdfToImages = dynamic(() => import("@/components/converter/PdfToImages"), { ssr: false });
const DocxToPrint = dynamic(() => import("@/components/converter/DocxToPrint"), { ssr: false });
const OcrTool = dynamic(() => import("@/components/converter/OcrTool"), { ssr: false });
const SignPdf = dynamic(() => import("@/components/converter/SignPdf"), { ssr: false });
const Watermark = dynamic(() => import("@/components/converter/Watermark"), { ssr: false });
const PageNumbers = dynamic(() => import("@/components/converter/PageNumbers"), { ssr: false });
const PdfToText = dynamic(() => import("@/components/converter/PdfToText"), { ssr: false });
const PdfToWord = dynamic(() => import("@/components/converter/PdfToWord"), { ssr: false });
const TextToPdf = dynamic(() => import("@/components/converter/TextToPdf"), { ssr: false });
const RedactPdf = dynamic(() => import("@/components/converter/RedactPdf"), { ssr: false });

const COMPONENTS: Record<string, React.ComponentType> = {
  merge: MergePdf,
  split: SplitPdf,
  organize: OrganizePages,
  compress: CompressPdf,
  img2pdf: ImagesToPdf,
  pdf2img: PdfToImages,
  docx: DocxToPrint,
  ocr: OcrTool,
  sign: SignPdf,
  watermark: Watermark,
  pagenum: PageNumbers,
  pdf2text: PdfToText,
  pdf2word: PdfToWord,
  text2pdf: TextToPdf,
  redact: RedactPdf,
};

/**
 * Монтирует компонент конкретного инструмента конвертера по его id.
 * Используется на SEO-страницах `/converter/[tool]`.
 */
export default function ConverterRunner({ id }: { id: string }) {
  const Component = COMPONENTS[id];
  if (!Component) return null;
  return <Component />;
}

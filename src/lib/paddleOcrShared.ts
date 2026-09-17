/** Shared types for PaddleOCR module. */

export interface FallbackOcrResult {
  text: string;
  confidence: number;
  lines: { text: string; confidence: number; quad: number[][] }[];
}

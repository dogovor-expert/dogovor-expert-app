export type Severity = "info" | "watch" | "warning" | "critical";

export type ChangeKind = "add" | "remove" | "unchanged";

export interface RiskTag {
  id: string;
  label: string;
  severity: Severity;
  quote: string;
  explainer: string;
}

export interface Snapshot {
  id: string;
  capturedAt: string; // ISO string
  hash: string; // SHA-256 style hex, precomputed for the demo
  html: string; // hand-written snippet representing the archived page
  previewPalette: [string, string]; // gradient colors for the mini render preview
  headline: string;
  summary: string;
  risks: RiskTag[];
  metrics: {
    words: number;
    clauses: number;
    prices?: string; // optional headline number
  };
}

export interface WatchedPage {
  id: string;
  slug: string;
  service: string;
  documentTitle: string;
  url: string;
  favicon: string; // single emoji or letter for the demo
  category: "Маркетплейс" | "Банк" | "SaaS" | "Сервис доставки" | "Оператор связи" | "Каршеринг";
  color: string;
  followers: number; // how many Chronoleaf users watch it
  snapshots: Snapshot[]; // most recent first
}

export interface AlertItem {
  id: string;
  pageId: string;
  snapshotId: string;
  createdAt: string;
  severity: Severity;
  title: string;
  detail: string;
  clauseQuote: string;
  actionLabel: string;
}

export type ViewId = "dashboard" | "watchlist" | "diff" | "snapshot" | "alerts" | "capture" | "how";

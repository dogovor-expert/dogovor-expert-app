export type ToolId = 'redactor' | 'images' | 'audio' | 'pdf' | 'history';
export type NoticeType = 'success' | 'error' | 'info';
export type Notify = (message: string, type?: NoticeType) => void;

export interface UploadBatch {
  id: string;
  files: File[];
}

export interface HistoryEntry {
  id: string;
  name: string;
  tool: ToolId;
  size: number;
  time: Date;
}

export interface ToolProps {
  batch?: UploadBatch;
  onOpen: () => void;
  notify: Notify;
  onExport: (name: string, size: number, tool: ToolId) => void;
  active?: boolean;
}
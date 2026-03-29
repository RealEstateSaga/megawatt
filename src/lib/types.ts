export interface LeadRecord {
  id: string;
  address: string;
  addressKey: string;
  ownerLastName: string;
  mailingAddress1: string;
  mailingAddress2: string;
  status: "GOOD" | "BAD" | "PENDING";
  analysisReason: string;
  offMarketDate: string | null;
  saleDate: string | null;
  lastRecordingDate: string | null;
  hasTaxData: boolean;
  hasHistoryData: boolean;
}

export type SortField = keyof Pick<LeadRecord, 'status' | 'address' | 'ownerLastName' | 'mailingAddress1' | 'mailingAddress2' | 'offMarketDate' | 'saleDate' | 'lastRecordingDate' | 'analysisReason'>;
export type SortDirection = 'asc' | 'desc';

export interface FileQueueItem {
  id: string;
  file: File;
  status: 'queued' | 'processing' | 'done' | 'failed';
  error?: string;
  leadsFound?: number;
}

export interface FailedUpload {
  id: string;
  fileName: string;
  reason: string;
  timestamp: Date;
}

export interface LeadRecord {
  id: string;
  address: string;
  ownerLastName: string;
  mailingAddress1: string;
  mailingAddress2: string;
  status: "GOOD" | "BAD";
  analysisReason: string;
  offMarketDate: string | null;
  saleDate: string | null;
  lastRecordingDate: string | null;
}

export type SortField = keyof Pick<LeadRecord, 'status' | 'address' | 'ownerLastName' | 'mailingAddress1' | 'mailingAddress2' | 'offMarketDate' | 'saleDate' | 'lastRecordingDate' | 'analysisReason'>;
export type SortDirection = 'asc' | 'desc';

export interface LeadRecord {
  id: string;
  address: string;
  ownerLastName: string;
  mailingAddress1: string;
  mailingAddress2: string;
  status: "GOOD - PROSPECT" | "BAD - SOLD";
  analysisReason: string;
  offMarketDate: string | null;
  saleDate: string | null;
}

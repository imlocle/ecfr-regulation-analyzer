export interface AgencyMetric {
  agencyName: string;
  agencySlug: string;
  shortName: string | null;
  cfrTitles: number[];
  wordCount: number;
  checksum: string | null;
  numTitles: number;
  avgWordsPerTitle: number;
  totalAmendments?: number;
  regulatoryBurdenScore?: number;
}

export interface ChangeRecord {
  period: string;
  amendmentCount: number;
}

export interface Summary {
  lastUpdated: string;
  titlesDownloaded: number;
  agenciesProcessed: number;
  historyPeriods: number;
}

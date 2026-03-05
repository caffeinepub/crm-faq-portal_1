export interface Entry {
  id: bigint;
  status: string;
  title: string;
  entryType: string;
  area: string;
  createdAt: bigint;
  team: string;
  description: string;
  instructions: string;
  updatedAt: bigint;
  reportedBy: string;
  dependency: string;
  notes: string;
  resolveDate?: bigint;
}

export interface Stats {
  howToCount: bigint;
  featureCount: bigint;
  issueCount: bigint;
  bugFixCount: bigint;
  pendingCount: bigint;
  completedCount: bigint;
  totalCount: bigint;
}

export interface AppSettings {
  areaOptions: string[];
  teamOptions: string[];
  labels: [string, string][];
  logoUrl: string;
  bannerUrl: string;
  typeOptions: string[];
}

export type EntryType = "Issue" | "Bug Fix" | "How-To" | "Feature";
export type NavPage =
  | "dashboard"
  | "entries"
  | "new-entry"
  | "edit-entry"
  | "settings";

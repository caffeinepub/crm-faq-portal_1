export const TYPE_CONFIG: Record<
  string,
  {
    label: string;
    badgeClass: string;
    statClass: string;
    statBgClass: string;
    statBorderClass: string;
    icon: string;
  }
> = {
  Issue: {
    label: "Issue",
    badgeClass: "badge-issue",
    statClass: "stat-issue",
    statBgClass: "stat-issue-bg",
    statBorderClass: "stat-issue-border",
    icon: "⚠️",
  },
  "Bug Fix": {
    label: "Bug Fix",
    badgeClass: "badge-bugfix",
    statClass: "stat-bugfix",
    statBgClass: "stat-bugfix-bg",
    statBorderClass: "stat-bugfix-border",
    icon: "🐛",
  },
  "How-To": {
    label: "How-To",
    badgeClass: "badge-howto",
    statClass: "stat-howto",
    statBgClass: "stat-howto-bg",
    statBorderClass: "stat-howto-border",
    icon: "📖",
  },
  Feature: {
    label: "Feature",
    badgeClass: "badge-feature",
    statClass: "stat-feature",
    statBgClass: "stat-feature-bg",
    statBorderClass: "stat-feature-border",
    icon: "✨",
  },
};

export const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  Open: {
    label: "Open",
    className: "status-open",
  },
  "In Progress": {
    label: "In Progress",
    className: "status-in-progress",
  },
  Resolved: {
    label: "Resolved",
    className: "status-resolved",
  },
  Closed: {
    label: "Closed",
    className: "status-closed",
  },
  "Not Feasible": {
    label: "Not Feasible",
    className: "status-not-feasible",
  },
};

export function getTypeConfig(type: string) {
  return (
    TYPE_CONFIG[type] ?? {
      label: type,
      badgeClass: "bg-muted text-muted-foreground border-border",
      statClass: "text-muted-foreground",
      statBgClass: "bg-muted",
      statBorderClass: "border-border",
      icon: "📝",
    }
  );
}

export function getStatusConfig(status: string) {
  return (
    STATUS_CONFIG[status] ?? {
      label: status,
      className: "bg-muted text-muted-foreground border-border",
    }
  );
}

export function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime()) || date.getFullYear() < 2020) {
    return new Date().toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Converts a bigint nanosecond timestamp to "YYYY-MM-DD" string
 */
export function nanosecondsToDateString(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime()) || date.getFullYear() < 2000) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Converts "YYYY-MM-DD" string to bigint nanoseconds (Unix ms * 1_000_000).
 * Returns null if the string is empty or invalid.
 */
export function dateStringToNanoseconds(dateStr: string): bigint | null {
  if (!dateStr || !dateStr.trim()) return null;
  const ms = Date.parse(dateStr);
  if (Number.isNaN(ms)) return null;
  return BigInt(ms) * 1_000_000n;
}

export const DEFAULT_LABELS: [string, string][] = [
  ["app_title", "CRM FAQ Portal"],
  ["app_subtitle", "Knowledge Base & Issue Tracker"],
  ["nav_dashboard", "Dashboard"],
  ["nav_entries", "Entries"],
  ["nav_new_entry", "New Entry"],
  ["nav_settings", "Settings"],
  ["dashboard_title", "Overview"],
  ["dashboard_subtitle", "Recent activity and key metrics"],
  ["stat_issues_label", "Issues"],
  ["stat_bugfixes_label", "Bug Fixes"],
  ["stat_howtos_label", "How-Tos"],
  ["stat_features_label", "Features"],
  ["entries_title", "All Entries"],
  ["entries_subtitle", "Browse and manage all knowledge base entries"],
  ["new_entry_title", "New Entry"],
  ["new_entry_subtitle", "Create a new entry in the knowledge base"],
  ["settings_title", "Settings"],
  ["settings_subtitle", "Customize your portal"],
];

export function getLabel(
  labels: [string, string][],
  key: string,
  defaultLabels: [string, string][],
): string {
  const found = labels.find(([k]) => k === key);
  if (found) return found[1];
  const def = defaultLabels.find(([k]) => k === key);
  return def ? def[1] : key;
}

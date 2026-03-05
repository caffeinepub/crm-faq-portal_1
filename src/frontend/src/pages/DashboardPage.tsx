import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Bug,
  CheckCircle2,
  Clock,
  Hash,
  Hourglass,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatusBadge } from "../components/StatusBadge";
import { TypeBadge } from "../components/TypeBadge";
import { useEntries, useSettings, useStats } from "../hooks/useQueries";
import type { Entry, NavPage } from "../types";
import {
  DEFAULT_LABELS,
  formatDate,
  getLabel,
  nanosecondsToDateString,
} from "../utils/entryUtils";

interface DashboardPageProps {
  onNavigate: (page: NavPage, entryId?: bigint) => void;
}

const STAT_CARDS = [
  {
    key: "issues",
    labelKey: "stat_issues_label",
    defaultLabel: "Issue",
    subLabel: "entries",
    icon: AlertCircle,
    colorClass: "stat-issue",
    iconBgClass: "stat-issue-bg",
    iconColorClass: "stat-issue-icon",
    topBorderClass: "stat-issue-top",
    ocid: "dashboard.issues.card",
  },
  {
    key: "bugfixes",
    labelKey: "stat_bugfixes_label",
    defaultLabel: "Bug Fix",
    subLabel: "entries",
    icon: Bug,
    colorClass: "stat-bugfix",
    iconBgClass: "stat-bugfix-bg",
    iconColorClass: "stat-bugfix-icon",
    topBorderClass: "stat-bugfix-top",
    ocid: "dashboard.bugfixes.card",
  },
  {
    key: "howtos",
    labelKey: "stat_howtos_label",
    defaultLabel: "How-To Guide",
    subLabel: "entries",
    icon: BookOpen,
    colorClass: "stat-howto",
    iconBgClass: "stat-howto-bg",
    iconColorClass: "stat-howto-icon",
    topBorderClass: "stat-howto-top",
    ocid: "dashboard.howtos.card",
  },
  {
    key: "features",
    labelKey: "stat_features_label",
    defaultLabel: "Feature Request",
    subLabel: "entries",
    icon: Sparkles,
    colorClass: "stat-feature",
    iconBgClass: "stat-feature-bg",
    iconColorClass: "stat-feature-icon",
    topBorderClass: "stat-feature-top",
    ocid: "dashboard.features.card",
  },
];

function getStatCount(
  key: string,
  stats:
    | {
        howToCount: bigint;
        featureCount: bigint;
        issueCount: bigint;
        bugFixCount: bigint;
        pendingCount: bigint;
        completedCount: bigint;
        totalCount: bigint;
      }
    | undefined,
): bigint {
  if (!stats) return 0n;
  switch (key) {
    case "issues":
      return stats.issueCount;
    case "bugfixes":
      return stats.bugFixCount;
    case "howtos":
      return stats.howToCount;
    case "features":
      return stats.featureCount;
    default:
      return 0n;
  }
}

// Icon component for the type circle in activity rows
function TypeIcon({ type }: { type: string }) {
  if (type === "Issue") {
    return (
      <div className="w-9 h-9 rounded-full stat-issue-bg flex items-center justify-center shrink-0">
        <AlertCircle className="w-4 h-4 stat-issue-icon" />
      </div>
    );
  }
  if (type === "Bug Fix") {
    return (
      <div className="w-9 h-9 rounded-full stat-bugfix-bg flex items-center justify-center shrink-0">
        <Bug className="w-4 h-4 stat-bugfix-icon" />
      </div>
    );
  }
  if (type === "How-To") {
    return (
      <div className="w-9 h-9 rounded-full stat-howto-bg flex items-center justify-center shrink-0">
        <BookOpen className="w-4 h-4 stat-howto-icon" />
      </div>
    );
  }
  if (type === "Feature") {
    return (
      <div className="w-9 h-9 rounded-full stat-feature-bg flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4 stat-feature-icon" />
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
      <BookOpen className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}

// Custom tooltip for TAT chart
function TATTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { fullTitle: string; days: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const { fullTitle, days } = payload[0].payload;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold text-foreground truncate max-w-48">
        {fullTitle}
      </p>
      <p className="text-primary font-bold mt-0.5">{days} days to resolve</p>
    </div>
  );
}

const STATUS_OPTIONS_FILTER = [
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
  "Not Feasible",
];
const TYPE_OPTIONS_FILTER = ["Issue", "Bug Fix", "How-To", "Feature"];

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: entries, isLoading: entriesLoading } = useEntries();
  const { data: settings } = useSettings();

  // TAT chart filters
  const [tatStartDate, setTatStartDate] = useState("");
  const [tatEndDate, setTatEndDate] = useState("");
  const [tatStatus, setTatStatus] = useState("all");
  const [tatType, setTatType] = useState("all");

  const labels = settings?.labels ?? [];
  const recentEntries = [...(entries ?? [])]
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    .slice(0, 10);

  const dashTitle = getLabel(labels, "dashboard_title", DEFAULT_LABELS);

  // total count for subtitle
  const totalCount = entries?.length ?? 0;

  // Build TAT chart data
  const tatEntries = (entries ?? []).filter((e: Entry) => {
    if (!e.resolveDate) return false;

    // Date range filter (by creation date)
    if (tatStartDate) {
      const creationDateStr = nanosecondsToDateString(e.createdAt);
      if (creationDateStr < tatStartDate) return false;
    }
    if (tatEndDate) {
      const creationDateStr = nanosecondsToDateString(e.createdAt);
      if (creationDateStr > tatEndDate) return false;
    }
    if (tatStatus !== "all" && e.status !== tatStatus) return false;
    if (tatType !== "all" && e.entryType !== tatType) return false;

    return true;
  });

  const tatChartData = tatEntries.map((e: Entry) => {
    const days = Math.round(
      (Number(e.resolveDate) - Number(e.createdAt)) / (1e9 * 86400),
    );
    return {
      name: e.title.length > 18 ? `${e.title.substring(0, 18)}…` : e.title,
      fullTitle: e.title,
      days: Math.max(0, days),
    };
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
          {dashTitle}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {totalCount} total entries across all categories
        </p>
      </div>

      {/* Summary Metrics (Pending / Completed / Total Requests) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Pending */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0, duration: 0.3 }}
          data-ocid="dashboard.pending.card"
        >
          <div className="rounded-xl bg-card border border-border border-t-2 border-t-amber-500 p-5 shadow-card">
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <Hourglass className="w-[18px] h-[18px] text-amber-400" />
              </div>
            </div>
            {statsLoading ? (
              <Skeleton className="h-10 w-14 mb-2" />
            ) : (
              <div className="font-display text-4xl font-black leading-none mb-1.5 text-amber-400">
                {(stats?.pendingCount ?? 0n).toString()}
              </div>
            )}
            <div className="text-sm font-semibold text-foreground/80 leading-tight">
              Total Pending
            </div>
            <div className="text-xs text-muted-foreground">issues</div>
          </div>
        </motion.div>

        {/* Total Completed */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07, duration: 0.3 }}
          data-ocid="dashboard.completed.card"
        >
          <div className="rounded-xl bg-card border border-border border-t-2 border-t-emerald-500 p-5 shadow-card">
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 className="w-[18px] h-[18px] text-emerald-400" />
              </div>
            </div>
            {statsLoading ? (
              <Skeleton className="h-10 w-14 mb-2" />
            ) : (
              <div className="font-display text-4xl font-black leading-none mb-1.5 text-emerald-400">
                {(stats?.completedCount ?? 0n).toString()}
              </div>
            )}
            <div className="text-sm font-semibold text-foreground/80 leading-tight">
              Total Completed
            </div>
            <div className="text-xs text-muted-foreground">issues</div>
          </div>
        </motion.div>

        {/* Total Requests */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.3 }}
          data-ocid="dashboard.total.card"
        >
          <div className="rounded-xl bg-card border border-border border-t-2 border-t-violet-500 p-5 shadow-card">
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center">
                <Hash className="w-[18px] h-[18px] text-violet-400" />
              </div>
            </div>
            {statsLoading ? (
              <Skeleton className="h-10 w-14 mb-2" />
            ) : (
              <div className="font-display text-4xl font-black leading-none mb-1.5 text-violet-400">
                {(stats?.totalCount ?? 0n).toString()}
              </div>
            )}
            <div className="text-sm font-semibold text-foreground/80 leading-tight">
              Total Requests
            </div>
            <div className="text-xs text-muted-foreground">all entries</div>
          </div>
        </motion.div>
      </div>

      {/* Type Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card, i) => {
          const Icon = card.icon;
          const count = getStatCount(card.key, stats);
          const label = getLabel(labels, card.labelKey, DEFAULT_LABELS);

          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 + 0.2, duration: 0.3 }}
              data-ocid={card.ocid}
            >
              <button
                type="button"
                onClick={() => onNavigate("entries")}
                className={`w-full text-left rounded-xl bg-card border border-border border-t-2 ${card.topBorderClass} p-5 hover:bg-accent/30 transition-colors group shadow-card`}
              >
                {/* Icon row */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-9 h-9 rounded-lg ${card.iconBgClass} flex items-center justify-center`}
                  >
                    <Icon
                      className={`w-[18px] h-[18px] ${card.iconColorClass}`}
                    />
                  </div>
                </div>

                {/* Count */}
                {statsLoading ? (
                  <Skeleton
                    className="h-10 w-14 mb-2"
                    data-ocid="dashboard.loading_state"
                  />
                ) : (
                  <div
                    className={`font-display text-4xl font-black leading-none mb-1.5 ${card.colorClass}`}
                  >
                    {count.toString()}
                  </div>
                )}

                {/* Label */}
                <div className="text-sm font-semibold text-foreground/80 leading-tight">
                  {label}
                </div>
                <div className="text-xs text-muted-foreground mb-3">
                  {card.subLabel}
                </div>

                {/* View all link */}
                <div
                  className={`text-xs font-semibold flex items-center gap-1 ${card.colorClass} group-hover:gap-1.5 transition-all`}
                >
                  View all <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* TAT Timeline Chart */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary/70" />
              <h2 className="font-display text-lg font-semibold text-foreground">
                TAT Timeline — Days to Resolve
              </h2>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Turnaround time per resolved entry (entries with a Resolve Date set)
          </p>

          {/* TAT Filters */}
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-2">
              <label
                htmlFor="tat-start-date"
                className="text-xs text-muted-foreground whitespace-nowrap"
              >
                From
              </label>
              <input
                id="tat-start-date"
                type="date"
                value={tatStartDate}
                onChange={(e) => setTatStartDate(e.target.value)}
                data-ocid="dashboard.tat.start_date.input"
                className="h-8 rounded-md border border-border bg-input text-foreground text-xs px-2 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="tat-end-date"
                className="text-xs text-muted-foreground whitespace-nowrap"
              >
                To
              </label>
              <input
                id="tat-end-date"
                type="date"
                value={tatEndDate}
                onChange={(e) => setTatEndDate(e.target.value)}
                data-ocid="dashboard.tat.end_date.input"
                className="h-8 rounded-md border border-border bg-input text-foreground text-xs px-2 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <select
              value={tatStatus}
              onChange={(e) => setTatStatus(e.target.value)}
              data-ocid="dashboard.tat.status.select"
              className="h-8 rounded-md border border-border bg-input text-foreground text-xs px-2 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS_FILTER.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={tatType}
              onChange={(e) => setTatType(e.target.value)}
              data-ocid="dashboard.tat.type.select"
              className="h-8 rounded-md border border-border bg-input text-foreground text-xs px-2 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All Types</option>
              {TYPE_OPTIONS_FILTER.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-4 py-5">
          {entriesLoading ? (
            <div className="space-y-2" data-ocid="dashboard.tat.loading_state">
              <Skeleton className="h-48 w-full" />
            </div>
          ) : tatChartData.length === 0 ? (
            <div
              className="py-12 text-center"
              data-ocid="dashboard.tat.empty_state"
            >
              <Clock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No resolved entries to display
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Set a Resolve Date on entries to see TAT data
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={tatChartData}
                margin={{ top: 8, right: 16, left: 0, bottom: 60 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.26 0.028 268)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "oklch(0.58 0.018 265)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fill: "oklch(0.58 0.018 265)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: "Days",
                    angle: -90,
                    position: "insideLeft",
                    fill: "oklch(0.58 0.018 265)",
                    fontSize: 11,
                  }}
                />
                <Tooltip
                  content={<TATTooltip />}
                  cursor={{ fill: "oklch(0.24 0.03 268 / 0.5)" }}
                />
                <Bar dataKey="days" radius={[4, 4, 0, 0]}>
                  {tatChartData.map((entry) => (
                    <Cell
                      key={entry.fullTitle}
                      fill={
                        entry.days <= 3
                          ? "oklch(0.70 0.16 228)"
                          : entry.days <= 7
                            ? "oklch(0.72 0.18 285)"
                            : entry.days <= 14
                              ? "oklch(0.80 0.18 58)"
                              : "oklch(0.75 0.22 22)"
                      }
                      data-ocid="dashboard.tat.chart_point"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Recent Activity
          </h2>
          <button
            type="button"
            onClick={() => onNavigate("entries")}
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors font-medium"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {entriesLoading ? (
          <div className="space-y-px">
            {Array.from({ length: 5 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : recentEntries.length === 0 ? (
          <div
            className="rounded-xl border border-border bg-card py-16 text-center"
            data-ocid="dashboard.empty_state"
          >
            <div className="w-12 h-12 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No entries yet</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Create your first entry to get started
            </p>
            <button
              type="button"
              onClick={() => onNavigate("new-entry")}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Create entry →
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
            {recentEntries.map((entry, i) => (
              <motion.button
                type="button"
                key={entry.id.toString()}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                data-ocid={`entries.item.${i + 1}`}
                onClick={() => onNavigate("entries", entry.id)}
                className="w-full text-left flex items-center gap-4 px-5 py-4 bg-card hover:bg-accent/25 transition-colors group"
              >
                {/* Type icon circle */}
                <TypeIcon type={entry.entryType} />

                {/* Title + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground truncate">
                      {entry.title}
                    </span>
                    <TypeBadge type={entry.entryType} size="sm" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {entry.area}
                    {entry.team ? (
                      <span className="before:content-['·'] before:mx-1.5">
                        {entry.team}
                      </span>
                    ) : null}
                    {entry.reportedBy ? (
                      <span className="before:content-['·'] before:mx-1.5 text-muted-foreground/70">
                        {entry.reportedBy}
                      </span>
                    ) : null}
                  </p>
                </div>

                {/* Status + date */}
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={entry.status} />
                  <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(entry.createdAt)}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

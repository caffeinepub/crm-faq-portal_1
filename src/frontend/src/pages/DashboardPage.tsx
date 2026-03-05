import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Bug,
  Clock,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { StatusBadge } from "../components/StatusBadge";
import { TypeBadge } from "../components/TypeBadge";
import { useEntries, useSettings, useStats } from "../hooks/useQueries";
import type { NavPage } from "../types";
import { DEFAULT_LABELS, formatDate, getLabel } from "../utils/entryUtils";

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

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: entries, isLoading: entriesLoading } = useEntries();
  const { data: settings } = useSettings();

  const labels = settings?.labels ?? [];
  const recentEntries = [...(entries ?? [])]
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    .slice(0, 10);

  const dashTitle = getLabel(labels, "dashboard_title", DEFAULT_LABELS);

  // total count for subtitle
  const totalCount = entries?.length ?? 0;

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

      {/* Stat Cards */}
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
              transition={{ delay: i * 0.07, duration: 0.3 }}
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

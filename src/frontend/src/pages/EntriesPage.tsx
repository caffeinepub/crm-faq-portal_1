import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  BookOpen,
  Bug,
  Clock,
  Eye,
  FileText,
  Loader2,
  Pencil,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "../components/StatusBadge";
import { TypeBadge } from "../components/TypeBadge";
import {
  useDeleteEntry,
  useEntries,
  useSettings,
  useUpdateEntry,
} from "../hooks/useQueries";
import type { Entry, NavPage } from "../types";
import { DEFAULT_LABELS, formatDate, getLabel } from "../utils/entryUtils";

const STATUS_OPTIONS = [
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
  "Not Feasible",
];

interface EntriesPageProps {
  onNavigate: (page: NavPage) => void;
  focusEntryId?: bigint;
  onClearFocus?: () => void;
}

interface EditFormState {
  title: string;
  description: string;
  entryType: string;
  area: string;
  team: string;
  status: string;
  notes: string;
}

// Matches the TypeIcon pattern from DashboardPage — kept local per spec
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
      <FileText className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}

export function EntriesPage({
  onNavigate,
  focusEntryId,
  onClearFocus,
}: EntriesPageProps) {
  const { data: entries, isLoading } = useEntries();
  const { data: settings } = useSettings();
  const updateEntry = useUpdateEntry();
  const deleteEntry = useDeleteEntry();

  const labels = settings?.labels ?? [];
  const typeOptions = settings?.typeOptions ?? [
    "Issue",
    "Bug Fix",
    "How-To",
    "Feature",
  ];
  const areaOptions = settings?.areaOptions ?? [
    "Sales",
    "Installation",
    "After Sales",
    "Backend / Old UI",
  ];
  const teamOptions = settings?.teamOptions ?? [
    "Brand Team",
    "After Sales Team",
    "Operations Team",
    "Field Service Engineers",
  ];

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterArea, setFilterArea] = useState("all");
  const [filterTeam, setFilterTeam] = useState("all");

  const [viewEntry, setViewEntry] = useState<Entry | null>(null);
  const [editEntry, setEditEntry] = useState<Entry | null>(null);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({
    title: "",
    description: "",
    entryType: "",
    area: "",
    team: "",
    status: "",
    notes: "",
  });

  // Auto-open entry if focusEntryId
  const focusedEntry = focusEntryId
    ? entries?.find((e) => e.id === focusEntryId)
    : undefined;
  if (focusedEntry && !viewEntry && !editEntry) {
    setViewEntry(focusedEntry);
    onClearFocus?.();
  }

  const filtered = (entries ?? []).filter((e) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q);
    const matchType = filterType === "all" || e.entryType === filterType;
    const matchArea = filterArea === "all" || e.area === filterArea;
    const matchTeam = filterTeam === "all" || e.team === filterTeam;
    return matchSearch && matchType && matchArea && matchTeam;
  });

  const pageTitle = getLabel(labels, "entries_title", DEFAULT_LABELS);
  const pageSubtitle = getLabel(labels, "entries_subtitle", DEFAULT_LABELS);

  const openEdit = (entry: Entry) => {
    setEditForm({
      title: entry.title,
      description: entry.description,
      entryType: entry.entryType,
      area: entry.area,
      team: entry.team,
      status: entry.status,
      notes: entry.notes,
    });
    setEditEntry(entry);
    setViewEntry(null);
  };

  const handleUpdate = async () => {
    if (!editEntry) return;
    try {
      await updateEntry.mutateAsync({ id: editEntry.id, ...editForm });
      toast.success("Entry updated");
      setEditEntry(null);
    } catch {
      toast.error("Failed to update entry");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEntry.mutateAsync(deleteId);
      toast.success("Entry deleted");
      setDeleteId(null);
      setViewEntry(null);
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{pageSubtitle}</p>
        </div>
        <Button
          onClick={() => onNavigate("new-entry")}
          data-ocid="entries.new.primary_button"
          className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          + New Entry
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground"
            data-ocid="entries.search.input"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger
            className="w-36 bg-card border-border text-foreground"
            data-ocid="entries.type.select"
          >
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Types</SelectItem>
            {typeOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterArea} onValueChange={setFilterArea}>
          <SelectTrigger
            className="w-40 bg-card border-border text-foreground"
            data-ocid="entries.area.select"
          >
            <SelectValue placeholder="All Areas" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Areas</SelectItem>
            {areaOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterTeam} onValueChange={setFilterTeam}>
          <SelectTrigger
            className="w-44 bg-card border-border text-foreground"
            data-ocid="entries.team.select"
          >
            <SelectValue placeholder="All Teams" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Teams</SelectItem>
            {teamOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Entry Count */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground">
          Showing {filtered.length} of {entries?.length ?? 0} entries
        </p>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-px" data-ocid="entries.loading_state">
          {Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-xl border border-border bg-card py-16 text-center"
          data-ocid="entries.empty_state"
        >
          <div className="w-12 h-12 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
            <FileText className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-muted-foreground">No entries found</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            {entries?.length === 0
              ? "Create your first entry to get started."
              : "Try adjusting your filters."}
          </p>
          {entries?.length === 0 && (
            <button
              type="button"
              onClick={() => onNavigate("new-entry")}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Create entry →
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
          <AnimatePresence>
            {filtered.map((entry, i) => (
              <motion.div
                key={entry.id.toString()}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                data-ocid={`entries.item.${i + 1}`}
                className="flex items-center gap-4 px-5 py-4 bg-card hover:bg-accent/25 transition-colors group"
              >
                {/* Type icon circle */}
                <TypeIcon type={entry.entryType} />

                {/* Title + description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground truncate">
                      {entry.title}
                    </span>
                    <TypeBadge type={entry.entryType} size="sm" />
                  </div>
                  {entry.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {entry.description}
                    </p>
                  )}
                </div>

                {/* Area · Team chip */}
                <div className="hidden md:flex items-center gap-1.5 shrink-0">
                  <span className="text-xs text-muted-foreground hidden lg:block">
                    {entry.area}
                  </span>
                  {entry.team && (
                    <span className="text-xs text-muted-foreground/80 px-2 py-0.5 bg-accent/60 rounded-full border border-border hidden md:block">
                      {entry.team}
                    </span>
                  )}
                </div>

                {/* Status + date */}
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={entry.status} />
                  <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(entry.createdAt)}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 ml-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground hover:bg-accent"
                    onClick={() => setViewEntry(entry)}
                    data-ocid="entry.view.button"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground hover:bg-accent"
                    onClick={() => openEdit(entry)}
                    data-ocid="entry.edit.button"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteId(entry.id)}
                    data-ocid="entry.delete.button"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={!!viewEntry} onOpenChange={(o) => !o && setViewEntry(null)}>
        <DialogContent
          className="max-w-lg bg-card border-border"
          data-ocid="entry.view.dialog"
        >
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              {viewEntry && <TypeBadge type={viewEntry.entryType} />}
              {viewEntry && <StatusBadge status={viewEntry.status} />}
            </div>
            <DialogTitle className="font-display text-xl text-foreground">
              {viewEntry?.title}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="flex gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
                <span>{viewEntry?.area}</span>
                <span>{viewEntry?.team}</span>
                {viewEntry && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(viewEntry.createdAt)}
                  </span>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          {viewEntry?.description && (
            <div>
              <p className="text-sm font-medium text-foreground mb-1.5">
                Description
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {viewEntry.description}
              </p>
            </div>
          )}
          {viewEntry?.notes && (
            <div>
              <p className="text-sm font-medium text-foreground mb-1.5">
                Notes
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {viewEntry.notes}
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setViewEntry(null)}
              className="border-border text-foreground hover:bg-accent"
              data-ocid="entry.view.close_button"
            >
              Close
            </Button>
            {viewEntry && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteId(viewEntry.id);
                    setViewEntry(null);
                  }}
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  data-ocid="entry.delete.button"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                </Button>
                <Button
                  onClick={() => openEdit(viewEntry)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  data-ocid="entry.edit.button"
                >
                  <Pencil className="w-4 h-4 mr-1.5" /> Edit
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editEntry} onOpenChange={(o) => !o && setEditEntry(null)}>
        <DialogContent
          className="max-w-lg bg-card border-border"
          data-ocid="entry.edit.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              Edit Entry
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update the entry details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-foreground/70">Title</Label>
              <Input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, title: e.target.value }))
                }
                className="bg-input border-border text-foreground"
                data-ocid="entry.edit.title.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/70">Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                className="bg-input border-border text-foreground resize-none"
                data-ocid="entry.edit.description.textarea"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-foreground/70">Type</Label>
                <Select
                  value={editForm.entryType}
                  onValueChange={(v) =>
                    setEditForm((p) => ({ ...p, entryType: v }))
                  }
                >
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {typeOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground/70">Area</Label>
                <Select
                  value={editForm.area}
                  onValueChange={(v) => setEditForm((p) => ({ ...p, area: v }))}
                >
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {areaOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground/70">Team</Label>
                <Select
                  value={editForm.team}
                  onValueChange={(v) => setEditForm((p) => ({ ...p, team: v }))}
                >
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {teamOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground/70">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(v) =>
                    setEditForm((p) => ({ ...p, status: v }))
                  }
                >
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/70">Notes</Label>
              <Textarea
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, notes: e.target.value }))
                }
                rows={2}
                className="bg-input border-border text-foreground resize-none"
                data-ocid="entry.edit.notes.textarea"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditEntry(null)}
              className="border-border text-foreground hover:bg-accent"
              data-ocid="entry.edit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateEntry.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="entry.edit.save_button"
            >
              {updateEntry.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent
          className="bg-card border-border"
          data-ocid="entry.delete.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete Entry
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete this entry. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border text-foreground hover:bg-accent"
              data-ocid="entry.delete.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="entry.delete.confirm_button"
              disabled={deleteEntry.isPending}
            >
              {deleteEntry.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

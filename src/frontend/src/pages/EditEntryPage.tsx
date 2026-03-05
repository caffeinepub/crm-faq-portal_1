import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useEntries, useSettings, useUpdateEntry } from "../hooks/useQueries";
import type { NavPage } from "../types";
import {
  dateStringToNanoseconds,
  nanosecondsToDateString,
} from "../utils/entryUtils";

const STATUS_OPTIONS = [
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
  "Not Feasible",
];

const DEPENDENCY_OPTIONS = [
  "Kapture Side",
  "Brand Team",
  "After Sales Team",
  "Operations Team",
  "Management",
];

interface EditEntryPageProps {
  entryId?: bigint;
  onNavigate: (page: NavPage) => void;
}

export function EditEntryPage({ entryId, onNavigate }: EditEntryPageProps) {
  const { identity } = useInternetIdentity();
  const { data: entries } = useEntries();
  const { data: settings } = useSettings();
  const updateEntry = useUpdateEntry();

  const entry = entries?.find((e) => e.id === entryId);

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

  const [form, setForm] = useState({
    title: "",
    description: "",
    entryType: "",
    area: "",
    team: "",
    status: "Open",
    notes: "",
    reportedBy: "",
    dependency: "",
    instructions: "",
    resolveDate: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (entry) {
      setForm({
        title: entry.title,
        description: entry.description,
        entryType: entry.entryType,
        area: entry.area,
        team: entry.team,
        status: entry.status,
        notes: entry.notes,
        reportedBy: entry.reportedBy ?? "",
        dependency: entry.dependency ?? "",
        instructions: entry.instructions ?? "",
        resolveDate: entry.resolveDate
          ? nanosecondsToDateString(entry.resolveDate)
          : "",
      });
    }
  }, [entry]);

  const setField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const e = { ...prev };
        delete e[field];
        return e;
      });
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.entryType) errs.entryType = "Type is required";
    if (!form.area) errs.area = "Area is required";
    if (!form.team) errs.team = "Team is required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry) return;
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    try {
      await updateEntry.mutateAsync({
        id: entry.id,
        ...form,
        resolveDate: dateStringToNanoseconds(form.resolveDate),
      });
      toast.success("Entry updated successfully");
      onNavigate("entries");
    } catch {
      toast.error("Failed to update entry");
    }
  };

  if (!entryId || !entry) {
    return (
      <div className="max-w-2xl animate-fade-in">
        <div className="bg-card border border-border rounded-xl px-6 py-12 text-center">
          <p className="text-muted-foreground mb-4">Entry not found.</p>
          <Button
            variant="outline"
            onClick={() => onNavigate("entries")}
            className="border-border text-foreground hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Entries
          </Button>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="max-w-2xl animate-fade-in">
        <div className="bg-card border border-border rounded-xl px-6 py-12 text-center">
          <p className="text-muted-foreground mb-4">
            Sign in required to edit entries.
          </p>
          <Button
            variant="outline"
            onClick={() => onNavigate("entries")}
            className="border-border text-foreground hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Entries
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate("entries")}
          data-ocid="edit_entry.back.button"
          className="text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            Edit Entry
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Update the details for this entry
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
            <Pencil className="w-5 h-5 text-primary/80" />
            Entry Details
          </h2>
        </div>

        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-title"
                className="text-foreground/70 text-sm font-medium"
              >
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-title"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                data-ocid="edit_entry.title.input"
                className={`bg-input border-border text-foreground placeholder:text-muted-foreground ${
                  errors.title ? "border-destructive" : ""
                }`}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Reported By */}
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-reported-by"
                className="text-foreground/70 text-sm font-medium"
              >
                Reported By
              </Label>
              <Input
                id="edit-reported-by"
                placeholder="Name of the person who reported this..."
                value={form.reportedBy}
                onChange={(e) => setField("reportedBy", e.target.value)}
                data-ocid="edit_entry.reported_by.input"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-description"
                className="text-foreground/70 text-sm font-medium"
              >
                Description
              </Label>
              <Textarea
                id="edit-description"
                placeholder="Provide a detailed description..."
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                data-ocid="edit_entry.description.textarea"
                rows={4}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>

            {/* Instructions */}
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-instructions"
                className="text-foreground/70 text-sm font-medium"
              >
                Step-by-Step Instructions
              </Label>
              <Textarea
                id="edit-instructions"
                placeholder="List steps to reproduce, resolve, or follow..."
                value={form.instructions}
                onChange={(e) => setField("instructions", e.target.value)}
                data-ocid="edit_entry.instructions.textarea"
                rows={4}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>

            {/* Type + Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-foreground/70 text-sm font-medium">
                  Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.entryType}
                  onValueChange={(v) => setField("entryType", v)}
                >
                  <SelectTrigger
                    data-ocid="edit_entry.type.select"
                    className={`bg-input border-border text-foreground ${
                      errors.entryType ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {typeOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.entryType && (
                  <p className="text-xs text-destructive">{errors.entryType}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-foreground/70 text-sm font-medium">
                  Area <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.area}
                  onValueChange={(v) => setField("area", v)}
                >
                  <SelectTrigger
                    data-ocid="edit_entry.area.select"
                    className={`bg-input border-border text-foreground ${
                      errors.area ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select area..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {areaOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.area && (
                  <p className="text-xs text-destructive">{errors.area}</p>
                )}
              </div>
            </div>

            {/* Team + Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-foreground/70 text-sm font-medium">
                  Team <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.team}
                  onValueChange={(v) => setField("team", v)}
                >
                  <SelectTrigger
                    data-ocid="edit_entry.team.select"
                    className={`bg-input border-border text-foreground ${
                      errors.team ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select team..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {teamOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.team && (
                  <p className="text-xs text-destructive">{errors.team}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-foreground/70 text-sm font-medium">
                  Status
                </Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setField("status", v)}
                >
                  <SelectTrigger
                    data-ocid="edit_entry.status.select"
                    className="bg-input border-border text-foreground"
                  >
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

            {/* Dependency + Resolve Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-foreground/70 text-sm font-medium">
                  Dependency
                </Label>
                <Select
                  value={form.dependency}
                  onValueChange={(v) => setField("dependency", v)}
                >
                  <SelectTrigger
                    data-ocid="edit_entry.dependency.select"
                    className="bg-input border-border text-foreground"
                  >
                    <SelectValue placeholder="Select dependency..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="">None</SelectItem>
                    {DEPENDENCY_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="edit-resolve-date"
                  className="text-foreground/70 text-sm font-medium"
                >
                  Resolve Date
                </Label>
                <Input
                  id="edit-resolve-date"
                  type="date"
                  value={form.resolveDate}
                  onChange={(e) => setField("resolveDate", e.target.value)}
                  data-ocid="edit_entry.resolve_date.input"
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-notes"
                className="text-foreground/70 text-sm font-medium"
              >
                Notes
              </Label>
              <Textarea
                id="edit-notes"
                placeholder="Additional notes..."
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                data-ocid="edit_entry.notes.textarea"
                rows={3}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={updateEntry.isPending}
                data-ocid="edit_entry.submit_button"
                className="flex-1 sm:flex-none bg-primary text-primary-foreground hover:bg-primary/90"
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
              <Button
                type="button"
                variant="outline"
                onClick={() => onNavigate("entries")}
                data-ocid="edit_entry.cancel_button"
                className="border-border text-foreground hover:bg-accent"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

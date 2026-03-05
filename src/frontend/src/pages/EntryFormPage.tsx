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
import { Loader2, LogIn, PlusCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateEntry } from "../hooks/useQueries";
import { useSettings } from "../hooks/useQueries";
import type { NavPage } from "../types";
import {
  DEFAULT_LABELS,
  dateStringToNanoseconds,
  getLabel,
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

interface EntryFormPageProps {
  onNavigate: (page: NavPage) => void;
}

export function EntryFormPage({ onNavigate }: EntryFormPageProps) {
  const { identity, login } = useInternetIdentity();
  const { data: settings } = useSettings();
  const createEntry = useCreateEntry();

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

  const pageTitle = getLabel(labels, "new_entry_title", DEFAULT_LABELS);
  const pageSubtitle = getLabel(labels, "new_entry_subtitle", DEFAULT_LABELS);

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
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    try {
      await createEntry.mutateAsync({
        ...form,
        resolveDate: dateStringToNanoseconds(form.resolveDate),
      });
      toast.success("Entry created successfully");
      onNavigate("entries");
    } catch {
      toast.error("Failed to create entry");
    }
  };

  const setField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field])
      setErrors((prev) => {
        const e = { ...prev };
        delete e[field];
        return e;
      });
  };

  // Auth wall — must be signed in to create entries
  if (!identity) {
    return (
      <div className="max-w-2xl animate-fade-in">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{pageSubtitle}</p>
        </div>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-12 flex flex-col items-center text-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <LogIn className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-1">
                Sign in required to create entries
              </h2>
              <p className="text-sm text-muted-foreground max-w-xs">
                You need to be signed in to create, edit, or delete entries in
                this portal.
              </p>
            </div>
            <Button
              onClick={login}
              data-ocid="new_entry.signin_button"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In with Internet Identity
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate("entries")}
              data-ocid="new_entry.cancel_button"
              className="border-border text-foreground hover:bg-accent"
            >
              Back to Entries
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
          {pageTitle}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">{pageSubtitle}</p>
      </div>

      {/* Form card styled to match dark theme */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Card header */}
        <div className="px-6 py-5 border-b border-border">
          <h2 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-primary/80" />
            Entry Details
          </h2>
        </div>

        {/* Card body */}
        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <Label
                htmlFor="entry-title"
                className="text-foreground/70 text-sm font-medium"
              >
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="entry-title"
                placeholder="Describe the issue, fix, or feature..."
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                data-ocid="new_entry.title.input"
                className={`bg-input border-border text-foreground placeholder:text-muted-foreground ${
                  errors.title ? "border-destructive" : ""
                }`}
              />
              {errors.title && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="new_entry.title.error_state"
                >
                  {errors.title}
                </p>
              )}
            </div>

            {/* Reported By */}
            <div className="space-y-1.5">
              <Label
                htmlFor="entry-reported-by"
                className="text-foreground/70 text-sm font-medium"
              >
                Reported By
              </Label>
              <Input
                id="entry-reported-by"
                placeholder="Name of the person who reported this..."
                value={form.reportedBy}
                onChange={(e) => setField("reportedBy", e.target.value)}
                data-ocid="new_entry.reported_by.input"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label
                htmlFor="entry-description"
                className="text-foreground/70 text-sm font-medium"
              >
                Description
              </Label>
              <Textarea
                id="entry-description"
                placeholder="Provide a detailed description..."
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                data-ocid="new_entry.description.textarea"
                rows={4}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-1.5">
              <Label
                htmlFor="entry-instructions"
                className="text-foreground/70 text-sm font-medium"
              >
                Step-by-Step Instructions
              </Label>
              <Textarea
                id="entry-instructions"
                placeholder="List steps to reproduce, resolve, or follow..."
                value={form.instructions}
                onChange={(e) => setField("instructions", e.target.value)}
                data-ocid="new_entry.instructions.textarea"
                rows={4}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>

            {/* Type + Area in a row */}
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
                    data-ocid="new_entry.type.select"
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
                  <p
                    className="text-xs text-destructive"
                    data-ocid="new_entry.type.error_state"
                  >
                    {errors.entryType}
                  </p>
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
                    data-ocid="new_entry.area.select"
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
                  <p
                    className="text-xs text-destructive"
                    data-ocid="new_entry.area.error_state"
                  >
                    {errors.area}
                  </p>
                )}
              </div>
            </div>

            {/* Team + Status in a row */}
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
                    data-ocid="new_entry.team.select"
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
                  <p
                    className="text-xs text-destructive"
                    data-ocid="new_entry.team.error_state"
                  >
                    {errors.team}
                  </p>
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
                    data-ocid="new_entry.status.select"
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
                    data-ocid="new_entry.dependency.select"
                    className="bg-input border-border text-foreground"
                  >
                    <SelectValue placeholder="Select dependency..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
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
                  htmlFor="entry-resolve-date"
                  className="text-foreground/70 text-sm font-medium"
                >
                  Resolve Date
                </Label>
                <Input
                  id="entry-resolve-date"
                  type="date"
                  value={form.resolveDate}
                  onChange={(e) => setField("resolveDate", e.target.value)}
                  data-ocid="new_entry.resolve_date.input"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label
                htmlFor="entry-notes"
                className="text-foreground/70 text-sm font-medium"
              >
                Notes
              </Label>
              <Textarea
                id="entry-notes"
                placeholder="Additional notes, steps to reproduce, etc..."
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                data-ocid="new_entry.notes.textarea"
                rows={3}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={createEntry.isPending}
                data-ocid="new_entry.submit_button"
                className="flex-1 sm:flex-none bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {createEntry.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Entry"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onNavigate("entries")}
                data-ocid="new_entry.cancel_button"
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

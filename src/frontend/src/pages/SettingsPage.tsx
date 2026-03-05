import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Settings2,
  Trash2,
  Type,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSettings, useUpdateSettings } from "../hooks/useQueries";
import type { AppSettings } from "../types";
import { DEFAULT_LABELS, getLabel } from "../utils/entryUtils";

type EditLabelKey = string | null;

interface OptionListProps {
  title: string;
  description: string;
  options: string[];
  onUpdate: (options: string[]) => void;
  saving: boolean;
  inputOcid: string;
  addOcid: string;
  itemOcidPrefix: string;
}

function OptionList({
  title,
  description,
  options,
  onUpdate,
  saving,
  inputOcid,
  addOcid,
  itemOcidPrefix,
}: OptionListProps) {
  const [newVal, setNewVal] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState("");

  const handleAdd = () => {
    const v = newVal.trim();
    if (!v || options.includes(v)) return;
    onUpdate([...options, v]);
    setNewVal("");
  };

  const handleDelete = (idx: number) => {
    onUpdate(options.filter((_, i) => i !== idx));
  };

  const handleEditSave = (idx: number) => {
    const v = editVal.trim();
    if (!v) return;
    const updated = options.map((o, i) => (i === idx ? v : o));
    onUpdate(updated);
    setEditIdx(null);
    setEditVal("");
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <p className="font-display text-sm font-semibold text-foreground">
          {title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="px-5 py-4 space-y-3">
        {/* Current options */}
        <div className="space-y-2">
          {options.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No options yet. Add one below.
            </p>
          ) : (
            options.map((opt, i) => (
              <div
                key={opt}
                className="flex items-center gap-2 group"
                data-ocid={`${itemOcidPrefix}.item.${i + 1}`}
              >
                {editIdx === i ? (
                  <>
                    <Input
                      value={editVal}
                      onChange={(e) => setEditVal(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEditSave(i);
                        if (e.key === "Escape") {
                          setEditIdx(null);
                          setEditVal("");
                        }
                      }}
                      className="h-8 text-sm flex-1 bg-input border-border text-foreground"
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-7 h-7 text-primary hover:text-primary hover:bg-primary/10"
                      onClick={() => handleEditSave(i)}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-7 h-7 text-muted-foreground hover:bg-accent"
                      onClick={() => {
                        setEditIdx(null);
                        setEditVal("");
                      }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm bg-accent/40 rounded-md px-3 py-1.5 border border-border text-foreground">
                      {opt}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground hover:bg-accent"
                      onClick={() => {
                        setEditIdx(i);
                        setEditVal(opt);
                      }}
                      data-ocid={`settings.${itemOcidPrefix}.edit_button.${i + 1}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(i)}
                      data-ocid={`settings.${itemOcidPrefix}.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
        {/* Add new */}
        <div className="flex gap-2 pt-1">
          <Input
            placeholder={`Add new ${title.toLowerCase()} option...`}
            value={newVal}
            onChange={(e) => setNewVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
            className="h-9 text-sm bg-input border-border text-foreground placeholder:text-muted-foreground"
            data-ocid={inputOcid}
            disabled={saving}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={!newVal.trim() || saving}
            data-ocid={addOcid}
            className="shrink-0 border-border text-foreground hover:bg-accent"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [draft, setDraft] = useState<AppSettings | null>(null);
  const [editLabelKey, setEditLabelKey] = useState<EditLabelKey>(null);
  const [editLabelVal, setEditLabelVal] = useState("");

  useEffect(() => {
    if (settings && !draft) {
      const mergedLabels = [
        ...DEFAULT_LABELS.map(([k, v]) => {
          const found = settings.labels.find(([lk]) => lk === k);
          return [k, found ? found[1] : v] as [string, string];
        }),
      ];
      // Also include any extra labels from settings not in defaults
      for (const [k, v] of settings.labels) {
        if (!mergedLabels.find(([lk]) => lk === k)) mergedLabels.push([k, v]);
      }
      setDraft({ ...settings, labels: mergedLabels });
    }
  }, [settings, draft]);

  const pageTitle = getLabel(
    draft?.labels ?? [],
    "settings_title",
    DEFAULT_LABELS,
  );
  const pageSubtitle = getLabel(
    draft?.labels ?? [],
    "settings_subtitle",
    DEFAULT_LABELS,
  );

  const handleSave = async () => {
    if (!draft) return;
    try {
      await updateSettings.mutateAsync(draft);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  const updateDraftLabels = (key: string, value: string) => {
    if (!draft) return;
    const newLabels: [string, string][] = draft.labels.map(([k, v]) =>
      k === key ? [k, value] : [k, v],
    );
    if (!newLabels.find(([k]) => k === key)) newLabels.push([key, value]);
    setDraft({ ...draft, labels: newLabels });
  };

  const openEditLabel = (key: string) => {
    const val = draft?.labels.find(([k]) => k === key)?.[1] ?? "";
    setEditLabelVal(val);
    setEditLabelKey(key);
  };

  const saveLabelEdit = () => {
    if (editLabelKey) {
      updateDraftLabels(editLabelKey, editLabelVal);
    }
    setEditLabelKey(null);
  };

  if (isLoading || !draft) {
    return (
      <div className="space-y-6" data-ocid="settings.loading_state">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const labelGroups = [
    {
      group: "App Identity",
      keys: ["app_title", "app_subtitle"],
    },
    {
      group: "Navigation",
      keys: ["nav_dashboard", "nav_entries", "nav_new_entry", "nav_settings"],
    },
    {
      group: "Dashboard",
      keys: [
        "dashboard_title",
        "dashboard_subtitle",
        "stat_issues_label",
        "stat_bugfixes_label",
        "stat_howtos_label",
        "stat_features_label",
      ],
    },
    {
      group: "Entries",
      keys: ["entries_title", "entries_subtitle"],
    },
    {
      group: "New Entry Form",
      keys: ["new_entry_title", "new_entry_subtitle"],
    },
    {
      group: "Settings Page",
      keys: ["settings_title", "settings_subtitle"],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            {pageTitle}
          </h1>
          <p className="text-muted-foreground mt-1">{pageSubtitle}</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          data-ocid="settings.save_button"
          className="shrink-0"
        >
          {updateSettings.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Save All Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="labels">
        <TabsList className="grid w-full grid-cols-3 h-auto bg-card border border-border">
          <TabsTrigger
            value="labels"
            data-ocid="settings.labels.tab"
            className="gap-2 py-2.5 data-[state=active]:bg-accent data-[state=active]:text-foreground text-muted-foreground"
          >
            <Type className="w-4 h-4" />
            <span>Text Labels</span>
          </TabsTrigger>
          <TabsTrigger
            value="images"
            data-ocid="settings.images.tab"
            className="gap-2 py-2.5 data-[state=active]:bg-accent data-[state=active]:text-foreground text-muted-foreground"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Images</span>
          </TabsTrigger>
          <TabsTrigger
            value="dropdowns"
            data-ocid="settings.dropdowns.tab"
            className="gap-2 py-2.5 data-[state=active]:bg-accent data-[state=active]:text-foreground text-muted-foreground"
          >
            <Settings2 className="w-4 h-4" />
            <span>Dropdowns</span>
          </TabsTrigger>
        </TabsList>

        {/* ======================== TEXT LABELS ======================== */}
        <TabsContent value="labels" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Edit any text label in the app. Changes take effect immediately
            after saving.
          </p>
          {labelGroups.map((group) => (
            <div
              key={group.group}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-border">
                <p className="font-display text-sm font-semibold text-foreground">
                  {group.group}
                </p>
              </div>
              <div className="px-5 py-2">
                {group.keys.map((key, idx) => {
                  const currentVal =
                    draft.labels.find(([k]) => k === key)?.[1] ?? key;
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-3 group py-2 border-b border-border/40 last:border-0"
                    >
                      <span className="text-xs font-mono text-muted-foreground/60 w-44 shrink-0 truncate">
                        {key}
                      </span>
                      <span className="flex-1 text-sm text-foreground truncate">
                        {currentVal}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground hover:bg-accent shrink-0"
                        onClick={() => openEditLabel(key)}
                        data-ocid={`settings.label.edit_button.${idx + 1}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* ======================== IMAGES ======================== */}
        <TabsContent value="images" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Update the logo and banner images. Enter an image URL below.
          </p>

          {/* Logo */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <p className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary/70" /> App Logo
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Shown in the sidebar header
              </p>
            </div>
            <div className="px-5 py-5 space-y-4">
              <div className="flex items-center gap-4">
                {draft.logoUrl ? (
                  <img
                    src={draft.logoUrl}
                    alt="Logo preview"
                    className="w-16 h-16 object-contain rounded-lg border border-border bg-muted"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border bg-muted flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <Label className="text-foreground/70 text-sm">Logo URL</Label>
                  <Input
                    placeholder="https://example.com/logo.png"
                    value={draft.logoUrl}
                    onChange={(e) =>
                      setDraft({ ...draft, logoUrl: e.target.value })
                    }
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                    data-ocid="settings.logo.upload_button"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Banner */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <p className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-primary/70" /> Banner Image
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Optional banner shown at the top of the portal
              </p>
            </div>
            <div className="px-5 py-5 space-y-4">
              {draft.bannerUrl ? (
                <div className="rounded-lg overflow-hidden border border-border aspect-video bg-muted">
                  <img
                    src={draft.bannerUrl}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-border bg-muted/50 aspect-video flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm text-muted-foreground/70">
                      No banner set
                    </p>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-foreground/70 text-sm">Banner URL</Label>
                <Input
                  placeholder="https://example.com/banner.jpg"
                  value={draft.bannerUrl}
                  onChange={(e) =>
                    setDraft({ ...draft, bannerUrl: e.target.value })
                  }
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  data-ocid="settings.banner.upload_button"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ======================== DROPDOWNS ======================== */}
        <TabsContent value="dropdowns" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Manage the options available in entry form dropdowns. Remember to
            save after making changes.
          </p>

          <OptionList
            title="Entry Types"
            description="Types of entries (Issue, Bug Fix, How-To, Feature, etc.)"
            options={draft.typeOptions}
            onUpdate={(opts) => setDraft({ ...draft, typeOptions: opts })}
            saving={updateSettings.isPending}
            inputOcid="settings.type_options.input"
            addOcid="settings.type_options.button"
            itemOcidPrefix="type_options"
          />

          <OptionList
            title="Area / Module Options"
            description="Areas or modules the entry relates to (Sales, Installation, After Sales, etc.)"
            options={draft.areaOptions}
            onUpdate={(opts) => setDraft({ ...draft, areaOptions: opts })}
            saving={updateSettings.isPending}
            inputOcid="settings.area_options.input"
            addOcid="settings.area_options.button"
            itemOcidPrefix="area_options"
          />

          <OptionList
            title="Team Options"
            description="Teams that can report entries (Brand Team, After Sales Team, etc.)"
            options={draft.teamOptions}
            onUpdate={(opts) => setDraft({ ...draft, teamOptions: opts })}
            saving={updateSettings.isPending}
            inputOcid="settings.team_options.input"
            addOcid="settings.team_options.button"
            itemOcidPrefix="team_options"
          />
        </TabsContent>
      </Tabs>

      {/* Edit Label Dialog */}
      <Dialog
        open={editLabelKey !== null}
        onOpenChange={(o) => !o && setEditLabelKey(null)}
      >
        <DialogContent
          className="bg-card border-border"
          data-ocid="settings.label.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              Edit Label
            </DialogTitle>
          </DialogHeader>
          {editLabelKey && (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-mono text-muted-foreground/60 mb-1.5">
                  {editLabelKey}
                </p>
                <Input
                  value={editLabelVal}
                  onChange={(e) => setEditLabelVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveLabelEdit();
                  }}
                  autoFocus
                  className="bg-input border-border text-foreground"
                  data-ocid="settings.label.edit_input"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditLabelKey(null)}
              className="border-border text-foreground hover:bg-accent"
              data-ocid="settings.label.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={saveLabelEdit}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="settings.label.save_button.1"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

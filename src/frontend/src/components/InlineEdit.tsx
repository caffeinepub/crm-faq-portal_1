import { Check, Pencil, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface InlineEditProps {
  value: string;
  onSave: (val: string) => void;
  className?: string;
  inputClassName?: string;
  as?: "span" | "h1" | "h2" | "h3" | "p";
}

export function InlineEdit({
  value,
  onSave,
  className = "",
  inputClassName = "",
  as: Tag = "span",
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const handleSave = () => {
    onSave(draft.trim() || value);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`border border-primary/40 rounded px-2 py-0.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 ${inputClassName}`}
        />
        <button
          type="button"
          onClick={handleSave}
          className="text-emerald-600 hover:text-emerald-700 p-0.5"
          aria-label="Save"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="text-muted-foreground hover:text-foreground p-0.5"
          aria-label="Cancel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </span>
    );
  }

  return (
    <span className={`group inline-flex items-center gap-1 ${className}`}>
      <Tag className={className}>{value}</Tag>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
        aria-label="Edit"
      >
        <Pencil className="w-3 h-3" />
      </button>
    </span>
  );
}

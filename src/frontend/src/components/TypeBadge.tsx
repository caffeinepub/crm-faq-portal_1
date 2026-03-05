import { getTypeConfig } from "../utils/entryUtils";

interface TypeBadgeProps {
  type: string;
  size?: "sm" | "md";
}

export function TypeBadge({ type, size = "md" }: TypeBadgeProps) {
  const config = getTypeConfig(type);
  return (
    <span
      className={`inline-flex items-center border rounded-full font-medium tracking-wide ${config.badgeClass} ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-0.5 text-xs"
      }`}
    >
      {config.label}
    </span>
  );
}

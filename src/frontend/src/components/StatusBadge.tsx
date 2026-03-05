import { getStatusConfig } from "../utils/entryUtils";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = getStatusConfig(status);
  return (
    <span
      className={`inline-flex items-center border rounded-md px-2.5 py-0.5 text-xs font-semibold tracking-wide ${config.className}`}
    >
      {config.label}
    </span>
  );
}

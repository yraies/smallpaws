import { CalendarIcon, ClockIcon, EyeIcon } from "@heroicons/react/24/outline";
import { formatRelativeTime } from "../utils/RelativeDates";

interface ShareInfo {
  shareId: string;
  viewCount: number;
  createdAt: string;
  expiresAt: string | null;
}

interface ShareInfoOverlayProps {
  shareInfo: ShareInfo;
}

export default function ShareInfoOverlay({ shareInfo }: ShareInfoOverlayProps) {
  return (
    <div className="paper-panel absolute top-16 right-4 space-y-1 px-3 py-2 text-xs text-[var(--ink-soft)]">
      <div className="flex items-center">
        <EyeIcon className="mr-1 h-3 w-3 text-[var(--plum)]" />
        <span>{shareInfo.viewCount} views</span>
      </div>
      <div className="flex items-center">
        <CalendarIcon className="mr-1 h-3 w-3 text-[var(--plum)]" />
        <span>Shared {formatRelativeTime(new Date(shareInfo.createdAt))}</span>
      </div>
      <div className="flex items-center">
        <ClockIcon className="mr-1 h-3 w-3 text-[var(--plum)]" />
        <span>
          {shareInfo.expiresAt
            ? `Expires ${formatRelativeTime(new Date(shareInfo.expiresAt))}`
            : "No expiry"}
        </span>
      </div>
    </div>
  );
}

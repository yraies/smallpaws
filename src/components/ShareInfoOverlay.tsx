import { CalendarIcon, ClockIcon, EyeIcon } from "@heroicons/react/24/outline";
import { formatRelativeTime } from "../utils/RelativeDates";

interface ShareInfo {
  shareId: string;
  viewCount: number;
  createdAt: string;
  autoDeleteAt: string | null;
}

interface ShareInfoOverlayProps {
  shareInfo: ShareInfo;
}

export default function ShareInfoOverlay({ shareInfo }: ShareInfoOverlayProps) {
  return (
    <div className="absolute top-14 right-2 space-y-1 border border-complement-200 bg-complement-50 px-3 py-2 text-xs text-complement-700 shadow-sm">
      <div className="flex items-center">
        <EyeIcon className="mr-1 h-3 w-3" aria-hidden="true" />
        <span>{shareInfo.viewCount} views</span>
      </div>
      <div className="flex items-center">
        <CalendarIcon className="mr-1 h-3 w-3" aria-hidden="true" />
        <span>Shared {formatRelativeTime(new Date(shareInfo.createdAt))}</span>
      </div>
      <div className="flex items-center">
        <ClockIcon className="mr-1 h-3 w-3" aria-hidden="true" />
        <span>
          {shareInfo.autoDeleteAt
            ? `Auto-deletes ${formatRelativeTime(new Date(shareInfo.autoDeleteAt))}`
            : "No auto-delete"}
        </span>
      </div>
    </div>
  );
}

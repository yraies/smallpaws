import React from "react";
import { EyeIcon, CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";
import { formatRelativeTime } from "../utils/RelativeDates";

interface ShareInfo {
  shareId: string;
  viewCount: number;
  createdAt: string;
  expiresAt: string;
}

interface ShareInfoOverlayProps {
  shareInfo: ShareInfo;
}

export default function ShareInfoOverlay({ shareInfo }: ShareInfoOverlayProps) {
  return (
    <div className="absolute top-14 right-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700 space-y-1 shadow-sm">
      <div className="flex items-center">
        <EyeIcon className="w-3 h-3 mr-1" />
        <span>{shareInfo.viewCount} views</span>
      </div>
      <div className="flex items-center">
        <CalendarIcon className="w-3 h-3 mr-1" />
        <span>Shared {formatRelativeTime(new Date(shareInfo.createdAt))}</span>
      </div>
      <div className="flex items-center">
        <ClockIcon className="w-3 h-3 mr-1" />
        <span>Expires {formatRelativeTime(new Date(shareInfo.expiresAt))}</span>
      </div>
    </div>
  );
}

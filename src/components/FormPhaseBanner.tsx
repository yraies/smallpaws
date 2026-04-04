import {
  CloudArrowUpIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/16/solid";
import { useFormActions } from "../contexts/FormActionsContext";

type FormPhaseBannerProps = {
  phase: "draft" | "published" | "shared";
};

export default function FormPhaseBanner({ phase }: FormPhaseBannerProps) {
  const { handleClone, handlePublish } = useFormActions();

  const config = {
    draft: {
      badge: "Form Filling",
      badgeClassName: "bg-orange-100 text-orange-700",
      description:
        "Answers are editable here, but the structure comes from a finalized template and stays fixed while you fill it out.",
      actionLabel: "Publish Form",
      actionIcon: <CloudArrowUpIcon className="h-4 w-4" />,
      action: handlePublish,
    },
    published: {
      badge: "Reading Results",
      badgeClassName: "bg-green-100 text-green-700",
      description:
        "This published form is locked. To revise it, create a new local draft copy instead of editing the published result in place.",
      actionLabel: "Create New Draft",
      actionIcon: <DocumentDuplicateIcon className="h-4 w-4" />,
      action: handleClone,
    },
    shared: {
      badge: "Reading Results",
      badgeClassName: "bg-blue-100 text-blue-700",
      description:
        "This shared form is read-only. Create a new local draft if you want to explore your own answers without changing the shared result.",
      actionLabel: "Create New Draft",
      actionIcon: <DocumentDuplicateIcon className="h-4 w-4" />,
      action: handleClone,
    },
  } as const;

  const current = config[phase];

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 print:hidden">
      <span
        className={`rounded px-2 py-1 text-sm font-semibold ${current.badgeClassName}`}
      >
        {current.badge}
      </span>
      <p className="grow text-sm text-neutral-700">{current.description}</p>
      {current.action && (
        <button
          type="button"
          onClick={current.action}
          className="inline-flex cursor-pointer items-center gap-2 rounded border border-violet-500 px-4 py-2 font-semibold text-violet-700 hover:bg-violet-50"
        >
          {current.actionIcon}
          {current.actionLabel}
        </button>
      )}
    </div>
  );
}

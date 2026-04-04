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
      badgeClassName:
        "bg-[var(--paper-accent-soft)] text-[var(--paper-accent)]",
      description:
        "Answers are editable here, but the structure comes from a finalized template and stays fixed while you fill it out.",
      actionLabel: "Publish Form",
      actionIcon: <CloudArrowUpIcon className="h-4 w-4" />,
      action: handlePublish,
    },
    published: {
      badge: "Reading Results",
      badgeClassName: "bg-[var(--plum-soft)] text-[var(--plum)]",
      description:
        "This published form is locked. To revise it, create a new local draft copy instead of editing the published result in place.",
      actionLabel: "Create New Draft",
      actionIcon: <DocumentDuplicateIcon className="h-4 w-4" />,
      action: handleClone,
    },
    shared: {
      badge: "Reading Results",
      badgeClassName: "bg-[var(--plum-soft)] text-[var(--plum)]",
      description:
        "This shared form is read-only. Create a new local draft if you want to explore your own answers without changing the shared result.",
      actionLabel: "Create New Draft",
      actionIcon: <DocumentDuplicateIcon className="h-4 w-4" />,
      action: handleClone,
    },
  } as const;

  const current = config[phase];

  return (
    <div className="paper-panel mb-4 flex w-full max-w-4xl flex-wrap items-center gap-3 px-4 py-3 print:hidden">
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${current.badgeClassName}`}
      >
        {current.badge}
      </span>
      <p className="grow text-sm ink-muted">{current.description}</p>
      {current.action && (
        <button
          type="button"
          onClick={current.action}
          className="tactile-button inline-flex cursor-pointer items-center gap-2 px-4 py-2 font-semibold text-[var(--plum)]"
        >
          {current.actionIcon}
          {current.actionLabel}
        </button>
      )}
    </div>
  );
}

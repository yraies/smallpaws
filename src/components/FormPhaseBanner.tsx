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
      badgeClassName: "text-orange-700",
      description:
        "Answers are editable here, but the structure comes from a finalized template and stays fixed while you fill it out.",
      actionLabel: "Publish Form",
      actionIcon: <CloudArrowUpIcon className="h-4 w-4" />,
      action: handlePublish,
    },
    published: {
      badge: "Reading Results",
      badgeClassName: "text-green-700",
      description:
        "This published form is locked. To revise it, create a new local draft copy instead of editing the published result in place.",
      actionLabel: "Create New Draft",
      actionIcon: <DocumentDuplicateIcon className="h-4 w-4" />,
      action: handleClone,
    },
    shared: {
      badge: "Reading Results",
      badgeClassName: "text-blue-700",
      description:
        "This shared form is read-only. Create a new local draft if you want to explore your own answers without changing the shared result.",
      actionLabel: "Create New Draft",
      actionIcon: <DocumentDuplicateIcon className="h-4 w-4" />,
      action: handleClone,
    },
  } as const;

  const current = config[phase];

  return (
    <div className="mb-3 w-full max-w-lg border-l-4 border-violet-400 bg-white px-3 py-2 print:hidden">
      <p
        className={`text-sm font-semibold uppercase tracking-widest ${current.badgeClassName}`}
      >
        {current.badge}
      </p>
      <p className="text-sm text-neutral-700">{current.description}</p>
      {current.action && (
        <button
          type="button"
          onClick={current.action}
          className="mt-2 inline-flex cursor-pointer items-center gap-2 border-b border-violet-400 px-0 py-1 font-semibold text-violet-700"
        >
          {current.actionIcon}
          {current.actionLabel}
        </button>
      )}
    </div>
  );
}

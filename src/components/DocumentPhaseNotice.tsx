interface DocumentPhaseNoticeProps {
  label: string;
  description: string;
  tone?: "draft" | "finalized" | "published" | "shared";
  meta?: string;
}

const toneClasses = {
  draft: "border-sand-500 text-sand-700",
  finalized: "border-lavender-500 text-lavender-700",
  published: "border-pistachio-500 text-pistachio-700",
  shared: "border-complement-500 text-complement-700",
} as const;

export default function DocumentPhaseNotice({
  label,
  description,
  tone = "draft",
  meta,
}: DocumentPhaseNoticeProps) {
  return (
    <div
      className={`mb-3 w-full max-w-lg border-l-4 bg-sand-50 px-3 py-2 print:hidden ${toneClasses[tone]}`}
    >
      <p className="text-sm font-semibold uppercase tracking-widest">{label}</p>
      <p className="text-sm text-lavender-700">{description}</p>
      {meta && <p className="mt-1 text-xs text-lavender-500">{meta}</p>}
    </div>
  );
}

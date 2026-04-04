import DocumentPhaseNotice from "./DocumentPhaseNotice";

type FormPhaseBannerProps = {
  phase: "draft" | "published" | "shared";
};

export default function FormPhaseBanner({ phase }: FormPhaseBannerProps) {
  const config = {
    draft: {
      label: "Form Filling",
      tone: "draft" as const,
      description:
        "Answers are editable here, but the structure comes from a finalized template and stays fixed while you fill it out.",
    },
    published: {
      label: "Reading Results",
      tone: "published" as const,
      description:
        "This published form is locked. To revise it, create a new local draft copy instead of editing the published result in place.",
    },
    shared: {
      label: "Reading Results",
      tone: "shared" as const,
      description:
        "This shared form is read-only. Create a new local draft if you want to explore your own answers without changing the shared result.",
    },
  } as const;

  const current = config[phase];

  return <DocumentPhaseNotice {...current} />;
}

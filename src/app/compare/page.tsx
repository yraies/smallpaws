"use client";

import {
  HomeIcon,
  PlusIcon,
  PrinterIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import DocumentPhaseNotice from "../../components/DocumentPhaseNotice";
import EdgeActionButton from "../../components/EdgeActionButton";
import LoadingState from "../../components/LoadingState";
import PasswordModal from "../../components/PasswordModal";
import { decryptFormData } from "../../lib/crypto";
import {
  type AnswerOption,
  Form,
  type FormPOJO,
  getEffectiveAnswerOptions,
  getUnsetKey,
} from "../../types/Form";
import {
  buildComparison,
  type ComparisonEntry,
  type ComparisonResult,
} from "../../utils/compareLogic";
import { printCurrentView } from "../../utils/formActions";
import {
  computeStructureFingerprint,
  loadRecentForms,
  loadRecentSharedForms,
  type RecentItemMeta,
  type RecentSharedFormMeta,
} from "../../utils/recentForms";

// ── Types ──

/** Derives a display label for a form in comparison columns. */
function getFormLabel(form: Form, fallbackName: string): string {
  return (
    form.respondentName?.trim() ||
    fallbackName ||
    form.templateName ||
    form.name
  );
}

type LoadedForm = {
  id: string;
  label: string;
  templateName?: string;
  form: Form;
  source: "local" | "share";
};

type PendingPassword = {
  shareId: string;
  formName: string;
  encryptedData?: string;
};

// ── Form loading helpers ──

async function loadLocalPublishedForm(
  formId: string,
): Promise<{ form: Form; name: string; encrypted: boolean } | string> {
  const res = await fetch(`/api/forms/${formId}`);
  if (!res.ok) return `Failed to load form ${formId}`;
  const data = await res.json();
  if (data.encrypted) return "encrypted-local";
  const parsed = JSON.parse(data.data);
  return {
    form: Form.fromPOJO(parsed as FormPOJO),
    name: data.name,
    encrypted: false,
  };
}

async function loadSharedForm(
  shareId: string,
): Promise<
  | { form: Form; name: string; encrypted: false }
  | { requiresPassword: true; formName: string; shareId: string }
  | string
> {
  const res = await fetch(`/api/share/${shareId}`);
  if (res.status === 404) return "Shared form not found";
  if (res.status === 410) return "Shared form has expired";
  if (!res.ok) return "Failed to load shared form";
  const data = await res.json();
  if (data.requiresPassword) {
    return {
      requiresPassword: true,
      formName: data.formName ?? "Shared Form",
      shareId,
    };
  }
  const formData = data.form;
  if (formData.name === "[Deleted]" || formData.data === "{}") {
    return "This shared form has been deleted";
  }
  if (formData.encrypted) {
    return {
      requiresPassword: true,
      formName: formData.name ?? "Shared Form",
      shareId,
    };
  }
  const parsed = JSON.parse(formData.data);
  return {
    form: Form.fromPOJO(parsed as FormPOJO),
    name: formData.name,
    encrypted: false,
  };
}

/**
 * Extracts a share ID from a URL like /share/ABC123 or a full URL.
 * Returns null if the input doesn't look like a share link.
 */
function extractShareId(input: string): string | null {
  const trimmed = input.trim();
  // Direct share ID (alphanumeric)
  if (/^[a-zA-Z0-9_-]+$/.test(trimmed) && trimmed.length > 5) {
    return trimmed;
  }
  // URL with /share/ path
  const match = trimmed.match(/\/share\/([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
}

// ── Comparison display components ──

function SelectionCell({
  selectionKey,
  answerOptions,
}: {
  selectionKey: string;
  answerOptions: AnswerOption[] | undefined;
}) {
  const options = getEffectiveAnswerOptions(answerOptions);
  const unsetKey = getUnsetKey(answerOptions);
  const option =
    options.find((o) => o.key === selectionKey) ?? options[options.length - 1];
  const isUnset = selectionKey === unsetKey;

  return (
    <span
      className={`inline-block rounded-sm px-2 py-0.5 text-xs font-semibold ${
        isUnset ? "bg-sand-100 text-lavender-500" : "text-white"
      }`}
      style={isUnset ? undefined : { backgroundColor: option.color }}
      title={option.label}
    >
      {option.shortLabel}
    </span>
  );
}

function ComparisonTable({
  result,
  labels,
}: {
  result: ComparisonResult;
  labels: string[];
}) {
  return (
    <div className="document-sheet flex flex-col gap-3">
      {result.categories.map((cat) => (
        <section
          key={cat.categoryId}
          className="paper-panel border border-sand-200"
          aria-label={`${cat.categoryName} comparison`}
        >
          <div className="bg-[var(--accent-block)] px-3 py-2">
            <h2 className="small-caps text-lg font-semibold tracking-widest text-white">
              {cat.categoryName}
            </h2>
          </div>
          <div className="bg-sand-50 p-1">
            {/* Header row */}
            <div className="flex items-center gap-2 border-b border-sand-200 px-2 py-1.5 text-xs font-semibold text-lavender-700">
              <span className="min-w-0 flex-1">Question</span>
              {labels.map((label) => (
                <span
                  key={label}
                  className="w-20 shrink-0 text-center"
                  title={label}
                >
                  {label.length > 10 ? `${label.slice(0, 9)}...` : label}
                </span>
              ))}
            </div>
            {/* Question rows */}
            {cat.rows.map((row) => {
              return (
                <div
                  key={row.questionId}
                  className="flex items-center gap-2 px-2 py-1"
                >
                  <span className="min-w-0 flex-1 text-sm">
                    {row.questionText}
                  </span>
                  {row.selections.map((sel, i) => (
                    <span
                      key={labels[i]}
                      className="flex w-20 shrink-0 justify-center"
                    >
                      <SelectionCell
                        selectionKey={sel}
                        answerOptions={result.answerOptions}
                      />
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

// ── Form selector ──

function FormSelector({
  onAddLocal,
  onAddShare,
  existingIds,
  activeFingerprint,
}: {
  onAddLocal: (id: string, name: string) => void;
  onAddShare: (shareId: string) => void;
  existingIds: Set<string>;
  activeFingerprint: string | null;
}) {
  const [recentLocal, setRecentLocal] = React.useState<RecentItemMeta[]>([]);
  const [recentShared, setRecentShared] = React.useState<
    RecentSharedFormMeta[]
  >([]);
  const [shareUrl, setShareUrl] = React.useState("");
  const [shareError, setShareError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const localItems = loadRecentForms(localStorage);
      setRecentLocal(
        localItems.filter(
          (item) =>
            item.kind === "form" &&
            item.phase === "published" &&
            !item.encrypted,
        ),
      );
      setRecentShared(loadRecentSharedForms(localStorage));
    }
  }, []);

  const handleAddShare = () => {
    const shareId = extractShareId(shareUrl);
    if (!shareId) {
      setShareError("Enter a valid share link or share ID");
      return;
    }
    if (existingIds.has(`share:${shareId}`)) {
      setShareError("This form is already in the comparison");
      return;
    }
    setShareError(null);
    setShareUrl("");
    onAddShare(shareId);
  };

  // Filter local forms: exclude already-added ones
  const availableLocal = recentLocal.filter(
    (item) => !existingIds.has(`local:${item.id}`),
  );

  // Filter shared forms: exclude already-added, optionally filter by structure
  const availableShared = recentShared.filter((item) => {
    if (existingIds.has(`share:${item.shareId}`)) return false;
    if (activeFingerprint && item.structureFingerprint !== activeFingerprint)
      return false;
    return true;
  });

  const hasAnySuggestions =
    availableLocal.length > 0 || availableShared.length > 0;

  return (
    <div className="document-sheet mb-3 border border-sand-200 bg-sand-50 px-4 py-3">
      <p className="mb-2 text-sm font-semibold text-lavender-700">
        Add forms to compare
      </p>

      {/* Share link input */}
      <div className="mb-3">
        <label
          htmlFor="share-url-input"
          className="mb-1 block text-xs text-lavender-500"
        >
          Paste a share link or share ID
        </label>
        <div className="flex gap-2">
          <input
            id="share-url-input"
            type="text"
            value={shareUrl}
            onChange={(e) => {
              setShareUrl(e.target.value);
              setShareError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleAddShare()}
            placeholder="https://...share/... or share ID"
            className="min-w-0 flex-1 border-b border-sand-200 bg-transparent px-1 py-0.5 text-sm focus:outline-none"
          />
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-complement-700 hover:text-complement-900"
            onClick={handleAddShare}
          >
            <PlusIcon className="h-3 w-3" aria-hidden="true" />
            Add
          </button>
        </div>
        {shareError && (
          <p className="mt-1 text-xs text-danger-700">{shareError}</p>
        )}
      </div>

      {/* Recently viewed forms */}
      {hasAnySuggestions && (
        <div>
          <p className="mb-1 text-xs text-lavender-500">
            Or add from forms you've viewed in this browser
            {activeFingerprint ? " (showing compatible forms)" : ""}
          </p>
          <div className="flex flex-wrap gap-1">
            {availableLocal.map((item) => (
              <button
                key={`local:${item.id}`}
                type="button"
                className="flex items-center gap-1 border border-sand-200 bg-sand-50 px-2 py-1 text-xs text-lavender-700 hover:bg-sand-100"
                onClick={() => onAddLocal(item.id, item.name)}
              >
                <PlusIcon className="h-3 w-3" aria-hidden="true" />
                {item.respondentName || item.name}
              </button>
            ))}
            {availableShared.map((item) => (
              <button
                key={`share:${item.shareId}`}
                type="button"
                className="flex items-center gap-1 border border-sand-200 bg-sand-50 px-2 py-1 text-xs text-lavender-700 hover:bg-sand-100"
                onClick={() => onAddShare(item.shareId)}
              >
                <PlusIcon className="h-3 w-3" aria-hidden="true" />
                {item.respondentName || item.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ──

function ComparePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loadedForms, setLoadedForms] = React.useState<LoadedForm[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pendingPassword, setPendingPassword] =
    React.useState<PendingPassword | null>(null);

  // Track which IDs are already loaded
  const existingIds = React.useMemo(
    () =>
      new Set(
        loadedForms.map((f) =>
          f.source === "share" ? `share:${f.id}` : `local:${f.id}`,
        ),
      ),
    [loadedForms],
  );

  const handleAddLocal = React.useCallback(
    async (formId: string, name: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await loadLocalPublishedForm(formId);
        if (typeof result === "string") {
          setError(result);
          return;
        }
        setLoadedForms((prev) => {
          if (prev.some((f) => f.source === "local" && f.id === formId))
            return prev;
          return [
            ...prev,
            {
              id: formId,
              label: getFormLabel(result.form, name || result.name),
              templateName: result.form.templateName,
              form: result.form,
              source: "local",
            },
          ];
        });
      } catch {
        setError(`Failed to load form: ${formId}`);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const handleAddShare = React.useCallback(async (shareId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loadSharedForm(shareId);
      if (typeof result === "string") {
        setError(result);
        return;
      }
      if ("requiresPassword" in result) {
        setPendingPassword({
          shareId,
          formName: result.formName,
        });
        return;
      }
      setLoadedForms((prev) => {
        if (prev.some((f) => f.source === "share" && f.id === shareId))
          return prev;
        return [
          ...prev,
          {
            id: shareId,
            label: getFormLabel(result.form, result.name),
            templateName: result.form.templateName,
            form: result.form,
            source: "share",
          },
        ];
      });
    } catch {
      setError(`Failed to load shared form: ${shareId}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load forms from URL params on mount
  const initialFormsLoaded = React.useRef(false);
  React.useEffect(() => {
    if (initialFormsLoaded.current) return;
    initialFormsLoaded.current = true;

    const formsParam = searchParams.get("forms");
    if (!formsParam) return;

    const ids = formsParam.split(",").filter(Boolean);
    for (const id of ids) {
      if (id.startsWith("share:")) {
        handleAddShare(id.slice(6));
      } else {
        handleAddLocal(id, "");
      }
    }
  }, [searchParams, handleAddShare, handleAddLocal]);

  const handlePasswordSubmit = async (password: string) => {
    if (!pendingPassword) return;
    const { shareId } = pendingPassword;

    const res = await fetch(`/api/share/${shareId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      if (res.status === 401) throw new Error("Invalid password");
      throw new Error("Failed to verify password");
    }

    const data = await res.json();
    let form: Form;

    if (data.form.encrypted) {
      const encryptedData = JSON.parse(data.form.data);
      const decryptedData = decryptFormData(encryptedData, password);
      form = Form.fromPOJO(decryptedData as FormPOJO);
    } else {
      const parsedData = JSON.parse(data.form.data);
      form = Form.fromPOJO(parsedData as FormPOJO);
    }

    setLoadedForms((prev) => [
      ...prev,
      {
        id: shareId,
        label: getFormLabel(form, data.form.name),
        templateName: form.templateName,
        form,
        source: "share",
      },
    ]);
    setPendingPassword(null);
  };

  const removeForm = (index: number) => {
    setLoadedForms((prev) => prev.filter((_, i) => i !== index));
  };

  // Sync loaded forms to URL so the comparison is shareable / bookmarkable
  React.useEffect(() => {
    if (loadedForms.length === 0) {
      router.replace("/compare", { scroll: false });
    } else {
      const ids = loadedForms.map((f) =>
        f.source === "share" ? `share:${f.id}` : f.id,
      );
      router.replace(`?forms=${ids.join(",")}`, { scroll: false });
    }
  }, [loadedForms, router]);

  // Build comparison when 2+ forms loaded
  const comparison: ComparisonResult | null = React.useMemo(() => {
    if (loadedForms.length < 2) return null;
    const entries: ComparisonEntry[] = loadedForms.map((f) => ({
      label: f.label,
      form: f.form,
    }));
    return buildComparison(entries);
  }, [loadedForms]);

  // Compute active fingerprint from the first loaded form for filtering suggestions
  const activeFingerprint = React.useMemo(() => {
    if (loadedForms.length === 0) return null;
    return computeStructureFingerprint(loadedForms[0].form);
  }, [loadedForms]);

  // Derive shared template name from loaded forms
  const templateTitle = React.useMemo(() => {
    for (const f of loadedForms) {
      const name = f.templateName?.trim();
      if (name) return name;
    }
    return null;
  }, [loadedForms]);

  return (
    <>
      {/* Header */}
      <div className="document-sheet relative mb-4">
        <div className="fixed top-6 left-6 z-10 hidden lg:flex xl:left-10">
          <EdgeActionButton
            onClick={() => router.push("/")}
            label="Home"
            title="Home"
            variant="default"
          >
            <HomeIcon className="h-5 w-5" />
          </EdgeActionButton>
        </div>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="absolute top-2 left-2 p-1 lg:hidden"
          title="Home"
          aria-label="Go home"
        >
          <HomeIcon className="h-6 w-6 text-lavender-700 hover:text-lavender-900" />
        </button>

        {comparison && (
          <div className="fixed top-6 right-6 z-10 hidden lg:flex xl:right-10">
            <EdgeActionButton
              onClick={printCurrentView}
              label="Print"
              title="Print comparison"
              variant="default"
            >
              <PrinterIcon className="h-5 w-5" />
            </EdgeActionButton>
          </div>
        )}

        <div className="mb-4 flex flex-col items-center justify-center text-center">
          <h2 className="border-b-1 bg-transparent text-center text-2xl">
            Compare Forms
          </h2>
          {templateTitle && (
            <p className="mt-1 text-sm text-lavender-500">{templateTitle}</p>
          )}
        </div>
      </div>

      <DocumentPhaseNotice
        label="Comparison View"
        tone="published"
        description="Compare answers across forms that share the same template structure. Add 2 or more forms to see agreements and disagreements side by side."
      />

      {/* Mobile print button */}
      {comparison && (
        <div className="mb-3 flex justify-center lg:hidden print:hidden">
          <EdgeActionButton
            onClick={printCurrentView}
            label="Print"
            title="Print comparison"
            variant="default"
          >
            <PrinterIcon className="h-5 w-5" />
          </EdgeActionButton>
        </div>
      )}

      {/* Loaded forms list */}
      {loadedForms.length > 0 && (
        <div className="document-sheet mb-3 border border-sand-200 bg-sand-50 px-4 py-3 print:hidden">
          <p className="mb-2 text-sm font-semibold text-lavender-700">
            Forms in comparison ({loadedForms.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {loadedForms.map((f, i) => (
              <span
                key={f.id}
                className="inline-flex items-center gap-1 border border-sand-200 bg-sand-50 px-2 py-1 text-sm"
              >
                {f.label}
                <button
                  type="button"
                  onClick={() => removeForm(i)}
                  className="ml-1 text-danger-500 hover:text-danger-700"
                  title={`Remove ${f.label}`}
                  aria-label={`Remove ${f.label} from comparison`}
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Form selector */}
      <div className="print:hidden">
        <FormSelector
          onAddLocal={handleAddLocal}
          onAddShare={handleAddShare}
          existingIds={existingIds}
          activeFingerprint={activeFingerprint}
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-3 border border-danger-300 bg-danger-50 px-4 py-2 text-sm text-danger-700 print:hidden">
          {error}
          <button
            type="button"
            className="ml-2 text-xs underline"
            onClick={() => setError(null)}
          >
            dismiss
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="mb-3 print:hidden">
          <LoadingState message="Loading form..." />
        </div>
      )}

      {/* Password modal for encrypted shared forms */}
      {pendingPassword && (
        <PasswordModal
          isOpen={true}
          onClose={() => {
            setPendingPassword(null);
            setIsLoading(false);
          }}
          onSubmit={handlePasswordSubmit}
          mode="enter"
          title="Enter Password"
          description={`Enter the password for "${pendingPassword.formName}".`}
          submitLabelEnter="Add to Comparison"
        />
      )}

      {/* Not enough forms message */}
      {loadedForms.length < 2 && !isLoading && (
        <div className="mb-3 text-center text-sm text-lavender-500 print:hidden">
          {loadedForms.length === 0
            ? "Add at least 2 forms to start comparing."
            : "Add one more form to start comparing."}
        </div>
      )}

      {/* Compatibility warning */}
      {comparison && !comparison.isCompatible && (
        <div className="mb-3 border border-danger-300 bg-danger-50 px-4 py-2 text-sm text-danger-700">
          These forms don't share any questions. They may not be from the same
          template.
        </div>
      )}

      {/* Compatibility info */}
      {comparison?.isCompatible &&
        comparison.overlapCount < comparison.totalQuestionCount && (
          <div className="mb-3 border border-sand-300 bg-sand-50 px-4 py-2 text-sm text-sand-700 print:hidden">
            {comparison.overlapCount} of {comparison.totalQuestionCount}{" "}
            questions overlap across all forms. Non-overlapping questions show
            as unanswered for forms that don't have them.
          </div>
        )}

      {/* Comparison table */}
      {comparison?.isCompatible && (
        <ComparisonTable
          result={comparison}
          labels={loadedForms.map((f) => f.label)}
        />
      )}
    </>
  );
}

function ComparePage() {
  return (
    <div className="flex w-full flex-col items-center">
      <Suspense fallback={<LoadingState message="Loading..." />}>
        <ComparePageContent />
      </Suspense>
    </div>
  );
}

export default dynamic(() => Promise.resolve(ComparePage), { ssr: false });

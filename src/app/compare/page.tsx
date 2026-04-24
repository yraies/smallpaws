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
  createCompareSession,
  loadCompareSession,
  removeCompareSession,
  saveCompareSession,
} from "../../utils/compareSession";
import {
  computeStructureFingerprint,
  loadRecentForms,
  loadRecentSharedForms,
  replaceRecentSharedForms,
  type RecentItemMeta,
  type RecentSharedFormMeta,
} from "../../utils/recentForms";
import { getCompareIdentity } from "../../utils/compareIdentity";

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

function getSuggestionPrimaryLabel(name: string, respondentName?: string): string {
  return respondentName?.trim() || name;
}

function getLocalCompareIdentity(item: RecentItemMeta): string {
  return item.compareIdentity ?? getCompareIdentity(item.id);
}

function getSharedCompareIdentity(item: RecentSharedFormMeta): string | undefined {
  const legacyFormId = (item as RecentSharedFormMeta & { formId?: string }).formId;
  if (item.compareIdentity) return item.compareIdentity;
  if (legacyFormId) return getCompareIdentity(legacyFormId);
  return undefined;
}

function stripLegacySharedFields(item: RecentSharedFormMeta): RecentSharedFormMeta {
  const { formId: _legacyFormId, ...rest } = item as RecentSharedFormMeta & {
    formId?: string;
  };
  return rest;
}

type LoadedForm = {
  id: string;
  compareIdentity: string;
  label: string;
  templateName?: string;
  form: Form;
  source: "local" | "share";
};

type PendingPassword = {
  shareId: string;
  compareIdentity: string;
  formName: string;
  encryptedData?: string;
};

function upsertLoadedForm(prev: LoadedForm[], next: LoadedForm): LoadedForm[] {
  const existingIndex = prev.findIndex(
    (item) => item.compareIdentity === next.compareIdentity,
  );
  if (existingIndex === -1) {
    return [...prev, next];
  }

  const existing = prev[existingIndex];
  if (existing.source === "local") {
    return prev;
  }
  if (next.source === "share") {
    return prev;
  }

  const updated = [...prev];
  updated[existingIndex] = next;
  return updated;
}

// ── Form loading helpers ──

async function loadLocalPublishedForm(
  formId: string,
): Promise<
  { form: Form; name: string; encrypted: boolean; compareIdentity: string }
  | string
> {
  const res = await fetch(`/api/forms/${formId}`);
  if (!res.ok) return `Failed to load form ${formId}`;
  const data = await res.json();
  if (data.encrypted) return "encrypted-local";
  const parsed = JSON.parse(data.data);
  return {
    form: Form.fromPOJO(parsed as FormPOJO),
    name: data.name,
    compareIdentity: data.compareIdentity,
    encrypted: false,
  };
}

async function loadSharedForm(
  shareId: string,
): Promise<
  | { form: Form; name: string; encrypted: false; compareIdentity: string }
  | {
      requiresPassword: true;
      compareIdentity: string;
      formName: string;
      shareId: string;
    }
  | string
> {
  const res = await fetch(`/api/share/${shareId}`);
  if (res.status === 404) return "Shared form not found";
  if (res.status === 410) return "Shared form is no longer available";
  if (!res.ok) return "Failed to load shared form";
  const data = await res.json();
  if (data.requiresPassword) {
    return {
      requiresPassword: true,
      compareIdentity: data.compareIdentity,
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
      compareIdentity: data.compareIdentity,
      formName: formData.name ?? "Shared Form",
      shareId,
    };
  }
  const parsed = JSON.parse(formData.data);
  return {
    form: Form.fromPOJO(parsed as FormPOJO),
    compareIdentity: data.compareIdentity,
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
  existingCanonicalIds,
  activeFingerprint,
}: {
  onAddLocal: (id: string) => void;
  onAddShare: (shareId: string) => void;
  existingCanonicalIds: Set<string>;
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
      setRecentLocal(loadRecentForms(localStorage));
      const sharedItems = loadRecentSharedForms(localStorage);
      setRecentShared(sharedItems);

      const staleSharedItems = sharedItems.filter((item) => !item.compareIdentity);
      if (staleSharedItems.length === 0) return;

      void (async () => {
        const hydrated = await Promise.all(
          sharedItems.map(async (item) => {
            const compareIdentity = getSharedCompareIdentity(item);
            if (compareIdentity) {
              return {
                ...stripLegacySharedFields(item),
                compareIdentity,
              };
            }
            try {
              const response = await fetch(`/api/share/${item.shareId}`);
              if (!response.ok) return item;
              const data = await response.json();
              if (!data.compareIdentity) return item;
              return {
                ...stripLegacySharedFields(item),
                compareIdentity: data.compareIdentity,
              };
            } catch {
              return item;
            }
          }),
        );

        if (
          hydrated.every(
            (item, index) =>
              item.compareIdentity === sharedItems[index]?.compareIdentity,
          )
        ) {
          return;
        }

        replaceRecentSharedForms(localStorage, hydrated);
        setRecentShared(hydrated);
      })();
    }
  }, []);

  const handleAddShare = () => {
    const shareId = extractShareId(shareUrl);
    if (!shareId) {
      setShareError("Enter a valid share link or share ID");
      return;
    }
    setShareError(null);
    setShareUrl("");
    onAddShare(shareId);
  };

  const localPublishedForms = React.useMemo(
    () =>
      recentLocal.filter(
        (item) =>
          item.kind === "form" &&
          item.phase === "published" &&
          !item.encrypted,
      ),
    [recentLocal],
  );

  const localCanonicalIds = React.useMemo(
    () => new Set(localPublishedForms.map(getLocalCompareIdentity)),
    [localPublishedForms],
  );

  const dedupedShared = React.useMemo(() => {
    const seen = new Set<string>();
    return recentShared.filter((item) => {
      const key = getSharedCompareIdentity(item) ?? `share:${item.shareId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [recentShared]);

  const availableLocal = localPublishedForms.filter((item) => {
    if (existingCanonicalIds.has(getLocalCompareIdentity(item))) return false;
    if (
      activeFingerprint &&
      item.structureFingerprint &&
      item.structureFingerprint !== activeFingerprint
    ) {
      return false;
    }
    return true;
  });

  const availableShared = dedupedShared.filter((item) => {
    const compareIdentity = getSharedCompareIdentity(item);
    if (compareIdentity && existingCanonicalIds.has(compareIdentity)) return false;
    if (compareIdentity && localCanonicalIds.has(compareIdentity)) return false;
    if (
      activeFingerprint &&
      item.structureFingerprint &&
      item.structureFingerprint !== activeFingerprint
    ) {
      return false;
    }
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
                className="flex flex-col items-start gap-0.5 border border-sand-200 bg-sand-50 px-2 py-1 text-left text-xs text-lavender-700 hover:bg-sand-100"
                onClick={() => onAddLocal(item.id)}
              >
                <span className="flex items-center gap-1 font-semibold">
                  <PlusIcon className="h-3 w-3" aria-hidden="true" />
                  {getSuggestionPrimaryLabel(item.name, item.respondentName)}
                </span>
                {(item.templateName || (item.respondentName ? item.name : undefined)) && (
                  <span className="text-[11px] text-lavender-500">
                    {item.templateName || item.name}
                  </span>
                )}
              </button>
            ))}
            {availableShared.map((item) => (
              <button
                key={`share:${item.shareId}`}
                type="button"
                className="flex flex-col items-start gap-0.5 border border-sand-200 bg-sand-50 px-2 py-1 text-left text-xs text-lavender-700 hover:bg-sand-100"
                onClick={() => onAddShare(item.shareId)}
              >
                <span className="flex items-center gap-1 font-semibold">
                  <PlusIcon className="h-3 w-3" aria-hidden="true" />
                  {getSuggestionPrimaryLabel(item.name, item.respondentName)}
                </span>
                {item.templateName && (
                  <span className="text-[11px] text-lavender-500">
                    {item.templateName}
                  </span>
                )}
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
  const [localSessionId, setLocalSessionId] = React.useState<string | null>(null);
  const [hasHydratedUrlState, setHasHydratedUrlState] = React.useState(false);
  const [pendingPassword, setPendingPassword] =
    React.useState<PendingPassword | null>(null);

  const existingCanonicalIds = React.useMemo(
    () => new Set(loadedForms.map((f) => f.compareIdentity)),
    [loadedForms],
  );

  const handleAddLocal = React.useCallback(
    async (formId: string, options?: { silentDuplicate?: boolean }) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await loadLocalPublishedForm(formId);
        if (typeof result === "string") {
          setError(result);
          return;
        }
        if (loadedForms.some((f) => f.compareIdentity === result.compareIdentity)) {
          if (!options?.silentDuplicate) {
            setError("This form is already in the comparison");
          }
          return;
        }
        setLoadedForms((prev) => {
          return upsertLoadedForm(prev, {
            id: formId,
            compareIdentity: result.compareIdentity,
            label: getFormLabel(result.form, result.name),
            templateName: result.form.templateName,
            form: result.form,
            source: "local",
          });
        });
      } catch {
        setError(`Failed to load form: ${formId}`);
      } finally {
        setIsLoading(false);
      }
    },
    [loadedForms],
  );

  const handleAddShare = React.useCallback(
    async (shareId: string, options?: { silentDuplicate?: boolean }) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await loadSharedForm(shareId);
        if (typeof result === "string") {
          setError(result);
          return;
        }
        if ("requiresPassword" in result) {
          if (loadedForms.some((f) => f.compareIdentity === result.compareIdentity)) {
            if (!options?.silentDuplicate) {
              setError("This form is already in the comparison");
            }
            return;
          }
          setPendingPassword({
            shareId,
            compareIdentity: result.compareIdentity,
            formName: result.formName,
          });
          return;
        }
        if (loadedForms.some((f) => f.compareIdentity === result.compareIdentity)) {
          if (!options?.silentDuplicate) {
            setError("This form is already in the comparison");
          }
          return;
        }
        setLoadedForms((prev) => {
          return upsertLoadedForm(prev, {
            id: shareId,
            compareIdentity: result.compareIdentity,
            label: getFormLabel(result.form, result.name),
            templateName: result.form.templateName,
            form: result.form,
            source: "share",
          });
        });
      } catch {
        setError(`Failed to load shared form: ${shareId}`);
      } finally {
        setIsLoading(false);
      }
    },
    [loadedForms],
  );

  // Load forms from URL params on mount
  const initialFormsLoaded = React.useRef(false);
  React.useEffect(() => {
    if (initialFormsLoaded.current) return;
    initialFormsLoaded.current = true;

    void (async () => {
      const formsParam = searchParams.get("forms");
      const localParam = searchParams.get("local");
      const pendingLoads: Promise<void>[] = [];

      if (localParam) {
        setLocalSessionId(localParam);
        const localIds = loadCompareSession(localStorage, localParam);
        for (const id of localIds) {
          pendingLoads.push(handleAddLocal(id, { silentDuplicate: true }));
        }
      }

      if (formsParam) {
        const ids = formsParam.split(",").filter(Boolean);
        for (const id of ids) {
          if (id.startsWith("share:")) {
            pendingLoads.push(
              handleAddShare(id.slice(6), { silentDuplicate: true }),
            );
          } else {
            // Legacy compare URLs used raw local form ids in the query string.
            pendingLoads.push(handleAddLocal(id, { silentDuplicate: true }));
          }
        }
      }

      await Promise.all(pendingLoads);
      setHasHydratedUrlState(true);
    })();
  }, [searchParams, handleAddShare, handleAddLocal]);

  const handlePasswordSubmit = async (password: string) => {
    if (!pendingPassword) return;
    const { shareId, compareIdentity } = pendingPassword;

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

    if (loadedForms.some((f) => f.compareIdentity === compareIdentity)) {
      setError("This form is already in the comparison");
      setPendingPassword(null);
      return;
    }
    setLoadedForms((prev) => {
      return upsertLoadedForm(prev, {
        id: shareId,
        compareIdentity,
        label: getFormLabel(form, data.form.name),
        templateName: form.templateName,
        form,
        source: "share",
      });
    });
    setPendingPassword(null);
  };

  const removeForm = (index: number) => {
    setLoadedForms((prev) => prev.filter((_, i) => i !== index));
  };

  // Sync loaded forms to URL so the comparison is shareable / bookmarkable
  React.useEffect(() => {
    if (!hasHydratedUrlState) return;

    if (loadedForms.length === 0) {
      if (localSessionId) {
        removeCompareSession(localStorage, localSessionId);
        setLocalSessionId(null);
      }
      router.replace("/compare", { scroll: false });
    } else {
      const params = new URLSearchParams();
      const shareIds = loadedForms
        .filter((f) => f.source === "share")
        .map((f) => `share:${f.id}`);
      const localIds = loadedForms
        .filter((f) => f.source === "local")
        .map((f) => f.id);

      if (shareIds.length > 0) {
        params.set("forms", shareIds.join(","));
      }

      if (localIds.length > 0) {
        const nextLocalSessionId =
          localSessionId ?? createCompareSession(localStorage, localIds);
        if (!localSessionId) {
          setLocalSessionId(nextLocalSessionId);
        } else {
          saveCompareSession(localStorage, nextLocalSessionId, localIds);
        }
        params.set("local", nextLocalSessionId);
      } else if (localSessionId) {
        removeCompareSession(localStorage, localSessionId);
        setLocalSessionId(null);
      }

      const query = params.toString();
      router.replace(query ? `?${query}` : "/compare", { scroll: false });
    }
  }, [hasHydratedUrlState, loadedForms, localSessionId, router]);

  // Build disambiguated display labels for loaded forms
  const displayLabels = React.useMemo(() => {
    const rawLabels = loadedForms.map((f) => f.label);
    const counts = new Map<string, number>();
    for (const label of rawLabels) {
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }

    const bySource = loadedForms.map((f, i) => {
      if ((counts.get(rawLabels[i]) ?? 0) <= 1) return rawLabels[i];
      const hasMixedSources = loadedForms.some(
        (other, j) => j !== i && other.label === rawLabels[i] && other.source !== f.source,
      );
      if (!hasMixedSources) return rawLabels[i];
      return `${rawLabels[i]} (${f.source === "share" ? "shared" : "local"})`;
    });

    const disambiguatedCounts = new Map<string, number>();
    for (const label of bySource) {
      disambiguatedCounts.set(label, (disambiguatedCounts.get(label) ?? 0) + 1);
    }

    const seen = new Map<string, number>();
    return bySource.map((label) => {
      if ((disambiguatedCounts.get(label) ?? 0) <= 1) return label;
      const index = (seen.get(label) ?? 0) + 1;
      seen.set(label, index);
      return `${label} (${index})`;
    });
  }, [loadedForms]);

  // Build comparison when 2+ forms loaded
  const comparison: ComparisonResult | null = React.useMemo(() => {
    if (loadedForms.length < 2) return null;
    const entries: ComparisonEntry[] = loadedForms.map((f, i) => ({
      label: displayLabels[i],
      form: f.form,
    }));
    return buildComparison(entries);
  }, [loadedForms, displayLabels]);

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
                {displayLabels[i]}
                <button
                  type="button"
                  onClick={() => removeForm(i)}
                  className="ml-1 text-danger-500 hover:text-danger-700"
                  title={`Remove ${displayLabels[i]}`}
                  aria-label={`Remove ${displayLabels[i]} from comparison`}
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
          existingCanonicalIds={existingCanonicalIds}
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
          labels={displayLabels}
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

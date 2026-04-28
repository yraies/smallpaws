import { type NextRequest, NextResponse } from "next/server";
import { typeid } from "typeid-js";
import { logApiError } from "../../../../../lib/apiLogging";
import { FormStorage } from "../../../../../lib/database";
import { isValidArtifactId } from "../../../../../lib/idValidation";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    if (!isValidArtifactId(id, "form")) {
      return NextResponse.json({ error: "Invalid form ID" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { regenerate = false, autoDeleteInDays } = body as {
      regenerate?: boolean;
      autoDeleteInDays?: number;
    };

    // Check if form exists
    const form = FormStorage.getForm(id);
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const requiresPassword = form.encrypted;

    let autoDeleteAt: string | null = null;
    if (autoDeleteInDays && autoDeleteInDays > 0) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + autoDeleteInDays);
      autoDeleteAt = expiry.toISOString();
    }

    const sharedForm = regenerate
      ? FormStorage.regenerateCanonicalSharedFormForForm({
          shareId: typeid("share").toString(),
          formId: id,
          expiresAt: autoDeleteAt,
        })
      : FormStorage.upsertSharedForm({
          shareId: typeid("share").toString(),
          formId: id,
          expiresAt: autoDeleteAt,
        });

    // Build share URL
    const host = request.headers.get("host") || "localhost:3001";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const shareUrl = `${protocol}://${host}/share/${sharedForm.share_id}`;

    return NextResponse.json({
      success: true,
      shareId: sharedForm.share_id,
      shareUrl,
      requiresPassword,
      autoDeleteAt: sharedForm.expires_at,
      viewCount: sharedForm.view_count,
      createdAt: sharedForm.created_at,
    });
  } catch (error) {
    logApiError("Error creating shared form", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    if (!isValidArtifactId(id, "form")) {
      return NextResponse.json({ error: "Invalid form ID" }, { status: 400 });
    }

    const form = FormStorage.getForm(id);
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const share =
      FormStorage.getCanonicalSharedFormForForm(id) ??
      FormStorage.upsertSharedForm({
        shareId: typeid("share").toString(),
        formId: id,
        expiresAt: null,
      });
    const requiresPassword = !!form.encrypted;
    const host = _request.headers.get("host") || "localhost:3001";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

    return NextResponse.json({
      success: true,
      share: {
        shareId: share.share_id,
        shareUrl: `${protocol}://${host}/share/${share.share_id}`,
        requiresPassword,
        autoDeleteAt: share.expires_at,
        viewCount: share.view_count,
        createdAt: share.created_at,
      },
    });
  } catch (error) {
    logApiError("Error retrieving shared forms", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!isValidArtifactId(id, "form")) {
    return NextResponse.json({ error: "Invalid form ID" }, { status: 400 });
  }

  return NextResponse.json(
    { error: "Removing the shared view is no longer supported for forms" },
    { status: 405 },
  );
}

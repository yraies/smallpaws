import { type NextRequest, NextResponse } from "next/server";
import { typeid } from "typeid-js";
import { FormStorage } from "../../../../../lib/database";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const { expiresInDays } = body;

    // Check if form exists
    const form = FormStorage.getForm(id);
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const requiresPassword = form.encrypted;

    // Calculate expiry date if provided
    let expiresAt: string | null = null;
    if (expiresInDays && expiresInDays > 0) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + expiresInDays);
      expiresAt = expiry.toISOString();
    }

    const sharedForm = FormStorage.upsertSharedForm({
      shareId: typeid("share").toString(),
      formId: id,
      passwordHash: null,
      expiresAt,
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
      expiresAt: sharedForm.expires_at,
      viewCount: sharedForm.view_count,
      createdAt: sharedForm.created_at,
    });
  } catch (error) {
    console.error("Error creating shared form:", error);
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

    const share = FormStorage.getCanonicalSharedFormForForm(id);
    const form = FormStorage.getForm(id);
    const requiresPassword = !!form?.encrypted;
    const host = _request.headers.get("host") || "localhost:3001";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

    return NextResponse.json({
      success: true,
      share: share
        ? {
            shareId: share.share_id,
            shareUrl: `${protocol}://${host}/share/${share.share_id}`,
            requiresPassword,
            expiresAt: share.expires_at,
            viewCount: share.view_count,
            createdAt: share.created_at,
          }
        : null,
    });
  } catch (error) {
    console.error("Error retrieving shared forms:", error);
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
  try {
    const { id } = await context.params;
    const form = FormStorage.getForm(id);

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    FormStorage.deleteCanonicalSharedFormForForm(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting shared form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

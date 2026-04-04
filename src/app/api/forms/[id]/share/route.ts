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

    // Generate a unique share ID
    const shareId = typeid("share").toString();

    // Calculate expiry date if provided
    let expiresAt: string | null = null;
    if (expiresInDays && expiresInDays > 0) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + expiresInDays);
      expiresAt = expiry.toISOString();
    }

    // Create shared form record
    const sharedForm = FormStorage.createSharedForm({
      shareId,
      formId: id,
      passwordHash: null,
      expiresAt,
    });

    // Build share URL
    const host = request.headers.get("host") || "localhost:3001";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const shareUrl = `${protocol}://${host}/share/${shareId}`;

    return NextResponse.json({
      success: true,
      shareId,
      shareUrl,
      requiresPassword,
      expiresAt,
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

    // Get all shares for this form
    const shares = FormStorage.getSharedFormsForForm(id);
    const form = FormStorage.getForm(id);
    const requiresPassword = !!form?.encrypted;

    return NextResponse.json({
      success: true,
      shares: shares.map((share) => ({
        shareId: share.share_id,
        requiresPassword,
        expiresAt: share.expires_at,
        viewCount: share.view_count,
        createdAt: share.created_at,
      })),
    });
  } catch (error) {
    console.error("Error retrieving shared forms:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

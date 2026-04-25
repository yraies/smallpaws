import { type NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "../../../../lib/crypto";
import { FormStorage } from "../../../../lib/database";
import { getCompareIdentity } from "../../../../utils/compareIdentity";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ shareId: string }> },
) {
  try {
    const { shareId } = await context.params;

    // Get shared form record
    const sharedForm = FormStorage.getSharedForm(shareId);
    if (!sharedForm) {
      return NextResponse.json(
        { error: "Shared form not found" },
        { status: 404 },
      );
    }

    // Get the actual form
    const form = FormStorage.getForm(sharedForm.form_id);
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (form.name === "[Deleted]" || form.data === "{}") {
      return NextResponse.json(
        { error: "This shared form is no longer available" },
        { status: 410 },
      );
    }

    // Increment view count
    FormStorage.incrementShareViewCount(shareId);

    if (form.encrypted) {
      return NextResponse.json({
        requiresPassword: true,
        compareIdentity: getCompareIdentity(form.id),
        formName: form.name,
        shareId: shareId,
        isEncrypted: form.encrypted,
        viewCount: sharedForm.view_count + 1,
        createdAt: sharedForm.created_at,
        autoDeleteAt: sharedForm.expires_at,
      });
    }

    // Return form data without password protection
    return NextResponse.json({
      success: true,
      requiresPassword: false,
      compareIdentity: getCompareIdentity(form.id),
      form: {
        name: form.name,
        data: form.data,
        encrypted: form.encrypted,
        created_at: form.created_at,
        updated_at: form.updated_at,
      },
      shareInfo: {
        shareId: shareId,
        viewCount: sharedForm.view_count + 1,
        createdAt: sharedForm.created_at,
        autoDeleteAt: sharedForm.expires_at,
      },
    });
  } catch (error) {
    console.error("Error accessing shared form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ shareId: string }> },
) {
  try {
    const { shareId } = await context.params;
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    // Get shared form record
    const sharedForm = FormStorage.getSharedForm(shareId);
    if (!sharedForm) {
      return NextResponse.json(
        { error: "Shared form not found" },
        { status: 404 },
      );
    }

    // Get the actual form
    const form = FormStorage.getForm(sharedForm.form_id);
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (form.name === "[Deleted]" || form.data === "{}") {
      return NextResponse.json(
        { error: "This shared form is no longer available" },
        { status: 410 },
      );
    }

    if (!form.encrypted || !form.password_hash) {
      return NextResponse.json(
        { error: "Form is not password protected" },
        { status: 400 },
      );
    }

    if (!verifyPassword(password, form.password_hash)) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Increment view count
    FormStorage.incrementShareViewCount(shareId);

    // Return form data
    return NextResponse.json({
      success: true,
      compareIdentity: getCompareIdentity(form.id),
      form: {
        name: form.name,
        data: form.data,
        encrypted: form.encrypted,
        created_at: form.created_at,
        updated_at: form.updated_at,
      },
      shareInfo: {
        shareId: shareId,
        viewCount: sharedForm.view_count + 1,
        createdAt: sharedForm.created_at,
        autoDeleteAt: sharedForm.expires_at,
      },
    });
  } catch (error) {
    console.error("Error verifying shared form password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

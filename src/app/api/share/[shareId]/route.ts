import { type NextRequest, NextResponse } from "next/server";
import {
  verifyPasswordHash,
  verifyPasswordLegacy,
} from "../../../../lib/crypto";
import { FormStorage } from "../../../../lib/database";
import {
  checkRateLimit,
  getRateLimitRetryAfter,
} from "../../../../lib/rateLimit";
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
      // Don't leak the form name before password verification
      return NextResponse.json({
        requiresPassword: true,
        compareIdentity: getCompareIdentity(form.id),
        shareId: shareId,
        isEncrypted: form.encrypted,
        passwordSalt: form.password_salt ?? null,
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

    // Rate limiting
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const rateLimitKey = `verify:share:${shareId}:${clientIp}`;
    if (!checkRateLimit(rateLimitKey)) {
      const retryAfter = getRateLimitRetryAfter(rateLimitKey);
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        },
      );
    }

    const body = await request.json();
    const { password, passwordHash } = body;

    if (!password && !passwordHash) {
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

    // Verify: new salted flow or legacy unsalted flow
    let isPasswordValid: boolean;
    if (passwordHash) {
      isPasswordValid = verifyPasswordHash(passwordHash, form.password_hash);
    } else if (form.password_salt) {
      return NextResponse.json(
        { error: "Password hash required" },
        { status: 400 },
      );
    } else {
      isPasswordValid = verifyPasswordLegacy(password, form.password_hash);
    }

    if (!isPasswordValid) {
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

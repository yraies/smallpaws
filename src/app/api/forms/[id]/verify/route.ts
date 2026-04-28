import { type NextRequest, NextResponse } from "next/server";
import {
  verifyPasswordHash,
  verifyPasswordLegacy,
} from "../../../../../lib/crypto";
import { FormStorage } from "../../../../../lib/database";
import {
  checkRateLimit,
  getRateLimitRetryAfter,
} from "../../../../../lib/rateLimit";
import { getCompareIdentity } from "../../../../../utils/compareIdentity";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    // Rate limiting
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const rateLimitKey = `verify:form:${id}:${clientIp}`;
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

    // Accept either a pre-computed hash (new flow) or plaintext password (legacy)
    if (!password && !passwordHash) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    const form = FormStorage.getForm(id);

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
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
      // Artifact has salt but client sent plaintext — reject
      return NextResponse.json(
        { error: "Password hash required" },
        { status: 400 },
      );
    } else {
      // Legacy artifact without salt: accept plaintext for backward compat
      isPasswordValid = verifyPasswordLegacy(password, form.password_hash);
    }

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Return form data if password is correct
    return NextResponse.json({
      success: true,
      compareIdentity: getCompareIdentity(form.id),
      form: {
        id: form.id,
        name: form.name,
        data: form.data,
        encrypted: form.encrypted,
        created_at: form.created_at,
        updated_at: form.updated_at,
      },
    });
  } catch (error) {
    console.error("Error verifying password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

import { type NextRequest, NextResponse } from "next/server";
import {
  verifyPasswordHash,
  verifyPasswordLegacy,
} from "../../../../../lib/crypto";
import { TemplateStorage } from "../../../../../lib/database";
import {
  checkRateLimit,
  getRateLimitRetryAfter,
} from "../../../../../lib/rateLimit";

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
    const rateLimitKey = `verify:template:${id}:${clientIp}`;
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

    const template = TemplateStorage.getTemplate(id);

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    if (!template.encrypted || !template.password_hash) {
      return NextResponse.json(
        { error: "Template is not password protected" },
        { status: 400 },
      );
    }

    // Verify: new salted flow or legacy unsalted flow
    let isPasswordValid: boolean;
    if (passwordHash) {
      isPasswordValid = verifyPasswordHash(
        passwordHash,
        template.password_hash,
      );
    } else if (template.password_salt) {
      return NextResponse.json(
        { error: "Password hash required" },
        { status: 400 },
      );
    } else {
      isPasswordValid = verifyPasswordLegacy(password, template.password_hash);
    }

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        name: template.name,
        data: template.data,
        encrypted: template.encrypted,
        created_at: template.created_at,
        updated_at: template.updated_at,
      },
    });
  } catch (error) {
    console.error("Error verifying template password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

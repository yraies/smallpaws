import { type NextRequest, NextResponse } from "next/server";
import { logApiError } from "../../../../lib/apiLogging";
import { TemplateStorage } from "../../../../lib/database";
import { isValidArtifactId } from "../../../../lib/idValidation";
import {
  checkRateLimit,
  getRateLimitRetryAfter,
} from "../../../../lib/rateLimit";
import {
  verifyPasswordHashSecure,
  verifyPasswordLegacySecure,
} from "../../../../lib/serverPassword";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ shareId: string }> },
) {
  try {
    const { shareId } = await context.params;
    if (!isValidArtifactId(shareId, "share")) {
      return NextResponse.json({ error: "Invalid share ID" }, { status: 400 });
    }

    const sharedTemplate = TemplateStorage.getSharedTemplate(shareId);

    if (!sharedTemplate) {
      return NextResponse.json(
        { error: "Shared template not found" },
        { status: 404 },
      );
    }

    const template = TemplateStorage.getTemplate(sharedTemplate.template_id);
    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    if (template.encrypted) {
      // Don't leak the template name or admin ID before password verification
      return NextResponse.json({
        requiresPassword: true,
        shareId,
        isEncrypted: true,
        passwordSalt: template.password_salt ?? null,
        viewCount: sharedTemplate.view_count,
        createdAt: sharedTemplate.created_at,
      });
    }

    TemplateStorage.incrementSharedTemplateViewCount(shareId);

    // Return template data without the admin template ID
    return NextResponse.json({
      success: true,
      template: {
        name: template.name,
        data: template.data,
        created_at: template.created_at,
        updated_at: template.updated_at,
      },
      shareInfo: {
        shareId,
        viewCount: sharedTemplate.view_count + 1,
        createdAt: sharedTemplate.created_at,
      },
    });
  } catch (error) {
    logApiError("Error retrieving shared template", error);
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
    if (!isValidArtifactId(shareId, "share")) {
      return NextResponse.json({ error: "Invalid share ID" }, { status: 400 });
    }

    // Rate limiting
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const rateLimitKey = `verify:template-share:${shareId}:${clientIp}`;
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

    const sharedTemplate = TemplateStorage.getSharedTemplate(shareId);
    if (!sharedTemplate) {
      return NextResponse.json(
        { error: "Shared template not found" },
        { status: 404 },
      );
    }

    const template = TemplateStorage.getTemplate(sharedTemplate.template_id);
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
      isPasswordValid = verifyPasswordHashSecure(
        passwordHash,
        template.password_hash,
      );
    } else if (template.password_salt) {
      return NextResponse.json(
        { error: "Password hash required" },
        { status: 400 },
      );
    } else {
      isPasswordValid = verifyPasswordLegacySecure(
        password,
        template.password_hash,
      );
    }

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    TemplateStorage.incrementSharedTemplateViewCount(shareId);

    // Return template data without the admin template ID
    return NextResponse.json({
      success: true,
      template: {
        name: template.name,
        data: template.data,
        encrypted: template.encrypted,
        created_at: template.created_at,
        updated_at: template.updated_at,
      },
      shareInfo: {
        shareId,
        viewCount: sharedTemplate.view_count + 1,
        createdAt: sharedTemplate.created_at,
      },
    });
  } catch (error) {
    logApiError("Error verifying shared template password", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

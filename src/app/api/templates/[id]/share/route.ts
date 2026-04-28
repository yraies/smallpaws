import { type NextRequest, NextResponse } from "next/server";
import { typeid } from "typeid-js";
import { logApiError } from "../../../../../lib/apiLogging";
import { TemplateStorage } from "../../../../../lib/database";
import { isValidArtifactId } from "../../../../../lib/idValidation";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    if (!isValidArtifactId(id, "template")) {
      return NextResponse.json(
        { error: "Invalid template ID" },
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

    const requiresPassword = template.encrypted;

    const sharedTemplate = TemplateStorage.upsertSharedTemplate(
      id,
      typeid("share").toString(),
    );

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const shareUrl = `${protocol}://${host}/share/template/${sharedTemplate.share_id}`;

    return NextResponse.json({
      success: true,
      shareId: sharedTemplate.share_id,
      shareUrl,
      requiresPassword,
      viewCount: sharedTemplate.view_count,
      createdAt: sharedTemplate.created_at,
    });
  } catch (error) {
    logApiError("Error creating shared template", error);
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
    if (!isValidArtifactId(id, "template")) {
      return NextResponse.json(
        { error: "Invalid template ID" },
        { status: 400 },
      );
    }

    const share = TemplateStorage.getCanonicalSharedTemplateForTemplate(id);
    const template = TemplateStorage.getTemplate(id);
    const requiresPassword = !!template?.encrypted;
    const host = _request.headers.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

    return NextResponse.json({
      success: true,
      share: share
        ? {
            shareId: share.share_id,
            shareUrl: `${protocol}://${host}/share/template/${share.share_id}`,
            requiresPassword,
            viewCount: share.view_count,
            createdAt: share.created_at,
          }
        : null,
    });
  } catch (error) {
    logApiError("Error retrieving shared templates", error);
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
    if (!isValidArtifactId(id, "template")) {
      return NextResponse.json(
        { error: "Invalid template ID" },
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

    TemplateStorage.deleteCanonicalSharedTemplateForTemplate(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError("Error deleting shared template", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

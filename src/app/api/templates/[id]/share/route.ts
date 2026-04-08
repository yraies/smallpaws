import { type NextRequest, NextResponse } from "next/server";
import { typeid } from "typeid-js";
import { TemplateStorage } from "../../../../../lib/database";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const template = TemplateStorage.getTemplate(id);

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    const requiresPassword = template.encrypted;

    const shareId = typeid("share").toString();
    const sharedTemplate = TemplateStorage.createSharedTemplate(id, shareId);

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const shareUrl = `${protocol}://${host}/share/template/${shareId}`;

    return NextResponse.json({
      success: true,
      shareId,
      shareUrl,
      requiresPassword,
      viewCount: sharedTemplate.view_count,
      createdAt: sharedTemplate.created_at,
    });
  } catch (error) {
    console.error("Error creating shared template:", error);
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
    const shares = TemplateStorage.getSharedTemplatesForTemplate(id);
    const template = TemplateStorage.getTemplate(id);
    const requiresPassword = !!template?.encrypted;

    return NextResponse.json({
      success: true,
      shares: shares.map((share) => ({
        shareId: share.share_id,
        requiresPassword,
        viewCount: share.view_count,
        createdAt: share.created_at,
      })),
    });
  } catch (error) {
    console.error("Error retrieving shared templates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

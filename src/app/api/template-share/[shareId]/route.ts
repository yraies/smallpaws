import { type NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "../../../../lib/crypto";
import { TemplateStorage } from "../../../../lib/database";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ shareId: string }> },
) {
  try {
    const { shareId } = await context.params;
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
      return NextResponse.json({
        requiresPassword: true,
        templateName: template.name,
        shareId,
        isEncrypted: true,
        viewCount: sharedTemplate.view_count,
        createdAt: sharedTemplate.created_at,
      });
    }

    TemplateStorage.incrementSharedTemplateViewCount(shareId);

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
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
    console.error("Error retrieving shared template:", error);
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

    if (!verifyPassword(password, template.password_hash)) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    TemplateStorage.incrementSharedTemplateViewCount(shareId);

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
      shareInfo: {
        shareId,
        viewCount: sharedTemplate.view_count + 1,
        createdAt: sharedTemplate.created_at,
      },
    });
  } catch (error) {
    console.error("Error verifying shared template password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

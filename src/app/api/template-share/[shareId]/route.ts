import { type NextRequest, NextResponse } from "next/server";
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

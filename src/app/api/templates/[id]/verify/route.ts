import { type NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "../../../../../lib/crypto";
import { TemplateStorage } from "../../../../../lib/database";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { password } = body;

    if (!password) {
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

    if (!verifyPassword(password, template.password_hash)) {
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

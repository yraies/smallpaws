import { type NextRequest, NextResponse } from "next/server";
import { TemplateStorage } from "../../../../lib/database";
import { Form, type FormPOJO } from "../../../../types/Form";
import { hasValidStructure } from "../../../../utils/documentStructure";

export async function GET(
  _request: NextRequest,
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

    if (template.encrypted) {
      // Don't leak the template name before password verification
      return NextResponse.json({
        requiresPassword: true,
        isEncrypted: true,
        passwordSalt: template.password_salt ?? null,
      });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error retrieving template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const {
      name,
      data,
      encrypted = false,
      password_hash = null,
      password_salt = null,
    } = body;

    if (!name || !data) {
      return NextResponse.json(
        { error: "Name and data are required" },
        { status: 400 },
      );
    }

    if (!encrypted) {
      const template = Form.fromPOJO(data as FormPOJO).withoutAnswers();
      if (!hasValidStructure(template)) {
        return NextResponse.json(
          {
            error:
              "Templates need at least one category and one question before they can be finalized.",
          },
          { status: 400 },
        );
      }
    }

    try {
      TemplateStorage.saveTemplate({
        id,
        encrypted,
        password_hash,
        password_salt,
        name,
        data: JSON.stringify(data),
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Cannot overwrite finalized template")
      ) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error finalizing template:", error);
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
    TemplateStorage.deleteTemplate(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

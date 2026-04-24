import { type NextRequest, NextResponse } from "next/server";
import { typeid } from "typeid-js";
import { FormStorage } from "../../../../lib/database";
import { getCompareIdentity } from "../../../../utils/compareIdentity";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const form = FormStorage.getForm(id);

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...form,
      compareIdentity: getCompareIdentity(form.id),
    });
  } catch (error) {
    console.error("Error retrieving form:", error);
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

    const { name, data, encrypted = false, password_hash = null } = body;

    if (!name || !data) {
      return NextResponse.json(
        { error: "Name and data are required" },
        { status: 400 },
      );
    }

    const modification_key = typeid("key").toString();

    const formData = {
      id,
      modification_key,
      encrypted,
      password_hash,
      name,
      data: JSON.stringify(data),
    };

    try {
      FormStorage.saveForm(formData);
      FormStorage.upsertSharedForm({
        shareId: typeid("share").toString(),
        formId: id,
        passwordHash: null,
        expiresAt: null,
      });
    } catch (error) {
      // Check if it's the published form protection error
      if (
        error instanceof Error &&
        error.message.includes("Cannot overwrite published form")
      ) {
        return NextResponse.json(
          {
            error:
              "This form has already been published and cannot be modified. Published forms are immutable.",
          },
          { status: 409 },
        ); // 409 Conflict
      }
      throw error; // Re-throw if it's a different error
    }

    return NextResponse.json({
      success: true,
      id,
      modification_key,
    });
  } catch (error) {
    console.error("Error saving form:", error);
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
    FormStorage.deleteForm(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

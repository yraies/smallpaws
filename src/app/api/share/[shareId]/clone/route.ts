import { type NextRequest, NextResponse } from "next/server";
import { typeid } from "typeid-js";
import { logApiError } from "../../../../../lib/apiLogging";
import { FormStorage } from "../../../../../lib/database";
import { isValidArtifactId } from "../../../../../lib/idValidation";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ shareId: string }> },
) {
  try {
    const { shareId } = await context.params;
    if (!isValidArtifactId(shareId, "share")) {
      return NextResponse.json({ error: "Invalid share ID" }, { status: 400 });
    }

    // Get shared form record
    const sharedForm = FormStorage.getSharedForm(shareId);
    if (!sharedForm) {
      return NextResponse.json(
        { error: "Shared form not found" },
        { status: 404 },
      );
    }

    // Get the actual form
    const originalForm = FormStorage.getForm(sharedForm.form_id);
    if (!originalForm) {
      return NextResponse.json(
        { error: "Original form not found" },
        { status: 404 },
      );
    }

    if (originalForm.name === "[Deleted]" || originalForm.data === "{}") {
      return NextResponse.json(
        { error: "Shared form is no longer available" },
        { status: 410 },
      );
    }

    // Generate a new ID for the cloned form
    const newFormId = typeid("form").toString();

    // Return clone data without exposing the original form's admin ID
    return NextResponse.json({
      success: true,
      formId: newFormId,
      formData: {
        id: newFormId,
        name: `${originalForm.name} (Copy)`,
        data: originalForm.data,
        original_form_name: originalForm.name,
      },
    });
  } catch (error) {
    logApiError("Error cloning form", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { FormStorage } from '../../../../../lib/database';
import { typeid } from 'typeid-js';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await context.params;
    
    // Get shared form record
    const sharedForm = FormStorage.getSharedForm(shareId);
    if (!sharedForm) {
      return NextResponse.json({ error: 'Shared form not found' }, { status: 404 });
    }
    
    // Check if form has expired
    if (sharedForm.expires_at) {
      const expiry = new Date(sharedForm.expires_at);
      const now = new Date();
      if (now > expiry) {
        return NextResponse.json({ error: 'Shared form has expired' }, { status: 410 });
      }
    }
    
    // Get the actual form
    const originalForm = FormStorage.getForm(sharedForm.form_id);
    if (!originalForm) {
      return NextResponse.json({ error: 'Original form not found' }, { status: 404 });
    }
    
    // Generate a new ID for the cloned form
    const newFormId = typeid('form').toString();
    const modification_key = typeid('key').toString();
    
    // Create the cloned form with attribution
    const clonedForm = {
      id: newFormId,
      modification_key,
      encrypted: false, // Cloned forms start unencrypted
      password_hash: null,
      name: `${originalForm.name} (Copy)`,
      data: originalForm.data, // Copy the form structure
      cloned_from: sharedForm.form_id // Track the original
    };
    
    // Save the cloned form as a new unpublished draft
    // Note: This will NOT save to the forms table yet (user needs to publish it)
    // Instead, we'll return the form data so the frontend can work with it
    
    return NextResponse.json({
      success: true,
      formId: newFormId,
      formData: {
        id: newFormId,
        name: clonedForm.name,
        data: originalForm.data,
        cloned_from: sharedForm.form_id,
        original_form_name: originalForm.name
      }
    });
    
  } catch (error) {
    console.error('Error cloning form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { FormStorage } from '../../../../lib/database';
import { verifyPassword } from '../../../../lib/crypto';

export async function GET(
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
    const form = FormStorage.getForm(sharedForm.form_id);
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }
    
    // Increment view count
    FormStorage.incrementShareViewCount(shareId);
    
    // Check if password protection is enabled
    if (sharedForm.password_hash) {
      return NextResponse.json({
        requiresPassword: true,
        formName: form.name,
        shareId: shareId,
        isEncrypted: form.encrypted,
        viewCount: sharedForm.view_count + 1,
        createdAt: sharedForm.created_at,
        expiresAt: sharedForm.expires_at
      });
    }
    
    // Return form data without password protection
    return NextResponse.json({
      success: true,
      requiresPassword: false,
      form: {
        id: form.id,
        name: form.name,
        data: form.data,
        encrypted: form.encrypted,
        password_hash: form.password_hash, // Include form's password hash for client-side decryption
        created_at: form.created_at,
        updated_at: form.updated_at
      },
      shareInfo: {
        shareId: shareId,
        viewCount: sharedForm.view_count + 1,
        createdAt: sharedForm.created_at,
        expiresAt: sharedForm.expires_at
      }
    });
    
  } catch (error) {
    console.error('Error accessing shared form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await context.params;
    const body = await request.json();
    const { password } = body;
    
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }
    
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
    
    // Verify password
    if (!sharedForm.password_hash || !verifyPassword(password, sharedForm.password_hash)) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
    
    // Get the actual form
    const form = FormStorage.getForm(sharedForm.form_id);
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }
    
    // Increment view count
    FormStorage.incrementShareViewCount(shareId);
    
    // Return form data
    return NextResponse.json({
      success: true,
      form: {
        id: form.id,
        name: form.name,
        data: form.data,
        encrypted: form.encrypted,
        password_hash: form.password_hash, // Include form's password hash for client-side decryption
        created_at: form.created_at,
        updated_at: form.updated_at
      },
      shareInfo: {
        shareId: shareId,
        viewCount: sharedForm.view_count + 1,
        createdAt: sharedForm.created_at,
        expiresAt: sharedForm.expires_at
      }
    });
    
  } catch (error) {
    console.error('Error verifying shared form password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

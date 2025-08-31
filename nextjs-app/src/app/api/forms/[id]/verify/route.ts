import { NextRequest, NextResponse } from 'next/server';
import { FormStorage } from '../../../../../lib/database';
import { verifyPassword } from '../../../../../lib/crypto';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    const { password } = body;
    
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }
    
    const form = FormStorage.getForm(id);
    
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }
    
    if (!form.encrypted || !form.password_hash) {
      return NextResponse.json({ error: 'Form is not password protected' }, { status: 400 });
    }
    
    const isPasswordValid = verifyPassword(password, form.password_hash);
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
    
    // Return form data if password is correct
    return NextResponse.json({
      success: true,
      form: {
        id: form.id,
        name: form.name,
        data: form.data,
        encrypted: form.encrypted,
        created_at: form.created_at,
        updated_at: form.updated_at
      }
    });
    
  } catch (error) {
    console.error('Error verifying password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { FormStorage } from '../../../../lib/database';
import { typeid } from 'typeid-js';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const form = FormStorage.getForm(id);
    
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }
    
    return NextResponse.json(form);
  } catch (error) {
    console.error('Error retrieving form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    const { name, data, encrypted = false } = body;
    
    if (!name || !data) {
      return NextResponse.json({ error: 'Name and data are required' }, { status: 400 });
    }
    
    const modification_key = typeid('key').toString();
    
    const formData = {
      id,
      modification_key,
      encrypted,
      name,
      data: JSON.stringify(data)
    };
    
    FormStorage.saveForm(formData);
    
    return NextResponse.json({ 
      success: true, 
      id, 
      modification_key 
    });
  } catch (error) {
    console.error('Error saving form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    FormStorage.deleteForm(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting form:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

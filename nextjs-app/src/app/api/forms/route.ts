import { NextResponse } from 'next/server';
import { FormStorage } from '../../../lib/database';

export async function GET() {
  try {
    const recentForms = FormStorage.getRecentForms();
    return NextResponse.json(recentForms);
  } catch (error) {
    console.error('Error retrieving recent forms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    FormStorage.clearAllForms();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing forms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

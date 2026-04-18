import { NextRequest, NextResponse } from 'next/server';
import { deleteContent, updateContent } from '@/lib/microcms-mgmt';
import { isAuthenticated } from '@/lib/auth';

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // Fix for Next.js 15
) {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    try {
        await deleteContent('transactions', id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE Error:', error);
        return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    try {
        const body = await request.json();
        const response = await updateContent('transactions', id, body);
        return NextResponse.json(response);
    } catch (error) {
        console.error('PATCH Error:', error);
        return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
    }
}

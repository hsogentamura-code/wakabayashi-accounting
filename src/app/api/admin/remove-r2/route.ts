import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { deleteFromR2 } from '@/lib/r2';

export async function POST(request: NextRequest) {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { urls } = body;

        if (!urls || !Array.isArray(urls)) {
            return NextResponse.json({ error: 'Invalid payload: urls array is required' }, { status: 400 });
        }

        if (urls.length > 0) {
            await deleteFromR2(urls);
        }

        return NextResponse.json({ success: true, deleted: urls.length });
    } catch (error) {
        console.error('Error in remove-r2:', error);
        return NextResponse.json({ error: 'Failed to delete files from R2' }, { status: 500 });
    }
}

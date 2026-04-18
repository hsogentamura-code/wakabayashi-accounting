import { NextRequest, NextResponse } from 'next/server';
import { createContent } from '@/lib/microcms-mgmt';
import { isAuthenticated } from '@/lib/auth';

export async function POST(request: NextRequest) {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { endpoint, content } = body;

        if (!endpoint || !['transactions'].includes(endpoint)) {
            return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
        }

        const result = await createContent(endpoint, content);

        // Revalidate cache
        const { revalidatePath } = await import('next/cache');
        revalidatePath(`/admin/${endpoint}`);
        revalidatePath(`/${endpoint}`);
        revalidatePath('/admin/reports'); // Clear reports cache too

        return NextResponse.json(result);
    } catch (error) {
        console.error('Content creation error:', error);
        const message = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}

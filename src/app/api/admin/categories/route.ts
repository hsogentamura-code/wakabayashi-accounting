import { NextResponse } from 'next/server';
import { fetchCategories } from '@/lib/microcms';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const categories = await fetchCategories();
        return NextResponse.json(categories);
    } catch (error) {
        console.error('API /admin/categories Error:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

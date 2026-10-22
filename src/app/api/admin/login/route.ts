import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const password = typeof body.password === 'string' ? body.password : '';
        const success = await login(password);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            // パスワード総当たり攻撃を遅延させるため失敗時はランダム待機
            await sleep(500 + Math.floor(Math.random() * 400));
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

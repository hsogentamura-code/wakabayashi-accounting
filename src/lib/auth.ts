import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const VIEW_PASSWORD = process.env.VIEW_PASSWORD;
const COOKIE_NAME = 'admin_session';

type Role = 'admin' | 'viewer' | null;

export async function getSessionRole(): Promise<Role> {
    const cookieStore = await cookies();
    const session = cookieStore.get(COOKIE_NAME);
    if (session?.value === 'admin') return 'admin';
    if (session?.value === 'viewer') return 'viewer';
    return null;
}

export async function isAuthenticated(): Promise<boolean> {
    const role = await getSessionRole();
    return role === 'admin';
}

export async function isViewer(): Promise<boolean> {
    const role = await getSessionRole();
    return role === 'admin' || role === 'viewer';
}

export async function login(password: string): Promise<boolean> {
    let role: Role = null;

    if (password === ADMIN_PASSWORD) {
        role = 'admin';
    } else if (password === VIEW_PASSWORD) {
        role = 'viewer';
    }

    if (role) {
        const cookieStore = await cookies();
        cookieStore.set(COOKIE_NAME, role, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });
        return true;
    }
    return false;
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

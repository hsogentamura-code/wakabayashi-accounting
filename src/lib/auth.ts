import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const VIEW_PASSWORD = process.env.VIEW_PASSWORD;
const COOKIE_NAME = 'admin_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 1 week

type Role = 'admin' | 'viewer' | null;

// パスワードシークレットからHMAC署名鍵を導出
function getSigningKey(): Buffer | null {
    const combined = `${ADMIN_PASSWORD || ''}:${VIEW_PASSWORD || ''}`;
    if (!combined || combined === ':') return null;
    return crypto.createHash('sha256').update(`accounting-session-salt:${combined}`).digest();
}

// HMAC-SHA256 署名を生成
function sign(data: string, key: Buffer): string {
    return crypto.createHmac('sha256', key).update(data).digest('base64url');
}

// セッショントークンを生成 (形式: role.timestamp.signature)
function createSessionToken(role: 'admin' | 'viewer', key: Buffer): string {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const dataToSign = `${role}.${timestamp}`;
    const signature = sign(dataToSign, key);
    return `${role}.${timestamp}.${signature}`;
}

// セッショントークンの検証
function verifySessionToken(token: string, key: Buffer): Role {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [role, timestampStr, providedSignature] = parts;
    if (role !== 'admin' && role !== 'viewer') return null;

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return null;

    // 有効期限チェック
    const now = Math.floor(Date.now() / 1000);
    if (now - timestamp > SESSION_MAX_AGE_SECONDS || timestamp > now + 60) {
        return null;
    }

    // 署名検証 (タイミング攻撃耐性)
    const dataToSign = `${role}.${timestampStr}`;
    const expectedSignature = sign(dataToSign, key);
    try {
        const a = Buffer.from(providedSignature);
        const b = Buffer.from(expectedSignature);
        if (a.length !== b.length) return null;
        if (!crypto.timingSafeEqual(a, b)) return null;
        return role;
    } catch {
        return null;
    }
}

// 安全なパスワード比較 (タイミング攻撃対策)
function safeComparePassword(a: string, b: string): boolean {
    const hashA = crypto.createHash('sha256').update(a).digest();
    const hashB = crypto.createHash('sha256').update(b).digest();
    return crypto.timingSafeEqual(hashA, hashB);
}

export async function getSessionRole(): Promise<Role> {
    const key = getSigningKey();
    if (!key) return null;

    const cookieStore = await cookies();
    const session = cookieStore.get(COOKIE_NAME);
    if (!session?.value) return null;

    return verifySessionToken(session.value, key);
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
    if (!password) return false;

    let role: 'admin' | 'viewer' | null = null;
    if (ADMIN_PASSWORD && safeComparePassword(password, ADMIN_PASSWORD)) {
        role = 'admin';
    } else if (VIEW_PASSWORD && safeComparePassword(password, VIEW_PASSWORD)) {
        role = 'viewer';
    }

    if (!role) return false;

    const key = getSigningKey();
    if (!key) return false;

    const token = createSessionToken(role, key);
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'strict',
        maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return true;
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

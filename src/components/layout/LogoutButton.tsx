'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin/login');
        router.refresh();
    };

    return (
        <button onClick={handleLogout} style={{
            background: 'none',
            border: 'none',
            color: '#e2e8f0',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            padding: '0.5rem 0',
        }}
            onMouseOver={e => e.currentTarget.style.color = '#ffffff'}
            onMouseOut={e => e.currentTarget.style.color = '#e2e8f0'}
        >
            ログアウト
        </button>
    );
}

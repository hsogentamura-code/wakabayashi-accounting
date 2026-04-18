'use client';

import { useRouter } from 'next/navigation';

export default function BackButton() {
    const router = useRouter();
    return (
        <button
            onClick={() => router.back()}
            style={{
                padding: '8px 16px',
                border: '1px solid var(--color-border)',
                background: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                color: 'var(--color-primary)'
            }}
        >
            &larr; 元の画面に戻る
        </button>
    );
}

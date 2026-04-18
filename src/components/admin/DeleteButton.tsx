'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteButton({ id, type, title, redirectPath }: { id: string, type: 'news' | 'resources' | 'events' | 'transactions', title: string, redirectPath?: string }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`「${title}」を削除しますか？\nこの操作は取り消せません。`)) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/${type}/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete');

            alert('削除しました。');
            if (redirectPath) {
                router.push(redirectPath);
                router.refresh();
            } else {
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            alert('削除に失敗しました。');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
                padding: '0.4rem 0.8rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem'
            }}
        >
            {isDeleting ? '削除中...' : '削除'}
        </button>
    );
}

'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface PaginationProps {
    totalCount: number;
    currentOffset: number;
    limit: number;
    basePath: string;
}

export default function Pagination({ totalCount, currentOffset, limit, basePath }: PaginationProps) {
    const searchParams = useSearchParams();
    const currentPage = Math.floor(currentOffset / limit) + 1;
    const totalPages = Math.ceil(totalCount / limit);

    const startCount = totalCount === 0 ? 0 : currentOffset + 1;
    const endCount = Math.min(currentOffset + limit, totalCount);

    const hasPrev = currentOffset > 0;
    const hasNext = endCount < totalCount;

    const prevPage = currentPage - 1;
    const nextPage = currentPage + 1;

    // Helper to generate the URL with all existing query params and the new page param
    const createPageUrl = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', pageNumber.toString());
        return `${basePath}?${params.toString()}`;
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '1rem', marginTop: '1rem', color: '#5f6368', fontSize: '0.9rem' }}>
            <span>
                {startCount}-{endCount} / {totalCount}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {hasPrev ? (
                    <Link
                        href={createPageUrl(prevPage)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: '1px solid #ddd',
                            backgroundColor: 'white',
                            color: '#5f6368',
                            textDecoration: 'none',
                            cursor: 'pointer'
                        }}
                        title="前へ"
                    >
                        &lt;
                    </Link>
                ) : (
                    <span
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#f1f3f4',
                            color: '#bdc1c6',
                            cursor: 'default'
                        }}
                    >
                        &lt;
                    </span>
                )}

                {hasNext ? (
                    <Link
                        href={createPageUrl(nextPage)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: '1px solid #ddd',
                            backgroundColor: 'white',
                            color: '#5f6368',
                            textDecoration: 'none',
                            cursor: 'pointer'
                        }}
                        title="次へ"
                    >
                        &gt;
                    </Link>
                ) : (
                    <span
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#f1f3f4',
                            color: '#bdc1c6',
                            cursor: 'default'
                        }}
                    >
                        &gt;
                    </span>
                )}
            </div>
        </div>
    );
}

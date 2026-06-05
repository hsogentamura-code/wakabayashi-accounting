'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent } from 'react';
import type { Category } from '@/types';

interface TransactionFilterProps {
    categories: Category[];
    currentCategoryId?: string;
}

export default function TransactionFilter({ categories, currentCategoryId = 'all' }: TransactionFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const filterValue = currentCategoryId || 'all';

    const currentYear = searchParams.get('year') || '';
    const currentMonth = searchParams.get('month') || '';

    // Generate years from 2020 to current year + 1
    const currentRealYear = new Date().getFullYear();
    const years = Array.from({ length: currentRealYear - 2020 + 2 }, (_, i) => 2020 + i);

    // Generate months 01 to 12
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

    const handleFilterChange = (type: 'year' | 'month' | 'categoryId', value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('page'); // Reset pagination on filter change
        
        if (type === 'categoryId') {
            if (value && value !== 'all') {
                params.set('categoryId', value);
            } else {
                params.delete('categoryId');
            }
        } else {
            if (value) {
                params.set(type, value);
                if (type === 'month') params.delete('year'); // mutual exclusion
                if (type === 'year') params.delete('month');
            } else {
                params.delete(type);
            }
        }

        router.push(`/transactions?${params.toString()}`);
    };

    // Sort categories by order if available
    const sortedCategories = [...categories].sort((a, b) => (a.order || 9999) - (b.order || 9999));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* 年月絞り込み */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#f8f9fa', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e9ecef', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#495057' }}>期間絞り込み:</span>
                
                <select 
                    value={currentYear} 
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => handleFilterChange('year', e.target.value)}
                    style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #ced4da', background: 'white', color: '#495057', fontSize: '0.9rem' }}
                >
                    <option value="">すべての年</option>
                    {years.map(y => (
                        <option key={y} value={y.toString()}>{y}年</option>
                    ))}
                </select>

                <select 
                    value={currentMonth} 
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => handleFilterChange('month', e.target.value)}
                    style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #ced4da', background: 'white', color: '#495057', fontSize: '0.9rem' }}
                >
                    <option value="">すべての月</option>
                    {years.map(y => (
                        <optgroup key={y} label={`${y}年`}>
                            {months.map(m => (
                                <option key={`${y}-${m}`} value={`${y}-${m}`}>
                                    {y}年{m}月
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </select>
            </div>

            {/* 科目（カテゴリ）表示フィルタ - レポート画面に準拠 */}
            <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.75rem', fontSize: '0.95rem', color: '#1e293b' }}>表示フィルタ</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <button
                        onClick={() => handleFilterChange('categoryId', 'all')}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            border: filterValue === 'all' ? '1px solid #2F5D62' : '1px solid #ddd',
                            backgroundColor: filterValue === 'all' ? '#2F5D62' : 'white',
                            color: filterValue === 'all' ? 'white' : '#333',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                            fontWeight: filterValue === 'all' ? 'bold' : 'normal',
                            fontSize: '0.85rem',
                            boxShadow: filterValue === 'all' ? '0 2px 4px rgba(47, 93, 98, 0.2)' : 'none'
                        }}
                    >
                        すべての収支
                    </button>
                    <button
                        onClick={() => handleFilterChange('categoryId', 'exclude_carryover')}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            border: filterValue === 'exclude_carryover' ? '1px solid #d97706' : '1px solid #ddd',
                            backgroundColor: filterValue === 'exclude_carryover' ? '#f59e0b' : 'white',
                            color: filterValue === 'exclude_carryover' ? 'white' : '#333',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                            fontWeight: filterValue === 'exclude_carryover' ? 'bold' : 'normal',
                            fontSize: '0.85rem',
                            boxShadow: filterValue === 'exclude_carryover' ? '0 2px 4px rgba(245, 158, 11, 0.2)' : 'none'
                        }}
                    >
                        繰越金を除くすべて (単年度)
                    </button>
                </div>
                
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #e2e8f0' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: 'bold' }}>▼ 科目で絞り込む:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {sortedCategories.map(c => (
                            <button
                                key={c.id}
                                onClick={() => handleFilterChange('categoryId', c.id)}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '20px',
                                    border: filterValue === c.id ? '1px solid #0284c7' : '1px solid #e2e8f0',
                                    backgroundColor: filterValue === c.id ? '#0ea5e9' : '#f8fafc',
                                    color: filterValue === c.id ? 'white' : '#475569',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease-in-out',
                                    fontWeight: filterValue === c.id ? 'bold' : 'normal',
                                    fontSize: '0.8rem',
                                    boxShadow: filterValue === c.id ? '0 2px 4px rgba(14, 165, 233, 0.2)' : 'none'
                                }}
                            >
                                {c.order ? `${c.order}: ` : ''}{c.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent } from 'react';

export default function TransactionFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentYear = searchParams.get('year') || '';
    const currentMonth = searchParams.get('month') || '';

    // Generate years from 2020 to current year + 1
    const currentRealYear = new Date().getFullYear();
    const years = Array.from({ length: currentRealYear - 2020 + 2 }, (_, i) => 2020 + i);

    // Generate months 01 to 12
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

    const handleFilterChange = (type: 'year' | 'month', value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('page'); // Reset pagination on filter change
        
        if (value) {
            params.set(type, value);
            if (type === 'month') params.delete('year'); // mutual exclusion for simplicity or handling logic
            if (type === 'year') params.delete('month');
        } else {
            params.delete(type);
        }

        router.push(`/transactions?${params.toString()}`);
    };

    return (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center', background: '#f8f9fa', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#495057' }}>絞り込み:</span>
            
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
    );
}

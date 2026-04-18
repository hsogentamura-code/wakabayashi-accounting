import { Transaction, Category } from '@/types';

// --- Mock Category Data ---
export const mockCategories: Category[] = [
    { id: 'c1', name: '会費収入', type: 'income' },
    { id: 'c2', name: '雑収入', type: 'income' },
    { id: 'c3', name: '消耗品費', type: 'expense' },
    { id: 'c4', name: '会議費', type: 'expense' },
    { id: 'c5', name: '行事費', type: 'expense' },
    { id: 'c6', name: '慶弔費', type: 'expense' },
];

// --- Mock Transaction Data ---
export const mockTransactions: Transaction[] = [
    {
        id: 't1',
        date: '2026-02-01',
        categoryId: mockCategories[2], // 消耗品費
        type: 'expense',
        amount: 3500,
        description: 'コピー用紙、インクカートリッジ',
        receiptUrl: 'https://example.com/receipt1.jpg'
    },
    {
        id: 't2',
        date: '2026-02-15',
        categoryId: mockCategories[4], // 行事費
        type: 'expense',
        amount: 25000,
        description: '春の防災訓練 備品購入',
        receiptUrl: 'https://example.com/receipt2.jpg'
    },
    {
        id: 't3',
        date: '2026-02-28',
        categoryId: mockCategories[0], // 会費収入
        type: 'income',
        amount: 150000,
        description: '2月分 会費集金',
    }
];

// --- Data Fetching Functions ---

import { fetchTransactions, fetchCategories, fetchTransactionById, isCmsEnabled } from './microcms';

// Categories
export async function getCategories(): Promise<Category[]> {
    if (isCmsEnabled) {
        const cmsCategories = await fetchCategories();
        if (cmsCategories.length > 0) {
            return cmsCategories;
        }
    }

    // Fallback to Mock
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockCategories;
}

// Transactions
export async function getTransactions(): Promise<Transaction[]> {
    if (isCmsEnabled) {
        const cmsTransactions = await fetchTransactions();
        if (cmsTransactions.length > 0) {
            // Sort by date desc
            return cmsTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
    }

    // Fallback to Mock
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [...mockTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getTransactionById(id: string): Promise<Transaction | undefined> {
    if (isCmsEnabled) {
        const cmsTransaction = await fetchTransactionById(id);
        if (cmsTransaction) return cmsTransaction;
    }

    // Fallback to Mock
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockTransactions.find((t) => t.id === id);
}

// Helper formatting
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
}

// --- Paginated Data Access ---

import { fetchPaginatedTransactions, PaginatedResponse } from './microcms';

export async function getPaginatedTransactions(offset: number, limit: number): Promise<PaginatedResponse<Transaction>> {
    if (isCmsEnabled) {
        return await fetchPaginatedTransactions(offset, limit);
    }

    // Fallback Mock
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Sort by date desc
    const sorted = [...mockTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const sliced = sorted.slice(offset, offset + limit);
    return {
        contents: sliced,
        totalCount: sorted.length,
    };
}

import { fetchAllLedgerTransactionsDesc, LedgerTransaction } from './microcms';

export async function getLedgerTransactions(offset: number, limit: number, year?: string, month?: string): Promise<PaginatedResponse<LedgerTransaction>> {
    const filterTransactions = (txs: LedgerTransaction[]) => {
        let filtered = txs;
        if (month) {
            filtered = filtered.filter(t => t.date.startsWith(month));
        } else if (year) {
            filtered = filtered.filter(t => t.date.startsWith(year));
        }
        return filtered;
    };

    if (isCmsEnabled) {
        const allLedgerDesc = await fetchAllLedgerTransactionsDesc();
        const filtered = filterTransactions(allLedgerDesc);
        const sliced = filtered.slice(offset, offset + limit);
        return { contents: sliced, totalCount: filtered.length };
    }

    // Fallback Mock
    await new Promise((resolve) => setTimeout(resolve, 200));
    const sortedAsc = [...mockTransactions].sort((a, b) => {
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (diff !== 0) return diff;
        
        const numA = a.transaction_number ? Number(a.transaction_number) : NaN;
        const numB = b.transaction_number ? Number(b.transaction_number) : NaN;
        
        if (!isNaN(numA) && !isNaN(numB)) {
            if (numA !== numB) return numA - numB;
        } else if (!isNaN(numA)) {
            return -1;
        } else if (!isNaN(numB)) {
            return 1;
        }
        
        const ca = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const cb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return ca - cb;
    });

    let currentBalance = 0;
    const ledgerTrans: LedgerTransaction[] = sortedAsc.map(t => {
        const inc = t.amount_income !== undefined && t.amount_income !== null ? t.amount_income : (t.type === 'income' ? t.amount : 0);
        const exp = t.amount_expense !== undefined && t.amount_expense !== null ? t.amount_expense : (t.type === 'expense' ? t.amount : 0);
        currentBalance += (inc - exp);
        return { ...t, calculatedBalance: currentBalance };
    });

    ledgerTrans.reverse();
    const filteredMock = filterTransactions(ledgerTrans);
    const sliced = filteredMock.slice(offset, offset + limit);

    return { contents: sliced, totalCount: filteredMock.length };
}

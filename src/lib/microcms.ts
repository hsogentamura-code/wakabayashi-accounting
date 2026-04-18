import { createClient } from 'microcms-js-sdk';
import { Transaction, Category } from '@/types';

// Check if environment variables are set
const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;

if (!serviceDomain || !apiKey) {
    console.warn('MicroCMS environment variables are missing. Using mock data.');
}

export const client = createClient({
    serviceDomain: serviceDomain || 'YOUR_DOMAIN',
    apiKey: apiKey || 'YOUR_API_KEY',
});

// Helper to check if CMS is enabled
export const isCmsEnabled = !!(serviceDomain && apiKey);

// --- MicroCMS Type Definitions ---

interface MicroCMSCategory {
    id: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    revisedAt: string;
    name: string;
    type: string[]; // Select box returns array
    order?: number;
}

interface MicroCMSTransaction {
    id: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    revisedAt: string;
    date: string;
    category: MicroCMSCategory; // Reference fields return the whole item
    type?: string[]; // Select box returns array
    transaction_number?: string;
    amount: number;
    amount_income?: number;
    amount_expense?: number;
    balance?: number;
    description?: string;
    content?: string;
    receiptUrl?: string; // TextField for R2 URL
    attachments?: string;
}


// --- Helpers ---

// Convert UTC ISO string to JST YYYY-MM-DD
const formatDateToJST = (isoString: string): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Add 9 hours to get JST
    const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    return jstDate.toISOString().split('T')[0];
};

// --- Mappers ---

const resolveType = (rawType: any): 'income' | 'expense' => {
    const val = Array.isArray(rawType) ? rawType[0] : rawType;
    if (val === '収入' || val === 'income') return 'income';
    return 'expense';
};

const mapCategory = (cmsCategory: MicroCMSCategory): Category => {
    return {
        id: cmsCategory.id,
        name: cmsCategory.name,
        type: resolveType(cmsCategory.type),
        order: cmsCategory.order,
    };
};

const mapTransaction = (cmsRecord: MicroCMSTransaction): Transaction => {
    // Description might be rich text (HTML) from CMS, so strip tags if present
    const cleanDescription = cmsRecord.description
        ? cmsRecord.description.replace(/<[^>]*>?/gm, '')
        : undefined;

    return {
        id: cmsRecord.id,
        createdAt: cmsRecord.createdAt,
        transaction_number: cmsRecord.transaction_number,
        date: formatDateToJST(cmsRecord.date),
        categoryId: mapCategory(cmsRecord.category), // updated field name
        type: resolveType(cmsRecord.type),
        amount: cmsRecord.amount,
        amount_income: cmsRecord.amount_income,
        amount_expense: cmsRecord.amount_expense,
        balance: cmsRecord.balance,
        description: cleanDescription,
        content: cmsRecord.content,
        receiptUrl: cmsRecord.receiptUrl,
        attachments: cmsRecord.attachments,
    };
};


// --- Fetch Functions ---

export const fetchCategories = async (): Promise<Category[]> => {
    if (!isCmsEnabled) return [];
    try {
        const data = await client.getList<MicroCMSCategory>({ endpoint: 'categories', queries: { limit: 100, orders: 'order' } });
        return data.contents.map(mapCategory);
    } catch (err) {
        console.error('Failed to fetch categories:', err);
        return [];
    }
};

export const fetchTransactions = async (): Promise<Transaction[]> => {
    if (!isCmsEnabled) return [];
    try {
        let allTransactions: MicroCMSTransaction[] = [];
        let offset = 0;
        const limit = 100;
        let totalCount = 0;

        do {
            const data = await client.getList<MicroCMSTransaction>({
                endpoint: 'transactions',
                queries: { limit, offset, orders: '-date' }
            });
            allTransactions = allTransactions.concat(data.contents);
            totalCount = data.totalCount;
            offset += limit;
        } while (offset < totalCount);

        return allTransactions.map(mapTransaction);
    } catch (err) {
        console.error('Failed to fetch transactions:', err);
        return [];
    }
};

export const fetchTransactionById = async (id: string): Promise<Transaction | undefined> => {
    if (!isCmsEnabled) return undefined;
    try {
        const data = await client.getListDetail<MicroCMSTransaction>({ endpoint: 'transactions', contentId: id });
        return mapTransaction(data);
    } catch (err) {
        console.error('Failed to fetch transaction detail:', err);
        return undefined;
    }
};


// --- Paginated Fetch Functions ---

export interface PaginatedResponse<T> {
    contents: T[];
    totalCount: number;
}

export const fetchPaginatedTransactions = async (offset: number, limit: number): Promise<PaginatedResponse<Transaction>> => {
    if (!isCmsEnabled) return { contents: [], totalCount: 0 };
    try {
        // Order by date descending by default
        const queries: any = { offset, limit, orders: '-date' };

        const data = await client.getList<MicroCMSTransaction>({ endpoint: 'transactions', queries });
        return {
            contents: data.contents.map(mapTransaction),
            totalCount: data.totalCount,
        };
    } catch (err) {
        console.error('Failed to fetch paginated transactions:', err);
        return { contents: [], totalCount: 0 };
    }
};

export interface LedgerTransaction extends Transaction {
    calculatedBalance: number;
}

export const fetchAllLedgerTransactionsDesc = async (): Promise<LedgerTransaction[]> => {
    if (!isCmsEnabled) return [];
    try {
        // Fetch ALL items using the updated fetchTransactions
        const mapped = await fetchTransactions();

        // Sort ascending by date to calculate running balance
        mapped.sort((a, b) => {
            const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
            if (dateDiff !== 0) return dateDiff;
            
            // Sort by transaction_number
            const numA = a.transaction_number ? Number(a.transaction_number) : NaN;
            const numB = b.transaction_number ? Number(b.transaction_number) : NaN;
            
            if (!isNaN(numA) && !isNaN(numB)) {
                if (numA !== numB) return numA - numB;
            } else if (!isNaN(numA)) {
                return -1; // Items with numbers come first
            } else if (!isNaN(numB)) {
                return 1;
            }

            // Fallback to createdAt ascending (older first)
            const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return createdA - createdB;
        });

        let currentBalance = 0;
        const ledgerTrans: LedgerTransaction[] = mapped.map(t => {
            const inc = t.amount_income !== undefined && t.amount_income !== null ? t.amount_income : (t.type === 'income' ? t.amount : 0);
            const exp = t.amount_expense !== undefined && t.amount_expense !== null ? t.amount_expense : (t.type === 'expense' ? t.amount : 0);
            currentBalance += (inc - exp);
            return {
                ...t,
                calculatedBalance: currentBalance
            };
        });

        // Now sort descending for display (newest first)
        ledgerTrans.reverse();

        return ledgerTrans;
    } catch (err) {
        console.error('Failed to fetch ledger transactions:', err);
        return [];
    }
};

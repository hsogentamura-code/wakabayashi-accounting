export interface Category {
    id: string;
    name: string;
    type: 'income' | 'expense';
    order?: number;
}

export interface Transaction {
    id: string;
    createdAt?: string;
    transaction_number?: string;
    date: string; // ISO string YYYY-MM-DD
    categoryId: Category; // MicroCMS returns the resolved Category object
    type: 'income' | 'expense';
    amount: number;
    amount_income?: number;
    amount_expense?: number;
    balance?: number;
    description?: string;
    content?: string;
    receiptUrl?: string;
    attachments?: string;
}

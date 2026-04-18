import Link from 'next/link';
import { getLedgerTransactions } from '@/lib/data';
import Pagination from '@/components/ui/Pagination';
import { isAuthenticated } from '@/lib/auth';
import LedgerTable from './LedgerTable';
import TransactionFilter from './TransactionFilter';
import styles from './page.module.css';

export const metadata = {
    title: '取引一覧 | 若林町西自治会 会計',
};

const ITEMS_PER_PAGE = 20;

export default async function TransactionsPage(props: { searchParams?: Promise<{ page?: string, year?: string, month?: string }> }) {
    const searchParams = await props.searchParams;
    const page = Number(searchParams?.page) || 1;
    const offset = (page - 1) * ITEMS_PER_PAGE;
    
    const year = searchParams?.year;
    const month = searchParams?.month;

    const { contents: transactions, totalCount } = await getLedgerTransactions(offset, ITEMS_PER_PAGE, year, month);
    const isAdmin = await isAuthenticated();

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>取引一覧 (帳簿)</h1>
                {isAdmin && (
                    <Link href="/transactions/new" style={{ backgroundColor: '#2F5D62', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
                        ＋ 新規登録
                    </Link>
                )}
            </div>

            <TransactionFilter />

            <div className={styles.ledgerContainer}>
                <LedgerTable transactions={transactions} />
            </div>

            {totalCount > ITEMS_PER_PAGE && (
                <div className={styles.paginationWrapper}>
                    <Pagination totalCount={totalCount} currentOffset={offset} limit={ITEMS_PER_PAGE} basePath="/transactions" />
                </div>
            )}
        </div>
    );
}

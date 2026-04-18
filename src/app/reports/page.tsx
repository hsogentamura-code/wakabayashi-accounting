import { fetchTransactions } from '@/lib/microcms';
import ReportsDashboard from './ReportsDashboard';
import styles from './page.module.css';

export const metadata = {
    title: 'レポート | 若林町西自治会 会計管理',
};

export default async function AdminReportsPage(props: { searchParams?: Promise<{ year?: string }> }) {
    const searchParams = await props.searchParams;
    const year = searchParams?.year || new Date().getFullYear().toString();

    // fetchTransactions currently fetches all items due to our microcms logic update
    const allTransactions = await fetchTransactions();

    // Filter transactions to the selected year
    const transactions = allTransactions.filter(t => t.date.startsWith(year));

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>会計レポート ({year}年)</h1>
            </div>

            <ReportsDashboard 
                transactions={transactions}
                year={year}
            />
        </div>
    );
}

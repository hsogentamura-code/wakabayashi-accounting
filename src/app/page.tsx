import Link from 'next/link';
import { getTransactions, formatDate } from '@/lib/data';
import { Transaction } from '@/types';
import { isAuthenticated } from '@/lib/auth';
import styles from './page.module.css';

export default async function Home() {
  const transactions = (await getTransactions()).slice(0, 10); // Latest 10 items
  const isAdmin = await isAuthenticated();

  // Calculate quick summary for this month
  const today = new Date();
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const currentMonthTransactions = transactions.filter(t => t.date >= currentMonthStart);

  const totalIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = currentMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="container">
      <section className={styles.hero}>
        <h2 className={styles.heroTitle}>若林町西自治会 会計ダッシュボード</h2>
        <p className={styles.heroText}>
          自治会の収支や財務状況の管理ダッシュボードです。
        </p>
      </section>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={`${styles.summaryCard} ${styles.incomeCard}`}>
          <h3 className={styles.summaryLabel}>今月の収入</h3>
          <p className={styles.summaryAmount}>¥{totalIncome.toLocaleString()}</p>
        </div>
        <div className={`${styles.summaryCard} ${styles.expenseCard}`}>
          <h3 className={styles.summaryLabel}>今月の支出</h3>
          <p className={styles.summaryAmount}>¥{totalExpense.toLocaleString()}</p>
        </div>
        <div className={`${styles.summaryCard} ${styles.balanceCard}`}>
          <h3 className={styles.summaryLabel}>今月の収支</h3>
          <p className={`${styles.summaryAmount} ${balance < 0 ? styles.negativeBalance : ''}`}>
            ¥{balance.toLocaleString()}
          </p>
        </div>
      </div>


      <div className={styles.dashboardGrid}>
        {/* Main Column (Left): Latest Transactions */}
        <section className={styles.mainColumn}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>最近の取引</h3>
            <Link href="/transactions">
              <span className={styles.viewMore}>すべて見る &rarr;</span>
            </Link>
          </div>
          <div className={styles.listContainer}>
            {transactions.map((t) => (
              <TransactionItem key={t.id} transaction={t} />
            ))}
            {transactions.length === 0 && (
              <p className={styles.emptyMessage}>最近の取引はありません。</p>
            )}
          </div>
        </section>

        {/* Sidebar Column (Right): Quick Actions */}
        <aside className={styles.sidebarColumn}>
          <section className={styles.widgetSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.widgetTitle}>クイックメニュー</h3>
            </div>

            {isAdmin && (
              <Link href="/transactions/new" className={styles.quickLinkItem}>
                <div className={styles.resourcesCard}>
                  {/* Reusing existing style class name for brevity, but it acts as a button */}
                  <p className={styles.resourcesText}>＋ 取引を登録する</p>
                </div>
              </Link>
            )}
            <Link href="/reports" className={styles.quickLinkItem}>
              <div className={styles.resourcesCard}>
                <p className={styles.resourcesText}>📊 レポートを見る</p>
              </div>
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.type === 'income';

  return (
    <div className={styles.listItem}>
      <div className={styles.itemMeta}>
        <span className={`${styles.badge} ${isIncome ? styles.badgeIncome : styles.badgeExpense}`}>
          {transaction.categoryId?.name || '未分類'}
        </span>
        <span className={styles.date}>{formatDate(transaction.date)}</span>
      </div>
      <div className={styles.itemTitleWrapper}>
        <div className={styles.itemTitle}>{transaction.description || '摘要なし'}</div>
        <div className={`${styles.amount} ${isIncome ? styles.textIncome : styles.textExpense}`}>
          {isIncome ? '+' : '-'}¥{transaction.amount.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { LedgerTransaction } from '@/lib/microcms';
import { formatDate } from '@/lib/data';
import styles from './page.module.css';

interface LedgerTableProps {
    transactions: LedgerTransaction[];
}

export default function LedgerTable({ transactions }: LedgerTableProps) {
    const router = useRouter();

    if (transactions.length === 0) {
        return <p className={styles.emptyMessage}>取引記録がありません。</p>;
    }

    return (
        <table className={styles.ledgerTable}>
            <thead>
                <tr>
                    <th>日付</th>
                    <th className={styles.mobileHide}>科目</th>
                    <th>摘要</th>
                    <th className={styles.amountHeader}>収入</th>
                    <th className={styles.amountHeader}>支出</th>
                    <th>番号</th>
                    <th className={styles.amountHeader}>差引残高</th>
                    <th>証憑</th>
                </tr>
            </thead>
            <tbody>
                {transactions.map((t) => {
                    const hasAttachments = t.attachments && t.attachments.length > 2; // > 2 because '[]' is 2 chars
                    let attachmentCount = 0;
                    if (hasAttachments) {
                        try {
                            attachmentCount = JSON.parse(t.attachments!).length;
                        } catch { }
                    }

                    const inc = t.amount_income !== undefined && t.amount_income !== null ? t.amount_income : (t.type === 'income' ? t.amount : null);
                    const exp = t.amount_expense !== undefined && t.amount_expense !== null ? t.amount_expense : (t.type === 'expense' ? t.amount : null);

                    return (
                        <tr
                            key={t.id}
                            className={styles.ledgerRow}
                            onClick={() => router.push(`/transactions/${t.id}`)}
                        >
                            <td className={styles.dateCell}>{formatDate(t.date)}</td>
                            <td className={`${styles.mobileHide} ${styles.categoryCell}`}>
                                <span className={styles.categoryBadge}>
                                    {t.categoryId?.order !== undefined && t.categoryId?.order !== null ? `${t.categoryId.order}: ` : ''}{t.categoryId?.name}
                                </span>
                            </td>
                            <td className={styles.descCell}>{t.description || '-'}</td>
                            <td className={`${styles.amountCell} ${styles.incomeText}`}>
                                {inc !== null && inc !== 0 ? `¥${inc.toLocaleString()}` : ''}
                            </td>
                            <td className={`${styles.amountCell} ${styles.expenseText}`}>
                                {exp !== null && exp !== 0 ? `¥${exp.toLocaleString()}` : ''}
                            </td>
                            <td className={styles.centerCell}>{t.transaction_number || '-'}</td>
                            <td className={`${styles.amountCell} ${styles.balanceText}`}>
                                ¥{t.calculatedBalance.toLocaleString()}
                            </td>
                            <td className={styles.receiptCell}>
                                {attachmentCount > 0 ? (
                                    <span className={styles.receiptLink}>📎 {attachmentCount}件</span>
                                ) : t.receiptUrl ? (
                                    <span className={styles.receiptLink}>🖼️ 表示</span>
                                ) : '-'}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

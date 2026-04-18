import { getTransactionById, formatDate } from '@/lib/data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import DocumentViewer from '@/components/features/DocumentViewer';
import DeleteButton from '@/components/admin/DeleteButton';
import { isAuthenticated } from '@/lib/auth';
import styles from './page.module.css';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function TransactionDetailPage({ params }: PageProps) {
    const { id } = await params;
    const transaction = await getTransactionById(id);

    if (!transaction) {
        notFound();
    }

    const isAdmin = await isAuthenticated();

    // Parse attachments
    let attachments: any[] = [];
    if (transaction.attachments) {
        try {
            attachments = JSON.parse(transaction.attachments);
        } catch { }
    } else if (transaction.receiptUrl) {
        // Fallback for legacy data
        attachments.push({
            url: transaction.receiptUrl,
            title: '証憑ファイル',
            type: transaction.receiptUrl.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image'
        });
    }

    const isIncome = transaction.type === 'income';

    return (
        <div className="container" style={{ padding: 'var(--spacing-xl) 0', maxWidth: '800px', margin: '0 auto' }}>
            <div className={styles.headerActions}>
                <Link href="/transactions" className={styles.backButton}>
                    &larr; 一覧に戻る
                </Link>

                {isAdmin && (
                    <div className={styles.adminActions}>
                        <Link href={`/transactions/edit/${transaction.id}`} className={styles.editButton}>
                            ✏️ 編集
                        </Link>
                        <DeleteButton id={transaction.id} title={transaction.description || 'この取引'} type="transactions" redirectPath="/transactions" />
                    </div>
                )}
            </div>

            <article className={styles.detailContainer}>
                <div className={styles.metaHeader}>
                    <span className={`${styles.badge} ${isIncome ? styles.income : styles.expense}`}>
                        {isIncome ? '収入' : '支出'}
                    </span>
                    <span className={styles.categoryBadge}>
                        {transaction.categoryId?.order !== undefined && transaction.categoryId?.order !== null ? `${transaction.categoryId.order}: ` : ''}{transaction.categoryId?.name}
                    </span>
                    <span className={styles.date}>{formatDate(transaction.date)}</span>
                </div>

                <h1 className={styles.title}>
                    {transaction.description || '（摘要なし）'}
                </h1>

                <div className={styles.amountBox}>
                    <span className={styles.amountLabel}>{isIncome ? '収入金額' : '支出金額'}</span>
                    <span className={`${styles.amountValue} ${isIncome ? styles.incomeText : styles.expenseText}`}>
                        ¥ {isIncome
                            ? (transaction.amount_income?.toLocaleString() ?? transaction.amount.toLocaleString())
                            : (transaction.amount_expense?.toLocaleString() ?? transaction.amount.toLocaleString())}
                    </span>
                </div>

                {transaction.content && (
                    <div className={styles.contentSection}>
                        <h2 className={styles.sectionTitle}>内容</h2>
                        <div
                            className={styles.richContent}
                            dangerouslySetInnerHTML={{ __html: transaction.content }}
                        />
                    </div>
                )}

                {attachments.length > 0 && (
                    <div className={styles.attachmentsSection}>
                        <h2 className={styles.sectionTitle}>添付ファイル（証憑・資料）</h2>
                        <div className={styles.attachmentList}>
                            {attachments.map((att, index) => (
                                <div key={index} className={styles.attachmentItem}>
                                    <DocumentViewer
                                        pdfUrl={att.type === 'pdf' ? att.url : undefined}
                                        imageUrl={att.type === 'image' ? att.url : undefined}
                                        fileName={att.title}
                                        description={att.description}
                                    />
                                    {att.type === 'other' && (
                                        <div style={{ textAlign: 'center', marginTop: '8px' }}>
                                            <a href={att.url} target="_blank" rel="noopener noreferrer" className={styles.otherFileLink}>
                                                📄 ファイルを開く: {att.title}
                                            </a>
                                            {att.description && <p style={{ fontSize: '14px', marginTop: '4px' }}>{att.description}</p>}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </article>
        </div>
    );
}

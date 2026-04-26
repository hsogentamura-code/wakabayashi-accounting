'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Category, Transaction } from '@/types';
import FileUpload from '@/components/admin/FileUpload';
import DocumentViewer from '@/components/features/DocumentViewer';
import styles from '../../new/page.module.css';

const linkify = (text: string) => {
    // Regex to convert URLs to clickable links, ensuring we don't double-link
    const urlRegex = /(?<!href="|href=')https?:\/\/[^\s<]+/g;
    return text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #2F5D62; text-decoration: underline;">${url}</a>`);
};

interface Attachment {
    url: string;
    title: string;
    type: 'pdf' | 'image' | 'video' | 'other';
    description?: string;
}

export default function EditTransactionClient({ initialData }: { initialData: Transaction }) {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper to safely parse initial attachments
    const parseAttachments = (attString: string | undefined): Attachment[] => {
        if (!attString) return [];
        try {
            return JSON.parse(attString);
        } catch {
            return [];
        }
    };

    // Helper to clean HTML from initial content if needed, though we will just pass HTML back to editor if it was simple.
    // In our new schema, content is stored as `<p>...</p>`, so we strip basic <p> tags for the textarea
    const cleanContentForEditor = (htmlStr: string | undefined) => {
        if (!htmlStr) return '';
        return htmlStr.replace(/^<p>/, '').replace(/<\/p>$/, '').replace(/<br\s*\/?>/gi, '\n');
    }

    // Form state initialized with existing data
    const [date, setDate] = useState(initialData.date); // YYYY-MM-DD
    const [transactionNumber, setTransactionNumber] = useState(initialData.transaction_number || '');
    const [categoryId, setCategoryId] = useState(initialData.categoryId.id);
    const [type, setType] = useState<'income' | 'expense'>(initialData.type);

    // New Amount Fields
    const [amountIncome, setAmountIncome] = useState(initialData.amount_income?.toString() || (initialData.type === 'income' ? initialData.amount.toString() : ''));
    const [amountExpense, setAmountExpense] = useState(initialData.amount_expense?.toString() || (initialData.type === 'expense' ? initialData.amount.toString() : ''));


    const [description, setDescription] = useState(initialData.description || '');
    const [content, setContent] = useState(cleanContentForEditor(initialData.content));

    // Legacy receipt URL converted to attachment if attachments array is empty
    const legacyParsed = parseAttachments(initialData.attachments);
    if (legacyParsed.length === 0 && initialData.receiptUrl) {
        // Migration: Treat the old receiptUrl as an attachment for display/edit purposes
        legacyParsed.push({
            url: initialData.receiptUrl,
            title: 'Uploaded File (Legacy)',
            type: initialData.receiptUrl.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image'
        });
    }
    const [attachments, setAttachments] = useState<Attachment[]>(legacyParsed);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (e) {
            console.error('Failed to fetch categories', e);
        }
    }

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        setCategoryId(selectedId);
        const cat = categories.find(c => c.id === selectedId);
        if (cat) {
            setType(cat.type);
        }
    };

    const handleTypeChange = (newType: 'income' | 'expense') => {
        setType(newType);
        // Reset category if changing type as categories are type-specific
        const firstMatchingCat = categories.find(c => c.type === newType);
        if (firstMatchingCat) {
            setCategoryId(firstMatchingCat.id);
        } else {
            setCategoryId('');
        }
    }

    const handleUploadComplete = (url: string, fileName: string, fileType: 'pdf' | 'image' | 'video' | 'other') => {
        setAttachments(prev => [...prev, { url, title: fileName, type: fileType }]);
    };

    const handleRemoveAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleDescriptionChange = (index: number, desc: string) => {
        setAttachments(prev => prev.map((att, i) => i === index ? { ...att, description: desc } : att));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const numIncome = type === 'income' ? Number(amountIncome) || 0 : 0;
            const numExpense = type === 'expense' ? Number(amountExpense) || 0 : 0;

            const transactionData = {
                date: new Date(date).toISOString(),
                category: categoryId,
                type: [type === 'income' ? '収入' : '支出'],
                // Fallback amount for legacy schema
                amount: type === 'income' ? numIncome : numExpense,

                // New Fields
                transaction_number: transactionNumber || undefined,
                amount_income: numIncome,
                amount_expense: numExpense,
                description: description || undefined, // Plain text now
                content: content ? `<p>${linkify(content).replace(/\n/g, '<br/>')}</p>` : undefined,
                attachments: attachments.length > 0 ? JSON.stringify(attachments) : undefined,
                // If there originally was a receiptUrl and now we wiped attachments, maybe clear it?
                receiptUrl: undefined, // Let legacy field stay untouched mostly, or we can overwrite it if needed
            };

            const res = await fetch(`/api/admin/transactions/${initialData.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transactionData),
            });

            if (!res.ok) throw new Error('Failed to update transaction');

            alert('取引を更新しました。');
            router.push('/transactions');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('エラーが発生しました。');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredCategories = categories.filter(c => c.type === type);

    return (
        <div className={styles.formContainer}>
            <h1 className={styles.title}>取引の編集</h1>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.typeSelector}>
                    <button
                        type="button"
                        className={`${styles.typeButton} ${type === 'income' ? styles.activeIncome : ''}`}
                        onClick={() => handleTypeChange('income')}
                    >
                        収入
                    </button>
                    <button
                        type="button"
                        className={`${styles.typeButton} ${type === 'expense' ? styles.activeExpense : ''}`}
                        onClick={() => handleTypeChange('expense')}
                    >
                        支出
                    </button>
                </div>

                <div className={styles.formGroup}>
                    <label>日付 <span className={styles.required}>*</span></label>
                    <input
                        type="date"
                        required
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>取引番号 <span className={styles.required}>*</span></label>
                    <input
                        type="text"
                        required
                        value={transactionNumber}
                        onChange={e => setTransactionNumber(e.target.value)}
                        className={styles.input}
                        placeholder="例：1"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>科目 <span className={styles.required}>*</span></label>
                    <select
                        required
                        value={categoryId}
                        onChange={handleCategoryChange}
                        className={styles.input}
                    >
                        <option value="" disabled>選択してください</option>
                        {filteredCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.order !== undefined && cat.order !== null ? `${cat.order}: ` : ''}{cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {type === 'income' ? (
                    <div className={styles.formGroup}>
                        <label>収入金額 <span className={styles.required}>*</span></label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={amountIncome}
                            onChange={e => setAmountIncome(e.target.value)}
                            className={`${styles.input} no-spin`}
                        />
                    </div>
                ) : (
                    <div className={styles.formGroup}>
                        <label>支出金額 <span className={styles.required}>*</span></label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={amountExpense}
                            onChange={e => setAmountExpense(e.target.value)}
                            className={`${styles.input} no-spin`}
                        />
                    </div>
                )}

                {/* Removed Balance field */}

                <div className={styles.formGroup}>
                    <label>摘要</label>
                    <input
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className={styles.input}
                        placeholder="例：コピー用紙代など"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>内容</label>
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        rows={6}
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontFamily: 'inherit' }}
                        placeholder="詳細な内容やメモなどを入力..."
                    />
                </div>

                <div className={styles.formGroup} style={{ padding: '1.5rem', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' }}>
                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold' }}>添付ファイル（領収書・資料等）</label>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        {attachments.map((att, index) => (
                            <div key={index} style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: '4px', border: '1px solid #eee', position: 'relative' }}>
                                <DocumentViewer
                                    pdfUrl={att.type === 'pdf' ? att.url : undefined}
                                    imageUrl={att.type === 'image' ? att.url : undefined}
                                    fileName={att.title}
                                    description={att.description}
                                />
                                {att.type === 'other' && (
                                    <div style={{ textAlign: 'center', margin: '8px 0' }}>
                                        <a href={att.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2F5D62', textDecoration: 'none', fontWeight: 'bold', wordBreak: 'break-all', fontSize: '13px' }}>
                                            📄 ファイルを開く: {att.title}
                                        </a>
                                    </div>
                                )}
                                <div style={{ marginTop: '0.5rem' }}>
                                    <input type="text" value={att.description || ''} onChange={e => handleDescriptionChange(index, e.target.value)}
                                        placeholder="説明文（省略可）"
                                        style={{ width: '100%', padding: '0.4rem 0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85rem', boxSizing: 'border-box', marginBottom: '4px' }} />
                                    <button type="button" onClick={() => handleRemoveAttachment(index)}
                                        style={{ width: '100%', padding: '4px', color: 'red', border: '1px solid #ffcccc', backgroundColor: '#fff0f0', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                                        このファイルを削除
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <FileUpload onUploadComplete={handleUploadComplete} />
                </div>

                <div className={styles.actions}>
                    <button type="button" onClick={() => router.back()} className={styles.cancelButton}>
                        キャンセル
                    </button>
                    <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
                        {isSubmitting ? '更新中...' : '更新する'}
                    </button>
                </div>
            </form>

            <style dangerouslySetInnerHTML={{
                __html: `
                .no-spin::-webkit-inner-spin-button, 
                .no-spin::-webkit-outer-spin-button { 
                    -webkit-appearance: none; 
                    margin: 0; 
                }
                .no-spin {
                    -moz-appearance: textfield;
                }
            `}} />
        </div>
    );
}

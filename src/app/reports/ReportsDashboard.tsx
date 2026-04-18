'use client';

import React, { useMemo, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import styles from './page.module.css';

import type { Transaction } from '@/types';

interface ReportsDashboardProps {
    transactions: Transaction[];
    year: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#8dd1e1', '#a4de6c', '#d0ed57'];

export default function ReportsDashboard({ transactions, year }: ReportsDashboardProps) {
    const [filter, setFilter] = useState<string>('all');

    const carryoverKeywords = ['繰越', '前年度繰越金'];

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const catName = t.categoryId?.name || '';
            if (filter === 'exclude_carryover') {
                return !carryoverKeywords.some(kw => catName.includes(kw));
            }
            if (filter !== 'all' && filter !== 'exclude_carryover') {
                return t.categoryId?.id === filter;
            }
            return true;
        });
    }, [transactions, filter]);

    const aggregates = useMemo(() => {
        let totalIncome = 0;
        let totalExpense = 0;
        const categoryTotals: Record<string, any> = {};
        const monthlyTotals: Record<string, any> = {};

        filteredTransactions.forEach(t => {
            const inc = t.amount_income !== undefined && t.amount_income !== null ? t.amount_income : (t.type === 'income' ? t.amount : 0);
            const exp = t.amount_expense !== undefined && t.amount_expense !== null ? t.amount_expense : (t.type === 'expense' ? t.amount : 0);

            totalIncome += inc;
            totalExpense += exp;

            // Category aggregation
            const catName = t.categoryId?.name || '不明';
            const catOrder = t.categoryId?.order ?? 9999;
            if (!categoryTotals[catName]) {
                categoryTotals[catName] = { income: 0, expense: 0, name: catName, order: catOrder };
            }
            categoryTotals[catName].income += inc;
            categoryTotals[catName].expense += exp;

            // Monthly aggregation (YYYY-MM)
            const monthPrefix = t.date.substring(0, 7);
            if (!monthlyTotals[monthPrefix]) {
                monthlyTotals[monthPrefix] = { income: 0, expense: 0 };
            }
            monthlyTotals[monthPrefix].income += inc;
            monthlyTotals[monthPrefix].expense += exp;
        });

        const categoryData = Object.values(categoryTotals)
            .sort((a: any, b: any) => a.order - b.order)
            .map(c => ({
                name: c.order !== 9999 ? `${c.order}: ${c.name}` : c.name,
                income: c.income,
                expense: c.expense,
                balance: c.income - c.expense,
            }));

        const months = Array.from({ length: 12 }, (_, i) => `${year}-${(i + 1).toString().padStart(2, '0')}`);
        const monthlyData = months.map(m => {
            const d = monthlyTotals[m] || { income: 0, expense: 0 };
            return {
                month: m.split('-')[1] + '月', // "02月"
                income: d.income,
                expense: d.expense,
                balance: d.income - d.expense
            };
        });

        return { totalIncome, totalExpense, totalBalance: totalIncome - totalExpense, categoryData, monthlyData };
    }, [filteredTransactions, year]);

    const { totalIncome, totalExpense, totalBalance, categoryData, monthlyData } = aggregates;

    const uniqueCategories = useMemo(() => {
        const cats = new Map();
        transactions.forEach(t => {
            if (t.categoryId && t.categoryId.id) {
                cats.set(t.categoryId.id, { id: t.categoryId.id, name: t.categoryId.name, order: t.categoryId.order });
            }
        });
        return Array.from(cats.values()).sort((a: any, b: any) => (a.order || 9999) - (b.order || 9999));
    }, [transactions]);
    const expensesByCategory = useMemo(() => {
        return categoryData
            .filter(d => d.expense > 0)
            .sort((a, b) => b.expense - a.expense);
    }, [categoryData]);

    const incomeByCategory = useMemo(() => {
        return categoryData
            .filter(d => d.income > 0)
            .sort((a, b) => b.income - a.income);
    }, [categoryData]);

    return (
        <div className={styles.dashboardContainer}>
            {/* Filter Buttons */}
            <div style={{ marginBottom: '1.5rem', background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.75rem', fontSize: '1rem' }}>表示フィルタ</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <button
                        onClick={() => setFilter('all')}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            border: filter === 'all' ? '1px solid #2F5D62' : '1px solid #ddd',
                            backgroundColor: filter === 'all' ? '#2F5D62' : 'white',
                            color: filter === 'all' ? 'white' : '#333',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                            fontWeight: filter === 'all' ? 'bold' : 'normal',
                            fontSize: '0.9rem',
                            boxShadow: filter === 'all' ? '0 2px 4px rgba(47, 93, 98, 0.2)' : 'none'
                        }}
                    >
                        すべての収支
                    </button>
                    <button
                        onClick={() => setFilter('exclude_carryover')}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            border: filter === 'exclude_carryover' ? '1px solid #d97706' : '1px solid #ddd',
                            backgroundColor: filter === 'exclude_carryover' ? '#f59e0b' : 'white',
                            color: filter === 'exclude_carryover' ? 'white' : '#333',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                            fontWeight: filter === 'exclude_carryover' ? 'bold' : 'normal',
                            fontSize: '0.9rem',
                            boxShadow: filter === 'exclude_carryover' ? '0 2px 4px rgba(245, 158, 11, 0.2)' : 'none'
                        }}
                    >
                        繰越金を除くすべて (単年度)
                    </button>
                </div>
                
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #eee' }}>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>▼ 科目ごとの推移に絞り込む:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {uniqueCategories.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setFilter(c.id)}
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '20px',
                                    border: filter === c.id ? '1px solid #0284c7' : '1px solid #e2e8f0',
                                    backgroundColor: filter === c.id ? '#0ea5e9' : '#f8fafc',
                                    color: filter === c.id ? 'white' : '#475569',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease-in-out',
                                    fontWeight: filter === c.id ? 'bold' : 'normal',
                                    fontSize: '0.85rem',
                                    boxShadow: filter === c.id ? '0 2px 4px rgba(14, 165, 233, 0.2)' : 'none'
                                }}
                            >
                                {c.order ? `${c.order}: ` : ''}{c.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                    <div className={styles.cardHeader}>総収入</div>
                    <div className={styles.amountIncome}>¥{totalIncome.toLocaleString()}</div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={styles.cardHeader}>総支出</div>
                    <div className={styles.amountExpense}>¥{totalExpense.toLocaleString()}</div>
                </div>
                <div className={`${styles.summaryCard} ${styles.balanceCard}`}>
                    <div className={styles.cardHeader}>現在の残高</div>
                    <div className={styles.amountBalance}>¥{totalBalance.toLocaleString()}</div>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                {/* Monthly Bar Chart */}
                <div className={styles.chartCard} style={{ gridColumn: '1 / -1' }}>
                    <h3 className={styles.chartTitle}>月別の収支推移</h3>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tick={{ fill: '#6c757d' }} />
                                <YAxis tick={{ fill: '#6c757d' }} tickFormatter={(value) => `¥${value.toLocaleString()}`} />
                                <Tooltip
                                    formatter={(value: any) => `¥${Number(value).toLocaleString()}`}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="income" name="収入" fill="#28a745" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name="支出" fill="#dc3545" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="balance" name="単月収支" fill="#007bff" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expenses Pie Chart */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>支出の内訳 (科目別)</h3>
                    {expensesByCategory.length > 0 ? (
                        <div className={styles.chartWrapper}>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={expensesByCategory}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="expense"
                                    >
                                        {expensesByCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: any) => `¥${Number(value).toLocaleString()}`}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className={styles.emptyChart}>支出データがありません</div>
                    )}
                </div>
                
                {/* Income Pie Chart */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>収入の内訳 (科目別)</h3>
                    {incomeByCategory.length > 0 ? (
                        <div className={styles.chartWrapper}>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={incomeByCategory}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="income"
                                    >
                                        {incomeByCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: any) => `¥${Number(value).toLocaleString()}`}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className={styles.emptyChart}>収入データがありません</div>
                    )}
                </div>
            </div>

            <div className={styles.listContainer}>
                <h2 className={styles.sectionTitle}>科目別の集計データ</h2>
                {categoryData.length > 0 ? (
                    <div className={styles.tableResponsive}>
                        <table className={styles.adminTable}>
                            <thead>
                                <tr>
                                    <th>科目</th>
                                    <th>収入合計</th>
                                    <th>支出合計</th>
                                    <th>小計 (収支)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categoryData.map((cat, i) => (
                                    <tr key={i}>
                                        <td>
                                            <span className={styles.badge}>{cat.name}</span>
                                        </td>
                                        <td className={styles.incomeText}>
                                            {cat.income > 0 ? `¥${cat.income.toLocaleString()}` : '-'}
                                        </td>
                                        <td className={styles.expenseText}>
                                            {cat.expense > 0 ? `¥${cat.expense.toLocaleString()}` : '-'}
                                        </td>
                                        <td className={styles.amountCell}>
                                            <strong>¥{cat.balance.toLocaleString()}</strong>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className={styles.emptyMessage}>データがありません。</p>
                )}
            </div>
        </div>
    );
}

import { fetchTransactionById } from '@/lib/microcms';
import DuplicateTransactionClient from './DuplicateTransactionClient';
import { notFound } from 'next/navigation';

export default async function DuplicateTransactionPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const transaction = await fetchTransactionById(params.id);

    if (!transaction) {
        notFound();
    }

    return (
        <DuplicateTransactionClient initialData={transaction} />
    );
}

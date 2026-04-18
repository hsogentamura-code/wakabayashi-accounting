import { fetchTransactionById } from '@/lib/microcms';
import EditTransactionClient from './EditTransactionClient';
import { notFound } from 'next/navigation';

export default async function EditTransactionPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const transaction = await fetchTransactionById(params.id);

    if (!transaction) {
        notFound();
    }

    return (
        <EditTransactionClient initialData={transaction} />
    );
}

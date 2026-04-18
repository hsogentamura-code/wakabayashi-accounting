import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '若林町西自治会',
  description: '若林町西自治会の会員向け情報サイトです。回覧板、訃報、お知らせをご覧いただけます。',
};

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

import ConditionalLayout from '@/components/layout/ConditionalLayout';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <ConditionalLayout header={<Header />} footer={<Footer />}>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}

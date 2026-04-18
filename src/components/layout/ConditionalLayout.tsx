'use client';

import { usePathname } from 'next/navigation';

export default function ConditionalLayout({
    children,
    header,
    footer
}: {
    children: React.ReactNode;
    header: React.ReactNode;
    footer: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith('/admin');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {!isAdmin && header}
            <main style={{ flex: 1 }}>
                {children}
            </main>
            {!isAdmin && footer}
        </div>
    );
}

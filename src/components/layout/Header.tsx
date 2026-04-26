import Link from 'next/link';
import { isViewer } from '@/lib/auth';
import LogoutButton from './LogoutButton';
import styles from './Header.module.css';

export default async function Header() {
    const isLoggedIn = await isViewer();

    return (
        <header className={styles.header}>
            <div className={`container ${styles.container}`}>
                <Link href="/" className={styles.brand}>
                    <h1 className={styles.title}>若林町西自治会 会計</h1>
                </Link>
                <nav className={styles.nav}>
                    <ul className={styles.navList}>
                        <li className={styles.navItem}>
                            <Link href="/" className={styles.navLink}>
                                ホーム
                            </Link>
                        </li>
                        <li className={styles.navItem}>
                            <Link href="/transactions" className={styles.navLink}>
                                取引一覧
                            </Link>
                        </li>
                        <li className={styles.navItem}>
                            <Link href="/reports" className={styles.navLink}>
                                レポート
                            </Link>
                        </li>
                        {isLoggedIn ? (
                            <li className={styles.navItem}>
                                <LogoutButton />
                            </li>
                        ) : (
                            <li className={styles.navItem}>
                                <Link href="/admin/login" className={styles.navLink}>
                                    ログイン
                                </Link>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
}

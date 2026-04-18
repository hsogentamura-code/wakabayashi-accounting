import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.container}`}>
                <p className={styles.copyright}>
                    &copy; {new Date().getFullYear()} 若林町西自治会 会計アプリ. All rights reserved.
                </p>
                <div className={styles.links}>
                    <Link href="/admin/login" className={styles.linkItem}>管理者ログイン</Link>
                </div>
            </div>
        </footer>
    );
}

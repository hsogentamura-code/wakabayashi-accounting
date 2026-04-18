import styles from './PageTitle.module.css';

interface PageTitleProps {
    title: string;
    subtitle?: string;
}

export default function PageTitle({ title, subtitle }: PageTitleProps) {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
    );
}

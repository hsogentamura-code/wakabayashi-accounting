'use client';

import styles from './Card.module.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    style?: React.CSSProperties;
}

export default function Card({ children, className = '', onClick, style }: CardProps) {
    return (
        <div
            className={`${styles.card} ${onClick ? styles.clickable : ''} ${className}`}
            onClick={onClick}
            style={style}
        >
            {children}
        </div>
    );
}

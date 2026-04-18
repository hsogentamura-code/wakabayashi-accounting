'use client';

import { useState, useEffect } from 'react';

interface DocumentViewerProps {
    pdfUrl?: string;
    imageUrl?: string;
    fileName?: string;    // ファイル名（フォールバック）
    description?: string; // 説明文（優先表示）
}

interface DocumentViewerProps {
    pdfUrl?: string;
    imageUrl?: string;
    fileName?: string;    // ファイル名（フォールバック）
    description?: string; // 説明文（優先表示）
}

function extractPublicId(pdfUrl: string): string | null {
    try {
        const urlObj = new URL(pdfUrl);
        const pathParts = urlObj.pathname.split('/');
        const uploadIndex = pathParts.indexOf('upload');
        if (uploadIndex === -1) return null;
        let parts = pathParts.slice(uploadIndex + 1);
        if (parts.length > 0 && /^v\d+$/.test(parts[0])) parts = parts.slice(1);
        return decodeURIComponent(parts.join('/'));
    } catch {
        return null;
    }
}

function deriveThumbnailPublicId(pdfPublicId: string): string {
    const parts = pdfPublicId.split('/');
    const filename = (parts.pop() || '').replace(/\.pdf$/i, '');
    const dir = parts.join('/');
    return dir ? `${dir}/thumbs/${filename}` : `thumbs/${filename}`;
}

// 共通バッジ（サムネイル右下のラベル）
function Badge({ label }: { label: string }) {
    return (
        <div style={{
            position: 'absolute',
            bottom: '6px',
            right: '6px',
            background: 'rgba(0,0,0,0.50)',
            color: '#fff',
            fontSize: '0.68rem',
            padding: '2px 7px',
            borderRadius: '10px',
            pointerEvents: 'none',
        }}>
            {label}
        </div>
    );
}

export default function DocumentViewer({ pdfUrl, imageUrl, fileName, description }: DocumentViewerProps) {
    // 説明文があれば説明文を、なければファイル名を表示
    const label = description?.trim() || fileName || null;
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [thumbnailFailed, setThumbnailFailed] = useState(false);
    const [imageThumbFailed, setImageThumbFailed] = useState(false);

    useEffect(() => {
        const resetHover = () => setHovered(false);
        const handlePageShow = (e: PageTransitionEvent) => { if (e.persisted) resetHover(); };
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxOpen(false); };

        window.addEventListener('pageshow', handlePageShow);
        document.addEventListener('visibilitychange', resetHover);
        document.addEventListener('keydown', handleKey);
        return () => {
            window.removeEventListener('pageshow', handlePageShow);
            document.removeEventListener('visibilitychange', resetHover);
            document.removeEventListener('keydown', handleKey);
        };
    }, []);

    if (!pdfUrl && !imageUrl) return null;

    // --- PDF URL processing ---
    let proxyUrl = '';
    let thumbnailUrl = '';
    if (pdfUrl) {
        const isR2 = pdfUrl.includes('r2.dev') || pdfUrl.includes('r2.cloudflarestorage.com');
        if (isR2) {
            proxyUrl = pdfUrl;
            thumbnailUrl = pdfUrl.replace(/\.pdf$/i, '_thumb.jpg');
        } else {
            const publicId = extractPublicId(pdfUrl);
            if (publicId) {
                proxyUrl = `/api/proxy-pdf?public_id=${encodeURIComponent(publicId)}`;
                thumbnailUrl = `/api/pdf-thumb?public_id=${encodeURIComponent(deriveThumbnailPublicId(publicId))}`;
            } else {
                proxyUrl = pdfUrl;
            }
        }
    }

    // --- Image URL processing ---
    let imageThumbUrl = imageUrl;
    if (imageUrl) {
        const isR2 = imageUrl.includes('r2.dev') || imageUrl.includes('r2.cloudflarestorage.com');
        if (isR2 && !imageThumbFailed) {
            const lastDotIndex = imageUrl.lastIndexOf('.');
            const baseName = lastDotIndex !== -1 ? imageUrl.substring(0, lastDotIndex) : imageUrl;
            imageThumbUrl = `${baseName}_thumb.jpg`;
        }
    }

    // Shared thumbnail container style
    const thumbContainerStyle: React.CSSProperties = {
        display: 'block',
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        marginTop: '8px',
        borderRadius: '6px',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: hovered
            ? '0 0 0 2.5px #4a9b8e, 0 2px 10px rgba(74,155,142,0.2)'
            : '0 1px 4px rgba(0,0,0,0.10)',
        transition: 'box-shadow 0.15s ease',
    };

    // Shared thumbnail image style (width-based, auto height)
    const thumbImgStyle: React.CSSProperties = {
        width: '100%',
        height: 'auto',
        display: 'block',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
    };

    return (
        <div style={{ textAlign: 'center' }}>
            {/* ── IMAGE ─────────────────────────────────── */}
            {imageUrl && (
                <>
                    <div
                        role="button"
                        tabIndex={0}
                        style={thumbContainerStyle}
                        onClick={() => setLightboxOpen(true)}
                        onKeyDown={e => e.key === 'Enter' && setLightboxOpen(true)}
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                    >
                        <img
                            src={imageThumbUrl}
                            alt="添付画像（タップで拡大）"
                            style={thumbImgStyle}
                            onError={() => setImageThumbFailed(true)}
                        />
                        <Badge label="タップして拡大" />
                    </div>
                    {label && (
                        <p style={{ margin: '6px 0 12px', fontSize: '1rem', fontWeight: 'bold', color: 'var(--color-text-main)', textAlign: 'center' }}>{label}</p>
                    )}

                    {/* Lightbox overlay */}
                    {lightboxOpen && (
                        <div
                            onClick={() => setLightboxOpen(false)}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                zIndex: 9999,
                                background: 'rgba(0,0,0,0.88)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '16px',
                            }}
                        >
                            <img
                                src={imageUrl}
                                alt="添付画像"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '90vh',
                                    objectFit: 'contain',
                                    borderRadius: '6px',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                                }}
                            />
                            <button
                                onClick={() => setLightboxOpen(false)}
                                aria-label="閉じる"
                                style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '20px',
                                    background: 'rgba(255,255,255,0.15)',
                                    border: 'none',
                                    color: '#fff',
                                    fontSize: '1.8rem',
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    lineHeight: 1,
                                }}
                            >
                                ×
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* ── PDF ───────────────────────────────────── */}
            {pdfUrl && proxyUrl && (
                <>
                    <a
                        href={proxyUrl}
                        style={{ ...thumbContainerStyle, textDecoration: 'none' }}
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                        onClick={() => setHovered(false)}
                    >
                        {thumbnailUrl && !thumbnailFailed ? (
                            // Real PDF thumbnail
                            <img
                                src={thumbnailUrl}
                                alt="PDFプレビュー"
                                onError={() => setThumbnailFailed(true)}
                                style={thumbImgStyle}
                            />
                        ) : (
                            // Fallback: PDF icon (A4 aspect ratio ~1:1.41)
                            <div style={{
                                width: '100%',
                                aspectRatio: '1 / 1.41',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#fafafa',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                            }}>
                                <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                                    <rect width="48" height="48" rx="6" fill="#E53E3E" />
                                    <path d="M14 10H30L38 18V40H14V10Z" fill="white" />
                                    <path d="M29 10V18H38L29 10Z" fill="#FEB2B2" />
                                    <text x="24" y="33" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#E53E3E" fontFamily="sans-serif">PDF</text>
                                </svg>
                            </div>
                        )}
                        <Badge label="タップして開く" />
                    </a>
                    {label && (
                        <p style={{ margin: '6px 0 12px', fontSize: '1rem', fontWeight: 'bold', color: 'var(--color-text-main)', textAlign: 'center' }}>{label}</p>
                    )}
                </>
            )}
        </div>
    );
}

import React from 'react';
import { getYouTubeEmbedUrl } from './youtube';

// Helper to convert URLs in plain text to clickable links
// Opens in the SAME tab per user request
export function renderTextWithLinks(text: string | undefined | null) {
    if (!text) return null;

    // Regex to match URLs (strict valid URL characters)
    const urlRegex = /(https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, i) => {
        if (part.match(urlRegex)) {
            const isYouTube = !!getYouTubeEmbedUrl(part);
            const href = isYouTube ? `/video?url=${encodeURIComponent(part)}` : part;

            return (
                <a
                    key={i}
                    href={href}
                    style={{ color: '#1976d2', textDecoration: 'underline' }}
                >
                    {isYouTube ? `🎥 動画を再生 (${part})` : part}
                </a>
            );
        }
        return part;
    });
}

// Helper to convert URLs in HTML strings to clickable links
// Safely ignores URLs that are already inside <a href="..."> tags
export function renderHtmlWithLinks(html: string | undefined | null) {
    if (!html) return '';

    // Split HTML by tags to process only text nodes
    const tokens = html.split(/(<[^>]+>)/g);
    let insideAnchor = false;

    const urlRegex = /(https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)/g;

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.toLowerCase().startsWith('<a ') || token.toLowerCase().startsWith('<a>')) {
            insideAnchor = true;
        } else if (token.toLowerCase().startsWith('</a>')) {
            insideAnchor = false;
        } else if (!token.startsWith('<') && !insideAnchor) {
            // It's a text node outside an anchor. Auto-link it.
            // Using same tab transition (no target="_blank")
            tokens[i] = token.replace(urlRegex, (url) => {
                const isYouTube = !!getYouTubeEmbedUrl(url);
                const href = isYouTube ? `/video?url=${encodeURIComponent(url)}` : url;
                const displayText = isYouTube ? `🎥 動画を再生 (${url})` : url;
                return `<a href="${href}" style="color: #1976d2; text-decoration: underline;">${displayText}</a>`;
            });
        }
    }
    return tokens.join('');
}

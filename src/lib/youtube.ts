export function getYouTubeEmbedUrl(url: string): string | null {
    if (!url) return null;

    // Extract video ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
        const videoId = match[2];
        let startTime = 0;

        // Extract time parameter (t=1h2m3s or t=123)
        const timeMatch = url.match(/[?&]t=([^&#]*)/);
        if (timeMatch && timeMatch[1]) {
            const timeStr = timeMatch[1];

            // Check for 1h2m3s format
            const h = timeStr.match(/(\d+)h/);
            const m = timeStr.match(/(\d+)m/);
            const s = timeStr.match(/(\d+)s/);

            if (h) startTime += parseInt(h[1]) * 3600;
            if (m) startTime += parseInt(m[1]) * 60;
            if (s) startTime += parseInt(s[1]);

            // If no h/m/s suffix, assume it's raw seconds
            if (!h && !m && !s) {
                const raw = parseInt(timeStr);
                if (!isNaN(raw)) startTime = raw;
            }
        }

        const params = startTime > 0 ? `?start=${startTime}` : '';
        return `https://www.youtube.com/embed/${videoId}${params}`;
    }

    return null;
}

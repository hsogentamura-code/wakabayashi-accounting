// Client for MicroCMS Write Operations (POST/PUT/DELETE)
// Note: This uses simple fetch, distinct from the read-only SDK.

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;

if (!serviceDomain || !apiKey) {
    console.warn('MicroCMS Management API keys are missing. Write operations will fail.');
}

const BASE_URL = `https://${serviceDomain}.microcms.io/api/v1`;

interface CreateContentResponse {
    id: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    revisedAt: string;
}

export const createContent = async (endpoint: string, content: any): Promise<CreateContentResponse> => {
    if (!serviceDomain || !apiKey) {
        throw new Error('MicroCMS credentials not configured.');
    }

    const response = await fetch(`${BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-MICROCMS-API-KEY': apiKey,
        },
        body: JSON.stringify(content),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('MicroCMS Write Error:', response.status, errorData);
        throw new Error(`MicroCMS ${response.status}: ${JSON.stringify(errorData)}`);
    }

    return response.json();
};

export const updateContent = async (endpoint: string, contentId: string, content: any): Promise<CreateContentResponse> => {
    if (!serviceDomain || !apiKey) {
        throw new Error('MicroCMS credentials not configured.');
    }

    const response = await fetch(`${BASE_URL}/${endpoint}/${contentId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'X-MICROCMS-API-KEY': apiKey,
        },
        body: JSON.stringify(content),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('MicroCMS Update Error:', response.status, errorData);
        throw new Error(`Failed to update content: ${response.statusText}`);
    }

    const text = await response.text();
    return (text ? JSON.parse(text) : {}) as CreateContentResponse;
};

export const deleteContent = async (endpoint: string, contentId: string): Promise<void> => {
    if (!serviceDomain || !apiKey) {
        throw new Error('MicroCMS credentials not configured.');
    }

    const response = await fetch(`${BASE_URL}/${endpoint}/${contentId}`, {
        method: 'DELETE',
        headers: {
            'X-MICROCMS-API-KEY': apiKey,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('MicroCMS Delete Error:', response.status, errorData);
        throw new Error(`Failed to delete content: ${response.statusText}`);
    }
};

/**
 * Utility to ensure document URLs go through our API proxy.
 * Handles both relative (/api/files/...) and absolute (http://localhost:9000/...) URLs.
 * This file is light-weight and can be imported in both Server and Client components.
 */
export function toProxyUrl(url: string | null | undefined): string {
    if (!url) return "#";
    
    // Already using the proxy path
    if (url.startsWith('/api/files/')) return url;

    // Try to extract key from absolute S3 URL: http://endpoint:9000/bucket-name/folder/key
    // OR http://bucket-name.endpoint:9000/folder/key (if path style is false, but we use true)
    
    if (url.startsWith('http')) {
        try {
            const urlObj = new URL(url);
            // In Path-Style (MinIO default), pathname is /bucket-name/key/path...
            const parts = urlObj.pathname.split('/').filter(Boolean);
            if (parts.length > 1) {
                // Remove the first part (bucket name) and join the rest as the key
                return `/api/files/${parts.slice(1).join('/')}`;
            }
        } catch (e) {
            console.error("Error parsing S3 URL for proxy:", e);
        }
    }

    return url;
}

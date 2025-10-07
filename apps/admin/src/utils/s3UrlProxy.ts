/**
 * Utility functions for handling S3 URLs and proxying them through the API
 * to avoid CORS issues in the admin app.
 */

// Prefer backend API routes to align with tests expecting /api/v1 endpoints
const NEXT_LOCAL = false
// Default to local API v1 if env is missing to ensure previews work during local dev
const API_BASE = ((process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1')).replace(/\/+$/, '')

function toBase64Url(input: string): string {
  try {
    const b64 = typeof window === 'undefined'
      ? Buffer.from(input, 'utf-8').toString('base64')
      : btoa(unescape(encodeURIComponent(input)))
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  } catch {
    return encodeURIComponent(input)
  }
}

/**
 * Converts external S3 URLs to use the API proxy endpoint to avoid CORS issues
 * @param url - The original URL (could be S3, external, or local)
 * @returns The proxied URL or the original URL if no proxying is needed
 */
export function getProxiedUrl(url: string): string {
  if (!url) return url;

  // If it's already using our Next.js proxy, return as is
  if (url.startsWith('/api/s3-proxy')) {
    return url;
  }

  // For any external HTTP/HTTPS URL (including S3), proxy via Next.js route to handle CORS and content-types
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `/api/s3-proxy?url=${encodeURIComponent(url)}`
  }

  // Otherwise, return as is (local/static paths)
  return url;
}

/**
 * Gets a direct S3 URL with proper error handling
 * @param url - The S3 URL to process
 * @returns The direct S3 URL or a fallback
 */
export function getDirectS3Url(url: string): string {
  if (!url) return url;
  
  // If it's already a direct S3 URL, return as is
  if (url.includes('s3.amazonaws.com') || url.includes('amazonaws.com')) {
    return url;
  }
  
  // If it's a proxy URL, we can't reconstruct the original safely
  if (url.includes('/api/v1/files/public/receipt-image/')) {
    return url;
  }
  
  return url;
}

/**
 * Checks if a URL is an external URL that might need proxying
 * @param url - The URL to check
 * @returns True if the URL is external and might need proxying
 */
export function isExternalUrl(url: string): boolean {
  if (!url) return false;
  
  // Check if it's an external HTTP/HTTPS URL
  if (url.startsWith('http')) {
    // Check if it's not localhost
    try {
      const urlObj = new URL(url);
      return !urlObj.hostname.includes('localhost') && 
             !urlObj.hostname.includes('127.0.0.1') &&
             !urlObj.hostname.includes('clubcorra.com') &&
             !urlObj.hostname.includes('vercel.app');
    } catch {
      // If URL parsing fails, assume it's external
      return true;
    }
  }
  
  return false;
}

/**
 * Gets a CDN URL if available, otherwise falls back to proxying
 * @param url - The original URL
 * @param cdnBaseUrl - Optional CDN base URL from environment
 * @returns The CDN URL or proxied URL
 */
export function getOptimizedUrl(url: string, cdnBaseUrl?: string): string {
  if (!url) return url;
  
  // If we have a CDN base URL and this is an S3 URL, try to construct a CDN URL
  if (cdnBaseUrl && (url.includes('s3.amazonaws.com') || url.includes('amazonaws.com'))) {
    try {
      const u = new URL(url)
      const key = u.pathname.replace(/^\//, '')
      if (key) {
        return `${cdnBaseUrl.replace(/\/$/, '')}/${key}`
      }
    } catch {
      // Fall back to proxying if CDN URL construction fails
    }
  }
  
  // Fall back to proxying
  return getProxiedUrl(url);
}

/**
 * Gets a fallback image URL when the original image fails to load
 * @param originalUrl - The original image URL that failed
 * @returns A fallback placeholder image URL
 */
export function getFallbackImageUrl(originalUrl?: string): string {
  // Use a reliable placeholder service
  return 'https://via.placeholder.com/400x600/cccccc/666666?text=Receipt+Preview+Not+Available';
}

/**
 * Checks if an image URL is accessible (basic validation)
 * @param url - The URL to check
 * @returns Promise that resolves to true if accessible
 */
export async function isImageAccessible(url: string): Promise<boolean> {
  if (!url) return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

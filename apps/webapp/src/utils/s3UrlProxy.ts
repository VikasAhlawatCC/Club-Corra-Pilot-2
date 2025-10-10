/**
 * Utility functions for handling S3 URLs and proxying them through the API
 * to avoid CORS issues and proxy authentication problems in the webapp.
 */

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
 * Converts external URLs to use the API proxy endpoint to avoid CORS and proxy authentication issues
 * @param url - The original URL (could be Google Drive, S3, external, or local)
 * @returns The proxied URL or the original URL if no proxying is needed
 */
export function getProxiedUrl(url: string): string {
  if (!url) return url;

  // If it's already using our Next.js proxy, return as is
  if (url.startsWith('/api/s3-proxy')) {
    return url;
  }

  // For any external HTTP/HTTPS URL (including Google Drive, S3), proxy via Next.js route to handle CORS and proxy issues
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `/api/s3-proxy?url=${encodeURIComponent(url)}`
  }

  // Otherwise, return as is (local/static paths)
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
 * Gets a fallback image URL when the original image fails to load
 * @param originalUrl - The original image URL that failed
 * @returns A fallback placeholder image URL
 */
export function getFallbackImageUrl(originalUrl?: string): string {
  // Use a reliable placeholder service
  return 'https://via.placeholder.com/48x48/cccccc/666666?text=?';
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

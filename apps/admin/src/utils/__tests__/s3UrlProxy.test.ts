import { getProxiedUrl, isExternalUrl, getOptimizedUrl } from '../s3UrlProxy'

describe('s3UrlProxy', () => {
  describe('getProxiedUrl', () => {
    it('should return local API URLs as-is', () => {
      expect(getProxiedUrl('/api/v1/files/public/receipt-image/123')).toBe('/api/v1/files/public/receipt-image/123')
      expect(getProxiedUrl('http://localhost:3001/api/v1/files/123')).toBe('http://localhost:3001/api/v1/files/123')
    })

    it('should proxy S3 URLs to API endpoint', () => {
      const s3Url = 'https://bucket-name.s3.us-east-1.amazonaws.com/receipt-123.jpg'
      const expected = '/api/v1/files/public/receipt-image/receipt-123.jpg'
      expect(getProxiedUrl(s3Url)).toBe(expected)
    })

    it('should proxy external URLs through external image endpoint', () => {
      const externalUrl = 'https://example.com/image.jpg'
      const expected = '/api/v1/files/public/external-image?url=https%3A%2F%2Fexample.com%2Fimage.jpg'
      expect(getProxiedUrl(externalUrl)).toBe(expected)
    })

    it('should handle empty or null URLs', () => {
      expect(getProxiedUrl('')).toBe('')
      expect(getProxiedUrl(null as any)).toBe(null)
    })

    it('should handle URLs without file extensions', () => {
      const s3Url = 'https://bucket-name.s3.amazonaws.com/file-key'
      const expected = '/api/v1/files/public/external-image?url=https%3A%2F%2Fbucket-name.s3.amazonaws.com%2Ffile-key'
      expect(getProxiedUrl(s3Url)).toBe(expected)
    })
  })

  describe('isExternalUrl', () => {
    it('should identify external URLs correctly', () => {
      expect(isExternalUrl('https://example.com/image.jpg')).toBe(true)
      expect(isExternalUrl('http://external-site.com/file.png')).toBe(true)
      expect(isExternalUrl('https://s3.amazonaws.com/bucket/file.jpg')).toBe(true)
    })

    it('should identify local URLs correctly', () => {
      expect(isExternalUrl('http://localhost:3000/image.jpg')).toBe(false)
      expect(isExternalUrl('http://127.0.0.1:3000/image.jpg')).toBe(false)
      expect(isExternalUrl('https://admin.clubcorra.com/image.jpg')).toBe(false)
      expect(isExternalUrl('https://app.vercel.app/image.jpg')).toBe(false)
    })

    it('should handle invalid URLs gracefully', () => {
      expect(isExternalUrl('not-a-url')).toBe(false)
      expect(isExternalUrl('')).toBe(false)
      expect(isExternalUrl(null as any)).toBe(false)
    })
  })

  describe('getOptimizedUrl', () => {
    it('should use CDN URL when available for S3 URLs', () => {
      const s3Url = 'https://bucket-name.s3.amazonaws.com/receipt-123.jpg'
      const cdnBaseUrl = 'https://cdn.clubcorra.com'
      const expected = 'https://cdn.clubcorra.com/receipt-123.jpg'
      expect(getOptimizedUrl(s3Url, cdnBaseUrl)).toBe(expected)
    })

    it('should fall back to proxying when CDN is not available', () => {
      const s3Url = 'https://bucket-name.s3.amazonaws.com/receipt-123.jpg'
      const expected = '/api/v1/files/public/receipt-image/receipt-123.jpg'
      expect(getOptimizedUrl(s3Url)).toBe(expected)
    })

    it('should handle non-S3 URLs with CDN', () => {
      const externalUrl = 'https://example.com/image.jpg'
      const cdnBaseUrl = 'https://cdn.clubcorra.com'
      const expected = '/api/v1/files/public/external-image?url=https%3A%2F%2Fexample.com%2Fimage.jpg'
      expect(getOptimizedUrl(externalUrl, cdnBaseUrl)).toBe(expected)
    })
  })
})

# Image Configuration for Club Corra Webapp

This document explains the image configuration setup for the Next.js webapp to handle external images from various sources.

## Configuration

The webapp is configured to load images from the following external domains:

### Google Drive Images
- **Domain**: `drive.google.com`
- **Paths**: 
  - `/uc**` (for Google Drive export URLs)
  - `/file/**` (for Google Drive sharing links)
- **Usage**: Brand logos and icons stored in Google Drive

### Stock Image Services
- **Unsplash**: `images.unsplash.com` - High-quality stock photos
- **Placeholder**: `via.placeholder.com` - Placeholder images for development
- **Lorem Picsum**: `picsum.photos` - Random placeholder images

## Next.js Configuration

The image domains are configured in `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'drive.google.com',
      port: '',
      pathname: '/uc**',
    },
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
      port: '',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'via.placeholder.com',
      port: '',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'picsum.photos',
      port: '',
      pathname: '/**',
    },
  ],
},
```

## Usage Examples

### Google Drive Images
```tsx
import Image from 'next/image';

// Export URL format
<Image
  src="https://drive.google.com/uc?export=view&id=YOUR_FILE_ID"
  alt="Brand Logo"
  width={32}
  height={32}
/>

// Sharing link format
<Image
  src="https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing"
  alt="Brand Logo"
  width={32}
  height={32}
/>
```

### Unsplash Images
```tsx
<Image
  src="https://images.unsplash.com/photo-1234567890"
  alt="Hero Image"
  width={800}
  height={600}
/>
```

### Placeholder Images
```tsx
<Image
  src="https://via.placeholder.com/300x200"
  alt="Placeholder"
  width={300}
  height={200}
/>
```

## Security Considerations

- All configured domains use HTTPS for secure image loading
- Path patterns are restricted to prevent abuse
- Google Drive URLs are limited to `/uc**` path for export functionality

## Adding New Image Domains

To add support for new image domains:

1. Update `next.config.ts`:
```typescript
images: {
  remotePatterns: [
    // ... existing patterns
    {
      protocol: 'https',
      hostname: 'new-domain.com',
      port: '',
      pathname: '/**',
    },
  ],
},
```

2. Restart the development server:
```bash
yarn dev
```

## Troubleshooting

### Common Issues

1. **"hostname is not configured" error**
   - Add the domain to `remotePatterns` in `next.config.ts`
   - Restart the development server

2. **Images not loading**
   - Check if the image URL is accessible
   - Verify the domain is in the allowed list
   - Ensure the image URL uses HTTPS

3. **Build failures**
   - Verify all image domains are properly configured
   - Check for typos in domain names
   - Ensure protocol is specified correctly

### Debug Commands

```bash
# Check if image domains are configured
grep -A 20 "remotePatterns" next.config.ts

# Test image URL accessibility
curl -I "https://drive.google.com/uc?export=view&id=YOUR_FILE_ID"

# Verify Next.js configuration
yarn build
```

## Best Practices

1. **Use Next.js Image component** for optimized loading
2. **Specify width and height** for better performance
3. **Add alt text** for accessibility
4. **Use appropriate image formats** (WebP, AVIF when possible)
5. **Optimize image sizes** before uploading to external services

## Performance Optimization

- Next.js automatically optimizes images from configured domains
- Images are served in modern formats (WebP, AVIF) when supported
- Lazy loading is enabled by default
- Responsive images are generated automatically

## Future Considerations

- **CDN Integration**: Consider using a CDN for better performance
- **Image Optimization**: Implement custom image optimization pipeline
- **Caching**: Set up proper caching headers for external images
- **Monitoring**: Add image loading performance monitoring

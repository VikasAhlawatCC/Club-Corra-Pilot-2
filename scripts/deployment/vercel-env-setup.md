# Vercel Environment Variables Setup for HTTPS Backend

## Overview
After running the deployment script, you need to update your Vercel admin app environment variables to use the new HTTPS backend.

## Required Environment Variables

### Production Environment
```bash
# API Base URL (HTTPS)
NEXT_PUBLIC_API_BASE_URL=https://16.170.179.71.nip.io/api/v1

# WebSocket URL (WSS)
NEXT_PUBLIC_WS_URL=wss://16.170.179.71.nip.io

# CDN URL (if using CloudFront)
NEXT_PUBLIC_CDN_URL=https://d3apij49dzeclm.cloudfront.net
```

### Preview/Development Environment
```bash
# API Base URL (HTTPS)
NEXT_PUBLIC_API_BASE_URL=https://16.170.179.71.nip.io/api/v1

# WebSocket URL (WSS)
NEXT_PUBLIC_WS_URL=wss://16.170.179.71.nip.io

# CDN URL (if using CloudFront)
NEXT_PUBLIC_CDN_URL=https://d3apij49dzeclm.cloudfront.net
```

## How to Update in Vercel

### Option 1: Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `club-corra-pilot-admin` project
3. Go to **Settings** → **Environment Variables**
4. Update or add the variables above
5. Redeploy your application

### Option 2: Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Set environment variables
vercel env add NEXT_PUBLIC_API_BASE_URL production
vercel env add NEXT_PUBLIC_WS_URL production
vercel env add NEXT_PUBLIC_CDN_URL production

# Set for preview environment too
vercel env add NEXT_PUBLIC_API_BASE_URL preview
vercel env add NEXT_PUBLIC_WS_URL preview
vercel env add NEXT_PUBLIC_CDN_URL preview
```

## Verification Steps

### 1. Test API Endpoint
```bash
curl -k https://16.170.179.71.nip.io/api/v1/health
```
Expected response: `healthy`

### 2. Test WebSocket Connection
```bash
# In browser console or using a WebSocket testing tool
const ws = new WebSocket('wss://16.170.179.71.nip.io');
ws.onopen = () => console.log('WebSocket connected!');
ws.onmessage = (event) => console.log('Message:', event.data);
```

### 3. Test from Vercel Admin App
1. Deploy your updated admin app
2. Navigate to a page that makes API calls
3. Check browser network tab for successful HTTPS requests
4. Check browser console for any CORS or connection errors

## Troubleshooting

### Common Issues

#### 1. CORS Errors
If you see CORS errors, ensure your backend has the correct CORS configuration:
```typescript
// In your NestJS main.ts
app.enableCors({
  origin: [
    'https://club-corra-pilot-admin.vercel.app',
    'https://club-corra-pilot-admin-git-master-vikas-ahlawats-projects.vercel.app',
    'https://club-corra-pilot-admin-d8hqxkw2x-vikas-ahlawats-projects.vercel.app',
    'https://*.vercel.app',
    'https://admin.clubcorra.com',
    'https://clubcorra.com',
    'https://*.clubcorra.com'
  ],
  credentials: true
});
```

#### 2. SSL Certificate Issues
If you see SSL certificate errors:
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate if needed
sudo certbot renew

# Check nginx configuration
sudo nginx -t
sudo systemctl reload nginx
```

#### 3. Backend Not Responding
```bash
# Check backend service status
sudo systemctl status club-corra-api

# Check backend logs
sudo journalctl -u club-corra-api -f

# Check nginx status
sudo systemctl status nginx

# Check nginx logs
sudo journalctl -u nginx -f
```

## Security Notes

1. **HTTPS Only**: Your backend now only accepts HTTPS connections
2. **HTTP Redirect**: All HTTP requests are automatically redirected to HTTPS
3. **SSL Renewal**: Certificates auto-renew every 60 days
4. **Security Headers**: Nginx adds security headers automatically

## Next Steps

1. ✅ Update Vercel environment variables
2. ✅ Redeploy your admin app
3. ✅ Test API endpoints
4. ✅ Test WebSocket connections
5. ✅ Monitor for any errors
6. ✅ Update any hardcoded HTTP URLs in your code

## Support

If you encounter issues:
1. Check the deployment logs: `sudo journalctl -u club-corra-api -f`
2. Check nginx logs: `sudo journalctl -u nginx -f`
3. Verify SSL certificate: `sudo certbot certificates`
4. Test backend directly: `curl http://localhost:8080/api/v1/health`

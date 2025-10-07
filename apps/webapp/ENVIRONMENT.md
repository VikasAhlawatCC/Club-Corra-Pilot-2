# Webapp Environment Configuration

This document describes the environment variables required for the Club Corra webapp.

## Environment Files

- `env.template` - Template file with all available environment variables
- `.env.local` - Local development environment (create from template)
- `.env.production` - Production environment variables (for deployment)

## Required Environment Variables

### API Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL for the API backend | `http://localhost:3001/api/v1` | Yes |
| `NEXT_PUBLIC_API_TIMEOUT` | API request timeout in milliseconds | `10000` | No |

### App Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_APP_NAME` | Application name displayed in UI | `Club Corra` | No |
| `NEXT_PUBLIC_APP_VERSION` | Application version | `1.0.0` | No |
| `NODE_ENV` | Node.js environment | `development` | Yes |

### Optional: Analytics and Monitoring

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for error tracking | - | No |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | Google Analytics tracking ID | - | No |

### Optional: Feature Flags

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics tracking | `false` | No |
| `NEXT_PUBLIC_ENABLE_DEBUG_MODE` | Enable debug mode for development | `true` | No |

## Setup Instructions

### Development Environment

1. Copy the template file:
   ```bash
   cp env.template .env.local
   ```

2. Update the values in `.env.local` as needed for your local development setup.

3. Ensure the API backend is running on the configured port (default: 3001).

### Production Environment

1. Set up environment variables in your deployment platform (Vercel, etc.)
2. Use the production API URL instead of localhost
3. Set `NODE_ENV=production`
4. Configure monitoring and analytics as needed

## Environment-Specific Configurations

### Development
- API URL: `http://localhost:3001/api/v1`
- Debug mode: Enabled
- Analytics: Disabled

### Staging
- API URL: `https://staging-api.clubcorra.com/api/v1`
- Debug mode: Disabled
- Analytics: Optional

### Production
- API URL: `https://api.clubcorra.com/api/v1`
- Debug mode: Disabled
- Analytics: Enabled (if configured)

## Security Notes

- All environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Never put sensitive information (API keys, secrets) in `NEXT_PUBLIC_` variables
- Use server-side environment variables for sensitive data
- The `.env.local` file should be added to `.gitignore` and never committed

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check if `NEXT_PUBLIC_API_BASE_URL` is correct
   - Ensure the backend API is running
   - Verify the API endpoint is accessible

2. **Environment Variables Not Loading**
   - Restart the development server after changing environment variables
   - Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access
   - Check for typos in variable names

3. **Build Failures**
   - Ensure all required environment variables are set
   - Check that production environment variables are configured in deployment platform

### Debug Commands

```bash
# Check environment variables
echo $NEXT_PUBLIC_API_BASE_URL

# Test API connectivity
curl $NEXT_PUBLIC_API_BASE_URL/health

# Verify Next.js environment loading
yarn dev --verbose
```

## Integration with Backend

The webapp is designed to work with the Club Corra API backend. Ensure the following:

1. **API Endpoints**: The backend should provide the expected API endpoints
2. **CORS Configuration**: Backend should allow requests from the webapp domain
3. **Authentication**: If authentication is required, ensure proper JWT handling
4. **Data Format**: API responses should match the expected data structure

## Future Considerations

- **Authentication**: Add JWT token management
- **Caching**: Implement API response caching
- **Error Handling**: Add comprehensive error handling for API failures
- **Monitoring**: Integrate with monitoring services for production
- **Feature Flags**: Implement dynamic feature flag system

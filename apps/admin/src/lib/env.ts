// Centralized environment-aware URLs for Admin app

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  if (envUrl) return envUrl
  return 'http://localhost:3001/api/v1'
}

export function getWebSocketUrl(): string {
  const envWs = process.env.NEXT_PUBLIC_WS_URL
  if (envWs) return envWs

  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  if (apiUrl) {
    const isHttps = apiUrl.startsWith('https://')
    const domain = apiUrl.replace(/^https?:\/\//, '').replace(/\/api\/v1.*$/, '')
    return `${isHttps ? 'wss' : 'ws'}://${domain}`
  }

  return 'ws://localhost:3001'
}



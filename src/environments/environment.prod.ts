export const environment = {
  production: true,
  api: {
    baseUrl: 'https://api.produck.com/api',
    timeout: 30000,
    retryAttempts: 2
  },
  auth: {
    tokenKey: 'produck_access_token',
    refreshTokenKey: 'produck_refresh_token',
    userKey: 'produck_user',
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
    refreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
  },
  features: {
    enableAnalytics: true,
    enableNotifications: true,
    enableRealTimeUpdates: true,
    maxFileUploadSize: 10 * 1024 * 1024, // 10MB
    supportedFileTypes: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg'],
  },
  ui: {
    defaultPageSize: 25,
    maxPageSize: 100,
    debounceTime: 300,
    animationDuration: 200,
  },
  logging: {
    level: 'error',
    enableConsoleLogging: false,
    enableRemoteLogging: true,
  }
};
# CORS and API Configuration Fix

## Issues Identified

### 1. CORS Policy Error
- **Problem**: Frontend (http://localhost:4200) is blocked from accessing API (https://localhost:7130)
- **Cause**: No 'Access-Control-Allow-Origin' header from API server
- **Solution**: Implemented Angular proxy configuration for development

### 2. Wrong API Version
- **Problem**: Frontend used `/v1.0/` but backend uses `/v1/`
- **Cause**: Services configured for v1.0 but actual API uses v1
- **Solution**: Updated all services to use `/v1/` endpoints

### 3. Backend API Structure Confirmed
- **Backend URL**: `https://localhost:7130/api/v1/Leads`
- **Frontend calls**: `http://localhost:4200/api/v1/leads` (proxied)
- **Result**: Correct endpoint matching

## Fixes Applied

### 1. Environment Configuration Updated
```typescript
// Before: 'https://localhost:7130/api/v1'
// After:  '/api' (uses proxy in development)
```

### 2. Proxy Configuration Created
```json
// proxy.conf.json
{
  "/api/*": {
    "target": "https://localhost:7130",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

### 3. Angular.json Updated
```json
"development": {
  "buildTarget": "produck-frontend:build:development",
  "proxyConfig": "proxy.conf.json"
}
```

## How to Run

### Development Mode (with proxy)
```bash
npm start
# or
ng serve
```

This will:
- Start frontend on http://localhost:4200
- Proxy `/api/*` requests to https://localhost:7130
- Avoid CORS issues

### Production Mode
The production environment uses direct API URLs:
```typescript
baseUrl: 'https://api.produck.com/api'
```

## API URL Structure

### Development URLs (proxied)
- Frontend: http://localhost:4200
- API calls: http://localhost:4200/api/v1.0/leads (proxied to https://localhost:7130)

### Production URLs (direct)
- Frontend: https://app.produck.com
- API calls: https://api.produck.com/api/v1.0/leads

## Backend CORS Configuration

For production, the backend API should be configured with CORS headers:

```csharp
// In Startup.cs or Program.cs
services.AddCors(options =>
{
    options.AddPolicy("ProduckCorsPolicy", builder =>
    {
        builder
            .WithOrigins("https://app.produck.com", "http://localhost:4200")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

app.UseCors("ProduckCorsPolicy");
```

## Testing

1. **Start the backend API** at https://localhost:7130
2. **Start the frontend** with `npm start`
3. **Check Network tab** in browser dev tools
4. **Verify URLs** show http://localhost:4200/api/v1.0/* (not the direct HTTPS URLs)

## Troubleshooting

### If CORS errors persist:
1. Ensure backend API is running on https://localhost:7130
2. Check proxy.conf.json is correctly configured
3. Restart `ng serve` after proxy changes
4. Clear browser cache

### If URLs are wrong:
1. Check environment.ts has `baseUrl: '/api'`
2. Check services use `/v1.0/` prefix correctly
3. Verify no double slashes in concatenated URLs

### For HTTPS certificate issues:
Add to proxy.conf.json:
```json
{
  "/api/*": {
    "target": "https://localhost:7130",
    "secure": false,  // This bypasses SSL certificate validation
    "changeOrigin": true
  }
}
```
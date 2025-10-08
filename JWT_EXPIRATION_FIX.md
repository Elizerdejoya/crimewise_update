# JWT Expiration Redirect Fix

## Problem
When JWT tokens expired, users were not being automatically redirected to the login page. Instead, they would see authentication error toasts but remain on the current page, leading to a poor user experience.

## Solution
Implemented a comprehensive JWT expiration handling system that automatically redirects users to the login page when their token expires.

## Changes Made

### 1. Created Authentication Utility (`frontend/src/lib/auth.ts`)
- **`getCurrentUser()`**: Safely extracts user data from JWT token
- **`isTokenExpired()`**: Checks if the current token has expired
- **`getAuthHeaders()`**: Creates authentication headers for API requests
- **`clearAuthAndRedirect()`**: Clears token and redirects to login page
- **`authenticatedFetch()`**: Enhanced fetch wrapper that handles authentication errors globally

### 2. Updated ProtectedRoute Component (`frontend/src/components/ProtectedRoute.tsx`)
- Added token expiration check before rendering protected content
- Automatically redirects to login if token is expired
- Uses the new authentication utilities

### 3. Updated DashboardLayout Component (`frontend/src/components/layout/DashboardLayout.tsx`)
- Added token expiration check on component mount
- Automatically redirects to login if token is expired
- Updated logout function to use the new auth utility

### 4. Updated Key Pages to Use New Authentication Pattern
- **Admin Dashboard** (`frontend/src/pages/admin/Dashboard.tsx`)
- **Student Dashboard** (`frontend/src/pages/student/Dashboard.tsx`)
- **Student EnterExam** (`frontend/src/pages/student/EnterExam.tsx`)

## How It Works

### Token Expiration Detection
1. **Client-side check**: Before making API requests, the system checks if the token is expired
2. **Server response handling**: When a 401 response is received, the system immediately redirects to login
3. **Route protection**: Protected routes check token expiration before rendering

### Automatic Redirect Flow
1. User's token expires (either detected client-side or via 401 response)
2. `clearAuthAndRedirect()` is called
3. Token is removed from localStorage
4. User is redirected to `/login` using `window.location.href`
5. Full page reload ensures clean state

### Enhanced API Calls
The new `authenticatedFetch()` function:
- Checks token expiration before making requests
- Automatically adds authentication headers
- Handles 401 responses by redirecting to login
- Throws appropriate errors for other HTTP status codes

## Benefits

1. **Seamless User Experience**: Users are automatically redirected when their session expires
2. **Consistent Behavior**: All API calls now handle authentication errors uniformly
3. **Reduced Code Duplication**: Centralized authentication logic
4. **Better Security**: Expired tokens are immediately cleared and users are forced to re-authenticate
5. **Proactive Detection**: Token expiration is checked before making API calls, reducing unnecessary requests

## Usage

### For New API Calls
```typescript
import { authenticatedFetch } from "@/lib/auth";

// Instead of regular fetch
const response = await authenticatedFetch(`${API_BASE_URL}/api/endpoint`);
```

### For Manual Token Checks
```typescript
import { isTokenExpired, clearAuthAndRedirect } from "@/lib/auth";

if (isTokenExpired()) {
  clearAuthAndRedirect();
}
```

## Migration Guide

To update existing pages to use the new authentication system:

1. **Replace imports**:
   ```typescript
   // Old
   const getAuthHeaders = () => { /* ... */ };
   
   // New
   import { authenticatedFetch } from "@/lib/auth";
   ```

2. **Update fetch calls**:
   ```typescript
   // Old
   fetch(url, { headers: getAuthHeaders() })
     .then(res => {
       if (res.status === 401) {
         // Handle auth error
       }
       return res.json();
     });
   
   // New
   authenticatedFetch(url)
     .then(res => res.json());
   ```

3. **Remove manual 401 handling**: The `authenticatedFetch` function handles this automatically.

## Files Modified

- `frontend/src/lib/auth.ts` (new)
- `frontend/src/components/ProtectedRoute.tsx`
- `frontend/src/components/layout/DashboardLayout.tsx`
- `frontend/src/pages/admin/Dashboard.tsx`
- `frontend/src/pages/student/Dashboard.tsx`
- `frontend/src/pages/student/EnterExam.tsx`

## Testing

To test the JWT expiration fix:

1. **Login to the application**
2. **Wait for token to expire** (tokens expire after 1 hour)
3. **Try to navigate or perform any action**
4. **Verify automatic redirect to login page**

Alternatively, you can manually expire the token by:
1. Opening browser dev tools
2. Going to Application/Storage tab
3. Finding the JWT token in localStorage
4. Modifying the `exp` field to a past timestamp
5. Refreshing the page or performing any action

The system should automatically redirect to the login page.

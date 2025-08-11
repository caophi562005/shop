# Authentication Cookie Bug Fix

## 🐛 **Bug mô tả:**

- User lần đầu truy cập website (chưa có cookies)
- App sẽ loading vô hạn khi gọi API `/profile` để check auth
- Không có logic để dừng loading khi không có auth cookies

## ✅ **Solution:**

### 1. Tạo Cookie Utilities (`utils/cookies.ts`):

```typescript
// Check if auth cookies exist
export const hasAuthCookies = (): boolean => {
  const accessToken = getCookie("accessToken");
  const refreshToken = getCookie("refreshToken");
  return !!(accessToken && refreshToken);
};

// Clear auth cookies
export const clearAuthCookies = (): void => {
  // Clear cookies for current domain and subdomains
};
```

### 2. Update AuthStore Logic:

```typescript
checkAuthStatus: async () => {
  // ✅ Check cookies BEFORE making API call
  if (!hasAuthCookies()) {
    set({
      isLoggedIn: false,
      user: null,
      isLoading: false,
      isInitialized: true, // ⭐ Key: Set initialized = true
    });
    return; // ⭐ Key: Return early, no API call
  }

  // Only call API if cookies exist
  try {
    const response = await http.get("/profile");
    // ... success logic
  } catch (error) {
    // ✅ Clear invalid cookies on error
    clearAuthCookies();
    // ... error logic
  }
};
```

### 3. Enhanced Error Handling:

- Clear cookies when API returns 401
- Auto reset auth state on auth errors
- Listen for auth logout events from HTTP interceptor

### 4. Debug Component (Development only):

- `AuthDebugger.tsx`: Shows auth state, cookie status
- Manual controls to test auth logic
- Only visible in development mode

## 🎯 **Flow mới:**

### First-time user (no cookies):

1. `checkAuthStatus()` called on app start
2. `hasAuthCookies()` returns `false`
3. Set `isInitialized = true, isLoggedIn = false`
4. **No API call made** → No infinite loading ✅
5. User sees login/register options

### Returning user (has cookies):

1. `checkAuthStatus()` called on app start
2. `hasAuthCookies()` returns `true`
3. Call `/profile` API
4. Success → Set user data
5. Error → Clear cookies, set logged out

### Invalid/expired cookies:

1. API call returns 401
2. HTTP interceptor triggers `auth:logout` event
3. App.tsx listens and calls `resetAuthState()`
4. Cookies cleared, user logged out

## 🧪 **Testing:**

1. **New user**: Open in incognito → Should show login immediately
2. **Expired cookies**: Manually edit cookies → Should clear and logout
3. **Valid cookies**: Normal login → Should maintain auth state
4. **Network error**: Disconnect internet → Should handle gracefully

## 📝 **Files changed:**

- `src/utils/cookies.ts` - New utility functions
- `src/stores/authStore.tsx` - Enhanced auth logic
- `src/App.tsx` - Auth event listener
- `src/components/AuthDebugger.tsx` - Debug component

## 🚀 **Result:**

- ✅ No more infinite loading for new users
- ✅ Fast auth check using cookies
- ✅ Proper cleanup of invalid sessions
- ✅ Better error handling and debugging
- ✅ Improved user experience

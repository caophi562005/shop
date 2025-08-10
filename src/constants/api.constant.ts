// API endpoints configuration for language query parameter exclusion

/**
 * List of API endpoints that should NOT include lang query parameter
 * These are typically:
 * - Authentication APIs
 * - Admin management APIs
 * - File upload/media APIs
 * - System/health APIs
 * - User-specific operations (cart, orders)
 * - Payment/transaction APIs
 */
export const EXCLUDE_LANG_ENDPOINTS = [
  // Authentication & User Management
  "/auth/login",
  "/auth/register",
  "/auth/logout",
  "/auth/refresh-token",
  "/auth/verify-email",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/change-password",

  // Admin Management APIs
  "/manage-product/products",
  "/manage-products",
  "/manage-users",
  "/manage-categories",
  "/manage-orders",
  "/admin/users",
  "/admin/products",
  "/admin/categories",
  "/admin/orders",
  "/admin/analytics",
  "/admin/reports",

  // User Management
  "/users",
  "/users/profile",
  "/users/settings",
  "/users/preferences",

  // File Upload/Media
  "/upload",
  "/media",
  "/files",
  "/images",
  "/documents",

  // System/Health APIs
  "/health",
  "/status",
  "/ping",
  "/version",

  // Analytics/Reports (typically no translation needed)
  "/analytics",
  "/reports",
  "/statistics",
  "/revenue",
  "/metrics",
  "/dashboard/stats",

  // Order Management (backend operations)
  "/orders/manage",
  "/orders/admin",
  "/orders/status",
  "/orders/tracking",

  // Cart Operations (user-specific, no translation)
  "/cart/add",
  "/cart/remove",
  "/cart/update",
  "/cart/clear",
  "/cart/items",

  // Payment APIs
  "/payment",
  "/payments",
  "/checkout",
  "/transactions",
  "/billing",
  "/invoices",

  // WebSocket/Real-time APIs
  "/socket",
  "/ws",
  "/notifications",
  "/chat/send",
  "/chat/history",

  // Search/Filter APIs (may not need translation)
  "/search/suggestions",
  "/filters",
  "/autocomplete",

  // Settings/Configuration
  "/settings",
  "/config",
  "/preferences",
];

/**
 * Helper function to check if a URL should exclude lang parameter
 * @param url - The API endpoint URL to check
 * @returns boolean - true if lang parameter should be excluded
 */
export const shouldExcludeLang = (url: string): boolean => {
  if (!url) return false;

  return EXCLUDE_LANG_ENDPOINTS.some((endpoint) => {
    // Support both exact match and pattern matching
    if (endpoint.includes("*")) {
      const pattern = endpoint.replace("*", ".*");
      return new RegExp(pattern).test(url);
    }
    return url.includes(endpoint);
  });
};

/**
 * Add a new endpoint to the exclude list (for dynamic configuration)
 * @param endpoint - The endpoint to add to exclude list
 */
export const addExcludeEndpoint = (endpoint: string): void => {
  if (!EXCLUDE_LANG_ENDPOINTS.includes(endpoint)) {
    EXCLUDE_LANG_ENDPOINTS.push(endpoint);
  }
};

/**
 * Remove an endpoint from the exclude list
 * @param endpoint - The endpoint to remove from exclude list
 */
export const removeExcludeEndpoint = (endpoint: string): void => {
  const index = EXCLUDE_LANG_ENDPOINTS.indexOf(endpoint);
  if (index > -1) {
    EXCLUDE_LANG_ENDPOINTS.splice(index, 1);
  }
};

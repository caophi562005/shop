// src/api/authApi.ts

/**
 * API riêng để check authentication status
 * Sử dụng lightweight endpoint thay vì /profile
 */

import http from "./http";

export interface AuthCheckResponse {
  isAuthenticated: boolean;
  userId?: string;
  message?: string;
}

/**
 * Check auth status với endpoint nhẹ hơn
 */
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    // Sử dụng HEAD request hoặc lightweight endpoint
    const response = await http.head("/auth/check");
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

/**
 * Alternative: Sử dụng endpoint GET nhẹ hơn
 */
export const checkAuthStatusLite = async (): Promise<AuthCheckResponse> => {
  try {
    const response = await http.get<AuthCheckResponse>("/auth/check");
    return response.data;
  } catch (error) {
    return { isAuthenticated: false, message: "Auth check failed" };
  }
};

/**
 * Kiểm tra auth bằng fetch (bypass interceptors)
 */
export const checkAuthByFetch = async (): Promise<boolean> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_END_POINT}/auth/check`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.ok;
  } catch (error) {
    return false;
  }
};

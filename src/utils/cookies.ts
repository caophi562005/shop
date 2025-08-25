// src/utils/cookies.ts

import http from "../api/http";

/**
 * Get cookie value by name
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  // Method 1: Standard approach
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift();
    if (cookieValue && cookieValue.trim() !== "") {
      return cookieValue;
    }
  }

  // Method 2: Fallback với regex để chắc chắn
  const regex = new RegExp(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`);
  const match = document.cookie.match(regex);

  if (match && match[2] && match[2].trim() !== "") {
    return match[2];
  }

  return null;
};

/**
 * Check if authentication cookies exist
 * Vì server set cookies với httpOnly=true, ta không thể đọc bằng JS
 * Function này chỉ để backward compatibility
 */
export const hasAuthCookies = (): boolean => {
  // Fallback: thử đọc client-side cookies
  const accessToken = getCookie("accessToken");
  const refreshToken = getCookie("refreshToken");

  // Debug logging
  if (process.env.NODE_ENV === "development") {
    console.log("hasAuthCookies debug:", {
      documentCookie: document.cookie || "No client-side cookies",
      accessToken: accessToken ? "exists" : "missing (httpOnly)",
      refreshToken: refreshToken ? "exists" : "missing (httpOnly)",
      note: "Use hasAuthCookiesAsync() for reliable check with httpOnly cookies",
    });
  }

  return !!(accessToken && refreshToken);
};

/**
 * Check auth cookies thông qua API /profile (recommended method)
 * Đây là cách duy nhất reliable với httpOnly cookies
 */
export const hasAuthCookiesAsync = async (): Promise<boolean> => {
  try {
    const response = await http.get("/profile");
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    return false;
  }
};

/**
 * Clear all authentication related cookies
 */
export const clearAuthCookies = (): void => {
  if (typeof document === "undefined") return;

  const cookiesToClear = ["accessToken", "refreshToken"];

  cookiesToClear.forEach((cookieName) => {
    // Clear for current domain
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

    // Clear for all subdomains if any
    const domain = window.location.hostname;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`;
  });
};

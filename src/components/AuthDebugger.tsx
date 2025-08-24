// src/components/AuthDebugger.tsx

import React, { useState, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { hasAuthCookies, getCookie, clearAuthCookies } from "../utils/cookies";

const AuthDebugger: React.FC = () => {
  const {
    isLoggedIn,
    user,
    isLoading,
    isInitialized,
    resetAuthState,
    checkAuthCookiesAsync,
  } = useAuthStore();

  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem("authDebugger") === "true";
  });

  const [apiAuthStatus, setApiAuthStatus] = useState<boolean | null>(null);

  useEffect(() => {
    localStorage.setItem("authDebugger", isVisible.toString());
  }, [isVisible]);

  // Check API auth status
  useEffect(() => {
    const checkApi = async () => {
      const status = await checkAuthCookiesAsync();
      setApiAuthStatus(status);
    };

    checkApi();

    // Check mỗi 10 giây
    const interval = setInterval(checkApi, 10000);
    return () => clearInterval(interval);
  }, [checkAuthCookiesAsync]); // Keyboard shortcut: Ctrl + Shift + D để toggle
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setIsVisible((prev) => !prev);
        console.log(
          `Auth Debugger ${
            !isVisible ? "shown" : "hidden"
          } via keyboard shortcut`
        );
      }
    };

    if (process.env.NODE_ENV === "development") {
      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }
  }, [isVisible]);

  const checkCookies = () => {
    const accessToken = getCookie("accessToken");
    const refreshToken = getCookie("refreshToken");
    const hasAuth = hasAuthCookies();

    console.log("=== MANUAL COOKIE CHECK ===");
    console.log("Document.cookie:", document.cookie);
    console.log(
      "All cookies found:",
      document.cookie.split(";").map((c) => c.trim())
    );
    console.log(
      "Access Token:",
      accessToken ? `Found: ${accessToken.substring(0, 50)}...` : "NOT FOUND"
    );
    console.log(
      "Refresh Token:",
      refreshToken ? `Found: ${refreshToken.substring(0, 50)}...` : "NOT FOUND"
    );
    console.log("hasAuthCookies():", hasAuth);

    // Test với tất cả possible cookie names
    const possibleNames = [
      "accessToken",
      "access_token",
      "token",
      "authToken",
      "refreshToken",
      "refresh_token",
    ];
    console.log("Testing all possible cookie names:");
    possibleNames.forEach((name) => {
      const value = getCookie(name);
      if (value) {
        console.log(`  ${name}: Found`);
      }
    });

    console.log("AuthStore isLoggedIn:", isLoggedIn);
    console.log("========================");
  };

  const forceResetAuth = () => {
    resetAuthState();
    console.log("Auth state reset manually");
  };

  const forceClearCookies = () => {
    clearAuthCookies();
    console.log("Cookies cleared manually");
  };

  const testApiCall = async () => {
    try {
      console.log("Testing API call to /profile...");
      const response = await fetch(
        `${import.meta.env.VITE_API_END_POINT}/profile`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Profile data:", data);
      } else {
        console.log("API call failed:", response.statusText);
      }
    } catch (error) {
      console.error("API call error:", error);
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  // Ẩn hoàn toàn nếu isVisible = false
  if (!isVisible) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        right: "10px",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "12px",
        zIndex: 9999,
        maxWidth: "300px",
      }}
    >
      <div>
        <strong>Auth Debug (Ctrl+Shift+D to hide)</strong>
      </div>
      <div>Logged In: {isLoggedIn ? "Yes" : "No"}</div>
      <div>User: {user?.name || "None"}</div>
      <div>Loading: {isLoading ? "Yes" : "No"}</div>
      <div>Initialized: {isInitialized ? "Yes" : "No"}</div>
      <div>Has Cookies (JS): {hasAuthCookies() ? "Yes" : "No (httpOnly)"}</div>
      <div>
        Has Cookies (API):{" "}
        {apiAuthStatus === null ? "Checking..." : apiAuthStatus ? "Yes" : "No"}
      </div>

      <div style={{ marginTop: "10px" }}>
        <button
          onClick={checkCookies}
          style={{ margin: "2px", fontSize: "10px" }}
        >
          Check Cookies
        </button>
        <button
          onClick={forceResetAuth}
          style={{ margin: "2px", fontSize: "10px" }}
        >
          Reset Auth
        </button>
        <button
          onClick={forceClearCookies}
          style={{ margin: "2px", fontSize: "10px" }}
        >
          Clear Cookies
        </button>
        <button
          onClick={testApiCall}
          style={{ margin: "2px", fontSize: "10px" }}
        >
          Test API
        </button>
      </div>
    </div>
  );
};

export default AuthDebugger;

// src/components/CookieDebugger.tsx
import React, { useState, useEffect } from "react";
import { getCookie, hasAuthCookies } from "../utils/cookies";

const CookieDebugger: React.FC = () => {
  const [cookieInfo, setCookieInfo] = useState({
    allCookies: "",
    accessToken: "",
    refreshToken: "",
    hasAuth: false,
  });

  const updateCookieInfo = () => {
    const accessToken = getCookie("accessToken");
    const refreshToken = getCookie("refreshToken");
    const hasAuth = hasAuthCookies();

    setCookieInfo({
      allCookies: document.cookie,
      accessToken: accessToken || "Not found",
      refreshToken: refreshToken || "Not found",
      hasAuth,
    });
  };

  useEffect(() => {
    updateCookieInfo();

    // Update mỗi 500ms
    const interval = setInterval(updateCookieInfo, 500);
    return () => clearInterval(interval);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "rgba(255,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "11px",
        zIndex: 10000,
        maxWidth: "400px",
        maxHeight: "300px",
        overflow: "auto",
      }}
    >
      <div>
        <strong>Cookie Debugger</strong>
      </div>
      <div>Has Auth: {cookieInfo.hasAuth ? "YES" : "NO"}</div>
      <div>Access Token: {cookieInfo.accessToken.substring(0, 50)}...</div>
      <div>Refresh Token: {cookieInfo.refreshToken.substring(0, 50)}...</div>
      <div style={{ marginTop: "5px", fontSize: "10px" }}>
        <strong>All Cookies:</strong>
        <div
          style={{
            maxHeight: "100px",
            overflow: "auto",
            wordBreak: "break-all",
          }}
        >
          {cookieInfo.allCookies || "No cookies"}
        </div>
      </div>
      <button
        onClick={updateCookieInfo}
        style={{ margin: "5px 0", fontSize: "10px", padding: "2px 5px" }}
      >
        Refresh
      </button>
    </div>
  );
};

export default CookieDebugger;

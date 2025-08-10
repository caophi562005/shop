import axios, { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";
import envConfig from "../envConfig";
import { toast } from "react-toastify";
import { languageUtils } from "../utils/language";

axios.defaults.withCredentials = true;

interface ErrorResponse {
  message?: string | Array<{ message: string; path: string }>;
  error?: string;
  statusCode?: number;
}

interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const http = axios.create({
  baseURL: envConfig.VITE_API_END_POINT,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 30000,
});

let refreshTokenRequest: Promise<unknown> | null = null;

async function refreshAccessToken(): Promise<unknown> {
  if (!refreshTokenRequest) {
    refreshTokenRequest = http.post("/auth/refresh-token").finally(() => {
      refreshTokenRequest = null;
    });
  }
  return refreshTokenRequest;
}

// Add request interceptor to add lang query parameter
http.interceptors.request.use(
  (config) => {
    const currentLang = languageUtils.getCurrentLanguage();

    // Add lang query parameter to all requests
    if (!config.params) {
      config.params = {};
    }
    config.params.lang = currentLang;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await refreshAccessToken();
        return http(originalRequest);
      } catch {
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
    }

    handleErrorDisplay(error);
    return Promise.reject(error);
  }
);

function handleErrorDisplay(error: AxiosError<ErrorResponse>): void {
  if (!error.response?.data) {
    if (error.code === "ECONNABORTED") {
      toast.error("Yêu cầu bị timeout. Vui lòng thử lại.");
    } else if (error.message.includes("Network Error")) {
      toast.error("Lỗi kết nối mạng. Vui lòng kiểm tra internet.");
    } else {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
    }
    return;
  }

  const errorData = error.response.data;
  const { message, statusCode } = errorData;

  if (statusCode === 401) {
    return;
  }

  if (Array.isArray(message) && message.length > 0) {
    const firstError = message[0];
    toast.error(`${firstError.message} | ${firstError.path}`);
  } else if (typeof message === "string") {
    toast.error(message);
  } else {
    const statusText = error.response.statusText || "Unknown Error";
    toast.error(`Lỗi ${statusCode}: ${statusText}`);
  }
}

export const authUtils = {
  refreshAccessToken,
};

export default http;

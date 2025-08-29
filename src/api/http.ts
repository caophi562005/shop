import axios, { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";
import envConfig from "../envConfig";
import { toast } from "react-toastify";
import { languageUtils } from "../utils/language";
import { shouldExcludeLang } from "../constants/api.constant";

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

    // Check if this endpoint should exclude lang parameter
    const shouldExclude = shouldExcludeLang(config.url || "");

    // Only add lang query parameter if not in exclude list
    if (!shouldExclude) {
      if (!config.params) {
        config.params = {};
      }
      config.params.lang = currentLang;
    }

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

    // Không retry nếu đang gọi refresh-token endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh-token")
    ) {
      originalRequest._retry = true;
      try {
        await refreshAccessToken();
        return http(originalRequest);
      } catch (refreshError) {
        console.log("Refresh token failed:", refreshError);
        // Trigger event để xử lý refresh token failure
        window.dispatchEvent(new CustomEvent("auth:refresh-failed"));
      }
    }

    // Nếu là refresh-token endpoint bị 401, trigger auth failure ngay
    if (
      error.response?.status === 401 &&
      originalRequest.url?.includes("/auth/refresh-token")
    ) {
      console.log("Refresh token endpoint returned 401");
      window.dispatchEvent(new CustomEvent("auth:refresh-failed"));
      return Promise.reject(error); // Không hiển thị toast cho refresh token error
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

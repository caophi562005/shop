// src/stores/authStore.ts
import { toast } from "react-toastify";
import { create } from "zustand";
import http from "../api/http";
import type { GetUserProfileResType } from "../models/shared/shared-user.model";
import { clearAuthCookies } from "../utils/cookies";

// Định nghĩa kiểu cho state và actions
interface AuthState {
  isLoggedIn: boolean;
  user: GetUserProfileResType | null;
  isLoading: boolean;
  isInitialized: boolean;
  setLoading: (loading: boolean) => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  resetAuthState: () => void;
  handleRefreshTokenFailure: () => void;
  checkAuthCookiesAsync: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  user: null,
  isLoading: false,
  isInitialized: false,

  setLoading: (loading) => set({ isLoading: loading }),

  login: async () => {
    try {
      set({ isLoading: true });
      const response = await http.get("/profile");
      set({
        isLoggedIn: true,
        user: response.data,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.error("Login error:", error);
      set({
        isLoggedIn: false,
        user: null,
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await http.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthCookies();
      set({
        isLoggedIn: false,
        user: null,
        isLoading: false,
        isInitialized: true,
      });
      toast.success("Đăng xuất thành công!");
    }
  },

  checkAuthStatus: async () => {
    // Nếu đã kiểm tra rồi thì không kiểm tra lại
    if (get().isInitialized) {
      console.log("Auth already initialized, skipping check");
      return;
    }

    console.log("Starting auth status check...");
    try {
      set({ isLoading: true });
      const response = await http.get<GetUserProfileResType>("/profile");
      console.log("Auth check successful, user logged in");
      set({
        isLoggedIn: true,
        user: response.data,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.log("Auth check failed - user not logged in or cookies invalid");

      set({
        isLoggedIn: false,
        user: null,
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  resetAuthState: () => {
    clearAuthCookies();
    set({
      isLoggedIn: false,
      user: null,
      isLoading: false,
      isInitialized: true,
    });
  },

  // Method để xử lý khi refresh token thất bại
  handleRefreshTokenFailure: () => {
    console.log("Refresh token failed - clearing auth state");
    console.log("Current isInitialized:", get().isInitialized);
    clearAuthCookies();
    set({
      isLoggedIn: false,
      user: null,
      isLoading: false,
      isInitialized: true, // ĐÚNG: đã hoàn thành quá trình kiểm tra auth
    });
    console.log("Auth state cleared, isInitialized set to true");
  },

  checkAuthCookiesAsync: async () => {
    try {
      const response = await fetch("/api/profile", {
        credentials: "include",
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  },
}));

// src/stores/authStore.ts
import { toast } from "react-toastify";
import { create } from "zustand";
import http from "../api/http";
import type { GetUserProfileResType } from "../models/shared/shared-user.model";

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
    if (get().isInitialized) return;

    try {
      set({ isLoading: true });
      const response = await http.get<GetUserProfileResType>("/profile");
      set({
        isLoggedIn: true,
        user: response.data,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.error("Auth check error:", error);
      set({
        isLoggedIn: false,
        user: null,
        isLoading: false,
        isInitialized: true,
      });
    }
  },
}));

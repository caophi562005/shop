// src/stores/authStore.ts
import { toast } from "react-toastify";
import { create } from "zustand";
import type { AccessTokenPayload } from "../models/jwt.type";
import http from "../api/http";

// Định nghĩa kiểu cho state và actions
interface AuthState {
  isLoggedIn: boolean;
  user: any;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  isLoading: false,

  setLoading: (loading) => set({ isLoading: loading }),
  login: async () => {
    try {
      const response = await http.get("/profile");
      set({ isLoggedIn: true, user: response.data });
    } catch (error) {
      console.error(error);
    }
  },

  logout: async () => {
    try {
      await http.post("/auth/logout");
    } catch (error) {}
    set({ isLoggedIn: false, user: null });
    toast.success("Đăng xuất thành công!");
  },

  checkAuthStatus: async () => {
    try {
      const response = await http.get<AccessTokenPayload>("/profile");
      set({ isLoggedIn: true, user: response.data });
    } catch {
      set({ isLoggedIn: false, user: null });
    }
  },
}));

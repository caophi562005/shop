// src/stores/authStore.ts
import { toast } from "react-toastify";
import { create } from "zustand";
import type { AccessTokenPayload } from "../models/jwt.type";
import type { LoginResType } from "../models/auth.model";
import { jwtDecode } from "jwt-decode";
import http from "../api/http";

// Định nghĩa kiểu cho state và actions
interface AuthState {
  isLoggedIn: boolean;
  user: AccessTokenPayload | null;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  login: (user: LoginResType) => void;
  logout: () => void;
  checkAuthStatus: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  isLoading: false,

  setLoading: (loading) => set({ isLoading: loading }),
  login: (payload) => {
    set({ isLoggedIn: true });
    const decodedToken = jwtDecode<AccessTokenPayload>(payload.accessToken);
    set({ user: decodedToken });
    toast.success("Đăng nhập thành công!");
  },

  logout: async () => {
    try {
      await http.post("/auth/logout", {
        refreshToken: localStorage.getItem("refreshToken"),
      });
    } catch (error) {
      console.log(error);
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({ isLoggedIn: false });
    toast.success("Đăng xuất thành công!");
  },

  checkAuthStatus: () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      set({ isLoggedIn: true });
    }
  },
}));

import axios from "axios";
import envConfig from "../envConfig";
import { useAuthStore } from "../stores/authStore";

const http = axios.create({
  baseURL: envConfig.VITE_API_END_POINT,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use(
  (config) => {
    useAuthStore.getState().setLoading(true);

    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    useAuthStore.getState().setLoading(false);
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  (response) => {
    useAuthStore.getState().setLoading(false);
    return response;
  },
  (error) => {
    useAuthStore.getState().setLoading(false);
    return Promise.reject(error);
  }
);

export default http;

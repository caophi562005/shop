import axios from "axios";

const http = axios.create({
  baseURL: "https://api-pixcam.hacmieu.xyz",
  headers: {
    "Content-Type": "application/json",
  },
});
http.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
export default http;

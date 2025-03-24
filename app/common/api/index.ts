import axios from "axios";
import { config } from "@/common/config";

export const API_BASE = config.apiBaseUrl;

export const instance = axios.create({
  baseURL: API_BASE,
  timeout: 60000
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

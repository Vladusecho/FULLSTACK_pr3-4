import axios from "axios";
import { refreshTokens } from "./authApi";

/**
 * Единая точка настройки axios.
 * Бэкенд слушает порт 3000: http://localhost:3000
 * Базовый префикс API: /api
 */
export const api = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 5000,
});

// Интерцептор запросов: добавляем accessToken
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор ответов: обрабатываем 401, пытаемся refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Не пытаемся refresh'ить сам запрос refresh или если уже пробовали
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes("/auth/refresh")) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const data = await refreshTokens({ refreshToken });
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);

          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Если refresh не удался, очищаем токены
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login"; // Перенаправляем на логин
          return Promise.reject(refreshError);
        }
      } else {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

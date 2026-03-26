import { api } from "./apiClient";

/**
 * Функции для аутентификации.
 */

export async function registerUser(payload) {
  const response = await api.post("api/auth/register", payload);
  return response.data;
}

export async function loginUser(payload) {
  const response = await api.post("api/auth/login", payload);
  const { accessToken, refreshToken, user } = response.data;
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  
  // Сохранить информацию о пользователе
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  return response.data;
}

export async function refreshTokens(payload) {
  const response = await api.post("api/auth/refresh", payload);
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get("api/auth/me");
  return response.data;
}
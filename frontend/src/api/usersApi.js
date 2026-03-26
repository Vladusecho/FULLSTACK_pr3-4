import { api } from "./apiClient";

/**
 * Функции для управления пользователями.
 */

export async function getUsers() {
  const response = await api.get("api/users");
  return response.data;
}

export async function getUserById(id) {
  const response = await api.get(`api/users/${id}`);
  return response.data;
}

export async function updateUser(id, payload) {
  const response = await api.put(`api/users/${id}`, payload);
  return response.data;
}

export async function blockUser(id) {
  const response = await api.delete(`api/users/${id}`);
  return response.data;
}
import { api } from "./apiClient";

/**
 * Реализация функций работы с API.
 * Используем api.get/post/put/delete и возвращаем data.
 */

export async function getProducts() {
  const response = await api.get("api/products");
  return response.data;
}

export async function getProductById(id) {
  const response = await api.get(`api/products/${id}`);
  return response.data;
}

export async function createProduct(payload) {
  const response = await api.post("api/products", payload);
  return response.data;
}

export async function updateProduct(id, payload) {
  const response = await api.put(`api/products/${id}`, payload);
  return response.data;
}

export async function deleteProduct(id) {
  const response = await api.delete(`api/products/${id}`);
  return response.data;
}
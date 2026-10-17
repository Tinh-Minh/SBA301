import axios from "axios";
import type { ApiResponse } from "@/interfaces/api";

/** axios dùng chung cho mọi lời gọi backend (Spring Boot). */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
});

// Gắn thông tin đăng nhập vào mọi request (chỉ chạy được ở trình duyệt).
// - Khi Function 1 xong JWT: lưu token ở localStorage "token" -> gửi Authorization: Bearer.
// - TẠM THỜI (chưa có JWT): gửi header X-User-Id lấy từ localStorage "userId".
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    const userId = localStorage.getItem("userId");
    if (userId) config.headers["X-User-Id"] = userId;
  }
  return config;
});

/** Lấy thông báo lỗi từ ApiResponseDTO của backend. */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error) && error.response?.data) {
    const { message, data } = error.response.data as ApiResponse<unknown>;
    if (data && typeof data === "object" && !Array.isArray(data)) {
      return `${message}: ${Object.values(data as Record<string, string>).join(", ")}`;
    }
    return message || "Có lỗi xảy ra";
  }
  return "Không thể kết nối đến server";
};

/** Gọi API và trả thẳng phần data của ApiResponseDTO. */
export const get = <T>(endpoint: string, params?: object) =>
  api.get<ApiResponse<T>>(endpoint, { params }).then((res) => res.data.data);
export const post = <T>(endpoint: string, body?: unknown) =>
  api.post<ApiResponse<T>>(endpoint, body).then((res) => res.data.data);
export const put = <T>(endpoint: string, body?: unknown) =>
  api.put<ApiResponse<T>>(endpoint, body).then((res) => res.data.data);
export const remove = <T>(endpoint: string) =>
  api.delete<ApiResponse<T>>(endpoint).then((res) => res.data.data);

export default api;

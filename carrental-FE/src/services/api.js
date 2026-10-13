import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
});

// Gắn thông tin đăng nhập vào mọi request.
// - Khi Function 1 xong JWT: lưu token ở localStorage 'token' -> gửi Authorization: Bearer.
// - TẠM THỜI (chưa có JWT): gửi header X-User-Id lấy từ localStorage 'userId'.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const userId = localStorage.getItem('userId');
  if (userId) {
    config.headers['X-User-Id'] = userId;
  }
  return config;
});

/** Lấy thông báo lỗi từ ApiResponseDTO của backend. */
export const getErrorMessage = (error) => {
  if (error.response && error.response.data) {
    const { message, data } = error.response.data;
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      return `${message}: ${Object.values(data).join(', ')}`;
    }
    return message || 'Có lỗi xảy ra';
  }
  return 'Không thể kết nối đến server';
};

export const get = (endpoint, params) => api.get(endpoint, { params });
export const post = (endpoint, data) => api.post(endpoint, data);
export const put = (endpoint, data) => api.put(endpoint, data);
export const remove = (endpoint) => api.delete(endpoint);

export default api;

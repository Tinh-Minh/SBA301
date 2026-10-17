import { get, post, put } from './api';

// Mọi API trả về ApiResponseDTO { status, message, data } -> các hàm dưới trả thẳng phần data.

export const orderService = {
  quote: (payload) => post('/orders/quote', payload).then((res) => res.data.data),
  createOrder: (payload) => post('/orders', payload).then((res) => res.data.data),
  getOrder: (id) => get(`/orders/${id}`).then((res) => res.data.data),
  getMyRentals: (params) => get('/orders/my-rentals', params).then((res) => res.data.data),
  getOrdersOfMyCars: (params) => get('/orders/my-cars', params).then((res) => res.data.data),
  getAllOrders: (params) => get('/orders', params).then((res) => res.data.data),
  confirmOrder: (id, reason) => put(`/orders/${id}/confirm`, { reason }).then((res) => res.data.data),
  rejectOrder: (id, reason) => put(`/orders/${id}/reject`, { reason }).then((res) => res.data.data),
  cancelOrder: (id, reason) => put(`/orders/${id}/cancel`, { reason }).then((res) => res.data.data),
  getLogs: (id) => get(`/orders/${id}/logs`).then((res) => res.data.data),
};

export const handoverService = {
  getHandovers: (orderId) => get(`/orders/${orderId}/handovers`).then((res) => res.data.data),
  createHandover: (orderId, payload) =>
    post(`/orders/${orderId}/handovers`, payload).then((res) => res.data.data),
  confirmHandover: (handoverId) => put(`/handovers/${handoverId}/confirm`).then((res) => res.data.data),
};

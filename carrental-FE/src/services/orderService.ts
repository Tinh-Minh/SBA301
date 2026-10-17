import type { PageResponse } from "@/interfaces/api";
import type {
  ActionLog,
  CreateHandoverRequest,
  CreateOrderRequest,
  Handover,
  Order,
  OrderListParams,
  PriceQuote,
  QuoteRequest,
} from "@/interfaces/order";
import { get, post, put } from "./api";

/** API đặt xe và vòng đời đơn (Function 3). */
export const orderService = {
  quote: (payload: QuoteRequest) => post<PriceQuote>("/orders/quote", payload),
  createOrder: (payload: CreateOrderRequest) => post<Order>("/orders", payload),
  getOrder: (id: number) => get<Order>(`/orders/${id}`),
  getMyRentals: (params?: OrderListParams) => get<PageResponse<Order>>("/orders/my-rentals", params),
  getOrdersOfMyCars: (params?: OrderListParams) => get<PageResponse<Order>>("/orders/my-cars", params),
  getAllOrders: (params?: OrderListParams) => get<PageResponse<Order>>("/orders", params),
  confirmOrder: (id: number, reason?: string) => put<Order>(`/orders/${id}/confirm`, { reason }),
  rejectOrder: (id: number, reason: string) => put<Order>(`/orders/${id}/reject`, { reason }),
  cancelOrder: (id: number, reason?: string) => put<Order>(`/orders/${id}/cancel`, { reason }),
  getLogs: (id: number) => get<ActionLog[]>(`/orders/${id}/logs`),
};

/** API bàn giao nhận/trả xe (Function 3). */
export const handoverService = {
  getHandovers: (orderId: number) => get<Handover[]>(`/orders/${orderId}/handovers`),
  createHandover: (orderId: number, payload: CreateHandoverRequest) =>
    post<Handover>(`/orders/${orderId}/handovers`, payload),
  confirmHandover: (handoverId: number) => put<Handover>(`/handovers/${handoverId}/confirm`),
};

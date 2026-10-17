import type { OrderStatus, OwnerOrderView } from "@/interfaces";
import { canRespondToOrder, isOrderExpired } from "@/lib/owner/rules";
import { ApiError, jsonBody, mockResponse, request, USE_MOCK_API } from "./http";
import { findOrFail, ownerDb, toOrderView } from "./mock/owner-db";

function expireStaleMockOrders() {
  for (const order of ownerDb.orders) if (isOrderExpired(order)) order.status = "EXPIRED";
}

function respond(id: number, status: Extract<OrderStatus, "CONFIRMED" | "REJECTED">) {
  expireStaleMockOrders();
  const order = findOrFail(ownerDb.orders, id, "đơn thuê");
  if (!canRespondToOrder(order)) throw new ApiError(409, `Đơn ${order.orderCode} không còn chờ phản hồi`);
  order.status = status;
  return mockResponse(toOrderView(order));
}

export const orderService = {
  async listMine(status?: OrderStatus): Promise<OwnerOrderView[]> {
    if (USE_MOCK_API) {
      expireStaleMockOrders();
      return mockResponse(ownerDb.orders.filter(order => !status || order.status === status).map(toOrderView));
    }
    return request(`/api/owner/orders${status ? `?status=${status}` : ""}`);
  },

  async getById(id: number): Promise<OwnerOrderView> {
    if (USE_MOCK_API) return mockResponse(toOrderView(findOrFail(ownerDb.orders, id, "đơn thuê")));
    return request(`/api/owner/orders/${id}`);
  },

  async approve(id: number): Promise<OwnerOrderView> {
    if (USE_MOCK_API) return respond(id, "CONFIRMED");
    return request(`/api/owner/orders/${id}/approve`, { method: "POST" });
  },

  async reject(id: number, reason: string): Promise<OwnerOrderView> {
    if (USE_MOCK_API) return respond(id, "REJECTED");
    return request(`/api/owner/orders/${id}/reject`, { method: "POST", body: jsonBody({ reason }) });
  },
};

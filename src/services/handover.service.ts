import type { HandoverType, OrderHandover } from "@/interfaces";
import { isHandoverConfirmed, isPayoutReleasable, nextHandoverType } from "@/lib/owner/rules";
import { ApiError, jsonBody, mockResponse, request, USE_MOCK_API } from "./http";
import { findOrFail, nextMockId, ownerDb } from "./mock/owner-db";

export type HandoverInput = { handoverType: HandoverType; odometerKm: number; fuelPercent: number; conditionNote?: string };

/** Mô phỏng chuyển trạng thái phía backend sau khi biên bản được hai bên xác nhận. */
function applyMockTransitions(handover: OrderHandover) {
  if (!isHandoverConfirmed(handover)) return;
  const order = findOrFail(ownerDb.orders, handover.orderId, "đơn thuê");
  if (handover.handoverType === "PICKUP") {
    order.status = "ONGOING";
    order.actualStartTime = handover.handedAt;
    return;
  }
  if (!isPayoutReleasable(ownerDb.handovers.filter(item => item.orderId === order.id))) return;
  order.status = "COMPLETED";
  order.actualEndTime = handover.handedAt;
  const payout = ownerDb.payouts.find(item => item.orderId === order.id);
  if (payout) Object.assign(payout, { status: "PAID", paidAt: new Date().toISOString() });
}

export const handoverService = {
  async listByOrder(orderId: number): Promise<OrderHandover[]> {
    if (USE_MOCK_API) return mockResponse(ownerDb.handovers.filter(item => item.orderId === orderId));
    return request(`/api/owner/orders/${orderId}/handovers`);
  },

  /** Chủ xe lập biên bản C10-A / C10-B; người thuê xác nhận ở ứng dụng của họ. */
  async create(orderId: number, input: HandoverInput): Promise<OrderHandover> {
    if (USE_MOCK_API) {
      const expected = nextHandoverType(ownerDb.handovers.filter(item => item.orderId === orderId));
      if (input.handoverType !== expected) throw new ApiError(409, `Biên bản tiếp theo phải là ${expected ?? "không có"}`);
      const now = new Date().toISOString();
      const handover: OrderHandover = { id: nextMockId(), orderId, ...input, handedAt: now, ownerConfirmedAt: now };
      ownerDb.handovers.push(handover);
      return mockResponse(handover);
    }
    return request(`/api/owner/orders/${orderId}/handovers`, { method: "POST", body: jsonBody(input) });
  },

  async confirmAsOwner(handoverId: number): Promise<OrderHandover> {
    if (USE_MOCK_API) {
      const handover = findOrFail(ownerDb.handovers, handoverId, "biên bản");
      handover.ownerConfirmedAt ??= new Date().toISOString();
      applyMockTransitions(handover);
      return mockResponse(handover);
    }
    return request(`/api/owner/handovers/${handoverId}/confirm`, { method: "POST" });
  },
};

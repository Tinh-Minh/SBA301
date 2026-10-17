import type { CarStatus, HandoverType, KycStatus, OrderStatus, PaymentStatus, PayoutStatus, SlotStatus } from "@/interfaces";

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger" | "brand";
export type StatusMeta = { label: string; tone: StatusTone };

export const toneClasses: Record<StatusTone, string> = {
  neutral: "bg-badge-gray text-charcoal border-border-light",
  info: "bg-status-blue-bg text-blue-800 border-blue-200",
  success: "bg-status-green-bg text-status-success-ink border-emerald-border",
  warning: "bg-status-amber-bg text-amber-800 border-amber-200",
  danger: "bg-error-container text-on-error-container border-red-200",
  brand: "bg-accent-soft text-on-primary-fixed-variant border-primary-fixed",
};

export const kycStatusMeta: Record<KycStatus, StatusMeta> = {
  NONE: { label: "Chưa xác minh", tone: "neutral" },
  PENDING: { label: "Đang xét duyệt", tone: "warning" },
  VERIFIED: { label: "Đã xác minh", tone: "success" },
  REJECTED: { label: "Bị từ chối", tone: "danger" },
};

export const carStatusMeta: Record<CarStatus, StatusMeta> = {
  PENDING_APPROVAL: { label: "Chờ duyệt", tone: "warning" },
  ACTIVE: { label: "Đang cho thuê", tone: "success" },
  INACTIVE: { label: "Tạm ngưng", tone: "neutral" },
  REJECTED: { label: "Bị từ chối", tone: "danger" },
};

export const slotStatusMeta: Record<SlotStatus, StatusMeta> = {
  OPEN: { label: "Đang mở", tone: "success" },
  CLOSED: { label: "Đã đóng", tone: "neutral" },
  CANCELLED: { label: "Đã hủy", tone: "danger" },
};

export const orderStatusMeta: Record<OrderStatus, StatusMeta> = {
  PENDING: { label: "Chờ phản hồi", tone: "warning" },
  CONFIRMED: { label: "Đã xác nhận", tone: "info" },
  REJECTED: { label: "Đã từ chối", tone: "danger" },
  EXPIRED: { label: "Quá hạn", tone: "neutral" },
  ONGOING: { label: "Đang thuê", tone: "brand" },
  COMPLETED: { label: "Hoàn thành", tone: "success" },
  CANCELLED: { label: "Đã hủy", tone: "danger" },
};

export const paymentStatusMeta: Record<PaymentStatus, StatusMeta> = {
  UNPAID: { label: "Chưa thanh toán", tone: "warning" },
  PAID: { label: "Đã thanh toán", tone: "success" },
  REFUNDED: { label: "Đã hoàn tiền", tone: "neutral" },
};

export const payoutStatusMeta: Record<PayoutStatus, StatusMeta> = {
  PENDING: { label: "Đang giữ escrow", tone: "warning" },
  PROCESSING: { label: "Đang chuyển", tone: "info" },
  PAID: { label: "Đã chuyển khoản", tone: "success" },
  FAILED: { label: "Chuyển thất bại", tone: "danger" },
};

export const handoverTypeMeta: Record<HandoverType, StatusMeta & { code: string }> = {
  PICKUP: { code: "C10-A", label: "Biên bản nhận xe", tone: "info" },
  RETURN: { code: "C10-B", label: "Biên bản trả xe", tone: "brand" },
};

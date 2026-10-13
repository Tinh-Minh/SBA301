export const formatMoney = (value) =>
  value === null || value === undefined ? '-' : `${Number(value).toLocaleString('vi-VN')} đ`;

export const formatDateTime = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  return d.toLocaleString('vi-VN', { hour12: false });
};

export const ORDER_STATUS_LABEL = {
  PENDING: { text: 'Chờ xác nhận', bg: 'warning' },
  CONFIRMED: { text: 'Đã xác nhận', bg: 'primary' },
  REJECTED: { text: 'Bị từ chối', bg: 'secondary' },
  EXPIRED: { text: 'Hết hạn', bg: 'secondary' },
  ONGOING: { text: 'Đang thuê', bg: 'info' },
  COMPLETED: { text: 'Hoàn tất', bg: 'success' },
  CANCELLED: { text: 'Đã huỷ', bg: 'danger' },
};

export const RENTAL_TYPE_LABEL = { HOURLY: 'Theo giờ', DAILY: 'Theo ngày' };

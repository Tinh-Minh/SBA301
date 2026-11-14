import { useSyncExternalStore } from "react";

// Phải khớp với DeliveryPolicy ở backend (backend là nơi tính tiền thật khi đặt xe).
export const DELIVERY_FREE_KM = 5;
export const DELIVERY_FEE_PER_KM = 30_000;
const ROAD_FACTOR = 1.3;

/** Quãng đường ước tính (km, 1 chữ số thập phân) = chim bay × 1,3; null nếu thiếu toạ độ. */
export function deliveryDistanceKm(from, to) {
    if (!from || !to || from.lat == null || from.lng == null || to.lat == null || to.lng == null) return null;
    const rad = d => (Number(d) * Math.PI) / 180;
    const dLat = rad(to.lat - from.lat), dLng = rad(to.lng - from.lng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(from.lat)) * Math.cos(rad(to.lat)) * Math.sin(dLng / 2) ** 2;
    const straight = 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(a)));
    return Math.round(straight * ROAD_FACTOR * 10) / 10;
}

/** Miễn phí 5 km đầu, mỗi km vượt (làm tròn lên) 30.000đ. */
export function deliveryFee(km) {
    if (km == null || km <= DELIVERY_FREE_KM) return 0;
    return Math.ceil(Math.round((km - DELIVERY_FREE_KM) * 10) / 10) * DELIVERY_FEE_PER_KM;
}

export function carPoint(car) {
    return car?.latitude != null && car?.longitude != null ? { lat: Number(car.latitude), lng: Number(car.longitude) } : null;
}

// ---- Vị trí nhận xe khách đã chọn: dùng chung giữa trang Thuê xe và trang chi tiết xe (lưu trong trình duyệt).
const KEY = "cardb:delivery-location:v1";
const listeners = new Set();
let current = read();

function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
}

/** location = { province, district, ward, street, lat, lng } hoặc null. */
export function setDeliveryLocation(location) {
    current = location;
    try { location ? localStorage.setItem(KEY, JSON.stringify(location)) : localStorage.removeItem(KEY); } catch { /* trình duyệt chặn lưu trữ */ }
    listeners.forEach(fn => fn());
}

export function useDeliveryLocation() {
    return useSyncExternalStore(fn => { listeners.add(fn); return () => listeners.delete(fn); }, () => current, () => null);
}

export function locationLabel(loc) {
    if (!loc) return "";
    return [loc.street, loc.ward, loc.district, loc.province].filter(Boolean).join(", ");
}

export function locationPoint(loc) {
    return loc?.lat != null && loc?.lng != null ? { lat: loc.lat, lng: loc.lng } : null;
}

// One demo collection feeds both profile trip views and their counters.
export const trips = [
    { id: "CDB-ORD-20261026-904", car: "VinFast VF 9 Plus AWD", owner: "Trần Đức Nam", rating: "5.0", image: "cardb-536bade8c0abc9b8.webp", status: "pending", paid: false, created: "2026-10-26", start: "2026-10-26T08:00:00+07:00", end: "2026-10-28T08:00:00+07:00", location: "128 Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh", total: 3700000, deposit: 15000000, base: 3900000, discount: 200000, note: "Chủ xe đang xem xét yêu cầu. Bạn chưa cần thanh toán." },
    { id: "CDB-ORD-20261102-418", car: "BMW 530i M Sport 2024", owner: "Lê Hoàng Quân", rating: "4.9", image: "cardb-c0fae6b830847cd7.webp", status: "confirmed", paid: false, created: "2026-10-22", start: "2026-11-02T09:00:00+07:00", end: "2026-11-03T18:00:00+07:00", location: "Sân bay Tân Sơn Nhất, TP. Hồ Chí Minh", total: 2850000, deposit: 20000000, paymentDeadline: "23:59 • 26/10/2026", note: "Chủ xe đã xác nhận. Hoàn tất thanh toán để giữ lịch nhận xe." },
    { id: "CDB-ORD-20261105-112", car: "Porsche Taycan 4S", owner: "Nguyễn Anh Tuấn", rating: "5.0", image: "cardb-16da0a3fc924a0e7.webp", status: "confirmed", paid: true, created: "2026-10-24", start: "2026-11-05T08:00:00+07:00", end: "2026-11-07T08:00:00+07:00", location: "Hà Nội • Giao xe tận nơi", total: 5800000, deposit: 20000000, note: "Đã thanh toán tiền thuê. Chuẩn bị giấy tờ để nhận xe đúng hẹn." },
    { id: "CDB-ORD-20261023-112", car: "Mercedes-Benz GLC 300 4MATIC", owner: "Phạm Minh Tuấn", rating: "4.9", image: "cardb-1ec43e930558b9f7.webp", status: "active", paid: true, created: "2026-10-20", start: "2026-10-23T08:00:00+07:00", end: "2026-10-26T20:00:00+07:00", location: "Landmark 81, Bình Thạnh, TP. Hồ Chí Minh", total: 3100000, deposit: 15000000, fuel: "85%", odometer: "142 km", note: "Chuyến đi đang diễn ra. Kiểm tra hạn trả xe và mức nhiên liệu trước khi bàn giao." },
    { id: "CDB-ORD-20261015-883", car: "VinFast VF 8 Plus (402 HP)", owner: "VinFast Mobility", rating: "5.0", image: "cardb-127ef324766d6c09.webp", status: "completed", paid: true, created: "2026-10-12", start: "2026-10-15T08:00:00+07:00", end: "2026-10-17T18:30:00+07:00", location: "Showroom CarDB Thảo Điền, TP. Thủ Đức", total: 2500000, deposit: 10000000, distance: "218 km", review: "5.0", refund: "Vietcombank ••••982 · CDB-REF-992144", note: "Đã trả xe đúng hạn. Tiền cọc đã được hoàn đủ, không phát sinh phụ phí." },
    { id: "CDB-ORD-20260910-671", car: "Mercedes-Benz GLC 300 4MATIC", owner: "Mercedes-Benz Crossover", rating: "4.9", image: "cardb-44142b04ee3bc0d1.webp", status: "completed", paid: true, created: "2026-09-08", start: "2026-09-10T08:00:00+07:00", end: "2026-09-12T18:00:00+07:00", location: "Sân bay Quốc tế Tân Sơn Nhất • Ga Quốc tế", total: 4900000, deposit: 15000000, refund: "Đã hoàn 100% · CDB-REF-884102", note: "Hoàn tất bàn giao. Bạn có thể tải hóa đơn và đánh giá chuyến đi." },
    { id: "CDB-ORD-20260928-095", car: "Porsche Macan GTS 2024", owner: "Porsche Mobility", rating: "5.0", image: "cardb-16da0a3fc924a0e7.webp", status: "cancelled", paid: false, created: "2026-09-28", start: "2026-09-29T08:00:00+07:00", end: "2026-09-30T18:00:00+07:00", location: "TP. Hồ Chí Minh", total: 5200000, deposit: 0, cancellationFee: 0, note: "Đã hủy miễn phí do thay đổi kế hoạch. Không phát sinh thanh toán." },
];
export const tripStatuses = {
    pending: { label: "Chờ xác nhận", icon: "hourglass_top", tone: "bg-status-amber-bg text-status-amber-strong" },
    confirmed: { label: "Đã xác nhận", icon: "event_available", tone: "bg-blue-light text-status-blue-strong" },
    active: { label: "Đang thuê", icon: "directions_car", tone: "bg-accent-soft text-brand-accent" },
    completed: { label: "Đã hoàn thành", icon: "check_circle", tone: "bg-emerald-light text-status-success-strong" },
    cancelled: { label: "Đã hủy", icon: "cancel", tone: "bg-pill-bg text-text-secondary" },
    rejected: { label: "Đã từ chối", icon: "block", tone: "bg-error-container text-error" },
    expired: { label: "Hết hạn", icon: "timer_off", tone: "bg-pill-bg text-text-secondary" },
};
export const isPastTrip = trip => ["completed", "cancelled", "rejected", "expired"].includes(trip.status);
const dateTime = new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
export const formatTripDate = value => dateTime.format(new Date(value));
const moneyFormat = new Intl.NumberFormat("vi-VN");
export const formatTripMoney = value => `${moneyFormat.format(value)} đ`;
export function downloadTripReport(records) {
    const rows = [["Mã đơn", "Xe", "Trạng thái", "Nhận xe", "Trả xe", "Tiền thuê (VND)", "Cọc thế chấp (VND)", "Thanh toán"], ...records.map(trip => [trip.id, trip.car, tripStatuses[trip.status].label, formatTripDate(trip.start), formatTripDate(trip.end), trip.total, trip.deposit, trip.paid ? "Đã thanh toán" : "Chưa thanh toán"])];
    const csv = "\ufeff" + rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "cardb-lich-su.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function tripTimeRemaining(end, now = Date.now()) {
    const minutes = Math.ceil((new Date(end).getTime() - now) / 60000);
    if (minutes <= 0) return "Đã đến hạn trả xe";
    const hours = Math.floor(minutes / 60);
    return hours >= 24 ? `Còn ${Math.floor(hours / 24)} ngày ${hours % 24} giờ` : `Còn ${hours} giờ ${minutes % 60} phút`;
}

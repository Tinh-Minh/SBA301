const dateTime = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
const dateTimeShort = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
export function formatRentalPeriod(order) {
    const start = dateTime.format(new Date(order.startTime));
    const end = dateTime.format(new Date(order.endTime));
    const unit = order.rentalType === "DAILY" ? "ngày" : "giờ";
    return { range: `${start} — ${end}`, duration: `Tổng thời gian: ${order.quantity} ${unit}` };
}
export function formatActivityTime(iso) {
    return dateTimeShort.format(new Date(iso));
}
export function maskBankAccount(accountNumber) {
    const digits = accountNumber.replace(/\D/g, "");
    return digits.length >= 4 ? `••••${digits.slice(-3)}` : accountNumber;
}
const carTypeLabels = {
    SEDAN: "Sedan",
    HATCHBACK: "Hatchback",
    SUV: "SUV",
    MPV: "MPV",
    PICKUP: "Pickup",
    LUXURY: "Hạng sang",
    OTHER: "Khác",
};
const fuelLabels = {
    GASOLINE: "xăng",
    DIESEL: "dầu",
    ELECTRIC: "thuần điện",
    HYBRID: "hybrid",
};
export function carSubtitle(car) {
    if (car.fuelType === "ELECTRIC")
        return `${carTypeLabels[car.carType]} ${car.seats} chỗ thuần điện AWD`;
    if (car.carType === "LUXURY")
        return `${carTypeLabels[car.carType]} ${car.seats} chỗ sang trọng`;
    if (car.status === "PENDING_APPROVAL")
        return `${carTypeLabels[car.carType]} ${car.seats} chỗ sang trọng • Đang thẩm định`;
    return `${carTypeLabels[car.carType]} ${car.seats} chỗ • ${fuelLabels[car.fuelType]}`;
}
export function isApprovedCar(status) {
    return status === "ACTIVE" || status === "INACTIVE";
}

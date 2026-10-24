import { calculatePayout, calculateRentalAmount, calculateTotalAmount, DEFAULT_COMMISSION_RATE } from "@/utils/owner/finance.js";
import { ApiError } from "../http";
const minutesFromNow = (minutes) => new Date(Date.now() + minutes * 60_000).toISOString();
const owner = { id: 1, fullName: "Trần Đức Nam", email: "nam.tran@cardb.vn", phone: "0903 889 921", avatarUrl: "/images/cardb-5e45d798899a87c8.webp", kycStatus: "VERIFIED", role: "CUSTOMER", status: "ACTIVE" };
const renters = [
    { id: 2, fullName: "Nguyễn Hoàng Minh", email: "minh.nguyen@gmail.com", phone: "0912 448 920", kycStatus: "VERIFIED", role: "CUSTOMER", status: "ACTIVE" },
    { id: 3, fullName: "Lê Thu Hà", email: "thuha.le@gmail.com", phone: "0987 120 334", kycStatus: "VERIFIED", role: "CUSTOMER", status: "ACTIVE" },
    { id: 4, fullName: "Phạm Quốc Bảo", email: "bao.pham@outlook.com", phone: "0938 765 002", kycStatus: "VERIFIED", role: "CUSTOMER", status: "ACTIVE" },
];
const bankAccounts = [
    { id: 1, customerId: 1, bankName: "Vietcombank", accountNumber: "007100****982", accountHolder: "TRẦN ĐỨC NAM", isDefault: true },
    { id: 2, customerId: 1, bankName: "Techcombank", accountNumber: "1903****5521", accountHolder: "TRẦN ĐỨC NAM", isDefault: false },
];
const cars = [
    { id: 1, ownerId: 1, licensePlate: "51K-889.92", brand: "VinFast", model: "VF 9 Plus AWD", manufactureYear: 2025, carType: "SUV", seats: 7, transmission: "AUTOMATIC", fuelType: "ELECTRIC", pickupAddress: "208 Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM", pricePerHour: 180000, pricePerDay: 1950000, depositAmount: 15000000, kmLimitPerDay: 350, extraKmFee: 5000, status: "ACTIVE", primaryImageUrl: "/images/cardb-e5cfa07014e754d6.webp" },
    { id: 2, ownerId: 1, licensePlate: "51H-246.18", brand: "Mercedes-Benz", model: "GLC 300 4MATIC", manufactureYear: 2024, carType: "LUXURY", seats: 5, transmission: "AUTOMATIC", fuelType: "GASOLINE", pickupAddress: "208 Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM", pricePerHour: 250000, pricePerDay: 2800000, depositAmount: 20000000, kmLimitPerDay: 350, extraKmFee: 5000, status: "ACTIVE", primaryImageUrl: "/images/cardb-1ec43e930558b9f7.webp" },
    { id: 3, ownerId: 1, licensePlate: "30K-512.67", brand: "Kia", model: "Carnival Signature", manufactureYear: 2024, carType: "MPV", seats: 7, transmission: "AUTOMATIC", fuelType: "DIESEL", pickupAddress: "12 Thảo Điền, TP. Thủ Đức, TP.HCM", pricePerHour: 150000, pricePerDay: 1600000, depositAmount: 10000000, kmLimitPerDay: 350, extraKmFee: 5000, status: "INACTIVE", primaryImageUrl: "/images/cardb-82e98b75b37c32c9.webp" },
    { id: 4, ownerId: 1, licensePlate: "51G-778.30", brand: "Mazda", model: "CX-5 Premium", manufactureYear: 2023, carType: "SUV", seats: 5, transmission: "AUTOMATIC", fuelType: "GASOLINE", pickupAddress: "12 Thảo Điền, TP. Thủ Đức, TP.HCM", pricePerHour: 110000, pricePerDay: 1100000, depositAmount: 8000000, kmLimitPerDay: 350, extraKmFee: 5000, status: "PENDING_APPROVAL", primaryImageUrl: "/images/cardb-73b166040535beb8.webp" },
];
const slots = [
    { id: 1, carId: 1, startTime: "2026-10-01T00:00:00+07:00", endTime: "2026-10-31T23:59:59+07:00", pricePerHour: 180000, pricePerDay: 1950000, rentalOption: "BOTH", status: "OPEN" },
    { id: 2, carId: 2, startTime: "2026-10-01T00:00:00+07:00", endTime: "2026-10-31T23:59:59+07:00", pricePerHour: 250000, pricePerDay: 2800000, rentalOption: "DAILY", status: "OPEN" },
    { id: 3, carId: 3, startTime: "2026-10-01T00:00:00+07:00", endTime: "2026-10-15T23:59:59+07:00", pricePerHour: 150000, pricePerDay: 1600000, rentalOption: "DAILY", status: "CLOSED" },
    { id: 4, carId: 1, startTime: "2026-11-01T00:00:00+07:00", endTime: "2026-11-30T23:59:59+07:00", pricePerHour: 180000, pricePerDay: 1950000, rentalOption: "BOTH", status: "OPEN" },
];
function order(input) {
    const rentalAmount = calculateRentalAmount(input.unitPrice, input.quantity);
    return { ...input, rentalAmount, totalAmount: calculateTotalAmount(rentalAmount, input.discountAmount), commissionRate: DEFAULT_COMMISSION_RATE };
}
const orders = [
    order({ id: 904, orderCode: "CDB-ORD-20261026-904", customerId: 2, carId: 1, carSlotId: 1, rentalType: "DAILY", startTime: "2026-10-26T09:00:00+07:00", endTime: "2026-10-28T09:00:00+07:00", unitPrice: 1950000, quantity: 2, discountAmount: 200000, depositAmount: 15000000, status: "CONFIRMED", paymentStatus: "PAID" }),
    order({ id: 911, orderCode: "CDB-ORD-20261020-911", customerId: 3, carId: 2, carSlotId: 2, rentalType: "DAILY", startTime: "2026-10-20T08:00:00+07:00", endTime: "2026-10-23T08:00:00+07:00", unitPrice: 2800000, quantity: 3, discountAmount: 0, depositAmount: 20000000, status: "PENDING", paymentStatus: "UNPAID", expiresAt: minutesFromNow(95) }),
    order({ id: 912, orderCode: "CDB-ORD-20261019-912", customerId: 4, carId: 1, carSlotId: 1, rentalType: "HOURLY", startTime: "2026-10-19T08:00:00+07:00", endTime: "2026-10-19T14:00:00+07:00", unitPrice: 180000, quantity: 6, discountAmount: 100000, depositAmount: 15000000, status: "PENDING", paymentStatus: "UNPAID", expiresAt: minutesFromNow(25) }),
    order({ id: 887, orderCode: "CDB-ORD-20261016-887", customerId: 4, carId: 2, carSlotId: 2, rentalType: "DAILY", startTime: "2026-10-16T08:00:00+07:00", endTime: "2026-10-18T08:00:00+07:00", actualStartTime: "2026-10-16T08:12:00+07:00", unitPrice: 2800000, quantity: 2, discountAmount: 0, depositAmount: 20000000, status: "ONGOING", paymentStatus: "PAID" }),
    order({ id: 861, orderCode: "CDB-ORD-20261010-861", customerId: 3, carId: 1, carSlotId: 1, rentalType: "DAILY", startTime: "2026-10-10T09:00:00+07:00", endTime: "2026-10-13T09:00:00+07:00", actualStartTime: "2026-10-10T09:05:00+07:00", actualEndTime: "2026-10-13T08:40:00+07:00", unitPrice: 1950000, quantity: 3, discountAmount: 300000, depositAmount: 15000000, status: "COMPLETED", paymentStatus: "PAID" }),
    order({ id: 842, orderCode: "CDB-ORD-20261003-842", customerId: 2, carId: 3, carSlotId: 3, rentalType: "DAILY", startTime: "2026-10-03T07:00:00+07:00", endTime: "2026-10-04T07:00:00+07:00", actualStartTime: "2026-10-03T07:10:00+07:00", actualEndTime: "2026-10-04T06:55:00+07:00", unitPrice: 1600000, quantity: 1, discountAmount: 0, depositAmount: 10000000, status: "COMPLETED", paymentStatus: "PAID" }),
];
const handovers = [
    { id: 1, orderId: 887, handoverType: "PICKUP", odometerKm: 18420, fuelPercent: 82, conditionNote: "Xe sạch, không trầy xước mới.", handedAt: "2026-10-16T08:12:00+07:00", ownerConfirmedAt: "2026-10-16T08:14:00+07:00", renterConfirmedAt: "2026-10-16T08:15:00+07:00" },
    { id: 2, orderId: 861, handoverType: "PICKUP", odometerKm: 6120, fuelPercent: 95, handedAt: "2026-10-10T09:05:00+07:00", ownerConfirmedAt: "2026-10-10T09:06:00+07:00", renterConfirmedAt: "2026-10-10T09:07:00+07:00" },
    { id: 3, orderId: 861, handoverType: "RETURN", odometerKm: 6984, fuelPercent: 41, conditionNote: "Đúng hạn mức km, pin còn 41%.", handedAt: "2026-10-13T08:40:00+07:00", ownerConfirmedAt: "2026-10-13T08:45:00+07:00", renterConfirmedAt: "2026-10-13T08:46:00+07:00" },
    { id: 4, orderId: 842, handoverType: "PICKUP", odometerKm: 32540, fuelPercent: 100, handedAt: "2026-10-03T07:10:00+07:00", ownerConfirmedAt: "2026-10-03T07:11:00+07:00", renterConfirmedAt: "2026-10-03T07:12:00+07:00" },
    { id: 5, orderId: 842, handoverType: "RETURN", odometerKm: 32811, fuelPercent: 76, handedAt: "2026-10-04T06:55:00+07:00", ownerConfirmedAt: "2026-10-04T07:00:00+07:00", renterConfirmedAt: "2026-10-04T07:01:00+07:00" },
];
function payout(id, orderId, status, paidAt) {
    const source = orders.find(item => item.id === orderId);
    return { id, orderId, recipientId: owner.id, bankAccountId: 1, ...calculatePayout(source), status, paidAt };
}
const payouts = [
    payout(1, 904, "PENDING"),
    payout(2, 887, "PENDING"),
    payout(3, 861, "PAID", "2026-10-14T10:00:00+07:00"),
    payout(4, 842, "PAID", "2026-10-05T10:00:00+07:00"),
];
/** Kho dữ liệu trong bộ nhớ, thay đổi được để mô phỏng thao tác của chủ xe. */
export const ownerDb = { owner, renters, bankAccounts, cars, slots, orders, handovers, payouts };
let nextId = 1000;
export const nextMockId = () => nextId++;
export function findOrFail(rows, id, entity) {
    const row = rows.find(item => item.id === id);
    if (!row)
        throw new ApiError(404, `Không tìm thấy ${entity} #${id}`);
    return row;
}
export function toOrderView(rentalOrder) {
    return {
        order: rentalOrder,
        car: findOrFail(cars, rentalOrder.carId, "xe"),
        renter: findOrFail(renters, rentalOrder.customerId, "khách thuê"),
        handovers: handovers.filter(item => item.orderId === rentalOrder.id),
    };
}
export function toPayoutView(item) {
    const rentalOrder = findOrFail(orders, item.orderId, "đơn thuê");
    return { payout: item, order: rentalOrder, car: findOrFail(cars, rentalOrder.carId, "xe") };
}

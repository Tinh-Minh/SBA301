const order904 = {
    id: "ord-904",
    orderCode: "CDB-ORD-20261026-904",
    carTitle: "VinFast VF 9 Plus AWD",
    plate: "51K-889.92",
    renter: "Nguyễn Hoàng Minh",
    owner: "Trần Đức Nam",
    ownerCode: "CDB-VN-88492",
    bank: "Vietcombank ****982",
    period: "26/10 – 28/10/2026",
    rentalAmount: 3700000,
    commissionRate: 10,
    depositAmount: 15000000,
    status: "CONFIRMED",
    telemetry: { gps: "Xa lộ Hà Nội, An Phú, TP. Thủ Đức", speed: "58 km/h", odometerKm: 142, batteryPercent: 78 },
};

export const adminSeed = {
    users: [
        { id: "u1", code: "CDB-KH-3392", name: "Nguyễn Hoàng Minh", city: "Q. Cầu Giấy, Hà Nội", docs: "CCCD + GPLX B2", cccd: "001234567890", license: "GPLX hạng B2", match: 98.4, tier: "Tier 1", status: "PENDING" },
        { id: "u2", code: "CDB-VN-88492", name: "Trần Đức Nam", city: "TP. Thủ Đức, TP.HCM", docs: "CCCD + Đăng ký xe", cccd: "079123456789", license: "GPLX hạng B2", match: 99.1, tier: "Tier 1", status: "VERIFIED" },
        { id: "u3", code: "CDB-KH-9102", name: "Vũ Đình Trọng", city: "Q. Hoàn Kiếm, Hà Nội", docs: "GPLX hết hạn", cccd: "001098765432", license: "GPLX hết hạn", match: 72.1, tier: "Không đạt", status: "LOCKED" },
    ],
    vehicles: [
        { id: "v1", title: "VinFast VF 9 Plus AWD", plate: "51K-889.92", owner: "Trần Đức Nam", ownerCode: "CDB-VN-88492", pricePerDay: 1950000, deposit: 15000000, status: "PENDING", checks: ["Cavet đăng ký xe", "Đăng kiểm còn hạn đến 11/2026", "Bảo hiểm PVI Care", "6 ảnh thực tế"] },
        { id: "v2", title: "Mercedes-Benz GLC 300 4MATIC", plate: "51H-992.14", owner: "Lê Văn Tùng", ownerCode: "CDB-VN-44109", pricePerDay: 2450000, deposit: 20000000, status: "PENDING", checks: ["Cavet đăng ký xe", "Đăng kiểm còn hạn đến 08/2026", "Bảo hiểm PVI Care", "6 ảnh thực tế"] },
    ],
    vouchers: [
        { id: "vc1", code: "CARDBLUX2026", discountType: "PERCENT", value: 15, maxDiscount: 500000, minOrderAmount: 2000000, used: 42, limit: 200, status: "ACTIVE" },
        { id: "vc2", code: "WEEKEND500", discountType: "FIXED", value: 500000, maxDiscount: 500000, minOrderAmount: 3000000, used: 18, limit: 100, status: "ACTIVE" },
        { id: "vc3", code: "TET2026", discountType: "PERCENT", value: 10, maxDiscount: 1000000, minOrderAmount: 5000000, used: 0, limit: 500, status: "PAUSED" },
    ],
    orders: [
        order904,
        { id: "ord-811", orderCode: "CDB-ORD-20261024-811", carTitle: "BMW 530i M Sport", plate: "30K-452.88", renter: "Phạm Minh Tuấn", owner: "Lê Hoàng Quân", ownerCode: "CDB-VN-33821", bank: "Techcombank ****456", period: "24/10 – 27/10/2026", rentalAmount: 4400000, commissionRate: 10, depositAmount: 18000000, status: "ONGOING", telemetry: { gps: "Đường Láng, Đống Đa, Hà Nội", speed: "32 km/h", odometerKm: 86, batteryPercent: null } },
        { id: "ord-750", orderCode: "CDB-ORD-20261022-750", carTitle: "Porsche Macan GTS", plate: "51K-334.67", renter: "Trần Thu Trang", owner: "Vũ Đình Toàn", ownerCode: "CDB-VN-77215", bank: "MBBank ****889", period: "22/10 – 24/10/2026", rentalAmount: 7600000, commissionRate: 10, depositAmount: 30000000, status: "COMPLETED", telemetry: { gps: "Đã trả xe", speed: "0 km/h", odometerKm: 210, batteryPercent: null } },
        { id: "ord-915", orderCode: "CDB-ORD-20261026-915", carTitle: "Mercedes-Benz GLC 300", plate: "51H-992.14", renter: "Đặng Quốc Bảo", owner: "Lê Văn Tùng", ownerCode: "CDB-VN-44109", bank: "Vietinbank ****312", period: "28/10 – 30/10/2026", rentalAmount: 4900000, commissionRate: 10, depositAmount: 20000000, status: "PENDING", telemetry: { gps: "Chưa nhận xe", speed: "—", odometerKm: 0, batteryPercent: null } },
        { id: "ord-632", orderCode: "CDB-ORD-20261020-632", carTitle: "Hyundai Santa Fe", plate: "30F-881.23", renter: "Hoàng Hải Nam", owner: "Nguyễn Văn Đạt", ownerCode: "CDB-VN-22011", bank: "ACB ****110", period: "20/10 – 21/10/2026", rentalAmount: 1400000, commissionRate: 10, depositAmount: 8000000, status: "CANCELLED", telemetry: { gps: "Đơn đã hủy", speed: "—", odometerKm: 0, batteryPercent: null } },
    ],
    payouts: [
        { id: "p1", txnCode: "TXN-20261028-904", orderId: "ord-904", status: "PENDING" },
        { id: "p2", txnCode: "TXN-20261025-811", orderId: "ord-811", status: "PAID" },
        { id: "p3", txnCode: "TXN-20261023-750", orderId: "ord-750", status: "PAID" },
    ],
    disputes: [
        { id: "d1", caseCode: "DSP-202610-001", orderCode: "CDB-ORD-20261026-904", raisedBy: "Nguyễn Hoàng Minh", owner: "Trần Đức Nam", reason: "Tranh chấp Phí phụ trội trễ giờ", extraFee: 250000, status: "OPEN", resolution: "" },
        { id: "d2", caseCode: "DSP-202610-002", orderCode: "CDB-ORD-20261024-811", raisedBy: "Phạm Minh Tuấn", owner: "Lê Hoàng Quân", reason: "Xước cản trước khi hoàn trả C10-B", extraFee: 1200000, status: "IN_REVIEW", resolution: "" },
        { id: "d3", caseCode: "DSP-202610-003", orderCode: "CDB-ORD-20261022-750", raisedBy: "Trần Thu Trang", owner: "Vũ Đình Toàn", reason: "Mức pin lúc bàn giao lệch 15%", extraFee: 180000, status: "RESOLVED", resolution: "Hoàn tiền cho khách" },
    ],
};

export const loadAdminSeed = () => structuredClone(adminSeed);

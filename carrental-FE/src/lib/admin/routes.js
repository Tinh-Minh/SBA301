export const adminRoutes = {
    dashboard: "/admin/dashboard",
    users: "/admin/users",
    vehicles: "/admin/vehicles",
    vouchers: "/admin/vouchers",
    orders: "/admin/orders",
    payouts: "/admin/payouts",
    disputes: "/admin/disputes",
};

export const adminNavigation = [
    { code: "A01", href: adminRoutes.dashboard, label: "Tổng quan", icon: "grid_view" },
    { code: "A02", href: adminRoutes.users, label: "Người dùng & KYC", icon: "verified_user", badgeKey: "kyc", badgeSuffix: "chờ", badgeTone: "warning" },
    { code: "A03", href: adminRoutes.vehicles, label: "Duyệt xe", icon: "directions_car", badgeKey: "cars", badgeSuffix: "xe", badgeTone: "warning" },
    { code: "A04", href: adminRoutes.vouchers, label: "Voucher", icon: "confirmation_number" },
    { code: "A05", href: adminRoutes.orders, label: "Đơn thuê", icon: "receipt_long" },
    { code: "A06", href: adminRoutes.payouts, label: "Giao dịch & Chi trả", icon: "payments", badgeKey: "payouts", badgeSuffix: "chờ", badgeTone: "info" },
    { code: "A07", href: adminRoutes.disputes, label: "Tranh chấp", icon: "gavel", badgeKey: "disputes", badgeSuffix: "hồ sơ", badgeTone: "danger" },
];

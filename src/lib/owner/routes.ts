export const ownerRoutes = {
  dashboard: "/owner/dashboard",
  vehicles: "/owner/vehicles",
  vehicleNew: "/owner/vehicles/new",
  vehicleEdit: (id: number) => `/owner/vehicles/edit/${id}`,
  calendar: "/owner/calendar",
  requests: "/owner/requests",
  trips: "/owner/trips",
  payouts: "/owner/payouts",
} as const;

export const ownerNavigation = [
  { code: "O01", href: ownerRoutes.dashboard, label: "Tổng quan", icon: "grid_view" },
  { code: "O02", href: ownerRoutes.vehicles, label: "Xe của tôi", icon: "garage_home", badgeKey: "cars" as const },
  { code: "O04", href: ownerRoutes.calendar, label: "Lịch cho thuê", icon: "calendar_month" },
  { code: "O05", href: ownerRoutes.requests, label: "Yêu cầu thuê xe", icon: "pending_actions", badgeKey: "pending" as const },
  { code: "O06", href: ownerRoutes.trips, label: "Quản lý chuyến xe", icon: "assignment_turned_in" },
  { code: "O07", href: ownerRoutes.payouts, label: "Doanh thu & Chi trả", icon: "account_balance_wallet" },
] as const;

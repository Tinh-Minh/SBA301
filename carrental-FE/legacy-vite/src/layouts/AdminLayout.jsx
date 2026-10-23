import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    {
      to: '/admin',
      label: 'Tổng quan hệ thống',
      icon: 'dashboard',
      exact: true,
    },
    {
      to: '/admin/cars',
      label: 'Quản lý đội xe',
      icon: 'directions_car',
      badge: '28 xe',
    },
    {
      to: '/admin/bookings',
      label: 'Đơn đặt & Hợp đồng',
      icon: 'receipt_long',
      badge: '3 mới',
      badgeColor: 'bg-secondary text-on-secondary-fixed',
    },
    {
      to: '/admin/users',
      label: 'Khách hàng & eKYC',
      icon: 'verified_user',
      badge: '1 chờ',
      badgeColor: 'bg-tertiary-container text-on-tertiary-container',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col antialiased">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 h-16 w-full bg-surface-container-low/90 backdrop-blur-xl border-b border-outline-variant/20 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            type="button"
            title="Đóng / mở menu"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>

          <Link className="flex items-center gap-2" to="/admin">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-primary shadow-sm">
              <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-on-surface leading-none text-base">
                Car<span className="text-primary font-black">DB</span>{' '}
                <span className="text-secondary text-xs uppercase px-1.5 py-0.5 rounded bg-secondary/15 font-mono">
                  Admin
                </span>
              </span>
              <span className="text-[10px] text-on-surface-variant tracking-wider uppercase leading-none mt-0.5">
                Quản trị hệ thống xe sang
              </span>
            </div>
          </Link>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          <Link
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-primary transition-all text-xs font-semibold"
            to="/"
            title="Mở giao diện khách hàng"
          >
            <span className="material-symbols-outlined text-[16px]">storefront</span>
            <span>Về trang chủ</span>
          </Link>

          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-lowest/80 border border-secondary/30 text-xs">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-secondary font-mono font-medium">Hệ thống: Sẵn sàng 99.9%</span>
          </div>

          <button
            className="relative p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            type="button"
            title="Thông báo"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary"></span>
          </button>

          {/* Admin Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-outline-variant/30">
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs shadow-sm">
              AD
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-on-surface leading-tight">
                Ban Quản Trị
              </span>
              <span className="text-[10px] text-primary font-mono leading-tight">
                Super Admin VIP
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Admin Left Sidebar */}
        <aside
          className={`bg-surface-container-low/95 border-r border-outline-variant/20 flex flex-col justify-between transition-all duration-300 z-30 ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          <div className="p-3 flex flex-col gap-1.5">
            <div className="px-3 py-2 text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
              {!sidebarCollapsed && 'Bảng điều khiển'}
            </div>

            {navItems.map((item) => {
              const isActive =
                item.exact
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container shadow-md'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                  to={item.to}
                  title={item.label}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px] shrink-0">
                      {item.icon}
                    </span>
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!sidebarCollapsed && item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.badgeColor || 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Bottom Sidebar Info */}
          <div className="p-3 border-t border-outline-variant/20 flex flex-col gap-2">
            {!sidebarCollapsed ? (
              <div className="p-3 rounded-xl bg-surface-container-lowest/60 border border-outline-variant/15 flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-secondary">
                  CarDB Fleet Cloud
                </span>
                <span className="text-[10px] text-on-surface-variant">
                  Phiên bản 2.4.0 • Cluster Sài Gòn
                </span>
              </div>
            ) : (
              <div className="flex justify-center p-2 text-secondary">
                <span className="material-symbols-outlined text-[20px]">cloud_done</span>
              </div>
            )}
          </div>
        </aside>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

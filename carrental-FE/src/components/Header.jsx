import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isExplore =
    location.pathname === '/trip' ||
    location.pathname === '/trips' ||
    location.pathname === '/cars';

  return (
    <header className="sticky top-0 left-0 w-full z-50 bg-[#001715]/95 backdrop-blur-xl border-b border-[#176d5c]/30 shadow-[0_4px_24px_rgba(0,23,21,0.7)]">
      <div className="h-16 w-full max-w-[1440px] mx-auto px-6 md:px-10 flex items-center justify-between">
        {/* Logo & Main Nav */}
        <div className="flex items-center gap-10">
          <Link
            className="flex items-center gap-2.5 group transition-transform active:scale-95"
            to="/"
            title="CarDB Vietnam"
          >
            <img
              alt="CarDB Logo"
              className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida/AEtjO1WnoaN3L-g2X5UV_CavHBrqQj50xBeyrK8pGXbFLHvgrpo7aTVH9BADBIOfK5zt2n6tucOLOlrEbeAjP74rlwLNLiUIo6yhyMFfiVscm3vfLGshmy18X6v9FM93ahxdxjlGlzunE64w-QxkpHBFTyCyactMfJ7wW3u5f0F2MwkdrsieFmSqnP5gs7fVX80nT5YIeGWiMM2JSSFxQaXnYOi-pxQ_zPcWam72J7BwMpX4B4v0WXbWfXGXa8Ax"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-on-surface leading-none">
                Car<span className="text-primary font-extrabold">DB</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-primary/70 leading-none mt-0.5 font-semibold">
                Luxury Mobility
              </span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            <Link
              className={`text-sm font-semibold px-3.5 py-1.5 transition-colors ${
                isExplore
                  ? 'text-primary bg-[#176d5c]/30 rounded-full border border-secondary/30 shadow-[0_0_12px_rgba(74,220,200,0.15)]'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40 rounded-lg'
              }`}
              to="/trip"
            >
              Khám phá xe
            </Link>
            <Link
              className="text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40 px-3.5 py-1.5 rounded-lg transition-all"
              to="/"
            >
              Chuyến xe của tôi
            </Link>
            <Link
              className="text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40 px-3.5 py-1.5 rounded-lg transition-all"
              to="/"
            >
              Cho thuê xe
            </Link>
          </nav>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <Link
            className="text-sm font-medium text-on-surface hover:text-primary px-3.5 py-1.5 rounded-lg transition-colors hidden sm:inline-block"
            to="/login"
          >
            Đăng nhập
          </Link>
          <Link
            className="inline-flex items-center gap-1.5 text-xs font-bold text-on-secondary-fixed bg-secondary-fixed hover:bg-secondary px-4 py-2 rounded-full shadow-[0_0_18px_rgba(74,220,200,0.35)] hover:shadow-[0_0_24px_rgba(74,220,200,0.55)] transition-all active:scale-95"
            to="/register"
          >
            <span>Đăng ký</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </Link>
          {/* Profile User Dropdown */}
          <div className="relative group pl-2">
            <Link to="/profile" className="flex items-center gap-2.5 focus:outline-none cursor-pointer py-1" title="Hồ sơ cá nhân">
              <div className="flex flex-col items-end hidden lg:flex">
                <div className="flex items-center gap-1.5">
                  <span className="font-label-md text-xs text-on-surface font-semibold">Nguyễn Hoàng Minh</span>
                  <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(74,220,200,0.8)]"></span>
                </div>
                <span className="font-label-sm text-[10px] text-on-surface-variant font-mono">CDB-VN-88492</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary-container/40 p-0.5 border border-primary/30 flex items-center justify-center text-primary group-hover:border-primary transition-colors">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[16px] group-hover:text-primary transition-transform duration-300 group-hover:rotate-180 hidden sm:inline">
                expand_more
              </span>
            </Link>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-low/95 backdrop-blur-2xl rounded-xl p-1.5 shadow-2xl border border-surface-container-high hidden group-hover:flex flex-col gap-1 z-50">
              <Link
                to="/profile"
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary-container/30 text-primary font-label-md text-xs font-semibold transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">badge</span> Hồ sơ cá nhân
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              </Link>
              <Link
                to="/trip"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-xs font-medium"
              >
                <span className="material-symbols-outlined text-[18px]">commute</span> Chuyến xe của tôi
              </Link>
              <Link
                to="/trip"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-xs font-medium"
              >
                <span className="material-symbols-outlined text-[18px]">directions_car</span> Quản lý xe của tôi
              </Link>
              <Link
                to="/admin"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-xs font-semibold"
              >
                <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span> Quản trị Admin
              </Link>
              <div className="h-px bg-surface-container-high my-1"></div>
              <Link
                to="/login"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-error hover:bg-error-container hover:text-on-error-container transition-colors font-label-md text-xs font-medium"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span> Đăng xuất
              </Link>
            </div>
          </div>

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            className="md:hidden p-1 rounded-lg text-on-surface-variant hover:text-on-surface"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 pb-4 pt-2 border-t border-secondary/10 bg-surface-container-low/95 flex flex-col gap-2">
          <Link
            className={`text-sm font-semibold px-3 py-2 rounded-lg ${
              isExplore ? 'bg-surface-container-highest/60 text-primary' : 'text-on-surface-variant'
            }`}
            to="/trip"
            onClick={() => setMobileMenuOpen(false)}
          >
            Khám phá xe
          </Link>
          <Link
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface px-3 py-2 rounded-lg"
            to="/"
            onClick={() => setMobileMenuOpen(false)}
          >
            Chuyến xe của tôi
          </Link>
          <Link
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface px-3 py-2 rounded-lg"
            to="/"
            onClick={() => setMobileMenuOpen(false)}
          >
            Cho thuê xe
          </Link>
          <Link
            className="text-sm font-medium text-on-surface px-3 py-2 rounded-lg"
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
          >
            Đăng nhập
          </Link>
          <Link
            className="text-sm font-medium text-secondary px-3 py-2 rounded-lg"
            to="/register"
            onClick={() => setMobileMenuOpen(false)}
          >
            Đăng ký tài khoản
          </Link>
        </div>
      )}

    </header>
  );
}

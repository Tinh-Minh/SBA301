import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest text-on-surface-variant shadow-[0_-1px_8px_rgba(0,0,0,0.04)] border-t border-surface-container-high/40">
      <div className="w-full px-margin-sm md:px-margin py-space-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-space-xl">
          {/* Brand Info */}
          <div className="space-y-space-md">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-secondary text-[24px]">speed</span>
              <span className="font-headline-sm text-headline-sm text-on-surface">CarDB</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm leading-relaxed">
              Nền tảng thuê xe tự lái và trải nghiệm di chuyển hạng thương gia cao cấp hàng đầu Việt Nam. Chuẩn mực dịch vụ tối thượng và công nghệ điều hướng thông minh.
            </p>
            <div className="flex items-center gap-space-sm pt-space-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">headset_mic</span>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                  Tổng đài 24/7
                </span>
                <span className="font-headline-sm text-headline-sm text-secondary font-bold">
                  1900 8899
                </span>
              </div>
            </div>
          </div>

          {/* Chi nhánh độc quyền */}
          <div className="space-y-space-md">
            <h4 className="font-label-lg text-label-lg text-on-surface font-semibold uppercase tracking-wider">
              Chi nhánh độc quyền
            </h4>
            <ul className="space-y-space-sm font-body-sm text-body-sm text-on-surface-variant">
              <li className="flex items-start gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                  location_on
                </span>
                <span>Hà Nội: Toà Luxury Tower, Q. Hoàn Kiếm</span>
              </li>
              <li className="flex items-start gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                  location_on
                </span>
                <span>TP. Hồ Chí Minh: Deutsches Haus, Q. 1</span>
              </li>
              <li className="flex items-start gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                  location_on
                </span>
                <span>Đà Nẵng: Indochina Riverside, Q. Hải Châu</span>
              </li>
            </ul>
          </div>

          {/* Dịch vụ di chuyển */}
          <div className="space-y-space-md">
            <h4 className="font-label-lg text-label-lg text-on-surface font-semibold uppercase tracking-wider">
              Dịch vụ di chuyển
            </h4>
            <ul className="space-y-space-sm font-body-sm text-body-sm">
              <li className="hover:text-primary transition-colors duration-200 cursor-pointer">
                Bộ sưu tập Siêu xe & Xe sang
              </li>
              <li className="hover:text-primary transition-colors duration-200 cursor-pointer">
                Thuê xe tự lái theo tháng
              </li>
              <li className="hover:text-primary transition-colors duration-200 cursor-pointer">
                Dịch vụ Đưa đón VIP phi trường
              </li>
              <li className="hover:text-primary transition-colors duration-200 cursor-pointer">
                Gói bảo hiểm toàn diện CarDB Shield
              </li>
            </ul>
          </div>

          {/* Chính sách & Hỗ trợ */}
          <div className="space-y-space-md">
            <h4 className="font-label-lg text-label-lg text-on-surface font-semibold uppercase tracking-wider">
              Chính sách & Hỗ trợ
            </h4>
            <ul className="space-y-space-sm font-body-sm text-body-sm">
              <li className="hover:text-primary transition-colors duration-200 cursor-pointer">
                Quy trình bàn giao kỹ thuật số
              </li>
              <li className="hover:text-primary transition-colors duration-200 cursor-pointer">
                Điều khoản & Điều kiện dịch vụ
              </li>
              <li className="hover:text-primary transition-colors duration-200 cursor-pointer">
                Chính sách bảo mật dữ liệu
              </li>
              <li className="hover:text-primary transition-colors duration-200 cursor-pointer">
                Quy định giải quyết tranh chấp
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div className="pt-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md text-on-surface-variant font-label-md text-label-md bg-surface-container-low/40 p-space-md rounded-xl">
          <p className="text-center md:text-left">
            © 2025 CarDB Việt Nam Mobility Corporation. Bảo lưu mọi quyền.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-space-lg">
            <a className="hover:text-on-surface transition-colors duration-150" href="#cancel">
              Chính sách hủy xe
            </a>
            <a className="hover:text-on-surface transition-colors duration-150" href="#insurance">
              Cam kết bảo hiểm
            </a>
            <a className="hover:text-on-surface transition-colors duration-150" href="#privacy">
              Bảo mật thanh toán
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

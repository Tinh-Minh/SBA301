import React, { useState } from 'react';

export default function SearchPanel({ onSearch }) {
  const [rentalType, setRentalType] = useState('daily'); // 'daily' | 'hourly'
  const [location, setLocation] = useState('HCM');
  const [startDate, setStartDate] = useState('08:00, 25/10/2025');
  const [endDate, setEndDate] = useState('20:00, 27/10/2025');
  const [deliverHome, setDeliverHome] = useState(true);
  const [noHouseholdDoc, setNoHouseholdDoc] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ rentalType, location, startDate, endDate, deliverHome, noHouseholdDoc });
    }
  };

  return (
    <div className="w-full max-w-4xl relative z-20 -mt-3">
      <div className="bg-surface-container/95 backdrop-blur-2xl rounded-2xl p-4 md:p-5 border border-secondary/25 shadow-[0_12px_40px_rgba(0,17,16,0.7)] transition-all hover:border-secondary/40">
        {/* Tab Switcher */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-outline-variant/30">
          <div className="inline-flex p-1 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
            <button
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                rentalType === 'daily'
                  ? 'bg-secondary text-on-secondary-fixed shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              id="tab-daily"
              type="button"
              onClick={() => setRentalType('daily')}
            >
              <span className="material-symbols-outlined text-[15px]">calendar_today</span>
              <span>Theo ngày</span>
            </button>
            <button
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                rentalType === 'hourly'
                  ? 'bg-secondary text-on-secondary-fixed shadow-md'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              id="tab-hourly"
              type="button"
              onClick={() => setRentalType('hourly')}
            >
              <span className="material-symbols-outlined text-[15px]">schedule</span>
              <span>Theo giờ (Linh hoạt)</span>
            </button>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-primary font-medium">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>Miễn phí hủy lịch trước 24 giờ</span>
          </div>
        </div>

        {/* Form Fields Grid */}
        <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3" onSubmit={handleSubmit}>
          {/* Location Field */}
          <div className="lg:col-span-4 bg-surface-container-low rounded-xl px-3.5 py-2 border border-outline-variant/25 transition-all focus-within:border-primary">
            <label className="flex items-center gap-1 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
              <span className="material-symbols-outlined text-primary text-[14px]">location_on</span>
              Địa điểm nhận xe
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-on-surface focus:outline-none cursor-pointer mt-0.5 border-none p-0"
            >
              <option value="HCM" className="bg-surface-container text-on-surface">
                TP. Hồ Chí Minh (Trung tâm & Sân bay Tân Sơn Nhất)
              </option>
              <option value="HN" className="bg-surface-container text-on-surface">
                Hà Nội (Nội thành & Sân bay Nội Bài)
              </option>
              <option value="DN" className="bg-surface-container text-on-surface">
                Đà Nẵng & Hội An
              </option>
              <option value="BD" className="bg-surface-container text-on-surface">
                Bình Dương & Đồng Nai
              </option>
              <option value="NT" className="bg-surface-container text-on-surface">
                Nha Trang (Khánh Hòa)
              </option>
            </select>
          </div>

          {/* Start Date Field */}
          <div className="lg:col-span-3 bg-surface-container-low rounded-xl px-3.5 py-2 border border-outline-variant/25 transition-all focus-within:border-primary">
            <label className="flex items-center gap-1 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
              <span className="material-symbols-outlined text-primary text-[14px]">calendar_month</span>
              Bắt đầu nhận xe
            </label>
            <div className="flex items-center justify-between mt-0.5">
              <input
                className="w-full bg-transparent text-xs font-semibold text-on-surface focus:outline-none cursor-pointer p-0 border-none"
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">expand_more</span>
            </div>
          </div>

          {/* End Date Field */}
          <div className="lg:col-span-3 bg-surface-container-low rounded-xl px-3.5 py-2 border border-outline-variant/25 transition-all focus-within:border-primary">
            <label className="flex items-center gap-1 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
              <span className="material-symbols-outlined text-primary text-[14px]">event_repeat</span>
              Bàn giao trả xe
            </label>
            <div className="flex items-center justify-between mt-0.5">
              <input
                className="w-full bg-transparent text-xs font-semibold text-on-surface focus:outline-none cursor-pointer p-0 border-none"
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">expand_more</span>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="sm:col-span-2 lg:col-span-2 flex items-stretch">
            <button
              className="w-full h-full min-h-[44px] bg-gradient-to-r from-primary-container to-secondary text-on-secondary-fixed rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_18px_rgba(74,220,200,0.3)] hover:shadow-[0_0_24px_rgba(74,220,200,0.5)] hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
              type="submit"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              <span>Tìm xe ngay</span>
            </button>
          </div>
        </form>

        {/* Quick Options */}
        <div className="mt-3 pt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-on-surface-variant border-t border-outline-variant/20">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={deliverHome}
                onChange={(e) => setDeliverHome(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-surface-container-highest accent-secondary cursor-pointer"
              />
              <span>Giao xe tận nơi miễn phí</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={noHouseholdDoc}
                onChange={(e) => setNoHouseholdDoc(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-surface-container-highest accent-secondary cursor-pointer"
              />
              <span>Không giữ hộ khẩu gốc</span>
            </label>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-secondary font-medium">
            <span className="material-symbols-outlined text-[14px]">lock_reset</span>
            <span>Đặt cọc minh bạch, hoàn trả tức thì</span>
          </div>
        </div>
      </div>
    </div>
  );
}

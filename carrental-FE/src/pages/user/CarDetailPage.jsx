import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const GALLERY_IMAGES = [
  {
    title: 'Góc 3/4 trước',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBq4jrRjtNHCoXzpbiTbdMQEO9s-gUs2QbXNtg2o38QZKi_isnWZXOv6rPnnVZlC6vSi8S2U6KL_VR2rHHTrVqZ8dhjcm3mKe7MKUK0Qfncrz2ZVTPJfMCL-uY-KBnTh0D69Hec-yEASYsqpccVRM-MUrhyLkwKcheQmRkSpKjnPVyRoGZ-e2B79_Ulj_Vm28ENpgM7euBTUmOVpqBisMJ7rgf3VWjk_cjAMbbawrLIjlCtdzocQNILbg',
    alt: 'Ngoại thất góc 3/4 trước VinFast VF 9 Plus AWD',
  },
  {
    title: 'Sườn xe khí động học',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEOvAJUygexLysP-typsnRxSXbU_02V-nGN8LrgcktTVKa2-pfuGu7UYDjJouOn5ba7CanmH-BfWLyFLAahy0H08VL53drx7zPE4SLaa1Mtb0YxvcdLqFODq8-T8w9e1ioc8Q7Q4L-fPgi-QnXSiLIf2g6nzq-vnlokfAVPYJ0pw7_f3iZe2hwjmZco6y_Tg5dHRmy1V1AVQAeQNC_HZbzGEHInJntAxv6OJMKRiux_2bvkusSvGl1FA',
    alt: 'Ngoại thất góc nghiêng sườn xe',
  },
  {
    title: 'Khoang lái & Màn hình',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmvDt384lR5qafXzERZx08TOonsbdJLoM-ByjhwtvqghwGhQvfa5yL14wWKSD9xJNH6tjjBwHbIJff779VCZZMF232R3jlzNGArRQYTa1yOgEty8Ws26SV7reIPUtWY4_erGrk05r9uLAgOSYC_bI0gfiNyUa8NwEUsC9wA7m9SLwnom-4SdL4NEEwxE8SmxIMeT1fG3XegBXDmMix1V_LZzplG8bZnXAgE7E78iL4GikGNuC-CXrrFQ',
    alt: 'Khoang lái nội thất da cao cấp',
  },
  {
    title: 'Hàng ghế thương gia',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqy4cObSUVZnqjMRL1B8RfcEZJozRrC_fMlqyW5drlIvY2lF3s4wGCj3JIMMm7GPKXNyKeCJjs1jZpr8a_EUt8cBPBvfFwAm-Ri33kA5g0au87-C5VcyZ_zsDGyB4LPa-QOJTYegmS-komPDRiYn5Osb1Jq_2fifBzkRSPGFY4PEj6ZDzcK5A9qMxBDG193bDpckkVyQSt4qVGMgBOLBddKhsgSWTLlJ66lx5cj_aCnVC3Fu06POlWBQ',
    alt: 'Hàng ghế thương gia & cửa sổ trời',
  },
];

const DEFAULT_HERO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCwyohARkv5-GwVPDP65pY52exSc9eaSReMzt6N_H_dX6c6rjD3qWj3UFzyd5ENrZlD-7ykbbSRzy9J5PIipw6jUznzheEeZGNlrfD53_M6p0ufKaneFFl9r2u2UlBmY3CbcT3O_DBp4Zj84VoJg1_GHNicG77wIztRUVS3BAfq2SGslaCD6-vfz8Z0rS8EDPntNj7sMS2Psc3rckmQqGVZtn9XCjZjPDaT6Ze_e6_ToqqDH_TL1rXX4Q';

export default function CarDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Gallery State
  const [currentGalleryIdx, setCurrentGalleryIdx] = useState(0);
  const [activeImg, setActiveImg] = useState(DEFAULT_HERO_IMG);

  // Booking pricing mode
  const [pricingMode, setPricingMode] = useState('daily'); // 'daily' | 'hourly'
  const [bookingSuccessModal, setBookingSuccessModal] = useState(false);

  // Dates
  const [pickupDate, setPickupDate] = useState('26/10/2025');
  const [pickupTime, setPickupTime] = useState('08:00');
  const [returnDate, setReturnDate] = useState('28/10/2025');
  const [returnTime, setReturnTime] = useState('08:00');

  // Handle gallery change
  const selectThumbnail = (idx) => {
    setCurrentGalleryIdx(idx);
    setActiveImg(GALLERY_IMAGES[idx].src);
  };

  const handlePrevImg = () => {
    const nextIdx = (currentGalleryIdx - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
    selectThumbnail(nextIdx);
  };

  const handleNextImg = () => {
    const nextIdx = (currentGalleryIdx + 1) % GALLERY_IMAGES.length;
    selectThumbnail(nextIdx);
  };

  // Pricing formula values
  const isDaily = pricingMode === 'daily';
  const unitRateText = isDaily ? '1.950.000₫' : '195.000₫';
  const unitText = isDaily ? '/ngày' : '/giờ';
  const minDurationText = isDaily ? '24 giờ (1 ngày)' : '4 giờ';
  const durationFormulaText = isDaily ? '2 ngày (48 giờ)' : '10 giờ';
  const totalAmountText = isDaily ? '3.900.000₫' : '1.950.000₫';

  return (
    <div className="w-full bg-background min-h-screen">
      {/* Top Ambient Glow and Breadcrumbs Bar */}
      <section className="relative w-full bg-surface-container-lowest px-margin-sm md:px-margin pt-space-md pb-space-sm border-b border-surface-container-high/60">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant flex-wrap"
          >
            <Link className="hover:text-primary transition-colors flex items-center gap-1" to="/">
              <span className="material-symbols-outlined text-[16px]">home</span>
              Trang chủ
            </Link>
            <span className="text-outline-variant text-[14px]">/</span>
            <Link className="hover:text-primary transition-colors" to="/trip">
              Khám phá xe
            </Link>
            <span className="text-outline-variant text-[14px]">/</span>
            <span className="text-primary font-medium">VinFast VF 9 Plus AWD</span>
          </nav>
          <Link
            className="inline-flex items-center gap-1 font-label-md text-label-md text-secondary hover:text-primary-fixed transition-colors"
            to="/trip"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Quay lại kết quả tìm kiếm
          </Link>
        </div>
      </section>

      {/* Page Core Wrapper */}
      <div className="relative w-full px-margin-sm md:px-margin py-space-lg">
        {/* Subtle Ambient Backdrop Gradient Glows */}
        <div className="absolute top-12 left-1/4 w-[420px] h-[420px] bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
        <div className="absolute top-96 right-10 w-[500px] h-[500px] bg-secondary-container/10 rounded-full blur-[180px] pointer-events-none -z-10"></div>

        <div className="max-w-[1360px] mx-auto flex flex-col gap-space-lg">
          {/* Vehicle Header Section */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-sm">
            <div className="space-y-space-xs">
              {/* Status Badges */}
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-primary-container/40 text-on-primary-container font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                  <span className="material-symbols-outlined text-[14px] text-secondary">bolt</span>
                  XE ĐIỆN HẠNG SANG
                </span>
                <div className="inline-flex items-center gap-2 px-space-sm py-0.5 rounded-full bg-surface-container-high/80 text-primary font-label-sm text-label-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                  </span>
                  Còn lịch trống trong khung giờ tìm kiếm
                </div>
              </div>

              {/* Vehicle Title */}
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mt-space-xs">
                VinFast VF 9 Plus AWD{' '}
                <span className="font-normal text-secondary text-[32px]">(402 HP)</span>
              </h1>

              {/* Subline Metadata */}
              <div className="flex items-center gap-space-md text-on-surface-variant font-body-sm text-body-sm flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px] text-primary">location_on</span>
                  Khu vực: Thảo Điền, TP. Thủ Đức, TP.HCM
                </span>
                <span className="text-outline-variant">•</span>
                <span className="inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px] text-primary">event</span>
                  Đời xe: 2024
                </span>
                <span className="text-outline-variant">•</span>
                <span className="inline-flex items-center gap-1 text-on-surface font-medium">
                  <span
                    className="material-symbols-outlined text-[18px] text-tertiary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <strong className="text-tertiary">5.0</strong>
                  <span className="text-on-surface-variant font-normal">(38 lượt thuê hoàn tất)</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-space-xs shrink-0 self-start md:self-auto">
              <button
                className="inline-flex items-center gap-1.5 px-space-md py-space-sm rounded-full bg-surface-container-high text-on-surface hover:text-primary hover:bg-surface-variant transition-all font-label-md text-label-md shadow-sm cursor-pointer"
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  alert('Đã sao chép link xe vào clipboard!');
                }}
              >
                <span className="material-symbols-outlined text-[18px]">share</span>
                Chia sẻ
              </button>
              <button
                className="inline-flex items-center gap-1.5 px-space-md py-space-sm rounded-full bg-surface-container-high/60 text-on-surface-variant hover:text-error transition-all font-label-md text-label-md shadow-sm cursor-pointer"
                title="Báo cáo tin đăng nếu có sai lệch"
                type="button"
                onClick={() => alert('Đã tiếp nhận phản hồi kiểm tra thông tin xe.')}
              >
                <span className="material-symbols-outlined text-[18px]">flag</span>
                Báo cáo
              </button>
            </div>
          </section>

          {/* High-End Studio Vehicle Gallery */}
          <section className="flex flex-col gap-space-sm">
            <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-xl overflow-hidden bg-surface-container shadow-2xl group">
              {/* Main Hero Image Display */}
              <img
                alt="VinFast VF 9 Plus AWD Studio"
                className="w-full h-full object-cover object-center transition-all duration-500 ease-out"
                id="mainShowcaseImg"
                src={activeImg}
              />

              {/* Gradient Overlay Scrim for cinematic depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-surface-container-lowest/20 to-transparent pointer-events-none"></div>

              {/* Top Status Badges on Image */}
              <div className="absolute top-space-md left-space-md flex items-center gap-space-xs">
                <div className="inline-flex items-center gap-1.5 px-space-md py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-md text-on-surface font-label-sm text-label-sm shadow-md">
                  <span className="material-symbols-outlined text-[16px] text-primary">photo_library</span>
                  Thư viện 12 ảnh thực tế
                </div>
                <div className="inline-flex items-center gap-1.5 px-space-md py-1 rounded-full bg-primary-container/80 backdrop-blur-md text-on-primary-container font-label-sm text-label-sm font-semibold shadow-md">
                  <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
                  Đảm bảo đúng xe 100% khi nhận
                </div>
              </div>

              {/* Quick Navigation controls over image */}
              <div className="absolute right-space-md bottom-space-md flex items-center gap-space-xs">
                <button
                  className="w-10 h-10 rounded-full bg-surface-container-lowest/70 backdrop-blur-md text-on-surface hover:text-secondary flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md cursor-pointer"
                  onClick={handlePrevImg}
                  type="button"
                  title="Ảnh trước"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <button
                  className="w-10 h-10 rounded-full bg-surface-container-lowest/70 backdrop-blur-md text-on-surface hover:text-secondary flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md cursor-pointer"
                  onClick={handleNextImg}
                  type="button"
                  title="Ảnh tiếp"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Interactive Thumbnail Strip */}
            <div className="grid grid-cols-4 gap-space-sm">
              {GALLERY_IMAGES.map((img, idx) => {
                const isSelected = currentGalleryIdx === idx;
                return (
                  <button
                    key={idx}
                    className={`thumb-btn relative aspect-[16/9] rounded-lg overflow-hidden bg-surface-container-high transition-all group focus:outline-none cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-secondary shadow-lg opacity-100'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    onClick={() => selectThumbnail(idx)}
                    type="button"
                  >
                    <img
                      alt={img.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      src={img.src}
                    />
                    <span className="absolute inset-x-0 bottom-0 py-1 bg-surface-container-lowest/80 text-on-surface font-label-sm text-label-sm text-center truncate px-1">
                      {img.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Two-Column Main Content (65% Left / 35% Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start pt-space-xs">
            {/* ======================= LEFT COLUMN (65%) ======================= */}
            <div className="lg:col-span-8 flex flex-col gap-space-xl">
              {/* Section A: Thông số kỹ thuật cốt lõi */}
              <section className="bg-surface-container/60 backdrop-blur-xl p-space-lg rounded-xl shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-space-md">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-secondary text-[24px]">tune</span>
                    <h2 className="font-headline-md text-headline-md text-on-surface">
                      Thông số kỹ thuật cốt lõi
                    </h2>
                  </div>
                  <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
                    Tiêu chuẩn châu Âu
                  </span>
                </div>

                {/* 6 Elegant Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-sm">
                  {/* Card 1 */}
                  <div className="p-space-md rounded-lg bg-surface-container-high/60 hover:bg-surface-variant transition-all duration-200 flex flex-col gap-space-xs shadow-sm hover:-translate-y-0.5">
                    <div className="flex items-center gap-1.5 text-primary">
                      <span className="material-symbols-outlined text-[20px]">
                        airline_seat_recline_extra
                      </span>
                      <span className="font-label-md text-label-md text-on-surface-variant">
                        Số chỗ ngồi
                      </span>
                    </div>
                    <span className="font-body-md text-body-md font-semibold text-on-surface">
                      7 Chỗ (Cơ trưởng)
                    </span>
                  </div>

                  {/* Card 2 */}
                  <div className="p-space-md rounded-lg bg-surface-container-high/60 hover:bg-surface-variant transition-all duration-200 flex flex-col gap-space-xs shadow-sm hover:-translate-y-0.5">
                    <div className="flex items-center gap-1.5 text-primary">
                      <span className="material-symbols-outlined text-[20px]">settings_suggest</span>
                      <span className="font-label-md text-label-md text-on-surface-variant">Hộp số</span>
                    </div>
                    <span className="font-body-md text-body-md font-semibold text-on-surface">
                      Tự động điện tử
                    </span>
                  </div>

                  {/* Card 3 */}
                  <div className="p-space-md rounded-lg bg-surface-container-high/60 hover:bg-surface-variant transition-all duration-200 flex flex-col gap-space-xs shadow-sm hover:-translate-y-0.5">
                    <div className="flex items-center gap-1.5 text-primary">
                      <span className="material-symbols-outlined text-[20px]">all_inclusive</span>
                      <span className="font-label-md text-label-md text-on-surface-variant">
                        Hệ dẫn động
                      </span>
                    </div>
                    <span className="font-body-md text-body-md font-semibold text-on-surface">
                      AWD 2 Cầu toàn thời gian
                    </span>
                  </div>

                  {/* Card 4 */}
                  <div className="p-space-md rounded-lg bg-surface-container-high/60 hover:bg-surface-variant transition-all duration-200 flex flex-col gap-space-xs shadow-sm hover:-translate-y-0.5">
                    <div className="flex items-center gap-1.5 text-primary">
                      <span className="material-symbols-outlined text-[20px]">electric_bolt</span>
                      <span className="font-label-md text-label-md text-on-surface-variant">
                        Động cơ & Nhiên liệu
                      </span>
                    </div>
                    <span className="font-body-md text-body-md font-semibold text-on-surface">
                      Thuần điện (Dual 402 HP)
                    </span>
                  </div>

                  {/* Card 5 */}
                  <div className="p-space-md rounded-lg bg-surface-container-high/60 hover:bg-surface-variant transition-all duration-200 flex flex-col gap-space-xs shadow-sm hover:-translate-y-0.5">
                    <div className="flex items-center gap-1.5 text-primary">
                      <span className="material-symbols-outlined text-[20px]">route</span>
                      <span className="font-label-md text-label-md text-on-surface-variant">
                        Tầm hoạt động
                      </span>
                    </div>
                    <span className="font-body-md text-body-md font-semibold text-on-surface">
                      438 km (Chuẩn WLTP)
                    </span>
                  </div>

                  {/* Card 6 */}
                  <div className="p-space-md rounded-lg bg-surface-container-high/60 hover:bg-surface-variant transition-all duration-200 flex flex-col gap-space-xs shadow-sm hover:-translate-y-0.5">
                    <div className="flex items-center gap-1.5 text-primary">
                      <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                      <span className="font-label-md text-label-md text-on-surface-variant">
                        Năm sản xuất
                      </span>
                    </div>
                    <span className="font-body-md text-body-md font-semibold text-on-surface">
                      2024 (Đời mới nhất)
                    </span>
                  </div>
                </div>
              </section>

              {/* Section B: Tiện nghi & Công nghệ nổi bật */}
              <section className="bg-surface-container/60 backdrop-blur-xl p-space-lg rounded-xl shadow-lg">
                <div className="flex items-center gap-space-xs mb-space-md">
                  <span className="material-symbols-outlined text-secondary text-[24px]">
                    verified_user
                  </span>
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    Tiện nghi & Công nghệ nổi bật
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                  {[
                    { icon: 'smart_toy', text: 'Trợ lái nâng cao ADAS Cấp 2' },
                    { icon: 'tv', text: 'Màn hình giải trí 15.6 inch OLED' },
                    { icon: 'speaker', text: 'Âm thanh 13 loa vòm cao cấp' },
                    { icon: 'spa', text: 'Ghế massage & sưởi / làm mát' },
                    { icon: 'roofing', text: 'Cửa sổ trời Panoramics Panorama' },
                    { icon: 'battery_charging_full', text: 'Sạc điện thoại không dây chuẩn Qi' },
                    { icon: 'videocam', text: 'Camera 360 độ 3D sắc nét đa hướng' },
                    { icon: 'sensor_door', text: 'Cốp điện thông minh mở rảnh tay' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container-high/40 hover:bg-surface-container-high transition-colors"
                    >
                      <span className="material-symbols-outlined text-secondary text-[22px] p-2 rounded-md bg-surface-container-lowest">
                        {item.icon}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface font-medium">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section C: Vị trí & Hướng dẫn bàn giao xe */}
              <section className="bg-surface-container/60 backdrop-blur-xl p-space-lg rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-space-md">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-secondary text-[24px]">pin_drop</span>
                    <h2 className="font-headline-md text-headline-md text-on-surface">
                      Vị trí & Hướng dẫn bàn giao xe
                    </h2>
                  </div>
                  <span className="font-label-sm text-label-sm px-space-sm py-0.5 rounded-full bg-secondary/15 text-secondary font-semibold">
                    Giao nhanh tận nơi
                  </span>
                </div>

                {/* Interactive Styled Location Container with SVG Map */}
                <div className="relative w-full h-56 rounded-lg overflow-hidden mb-space-md bg-surface-container-high shadow-md">
                  <div
                    className="w-full h-full relative bg-surface-container-lowest overflow-hidden"
                    data-location="Masteri Thao Dien, 159 Xa lo Ha Noi, TP. Thu Duc, TP.HCM"
                  >
                    <svg className="w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 240">
                      <defs>
                        <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#176d5c" stopOpacity="0.6"></stop>
                          <stop offset="100%" stopColor="#00413a" stopOpacity="0.8"></stop>
                        </linearGradient>
                      </defs>
                      <rect width="800" height="240" fill="#061f1d"></rect>
                      <path
                        d="M-20,60 C120,40 180,140 320,110 C460,80 520,190 820,150 L820,240 L-20,240 Z"
                        fill="url(#riverGrad)"
                      ></path>
                      <text
                        x="160"
                        y="180"
                        fill="#4adcc8"
                        fontSize="12"
                        fontFamily="Be Vietnam Pro"
                        fontWeight="600"
                        opacity="0.6"
                        letterSpacing="2"
                      >
                        SÔNG SÀI GÒN
                      </text>
                      <path d="M0,90 L800,70" stroke="#213937" strokeWidth="6" strokeLinecap="round"></path>
                      <text x="480" y="62" fill="#88938f" fontSize="11" fontFamily="Be Vietnam Pro">
                        Xa lộ Hà Nội (Võ Nguyên Giáp)
                      </text>
                      <path d="M240,0 L240,240" stroke="#162e2c" strokeWidth="4"></path>
                      <path d="M420,0 L410,240" stroke="#213937" strokeWidth="5" strokeDasharray="6,4"></path>
                      <text x="425" y="220" fill="#88d5c0" fontSize="10" fontFamily="Be Vietnam Pro">
                        Tuyến Metro số 1 (Bến Thành - Suối Tiên)
                      </text>
                      <path d="M600,0 L570,240" stroke="#162e2c" strokeWidth="3"></path>
                      <circle cx="412" cy="75" r="5" fill="#ffb95f"></circle>
                      <text x="422" y="80" fill="#ffd6a8" fontSize="11" fontFamily="Be Vietnam Pro" fontWeight="500">
                        Ga Metro Thảo Điền
                      </text>
                    </svg>

                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-surface-container-lowest/30 to-transparent pointer-events-none"></div>

                    <div className="absolute inset-0 flex items-center justify-center p-space-md pointer-events-none">
                      <div className="bg-surface-container-lowest/95 px-space-md py-space-sm rounded-full flex items-center gap-2 shadow-2xl border border-secondary/30 backdrop-blur-md">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
                        </span>
                        <span className="material-symbols-outlined text-secondary text-[20px]">
                          location_on
                        </span>
                        <span className="font-label-md text-label-md text-on-surface font-semibold">
                          Masteri Thảo Điền, 159 Võ Nguyên Giáp (Xa lộ Hà Nội), TP. Thủ Đức, TP.HCM
                        </span>
                      </div>
                    </div>

                    <div className="absolute bottom-2 left-3 text-[11px] font-label-sm text-on-surface-variant flex items-center gap-1 bg-surface-container-lowest/80 px-2 py-0.5 rounded">
                      <span className="material-symbols-outlined text-[13px] text-primary">near_me</span>
                      Bản đồ minh họa khu vực nhận xe • Thảo Điền, TP. Thủ Đức, TP.HCM
                    </div>
                  </div>
                </div>

                <div className="space-y-space-sm font-body-sm text-body-sm">
                  <div className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-high/40">
                    <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
                      location_on
                    </span>
                    <div>
                      <strong className="text-on-surface">Địa chỉ cụ thể:</strong>
                      <p className="text-on-surface text-opacity-90 leading-relaxed font-body-sm">
                        Sảnh Tháp T5, Masteri Thảo Điền, 159 Võ Nguyên Giáp (Xa lộ Hà Nội), P. Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-high/40">
                    <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                      electric_car
                    </span>
                    <div>
                      <strong className="text-on-surface">Chính sách nhận bàn giao xe:</strong>
                      <p className="text-on-surface text-opacity-90 leading-relaxed font-body-sm">
                        Chủ xe hỗ trợ giao xe tận nơi miễn phí trong bán kính 5km hoặc đón trực tiếp tại ga Metro Thảo Điền (Tuyến Metro số 1). Xe được rửa sạch sẽ trước khi bàn giao, pin được sạc tối thiểu 85% kèm đầy đủ bộ dây sạc di động 3.5kW dự phòng.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section D: Điều khoản & Quy định thuê xe tự lái */}
              <section className="bg-surface-container/60 backdrop-blur-xl p-space-lg rounded-xl shadow-lg">
                <div className="flex items-center gap-space-xs mb-space-md">
                  <span className="material-symbols-outlined text-secondary text-[24px]">gavel</span>
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    Điều khoản & Quy định thuê xe
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                  <div className="p-space-md rounded-lg bg-surface-container-high/40 flex flex-col gap-space-xs">
                    <div className="flex items-center gap-1.5 text-primary">
                      <span className="material-symbols-outlined text-[20px]">badge</span>
                      <span className="font-label-lg text-label-lg font-semibold text-on-surface">
                        Yêu cầu giấy tờ
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface text-opacity-90 leading-relaxed">
                      Căn cước công dân gắn chip (CCCD) và Giấy phép lái xe hạng B1/B2 còn hiệu lực ít nhất 6 tháng (xuất trình bản gốc để đối chiếu khi ký nhận xe).
                    </p>
                  </div>

                  <div className="p-space-md rounded-lg bg-surface-container-high/40 flex flex-col gap-space-xs">
                    <div className="flex items-center gap-1.5 text-primary">
                      <span className="material-symbols-outlined text-[20px]">speed</span>
                      <span className="font-label-lg text-label-lg font-semibold text-on-surface">
                        Quy định vận hành
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface text-opacity-90 leading-relaxed">
                      Nghiêm cấm hút thuốc bên trong cabin. Giới hạn 300 km/ngày (phụ phí 3.000₫/km phát sinh). Giữ vệ sinh chung và sạc tại các trụ sạc tương thích.
                    </p>
                  </div>

                  <div className="p-space-md rounded-lg bg-surface-container-high/40 flex flex-col gap-space-xs">
                    <div className="flex items-center gap-1.5 text-tertiary">
                      <span className="material-symbols-outlined text-[20px]">
                        account_balance_wallet
                      </span>
                      <span className="font-label-lg text-label-lg font-semibold text-on-surface">
                        Tài sản thế chấp
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface text-opacity-90 leading-relaxed">
                      Đặt cọc 15.000.000₫ (tiền mặt / chuyển khoản) hoặc xe máy chính chủ kèm cavet gốc. Tiền cọc hoàn trả 100% sau khi đối chiếu dữ liệu phạt nguội.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section E: Thông tin chủ xe & Đánh giá thực tế */}
              <section className="bg-surface-container/60 backdrop-blur-xl p-space-lg rounded-xl shadow-lg flex flex-col gap-space-lg">
                {/* Owner info banner */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md pb-space-md border-b border-surface-container-high">
                  <div className="flex items-center gap-space-md">
                    <div className="relative">
                      <img
                        alt="Chủ xe Nguyễn Minh Đức"
                        className="w-16 h-16 rounded-full object-cover shadow-lg"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6ch6JfyMkkcdQ--nOxjZZNbt8GiwGpGom6dsxaJv91fN_I3i9E1mgKiPHdYdzDEZn5Kk7Lgqa8cVhir3KlqAYGA5fN3f0pSsZ5zqh51uniemAZBByv6bh9H2CUsf0dba1n44mXlCd5STWsYakxF-u8rcTfI6d70nV5buM5yPGGwsyTMYjGQ6KdwXJ3ttqUY3SiBprETv-_zByemgZrvuv4LnWzhkFxUe6TloVcPmIY0YUXHa1FtuYqg"
                      />
                      <span
                        className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-secondary ring-2 ring-surface-container-lowest"
                        title="Đang trực tuyến"
                      ></span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface">
                          Nguyễn Minh Đức
                        </h3>
                        <span
                          className="material-symbols-outlined text-[18px] text-secondary"
                          title="Chủ xe đã xác thực tài khoản & thông tin xe"
                        >
                          verified
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-2 flex-wrap">
                        <span>Chủ xe 5 sao</span>
                        <span>•</span>
                        <span className="text-primary flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[14px]">verified</span>
                          Đã xác thực tài khoản & thông tin xe
                        </span>
                        <span>•</span>
                        <span>Thời gian tham gia: 2 năm</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-space-md">
                    <div className="text-right whitespace-nowrap shrink-0">
                      <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">
                        Tỉ lệ phản hồi
                      </span>
                      <span className="font-headline-sm text-headline-sm text-secondary font-bold whitespace-nowrap">
                        100% (5 phút)
                      </span>
                    </div>
                    <button
                      className="px-space-md py-space-sm rounded-full bg-surface-container-high text-on-surface hover:text-primary transition-colors font-label-md text-label-md flex items-center gap-1 cursor-pointer"
                      type="button"
                      onClick={() => alert('Đang kết nối tin nhắn trực tiếp với chủ xe Nguyễn Minh Đức...')}
                    >
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                      Nhắn tin
                    </button>
                  </div>
                </div>

                {/* Real customer reviews */}
                <div className="flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <h4 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                      Đánh giá từ khách thuê
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                        38 lượt
                      </span>
                    </h4>
                    <div className="flex items-center gap-1 text-tertiary">
                      <span
                        className="material-symbols-outlined text-[20px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                        5.0 / 5.0
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    {/* Review 1 */}
                    <div className="p-space-md rounded-lg bg-surface-container-high/40 flex flex-col justify-between gap-space-sm">
                      <div className="space-y-space-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-semibold flex items-center justify-center font-label-md text-label-md">
                              HL
                            </span>
                            <div>
                              <strong className="font-body-sm text-body-sm text-on-surface block">
                                Hoàng Long
                              </strong>
                              <span className="font-label-sm text-label-sm text-on-surface-variant">
                                Tháng 10/2025
                              </span>
                            </div>
                          </div>
                          <div className="flex text-tertiary">
                            {[...Array(5)].map((_, idx) => (
                              <span
                                key={idx}
                                className="material-symbols-outlined text-[16px]"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                star
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                          "Xe mới tinh, giao đúng hẹn. Anh chủ nhiệt tình hướng dẫn các tính năng trợ lái ADAS chi tiết. Trải nghiệm xe điện VinFast VF 9 trên cao tốc rất đầm chắc, cách âm ấn tượng."
                        </p>
                      </div>
                      <span className="font-label-sm text-label-sm text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Thuê chuyến đi TP.HCM - Phan Thiết (Cao tốc Dầu Giây)
                      </span>
                    </div>

                    {/* Review 2 */}
                    <div className="p-space-md rounded-lg bg-surface-container-high/40 flex flex-col justify-between gap-space-sm">
                      <div className="space-y-space-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container font-semibold flex items-center justify-center font-label-md text-label-md">
                              TT
                            </span>
                            <div>
                              <strong className="font-body-sm text-body-sm text-on-surface block">
                                Trần Thu Trang
                              </strong>
                              <span className="font-label-sm text-label-sm text-on-surface-variant">
                                Tháng 09/2025
                              </span>
                            </div>
                          </div>
                          <div className="flex text-tertiary">
                            {[...Array(5)].map((_, idx) => (
                              <span
                                key={idx}
                                className="material-symbols-outlined text-[16px]"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                star
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                          "Nội thất da thơm và cực kỳ sạch sẽ. Pin đã được sạc đầy 100% trước khi giao. Gia đình tôi 7 người đi dã ngoại cuối tuần đều ngồi rất thoải mái và êm ái."
                        </p>
                      </div>
                      <span className="font-label-sm text-label-sm text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Thuê du lịch gia đình TP.HCM - Vũng Tàu 3 ngày
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* ======================= RIGHT COLUMN (35% Sticky Booking Panel) ======================= */}
            <aside className="lg:col-span-4 sticky top-24 self-start w-full">
              <div className="bg-surface-container-low/90 backdrop-blur-2xl rounded-2xl p-space-lg shadow-2xl relative overflow-hidden flex flex-col gap-space-md border border-surface-container-high/40">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

                {/* Header & Rental Mode Tabs */}
                <div className="space-y-space-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      Tính giá & Lịch trống
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-label-sm text-label-sm font-semibold uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span> Slot khả dụng
                    </span>
                  </div>

                  {/* Rental Type Toggle Tabs */}
                  <div className="grid grid-cols-2 p-1 rounded-xl bg-surface-container-high/80 mt-space-sm" role="tablist">
                    <button
                      className={`py-2 text-center rounded-lg font-label-md text-label-md transition-all flex flex-col items-center justify-center cursor-pointer ${
                        pricingMode === 'daily'
                          ? 'bg-primary-container text-on-primary-container font-semibold shadow-md'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                      onClick={() => setPricingMode('daily')}
                      type="button"
                    >
                      <span>Thuê theo ngày</span>
                      <span className="text-[10px] opacity-80 font-normal">Tối thiểu 1 ngày</span>
                    </button>
                    <button
                      className={`py-2 text-center rounded-lg font-label-md text-label-md transition-all flex flex-col items-center justify-center cursor-pointer ${
                        pricingMode === 'hourly'
                          ? 'bg-primary-container text-on-primary-container font-semibold shadow-md'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                      onClick={() => setPricingMode('hourly')}
                      type="button"
                    >
                      <span>Thuê theo giờ</span>
                      <span className="text-[10px] opacity-80 font-normal">Tối thiểu 4 giờ</span>
                    </button>
                  </div>
                </div>

                {/* Price Display Rate */}
                <div className="flex items-baseline justify-between p-space-sm bg-surface-container-high/40 rounded-xl">
                  <div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">
                      Đơn giá thuê niêm yết
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display-hero-mobile text-display-hero-mobile text-secondary font-bold">
                        {unitRateText}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {unitText}
                      </span>
                    </div>
                  </div>
                  <div className="text-right whitespace-nowrap shrink-0">
                    <span className="font-label-sm text-label-sm text-primary font-semibold">
                      Thời gian tối thiểu
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant block">
                      {minDurationText}
                    </span>
                  </div>
                </div>

                {/* Schedule Date & Time Form Inputs */}
                <div className="space-y-space-xs">
                  <div className="flex items-center justify-between font-label-md text-label-md text-on-surface font-semibold">
                    <span>Khung giờ nhận & trả xe</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">
                      Múi giờ GMT+7
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
                    {/* Pickup Slot */}
                    <div className="p-space-sm rounded-xl bg-surface-container-high/60 flex flex-col gap-1">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Nhận xe</span>
                      <div className="flex items-center gap-1 font-label-md text-label-md text-on-surface font-medium">
                        <span className="material-symbols-outlined text-[16px] text-primary">
                          calendar_today
                        </span>
                        <input
                          className="bg-surface-container-lowest/80 text-on-surface rounded px-1.5 py-0.5 text-[12px] font-medium border-none outline-none w-24 cursor-pointer"
                          type="text"
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                        />
                        <input
                          className="bg-surface-container-lowest/80 text-on-surface rounded px-1 py-0.5 text-[12px] font-medium border-none outline-none w-14 text-center cursor-pointer"
                          type="text"
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Return Slot */}
                    <div className="p-space-sm rounded-xl bg-surface-container-high/60 flex flex-col gap-1">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Trả xe</span>
                      <div className="flex items-center gap-1 font-label-md text-label-md text-on-surface font-medium">
                        <span className="material-symbols-outlined text-[16px] text-secondary">
                          calendar_today
                        </span>
                        <input
                          className="bg-surface-container-lowest/80 text-on-surface rounded px-1.5 py-0.5 text-[12px] font-medium border-none outline-none w-24 cursor-pointer"
                          type="text"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                        />
                        <input
                          className="bg-surface-container-lowest/80 text-on-surface rounded px-1 py-0.5 text-[12px] font-medium border-none outline-none w-14 text-center cursor-pointer"
                          type="text"
                          value={returnTime}
                          onChange={(e) => setReturnTime(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Car Slot Availability Timeline Indicator */}
                  <div className="p-space-sm rounded-xl bg-surface-container-high/40 space-y-1.5">
                    <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Lịch trống slot: 26/10 - 28/10
                      </span>
                      <span className="text-error font-medium text-[11px] flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[13px]">block</span>
                        Đã bận: 29/10 (08:00 - 18:00)
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-surface-container-high flex overflow-hidden">
                      <div className="bg-secondary h-full w-2/3" title="Khung giờ khả dụng đã chọn"></div>
                      <div className="bg-error/70 h-full w-1/3" title="Khoảng thời gian đã có người đặt trước"></div>
                    </div>

                    <div className="flex items-center gap-1.5 text-primary text-label-sm text-label-sm pt-0.5">
                      <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
                      <span className="text-on-surface font-medium">
                        Khoảng thời gian đã chọn: <strong className="text-secondary">{durationFormulaText}</strong> - Khả dụng ngay.
                      </span>
                    </div>

                    <div className="mt-1 p-2 rounded-lg bg-surface-container-lowest/90 border border-error/40 flex items-start gap-1.5 text-[11px] text-error">
                      <span className="material-symbols-outlined text-[15px] shrink-0 mt-0.5">error</span>
                      <span>
                        Lưu ý kiểm tra lịch: Nếu chọn dời sang ngày 29/10: <em>"Thời gian này đã có người đặt. Vui lòng chọn thời gian khác."</em>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transparent Price Breakdown Table */}
                <div className="p-space-md rounded-xl bg-surface-container-high/40 space-y-space-sm">
                  <div className="flex items-center justify-between pb-1 border-b border-surface-variant font-label-md text-label-md">
                    <span className="text-on-surface font-semibold">Chi tiết giá thuê</span>
                    <span className="text-primary text-[11px] font-medium">Biểu phí minh bạch 100%</span>
                  </div>
                  <div className="flex items-center justify-between font-body-sm text-body-sm">
                    <span className="text-on-surface text-opacity-90">1. Đơn giá thuê</span>
                    <span className="font-medium text-on-surface">
                      {unitRateText} {unitText}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-body-sm text-body-sm">
                    <span className="text-on-surface text-opacity-90">2. Thời lượng tính phí</span>
                    <span className="font-medium text-on-surface">{durationFormulaText}</span>
                  </div>
                  <div className="flex items-center justify-between font-body-sm text-body-sm">
                    <span className="text-on-surface text-opacity-90">3. Tiền thuê xe (Đơn giá × Thời lượng)</span>
                    <span className="font-semibold text-on-surface">{totalAmountText}</span>
                  </div>
                  <div className="flex items-center justify-between font-body-sm text-body-sm">
                    <span className="text-on-surface text-opacity-90">4. Giảm giá</span>
                    <span className="font-medium text-secondary">- 0₫</span>
                  </div>
                  <div className="pt-space-xs border-t border-surface-variant flex items-baseline justify-between">
                    <div>
                      <span className="font-headline-sm text-headline-sm text-on-surface block">
                        5. Tổng tiền
                      </span>
                    </div>
                    <span className="font-headline-md text-headline-md font-bold text-secondary">
                      {totalAmountText}
                    </span>
                  </div>
                </div>

                {/* Refundable Deposit Alert Block */}
                <div className="p-space-sm rounded-xl bg-surface-container-lowest/80 flex items-start gap-space-sm border-none">
                  <span className="material-symbols-outlined text-tertiary text-[22px] shrink-0 mt-0.5">
                    shield
                  </span>
                  <div className="space-y-0.5 text-on-surface">
                    <div className="flex items-center gap-1.5 flex-wrap font-label-md text-label-md text-tertiary font-bold">
                      <span>Tiền cọc thế chấp hoàn lại:</span>
                      <span>15.000.000₫</span>
                    </div>
                    <p className="font-label-sm text-label-sm leading-relaxed text-on-surface text-opacity-90">
                      Khoản cọc giữ riêng khi nhận xe, hoàn trả 100% sau khi đối chiếu vi phạm giao thông / phạt nguội.{' '}
                      <strong>Tuyệt đối không cộng gộp vào tổng tiền thuê xe.</strong>
                    </p>
                  </div>
                </div>

                {/* CTA Action Button */}
                <div className="space-y-space-xs pt-space-xs">
                  <button
                    className="w-full py-3.5 px-space-lg rounded-full bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-on-secondary font-headline-sm text-headline-sm font-semibold transition-all duration-300 shadow-[0_0_24px_rgba(74,220,200,0.3)] hover:shadow-[0_0_32px_rgba(74,220,200,0.5)] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                    type="button"
                    onClick={() => setBookingSuccessModal(true)}
                  >
                    <span>Tiếp tục đặt xe</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </button>
                  <p className="font-label-sm text-label-sm text-on-surface text-opacity-90 text-center leading-normal px-space-xs bg-surface-container-high/30 py-1.5 rounded-lg">
                    <strong className="text-primary block mb-0.5">Bước tiếp theo:</strong> Soát xét hợp đồng điện tử & xác nhận từ chủ xe (chưa trừ tiền ngay).
                  </p>
                </div>

                {/* Footer Badges */}
                <div className="grid grid-cols-2 gap-space-xs pt-space-xs border-t border-surface-container-high/60 text-center font-label-sm text-label-sm text-on-surface-variant">
                  <span className="flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                    Hợp đồng điện tử
                  </span>
                  <span className="flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">support_agent</span>
                    Hỗ trợ CarDB 24/7
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {bookingSuccessModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setBookingSuccessModal(false)}
        >
          <div
            className="bg-[#061f1d] border border-secondary/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-center flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-secondary/20 border border-secondary flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>

            <h3 className="text-2xl font-bold text-on-surface">Đã gửi yêu cầu đặt xe!</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Yêu cầu đặt xe <strong className="text-primary">VinFast VF 9 Plus AWD</strong> cho khoảng thời gian{' '}
              <strong className="text-secondary">{pickupDate} - {returnDate}</strong> đã được gửi đến chủ xe Nguyễn Minh Đức.
            </p>

            <div className="w-full bg-[#0b2321] p-4 rounded-2xl border border-[#176d5c]/30 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Tổng chi phí dự kiến:</span>
                <span className="font-bold text-secondary">{totalAmountText}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Tiền cọc (hoàn lại):</span>
                <span className="font-semibold text-tertiary">15.000.000₫</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Thời gian phản hồi dự kiến:</span>
                <span className="text-primary font-medium">Trong vòng 5 phút</span>
              </div>
            </div>

            <button
              className="w-full py-3 rounded-full bg-secondary text-on-secondary-fixed font-bold text-sm shadow-lg hover:shadow-cyan-500/30 transition-all cursor-pointer"
              onClick={() => {
                setBookingSuccessModal(false);
                navigate('/trip');
              }}
            >
              Xem danh sách chuyến đi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

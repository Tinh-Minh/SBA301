import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

const ALL_CARS = [
  {
    id: 'vf9',
    name: 'VinFast VF 9 Plus AWD',
    brand: 'VINFAST',
    badge: 'XE ĐIỆN CAO CẤP',
    badgeVariant: 'secondary',
    location: 'Quận 7, TP.HCM',
    city: 'HCM',
    image:
      'https://lh3.googleusercontent.com/aida/AEtjO1Xw4bt-rA9OWQIOdudE7xaMJWFhfru-C5t8aWWeTSPaKkeLMJ0XcYp1ItvP-vRPqEiLcZ9DsAO0R8pN4RDZHZnGqInZrJDMzlFpnjZL1CIAO-vt578QyEhjzcQWprIt9qZyO-llp9misfxIdpfawTfMNYiCXoZBT7on51jpSWrTJcpY0He-sVGCVbsZtg71grx7eSEo-_7tZTDyNwz9F2qELnYUIywsE3oWyojdCBB4QU2fRbB9ciJBKRle',
    seats: 7,
    transmission: 'Tự động AWD',
    fuel: 'Thuần điện',
    priceDay: 1950000,
    priceHour: 195000,
    category: 'suv', // SUV Gầm cao
    isElectric: true,
    brandKey: 'VinFast',
    rating: 4.9,
  },
  {
    id: 'bmw530i',
    name: 'BMW 530i M Sport',
    brand: 'BMW',
    badge: 'SEDAN HẠNG SANG',
    badgeVariant: 'tertiary',
    location: 'Bình Thạnh, TP.HCM',
    city: 'HCM',
    image:
      'https://lh3.googleusercontent.com/aida/AEtjO1W85zS4EmOzoyXRocvLWonCJjV1UrUGJd--h788XGopUpcX6TBAN47eT5Jv0W-hMaQj8k0az9C5tz7HEgW5RDh6G5rwD5Q4_KpTuWl7ccMohPVEthUwaNHhg8uK0uYEopX_pcJf0kAQjHLjmjTUEAr6Waj7KsY2AkOF5XXXQviwePkjdSbpSEvJyUZgF75VcupbwrYDAf04MEqZi-JKo9rOMYgBZRQeM4NjSzL9HlAUxmwjoJv4guA3z-0',
    seats: 5,
    transmission: 'Tự động 8 cấp',
    fuel: 'Xăng Turbo',
    priceDay: 2200000,
    priceHour: 220000,
    category: 'sedan', // Sedan Đô thị
    isElectric: false,
    brandKey: 'BMW',
    rating: 4.8,
  },
  {
    id: 'macan-gts',
    name: 'Porsche Macan GTS',
    brand: 'PORSCHE',
    badge: 'SUV ĐẲNG CẤP',
    badgeVariant: 'tertiary',
    location: 'Thủ Đức, TP.HCM',
    city: 'HCM',
    image:
      'https://lh3.googleusercontent.com/aida/AEtjO1UAMcPcKTZG7ZWs5-5HoYVB2ORnWe41WHPGi47KwWLtPRwhr6CpzEEsYnzxi0l-T9Btlwd0MyAm6WOMm-fDd1LaWUhWx7Qxd8uNELwtS1NMzaX1Hyx-715ezkuL2s72-AeNlWXpcjkJYeRjapvSrYsdpNMdlP3xpoLXfVh3vRhUBb8gks-vPsbJbNkZpG0ZKlB4uzK7tN7fRxnag4jDAwPJl23jMcfy6vHrSCrqktSq8AXa3sEnDtnhFiax',
    seats: 5,
    transmission: 'PDK 7 cấp AWD',
    fuel: 'Xăng Twin-Turbo',
    priceDay: 3800000,
    priceHour: 380000,
    category: 'crossover', // Crossover Hạng sang
    isElectric: false,
    brandKey: 'Porsche',
    rating: 5.0,
  },
  {
    id: 'glc300',
    name: 'Mercedes GLC 300 4MATIC',
    brand: 'MERCEDES-BENZ',
    badge: 'SUV SANG TRỌNG',
    badgeVariant: 'primary',
    location: 'Quận 1, TP.HCM',
    city: 'HCM',
    image:
      'https://lh3.googleusercontent.com/aida/AEtjO1U7txDMRGK3-ZUtWPO_7EseResGnzsyy1oGruEUCA0N3HiJcrdc2bVd4Pfxur7o_bTPU-aUTRm_arc6JLZLnzE1_wBvMO-xhIzNufvi8EDrtgUCYqoziVOQFbCH34eMeSVjUMCWM300KVhb4MgfFsbkXcn7TUpJetVSrmnQGXvUDSogBGV1F_p2yzjdHUfdlNwIQqJ0s2h5_tOGjhy_3fg5Mx8KRcS954JRqywJQ961SkMzqQliYY1ML4fX',
    seats: 5,
    transmission: '9G-TRONIC',
    fuel: 'Mild-Hybrid',
    priceDay: 2450000,
    priceHour: 245000,
    category: 'suv',
    isElectric: false,
    brandKey: 'Mercedes',
    rating: 5.0,
  },
  {
    id: 'vf8',
    name: 'VinFast VF 8 Plus',
    brand: 'VINFAST',
    badge: 'XE ĐIỆN THÔNG MINH',
    badgeVariant: 'secondary',
    location: 'Tân Bình, TP.HCM',
    city: 'HCM',
    image:
      'https://lh3.googleusercontent.com/aida/AEtjO1Xw4bt-rA9OWQIOdudE7xaMJWFhfru-C5t8aWWeTSPaKkeLMJ0XcYp1ItvP-vRPqEiLcZ9DsAO0R8pN4RDZHZnGqInZrJDMzlFpnjZL1CIAO-vt578QyEhjzcQWprIt9qZyO-llp9misfxIdpfawTfMNYiCXoZBT7on51jpSWrTJcpY0He-sVGCVbsZtg71grx7eSEo-_7tZTDyNwz9F2qELnYUIywsE3oWyojdCBB4QU2fRbB9ciJBKRle',
    seats: 5,
    transmission: 'Tự động AWD',
    fuel: 'Thuần điện',
    priceDay: 1250000,
    priceHour: 125000,
    category: 'suv',
    isElectric: true,
    brandKey: 'VinFast',
    rating: 4.9,
  },
  {
    id: 'audi-q8',
    name: 'Audi Q8 55 TFSI',
    brand: 'AUDI',
    badge: 'SUV THƯỢNG HẠNG',
    badgeVariant: 'outline',
    location: 'Phú Nhuận, TP.HCM',
    city: 'HCM',
    image:
      'https://lh3.googleusercontent.com/aida/AEtjO1W85zS4EmOzoyXRocvLWonCJjV1UrUGJd--h788XGopUpcX6TBAN47eT5Jv0W-hMaQj8k0az9C5tz7HEgW5RDh6G5rwD5Q4_KpTuWl7ccMohPVEthUwaNHhg8uK0uYEopX_pcJf0kAQjHLjmjTUEAr6Waj7KsY2AkOF5XXXQviwePkjdSbpSEvJyUZgF75VcupbwrYDAf04MEqZi-JKo9rOMYgBZRQeM4NjSzL9HlAUxmwjoJv4guA3z-0',
    seats: 5,
    transmission: 'Tiptronic AWD',
    fuel: 'V6 Turbo',
    priceDay: 3100000,
    priceHour: 310000,
    category: 'suv',
    isElectric: false,
    brandKey: 'Audi',
    rating: 4.9,
  },
];

export default function ExploreCarsPage() {
  // Filters state
  const [selectedCityPill, setSelectedCityPill] = useState('HCM');
  const [selectedCities, setSelectedCities] = useState({
    HCM: true,
    HN: false,
    DN: false,
    CT: false,
    HP: false,
  });
  const [selectedTypes, setSelectedTypes] = useState({
    suv: true,
    sedan: false,
    crossover: false,
    ev: true,
  });
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [selectedSeats, setSelectedSeats] = useState(5);
  const [transmissionFilter, setTransmissionFilter] = useState({
    at: true,
    mt: false,
    awd: true,
  });
  const [fuelFilter, setFuelFilter] = useState({
    ev: true,
    gasoline: true,
    diesel: false,
    hybrid: false,
  });
  const [brandFilter, setBrandFilter] = useState({
    VinFast: true,
    BMW: true,
    Porsche: true,
    Mercedes: true,
    Audi: false,
    Hyundai: false,
  });
  const [sortBy, setSortBy] = useState('recommended');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCarModal, setSelectedCarModal] = useState(null);

  // Toggle helpers
  const handleCityToggle = (key) => {
    setSelectedCities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTypeToggle = (key) => {
    setSelectedTypes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleBrandToggle = (key) => {
    setBrandFilter((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetFilters = () => {
    setSelectedCities({ HCM: true, HN: false, DN: false, CT: false, HP: false });
    setSelectedTypes({ suv: true, sedan: false, crossover: false, ev: true });
    setMaxPrice(5000000);
    setSelectedSeats(5);
    setBrandFilter({
      VinFast: true,
      BMW: true,
      Porsche: true,
      Mercedes: true,
      Audi: false,
      Hyundai: false,
    });
  };

  // Filtered & sorted cars
  const displayedCars = useMemo(() => {
    let list = [...ALL_CARS];

    // Filter by price
    list = list.filter((car) => car.priceDay <= maxPrice);

    // Sort
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.priceDay - b.priceDay);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.priceDay - a.priceDay);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [maxPrice, sortBy]);

  return (
    <div className="flex flex-col w-full">
      {/* SEARCH HERO / CONTROLS SECTION */}
      <section className="relative w-full overflow-hidden bg-[#061f1d]/85 py-8 px-6 md:px-10 border-b border-[#176d5c]/20">
        <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[130px]"></div>
        <div className="pointer-events-none absolute top-10 right-10 h-72 w-72 rounded-full bg-secondary/10 blur-[110px]"></div>

        <div className="relative mx-auto flex w-full max-w-[1400px] flex-col gap-6">
          {/* Breadcrumb & Header Title */}
          <div className="flex flex-col gap-2">
            <nav className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">
              <Link className="transition-colors hover:text-primary" to="/">
                Trang chủ
              </Link>
              <span className="text-outline">/</span>
              <span className="font-semibold text-primary">Khám phá xe</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <div>
                <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                  Khám phá xe <span className="text-secondary">cao cấp</span>
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Tìm xe phù hợp với lịch trình của bạn • Đảm bảo 100% xe đúng đời, đúng cấu hình tại TP.HCM
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto rounded-full bg-[#162e2c]/90 px-4 py-1.5 shadow-sm border border-secondary/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
                </span>
                <span className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-semibold">
                  TP. HỒ CHÍ MINH: 68 XE SẴN SÀNG
                </span>
              </div>
            </div>
          </div>

          {/* Sleek Glassmorphic Search Bar */}
          <div className="relative w-full rounded-2xl bg-[#0b2321]/95 p-3 md:p-4 shadow-xl backdrop-blur-xl border border-[#176d5c]/30">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-center">
              {/* Điểm nhận xe */}
              <div className="relative lg:col-span-4 rounded-xl bg-[#061f1d] p-3 border border-[#176d5c]/20 transition-colors hover:border-secondary/40 focus-within:ring-2 focus-within:ring-secondary/50">
                <label className="flex items-center gap-1.5 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  <span className="material-symbols-outlined text-secondary text-[16px]">location_on</span>
                  Địa điểm nhận xe
                </label>
                <div className="mt-1 flex items-center justify-between">
                  <input
                    className="w-full bg-transparent font-body-sm text-body-sm font-semibold text-on-surface outline-none cursor-pointer"
                    readOnly
                    type="text"
                    defaultValue="TP. Hồ Chí Minh (Tất cả khu vực & Sân bay Tân Sơn Nhất)"
                  />
                  <span className="material-symbols-outlined text-outline text-[18px]">expand_more</span>
                </div>
              </div>

              {/* Ngày nhận xe */}
              <div className="relative lg:col-span-3 rounded-xl bg-[#061f1d] p-3 border border-[#176d5c]/20 transition-colors hover:border-secondary/40 focus-within:ring-2 focus-within:ring-secondary/50">
                <label className="flex items-center gap-1.5 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  <span className="material-symbols-outlined text-secondary text-[16px]">calendar_today</span>
                  Ngày & giờ nhận
                </label>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-body-sm text-body-sm font-semibold text-on-surface">
                    08:00, 26/10/2025
                  </span>
                  <span className="material-symbols-outlined text-outline text-[18px]">schedule</span>
                </div>
              </div>

              {/* Ngày trả xe */}
              <div className="relative lg:col-span-3 rounded-xl bg-[#061f1d] p-3 border border-[#176d5c]/20 transition-colors hover:border-secondary/40 focus-within:ring-2 focus-within:ring-secondary/50">
                <label className="flex items-center gap-1.5 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  <span className="material-symbols-outlined text-secondary text-[16px]">event_repeat</span>
                  Ngày & giờ trả
                </label>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-body-sm text-body-sm font-semibold text-on-surface">
                    20:00, 28/10/2025
                  </span>
                  <span className="material-symbols-outlined text-outline text-[18px]">schedule</span>
                </div>
              </div>

              {/* Nút Tìm xe */}
              <div className="lg:col-span-2 flex items-center">
                <button
                  className="w-full h-full min-h-[52px] rounded-xl bg-secondary font-label-lg text-label-lg font-bold text-on-secondary-fixed shadow-[0_0_24px_rgba(74,220,200,0.35)] hover:shadow-[0_0_32px_rgba(74,220,200,0.6)] hover:bg-[#6cf9e4] transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  onClick={() => alert('Đang tìm kiếm xe có sẵn...')}
                >
                  <span className="material-symbols-outlined text-[20px]">search</span>
                  <span>Tìm xe ngay</span>
                </button>
              </div>
            </div>

            {/* Quick location pills */}
            <div className="mt-3 pt-3 flex flex-wrap items-center gap-2 border-t border-[#176d5c]/25">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider mr-1">
                Thành phố phổ biến:
              </span>
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'HCM', label: 'TP. Hồ Chí Minh (68)' },
                { id: 'HN', label: 'Hà Nội (54)' },
                { id: 'DN', label: 'Đà Nẵng (22)' },
                { id: 'CT', label: 'Cần Thơ (12)' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedCityPill(pill.id)}
                  className={`rounded-full px-3.5 py-1 font-label-sm text-label-sm transition-colors cursor-pointer ${
                    selectedCityPill === pill.id
                      ? 'bg-secondary font-semibold text-on-secondary-fixed shadow-sm'
                      : 'bg-surface-container font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MAIN LISTING TWO-COLUMN CONTENT AREA */}
      <main className="w-full max-w-[1400px] mx-auto px-6 md:px-10 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* LEFT FILTER SIDEBAR (~310px) */}
          <aside className="w-full lg:w-[310px] shrink-0 sticky top-20 flex flex-col gap-5">
            <div className="rounded-2xl bg-[#061f1d]/95 p-6 shadow-xl backdrop-blur-xl flex flex-col gap-6 border border-[#176d5c]/30">
              {/* Filter Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#176d5c]/25">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold text-lg">
                    Bộ lọc tìm kiếm
                  </h2>
                </div>
                <span className="text-xs text-primary font-semibold bg-[#176d5c]/30 px-2.5 py-0.5 rounded-full border border-primary/30">
                  TP.HCM
                </span>
              </div>

              {/* Filter Group 1: Thành phố */}
              <div className="flex flex-col gap-3">
                <h3 className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
                  Thành phố nhận xe
                </h3>
                <div className="flex flex-col gap-2.5 text-on-surface font-body-sm text-body-sm">
                  {[
                    { key: 'HCM', label: 'TP. Hồ Chí Minh', count: '68 xe', active: true },
                    { key: 'HN', label: 'Hà Nội', count: '54' },
                    { key: 'DN', label: 'Đà Nẵng', count: '22' },
                    { key: 'CT', label: 'Cần Thơ', count: '12' },
                    { key: 'HP', label: 'Hải Phòng', count: '16' },
                  ].map((city) => (
                    <label key={city.key} className="flex items-center justify-between cursor-pointer group">
                      <span className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={!!selectedCities[city.key]}
                          onChange={() => handleCityToggle(city.key)}
                          className="rounded bg-[#0b2321] text-secondary focus:ring-0 focus:ring-offset-0 border-[#176d5c] checked:border-secondary cursor-pointer w-4 h-4"
                        />
                        <span
                          className={`transition-colors font-medium ${
                            selectedCities[city.key]
                              ? 'text-on-surface group-hover:text-primary'
                              : 'text-on-surface-variant group-hover:text-primary'
                          }`}
                        >
                          {city.label}
                        </span>
                      </span>
                      <span
                        className={`font-label-sm text-label-sm ${
                          selectedCities[city.key] ? 'text-primary font-semibold' : 'text-outline'
                        }`}
                      >
                        {city.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter Group 2: Dòng xe & Phân khúc */}
              <div className="flex flex-col gap-3">
                <h3 className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
                  Loại xe & Phân khúc
                </h3>
                <div className="flex flex-col gap-2.5 text-on-surface font-body-sm text-body-sm">
                  {[
                    { key: 'suv', label: 'SUV Gầm cao', count: '32' },
                    { key: 'sedan', label: 'Sedan Đô thị', count: '24' },
                    { key: 'crossover', label: 'Crossover Hạng sang', count: '19' },
                    { key: 'ev', label: 'Xe Điện Thông minh', count: '28' },
                  ].map((type) => (
                    <label key={type.key} className="flex items-center justify-between cursor-pointer group">
                      <span className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={!!selectedTypes[type.key]}
                          onChange={() => handleTypeToggle(type.key)}
                          className="rounded bg-[#0b2321] text-secondary focus:ring-0 focus:ring-offset-0 border-[#176d5c] checked:border-secondary cursor-pointer w-4 h-4"
                        />
                        <span
                          className={`transition-colors font-medium ${
                            selectedTypes[type.key]
                              ? 'text-on-surface group-hover:text-primary'
                              : 'text-on-surface-variant group-hover:text-primary'
                          }`}
                        >
                          {type.label}
                        </span>
                      </span>
                      <span
                        className={`font-label-sm text-label-sm ${
                          selectedTypes[type.key] ? 'text-primary font-semibold' : 'text-outline'
                        }`}
                      >
                        {type.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter Group 3: Giá thuê slider */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
                    Khoảng giá thuê
                  </h3>
                  <span className="text-xs text-primary font-semibold">VNĐ / ngày</span>
                </div>
                <div className="flex items-center justify-between text-body-sm font-semibold text-on-surface px-1">
                  <span className="text-on-surface-variant">800.000₫</span>
                  <span className="text-secondary font-bold">{maxPrice.toLocaleString('vi-VN')}₫</span>
                </div>
                <input
                  type="range"
                  min="800000"
                  max="5000000"
                  step="100000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-secondary cursor-pointer h-2 bg-[#0b2321] rounded-lg"
                />
              </div>

              {/* Filter Group 4: Số chỗ ngồi */}
              <div className="flex flex-col gap-3">
                <h3 className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
                  Số chỗ ngồi
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[4, 5, 7].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSelectedSeats(num)}
                      className={`py-2 text-center rounded-xl font-label-md text-label-md transition-colors cursor-pointer ${
                        selectedSeats === num
                          ? 'bg-secondary font-bold text-on-secondary-fixed shadow-[0_0_12px_rgba(74,220,200,0.3)]'
                          : 'bg-[#0b2321] border border-[#176d5c]/30 text-on-surface hover:border-secondary/50 hover:bg-surface-container-highest'
                      }`}
                    >
                      {num} Chỗ
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Group 5: Hộp số & Vận hành */}
              <div className="flex flex-col gap-3">
                <h3 className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
                  Hộp số & Vận hành
                </h3>
                <div className="flex flex-col gap-2.5 text-on-surface font-body-sm text-body-sm">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={transmissionFilter.at}
                      onChange={() =>
                        setTransmissionFilter((prev) => ({ ...prev, at: !prev.at }))
                      }
                      className="rounded bg-[#0b2321] text-secondary focus:ring-0 focus:ring-offset-0 border-[#176d5c] checked:border-secondary cursor-pointer w-4 h-4"
                    />
                    <span className="text-on-surface font-medium">Số Tự Động (AT)</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={transmissionFilter.mt}
                      onChange={() =>
                        setTransmissionFilter((prev) => ({ ...prev, mt: !prev.mt }))
                      }
                      className="rounded bg-[#0b2321] text-secondary focus:ring-0 focus:ring-offset-0 border-outline-variant/60 cursor-pointer w-4 h-4"
                    />
                    <span className="text-on-surface-variant">Số Sàn (MT)</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={transmissionFilter.awd}
                      onChange={() =>
                        setTransmissionFilter((prev) => ({ ...prev, awd: !prev.awd }))
                      }
                      className="rounded bg-[#0b2321] text-secondary focus:ring-0 focus:ring-offset-0 border-[#176d5c] checked:border-secondary cursor-pointer w-4 h-4"
                    />
                    <span className="text-on-surface font-medium">Dẫn động 4 bánh (AWD / 4WD)</span>
                  </label>
                </div>
              </div>

              {/* Filter Group 6: Nhiên liệu */}
              <div className="flex flex-col gap-3">
                <h3 className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
                  Nhiên liệu
                </h3>
                <div className="flex flex-col gap-2.5 text-on-surface font-body-sm text-body-sm">
                  <label className="flex items-center gap-2.5 cursor-pointer text-primary font-medium">
                    <input
                      type="checkbox"
                      checked={fuelFilter.ev}
                      onChange={() => setFuelFilter((prev) => ({ ...prev, ev: !prev.ev }))}
                      className="rounded bg-[#0b2321] text-secondary focus:ring-0 focus:ring-offset-0 border-[#176d5c] checked:border-secondary cursor-pointer w-4 h-4"
                    />
                    <span>Thuần Điện (EV)</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fuelFilter.gasoline}
                      onChange={() => setFuelFilter((prev) => ({ ...prev, gasoline: !prev.gasoline }))}
                      className="rounded bg-[#0b2321] text-secondary focus:ring-0 focus:ring-offset-0 border-[#176d5c] checked:border-secondary cursor-pointer w-4 h-4"
                    />
                    <span className="text-on-surface">Xăng (Gasoline)</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fuelFilter.diesel}
                      onChange={() => setFuelFilter((prev) => ({ ...prev, diesel: !prev.diesel }))}
                      className="rounded bg-[#0b2321] text-secondary focus:ring-0 focus:ring-offset-0 border-outline-variant/60 cursor-pointer w-4 h-4"
                    />
                    <span className="text-on-surface-variant">Dầu Diesel</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fuelFilter.hybrid}
                      onChange={() => setFuelFilter((prev) => ({ ...prev, hybrid: !prev.hybrid }))}
                      className="rounded bg-[#0b2321] text-secondary focus:ring-0 focus:ring-offset-0 border-outline-variant/60 cursor-pointer w-4 h-4"
                    />
                    <span className="text-on-surface-variant">Hybrid (Lai điện)</span>
                  </label>
                </div>
              </div>

              {/* Filter Group 7: Hãng xe */}
              <div className="flex flex-col gap-3">
                <h3 className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">
                  Thương hiệu xe
                </h3>
                <div className="grid grid-cols-2 gap-2.5 text-body-sm text-on-surface">
                  {['VinFast', 'BMW', 'Porsche', 'Mercedes', 'Audi', 'Hyundai'].map((brand) => (
                    <label
                      key={brand}
                      className={`flex items-center gap-2 cursor-pointer font-medium ${
                        brandFilter[brand] ? 'text-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!brandFilter[brand]}
                        onChange={() => handleBrandToggle(brand)}
                        className="rounded bg-[#0b2321] text-secondary focus:ring-0 focus:ring-offset-0 border-[#176d5c] checked:border-secondary cursor-pointer w-4 h-4"
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sidebar Action Buttons */}
              <div className="flex flex-col gap-2.5 pt-4 border-t border-[#176d5c]/25">
                <button
                  type="button"
                  onClick={() => alert('Đã áp dụng các bộ lọc')}
                  className="w-full py-2.5 rounded-xl bg-secondary font-label-md text-label-md font-bold text-on-secondary-fixed shadow-[0_0_16px_rgba(74,220,200,0.3)] hover:shadow-[0_0_24px_rgba(74,220,200,0.5)] hover:bg-secondary-fixed transition-all active:scale-98 cursor-pointer"
                >
                  Áp dụng bộ lọc
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="w-full py-2 rounded-xl bg-transparent border border-outline/40 font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:border-secondary/60 hover:bg-surface-container transition-all cursor-pointer"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          </aside>

          {/* RIGHT RESULTS AREA */}
          <section className="flex-1 w-full flex flex-col gap-6">
            {/* Active Search Summary & Timeframe Control Bar */}
            <div className="flex flex-col gap-3 rounded-2xl bg-[#061f1d]/90 p-4 backdrop-blur-md shadow-sm border border-[#176d5c]/30">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      {displayedCars.length} xe sẵn sàng
                    </span>
                    <span className="text-outline">•</span>
                    <span className="font-body-sm text-body-sm text-primary font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      TP. Hồ Chí Minh
                    </span>
                  </div>
                  <div className="hidden sm:block h-4 w-px bg-outline-variant/50"></div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0b2321] border border-[#176d5c]/30 text-xs text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-[15px]">date_range</span>
                    <span className="text-on-surface-variant">Thời gian thuê:</span>
                    <strong className="text-secondary font-semibold">
                      08:00, 26/10/2025 — 20:00, 28/10/2025
                    </strong>
                  </div>
                </div>

                {/* Sorting & View switcher */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-xl bg-[#0b2321] px-3.5 py-1.5 border border-[#176d5c]/30">
                    <span className="font-label-sm text-label-sm text-outline whitespace-nowrap shrink-0">
                      Sắp xếp:
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent font-body-sm text-body-sm font-semibold text-on-surface border-none p-0 focus:ring-0 cursor-pointer whitespace-nowrap"
                    >
                      <option className="bg-surface-container-high text-on-surface" value="recommended">
                        Đề xuất tốt nhất
                      </option>
                      <option className="bg-surface-container-high text-on-surface" value="price-asc">
                        Giá: Thấp đến Cao
                      </option>
                      <option className="bg-surface-container-high text-on-surface" value="price-desc">
                        Giá: Cao đến Thấp
                      </option>
                      <option className="bg-surface-container-high text-on-surface" value="rating">
                        Đánh giá cao nhất
                      </option>
                    </select>
                  </div>

                  <div className="flex items-center rounded-xl bg-[#0b2321] p-1 border border-[#176d5c]/30">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg cursor-pointer ${
                        viewMode === 'grid'
                          ? 'bg-secondary text-on-secondary-fixed shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                      title="Xem dạng lưới"
                    >
                      <span className="material-symbols-outlined text-[18px]">grid_view</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg cursor-pointer ${
                        viewMode === 'list'
                          ? 'bg-secondary text-on-secondary-fixed shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                      title="Xem dạng danh sách"
                    >
                      <span className="material-symbols-outlined text-[18px]">view_list</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 6-CAR SHOWCASE GRID (3 COLUMNS X 2 ROWS OR LIST) */}
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'flex flex-col gap-4'
              }
            >
              {displayedCars.map((car) => {
                const getBadgeStyle = () => {
                  if (car.badgeVariant === 'tertiary') {
                    return 'text-tertiary border-tertiary/30';
                  }
                  if (car.badgeVariant === 'primary') {
                    return 'text-primary border-primary/30';
                  }
                  if (car.badgeVariant === 'outline') {
                    return 'text-on-surface border-outline/30';
                  }
                  return 'text-secondary border-secondary/30';
                };

                return (
                  <article
                    key={car.id}
                    className={`group relative flex flex-col h-full rounded-2xl bg-[#061f1d] overflow-hidden shadow-lg hover:shadow-[0_16px_36px_-6px_rgba(74,220,200,0.25)] hover:-translate-y-1 transition-all duration-250 border border-[#176d5c]/30 ${
                      viewMode === 'list' ? 'sm:flex-row' : ''
                    }`}
                  >
                    {/* Image Section */}
                    <div
                      className={`relative overflow-hidden bg-surface-container-lowest ${
                        viewMode === 'list' ? 'w-full sm:w-72 aspect-video sm:aspect-auto' : 'w-full aspect-video'
                      }`}
                    >
                      <div className="absolute top-3 left-3 z-10 pointer-events-none">
                        <span
                          className={`rounded-full bg-[#001715]/85 backdrop-blur-md px-3 py-1 font-label-sm text-[11px] font-bold uppercase tracking-wider border ${getBadgeStyle()}`}
                        >
                          {car.badge}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 z-10 pointer-events-none">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 backdrop-blur-md px-2.5 py-1 font-label-sm text-[11px] font-bold text-primary border border-primary/30">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                          Còn lịch trống
                        </span>
                      </div>
                      <img
                        alt={car.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src={car.image}
                      />
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-1 flex-col p-5 justify-between gap-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-label-sm text-secondary font-semibold uppercase tracking-wider">
                          <span className="truncate">{car.brand}</span>
                          <span className="text-on-surface-variant normal-case flex items-center gap-1 shrink-0 text-xs font-normal">
                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                            {car.location}
                          </span>
                        </div>
                        <h3
                          className="text-[18px] font-bold text-on-surface truncate group-hover:text-primary transition-colors leading-snug"
                          title={car.name}
                        >
                          {car.name}
                        </h3>
                      </div>

                      {/* Single compact specs row */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-[#0b2321] border border-[#176d5c]/30 text-[11px] text-on-surface-variant whitespace-nowrap">
                          <span className="material-symbols-outlined text-secondary text-[14px] shrink-0">
                            airline_seat_recline_normal
                          </span>
                          <span className="font-medium">{car.seats} Chỗ</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-[#0b2321] border border-[#176d5c]/30 text-[11px] text-on-surface-variant whitespace-nowrap">
                          <span className="material-symbols-outlined text-secondary text-[14px] shrink-0">
                            settings
                          </span>
                          <span className="font-medium truncate">{car.transmission}</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-[#0b2321] border border-[#176d5c]/30 text-[11px] text-on-surface-variant whitespace-nowrap">
                          <span className="material-symbols-outlined text-secondary text-[14px] shrink-0">
                            {car.isElectric ? 'electric_bolt' : 'local_gas_station'}
                          </span>
                          <span className="font-medium truncate">{car.fuel}</span>
                        </div>
                      </div>

                      {/* Clear Separate Price Section */}
                      <div className="flex flex-col gap-1 pt-3 border-t border-[#176d5c]/25">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-on-surface-variant">Giá theo ngày:</span>
                          <span className="text-[17px] font-bold text-primary">
                            {car.priceDay.toLocaleString('vi-VN')}₫
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-outline">Giá theo giờ:</span>
                          <span className="text-xs font-medium text-on-surface-variant">
                            {car.priceHour.toLocaleString('vi-VN')}₫
                          </span>
                        </div>
                      </div>

                      {/* Full Width Button */}
                      <Link
                        to={`/trip/${car.id}`}
                        className="w-full py-2.5 rounded-xl bg-secondary font-label-md text-label-md font-bold text-on-secondary-fixed text-center shadow-[0_0_16px_rgba(74,220,200,0.25)] hover:shadow-[0_0_24px_rgba(74,220,200,0.55)] hover:bg-secondary-fixed transition-all active:scale-98 cursor-pointer block"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* PAGINATION BAR */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-[#061f1d]/85 p-4 border border-[#176d5c]/25">
              <div className="font-body-sm text-body-sm text-on-surface-variant">
                Hiển thị <span className="font-semibold text-on-surface">1 - {displayedCars.length}</span> trên{' '}
                <span className="font-semibold text-on-surface">68</span> xe tại TP. Hồ Chí Minh
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  className="flex h-9 px-3 items-center gap-1 rounded-xl bg-[#0b2321] font-label-sm text-label-sm text-outline opacity-50 cursor-not-allowed border border-[#176d5c]/20"
                  disabled
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Trước</span>
                </button>
                <button
                  onClick={() => setCurrentPage(1)}
                  className={`h-9 w-9 rounded-xl font-label-md text-label-md font-bold cursor-pointer transition-colors ${
                    currentPage === 1
                      ? 'bg-secondary text-on-secondary-fixed shadow-[0_0_12px_rgba(74,220,200,0.4)]'
                      : 'bg-[#0b2321] border border-[#176d5c]/30 text-on-surface hover:bg-surface-container-highest'
                  }`}
                >
                  1
                </button>
                <button
                  onClick={() => setCurrentPage(2)}
                  className={`h-9 w-9 rounded-xl font-label-md text-label-md font-bold cursor-pointer transition-colors ${
                    currentPage === 2
                      ? 'bg-secondary text-on-secondary-fixed shadow-[0_0_12px_rgba(74,220,200,0.4)]'
                      : 'bg-[#0b2321] border border-[#176d5c]/30 text-on-surface hover:bg-surface-container-highest'
                  }`}
                >
                  2
                </button>
                <button
                  onClick={() => setCurrentPage(3)}
                  className={`h-9 w-9 rounded-xl font-label-md text-label-md font-bold cursor-pointer transition-colors ${
                    currentPage === 3
                      ? 'bg-secondary text-on-secondary-fixed shadow-[0_0_12px_rgba(74,220,200,0.4)]'
                      : 'bg-[#0b2321] border border-[#176d5c]/30 text-on-surface hover:bg-surface-container-highest'
                  }`}
                >
                  3
                </button>
                <span className="px-1 text-outline">...</span>
                <button
                  onClick={() => setCurrentPage(5)}
                  className={`h-9 w-9 rounded-xl font-label-md text-label-md font-bold cursor-pointer transition-colors ${
                    currentPage === 5
                      ? 'bg-secondary text-on-secondary-fixed shadow-[0_0_12px_rgba(74,220,200,0.4)]'
                      : 'bg-[#0b2321] border border-[#176d5c]/30 text-on-surface hover:bg-surface-container-highest'
                  }`}
                >
                  5
                </button>
                <button className="flex h-9 px-3 items-center gap-1 rounded-xl bg-[#0b2321] border border-[#176d5c]/30 font-label-sm text-label-sm text-on-surface hover:bg-surface-container-highest transition-colors cursor-pointer">
                  <span>Tiếp</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Car Detail Modal */}
      {selectedCarModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setSelectedCarModal(null)}
        >
          <div
            className="bg-[#061f1d] border border-secondary/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#0b2321] text-on-surface-variant hover:text-on-surface flex items-center justify-center cursor-pointer"
              onClick={() => setSelectedCarModal(null)}
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>

            <div className="relative rounded-xl overflow-hidden mb-4 h-56 bg-surface-container-highest">
              <img
                src={selectedCarModal.image}
                alt={selectedCarModal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#001715]/90 text-secondary text-xs font-semibold border border-secondary/20">
                {selectedCarModal.location}
              </div>
            </div>

            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-secondary font-semibold uppercase tracking-wider">
                {selectedCarModal.brand}
              </span>
              <span className="flex items-center gap-1 text-tertiary text-xs font-bold">
                <span className="material-symbols-outlined text-[15px]">star</span>
                {selectedCarModal.rating} (Đánh giá tốt)
              </span>
            </div>

            <h3 className="text-xl font-bold text-on-surface mb-3">{selectedCarModal.name}</h3>

            <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-[#0b2321] rounded-xl text-xs text-on-surface-variant mb-4 border border-[#176d5c]/25">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-secondary text-[16px]">
                  airline_seat_recline_normal
                </span>
                <span>{selectedCarModal.seats} Chỗ</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-secondary text-[16px]">settings</span>
                <span className="truncate">{selectedCarModal.transmission}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-secondary text-[16px]">
                  {selectedCarModal.isElectric ? 'electric_bolt' : 'local_gas_station'}
                </span>
                <span className="truncate">{selectedCarModal.fuel}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#176d5c]/30">
              <div>
                <div className="text-lg font-bold text-primary">
                  {selectedCarModal.priceDay.toLocaleString('vi-VN')}₫{' '}
                  <span className="text-xs text-on-surface-variant font-normal">/ngày</span>
                </div>
                <div className="text-xs text-on-surface-variant">
                  {selectedCarModal.priceHour.toLocaleString('vi-VN')}₫ /giờ
                </div>
              </div>
              <button
                className="px-5 py-2.5 rounded-xl bg-secondary text-on-secondary-fixed text-sm font-bold shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
                onClick={() => {
                  alert(`Đã gửi yêu cầu giữ xe: ${selectedCarModal.name}`);
                  setSelectedCarModal(null);
                }}
              >
                Đặt xe ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

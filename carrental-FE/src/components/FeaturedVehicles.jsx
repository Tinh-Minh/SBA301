import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CARS_DATA = [
  {
    id: 'vf8',
    name: 'VinFast VF 8 Plus',
    subtitle: 'Xe điện SUV 5 chỗ',
    location: 'Quận 7, TP.HCM',
    rating: '4.9',
    reviews: 42,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCETlnd0iWbpx4OjlW4Bd8Y0lML3YXNZdfFS0uwlgdFCu6mI4GHARbyq4ovyM4NohpGyacpDddTI5jZsf4dCk82o5Sg3cDM7oP77c6-I30gvOtgfV3UfiS-xezKhxEUq4OHqQHV7z9ohZh8i3VFXxAbD3bE0clI1JmvwlasdZa-O5V54fRL4BLSbhk3NEZNYcGMzYW41SFkySn1K2qPbCxesh0mNphcsGrdaJsBhstm5KFo9pHCVk1dwA',
    tags: ['electric', 'suv'],
    specs: [
      { icon: 'bolt', label: 'Thuần điện' },
      { icon: 'airline_seat_recline_normal', label: '5 Ghế' },
      { icon: 'tune', label: 'AWD' },
    ],
    price: '1.250.000 đ',
    deposit: 'Cọc 15tr (Hoàn trả 24h)',
  },
  {
    id: 'glc300',
    name: 'Mercedes GLC 300',
    subtitle: 'SUV Hạng sang 5 chỗ',
    location: 'Bình Thạnh, TP.HCM',
    rating: '5.0',
    reviews: 68,
    image:
      'https://lh3.googleusercontent.com/aida/AEtjO1U7txDMRGK3-ZUtWPO_7EseResGnzsyy1oGruEUCA0N3HiJcrdc2bVd4Pfxur7o_bTPU-aUTRm_arc6JLZLnzE1_wBvMO-xhIzNufvi8EDrtgUCYqoziVOQFbCH34eMeSVjUMCWM300KVhb4MgfFsbkXcn7TUpJetVSrmnQGXvUDSogBGV1F_p2yzjdHUfdlNwIQqJ0s2h5_tOGjhy_3fg5Mx8KRcS954JRqywJQ961SkMzqQliYY1ML4fX',
    tags: ['luxury', 'suv'],
    specs: [
      { icon: 'local_gas_station', label: 'Xăng 95' },
      { icon: 'airline_seat_recline_normal', label: '5 Ghế' },
      { icon: 'settings', label: 'Tự động 9G' },
    ],
    price: '2.450.000 đ',
    deposit: 'Cọc 25tr (Hoàn trả 24h)',
  },
  {
    id: 'santafe',
    name: 'Hyundai Santa Fe',
    subtitle: 'SUV Gia đình 7 chỗ',
    location: 'Tân Bình, TP.HCM',
    rating: '4.8',
    reviews: 53,
    image:
      'https://lh3.googleusercontent.com/aida/AEtjO1UAMcPcKTZG7ZWs5-5HoYVB2ORnWe41WHPGi47KwWLtPRwhr6CpzEEsYnzxi0l-T9Btlwd0MyAm6WOMm-fDd1LaWUhWx7Qxd8uNELwtS1NMzaX1Hyx-715ezkuL2s72-AeNlWXpcjkJYeRjapvSrYsdpNMdlP3xpoLXfVh3vRhUBb8gks-vPsbJbNkZpG0ZKlB4uzK7tN7fRxnag4jDAwPJl23jMcfy6vHrSCrqktSq8AXa3sEnDtnhFiax',
    tags: ['suv'],
    specs: [
      { icon: 'local_gas_station', label: 'Xăng Turbo' },
      { icon: 'groups', label: '7 Ghế' },
      { icon: 'all_inclusive', label: 'HTRAC' },
    ],
    price: '1.400.000 đ',
    deposit: 'Cọc 15tr (Hoàn trả 24h)',
  },
  {
    id: 'macan',
    name: 'Porsche Macan GTS',
    subtitle: 'Thể thao Thượng lưu',
    location: 'Thủ Đức, TP.HCM',
    rating: '5.0',
    reviews: 31,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCmUBgAL6wOhe2TL07XJyJaPvt5LeNaO7znTwIhFmTSqOqZ7b_eqkKurYayHzwImZBe9Z5RjZEwpCsEffDfGRdYnB1l3lUVQKA02lvuRnBuM7tEVh_U9FoivbY_sFJm0cUpWEgfpL4DRI6AiePwfxE10ryepUggQCsHDrgn5rsgzK_4iq9aTITnAxXqlVtJvUnsy7GpwTmA736F7i7GoFsj61mb5pQrNVQ8DtVMmUPGXXQrtXAUay2DtQ',
    tags: ['luxury', 'suv'],
    specs: [
      { icon: 'local_gas_station', label: '434 HP' },
      { icon: 'airline_seat_recline_normal', label: '5 Ghế' },
      { icon: 'speed', label: 'PDK 7' },
    ],
    price: '3.800.000 đ',
    deposit: 'Cọc 40tr (Hoàn trả 24h)',
  },
];

const CATEGORIES = [
  { key: 'all', label: 'Tất cả' },
  { key: 'electric', label: 'Xe điện' },
  { key: 'suv', label: 'Gầm cao SUV' },
  { key: 'luxury', label: 'Xe sang' },
];

export default function FeaturedVehicles({ onSelectCar }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [favorites, setFavorites] = useState({});
  const [selectedCarModal, setSelectedCarModal] = useState(null);

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredCars = CARS_DATA.filter((car) => {
    if (activeCategory === 'all') return true;
    return car.tags.includes(activeCategory);
  });

  return (
    <section className="w-full py-8 bg-surface-container-lowest border-t border-outline-variant/20" id="explore">
      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10">
        {/* Header & Category Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Tuyển chọn hàng đầu
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-on-surface mt-0.5">
              Những mẫu xe nổi bật
            </h2>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-xl border border-outline-variant/30">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                className={`px-3 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                  activeCategory === cat.key
                    ? 'font-bold bg-secondary text-on-secondary-fixed shadow-sm'
                    : 'font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/40'
                }`}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredCars.map((car) => {
            const isFav = !!favorites[car.id];

            return (
              <div
                key={car.id}
                className="group bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/25 shadow-md hover:border-secondary/40 hover:shadow-[0_8px_25px_rgba(74,220,200,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Banner */}
                <div className="relative w-full h-44 overflow-hidden bg-surface-container-highest">
                  <img
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={car.image}
                  />
                  {/* Location Chip */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center gap-1 text-[11px] font-semibold text-secondary border border-secondary/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <span>{car.location}</span>
                  </div>
                  {/* Favorite Button */}
                  <button
                    className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-surface-container-lowest/70 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer ${
                      isFav ? 'text-error' : 'text-on-surface-variant hover:text-error'
                    }`}
                    title={isFav ? 'Bỏ yêu thích' : 'Lưu yêu thích'}
                    onClick={(e) => toggleFavorite(car.id, e)}
                  >
                    <span
                      className="material-symbols-outlined text-[16px]"
                      style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      favorite
                    </span>
                  </button>
                </div>

                {/* Content */}
                <div className="p-3.5 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-on-surface-variant mb-1">
                      <span>{car.subtitle}</span>
                      <span className="flex items-center gap-0.5 text-tertiary font-bold">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        {car.rating} ({car.reviews})
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors">
                      {car.name}
                    </h3>

                    {/* Specs Badges */}
                    <div className="flex items-center gap-2 mt-2 py-1.5 px-2 bg-surface-container-low rounded-lg text-[11px] text-on-surface-variant">
                      {car.specs.map((spec, idx) => (
                        <React.Fragment key={idx}>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-primary">
                              {spec.icon}
                            </span>
                            {spec.label}
                          </span>
                          {idx < car.specs.length - 1 && <span>•</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="mt-3 pt-2.5 border-t border-outline-variant/20 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-on-surface">
                        {car.price}{' '}
                        <span className="text-[10px] font-normal text-on-surface-variant">
                          /ngày
                        </span>
                      </div>
                      <div className="text-[10px] text-primary font-medium">{car.deposit}</div>
                    </div>
                    <button
                      className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-xs font-semibold text-on-surface transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                      onClick={() => setSelectedCarModal(car)}
                    >
                      <span>Xem chi tiết</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Explore All Link Banner */}
        <div className="mt-8 flex justify-center">
          <Link
            to="/trip"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#061f1d] hover:bg-surface-container-high border border-secondary/30 hover:border-secondary text-primary font-semibold text-sm transition-all shadow-md hover:shadow-cyan-500/20 active:scale-95"
          >
            <span>Khám phá tất cả 68+ mẫu xe cao cấp</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* Interactive Car Detail Modal */}
      {selectedCarModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={() => setSelectedCarModal(null)}
        >
          <div
            className="bg-surface-container border border-secondary/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center cursor-pointer"
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
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-surface-container-lowest/80 text-secondary text-xs font-semibold border border-secondary/20">
                {selectedCarModal.location}
              </div>
            </div>

            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-primary font-medium">{selectedCarModal.subtitle}</span>
              <span className="flex items-center gap-1 text-tertiary text-xs font-bold">
                <span className="material-symbols-outlined text-[15px]">star</span>
                {selectedCarModal.rating} ({selectedCarModal.reviews} đánh giá)
              </span>
            </div>

            <h3 className="text-xl font-bold text-on-surface mb-3">{selectedCarModal.name}</h3>

            <div className="flex items-center gap-3 py-2 px-3 bg-surface-container-low rounded-xl text-xs text-on-surface-variant mb-4">
              {selectedCarModal.specs.map((spec, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-primary">
                    {spec.icon}
                  </span>
                  {spec.label}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30">
              <div>
                <div className="text-lg font-bold text-primary">
                  {selectedCarModal.price} <span className="text-xs text-on-surface-variant">/ngày</span>
                </div>
                <div className="text-xs text-on-surface-variant">{selectedCarModal.deposit}</div>
              </div>
              <button
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary text-on-secondary-fixed text-sm font-bold shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
                onClick={() => {
                  alert(`Đã chọn đặt xe: ${selectedCarModal.name}`);
                  setSelectedCarModal(null);
                }}
              >
                Đặt xe ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

import { DetailItem } from "@/components/DetailItem.jsx";
import { Link } from "react-router";
import { useCallback } from "react";
import { LiveState } from "@/components/LiveUi.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { carImage, carName, carTypeLabels, formatMoney, fuelTypeLabels, transmissionLabels } from "@/utils/labels.js";
import { carService } from "@/services/vehicleService.js";

export function Detail({ carId }) {
    const load = useCallback(async () => {
        const car = await carService.getPublic(carId);
        return { car };
    }, [carId]);

    const detail = useApiQuery(["vehicles", "public-detail", { carId }], load, { requiresAuth: false });

    if (!detail.data)
        return <LiveState loading={detail.loading} error={detail.error} label="thông tin xe" onRetry={detail.reload}/>;

    return <Body car={detail.data.car} />;
}

function Body({ car }) {
    const features = parseFeatures(car.features);
    const dayPrice = car.rentalPricePerDay || car.pricePerDay || 0;
    const monthPrice = car.rentalPricePerMonth;
    const contactName = car.contactName || car.ownerFullName || "Chủ xe";
    const phone = car.contactPhone || "";
    const zalo = car.contactZalo || car.contactPhone || "";

    return (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            {/* Cột trái: Hình ảnh và thông số xe */}
            <article className="overflow-hidden rounded-2xl border border-[#E9E9E7] bg-white shadow-sm">
                <img src={carImage(car)} alt={carName(car)} className="h-64 w-full object-cover" />
                {car.images?.length > 1 ? (
                    <div className="flex gap-2 overflow-x-auto p-3">
                        {car.images.map((image) => (
                            <img
                                key={image.id}
                                src={image.imageUrl}
                                alt=""
                                className="h-16 w-24 shrink-0 rounded-lg object-cover"
                            />
                        ))}
                    </div>
                ) : null}
                <div className="flex flex-col gap-3 p-5">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-[#292929]">
                            {car.brand} {car.model} {car.manufactureYear ?? ""}
                        </h1>
                        <span className="rounded-full bg-[#EBF5FF] px-3 py-1 text-xs font-semibold text-[#1E40AF]">
                            Đã kiểm định
                        </span>
                    </div>

                    <p className="text-sm text-[#666666]">
                        {carTypeLabels[car.carType] ?? car.carType} • {car.seats} chỗ • {transmissionLabels[car.transmission] ?? car.transmission} • {fuelTypeLabels[car.fuelType] ?? car.fuelType}
                        {car.color ? ` • ${car.color}` : ""}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-[#292929]">
                        <span>📍</span>
                        <span>{[car.pickupAddress, car.district, car.city].filter(Boolean).join(", ")}</span>
                    </div>

                    {car.description ? (
                        <div className="mt-2 border-t border-[#F2F2F0] pt-3">
                            <h2 className="text-sm font-bold text-[#292929] mb-1">Mô tả chi tiết</h2>
                            <p className="whitespace-pre-line text-sm text-[#666666]">{car.description}</p>
                        </div>
                    ) : null}

                    {features.length ? (
                        <div className="mt-2 border-t border-[#F2F2F0] pt-3">
                            <h2 className="text-sm font-bold text-[#292929] mb-2">Tiện ích trang bị</h2>
                            <ul className="flex flex-wrap gap-2">
                                {features.map((item) => (
                                    <li key={item} className="rounded-full bg-[#F7F7F5] px-3 py-1 text-xs font-semibold text-[#292929]">
                                        ✓ {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                </div>
            </article>

            {/* Cột phải: Thông tin liên hệ & Giá thuê tham khảo */}
            <aside className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-[#292929]">Mức giá tham khảo</h2>
                
                <div className="mt-3 rounded-xl bg-[#FFF7F2] p-4">
                    <div className="flex items-baseline justify-between">
                        <span className="text-sm text-[#666666]">Thuê theo ngày:</span>
                        <span className="text-2xl font-black text-[#FC6C26]">{formatMoney(dayPrice)}</span>
                    </div>
                    {monthPrice ? (
                        <div className="mt-2 flex items-baseline justify-between border-t border-[#FED7AA] pt-2">
                            <span className="text-sm text-[#666666]">Thuê theo tháng:</span>
                            <span className="text-lg font-bold text-[#292929]">{formatMoney(monthPrice)}</span>
                        </div>
                    ) : null}
                    <p className="mt-2 text-xs text-[#9A3412]">
                        * Giá trên là giá tham khảo. Bạn có thể liên hệ trực tiếp với chủ xe để thương lượng thêm.
                    </p>
                </div>

                <div className="mt-6 border-t border-[#E9E9E7] pt-5">
                    <h3 className="text-sm font-bold text-[#292929] uppercase tracking-wide">
                        Thông tin người cho thuê
                    </h3>
                    
                    <div className="mt-3 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FC6C26] font-bold text-white text-lg">
                            {contactName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-[#292929]">{contactName}</p>
                            <span className="inline-flex items-center text-xs text-[#059669] font-medium">
                                ✓ Chủ xe đã xác thực danh tính
                            </span>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3">
                        {phone ? (
                            <a
                                href={`tel:${phone}`}
                                className="flex items-center justify-center gap-2 rounded-xl bg-[#FC6C26] py-3 px-4 font-bold text-white shadow-sm hover:bg-[#e05615] transition"
                            >
                                <span>📞</span>
                                <span>Gọi ngay: {phone}</span>
                            </a>
                        ) : null}

                        {zalo ? (
                            <a
                                href={`https://zalo.me/${zalo.replace(/\s+/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center gap-2 rounded-xl border border-[#0068FF] bg-[#F0F6FF] py-3 px-4 font-bold text-[#0068FF] hover:bg-[#E1EDFF] transition"
                            >
                                <span>💬</span>
                                <span>Nhắn tin qua Zalo</span>
                            </a>
                        ) : null}
                    </div>

                    <div className="mt-6 rounded-xl bg-[#F9FAFB] p-3 text-xs text-[#6B7280] leading-relaxed">
                        <p className="font-semibold text-[#374151] mb-1">💡 Hướng dẫn thuê xe an toàn:</p>
                        <p>1. Liên hệ trước để chốt lịch và các giấy tờ cần xuất trình.</p>
                        <p>2. Kiểm tra kỹ tình trạng ngoại quan và giấy tờ xe khi nhận xe.</p>
                        <p>3. Ký hợp đồng hoặc biên bản thỏa thuận bàn giao giữa 2 bên.</p>
                    </div>

                    <div className="mt-4 text-center">
                        <Link to="/explore" className="text-xs font-semibold text-[#666666] hover:text-[#FC6C26]">
                            ← Xem các tin đăng xe khác
                        </Link>
                    </div>
                </div>
            </aside>
        </div>
    );
}

function parseFeatures(raw) {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
        return String(raw).split(",").map((item) => item.trim()).filter(Boolean);
    }
}

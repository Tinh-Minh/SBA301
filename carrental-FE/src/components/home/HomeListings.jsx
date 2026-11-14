import { useState } from "react";
import { Link } from "react-router";
import { Icon } from "@/components/Icon.jsx";
import { LiveState } from "@/components/LiveUi.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { carService } from "@/services/vehicleService.js";
import { carName, carTypeLabels, formatMoney, transmissionLabels } from "@/utils/labels.js";

const loadLatest = () => carService.search({ size:4 });

export function HomeListings() {
    const [openIds, setOpenIds] = useState(() => new Set());
    const latest = useApiQuery(["vehicles", "home-listings", ""], loadLatest, { requiresAuth:false });
    if (!latest.data?.content?.length) return null;
    const cars = latest.data.content;
    function toggle(id) {
        setOpenIds(current => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }
    return <section className="journey-fleet" data-car-stop="fleet" data-car-pin="fleet" data-native aria-labelledby="home-listings-title">
        <div className="journey-listings-header journey-reveal">
            <h2 id="home-listings-title">Mẫu xe ưa chuộng</h2>
        </div>
        <LiveState loading={latest.loading && !latest.data} error={latest.error ? { message:"Không thể tải xe. Vui lòng thử lại." } : null} empty={false} label="xe đang có" onRetry={latest.reload} />
        <div className="journey-listings-grid journey-reveal journey-reveal--late">
            {cars.map(car => {
                const open = openIds.has(car.id);
                const facts = [carTypeLabels[car.carType], car.seats ? `${car.seats} chỗ` : null, transmissionLabels[car.transmission]].filter(Boolean).join(" · ");
                return <article key={car.id} className={open ? "journey-listing is-open" : "journey-listing"} data-vehicle-card={car.carType}>
                    <div className="journey-listing-photo">
                        {car.primaryImageUrl ? <img src={car.primaryImageUrl} alt={carName(car)} loading="lazy" decoding="async" /> : <div className="journey-listing-no-image"><Icon name="directions_car" /><span>Chưa có ảnh xe</span></div>}
                    </div>
                    <div className="journey-listing-face">
                        <h3>{carName(car)}</h3>
                        {open ? null : <button type="button" aria-expanded="false" onClick={() => toggle(car.id)}>Xem chi tiết</button>}
                    </div>
                    {open ? <div className="journey-listing-detail">
                            <button type="button" aria-expanded="true" onClick={() => toggle(car.id)}>Thu gọn</button>
                            <p>{[car.district, car.city].filter(Boolean).join(", ") || "Liên hệ chủ xe về địa điểm"}</p>
                            {facts ? <p>{facts}</p> : null}
                            <p className="journey-listing-price">{car.rentalPricePerDay != null ? <><strong>{formatMoney(car.rentalPricePerDay)}</strong><span>/ngày tham khảo</span></> : <strong>Liên hệ để hỏi giá</strong>}</p>
                            <Link to={`/cars/${car.id}`}>Xem tin &amp; liên hệ <span aria-hidden="true">↗</span></Link>
                        </div> : null}
                </article>;
            })}
        </div>
    </section>;
}

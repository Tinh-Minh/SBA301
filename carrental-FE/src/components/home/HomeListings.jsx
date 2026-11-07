import { useCallback, useState } from "react";
import { Link } from "react-router";
import { Icon } from "@/components/Icon.jsx";
import { LiveState } from "@/components/LiveUi.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { carService } from "@/services/vehicleService.js";
import { carName, carTypeLabels, formatMoney, transmissionLabels } from "@/utils/labels.js";

const loadLatest = () => carService.search({ size:4 });

const filters = [["", "Tất cả"], ["SEDAN", "Sedan"], ["SUV", "SUV"], ["MPV", "MPV"]];

export function HomeListings() {
    const [carType, setCarType] = useState("");
    const latest = useApiQuery(["vehicles", "home-listings", ""], loadLatest, { requiresAuth:false });
    const load = useCallback(() => carService.search({ carType:carType || undefined, size:4 }), [carType]);
    const filtered = useApiQuery(["vehicles", "home-listings", carType], load, { requiresAuth:false, enabled:Boolean(carType) });
    const result = carType ? filtered : latest;
    if (!latest.data?.content?.length) return null;
    const cars = result.data?.content ?? [];
    return <section className="journey-fleet" id="journey-fleet" data-car-stop="fleet" data-native aria-labelledby="home-listings-title">
        <div className="journey-listings-header">
            <div><h2 id="home-listings-title">Tin đăng mới nhất</h2><p>Giá tham khảo do chủ xe cung cấp.</p></div>
            <div className="journey-listing-filters" role="group" aria-label="Lọc loại xe">
                {filters.map(([type, label]) => <button key={type} type="button" aria-pressed={carType === type} onClick={() => setCarType(type)}>{label}</button>)}
            </div>
        </div>
        <LiveState loading={result.loading && !result.data} error={result.error ? { message:"Không thể tải tin đăng. Vui lòng thử lại." } : null} empty={false} label="tin đăng phù hợp" onRetry={result.reload} />
        {result.data && !cars.length && !result.error ? <div className="journey-listings-empty">
            <h3>Chưa có tin đăng thuộc loại xe này.</h3>
            <p>Thử chọn loại xe khác hoặc xem tất cả tin đăng.</p>
            <button type="button" onClick={() => setCarType("")}>Xem tất cả tin đăng</button>
        </div> : null}
        {cars.length ? <div className="journey-listings-grid">
            {cars.map(car => <article key={car.id} className="journey-listing" data-vehicle-card={car.carType}>
                {car.primaryImageUrl ? <img src={car.primaryImageUrl} alt={carName(car)} loading="lazy" decoding="async" /> : <div className="journey-listing-no-image"><Icon name="directions_car" /><span>Chưa có ảnh xe</span></div>}
                <div className="journey-listing-body">
                    <p>{[car.district, car.city].filter(Boolean).join(", ") || "Liên hệ chủ xe về địa điểm"}</p>
                    <h3>{carName(car)}</h3>
                    <p>{[carTypeLabels[car.carType], car.seats ? `${car.seats} chỗ` : null, transmissionLabels[car.transmission]].filter(Boolean).join(" · ")}</p>
                    <div className="journey-listing-price">{car.rentalPricePerDay != null ? <><strong>{formatMoney(car.rentalPricePerDay)}</strong><span>/ngày tham khảo</span></> : <strong>Liên hệ để hỏi giá</strong>}</div>
                    <Link to={`/cars/${car.id}`}>Xem tin &amp; liên hệ <span aria-hidden="true">↗</span></Link>
                </div>
            </article>)}
        </div> : null}
    </section>;
}

import { Icon } from "@/components/Icon.jsx";
import { useNavigate } from "react-router";

export function HomeSearch() {
    const navigate = useNavigate();
    function search(event) {
        event.preventDefault();
        const fields = new FormData(event.currentTarget);
        const params = new URLSearchParams();
        for (const [key, value] of fields) if (value) params.set(key, value);
        navigate(`/explore?${params}`);
    }
    return <form className="journey-search-form" id="home-search" onSubmit={search} data-native>
        <div className="journey-search-heading"><h3><Icon name="search" />Tìm chiếc xe phù hợp</h3><p>Liên hệ trực tiếp với chủ xe</p></div>
        <div className="journey-search-fields">
            <label><span><Icon name="location_on" />Thành phố</span><input aria-label="Thành phố" name="city" placeholder="Hồ Chí Minh, Hà Nội…" /></label>
            <label><span><Icon name="directions_car" />Loại xe</span><select aria-label="Loại xe" name="carType" defaultValue=""><option value="">Tất cả loại xe</option><option value="SEDAN">Sedan</option><option value="SUV">SUV</option><option value="MPV">MPV</option><option value="HATCHBACK">Hatchback</option><option value="PICKUP">Bán tải</option><option value="LUXURY">Hạng sang</option><option value="OTHER">Khác</option></select></label>
            <label><span><Icon name="payments" />Giá ngày tối đa (đ)</span><input aria-label="Giá ngày tối đa (đ)" name="maxPrice" type="number" min="0" step="1" placeholder="Ví dụ: 1000000" /></label>
            <button type="submit"><Icon name="search" />Tìm xe ngay</button>
        </div>
    </form>;
}

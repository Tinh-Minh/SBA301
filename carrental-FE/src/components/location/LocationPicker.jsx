import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { locationLabel, setDeliveryLocation, useDeliveryLocation, DELIVERY_FREE_KM, DELIVERY_FEE_PER_KM } from "@/utils/delivery.js";
import { formatMoney } from "@/utils/labels.js";

let adminData; // [[tỉnh, [[huyện, [xã...]]...]]...] – 63 tỉnh/thành (trước sáp nhập 2025)
function useAdminData() {
    const [data, setData] = useState(adminData ?? null);
    useEffect(() => {
        if (adminData) return;
        fetch("/data/vn-admin.json").then(r => r.json()).then(d => { adminData = d; setData(d); }).catch(() => setData([]));
    }, []);
    return data;
}

const selectClass = "w-full rounded-xl border border-[#D6D3CB] bg-white px-3 py-2.5 text-sm disabled:bg-[#F6F5F1] disabled:text-[#8A887F]";
const VN_CENTER = [16.05, 106.5];

/** Bản đồ Leaflet: bấm hoặc kéo ghim để chọn điểm giao xe. */
function MapPick({ point, onPick }) {
    const host = useRef(null);
    const map = useRef(null);
    const marker = useRef(null);
    useEffect(() => {
        let disposed = false;
        import("leaflet").then(({ default: L }) => {
            if (disposed || !host.current || map.current) return;
            map.current = L.map(host.current, { zoomControl: true }).setView(point ? [point.lat, point.lng] : VN_CENTER, point ? 15 : 5);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(map.current);
            const icon = L.divIcon({ className: "", html: '<div style="width:18px;height:18px;border-radius:50%;background:#fc6c26;border:3px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.4)"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });
            const place = latlng => {
                if (!marker.current) {
                    marker.current = L.marker(latlng, { draggable: true, icon }).addTo(map.current);
                    marker.current.on("dragend", e => onPick(e.target.getLatLng()));
                } else marker.current.setLatLng(latlng);
            };
            if (point) place([point.lat, point.lng]);
            map.current.on("click", e => { place(e.latlng); onPick(e.latlng); });
            map.current._place = place;
        });
        return () => { disposed = true; map.current?.remove(); map.current = null; marker.current = null; };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (point && map.current?._place) { map.current._place([point.lat, point.lng]); map.current.setView([point.lat, point.lng], Math.max(map.current.getZoom(), 15)); }
    }, [point?.lat, point?.lng]); // eslint-disable-line react-hooks/exhaustive-deps
    return <div ref={host} className="h-64 w-full overflow-hidden rounded-xl border border-[#D6D3CB]" role="application" aria-label="Bản đồ chọn điểm giao xe"/>;
}

/**
 * Chọn địa điểm nhận xe: Tỉnh/Thành → Quận/Huyện → Phường/Xã + số nhà, và toạ độ (vị trí hiện tại hoặc chấm trên bản đồ)
 * để tính phí giao xe. Lưu chung cho cả trang Thuê xe và trang chi tiết xe.
 */
export function LocationPicker({ compact = false }) {
    const saved = useDeliveryLocation();
    const data = useAdminData();
    const [draft, setDraft] = useState(() => saved ?? { province: "", district: "", ward: "", street: "", lat: null, lng: null });
    const [open, setOpen] = useState(!compact || !saved);
    const [locating, setLocating] = useState(false);
    const [message, setMessage] = useState("");

    const districts = useMemo(() => data?.find(p => p[0] === draft.province)?.[1] ?? [], [data, draft.province]);
    const wards = useMemo(() => districts.find(d => d[0] === draft.district)?.[1] ?? [], [districts, draft.district]);
    const point = draft.lat != null ? { lat: draft.lat, lng: draft.lng } : null;
    const complete = draft.province && draft.district && draft.ward && point;

    const update = patch => setDraft(d => ({ ...d, ...patch }));
    function useMyLocation() {
        if (!navigator.geolocation) { setMessage("Trình duyệt không hỗ trợ định vị. Hãy chấm điểm trên bản đồ."); return; }
        setLocating(true); setMessage("");
        navigator.geolocation.getCurrentPosition(
            pos => { setLocating(false); update({ lat: +pos.coords.latitude.toFixed(6), lng: +pos.coords.longitude.toFixed(6) }); },
            () => { setLocating(false); setMessage("Không lấy được vị trí (bạn có thể đã từ chối quyền). Hãy chấm điểm trên bản đồ."); },
            { enableHighAccuracy: true, timeout: 10000 });
    }
    function save() {
        if (!complete) { setMessage("Vui lòng chọn đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã và vị trí trên bản đồ."); return; }
        setDeliveryLocation({ ...draft, street: draft.street.trim() });
        setMessage("");
        if (compact) setOpen(false);
    }

    if (compact && !open) {
        return <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E7E5DF] bg-white px-3 py-2.5 text-sm">
            <span className="min-w-0"><span className="text-[#8A887F]">Nhận xe tại: </span><b className="break-words">{locationLabel(saved)}</b></span>
            <span className="flex gap-3">
                <button type="button" onClick={() => setOpen(true)} className="font-semibold underline underline-offset-4">Đổi</button>
                <button type="button" onClick={() => { setDeliveryLocation(null); setDraft({ province: "", district: "", ward: "", street: "", lat: null, lng: null }); setOpen(true); }} className="text-[#8A887F] underline underline-offset-4">Xoá</button>
            </span>
        </div>;
    }

    return <div className="flex flex-col gap-3 rounded-xl border border-[#E7E5DF] bg-white p-3">
        <div className="grid gap-2 sm:grid-cols-3">
            <label className="text-xs font-semibold text-[#57564F]">Tỉnh / Thành phố
                <select className={`${selectClass} mt-1`} value={draft.province} disabled={!data} onChange={e => update({ province: e.target.value, district: "", ward: "" })}>
                    <option value="">{data ? "Chọn tỉnh/thành" : "Đang tải…"}</option>
                    {data?.map(p => <option key={p[0]} value={p[0]}>{p[0]}</option>)}
                </select></label>
            <label className="text-xs font-semibold text-[#57564F]">Quận / Huyện
                <select className={`${selectClass} mt-1`} value={draft.district} disabled={!draft.province} onChange={e => update({ district: e.target.value, ward: "" })}>
                    <option value="">Chọn quận/huyện</option>
                    {districts.map(d => <option key={d[0]} value={d[0]}>{d[0]}</option>)}
                </select></label>
            <label className="text-xs font-semibold text-[#57564F]">Phường / Xã
                <select className={`${selectClass} mt-1`} value={draft.ward} disabled={!draft.district} onChange={e => update({ ward: e.target.value })}>
                    <option value="">Chọn phường/xã</option>
                    {wards.map(w => <option key={w} value={w}>{w}</option>)}
                </select></label>
        </div>
        <label className="text-xs font-semibold text-[#57564F]">Số nhà, tên đường (tuỳ chọn)
            <input value={draft.street} maxLength={150} onChange={e => update({ street: e.target.value })} placeholder="VD: 12 Nguyễn Huệ" className={`${selectClass} mt-1`}/></label>
        <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-[#57564F]">Chấm vị trí nhận xe trên bản đồ để tính phí giao: miễn phí {DELIVERY_FREE_KM} km đầu, sau đó {formatMoney(DELIVERY_FEE_PER_KM)}/km.</p>
            <button type="button" onClick={useMyLocation} disabled={locating} className="rounded-lg border border-[#D6D3CB] px-3 py-1.5 text-xs font-semibold">{locating ? "Đang định vị…" : "📍 Dùng vị trí của tôi"}</button>
        </div>
        <MapPick point={point} onPick={ll => update({ lat: +ll.lat.toFixed(6), lng: +ll.lng.toFixed(6) })}/>
        {message ? <p role="alert" className="text-xs font-semibold text-[#B91C1C]">{message}</p> : null}
        <div className="flex justify-end gap-2">
            {compact && saved ? <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-[#D6D3CB] px-3 py-2 text-sm font-semibold">Huỷ</button> : null}
            <button type="button" onClick={save} className="rounded-lg bg-[#FC6C26] px-4 py-2 text-sm font-bold text-white">Lưu địa điểm</button>
        </div>
    </div>;
}

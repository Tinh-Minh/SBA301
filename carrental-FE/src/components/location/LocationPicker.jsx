import { useEffect, useMemo, useState } from "react";
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
/**
 * Tra toạ độ tâm phường/xã (rơi về quận/huyện, rồi tỉnh) bằng Nominatim của OpenStreetMap.
 * Chỉ gửi tên đơn vị hành chính, không gửi số nhà/tên đường của khách.
 */
async function geocode({ ward, district, province }) {
    const tries = [[ward, district, province], [district, province], [province]];
    for (const parts of tries) {
        const q = encodeURIComponent([...parts, "Việt Nam"].filter(Boolean).join(", "));
        try {
            const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=vn&accept-language=vi&q=${q}`);
            const hit = (await r.json())?.[0];
            if (hit) return { lat: +Number(hit.lat).toFixed(6), lng: +Number(hit.lon).toFixed(6) };
        } catch { /* thử cấp lớn hơn */ }
    }
    return null;
}

/**
 * Chọn địa điểm nhận xe: Tỉnh/Thành → Quận/Huyện → Phường/Xã + số nhà. Toạ độ tâm phường/xã được tra tự động
 * khi lưu để tính phí giao xe (ước tính). Lưu chung cho cả trang Thuê xe và trang chi tiết xe.
 */
export function LocationPicker({ compact = false }) {
    const saved = useDeliveryLocation();
    const data = useAdminData();
    const [draft, setDraft] = useState(() => saved ?? { province: "", district: "", ward: "", street: "", lat: null, lng: null });
    const [open, setOpen] = useState(!compact || !saved);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const districts = useMemo(() => data?.find(p => p[0] === draft.province)?.[1] ?? [], [data, draft.province]);
    const wards = useMemo(() => districts.find(d => d[0] === draft.district)?.[1] ?? [], [districts, draft.district]);
    const complete = draft.province && draft.district && draft.ward;

    // Đổi đơn vị hành chính thì toạ độ cũ không còn đúng.
    const update = patch => setDraft(d => ({ ...d, ...patch, ...("street" in patch ? {} : { lat: null, lng: null }) }));
    async function save() {
        if (!complete) { setMessage("Vui lòng chọn đủ Tỉnh/Thành, Quận/Huyện và Phường/Xã."); return; }
        setSaving(true); setMessage("");
        const point = draft.lat != null ? { lat: draft.lat, lng: draft.lng } : await geocode(draft);
        setSaving(false);
        setDeliveryLocation({ ...draft, street: draft.street.trim(), lat: point?.lat ?? null, lng: point?.lng ?? null });
        if (!point) setMessage("Đã lưu địa chỉ nhưng chưa xác định được vị trí để tính phí giao xe.");
        if (compact && point) setOpen(false);
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
        <p className="text-xs text-[#57564F]">Phí giao xe tính theo khoảng cách ước tính từ xe đến phường/xã bạn chọn: miễn phí {DELIVERY_FREE_KM} km đầu, sau đó {formatMoney(DELIVERY_FEE_PER_KM)}/km.</p>
        {message ? <p role="alert" className="text-xs font-semibold text-[#B91C1C]">{message}</p> : null}
        <div className="flex justify-end gap-2">
            {compact && saved ? <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-[#D6D3CB] px-3 py-2 text-sm font-semibold">Huỷ</button> : null}
            <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-[#FC6C26] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{saving ? "Đang xác định vị trí…" : "Lưu địa điểm"}</button>
        </div>
    </div>;
}

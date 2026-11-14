import { useState } from "react";
import { Icon } from "@/components/Icon.jsx";
import { uploadImage } from "@/services/tripService.js";

/** Chọn/chụp ảnh từ máy (tải lên CarDB) và xem trước. */
export function PhotoInput({ value, onChange, label = "Chụp / chọn ảnh" }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    async function pick(event) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { setError("Ảnh tối đa 5MB."); return; }
        setBusy(true);
        setError("");
        try { onChange(await uploadImage(file), file); }
        catch (e) { setError(e.message); }
        finally { setBusy(false); }
    }
    return <div className="flex items-center gap-3">
    <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-[#D4D4D2] bg-[#F7F7F5]">
      {value ? <img src={value} alt="" className="h-full w-full object-cover"/> : <Icon name="photo_camera" className="text-[24px] text-[#A3A3A3]"/>}
    </div>
    <div className="flex flex-col gap-1">
      <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#E9E9E7] bg-white px-3 py-1.5 text-xs font-bold text-[#292929] hover:border-[#FC6C26]">
        <Icon name="photo_camera" className="text-[16px]"/>{busy ? "Đang tải…" : value ? "Đổi ảnh" : label}
        <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="sr-only" disabled={busy} onChange={pick}/>
      </label>
      {error ? <span role="alert" className="text-xs text-[#B91C1C]">{error}</span> : null}
    </div>
  </div>;
}

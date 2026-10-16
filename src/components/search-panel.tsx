"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./icon";

const modes = [
  ["self", "Tự lái", "directions_car"],
  ["chauffeur", "Có tài xế", "person_pin_circle"],
  ["driver", "Tài xế lái hộ", "sports_motorsports"],
] as const;

function RentalDateField({ name, label, defaultValue }: { name: "start" | "end"; label: string; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  const [date, time] = value.split("T");
  const [year, month, day] = date.split("-");
  return <label className="relative flex min-w-0 flex-col gap-2 rounded-md border border-primary/15 bg-white px-3 py-3 focus-within:border-secondary focus-within:ring-1 focus-within:ring-secondary">
    <span className="flex items-center gap-1 text-xs text-text-muted"><Icon name={name === "start" ? "calendar_today" : "event_available"} className="text-[17px] text-secondary" />{label}</span>
    <span className="flex items-center justify-between gap-1 text-sm font-semibold text-primary"><span>{value ? `${time}, ${day}/${month}/${year}` : "Chọn thời gian"}</span><Icon name="calendar_today" className="text-[14px] text-text-muted" /></span>
    <input required aria-label={name === "start" ? "Thời gian nhận xe" : "Thời gian trả xe"} type="datetime-local" name={name} value={value} onChange={event => setValue(event.target.value)} onClick={event => { event.currentTarget.showPicker?.(); }} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
  </label>;
}

export function SearchPanel() {
  const router = useRouter();
  const [mode, setMode] = useState("self");
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const start = String(data.get("start"));
    const end = String(data.get("end"));
    if (new Date(end) <= new Date(start)) { setError("Thời gian trả xe phải sau thời gian nhận xe."); return; }
    const params = new URLSearchParams({ location: String(data.get("location")), start, end, mode, filter });
    router.push(`${mode === "self" ? "/thue-xe-tu-lai" : "/xe-kem-tai-xe"}?${params}#danh-sach-xe`);
  }
  return <div className="search-console home-search mt-6">
    <div role="tablist" aria-label="Loại dịch vụ" className="flex max-w-full gap-5 border-b border-primary/15">
      {modes.map(([value, label]) => <button key={value} role="tab" type="button" aria-selected={mode === value} aria-controls="search-service-panel" onClick={() => setMode(value)} className={`flex items-center justify-center border-b-2 py-3 text-xs font-semibold transition-colors sm:text-sm ${mode === value ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-primary"}`}>{label}</button>)}
    </div>
    <form onSubmit={search} id="search-service-panel" role="tabpanel" className="mt-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex min-w-0 flex-col gap-2 rounded-md border border-primary/15 bg-white px-3 py-3 focus-within:border-secondary sm:col-span-2"><span className="flex items-center gap-1 text-xs text-text-muted"><Icon name="location_on" className="text-[17px] text-secondary" />{mode === "self" ? "Địa điểm nhận & trả xe" : mode === "chauffeur" ? "Điểm đón khách" : "Điểm đón tài xế"}</span><input name="location" required list="pickup-locations" defaultValue="TP. Hồ Chí Minh" className="min-w-0 bg-transparent text-sm font-semibold text-primary outline-none" placeholder="Thành phố, sân bay hoặc địa chỉ" /><datalist id="pickup-locations"><option>TP. Hồ Chí Minh</option><option>Hà Nội</option><option>Đà Nẵng</option><option>Sân bay Tân Sơn Nhất</option><option>Sân bay Nội Bài</option><option>Cần Thơ</option><option>Nha Trang</option></datalist></label>
        <RentalDateField name="start" label="Bắt đầu" defaultValue="2026-10-24T20:00" />
        <RentalDateField name="end" label="Kết thúc" defaultValue="2026-10-26T20:00" />
      </div>
      {error ? <p role="alert" className="mt-3 text-sm text-error">{error}</p> : null}
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2"><span className="text-xs text-text-muted">Ưu tiên:</span>{[["ev", "Xe điện (EV)"], ["suv", "SUV 7 chỗ"]].map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(current => current === value ? "" : value)} className={`rounded-sm border px-2 py-1.5 text-xs transition-colors ${filter === value ? "border-primary bg-primary text-white" : "border-primary/15 text-on-surface-variant hover:border-primary/40"}`}>{label}</button>)}</div>
        <button type="submit" className="conversion-button flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-3.5 text-sm font-semibold text-on-surface hover:brightness-105"><Icon name="search" className="text-[20px]" />Tìm xe ngay</button>
      </div>
    </form>
  </div>;
}

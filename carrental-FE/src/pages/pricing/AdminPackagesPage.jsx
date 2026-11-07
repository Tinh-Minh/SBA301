import { useCallback, useEffect, useRef, useState } from "react";
import { AdminPageHeader, StatusPill } from "@/components/admin/AdminUi.jsx";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { listingPackageService } from "@/services/listingPackageService.js";
import { formatMoney } from "@/utils/labels.js";

const emptyForm = () => ({ name: "", code: "", price: "", durationDays: "7", priorityLevel: "1", badgeLabel: "THƯỜNG", description: "", isActive: true });
const toForm = (item) => ({ name: item.name, code: item.code, price: String(item.price), durationDays: String(item.durationDays), priorityLevel: String(item.priorityLevel), badgeLabel: item.badgeLabel ?? "", description: item.description ?? "", isActive: item.isActive });
const accessibleInput = "w-full rounded-xl border border-[#767676] bg-white px-3 py-2 text-sm text-[#292929] focus-visible:outline-[#B9430C] focus-visible:border-[#B9430C]";

export default function AdminPackagesPage() {
    const load = useCallback(() => listingPackageService.adminList(), []);
    const list = useApiQuery(["admin", "listing-packages"], load);
    const rows = list.data ?? [];
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const nameInput = useRef(null);
    const createButton = useRef(null);
    const formTrigger = useRef(null);
    const focusReady = useRef(false);
    useEffect(() => {
        if (!focusReady.current) {
            focusReady.current = true;
            return;
        }
        if (showForm) {
            nameInput.current?.focus();
            return;
        }
        const trigger = formTrigger.current;
        (trigger?.isConnected ? trigger : createButton.current)?.focus();
        formTrigger.current = null;
    }, [showForm]);
    const submit = useApiMutation(async () => editingId === null
        ? listingPackageService.create(form)
        : listingPackageService.update(editingId, form), async () => {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm());
        await list.reload();
    });

    function startCreate(event) {
        formTrigger.current = event.currentTarget;
        setEditingId(null);
        setForm(emptyForm());
        setShowForm(true);
    }
    function startEdit(item, event) {
        formTrigger.current = event.currentTarget;
        setEditingId(item.id);
        setForm(toForm(item));
        setShowForm(true);
    }
    function update(key) {
        return event => setForm(current => ({ ...current, [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));
    }
    function submitForm(event) {
        event.preventDefault();
        if (event.currentTarget.reportValidity()) void submit.run();
    }

    return <div className="flex flex-col gap-5">
      <AdminPageHeader code="A08" title="Gói đăng tin" description="Quản lý giá, thời hạn và trạng thái các gói hiển thị tin xe." actions={<button ref={createButton} type="button" onClick={startCreate} className="min-h-10 rounded-xl bg-[#B9430C] px-4 py-2 text-sm font-bold text-white hover:bg-[#8F3208] focus-visible:outline-[#B9430C]" aria-expanded={showForm} aria-controls="listing-package-form">+ Tạo gói</button>}/>
      <form id="listing-package-form" hidden={!showForm} aria-labelledby="listing-package-form-title" aria-busy={submit.running} onSubmit={submitForm} className="grid gap-3 rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm sm:grid-cols-2">
        <h2 id="listing-package-form-title" className="sm:col-span-2 text-lg font-bold">{editingId === null ? "Tạo gói mới" : `Chỉnh sửa gói #${editingId}`}</h2>
        <label className="flex flex-col gap-1 text-xs font-semibold text-[#666666]">Tên gói<input ref={nameInput} required maxLength={100} value={form.name} onChange={update("name")} className={accessibleInput}/></label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-[#666666]">Mã gói<input required disabled={editingId !== null} maxLength={50} pattern="[A-Za-z0-9_-]+" value={form.code} onChange={update("code")} className={`${accessibleInput} disabled:bg-[#F3F4F6]`}/></label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-[#666666]">Giá (đ)<input required type="number" min="0" max="99999999999999" step="1" value={form.price} onChange={update("price")} className={accessibleInput}/></label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-[#666666]">Thời hạn (ngày)<input required type="number" min="1" step="1" value={form.durationDays} onChange={update("durationDays")} className={accessibleInput}/></label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-[#666666]">Mức ưu tiên<select value={form.priorityLevel} onChange={update("priorityLevel")} className={accessibleInput}><option value="1">1 · Tiêu chuẩn</option><option value="2">2 · Nổi bật</option><option value="3">3 · VIP</option></select></label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-[#666666]">Nhãn huy hiệu<input maxLength={50} value={form.badgeLabel} onChange={update("badgeLabel")} className={accessibleInput}/></label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-[#666666] sm:col-span-2">Mô tả<textarea rows="3" value={form.description} onChange={update("description")} className={accessibleInput}/></label>
        <label className="flex items-center gap-2 text-sm font-semibold text-[#292929] sm:col-span-2"><input type="checkbox" checked={form.isActive} onChange={update("isActive")} className="size-4 accent-[#B9430C] focus-visible:outline-[#B9430C]"/> Hiển thị công khai</label>
        {submit.error ? <p role="alert" aria-live="assertive" className="text-sm text-[#B91C1C] sm:col-span-2">{submit.error.message}</p> : null}
        <div className="flex gap-2 sm:col-span-2"><button type="submit" disabled={submit.running} className="min-h-10 rounded-xl bg-[#B9430C] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#8F3208] disabled:opacity-60 focus-visible:outline-[#B9430C]">{submit.running ? "Đang lưu…" : "Lưu gói"}</button><button type="button" onClick={() => setShowForm(false)} className="min-h-10 rounded-xl border border-[#E9E9E7] px-4 py-2 text-sm font-semibold focus-visible:outline-[#B9430C]">Hủy</button></div>
      </form>
      {list.loading && !list.data ? <p role="status" aria-live="polite" className="rounded-2xl border border-[#767676] bg-white p-5 text-sm text-[#666666]">Đang tải gói đăng tin…</p> : null}
      {list.error ? <div role="alert" aria-live="assertive" className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#B91C1C] bg-[#FEF2F2] p-5 text-sm text-[#B91C1C]"><span>{list.error.message}</span><button type="button" onClick={list.reload} className="font-bold underline focus-visible:outline-[#B9430C]">Thử lại</button></div> : null}
      {list.data && !rows.length ? <p role="status" className="rounded-2xl border border-[#767676] bg-white p-5 text-sm text-[#666666]">Chưa có gói đăng tin.</p> : null}
      {rows.length ? <div className="overflow-x-auto rounded-2xl border border-[#E9E9E7] bg-white shadow-sm">
        <table className="min-w-full text-left text-sm"><caption className="sr-only">Các gói đăng tin và trạng thái công khai</caption>
          <thead className="text-[11px] uppercase tracking-wide text-[#666666]"><tr>{["Gói", "Giá", "Thời hạn", "Ưu tiên", "Trạng thái", "Thao tác"].map(label => <th key={label} scope="col" className="whitespace-nowrap px-4 py-3 font-bold">{label}</th>)}</tr></thead>
          <tbody>{rows.map(item => <tr key={item.id} className="border-t border-[#E9E9E7] align-top">
            <th scope="row" className="px-4 py-3 text-left font-normal"><strong className="font-bold">{item.name}</strong><p className="font-mono text-xs text-[#666666]">{item.code}</p>{item.description ? <p className="mt-1 max-w-80 text-xs text-[#666666]">{item.description}</p> : null}</th>
            <td className="whitespace-nowrap px-4 py-3">{formatMoney(item.price)}</td>
            <td className="whitespace-nowrap px-4 py-3">{item.durationDays} ngày</td>
            <td className="px-4 py-3">{item.priorityLevel} · {item.badgeLabel}</td>
            <td className="px-4 py-3"><StatusPill tone={item.isActive ? "success" : "neutral"}>{item.isActive ? "Đang hiển thị" : "Đã ẩn"}</StatusPill></td>
            <td className="px-4 py-3 text-right"><button type="button" onClick={event => startEdit(item, event)} className="min-h-8 font-bold text-[#8F3208] focus-visible:outline-[#B9430C]">Sửa<span className="sr-only"> gói {item.name}</span></button></td>
          </tr>)}</tbody>
        </table>
      </div> : null}
    </div>;
}

"use client";
import { useState } from "react";
import { AdminPageHeader, PrimaryButton, StatusPill } from "@/components/admin/admin-ui";
import { Money } from "@/components/owner/money";
import { loadAdminSeed } from "@/services/mock/admin-db";

const empty = { code: "", discountType: "PERCENT", value: "15", maxDiscount: "500000", minOrderAmount: "2000000", limit: "200" };

export default function AdminVouchers() {
    const [vouchers, setVouchers] = useState(() => loadAdminSeed().vouchers);
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState(empty);

    function save(event) {
        event.preventDefault();
        setVouchers(list => [{ id: `vc-${Date.now()}`, code: draft.code.toUpperCase(), discountType: draft.discountType, value: Number(draft.value), maxDiscount: Number(draft.maxDiscount), minOrderAmount: Number(draft.minOrderAmount), used: 0, limit: Number(draft.limit), status: "ACTIVE" }, ...list]);
        setDraft(empty);
        setOpen(false);
    }

    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A04" title="Quản lý Voucher & Khuyến mãi" description="Ngân sách voucher do CarDB tài trợ, không trừ vào thực nhận của chủ xe." actions={<button type="button" onClick={() => setOpen(true)} className="whitespace-nowrap rounded-xl bg-[#FC6C26] px-4 py-2.5 text-sm font-bold text-white">+ Tạo chiến dịch Voucher mới</button>}/>
    <p className="rounded-2xl border border-[#E9E9E7] bg-white px-4 py-3 text-sm text-[#292929]">100% ngân sách Voucher do nền tảng CarDB tài trợ, không trừ vào thực nhận của chủ xe.</p>
    <div className="overflow-x-auto rounded-2xl border border-[#E9E9E7] bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="text-[11px] uppercase tracking-wide text-[#666666]"><tr>{["Mã", "Loại giảm", "Giảm tối đa", "Đơn tối thiểu", "Lượt dùng / Giới hạn", "Trạng thái"].map(head => <th key={head} className="whitespace-nowrap px-4 py-3 font-bold">{head}</th>)}</tr></thead>
        <tbody>
          {vouchers.map(item => <tr key={item.id} className="border-t border-[#E9E9E7]">
            <td className="whitespace-nowrap px-4 py-3 font-mono font-bold text-[#292929]">{item.code}</td>
            <td className="whitespace-nowrap px-4 py-3">{item.discountType === "PERCENT" ? `PERCENT ${item.value}%` : <span>FIXED <Money amount={item.value}/></span>}</td>
            <td className="whitespace-nowrap px-4 py-3"><Money amount={item.maxDiscount}/></td>
            <td className="whitespace-nowrap px-4 py-3"><Money amount={item.minOrderAmount}/></td>
            <td className="whitespace-nowrap px-4 py-3">{item.used}/{item.limit}</td>
            <td className="px-4 py-3"><StatusPill tone={item.status === "ACTIVE" ? "success" : "warning"}>{item.status === "ACTIVE" ? "Đang chạy" : "Tạm dừng"}</StatusPill></td>
          </tr>)}
        </tbody>
      </table>
    </div>
    {open ? <aside className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-[#292929]">Tạo voucher mới</h2>
      <form onSubmit={save} className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Mã voucher" value={draft.code} onChange={value => setDraft({ ...draft, code: value })}/>
        <label className="text-sm font-semibold text-[#292929]">Loại giảm
          <select value={draft.discountType} onChange={event => setDraft({ ...draft, discountType: event.target.value })} className="mt-1 w-full rounded-xl border border-[#E9E9E7] px-3 py-2">
            <option value="PERCENT">PERCENT</option>
            <option value="FIXED">FIXED</option>
          </select>
        </label>
        <Field label="Giá trị" value={draft.value} onChange={value => setDraft({ ...draft, value })}/>
        <Field label="Giảm tối đa" value={draft.maxDiscount} onChange={value => setDraft({ ...draft, maxDiscount: value })}/>
        <Field label="Đơn tối thiểu" value={draft.minOrderAmount} onChange={value => setDraft({ ...draft, minOrderAmount: value })}/>
        <Field label="Giới hạn lượt" value={draft.limit} onChange={value => setDraft({ ...draft, limit: value })}/>
        <div className="sm:col-span-2"><PrimaryButton type="submit">Lưu chiến dịch</PrimaryButton></div>
      </form>
    </aside> : null}
  </div>;
}

function Field({ label, value, onChange }) {
    return <label className="text-sm font-semibold text-[#292929]">{label}
    <input value={value} onChange={event => onChange(event.target.value)} className="mt-1 w-full rounded-xl border border-[#E9E9E7] px-3 py-2 font-normal"/>
  </label>;
}

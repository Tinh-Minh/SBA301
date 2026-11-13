import { useEffect, useState } from "react";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { request } from "@/services/api.js";
import { fieldClass } from "@/components/LiveUi.jsx";

const bankService = {
    get: () => request("/api/customers/me/bank-account"),
    save: (body) => request("/api/customers/me/bank-account", { method: "PUT", json: body }),
};

const BANKS = ["Vietcombank", "VietinBank", "BIDV", "Agribank", "Techcombank", "MB Bank", "ACB", "VPBank",
    "Sacombank", "TPBank", "VIB", "HDBank", "SHB", "OCB", "SeABank", "Eximbank", "MSB", "LPBank", "Nam A Bank"];

/**
 * Tài khoản ngân hàng nhận tiền hoàn cọc (khách) / tiền thuê (chủ xe).
 * Tên chủ tài khoản phải trùng họ tên trên hồ sơ (không dấu, viết hoa).
 */
export function BankAccountSection({ fullName }) {
    const query = useApiQuery(["bank-account", "me"], bankService.get);
    const [form, setForm] = useState({ accountNumber: "", bankName: "", bankBranch: "", accountHolder: "" });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [note, setNote] = useState("");
    useEffect(() => {
        if (query.data) {
            setForm({
                accountNumber: query.data.accountNumber ?? "",
                bankName: query.data.bankName ?? "",
                bankBranch: query.data.bankBranch ?? "",
                accountHolder: query.data.accountHolder ?? "",
            });
        }
    }, [query.data]);
    const set = key => event => setForm(prev => ({ ...prev, [key]: event.target.value }));

    async function save(event) {
        event.preventDefault();
        setBusy(true); setError(""); setNote("");
        try { await bankService.save(form); await query.reload(); setNote("Đã lưu tài khoản ngân hàng."); }
        catch (e) { setError(e.message); }
        finally { setBusy(false); }
    }

    return <section className="flex flex-col gap-3 rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-bold">Tài khoản ngân hàng nhận tiền</h2>
        <p className="text-xs text-[#666666]">Bắt buộc để đặt xe (nhận tiền hoàn cọc) và để xác nhận đơn cho thuê (nhận tiền thuê). Admin chuyển khoản trong 1–3 ngày làm việc.</p>
        {query.data && !query.data.configured ? <p className="mt-2 rounded-xl bg-[#FFF7ED] p-2 text-xs font-semibold text-[#9A3412]">Bạn chưa khai báo tài khoản ngân hàng.</p> : null}
      </div>
      <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-[#666666]">Số tài khoản
          <input required inputMode="numeric" pattern="[0-9]{6,20}" maxLength={20} value={form.accountNumber} onChange={set("accountNumber")} className={`${fieldClass} mt-1`} placeholder="Chỉ gồm chữ số"/>
        </label>
        <label className="text-xs font-semibold text-[#666666]">Ngân hàng
          <input required list="bank-list" maxLength={100} value={form.bankName} onChange={set("bankName")} className={`${fieldClass} mt-1`} placeholder="VD: Vietcombank"/>
          <datalist id="bank-list">{BANKS.map(bank => <option key={bank} value={bank}/>)}</datalist>
        </label>
        <label className="text-xs font-semibold text-[#666666]">Chi nhánh / Phòng giao dịch
          <input required maxLength={150} value={form.bankBranch} onChange={set("bankBranch")} className={`${fieldClass} mt-1`} placeholder="VD: Chi nhánh Tân Định - PGD Võ Thị Sáu"/>
        </label>
        <label className="text-xs font-semibold text-[#666666]">Tên chủ tài khoản
          <input required maxLength={150} value={form.accountHolder} onChange={set("accountHolder")} className={`${fieldClass} mt-1 uppercase`} placeholder={fullName ? `Trùng họ tên: ${fullName}` : "Họ tên không dấu"}/>
        </label>
        <div className="flex flex-col gap-1 sm:col-span-2">
          {error ? <p role="alert" className="text-sm text-[#B91C1C]">{error}</p> : note ? <p role="status" className="text-sm text-[#166534]">{note}</p> : null}
          <button type="submit" disabled={busy} className="self-start rounded-xl bg-[#B9430C] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">{busy ? "Đang lưu…" : "Lưu tài khoản ngân hàng"}</button>
        </div>
      </form>
    </section>;
}

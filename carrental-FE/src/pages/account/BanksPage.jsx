import { bankAccountService } from "@/services/accountService.js";
import { useBankAccounts } from "@/hooks/useAccount.js";

import { ProfileLayout } from "@/components/layouts/ProfileLayout.jsx";
import { LiveState } from "@/components/LiveUi.jsx";

import { useApiMutation } from "@/hooks/useApiMutation.js";
import { AddForm } from "@/components/account/BankAccountForm.jsx";

export default function BanksLive() {
    const list = useBankAccounts();
    const setDefault = useApiMutation(bankAccountService.setDefault, list.reload);
    const remove = useApiMutation(bankAccountService.remove, list.reload);
    return <ProfileLayout live active="banks" title="Tài khoản ngân hàng" description="Tài khoản nhận tiền thuê. Số tài khoản hiển thị dạng đã che sau khi lưu.">
    <LiveState loading={list.loading && !list.data} error={list.error} label="tài khoản ngân hàng" onRetry={list.reload}/>
    <div className="flex flex-col gap-3">
      {(list.data ?? []).map(account => <article key={account.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E9E9E7] bg-white p-4 shadow-sm">
        <div>
          <p className="font-bold">{account.bankName} {account.isDefault ? <span className="text-xs text-[#047857]">• Mặc định</span> : null}</p>
          <p className="font-mono text-sm">{account.accountNumber}</p>
          <p className="text-xs text-[#666666]">{account.accountHolder}</p>
        </div>
        <div className="flex gap-2">
          {!account.isDefault ? <button type="button" disabled={setDefault.running} onClick={() => void setDefault.run(account.id)} className="rounded-lg border border-[#E9E9E7] px-3 py-1.5 text-xs font-bold">Đặt mặc định</button> : null}
          <button type="button" disabled={remove.running} onClick={() => { if (window.confirm("Xóa tài khoản này?")) void remove.run(account.id); }} className="rounded-lg border border-[#EF4444] px-3 py-1.5 text-xs font-bold text-[#EF4444]">Xóa</button>
        </div>
      </article>)}
      {list.data && !list.data.length ? <p className="text-sm text-[#666666]">Chưa có tài khoản nào.</p> : null}
      {setDefault.error || remove.error ? <p className="text-sm text-[#B91C1C]">{(setDefault.error ?? remove.error).message}</p> : null}
    </div>
    <AddForm onDone={list.reload}/>
  </ProfileLayout>;
}

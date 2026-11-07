import { useRef, useState } from "react";
import { DateField } from "@/components/DateField.jsx";
import { Primary, fieldClass } from "@/components/LiveUi.jsx";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { formatDate, toLocalDate } from "@/utils/datetime.js";
import { kycStatusLabels } from "@/utils/labels.js";
import { updateSessionAccount } from "@/utils/session.js";
import { changePassword } from "@/services/accountService.js";
import { updateMyProfile } from "@/services/accountService.js";

export function Editor({ profile, kyc, onSaved }) {
    const [editing, setEditing] = useState(false);
    const [fullName, setFullName] = useState(profile.fullName ?? "");
    const [email, setEmail] = useState(profile.email ?? "");
    const [phone, setPhone] = useState(profile.phone ?? "");
    const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
    const [dateOfBirth, setDob] = useState(toLocalDate(profile.dateOfBirth) ?? "");
    const birthDate = useRef(null);
    const [address, setAddress] = useState(profile.address ?? "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const save = useApiMutation(async () => {
        if (birthDate.current && !birthDate.current.reportValidity())
            return;
        const updated = await updateMyProfile({
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            avatarUrl: avatarUrl.trim(),
            dateOfBirth: dateOfBirth || null,
            address: address.trim(),
        });
        updateSessionAccount({ fullName: updated.fullName ?? fullName.trim() });
        setEditing(false);
        onSaved();
    });
    const [passwordNote, setPasswordNote] = useState("");
    const password = useApiMutation(async () => {
        setPasswordNote("");
        await changePassword({ currentPassword, newPassword });
        setCurrentPassword("");
        setNewPassword("");
        setPasswordNote("Đã đổi mật khẩu.");
    });
    return <div className="flex flex-col gap-4"><section className="flex flex-col gap-4 rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold">Thông tin cá nhân</h2>
        <p className="text-sm text-[#666666]">Mã khách hàng #{profile.id} • tham gia {formatDate(profile.createdAt)}</p>
      </div>
      <button type="button" onClick={() => setEditing(value => !value)} className="rounded-xl border border-[#E9E9E7] px-4 py-2 text-sm font-bold">{editing ? "Đóng" : "Chỉnh sửa"}</button>
    </div>
    <dl className="grid gap-3 sm:grid-cols-2">
      <Field label="Họ và tên">{editing ? <input value={fullName} onChange={event => setFullName(event.target.value)} className={fieldClass}/> : <b>{profile.fullName}</b>}</Field>
      <Field label="Email">{editing ? <input type="email" value={email} onChange={event => setEmail(event.target.value)} className={fieldClass}/> : <>{profile.email} {profile.emailVerified ? "• đã xác thực" : ""}</>}</Field>
      <Field label="Số điện thoại">{editing ? <input value={phone} onChange={event => setPhone(event.target.value)} className={fieldClass} placeholder="09xxxxxxxx"/> : (profile.phone || "—")}</Field>
      <Field label="Ngày sinh">{editing ? <DateField ref={birthDate} value={dateOfBirth} onChange={event => setDob(event.target.value)} className={fieldClass}/> : formatDate(profile.dateOfBirth)}</Field>
      <Field label="Trạng thái tài khoản">{profile.status === "LOCKED" ? "Bị khóa" : "Đang hoạt động"}</Field>
      <Field label="KYC">{kycStatusLabels[kyc?.kycStatus] ?? kycStatusLabels[profile.kycStatus] ?? "—"}{kyc?.evaluatedOn ? ` • ${formatDate(kyc.evaluatedOn)}` : ""}</Field>
      <div className="sm:col-span-2"><Field label="Địa chỉ">{editing ? <input value={address} onChange={event => setAddress(event.target.value)} className={fieldClass}/> : (profile.address || "Chưa cập nhật")}</Field></div>
      <div className="sm:col-span-2"><Field label="Ảnh đại diện (URL)">{editing ? <input value={avatarUrl} onChange={event => setAvatarUrl(event.target.value)} className={fieldClass} placeholder="https://..."/> : (profile.avatarUrl || "Chưa có")}</Field></div>
    </dl>
    {save.error ? <p className="text-sm text-[#B91C1C]">{save.error.message}</p> : null}
    {editing ? <Primary disabled={save.running || fullName.trim().length < 2} onClick={() => void save.run()}>{save.running ? "Đang lưu…" : "Lưu thay đổi"}</Primary> : null}
  </section>
  <section className="flex flex-col gap-4 rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
    <h2 className="text-lg font-bold">Đổi mật khẩu</h2>
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-xs font-semibold text-[#666666]">Mật khẩu hiện tại<input type="password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} className={`${fieldClass} mt-1`}/></label>
      <label className="text-xs font-semibold text-[#666666]">Mật khẩu mới<input type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} className={`${fieldClass} mt-1`}/></label>
    </div>
    {password.error ? <p className="text-sm text-[#B91C1C]">{password.error.message}</p> : passwordNote ? <p className="text-sm text-[#166534]">{passwordNote}</p> : null}
    <Primary disabled={password.running || !currentPassword || newPassword.length < 8} onClick={() => void password.run()}>{password.running ? "Đang đổi…" : "Cập nhật mật khẩu"}</Primary>
  </section></div>;
}

function Field({ label, children }) {
    return <div className="rounded-xl bg-[#F7F7F5] p-3 text-sm"><p className="text-[11px] font-bold uppercase text-[#666666]">{label}</p><div className="mt-1 font-semibold text-[#292929]">{children}</div></div>;
}

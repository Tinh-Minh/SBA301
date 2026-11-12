import { useState } from "react";
import { DateField } from "@/components/DateField.jsx";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { formatDate, toLocalDate } from "@/utils/datetime.js";
import { kycStatusLabels } from "@/utils/labels.js";
import { updateSessionAccount } from "@/utils/session.js";
import { changePassword } from "@/services/accountService.js";
import { authenticate } from "@/services/authService.js";
import { updateMyProfile } from "@/services/accountService.js";

const profileInputClass = "w-full rounded-xl border border-[#767676] bg-white px-3 py-2 text-sm text-[#292929] placeholder:text-[#666666] focus-visible:outline-[#B9430C] focus-visible:border-[#B9430C]";

export function Editor({ profile, kyc, onSaved }) {
    const [editing, setEditing] = useState(false);
    const [fullName, setFullName] = useState(profile.fullName ?? "");
    const [email, setEmail] = useState(profile.email ?? "");
    const [phone, setPhone] = useState(profile.phone ?? "");
    const [zaloPhone, setZaloPhone] = useState(profile.zaloPhone ?? "");
    const [contactNote, setContactNote] = useState(profile.contactNote ?? "");
    const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
    const [dateOfBirth, setDob] = useState(toLocalDate(profile.dateOfBirth) ?? "");
    const [address, setAddress] = useState(profile.address ?? "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const save = useApiMutation(async () => {
        const updated = await updateMyProfile({
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            avatarUrl: avatarUrl.trim(),
            zaloPhone,
            contactNote,
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
        // Backend vô hiệu mọi token cấp trước khi đổi mật khẩu, nên đăng nhập lại
        // bằng mật khẩu mới để phiên hiện tại không bị đăng xuất đột ngột.
        await authenticate({ email: profile.email, password: newPassword });
        setCurrentPassword("");
        setNewPassword("");
        setPasswordNote("Đã đổi mật khẩu. Các thiết bị khác sẽ phải đăng nhập lại.");
    });
    return <div className="flex flex-col gap-4"><section aria-busy={save.running} className="flex flex-col gap-4 rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold">Thông tin cá nhân</h2>
        <p className="text-sm text-[#666666]">Mã tài khoản #{profile.id} • tham gia {formatDate(profile.createdAt)}</p>
      </div>
      <button type="button" onClick={() => setEditing(value => !value)} className="min-h-10 rounded-xl border border-[#767676] px-4 py-2 text-sm font-bold focus-visible:outline-[#B9430C]">{editing ? "Đóng" : "Chỉnh sửa"}</button>
    </div>
    <form onSubmit={event => { event.preventDefault(); void save.run(); }} className="flex flex-col gap-4">
      <dl className="grid gap-3 sm:grid-cols-2">
        <Field label="Họ và tên" htmlFor={editing ? "profile-full-name" : undefined}>{editing ? <input id="profile-full-name" required minLength={2} value={fullName} onChange={event => setFullName(event.target.value)} className={profileInputClass}/> : <b>{profile.fullName}</b>}</Field>
        <Field label="Email" htmlFor={editing ? "profile-email" : undefined}>{editing ? <input id="profile-email" type="email" value={email} onChange={event => setEmail(event.target.value)} className={profileInputClass}/> : <>{profile.email} {profile.emailVerified ? "• đã xác thực" : ""}</>}</Field>
        <Field label="Số điện thoại" htmlFor={editing ? "profile-phone" : undefined}>{editing ? <input id="profile-phone" value={phone} onChange={event => setPhone(event.target.value)} className={profileInputClass} placeholder="09xxxxxxxx"/> : (profile.phone || "—")}</Field>
        <Field label="Số điện thoại Zalo" htmlFor={editing ? "profile-zalo-phone" : undefined}>{editing ? <input id="profile-zalo-phone" maxLength={20} value={zaloPhone} onChange={event => setZaloPhone(event.target.value)} className={profileInputClass} placeholder="Số Zalo chủ xe"/> : (profile.zaloPhone || "Chưa cập nhật")}</Field>
        <Field label="Ghi chú liên hệ" htmlFor={editing ? "profile-contact-note" : undefined}>{editing ? <input id="profile-contact-note" maxLength={255} value={contactNote} onChange={event => setContactNote(event.target.value)} className={profileInputClass} placeholder="Ví dụ: vui lòng gọi sau 18h"/> : (profile.contactNote || "Chưa cập nhật")}</Field>
        <Field label="Ngày sinh" htmlFor={editing ? "profile-date-of-birth" : undefined}>{editing ? <DateField id="profile-date-of-birth" value={dateOfBirth} onChange={event => setDob(event.target.value)} className={profileInputClass}/> : formatDate(profile.dateOfBirth)}</Field>
        <Field label="Trạng thái tài khoản">{profile.status === "LOCKED" ? "Bị khóa" : "Đang hoạt động"}</Field>
        <Field label="KYC">{kycStatusLabels[kyc?.kycStatus] ?? kycStatusLabels[profile.kycStatus] ?? "—"}{kyc?.evaluatedOn ? ` • ${formatDate(kyc.evaluatedOn)}` : ""}</Field>
        <div className="sm:col-span-2"><Field label="Địa chỉ" htmlFor={editing ? "profile-address" : undefined}>{editing ? <input id="profile-address" value={address} onChange={event => setAddress(event.target.value)} className={profileInputClass}/> : (profile.address || "Chưa cập nhật")}</Field></div>
        <div className="sm:col-span-2"><Field label="Ảnh đại diện (URL)" htmlFor={editing ? "profile-avatar-url" : undefined}>{editing ? <input id="profile-avatar-url" value={avatarUrl} onChange={event => setAvatarUrl(event.target.value)} className={profileInputClass} placeholder="https://..."/> : (profile.avatarUrl || "Chưa có")}</Field></div>
      </dl>
      {save.error ? <p role="alert" aria-live="assertive" className="text-sm text-[#B91C1C]">{save.error.message}</p> : null}
      {editing ? <button type="submit" disabled={save.running} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#B9430C] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#8F3208] disabled:opacity-60 focus-visible:outline-[#B9430C]">{save.running ? "Đang lưu…" : "Lưu thay đổi"}</button> : null}
    </form>
  </section>
  <section className="flex flex-col gap-4 rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
    <h2 className="text-lg font-bold">Đổi mật khẩu</h2>
    <form onSubmit={event => { event.preventDefault(); void password.run(); }} className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label htmlFor="profile-current-password" className="text-xs font-semibold text-[#666666]">Mật khẩu hiện tại<input id="profile-current-password" required autoComplete="current-password" type="password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} className={`${profileInputClass} mt-1`}/></label>
        <label htmlFor="profile-new-password" className="text-xs font-semibold text-[#666666]">Mật khẩu mới<input id="profile-new-password" required minLength={8} autoComplete="new-password" type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} className={`${profileInputClass} mt-1`}/></label>
      </div>
      {password.error ? <p role="alert" aria-live="assertive" className="text-sm text-[#B91C1C]">{password.error.message}</p> : passwordNote ? <p role="status" aria-live="polite" className="text-sm text-[#166534]">{passwordNote}</p> : null}
      <button type="submit" disabled={password.running} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#B9430C] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#8F3208] disabled:opacity-60 focus-visible:outline-[#B9430C]">{password.running ? "Đang đổi…" : "Cập nhật mật khẩu"}</button>
    </form>
  </section></div>;
}

function Field({ label, htmlFor, children }) {
    return <div className="rounded-xl bg-[#F7F7F5] p-3 text-sm">{htmlFor ? <label htmlFor={htmlFor} className="text-[11px] font-bold uppercase text-[#666666]">{label}</label> : <p className="text-[11px] font-bold uppercase text-[#666666]">{label}</p>}<div className="mt-1 font-semibold text-[#292929]">{children}</div></div>;
}

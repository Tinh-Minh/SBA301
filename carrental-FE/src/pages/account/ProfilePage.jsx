import { useProfile } from "@/hooks/useAccount.js";

import { ProfileLayout } from "@/components/layouts/ProfileLayout.jsx";
import { LiveState } from "@/components/LiveUi.jsx";

import { Editor } from "@/components/account/components/ProfileEditor.jsx";

export default function AccountLive() {
    const detail = useProfile();
    return <ProfileLayout live active="account" title="Hồ sơ cá nhân" description="Thông tin dùng cho hợp đồng thuê và bàn giao xe. Email và số điện thoại phải còn duy nhất trong hệ thống.">
    <LiveState loading={detail.loading && !detail.data} error={detail.error} label="hồ sơ" onRetry={detail.reload}/>
    {detail.data ? <Editor profile={detail.data.profile} kyc={detail.data.kyc} onSaved={detail.reload}/> : null}
  </ProfileLayout>;
}

import { useProfile } from "@/shared/hooks/useAccount.js";

import { ProfileLayout } from "@/shared/layouts/ProfileLayout.jsx";
import { LiveState } from "@/shared/components/LiveUi.jsx";

import { Editor } from "@/features/account/components/ProfileEditor.jsx";

export default function AccountLive() {
    const detail = useProfile();
    return <ProfileLayout live active="account" title="Hồ sơ cá nhân" description="Thông tin dùng cho hợp đồng thuê và bàn giao xe. Email và số điện thoại phải còn duy nhất trong hệ thống.">
    <LiveState loading={detail.loading && !detail.data} error={detail.error} label="hồ sơ" onRetry={detail.reload}/>
    {detail.data ? <Editor profile={detail.data.profile} kyc={detail.data.kyc} onSaved={detail.reload}/> : null}
  </ProfileLayout>;
}

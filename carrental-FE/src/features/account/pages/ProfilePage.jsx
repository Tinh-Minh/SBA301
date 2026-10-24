import { useCallback } from "react";
import { ProfileLayout } from "@/shared/layouts/ProfileLayout.jsx";
import { LiveState } from "@/shared/components/LiveUi.jsx";
import { useApiQuery } from "@/shared/hooks/useApiQuery.js";
import { getMyKyc, getMyProfile } from "@/services/customer.service";

import { Editor } from "@/features/account/components/Editor.jsx";

export default function AccountLive() {
    const load = useCallback(async () => {
        const [profile, kyc] = await Promise.all([getMyProfile(), getMyKyc().catch(() => null)]);
        return { profile, kyc };
    }, []);
    const detail = useApiQuery(["account", "profile"], load);
    return <ProfileLayout live active="account" title="Hồ sơ cá nhân" description="Thông tin dùng cho hợp đồng thuê và bàn giao xe. Email và số điện thoại phải còn duy nhất trong hệ thống.">
    <LiveState loading={detail.loading && !detail.data} error={detail.error} label="hồ sơ" onRetry={detail.reload}/>
    {detail.data ? <Editor profile={detail.data.profile} kyc={detail.data.kyc} onSaved={detail.reload}/> : null}
  </ProfileLayout>;
}


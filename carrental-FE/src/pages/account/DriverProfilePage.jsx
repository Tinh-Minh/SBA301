import { driverService, useDriverProfile } from "@/hooks/useAccount.js";

import { Link } from "react-router";
import { ProfileLayout } from "@/components/layouts/ProfileLayout.jsx";
import { LiveState, Primary } from "@/components/LiveUi.jsx";

import { useApiMutation } from "@/hooks/useApiMutation.js";
import { formatDate } from "@/utils/datetime.js";
import { kycStatusLabels } from "@/utils/labels.js";
import { Item, driverStatus, reasons } from "@/components/account/components/DriverDetails.jsx";

export default function DriverLive() {
    const detail = useDriverProfile();
    const register = useApiMutation(driverService.register, detail.reload);
    const data = detail.data;
    return <ProfileLayout live active="driver" title="Hồ sơ tài xế" description="Đăng ký hồ sơ tài xế sau khi đã xác minh danh tính và giấy phép lái xe.">
    <LiveState loading={detail.loading && !data} error={detail.error} label="hồ sơ tài xế" onRetry={detail.reload}/>
    {data ? <section className="flex flex-col gap-3 rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">{data.driver ? `Tài xế #${data.driver.id}` : "Chưa có hồ sơ tài xế"}</h2>
      {data.driver ? <p className="text-sm">Trạng thái: <b>{driverStatus[data.driver.status] ?? data.driver.status}</b> • tạo {formatDate(data.driver.createdAt)}</p> : null}
      {data.eligibility ? <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <Item term="Đủ điều kiện" value={data.eligibility.eligibleNow ? "Có" : "Chưa"}/>
        <Item term="KYC" value={kycStatusLabels[data.eligibility.kycStatus] ?? data.eligibility.kycStatus}/>
        <Item term="GPLX hợp lệ" value={data.eligibility.hasValidDriverLicense ? "Có" : "Chưa"}/>
        <Item term="Đánh giá ngày" value={formatDate(data.eligibility.evaluatedOn)}/>
      </dl> : null}
      {data.eligibility && !data.eligibility.eligibleNow ? <p className="rounded-xl bg-[#FFFBEB] p-3 text-sm text-[#B45309]">{reasons[data.eligibility.ineligibilityReasonCode] ?? "Chưa đủ điều kiện."}</p> : null}
      {!data.driver ? <>
        {register.error ? <p className="text-sm text-[#B91C1C]">{register.error.message}</p> : null}
        <Primary disabled={register.running} onClick={() => void register.run()}>{register.running ? "Đang đăng ký…" : "Đăng ký hồ sơ tài xế"}</Primary>
      </> : null}
      <Link to="/account/verification" className="text-sm font-bold text-[#FC6C26]">Nộp giấy tờ xác minh</Link>
    </section> : null}
  </ProfileLayout>;
}

import { useState } from "react";
import { AdminPageHeader, Tabs } from "@/shared/components/admin/AdminUi.jsx";
import { Payouts, Transactions, tabs } from "@/features/payouts/components/Payouts.jsx";

export default function AdminPayouts() {
    const [tab, setTab] = useState("payouts");
    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A06" title="Giao dịch & Chi trả" description="Phí nền tảng tính trên tiền thuê theo tỷ lệ hoa hồng của đơn. Chủ xe nhận phần còn lại sau khi chuyến hoàn thành."/>
    <Tabs items={tabs} value={tab} onChange={setTab}/>
    {tab === "payouts" ? <Payouts/> : <Transactions/>}
  </div>;
}

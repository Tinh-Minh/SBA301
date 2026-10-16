"use client";

import { useState } from "react";
import Link from "next/link";
import { HoldButton } from "./hold-button";
import { Icon } from "./icon";

export function PaymentActions({ account = false }: { account?: boolean }) {
  const [status, setStatus] = useState<"pending" | "confirmed" | "cancelled">("pending");
  return <div className="mt-4 space-y-3" data-hold-control="true">
    {status === "pending" ? <>
      {!account ? <HoldButton onComplete={() => setStatus("confirmed")}>Giữ để xác nhận thanh toán</HoldButton> : null}
      <HoldButton danger onComplete={() => setStatus("cancelled")}>Giữ để hủy đặt xe</HoldButton>
      {!account ? <p className="rounded-xl bg-surface-tint p-3 text-xs leading-5 text-text-muted">Giao diện thanh toán mẫu. Không thu tiền và không gửi yêu cầu đặt xe thực tế.</p> : null}
    </> : <div role="status" className={`rounded-2xl border p-5 ${status === "confirmed" ? "border-status-success/20 bg-status-success/5" : "border-error/15 bg-error-container/20"}`}>
      <Icon name={status === "confirmed" ? "check_circle" : "cancel"} className={`text-[32px] ${status === "confirmed" ? "text-status-success" : "text-error"}`} />
      <h3 className="mt-3 text-base font-semibold text-primary">{status === "confirmed" ? "Đã xác nhận thanh toán mẫu" : "Đã hủy đặt xe mẫu"}</h3>
      <p className="mt-2 text-xs leading-6 text-on-surface-variant">{status === "confirmed" ? "Bạn đã hoàn tất thao tác trong bản xem trước. Chưa có giao dịch hoặc đặt xe thực tế." : "Đặt xe mẫu đã được hủy. Không phát sinh phí hoặc giao dịch hoàn tiền."}</p>
      <div className="mt-4 flex flex-wrap gap-3"><Link href="/thue-xe-tu-lai" className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white">Chọn chuyến đi khác</Link><button type="button" onClick={() => setStatus("pending")} className="rounded-full border border-border-subtle px-4 py-2 text-xs text-primary">Xem lại thao tác</button></div>
    </div>}
  </div>;
}

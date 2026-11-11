import { Link, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ConfirmDialog } from "@/components/ConfirmDialog.jsx";
import { fieldClass, LiveState, Primary } from "@/components/LiveUi.jsx";
import { OwnerCrumb, OwnerHeading } from "@/components/owner/OwnerScreen.jsx";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { useListingPackages } from "@/hooks/useSubscriptions.js";
import { useOwnerCars } from "@/hooks/useVehicles.js";
import { ownerRoutes } from "@/routes/paths.js";
import { subscriptionService } from "@/services/subscriptionService.js";
import { formatMoney } from "@/utils/labels.js";
import { packageTitle } from "@/utils/text.js";

const choiceClass = (selected) => `rounded-2xl border bg-white p-4 text-left shadow-sm transition ${selected ? "border-[#FC6C26] ring-2 ring-orange-100" : "border-[#E9E9E7] hover:border-orange-200"}`;
const buySchema = z.object({
    carId: z.coerce.number().int().positive("Chọn xe đã được duyệt"),
    packageId: z.coerce.number().int().positive("Chọn gói đăng tin"),
    voucherCode: z.string().trim().max(50, "Mã voucher tối đa 50 ký tự"),
});

function Step({ number, title, children }) {
    return <section className="flex flex-col gap-3">
    <h2 className="text-base font-bold text-[#292929]">Bước {number}: {title}</h2>
    {children}
  </section>;
}

export default function BuySubscriptionPage() {
    const [searchParams] = useSearchParams();
    const { data: cars, loading: carsLoading, error: carsError, reload: reloadCars } = useOwnerCars();
    const packages = useListingPackages();
    const [carId, setCarId] = useState(searchParams.get("carId") ?? "");
    const [packageId, setPackageId] = useState("");
    const [voucherCode, setVoucherCode] = useState("");
    const [activated, setActivated] = useState(null);

    const [quoted, setQuoted] = useState(null);
    const [formError, setFormError] = useState("");
    const [confirmPay, setConfirmPay] = useState(false);

    const quote = useApiMutation(subscriptionService.quote);
    const buy = useApiMutation(async (appliedVoucher) => {
        const subscription = await subscriptionService.create({ carId, packageId, voucherCode: appliedVoucher });
        // Voucher giảm hết tiền thì gói đã kích hoạt ngay, không cần qua cổng thanh toán.
        if (subscription.status === "ACTIVE") {
            setActivated(subscription);
            return subscription;
        }
        await subscriptionService.payWithVnpay(subscription.id);
        return subscription;
    });

    const approvedCars = (cars ?? []).filter(car => car.status === "ACTIVE");
    const ready = Boolean(carId && packageId);
    function parsed(code = voucherCode) {
        const result = buySchema.safeParse({ carId, packageId, voucherCode: code });
        if (!result.success) {
            setFormError(result.error.issues[0]?.message ?? "Thông tin chưa hợp lệ");
            return null;
        }
        setFormError("");
        return result.data;
    }

    // Xe hoặc gói đổi thì tính lại tổng tiền; mã voucher chỉ áp khi người dùng bấm Áp dụng.
    const refreshQuote = async (code) => setQuoted(await quote.run({ carId, packageId, voucherCode: code }) ?? null);
    useEffect(() => {
        if (ready)
            void refreshQuote();
    }, [carId, packageId]);

    if (activated)
        return <div className="flex flex-col gap-3 rounded-2xl border border-[#E9E9E7] bg-white p-6">
      <h1 className="text-xl font-bold text-[#047857]">Tin đăng đã được kích hoạt</h1>
      <p className="text-sm text-[#666666]">{activated.carName} • {activated.packageName}. Còn {activated.daysRemaining} ngày hiển thị.</p>
      <Link to={ownerRoutes.vehicles} className="font-bold text-[#FC6C26]">Về danh sách xe</Link>
    </div>;

    return <div className="flex min-w-0 flex-col gap-6">
    <div className="flex flex-col gap-2">
      <OwnerCrumb homeHref={ownerRoutes.dashboard} parent={{ href: ownerRoutes.subscriptions, label: "Gói đăng tin" }} current="Mua gói"/>
      <OwnerHeading title="Mua gói đăng tin" description="Chọn xe, chọn gói và thanh toán để xe hiển thị trên sàn."/>
    </div>

    <Step number={1} title="Chọn chiếc xe cần đăng tin">
      <LiveState loading={carsLoading && !cars} error={carsError} empty={!!cars && approvedCars.length === 0} label="xe đã được duyệt" onRetry={reloadCars}/>
      <div className="grid gap-3 sm:grid-cols-2">
        {approvedCars.map(car => <button key={car.id} type="button" aria-pressed={String(car.id) === carId} onClick={() => setCarId(String(car.id))} className={choiceClass(String(car.id) === carId)}>
          <span className="block font-bold text-[#292929]">{car.brand} {car.model}</span>
          <span className="block font-mono text-xs text-[#666666]">{car.licensePlate}</span>
        </button>)}
      </div>
    </Step>

    <Step number={2} title="Chọn gói cước">
      <LiveState loading={packages.loading && !packages.data} error={packages.error} empty={!!packages.data && packages.data.length === 0} label="gói đăng tin" onRetry={packages.reload}/>
      <div className="grid gap-3 md:grid-cols-3">
        {(packages.data ?? []).map(item => {
          const slotCount = item.slotCount || (item.code === "PKG_BASIC" ? 3 : item.code === "PKG_STANDARD" ? 5 : item.code === "PKG_VIP" ? 10 : 1);
          const slotDays = item.durationDaysPerSlot || (item.code === "PKG_BASIC" ? 3 : item.code === "PKG_STANDARD" ? 7 : item.code === "PKG_VIP" ? 15 : item.durationDays);
          return <button key={item.id} type="button" aria-pressed={String(item.id) === packageId} onClick={() => setPackageId(String(item.id))} className={choiceClass(String(item.id) === packageId)}>
            <div className="flex items-center justify-between">
              <span className="block text-[11px] font-bold uppercase tracking-wide text-[#FC6C26]">{item.badgeLabel}</span>
              <span className="rounded bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-[#FC6C26]">{slotCount} slots</span>
            </div>
            <span className="mt-1 block font-bold text-[#292929]">{packageTitle(item)}</span>
            <span className="mt-1 block text-lg font-bold text-[#292929]">{formatMoney(item.price)}</span>
            <span className="block text-xs font-semibold text-[#8F3208]">{slotCount} slots × {slotDays} ngày/slot</span>
            <span className="block text-[11px] text-[#666666]">Tổng {item.durationDays} ngày hiển thị</span>
            {item.description ? <span className="mt-2 block text-xs text-[#666666]">{item.description}</span> : null}
          </button>;
        })}
      </div>
    </Step>

    <Step number={3} title="Nhập mã voucher và thanh toán">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#E9E9E7] bg-white p-5">
        <div className="flex gap-2">
          <input value={voucherCode} maxLength={50} onChange={event => setVoucherCode(event.target.value)} placeholder="Mã voucher (nếu có)" aria-label="Mã voucher" className={fieldClass}/>
          <button type="button" disabled={!ready || !voucherCode.trim() || quote.running} onClick={() => { const values = parsed(voucherCode); if (values) void refreshQuote(values.voucherCode); }} className="whitespace-nowrap rounded-xl border border-[#E9E9E7] px-4 py-2 text-sm font-bold text-[#292929] disabled:opacity-50">Áp dụng</button>
        </div>
        {formError ? <p role="alert" className="text-sm text-[#B91C1C]">{formError}</p> : null}
        {quote.error ? <p role="alert" className="text-sm text-[#B91C1C]">{quote.error.message}</p> : null}
        {quoted ? <dl className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between"><dt className="text-[#666666]">Gói cước</dt><dd className="font-semibold text-[#292929]">{quoted.packageName}</dd></div>
          <div className="flex justify-between"><dt className="text-[#666666]">Quyền lợi slot</dt><dd className="font-semibold text-[#FC6C26]">{quoted.slotCount || 1} slots • {quoted.durationDaysPerSlot || 7} ngày/slot</dd></div>
          <div className="flex justify-between"><dt className="text-[#666666]">Giá gói</dt><dd>{formatMoney(quoted.packagePrice)}</dd></div>
          <div className="flex justify-between"><dt className="text-[#666666]">Giảm giá{quoted.voucherCode ? ` (${quoted.voucherCode})` : ""}</dt><dd>-{formatMoney(quoted.discountAmount)}</dd></div>
          <div className="mt-1 flex justify-between border-t border-[#E9E9E7] pt-2 text-base font-bold"><dt>Tổng thanh toán</dt><dd className="text-[#FC6C26]">{formatMoney(quoted.totalAmount)}</dd></div>
        </dl> : <p className="text-sm text-[#666666]">Chọn xe và gói để xem tổng tiền.</p>}
        {buy.error ? <p role="alert" className="text-sm text-[#B91C1C]">{buy.error.message}</p> : null}
        <Primary disabled={!quoted || buy.running} onClick={() => { if (parsed(quoted.voucherCode ?? "")) setConfirmPay(true); }}>{buy.running ? "Đang tạo giao dịch…" : "Thanh toán ngay qua VNPay"}</Primary>
      </div>
    </Step>
    <ConfirmDialog open={confirmPay} title="Xác nhận mua gói" description={quoted && Number(quoted.totalAmount) > 0 ? `Bạn sẽ được chuyển sang VNPay để thanh toán ${formatMoney(quoted.totalAmount)}.` : "Tổng tiền bằng 0 nên gói sẽ được kích hoạt ngay, không qua cổng thanh toán."} confirmLabel="Xác nhận" busy={buy.running} error={buy.error?.message} onClose={() => setConfirmPay(false)} onConfirm={() => { setConfirmPay(false); void buy.run(quoted?.voucherCode); }}/>
  </div>;
}

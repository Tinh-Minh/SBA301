import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useDocuments, useMyKyc } from "@/hooks/useAccount.js";
import { useAuth } from "@/hooks/useAuth.js";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { carService } from "@/services/vehicleService.js";
import { Icon } from "@/components/Icon.jsx";
import OwnerVehicleNew from "@/pages/vehicles/OwnerVehicleNewPage.jsx";

import { ProfileLayout } from "@/components/layouts/ProfileLayout.jsx";
import { LiveState, Pill } from "@/components/LiveUi.jsx";

import { formatDateTime } from "@/utils/datetime.js";
import { carImage, docTypeLabels, formatMoney, verifyStatusLabels } from "@/utils/labels.js";
import { SubmitForm, VerificationStatus, tone } from "@/components/account/VerificationForm.jsx";

const IDENTITY_DOC_TYPES = new Set(["CITIZEN_ID", "PASSPORT"]);

const carStatusLabel = {
  PENDING_APPROVAL: "Đang chờ Admin phê duyệt & nâng cấp Chủ xe",
  ACTIVE: "Đã phê duyệt — Đủ điều kiện cho thuê",
  REJECTED: "Hồ sơ xe bị từ chối",
  INACTIVE: "Tạm ngưng",
};

const carStatusTone = {
  PENDING_APPROVAL: "bg-amber-100 text-amber-900 border border-amber-300",
  ACTIVE: "bg-emerald-100 text-emerald-900 border border-emerald-300",
  REJECTED: "bg-red-100 text-red-900 border border-red-300",
  INACTIVE: "bg-stone-100 text-stone-700 border border-stone-300",
};

export default function VerificationLive() {
  const list = useDocuments();
  const kyc = useMyKyc();
  const { user, isOwner, isAdmin, refreshAccount } = useAuth();
  const myCars = useApiQuery(["cars", "my-upgrade-cars", user?.id], () => carService.listMine().catch(() => []), { enabled: Boolean(user && !isAdmin) });
  const [showRegisterCar, setShowRegisterCar] = useState(false);
  // Chỉ đăng xe khi CCCD/Hộ chiếu đã được Admin duyệt (backend cũng kiểm tra).
  const identityVerified = user?.kycStatus === "VERIFIED";

  useEffect(() => {
    void refreshAccount();
  }, [refreshAccount]);

  const cars = myCars.data ?? [];
  const hasApprovedCar = cars.some(c => c.status === "ACTIVE");

  // Nếu có xe đã được Admin duyệt sang ACTIVE mà tài khoản trên phiên còn là CUSTOMER, tự động đồng bộ lại role OWNER
  useEffect(() => {
    if (!isOwner && hasApprovedCar) {
      void refreshAccount();
    }
  }, [isOwner, hasApprovedCar, refreshAccount]);

  const docs = list.data ?? [];
  const derivedUsed = docs.filter(doc => IDENTITY_DOC_TYPES.has(doc.docType)).length;
  const maxUpgradeAttempts = kyc.data?.maxUpgradeAttempts ?? 3;
  const upgradeAttemptsUsed = kyc.data?.upgradeAttemptsUsed ?? derivedUsed;
  const upgradeAttemptsRemaining = kyc.data?.upgradeAttemptsRemaining ?? Math.max(0, maxUpgradeAttempts - upgradeAttemptsUsed);

  async function reloadAll() {
    await Promise.all([list.reload(), kyc.reload(), myCars.reload(), refreshAccount()]);
  }

  return <ProfileLayout live active="verification" title="Xác minh giấy tờ & Đăng ký Chủ xe" description="Nộp CCCD/Hộ chiếu và Giấy phép lái xe để xác thực danh tính khi thuê xe. Để nâng cấp lên tài khoản Chủ xe (OWNER), hãy đăng ký xe kèm đầy đủ giấy tờ xe, đăng kiểm và bảo hiểm để Admin phê duyệt.">
    {!isAdmin ? (isOwner
      ? <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900 shadow-sm">
        <div>
          <p className="text-base font-extrabold">Tài khoản Chủ xe đối tác (OWNER)</p>
          <p className="mt-1 text-xs text-emerald-800">Hồ sơ xe của bạn đã được Admin phê duyệt. Bạn đã có toàn quyền quản lý xe cho thuê và kiểm soát dòng tiền trên kênh Chủ xe.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/owner/payouts" className="rounded-xl border border-emerald-300 bg-white px-4 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-100">Kiểm soát dòng tiền</Link>
          <Link to="/owner/dashboard" className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800">Vào kênh Chủ xe</Link>
        </div>
      </div>
      : <section className="mb-4 rounded-2xl border border-[#E4E2D8] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF2EB] px-3 py-1 text-xs font-bold text-[#FC6C26]">
              <Icon name="directions_car" className="text-[15px]"/> Nâng cấp tài khoản Chủ xe (OWNER)
            </span>
            <h2 className="mt-2 text-lg font-extrabold text-[#25251F]">Đăng ký xe cho thuê để trở thành Chủ xe</h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#5C584F]">
              Để nâng cấp tài khoản từ <strong>Khách hàng (CUSTOMER)</strong> lên <strong>Chủ xe (OWNER)</strong> và mở tính năng cho thuê xe, vui lòng gửi thông tin xe kèm đầy đủ <strong>Giấy đăng ký xe (Cà vẹt)</strong>, <strong>Sổ đăng kiểm</strong>, <strong>Giấy bảo hiểm xe</strong> và hình ảnh thực tế. Khi Admin kiểm tra và phê duyệt hồ sơ xe, tài khoản sẽ tự động nâng cấp lên Chủ xe và xe được niêm yết cho thuê ngay.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowRegisterCar(v => !v)}
              disabled={!identityVerified}
              title={identityVerified ? undefined : "Cần được duyệt CCCD/Hộ chiếu trước"}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FC6C26] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#e55915] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name={showRegisterCar ? "expand_less" : "add_circle"} className="text-[17px]"/>
              {showRegisterCar ? "Thu gọn biểu mẫu đăng ký xe" : "Đăng ký xe nâng cấp Chủ xe"}
            </button>
            <button
              type="button"
              onClick={() => void reloadAll()}
              className="inline-flex items-center gap-1 rounded-xl border border-[#E4E2D8] bg-[#FAF8F2] px-3 py-2.5 text-xs font-bold text-[#25251F] hover:bg-[#F3F1EA]"
            >
              <Icon name="refresh" className="text-[16px]"/> Làm mới trạng thái
            </button>
          </div>
        </div>

        {!identityVerified ? <p className="mt-3 rounded-lg bg-[#FEF3C7] px-3 py-2 text-xs font-semibold text-[#92400E]">Bạn cần nộp CCCD/Hộ chiếu ở hồ sơ xác minh bên dưới và chờ Admin duyệt, sau đó mới đăng ký xe được.</p> : null}

        {cars.length > 0 ? (
          <div className="mt-4 flex flex-col gap-2.5 border-t border-[#EAE8E0] pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#6C6C61]">Hồ sơ xe bạn đã gửi duyệt ({cars.length})</p>
            {cars.map(car => (
              <div key={car.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E4E2D8] bg-[#FAF8F2] p-3">
                <div className="flex items-center gap-3">
                  <img src={carImage(car)} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover border border-[#E4E2D8]"/>
                  <div>
                    <p className="text-sm font-bold text-[#25251F]">{car.brand} {car.model} ({car.manufactureYear})</p>
                    <p className="text-xs text-[#5C584F]">Biển số: <strong className="font-mono">{car.licensePlate}</strong> • Giá thuê: <strong>{formatMoney(car.pricePerDay)}/ngày</strong></p>
                    {car.rejectReason ? <p className="mt-1 text-xs font-semibold text-[#B91C1C]">Lý do từ chối: {car.rejectReason}</p> : null}
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${carStatusTone[car.status] ?? carStatusTone.PENDING_APPROVAL}`}>
                  {carStatusLabel[car.status] ?? car.status}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {showRegisterCar ? (
          <div className="mt-5 rounded-2xl border border-[#E4E2D8] bg-[#FAF8F2] p-4 sm:p-5">
            <OwnerVehicleNew
              embedded
              onCancel={() => setShowRegisterCar(false)}
              onSuccess={async () => {
                setShowRegisterCar(false);
                await reloadAll();
              }}
            />
          </div>
        ) : null}
      </section>) : null}
    <LiveState loading={list.loading && !list.data} error={list.error} label="giấy tờ" onRetry={reloadAll} />
    {list.data ? <VerificationStatus docs={docs}/> : null}
    {list.data ? <SubmitForm
      docs={docs}
      onDone={reloadAll}
      isOwner={isOwner}
      maxUpgradeAttempts={maxUpgradeAttempts}
      upgradeAttemptsRemaining={upgradeAttemptsRemaining}
    /> : null}
    {docs.length ? <h2 className="mt-2 text-base font-bold">Lịch sử nộp giấy tờ</h2> : null}
    <div className="flex flex-col gap-3">
      {docs.map(doc => <article key={doc.id} className="rounded-2xl border border-[#E9E9E7] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold">{docTypeLabels[doc.docType] ?? doc.docType}</h2>
          <Pill className={tone[doc.verifyStatus]}>{verifyStatusLabels[doc.verifyStatus] ?? doc.verifyStatus}</Pill>
        </div>
        <p className="mt-1 text-sm text-[#666666]">
          Số {doc.docNumberMasked ?? "—"} • nộp {formatDateTime(doc.createdAt)}
          {doc.verifiedAt ? ` • duyệt lúc ${formatDateTime(doc.verifiedAt)}` : ""}
        </p>
        {doc.verifyStatus === "REJECTED" ? (
          <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-[#B91C1C]">
            <span className="font-bold">Lý do từ chối:</span> {doc.rejectReason || "Không có ghi chú lý do."}
          </div>
        ) : doc.rejectReason ? (
          <p className="mt-1 text-sm text-[#B91C1C]">Lý do: {doc.rejectReason}</p>
        ) : null}
      </article>)}
    </div>
  </ProfileLayout>;
}

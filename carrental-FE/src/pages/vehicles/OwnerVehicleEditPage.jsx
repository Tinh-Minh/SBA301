import { Controller, useForm, useWatch } from "react-hook-form";
import { vehiclePricingSchema } from "@/utils/schemas/vehicle.js";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormErrors } from "@/components/FormErrors.jsx";
import { digitsOnly as digitsOf, formatVndInput as grouped, parseVndInput } from "@/utils/inputParser.js";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon.jsx";
import { Money } from "@/components/owner/Money.jsx";
import { OwnerCrumb, OwnerHeading, OwnerState } from "@/components/owner/OwnerScreen.jsx";
import { useOwnerCar } from "@/hooks/useVehicles.js";
import { carSubtitle, formatVnd } from "@/utils/owner.js";
import { ownerRoutes } from "@/routes/paths.js";
import { carService } from "@/services/vehicleService.js";
import { carImage, resolveAssetUrl } from "@/utils/labels.js";
import { validateImageFile } from "@/utils/validateInput.js";

const steps = [
    { id: 1, title: "Thông tin & giấy tờ", hint: "Hồ sơ pháp lý của xe" },
    { id: 2, title: "Thông số", hint: "Loại xe, chỗ ngồi, nhiên liệu" },
    { id: 3, title: "Giá thuê & cọc", hint: "Đơn giá ngày và tiền cọc" },
    { id: 4, title: "Hình ảnh niêm yết", hint: "Ảnh đại diện đang dùng" },
];

export default function OwnerVehicleEdit({ carId }) {
    const { data, loading, error, save, reload } = useOwnerCar(carId);
    const [step, setStep] = useState(3);
    const { control, reset, handleSubmit, formState: { errors, isValid, isSubmitting } } = useForm({
        resolver: zodResolver(vehiclePricingSchema), mode: "onChange",
        defaultValues: { pricePerDay: "", depositAmount: "", kmLimitPerDay: "", extraKmFee: "" },
    });
    const form = useWatch({ control });
    const [saved, setSaved] = useState(false);
    const [queuedFiles, setQueuedFiles] = useState([]);
    const [imgError, setImgError] = useState("");
    const [imgBusy, setImgBusy] = useState(false);
    useEffect(() => {
        if (!data)
            return;
        reset({
            pricePerDay: String(data.pricePerDay),
            depositAmount: String(data.depositAmount),
            kmLimitPerDay: String(data.kmLimitPerDay ?? 350),
            extraKmFee: String(data.extraKmFee ?? 5000),
        });
    }, [data, reset]);
    const price = form ? parseVndInput(form.pricePerDay) : null;
    const onSave = handleSubmit(async values => {
        setSaved(false);
        const result = await save.run(values);
        if (result) setSaved(true);
    });
    return <div className="flex min-w-0 flex-col gap-6">
    <div className="flex flex-col gap-2">
      <OwnerCrumb homeHref={ownerRoutes.dashboard} current={data ? `Chỉnh sửa ${data.brand} ${data.model}` : "Chỉnh sửa xe"} parent={{ href: ownerRoutes.vehicles, label: "Xe của tôi" }}/>
      <OwnerHeading title="Chỉnh sửa thông tin xe" description={data ? `Cập nhật bảng giá và tiền cọc cho ${data.brand} ${data.model} (${data.licensePlate}).` : "Đang mở hồ sơ xe."} actions={<Link to={ownerRoutes.vehicles} className="inline-flex items-center gap-1.5 rounded-xl border border-card-border bg-white px-4 py-2.5 text-sm font-bold text-charcoal hover:border-gray-300">
          <Icon name="arrow_back" className="text-[18px]"/>
          Quay lại Xe của tôi
        </Link>}/>
    </div>

    <OwnerState loading={loading && !data} error={error} label="hồ sơ xe"/>
    {data && form ? <div className="grid items-start gap-6 xl:grid-cols-[240px_minmax(0,1fr)_300px]">
      <ol className="flex flex-col gap-2">
        {steps.map(item => <li key={item.id}>
          <button type="button" onClick={() => setStep(item.id)} className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left ${step === item.id ? "border-brand-accent bg-white shadow-sm" : "border-card-border bg-white/70"}`}>
            <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step === item.id ? "bg-brand-accent text-white" : "bg-bg-light text-charcoal"}`}>{item.id}</span>
            <span>
              <span className="block text-sm font-bold text-charcoal">{item.title}</span>
              <span className="block text-xs text-muted-gray">{item.hint}</span>
            </span>
          </button>
        </li>)}
      </ol>

      <section className="rounded-2xl border border-card-border bg-white p-5 shadow-sm sm:p-6">
        {step === 1 ? <div className="flex flex-col gap-3 text-sm">
          <h2 className="text-lg font-bold text-charcoal">Thông tin & giấy tờ</h2>
          <p className="text-muted-gray">Biển số <span className="font-mono font-bold text-charcoal">{data.licensePlate}</span> • {data.brand} {data.model} • {data.manufactureYear}</p>
          <p className="text-muted-gray">Điểm giao xe: {data.pickupAddress}</p>
          <p className="rounded-xl bg-status-green-bg px-4 py-3 text-status-success-ink">Thông tin này được dùng cho tin đăng và biên bản bàn giao xe. Trạng thái hiện tại: {data.status === "PENDING_APPROVAL" ? "đang chờ CarDB duyệt" : data.status === "ACTIVE" ? "đã được duyệt" : data.status === "REJECTED" ? "bị từ chối, sửa hồ sơ để gửi duyệt lại" : "đang tạm dừng"}.</p>
        </div> : null}

        {step === 2 ? <div className="flex flex-col gap-3 text-sm">
          <h2 className="text-lg font-bold text-charcoal">Thông số</h2>
          <p className="text-muted-gray">{carSubtitle(data)}</p>
          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-bg-light p-3"><dt className="text-xs text-muted-gray">Số chỗ</dt><dd className="font-bold text-charcoal">{data.seats}</dd></div>
            <div className="rounded-xl bg-bg-light p-3"><dt className="text-xs text-muted-gray">Hộp số</dt><dd className="font-bold text-charcoal">{data.transmission === "AUTOMATIC" ? "Tự động" : "Số sàn"}</dd></div>
            <div className="rounded-xl bg-bg-light p-3"><dt className="text-xs text-muted-gray">Nhiên liệu</dt><dd className="font-bold text-charcoal">{data.fuelType}</dd></div>
            <div className="rounded-xl bg-bg-light p-3"><dt className="text-xs text-muted-gray">Loại xe</dt><dd className="font-bold text-charcoal">{data.carType}</dd></div>
          </dl>
        </div> : null}

        {step === 3 ? <form noValidate onSubmit={onSave} className="flex flex-col gap-5">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-charcoal"><Icon name="payments" className="text-[22px] text-brand-accent"/> Giá thuê và tiền cọc</h2>
            <p className="mt-1 text-sm text-muted-gray">Đơn giá theo ngày và tiền cọc chủ xe tự thu khi giao xe. Phí nền tảng tính 10% trên tiền thuê, không tính trên cọc.</p>
          </div>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal">
            Đơn giá thuê theo ngày (VND)
            <Controller name="pricePerDay" control={control} render={({ field, fieldState }) => (
              <>
                <input {...field} value={grouped(field.value)} onChange={event => field.onChange(digitsOf(event.target.value))} aria-invalid={fieldState.invalid} inputMode="numeric" className={`rounded-xl border px-3 py-2.5 font-medium outline-none focus:border-brand-accent ${fieldState.error ? "border-red-500" : "border-card-border"}`}/>
                {fieldState.error?.message ? <span role="alert" className="text-xs font-medium text-red-600">{fieldState.error.message}</span> : null}
              </>
            )}/>
            <span className="text-xs font-normal text-muted-gray">Áp dụng cho khung lịch đang mở. {price ? formatVnd(price) : "Nhập số nguyên."} / ngày</span>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal">
            Tiền cọc thế chấp (VND)
            <Controller name="depositAmount" control={control} render={({ field, fieldState }) => (
              <>
                <input {...field} value={grouped(field.value)} onChange={event => field.onChange(digitsOf(event.target.value))} aria-invalid={fieldState.invalid} inputMode="numeric" className={`rounded-xl border px-3 py-2.5 font-medium outline-none focus:border-brand-accent ${fieldState.error ? "border-red-500" : "border-card-border"}`}/>
                {fieldState.error?.message ? <span role="alert" className="text-xs font-medium text-red-600">{fieldState.error.message}</span> : null}
              </>
            )}/>
            <span className="text-xs font-normal text-muted-gray">Chủ xe thu trực tiếp khi giao xe và hoàn lại khi nhận xe về. Nhập 0 nếu miễn cọc.</span>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal">
              Giới hạn km / ngày
              <Controller name="kmLimitPerDay" control={control} render={({ field, fieldState }) => (
                <>
                  <input {...field} value={field.value} onChange={event => field.onChange(digitsOf(event.target.value))} aria-invalid={fieldState.invalid} inputMode="numeric" className={`rounded-xl border px-3 py-2.5 font-medium outline-none focus:border-brand-accent ${fieldState.error ? "border-red-500" : "border-card-border"}`}/>
                  {fieldState.error?.message ? <span role="alert" className="text-xs font-medium text-red-600">{fieldState.error.message}</span> : null}
                </>
              )}/>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-semibold text-charcoal">
              Phí quá km (VND)
              <Controller name="extraKmFee" control={control} render={({ field, fieldState }) => (
                <>
                  <input {...field} value={grouped(field.value)} onChange={event => field.onChange(digitsOf(event.target.value))} aria-invalid={fieldState.invalid} inputMode="numeric" className={`rounded-xl border px-3 py-2.5 font-medium outline-none focus:border-brand-accent ${fieldState.error ? "border-red-500" : "border-card-border"}`}/>
                  {fieldState.error?.message ? <span role="alert" className="text-xs font-medium text-red-600">{fieldState.error.message}</span> : null}
                </>
              )}/>
            </label>
          </div>
          <p className="rounded-xl bg-bg-light px-4 py-3 text-xs leading-relaxed text-muted-gray">Tiền thuê tính theo ngày (24 giờ) và giờ lẻ: giá giờ = 1/10 giá ngày, thuê lẻ từ 10 giờ tính tròn 1 ngày. Khách thanh toán trực tiếp cho chủ xe khi nhận xe.</p>
          <FormErrors errors={errors} />
          {save.error ? <p className="text-sm text-on-error-container">{save.error.message}</p> : null}
          {saved ? <p className="text-sm font-semibold text-status-success-ink">Đã lưu bảng giá.</p> : null}
          <div className="flex flex-wrap justify-between gap-2">
            <button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-1.5 rounded-xl border border-card-border px-4 py-2.5 text-sm font-bold text-charcoal">
              <Icon name="arrow_back" className="text-[16px]"/> Bước 2
            </button>
            <button type="submit" disabled={!isValid || save.running || isSubmitting} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60">
              Lưu bảng giá
              <Icon name="arrow_forward" className="text-[16px]"/>
            </button>
          </div>
        </form> : null}

        {step === 4 ? <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-charcoal">Hình ảnh niêm yết ({data.images?.length ?? 0}/10)</h2>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-card-border bg-bg-light px-3 py-2 text-xs font-bold text-charcoal hover:bg-accent-soft">
              <Icon name="upload" className="text-[16px]"/>
              Chọn ảnh từ máy
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={event => {
                  const picked = Array.from(event.target.files ?? []);
                  event.target.value = "";
                  if (!picked.length) return;
                  const errs = [];
                  const valid = [];
                  for (const file of picked) {
                    const err = validateImageFile(file);
                    if (err) errs.push(err);
                    else valid.push({ file, preview: URL.createObjectURL(file) });
                  }
                  setImgError(errs.join(" "));
                  if (valid.length) setQueuedFiles(prev => [...prev, ...valid]);
                }}
              />
            </label>
          </div>
          {imgError ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{imgError}</p> : null}
          {queuedFiles.length ? (
            <div className="rounded-xl border border-brand-accent/40 bg-accent-soft/30 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold text-charcoal">Xem trước ảnh sắp tải lên ({queuedFiles.length})</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={imgBusy}
                    onClick={() => {
                      queuedFiles.forEach(item => URL.revokeObjectURL(item.preview));
                      setQueuedFiles([]);
                    }}
                    className="rounded-lg border border-card-border bg-white px-2.5 py-1 text-xs font-bold text-charcoal"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    disabled={imgBusy}
                    onClick={async () => {
                      setImgBusy(true);
                      setImgError("");
                      try {
                        await carService.uploadImages(data.id, queuedFiles.map(item => item.file));
                        queuedFiles.forEach(item => URL.revokeObjectURL(item.preview));
                        setQueuedFiles([]);
                        await reload();
                      } catch (err) {
                        setImgError(err?.message || "Không tải ảnh lên được.");
                      } finally {
                        setImgBusy(false);
                      }
                    }}
                    className="rounded-lg bg-brand-accent px-3 py-1 text-xs font-bold text-white disabled:opacity-60"
                  >
                    {imgBusy ? "Đang tải..." : "Lưu ảnh mới"}
                  </button>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {queuedFiles.map((item, idx) => (
                  <div key={`${item.file.name}-${idx}`} className="relative overflow-hidden rounded-lg border border-card-border bg-white">
                    <img src={item.preview} alt={item.file.name} className="h-24 w-full object-cover" />
                    <button
                      type="button"
                      disabled={imgBusy}
                      aria-label={`Bỏ ảnh ${item.file.name}`}
                      onClick={() => {
                        URL.revokeObjectURL(item.preview);
                        setQueuedFiles(prev => prev.filter((_, i) => i !== idx));
                      }}
                      className="absolute right-1 top-1 rounded-full bg-charcoal/80 px-1.5 py-0.5 text-[10px] font-bold text-white hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {data.images?.length ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {data.images.map(image => (
                <div key={image.id} className="overflow-hidden rounded-xl border border-card-border bg-white">
                  <img src={resolveAssetUrl(image.imageUrl)} alt={`${data.brand} ${data.model}`} className="h-32 w-full object-cover" />
                  <div className="flex items-center justify-between gap-2 p-2 text-xs">
                    {image.isPrimary ? (
                      <span className="rounded-full bg-brand-accent px-2 py-0.5 text-[10px] font-bold text-white">Ảnh chính</span>
                    ) : (
                      <button
                        type="button"
                        disabled={imgBusy}
                        onClick={async () => {
                          setImgBusy(true);
                          setImgError("");
                          try {
                            await carService.setPrimaryImage(data.id, image.id);
                            await reload();
                          } catch (err) {
                            setImgError(err?.message || "Không đặt ảnh chính được.");
                          } finally {
                            setImgBusy(false);
                          }
                        }}
                        className="font-bold text-charcoal hover:underline"
                      >
                        Đặt ảnh chính
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={imgBusy}
                      onClick={async () => {
                        setImgBusy(true);
                        setImgError("");
                        try {
                          await carService.removeImage(data.id, image.id);
                          await reload();
                        } catch (err) {
                          setImgError(err?.message || "Không xóa được ảnh.");
                        } finally {
                          setImgBusy(false);
                        }
                      }}
                      className="font-bold text-red-600 hover:underline"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : data.primaryImageUrl ? (
            <img src={carImage(data)} alt={`${data.brand} ${data.model}`} className="h-56 w-full rounded-2xl object-cover"/>
          ) : (
            <p className="text-sm text-muted-gray">Xe chưa có ảnh đại diện.</p>
          )}
          <p className="text-sm text-muted-gray">Ảnh chính sẽ hiển thị trên trang tìm kiếm và chi tiết xe.</p>
        </div> : null}
      </section>

      <aside className="rounded-2xl border border-card-border bg-white p-5 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-gray">Bảng giá niêm yết</p>
        <h2 className="mt-2 text-base font-bold text-charcoal">{data.brand} {data.model}</h2>
        <p className="font-mono text-xs text-muted-gray">{data.licensePlate}</p>
        <p className="mt-1 text-xs text-muted-gray">{carSubtitle(data)}</p>
        <dl className="mt-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between gap-3"><dt className="text-muted-gray">Đơn giá / ngày</dt><dd><Money amount={price ?? 0}/></dd></div>
          <div className="flex justify-between gap-3"><dt className="text-muted-gray">Giờ lẻ</dt><dd>{price ? `${formatVnd(Math.ceil(price / 10 / 1000) * 1000)}/giờ` : "—"}</dd></div>
          <div className="flex justify-between gap-3 border-t border-card-border pt-2 font-bold"><dt>Tiền cọc</dt><dd>{data.depositAmount ? formatVnd(data.depositAmount) : "Miễn cọc"}</dd></div>
        </dl>
        <p className="mt-4 rounded-xl bg-bg-light px-3 py-2 text-xs leading-relaxed text-muted-gray">Chủ xe nhận toàn bộ tiền thuê trực tiếp từ khách. Chi phí trên CarDB chỉ là gói đăng tin để xe hiển thị trên sàn.</p>
      </aside>
    </div> : null}
  </div>;
}

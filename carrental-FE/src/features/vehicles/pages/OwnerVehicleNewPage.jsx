import { useForm, useWatch } from "react-hook-form";
import { vehicleCreateSchema, vehicleStepFields, vehicleStepSchemas } from "@/shared/schemas/vehicle.js";
import { validateInput } from "@/shared/utils/validateInput.js";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormErrors } from "@/shared/components/FormErrors.jsx";
import { parseVndInput } from "@/shared/utils/inputParser.js";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Icon } from "@/shared/components/Icon.jsx";
import { OwnerCrumb } from "@/shared/components/owner/OwnerScreen.jsx";
import { useApiMutation } from "@/shared/hooks/useApiMutation.js";
import { calculatePlatformFee, formatVnd } from "@/shared/utils/owner.js";
import { ownerRoutes } from "@/app/routes/owner.routes.js";
import { carService } from "@/services/car.service";
import { useAuth } from "@/shared/hooks/useAuth.js";
import { DRAFT_KEY, steps, modelsByBrand, segments, areas, amenities, photoSlots, OTHER, initial, StepOne, StepTwo, StepThree, StepFour, isUrl } from "@/features/vehicles/components/Field.jsx";

export default function OwnerVehicleNew() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const create = useApiMutation(submitCar);
    const [step, setStep] = useState(1);
    const [reached, setReached] = useState(1);
    const { control, register, setValue, getValues, reset, trigger, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(vehicleCreateSchema),
        defaultValues: { ...initial, registrationUrl: "", inspectionUrl: "", photos: {}, agreed: false },
    });
    const form = useWatch({ control });
    const { registrationUrl: cavet, inspectionUrl: inspection, photos, agreed } = form;
    const set = patch => Object.entries(patch).forEach(([name, value]) => setValue(name, value, { shouldDirty: true, shouldValidate: true }));
    const setCavet = value => set({ registrationUrl: value });
    const setInspection = value => set({ inspectionUrl: value });
    const setAgreed = value => set({ agreed: value });
    const setPhotos = updater => set({ photos: updater(getValues("photos")) });
    useEffect(() => {
        Object.keys(initial).concat("registrationUrl", "inspectionUrl", "photos", "agreed").forEach(name => register(name));
    }, [register]);
    const [zoom, setZoom] = useState(null);
    const [draftNote, setDraftNote] = useState("");
    useEffect(() => {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw)
            return;
        try {
            const saved = JSON.parse(raw);
            if (saved.form)
                reset({ ...getValues(), ...saved.form, amenities: saved.form?.amenities ?? initial.amenities });
            if (saved.photos)
                set({ photos: saved.photos });
            if (typeof saved.cavet === "string")
                setCavet(saved.cavet);
            if (typeof saved.inspection === "string")
                setInspection(saved.inspection);
            if (saved.step && saved.step >= 1 && saved.step <= 4) {
                setStep(saved.step);
                setReached(saved.step);
            }
        }
        catch { /* bản nháp hỏng thì bỏ qua */ }
    }, []);
    const segment = segments.find(item => item.id === form.segment) ?? segments[0];
    const dayPrice = parseVndInput(form.pricePerDay);
    const weekend = parseVndInput(form.weekendPrice);
    const deposit = parseVndInput(form.depositAmount);
    const fee = dayPrice ? calculatePlatformFee(dayPrice, 10) : 0;
    const photoCount = Object.keys(photos).length;
    const stepResults = vehicleStepSchemas.map(schema => validateInput(schema, form));
    const ready = stepResults.map(result => result.success);
    const gaps = stepResults[0].success ? [] : stepResults[0].error.issues.map(issue => issue.message);
    async function advance() {
        if (await trigger(vehicleStepFields[step - 1])) {
            setStep(step + 1);
            setReached(value => Math.max(value, step + 1));
        }
    }
    function chooseSegment(id) {
        if (id === OTHER) {
            set({ segment: OTHER, carType: form.carType || "OTHER" });
            return;
        }
        const next = segments.find(item => item.id === id) ?? segments[0];
        set({ segment: id, customSegment: "", carType: next.carType, seats: next.seats, fuelType: next.fuel });
    }
    function chooseBrand(brand) {
        if (brand === OTHER)
            set({ brand: "", model: "" });
        else
            set({ brand, model: modelsByBrand[brand]?.[0] ?? "" });
    }
    function chooseCity(city) {
        if (areas[city])
            set({ city, area: areas[city][0] });
        else
            set({ city, area: "" });
    }
    function addPhoto(id, url) {
        setPhotos(current => {
            const next = { ...current };
            if (url.trim())
                next[id] = { url: url.trim() };
            else
                delete next[id];
            return next;
        });
    }
    function saveDraft() {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, step, photos, cavet, inspection }));
        setDraftNote("Đã lưu bản nháp trên máy này.");
    }
    async function submitCar(draft) {
        const car = await carService.create(draft);
        const documents = [["REGISTRATION", cavet], ["INSPECTION", inspection]].filter(([, url]) => url.trim());
        for (const [docType, fileUrl] of documents)
            await carService.addDocument(car.id, { docType, fileUrl: fileUrl.trim() });
        return car;
    }
    async function submit(values) {
        const ordered = photoSlots.map(slot => photos[slot.id]?.url).filter(url => url && isUrl(url));
        const details = [
            form.powerNote.trim() ? `${form.fuelType === "ELECTRIC" ? "Pin/công suất" : "Động cơ"}: ${form.powerNote.trim()}` : "",
            form.rangeKm ? `Tầm vận hành: ${form.rangeKm} km` : "",
            weekend ? `Giá cuối tuần: ${formatVnd(weekend)}` : "",
            form.lateFee ? `Phí trễ giờ: ${formatVnd(Number(form.lateFee))}/giờ` : "",
            form.segment === OTHER && form.customSegment.trim() ? `Phân khúc: ${form.customSegment.trim()}` : "",
            form.cancellation,
        ].filter(Boolean).join(". ");
        const car = await create.run({
            licensePlate: form.licensePlate.trim(),
            brand: form.brand.trim(),
            model: form.model.trim(),
            manufactureYear: values.manufactureYear,
            carType: form.segment === OTHER ? form.carType : segment.carType,
            seats: values.seats,
            transmission: form.transmission,
            fuelType: form.fuelType,
            city: form.city.trim(),
            district: form.area.trim(),
            pickupAddress: form.pickupAddress.trim(),
            description: details,
            features: JSON.stringify(form.amenities),
            pricePerDay: values.pricePerDay,
            pricePerHour: Math.max(1, Math.round(values.pricePerDay / 10)),
            depositAmount: values.depositAmount,
            kmLimitPerDay: values.kmLimitPerDay,
            extraKmFee: values.extraKmFee,
            imageUrls: ordered,
        });
        if (!car)
            return;
        localStorage.removeItem(DRAFT_KEY);
        navigate(ownerRoutes.vehicles);
    }
    const subtitle = `${form.brand} ${form.model} • ${form.licensePlate || "Chưa có biển số"}`;
    return <form data-native noValidate aria-busy={isSubmitting} onSubmit={event => {
        if (step < 4) { event.preventDefault(); void advance(); }
        else void handleSubmit(submit)(event);
    }} className="flex min-w-0 flex-col gap-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <OwnerCrumb current={steps[step - 1].title} parent={{ href: ownerRoutes.vehicles, label: "Xe của tôi" }}/>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-charcoal sm:text-[28px]">Đăng ký xe cho thuê mới</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-gray">Bước {step}/4: {steps[step - 1].blurb}</p>
      </div>
      {step === 1 ? <Link to={ownerRoutes.vehicles} className="inline-flex items-center gap-1.5 self-start rounded-xl border border-card-border bg-white px-4 py-2.5 text-sm font-bold text-charcoal">
        <Icon name="arrow_back" className="text-[18px]"/> Quay lại Xe của tôi
      </Link> : <button type="button" onClick={() => setStep(value => value - 1)} className="inline-flex items-center gap-1.5 self-start rounded-xl border border-card-border bg-white px-4 py-2.5 text-sm font-bold text-charcoal">
        <Icon name="arrow_back" className="text-[18px]"/> Quay lại Bước {step - 1}
      </button>}
    </div>

    <ol className="grid gap-2 sm:grid-cols-4">
      {steps.map(item => {
            const locked = item.id > reached;
            const current = item.id === step;
            const done = item.id < step;
            return <li key={item.id}>
          <button type="button" disabled={locked} onClick={() => setStep(item.id)} className={`flex w-full items-center gap-2 rounded-2xl border px-3 py-2.5 text-left ${current ? "border-brand-accent bg-accent-soft" : "border-card-border bg-white"} ${locked ? "opacity-60" : ""}`}>
            <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${current ? "bg-brand-accent text-white" : done ? "bg-status-green-bg text-status-success-ink" : "bg-bg-light text-muted-gray"}`}>
              {done ? <Icon name="check" className="text-[16px]"/> : locked ? <Icon name="lock" className="text-[14px]"/> : item.id}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-bold text-charcoal">{item.id}. {item.title}</span>
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-gray">{current ? "Hiện tại" : done ? "Đã xong" : "Chưa mở"}</span>
            </span>
          </button>
        </li>;
        })}
    </ol>

    {step > 1 ? <p className="text-sm text-muted-gray">Chủ xe đại diện <span className="font-semibold text-charcoal">{user?.fullName ?? "Chủ xe"}</span> • {subtitle}</p> : null}

    {step === 1 ? <StepOne form={form} cavet={cavet} inspection={inspection} onChange={set} onBrand={chooseBrand} onSegment={chooseSegment} onCity={chooseCity} onCavet={files => setCavet(files)} onInspection={setInspection}/> : null}
    {step === 2 ? <StepTwo form={form} onChange={set}/> : null}
    {step === 3 ? <StepThree form={form} dayPrice={dayPrice} weekend={weekend} fee={fee} onChange={set}/> : null}
    {step === 4 ? <StepFour form={form} photos={photos} photoCount={photoCount} dayPrice={dayPrice} deposit={deposit} agreed={agreed} onAgree={setAgreed} onPhoto={addPhoto} onZoom={setZoom} hasCavet={Boolean(cavet.trim())} hasInspection={Boolean(inspection.trim())}/> : null}

    {step === 1 && gaps.length ? <p className="text-sm text-muted-gray">{gaps.join(" ")}</p> : null}
    {draftNote ? <p className="text-sm font-semibold text-status-success-ink">{draftNote}</p> : null}
    <FormErrors errors={errors} />
    {create.error ? <p className="text-sm text-on-error-container">{create.error.message}</p> : null}

    <div className="flex flex-wrap items-center justify-between gap-2">
      <Link to={ownerRoutes.vehicles} className="rounded-xl border border-card-border bg-white px-4 py-2.5 text-sm font-bold text-charcoal">Hủy bỏ đăng ký</Link>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={saveDraft} className="rounded-xl border border-card-border bg-white px-4 py-2.5 text-sm font-bold text-charcoal">Lưu bản nháp</button>
        {step < 4 ? <button type="button" disabled={!ready[step - 1]} onClick={() => void advance()} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60">
          {steps[step - 1].next} <Icon name="arrow_forward" className="text-[16px]"/>
        </button> : <button type="submit" disabled={!ready.every(Boolean) || create.running || isSubmitting} className="rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60">
          Gửi BQL CarDB thẩm định
        </button>}
      </div>
    </div>

    {zoom ? <button type="button" aria-label="Đóng ảnh" onClick={() => setZoom(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 p-6">
      <img src={zoom} alt="Ảnh xe phóng to" className="max-h-[80vh] max-w-full rounded-2xl"/>
    </button> : null}
  </form>;
}

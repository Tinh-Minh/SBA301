import { useForm, useWatch } from "react-hook-form";
import { vehicleCreateSchema, vehicleStepFields, vehicleStepSchemas } from "@/utils/schemas/vehicle.js";
import { validateInput } from "@/utils/validateInput.js";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormErrors } from "@/components/FormErrors.jsx";
import { parseVndInput } from "@/utils/inputParser.js";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon.jsx";
import { OwnerCrumb } from "@/components/owner/OwnerScreen.jsx";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { ownerRoutes } from "@/routes/paths.js";
import { carService } from "@/services/vehicleService.js";
import { uploadImage } from "@/services/tripService.js";
import { useAuth } from "@/hooks/useAuth.js";
import { DRAFT_KEY, OTHER, StepFour, StepOne, StepThree, StepTwo, areas, initial, isUrl, modelsByBrand, photoSlots, segments, steps, validateImageFile } from "@/components/vehicles/VehicleRegistrationSteps.jsx";
import { repairDisplayText } from "@/utils/text.js";

export default function OwnerVehicleNew() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const create = useApiMutation(submitCar);
    const [step, setStep] = useState(1);
    const [reached, setReached] = useState(1);
    const { control, register, setValue, getValues, reset, trigger, handleSubmit, formState: { errors, dirtyFields, isSubmitting } } = useForm({
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
    const [cavetFile, setCavetFile] = useState(null);
    const [inspectionFile, setInspectionFile] = useState(null);
    const [cavetError, setCavetError] = useState("");
    const [inspectionError, setInspectionError] = useState("");
    const [photoErrors, setPhotoErrors] = useState([]);
    useEffect(() => {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw)
            return;
        try {
            const saved = repairDisplayText(JSON.parse(raw));
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
    const photoCount = Object.keys(photos).length;
    const stepResults = vehicleStepSchemas.map(schema => validateInput(schema, form));
    const ready = stepResults.map(result => result.success);
    const activeResult = stepResults[step - 1];
    const gaps = activeResult && !activeResult.success ? activeResult.error.issues.map(issue => issue.message) : [];
    const visibleStepErrors = Object.fromEntries(
        (activeResult && !activeResult.success ? activeResult.error.issues : [])
            .map(issue => [String(issue.path[0] ?? ""), issue.message])
            .filter(([key]) => key && (dirtyFields[key] || errors[key] || String(form[key] ?? "").trim() !== ""))
    );
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
    function revokeBlob(url) {
        if (typeof url === "string" && url.startsWith("blob:"))
            URL.revokeObjectURL(url);
    }
    function handleCavetFile(file) {
        if (!file) {
            revokeBlob(cavet);
            setCavetFile(null);
            setCavetError("");
            return;
        }
        const err = validateImageFile(file);
        if (err) {
            setCavetError(err);
            return;
        }
        revokeBlob(cavet);
        const preview = URL.createObjectURL(file);
        setCavetFile(file);
        setCavetError("");
        setCavet(preview);
    }
    function handleInspectionFile(file) {
        if (!file) {
            revokeBlob(inspection);
            setInspectionFile(null);
            setInspectionError("");
            return;
        }
        const err = validateImageFile(file);
        if (err) {
            setInspectionError(err);
            return;
        }
        revokeBlob(inspection);
        const preview = URL.createObjectURL(file);
        setInspectionFile(file);
        setInspectionError("");
        setInspection(preview);
    }
    function addPhoto(id, url) {
        setPhotoErrors([]);
        setPhotos(current => {
            const next = { ...current };
            revokeBlob(current[id]?.url);
            if (url.trim())
                next[id] = { url: url.trim() };
            else
                delete next[id];
            return next;
        });
    }
    function handlePhotoFile(slotId, file) {
        const err = validateImageFile(file);
        if (err) {
            setPhotoErrors([err]);
            return;
        }
        setPhotoErrors([]);
        const preview = URL.createObjectURL(file);
        setPhotos(current => {
            revokeBlob(current[slotId]?.url);
            return { ...current, [slotId]: { url: preview, file } };
        });
    }
    function handlePhotoFiles(files) {
        const nextErrors = [];
        const validFiles = [];
        for (const file of files) {
            const err = validateImageFile(file);
            if (err)
                nextErrors.push(err);
            else
                validFiles.push(file);
        }
        if (validFiles.length) {
            const current = getValues("photos") || {};
            const next = { ...current };
            const emptySlotIds = photoSlots.map(s => s.id).filter(id => !next[id]);
            const targetSlots = emptySlotIds.length >= validFiles.length
                ? emptySlotIds
                : [...emptySlotIds, ...photoSlots.map(s => s.id).filter(id => !emptySlotIds.includes(id))];
            let placed = 0;
            for (const file of validFiles) {
                const slotId = targetSlots[placed];
                if (!slotId) {
                    nextErrors.push("Chỉ hỗ trợ tối đa 6 góc ảnh tiêu chuẩn khi tạo xe.");
                    break;
                }
                revokeBlob(next[slotId]?.url);
                next[slotId] = { url: URL.createObjectURL(file), file };
                placed++;
            }
            set({ photos: next });
        }
        setPhotoErrors(nextErrors);
    }
    function removePhoto(slotId) {
        setPhotoErrors([]);
        setPhotos(current => {
            const next = { ...current };
            revokeBlob(next[slotId]?.url);
            delete next[slotId];
            return next;
        });
    }
    function saveDraft() {
        const safePhotos = Object.fromEntries(
            Object.entries(photos)
                .filter(([, item]) => item?.url && !item.url.startsWith("blob:"))
                .map(([id, item]) => [id, { url: item.url }])
        );
        const safeCavet = cavet?.startsWith("blob:") ? "" : cavet;
        const safeInspection = inspection?.startsWith("blob:") ? "" : inspection;
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, step, photos: safePhotos, cavet: safeCavet, inspection: safeInspection }));
        setDraftNote("Đã lưu bản nháp trên máy này.");
    }
    async function submitCar(draft) {
        const resolvedCavetUrl = cavetFile
            ? await uploadImage(cavetFile)
            : (cavet && !cavet.startsWith("blob:") ? cavet.trim() : "");
        const resolvedInspectionUrl = inspectionFile
            ? await uploadImage(inspectionFile)
            : (inspection && !inspection.startsWith("blob:") ? inspection.trim() : "");
        const car = await carService.create(draft);
        const documents = [["REGISTRATION", resolvedCavetUrl], ["INSPECTION", resolvedInspectionUrl]].filter(([, url]) => Boolean(url));
        for (const [docType, fileUrl] of documents)
            await carService.addDocument(car.id, { docType, fileUrl });
        return car;
    }
    async function submit(values) {
        const photoEntries = photoSlots
            .map(slot => photos[slot.id])
            .filter(item => item && (item.file || (item.url && !item.url.startsWith("blob:") && isUrl(item.url))))
            .map(item => ({ url: item.file ? "" : item.url.trim(), file: item.file ?? null }));
        const details = [
            form.powerNote.trim() ? `${form.fuelType === "ELECTRIC" ? "Pin/công suất" : "Động cơ"}: ${form.powerNote.trim()}` : "",
            form.rangeKm ? `Tầm vận hành: ${form.rangeKm} km` : "",
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
            weekendPricePerDay: weekend,
            lateFeePerHour: form.lateFee ? Number(form.lateFee) : null,
            photoEntries,
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
        <OwnerCrumb homeHref={ownerRoutes.dashboard} current={steps[step - 1].title} parent={{ href: ownerRoutes.vehicles, label: "Xe của tôi" }}/>
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

    {step === 1 ? <StepOne form={form} errors={visibleStepErrors} cavet={cavet} inspection={inspection} cavetFile={cavetFile} inspectionFile={inspectionFile} cavetError={cavetError} inspectionError={inspectionError} onChange={set} onBrand={chooseBrand} onSegment={chooseSegment} onCity={chooseCity} onCavet={files => setCavet(files)} onInspection={setInspection} onCavetFile={handleCavetFile} onInspectionFile={handleInspectionFile}/> : null}
    {step === 2 ? <StepTwo form={form} errors={visibleStepErrors} onChange={set}/> : null}
    {step === 3 ? <StepThree form={form} errors={visibleStepErrors} dayPrice={dayPrice} weekend={weekend} deposit={deposit} onChange={set}/> : null}
    {step === 4 ? <StepFour form={form} photos={photos} photoCount={photoCount} photoErrors={photoErrors} dayPrice={dayPrice} deposit={deposit} agreed={agreed} onAgree={setAgreed} onPhoto={addPhoto} onPhotoFile={handlePhotoFile} onPhotoFiles={handlePhotoFiles} onRemovePhoto={removePhoto} onZoom={setZoom} hasCavet={Boolean(cavet.trim())} hasInspection={Boolean(inspection.trim())}/> : null}

    {step <= 3 && gaps.length ? <p className="text-sm text-muted-gray">{gaps.join(" ")}</p> : null}
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

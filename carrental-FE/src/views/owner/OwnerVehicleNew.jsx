"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { Money } from "@/components/owner/money";
import { OwnerCrumb } from "@/components/owner/owner-screen";
import { useAsyncAction } from "@/hooks/use-async-resource";
import { calculatePlatformFee, formatVnd } from "@/lib/owner/finance";
import { ownerRoutes } from "@/lib/owner/routes";
import { carService } from "@/services/car.service";
import { useAuth } from "@/components/auth-provider";
const DRAFT_KEY = "cardb-vehicle-draft";
const steps = [
    { id: 1, title: "Thông tin & Giấy tờ", next: "Tiếp tục: Thông số & Tiện nghi (Bước 2)", blurb: "Cung cấp thông tin đăng ký, biển số và chứng từ pháp lý của phương tiện." },
    { id: 2, title: "Thông số & Tiện nghi", next: "Tiếp tục: Cài đặt bảng giá & cọc (Bước 3)", blurb: "Khai báo nhiên liệu, số chỗ, hộp số và tiện nghi trên xe." },
    { id: 3, title: "Giá thuê & Cọc", next: "Tiếp tục: Tải bộ ảnh niêm yết (Bước 4)", blurb: "Thiết lập đơn giá theo ngày, tiền cọc thế chấp và phí phụ trội." },
    { id: 4, title: "Hình ảnh niêm yết", next: "Gửi BQL CarDB thẩm định", blurb: "Tải ảnh thực tế và hoàn tất hồ sơ gửi CarDB thẩm định." },
];
const brands = ["VinFast", "Mercedes-Benz", "BMW", "Porsche", "Audi", "Hyundai"];
const modelsByBrand = {
    VinFast: ["VF 9 Plus AWD", "VF 8 Plus", "VF 5 Plus"],
    "Mercedes-Benz": ["GLC 300 4MATIC", "E 300 AMG"],
    BMW: ["530i M Sport", "X5 xDrive40i"],
    Porsche: ["Macan GTS", "Cayenne"],
    Audi: ["A6", "Q5"],
    Hyundai: ["Santa Fe", "Tucson"],
};
const years = ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018"];
const segments = [
    { id: "suv-ev", label: "SUV 7 chỗ hạng sang thuần điện", carType: "SUV", seats: "7", fuel: "ELECTRIC" },
    { id: "sedan", label: "Sedan thể thao cao cấp", carType: "SEDAN", seats: "5", fuel: "GASOLINE" },
    { id: "suv", label: "SUV 5 chỗ gia đình", carType: "SUV", seats: "5", fuel: "GASOLINE" },
    { id: "coupe", label: "Coupe / Siêu xe thể thao", carType: "LUXURY", seats: "4", fuel: "GASOLINE" },
];
const cities = ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Nha Trang"];
const areas = {
    "TP. Hồ Chí Minh": ["Quận 2 / TP. Thủ Đức (Thảo Điền / An Phú)", "Quận 1 / Bến Nghé", "Quận 7 / Phú Mỹ Hưng", "Sân bay Tân Sơn Nhất"],
    "Hà Nội": ["Ba Đình", "Hoàn Kiếm", "Cầu Giấy", "Nội Bài"],
    "Đà Nẵng": ["Hải Châu", "Sơn Trà", "Ngũ Hành Sơn"],
    "Nha Trang": ["Lộc Thọ", "Trần Phú"],
};
const fuels = [
    { id: "ELECTRIC", label: "Thuần điện" },
    { id: "HYBRID", label: "Hybrid" },
    { id: "GASOLINE", label: "Xăng" },
    { id: "DIESEL", label: "Dầu" },
];
const seatOptions = [
    { value: "7", label: "7 chỗ" },
    { value: "6", label: "6 chỗ" },
    { value: "5", label: "5 chỗ tiêu chuẩn" },
    { value: "4", label: "4 chỗ" },
];
const gearOptions = [
    { id: "AUTOMATIC", label: "Tự động" },
    { id: "MANUAL", label: "Số sàn" },
];
const amenities = [
    "Màn hình giải trí",
    "Âm thanh cao cấp",
    "Ghế da sưởi / làm mát",
    "Cửa sổ trời",
    "Trợ lái ADAS",
    "Camera 360°",
    "Sạc không dây",
    "Cốp điện",
    "HUD kính lái",
];
const photoSlots = [
    { id: "front", title: "Góc chéo trước", hint: "Ảnh đại diện" },
    { id: "rear", title: "Đuôi xe", hint: "Đèn hậu" },
    { id: "cabin", title: "Khoang lái", hint: "Vô-lăng" },
    { id: "seat", title: "Hàng ghế", hint: "Nội thất" },
    { id: "roof", title: "Cửa sổ trời", hint: "Trần xe" },
    { id: "trunk", title: "Cốp xe", hint: "Khoang hành lý" },
];
const cancelPolicies = ["Hủy miễn phí trước 24 giờ", "Hủy miễn phí trước 12 giờ", "Hủy miễn phí trước 48 giờ"];
const carTypes = [
    { id: "SUV", label: "SUV" },
    { id: "SEDAN", label: "Sedan" },
    { id: "HATCHBACK", label: "Hatchback" },
    { id: "MPV", label: "MPV" },
    { id: "PICKUP", label: "Bán tải" },
    { id: "LUXURY", label: "Hạng sang" },
    { id: "OTHER", label: "Khác" },
];
const OTHER = "__other__";
const initial = {
    brand: "VinFast",
    model: "VF 9 Plus AWD",
    licensePlate: "",
    manufactureYear: "2024",
    segment: segments[0].id,
    customSegment: "",
    carType: "SUV",
    city: cities[0],
    area: areas[cities[0]][0],
    pickupAddress: "",
    fuelType: "ELECTRIC",
    seats: "7",
    transmission: "AUTOMATIC",
    powerNote: "",
    rangeKm: "",
    amenities: [],
    pricePerDay: "",
    weekendPrice: "",
    depositAmount: "",
    kmLimitPerDay: "350",
    extraKmFee: "5000",
    lateFee: "100000",
    cancellation: cancelPolicies[0],
};
const fieldClass = "w-full rounded-xl border border-card-border bg-white px-3 py-2.5 text-sm font-medium text-charcoal outline-none focus:border-brand-accent";
function digitsOf(value) {
    return value.replace(/\D/g, "");
}
function grouped(value) {
    const digits = digitsOf(value);
    return digits ? new Intl.NumberFormat("vi-VN").format(Number(digits)) : "";
}
function amount(value) {
    const parsed = Number(digitsOf(value));
    return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}
function Field({ label, children }) {
    return <label className="flex flex-col gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-gray">
    {label}
    {children}
  </label>;
}
function listed(options) {
    return options.map(item => typeof item === "string" ? { value: item, label: item } : item);
}
function ChoiceSelect({ value, options, onPick, onType, placeholder, inputMode, maxLength }) {
    const items = listed(options);
    const known = items.some(item => item.value === value);
    const shown = known ? value : OTHER;
    const type = onType ?? onPick;
    return <>
    <select className={fieldClass} value={shown} onChange={event => onPick(event.target.value === OTHER ? "" : event.target.value)}>
      {items.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
      <option value={OTHER}>Khác — tự nhập</option>
    </select>
    {shown === OTHER ? <input className={`${fieldClass} normal-case`} value={value} placeholder={placeholder} inputMode={inputMode} maxLength={maxLength} onChange={event => type(event.target.value)}/> : null}
  </>;
}
export default function OwnerVehicleNew() {
    const router = useRouter();
    const { user } = useAuth();
    const create = useAsyncAction(submitCar);
    const [step, setStep] = useState(1);
    const [reached, setReached] = useState(1);
    const [form, setForm] = useState(initial);
    const [cavet, setCavet] = useState("");
    const [inspection, setInspection] = useState("");
    const [photos, setPhotos] = useState({});
    const [zoom, setZoom] = useState(null);
    const [agreed, setAgreed] = useState(false);
    const [draftNote, setDraftNote] = useState("");
    const set = (patch) => setForm(current => ({ ...current, ...patch }));
    useEffect(() => {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw)
            return;
        try {
            const saved = JSON.parse(raw);
            if (saved.form)
                setForm(current => ({ ...current, ...saved.form, amenities: saved.form?.amenities ?? current.amenities }));
            if (saved.photos)
                setPhotos(saved.photos);
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
    const dayPrice = amount(form.pricePerDay);
    const weekend = amount(form.weekendPrice);
    const deposit = amount(form.depositAmount);
    const kmLimit = amount(form.kmLimitPerDay);
    const extraKm = amount(form.extraKmFee);
    const fee = dayPrice ? calculatePlatformFee(dayPrice, 10) : 0;
    const photoCount = Object.keys(photos).length;
    const year = Number(form.manufactureYear);
    const yearReady = Number.isInteger(year) && year >= 1990 && year <= 2100;
    const seatCount = Number(form.seats);
    const seatsReady = Number.isInteger(seatCount) && seatCount >= 1 && seatCount <= 60;
    const identityReady = Boolean(form.brand.trim() && form.model.trim() && form.city.trim() && yearReady && form.licensePlate.trim().length >= 4 && form.pickupAddress.trim() && (form.segment !== OTHER || form.carType));
    const papersReady = [cavet, inspection].every(url => !url.trim() || isUrl(url));
    const priceReady = dayPrice !== null && dayPrice > 0 && weekend !== null && weekend > 0 && deposit !== null && kmLimit !== null && kmLimit > 0 && extraKm !== null;
    const ready = [identityReady, seatsReady, priceReady, agreed];
    const gaps = [
        form.licensePlate.trim().length < 4 ? "Biển số cần ít nhất 4 ký tự." : "",
        !form.pickupAddress.trim() ? "Chưa nhập địa chỉ bãi xe." : "",
        !papersReady ? "Link giấy tờ phải bắt đầu bằng http:// hoặc https://." : "",
    ].filter(Boolean);
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
    async function submit() {
        if (!identityReady || !papersReady || !priceReady || !agreed || dayPrice === null || deposit === null || kmLimit === null || extraKm === null)
            return;
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
            manufactureYear: year,
            carType: form.segment === OTHER ? form.carType : segment.carType,
            seats: seatCount,
            transmission: form.transmission,
            fuelType: form.fuelType,
            city: form.city.trim(),
            district: form.area.trim(),
            pickupAddress: form.pickupAddress.trim(),
            description: details,
            features: JSON.stringify(form.amenities),
            pricePerDay: dayPrice,
            pricePerHour: Math.max(1, Math.round(dayPrice / 10)),
            depositAmount: deposit,
            kmLimitPerDay: kmLimit,
            extraKmFee: extraKm,
            imageUrls: ordered,
        });
        if (!car)
            return;
        localStorage.removeItem(DRAFT_KEY);
        router.push(ownerRoutes.vehicles);
    }
    const subtitle = `${form.brand} ${form.model} • ${form.licensePlate || "Chưa có biển số"}`;
    return <div className="flex min-w-0 flex-col gap-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <OwnerCrumb current={steps[step - 1].title} parent={{ href: ownerRoutes.vehicles, label: "Xe của tôi" }}/>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-charcoal sm:text-[28px]">Đăng ký xe cho thuê mới</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-gray">Bước {step}/4: {steps[step - 1].blurb}</p>
      </div>
      {step === 1 ? <Link href={ownerRoutes.vehicles} className="inline-flex items-center gap-1.5 self-start rounded-xl border border-card-border bg-white px-4 py-2.5 text-sm font-bold text-charcoal">
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
    {create.error ? <p className="text-sm text-on-error-container">{create.error.message}</p> : null}

    <div className="flex flex-wrap items-center justify-between gap-2">
      <Link href={ownerRoutes.vehicles} className="rounded-xl border border-card-border bg-white px-4 py-2.5 text-sm font-bold text-charcoal">Hủy bỏ đăng ký</Link>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={saveDraft} className="rounded-xl border border-card-border bg-white px-4 py-2.5 text-sm font-bold text-charcoal">Lưu bản nháp</button>
        {step < 4 ? <button type="button" disabled={!ready[step - 1]} onClick={() => { setStep(step + 1); setReached(value => Math.max(value, step + 1)); }} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60">
          {steps[step - 1].next} <Icon name="arrow_forward" className="text-[16px]"/>
        </button> : <button type="button" disabled={!identityReady || !papersReady || !priceReady || !agreed || create.running} onClick={() => void submit()} className="rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60">
          Gửi BQL CarDB thẩm định
        </button>}
      </div>
    </div>

    {zoom ? <button type="button" aria-label="Đóng ảnh" onClick={() => setZoom(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 p-6">
      <img src={zoom} alt="Ảnh xe phóng to" className="max-h-[80vh] max-w-full rounded-2xl"/>
    </button> : null}
  </div>;
}
function StepOne({ form, cavet, inspection, onChange, onBrand, onSegment, onCity, onCavet, onInspection }) {
    const models = modelsByBrand[form.brand] ?? [];
    const areaOptions = areas[form.city] ?? [];
    return <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
    <section className="rounded-2xl border border-card-border bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-base font-bold text-charcoal"><Icon name="directions_car" className="text-[20px] text-brand-accent"/> Thông tin định danh phương tiện</h2>
      <p className="mt-1 text-xs text-muted-gray">Nhập đúng biển số và địa chỉ trên giấy đăng ký xe.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Hãng xe">
          <ChoiceSelect value={form.brand} options={brands} onPick={onBrand} onType={brand => onChange({ brand })} placeholder="Nhập hãng xe" maxLength={50}/>
        </Field>
        <Field label="Dòng xe / phiên bản">
          {models.length ? <ChoiceSelect value={form.model} options={models} onPick={model => onChange({ model })} placeholder="Nhập dòng xe" maxLength={50}/> : <input className={`${fieldClass} normal-case`} value={form.model} maxLength={50} placeholder="Nhập dòng xe" onChange={event => onChange({ model: event.target.value })}/>}
        </Field>
        <Field label="Biển kiểm soát">
          <input className={fieldClass} value={form.licensePlate} placeholder="51K-889.92" onChange={event => onChange({ licensePlate: event.target.value.toUpperCase() })}/>
        </Field>
        <Field label="Năm sản xuất">
          <ChoiceSelect value={form.manufactureYear} options={years} onPick={manufactureYear => onChange({ manufactureYear })} placeholder="Ví dụ 2016" inputMode="numeric" maxLength={4}/>
        </Field>
        <Field label="Phân khúc xe">
          <select className={fieldClass} value={form.segment} onChange={event => onSegment(event.target.value)}>
            {segments.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
            <option value={OTHER}>Khác — tự nhập</option>
          </select>
          {form.segment === OTHER ? <>
            <input className={`${fieldClass} normal-case`} value={form.customSegment} maxLength={80} placeholder="Tên phân khúc" onChange={event => onChange({ customSegment: event.target.value })}/>
            <select className={fieldClass} value={form.carType} onChange={event => onChange({ carType: event.target.value })}>{carTypes.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
          </> : null}
        </Field>
        <Field label="Thành phố vận hành">
          <ChoiceSelect value={form.city} options={cities} onPick={onCity} onType={city => onChange({ city })} placeholder="Nhập thành phố" maxLength={100}/>
        </Field>
        <Field label="Khu vực giao nhận">
          {areaOptions.length ? <ChoiceSelect value={form.area} options={areaOptions} onPick={area => onChange({ area })} placeholder="Nhập khu vực" maxLength={100}/> : <input className={`${fieldClass} normal-case`} value={form.area} maxLength={100} placeholder="Nhập khu vực" onChange={event => onChange({ area: event.target.value })}/>}
        </Field>
        <Field label="Địa chỉ bãi xe cố định">
          <input className={fieldClass} value={form.pickupAddress} placeholder="128 Thảo Điền, P. Thảo Điền" onChange={event => onChange({ pickupAddress: event.target.value })}/>
        </Field>
      </div>
      <p className="mt-4 rounded-xl bg-accent-soft px-4 py-3 text-xs leading-relaxed text-charcoal">Biển số và địa chỉ giao nhận cần trùng giấy đăng ký xe để CarDB đối chiếu hồ sơ.</p>
    </section>
    <section className="flex flex-col gap-3 rounded-2xl border border-card-border bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-charcoal">Giấy tờ bắt buộc</h2>
      <p className="text-xs text-muted-gray">Hệ thống lưu giấy tờ dạng đường dẫn (Google Drive, ảnh đã tải lên...). Có thể bổ sung sau khi gửi hồ sơ.</p>
      <label className="rounded-xl border border-dashed border-card-border p-3 text-sm">
        <span className="font-bold text-charcoal">Giấy đăng ký xe (cavet)</span>
        <input type="url" value={cavet} placeholder="https://..." onChange={event => onCavet(event.target.value)} className={`${fieldClass} mt-2`}/>
      </label>
      <label className="rounded-xl border border-dashed border-card-border p-3 text-sm">
        <span className="font-bold text-charcoal">Sổ kiểm định an toàn</span>
        <input type="url" value={inspection} placeholder="https://..." onChange={event => onInspection(event.target.value)} className={`${fieldClass} mt-2`}/>
        <span className="mt-1 block text-xs text-muted-gray">Còn hạn tối thiểu 3 tháng khi niêm yết.</span>
      </label>
      <div className="rounded-xl bg-status-green-bg px-3 py-3 text-xs leading-relaxed text-status-success-ink">
        <p className="font-bold">Bảo hiểm vật chất CarDB Care</p>
        Gói bảo hiểm gắn khi xe được duyệt. Chủ xe không thu phí bảo hiểm riêng trên giá thuê.
      </div>
      <a href="tel:19008899" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-accent"><Icon name="call" className="text-[16px]"/> Cần trợ giúp hồ sơ: 1900 8899</a>
    </section>
  </div>;
}
function StepTwo({ form, onChange }) {
    function toggle(name) {
        onChange({ amenities: form.amenities.includes(name) ? form.amenities.filter(item => item !== name) : [...form.amenities, name] });
    }
    return <div className="grid items-start gap-4 xl:grid-cols-2">
    <section className="rounded-2xl border border-card-border bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-charcoal">Thông số kỹ thuật</h2>
      <div className="mt-4 grid gap-4">
        <Field label="Nhiên liệu">
          <select className={fieldClass} value={form.fuelType} onChange={event => onChange({ fuelType: event.target.value })}>{fuels.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
        </Field>
        <Field label="Số chỗ ngồi">
          <ChoiceSelect value={form.seats} options={seatOptions} onPick={seats => onChange({ seats: digitsOf(seats).slice(0, 2) })} placeholder="Ví dụ 9" inputMode="numeric" maxLength={2}/>
        </Field>
        <Field label="Hộp số">
          <select className={fieldClass} value={form.transmission} onChange={event => onChange({ transmission: event.target.value })}>{gearOptions.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
        </Field>
        <p className="text-xs font-medium normal-case text-muted-gray">Nhiên liệu và hộp số chỉ gồm các loại hệ thống đang lưu được.</p>
        <Field label={form.fuelType === "ELECTRIC" ? "Dung lượng pin / công suất" : "Động cơ / công suất"}>
          <input className={fieldClass} value={form.powerNote} placeholder={form.fuelType === "ELECTRIC" ? "Ví dụ 123 kWh" : "Ví dụ 2.0L"} onChange={event => onChange({ powerNote: event.target.value })}/>
        </Field>
        <Field label="Tầm vận hành (km)">
          <input inputMode="numeric" className={fieldClass} value={form.rangeKm} placeholder="Không bắt buộc" onChange={event => onChange({ rangeKm: digitsOf(event.target.value) })}/>
        </Field>
      </div>
    </section>
    <section className="rounded-2xl border border-card-border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-charcoal">Trang bị và tiện nghi</h2>
        <button type="button" className="text-xs font-bold text-brand-accent" onClick={() => onChange({ amenities: form.amenities.length === amenities.length ? [] : amenities })}>Chọn tất cả</button>
      </div>
      <p className="mt-1 text-xs text-muted-gray">{form.amenities.length} đã chọn. Tiện nghi dùng để mô tả xe, không đổi giá thuê.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {amenities.map(name => {
            const selected = form.amenities.includes(name);
            return <button key={name} type="button" onClick={() => toggle(name)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${selected ? "border-brand-accent bg-accent-soft text-charcoal" : "border-card-border bg-white text-muted-gray"}`}>{name}</button>;
        })}
      </div>
    </section>
  </div>;
}
function StepThree({ form, dayPrice, weekend, fee, onChange }) {
    return <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.3fr)_300px]">
    <section className="rounded-2xl border border-card-border bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-base font-bold text-charcoal"><Icon name="payments" className="text-[20px] text-brand-accent"/> Cài đặt bảng giá và tiền cọc</h2>
      <p className="mt-1 text-sm text-muted-gray">Đơn giá ngày thường được lưu làm giá niêm yết. Tiền cọc chủ xe tự thu khi ký C10-A.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Đơn giá ngày thường (VND)">
          <input inputMode="numeric" className={fieldClass} value={grouped(form.pricePerDay)} onChange={event => onChange({ pricePerDay: digitsOf(event.target.value) })}/>
        </Field>
        <Field label="Đơn giá cuối tuần (VND)">
          <input inputMode="numeric" className={fieldClass} value={grouped(form.weekendPrice)} onChange={event => onChange({ weekendPrice: digitsOf(event.target.value) })}/>
        </Field>
        <Field label="Tiền cọc thế chấp (VND)">
          <input inputMode="numeric" className={fieldClass} value={grouped(form.depositAmount)} onChange={event => onChange({ depositAmount: digitsOf(event.target.value) })}/>
        </Field>
        <Field label="Chính sách hủy">
          <ChoiceSelect value={form.cancellation} options={cancelPolicies} onPick={cancellation => onChange({ cancellation })} placeholder="Nhập chính sách hủy" maxLength={120}/>
        </Field>
        <Field label="Giới hạn km / ngày">
          <input inputMode="numeric" className={fieldClass} value={form.kmLimitPerDay} onChange={event => onChange({ kmLimitPerDay: digitsOf(event.target.value) })}/>
        </Field>
        <Field label="Phí quá km (VND)">
          <input inputMode="numeric" className={fieldClass} value={grouped(form.extraKmFee)} onChange={event => onChange({ extraKmFee: digitsOf(event.target.value) })}/>
        </Field>
        <Field label="Phí trễ giờ (VND)">
          <input inputMode="numeric" className={fieldClass} value={grouped(form.lateFee)} onChange={event => onChange({ lateFee: digitsOf(event.target.value) })}/>
        </Field>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-gray">Khách hủy muộn hơn mốc đã chọn đền bù theo hợp đồng thuê. Phí trễ giờ chủ xe đối soát khi trả xe, không trừ vào payout.</p>
    </section>
    <aside className="rounded-2xl border border-card-border bg-white p-5 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-gray">Bảng tính thu nhập</p>
      <h2 className="mt-2 font-bold text-charcoal">{form.brand} {form.model}</h2>
      <p className="font-mono text-xs text-muted-gray">{form.licensePlate || "Chưa có biển số"} • {form.seats} chỗ</p>
      <dl className="mt-4 flex flex-col gap-2 text-sm">
        <div className="flex justify-between gap-3"><dt className="text-muted-gray">Ngày thường</dt><dd><Money amount={dayPrice ?? 0}/></dd></div>
        <div className="flex justify-between gap-3"><dt className="text-muted-gray">Phí CarDB 10%</dt><dd><Money amount={fee} sign="-"/></dd></div>
        <div className="flex justify-between gap-3 border-t border-card-border pt-2 font-bold"><dt>Thực nhận / ngày</dt><dd><Money amount={Math.max(0, (dayPrice ?? 0) - fee)} className="text-status-success-ink"/></dd></div>
        <div className="flex justify-between gap-3 text-xs"><dt className="text-muted-gray">Cuối tuần</dt><dd>{weekend ? formatVnd(weekend) : "—"}</dd></div>
      </dl>
      <p className="mt-4 rounded-xl bg-bg-light px-3 py-2 text-xs leading-relaxed text-muted-gray">Tiền thuê chuyển về tài khoản liên kết sau khi ký C10-B. Tiền cọc không nằm trong số thực nhận.</p>
    </aside>
  </div>;
}
function StepFour({ form, photos, photoCount, dayPrice, deposit, agreed, onAgree, onPhoto, onZoom, hasCavet, hasInspection }) {
    return <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.4fr)_320px]">
    <section className="rounded-2xl border border-card-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-charcoal">Bộ ảnh niêm yết tiêu chuẩn</h2>
        <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-bold text-charcoal">{photoCount}/6 đã chọn</span>
      </div>
      <p className="mt-1 text-xs text-muted-gray">Dán đường dẫn ảnh (https://...). Ảnh góc trước làm ảnh đại diện, các ảnh còn lại hiển thị trong thư viện xe.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {photoSlots.map(slot => {
            const photo = photos[slot.id];
            const valid = photo && isUrl(photo.url);
            return <div key={slot.id} className="overflow-hidden rounded-xl border border-card-border">
            <div className="relative flex h-28 items-center justify-center bg-bg-light">
              {valid ? <img src={photo.url} alt={slot.title} className="h-full w-full object-cover"/> : <span className="px-3 text-center text-xs text-muted-gray">{slot.hint}</span>}
              {slot.id === "front" ? <span className="absolute left-2 top-2 rounded-full bg-brand-accent px-2 py-0.5 text-[10px] font-bold text-white">Ảnh đại diện</span> : null}
            </div>
            <div className="p-2">
              <p className="text-xs font-bold text-charcoal">{slot.title}</p>
              <input type="url" value={photo?.url ?? ""} placeholder="https://..." onChange={event => onPhoto(slot.id, event.target.value)} className="mt-1 w-full rounded-lg border border-card-border px-2 py-1 text-[11px]"/>
              {photo && !valid ? <p className="mt-1 text-[11px] text-on-error-container">Đường dẫn chưa hợp lệ.</p> : null}
              {valid ? <button type="button" className="mt-1 text-[11px] font-bold text-charcoal" onClick={() => onZoom(photo.url)}>Phóng to</button> : null}
            </div>
          </div>;
        })}
      </div>
    </section>
    <aside className="rounded-2xl border border-card-border bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-base font-bold text-charcoal"><Icon name="assignment_turned_in" className="text-[20px] text-brand-accent"/> Tóm tắt hồ sơ</h2>
      <p className="mt-2 font-bold text-charcoal">{form.brand} {form.model}</p>
      <p className="text-xs text-muted-gray">{form.manufactureYear} • {form.licensePlate || "Chưa có biển số"} • {form.seats} chỗ</p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl bg-bg-light p-2"><dt className="text-[11px] text-muted-gray">Giá niêm yết</dt><dd className="font-bold">{dayPrice ? formatVnd(dayPrice) : "—"}</dd></div>
        <div className="rounded-xl bg-bg-light p-2"><dt className="text-[11px] text-muted-gray">Tiền cọc</dt><dd className="font-bold">{deposit !== null ? formatVnd(deposit) : "—"}</dd></div>
      </dl>
      <p className="mt-3 text-xs text-muted-gray">{form.pickupAddress ? `${form.pickupAddress}, ${form.city}` : "Chưa có địa chỉ giao xe"}</p>
      <ul className="mt-3 flex flex-col gap-1 text-xs text-charcoal">
        <li>{form.pickupAddress ? "Bãi giao nhận đã khai" : "Thiếu địa chỉ giao xe"}</li>
        <li>{hasCavet && hasInspection ? "Cavet và đăng kiểm đã chọn" : "Thiếu giấy tờ"}</li>
        <li>{dayPrice ? "Giá và hạn km đã thiết lập" : "Chưa có giá thuê"}</li>
        <li>{photoCount}/6 góc ảnh</li>
      </ul>
      <label className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-charcoal">
        <input type="checkbox" className="mt-0.5" checked={agreed} onChange={event => onAgree(event.target.checked)}/>
        Tôi cam kết thông tin và hình ảnh là chính xác, thuộc quyền sử dụng hợp pháp.
      </label>
      <p className="mt-3 rounded-xl bg-accent-soft px-3 py-2 text-xs text-charcoal">CarDB thẩm định hồ sơ trước khi mở niêm yết. Xe ở trạng thái chờ duyệt cho đến khi được xác nhận.</p>
    </aside>
  </div>;
}
function isUrl(value) {
    return /^https?:\/\/\S+$/i.test(value.trim()) && value.trim().length <= 500;
}

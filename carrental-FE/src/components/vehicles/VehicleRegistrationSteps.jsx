import { mediaUrlInput, validateImageFile } from "@/utils/validateInput.js";
import { resolveAssetUrl } from "@/utils/labels.js";
import { digitsOnly as digitsOf, formatVndInput as grouped } from "@/utils/inputParser.js";
import { Icon } from "@/components/Icon.jsx";
import { Money } from "@/components/owner/Money.jsx";
import { formatVnd } from "@/utils/owner.js";

export const DRAFT_KEY = "cardb-vehicle-draft";
export const steps = [
    { id: 1, title: "Thông tin & Giấy tờ", next: "Tiếp tục: Thông số & Tiện nghi (Bước 2)", blurb: "Cung cấp thông tin đăng ký, biển số và chứng từ pháp lý của phương tiện." },
    { id: 2, title: "Thông số & Tiện nghi", next: "Tiếp tục: Cài đặt bảng giá & cọc (Bước 3)", blurb: "Khai báo nhiên liệu, số chỗ, hộp số và tiện nghi trên xe." },
    { id: 3, title: "Giá thuê & Cọc", next: "Tiếp tục: Tải bộ ảnh niêm yết (Bước 4)", blurb: "Thiết lập đơn giá theo ngày, tiền cọc thế chấp và phí phụ trội." },
    { id: 4, title: "Hình ảnh niêm yết", next: "Gửi BQL CarDB thẩm định", blurb: "Tải ảnh thực tế và hoàn tất hồ sơ gửi CarDB thẩm định." },
];
const brands = ["Toyota", "Honda", "Hyundai", "Kia", "Mazda", "Mitsubishi", "Ford", "VinFast", "Suzuki", "Nissan", "Mercedes-Benz", "BMW", "Audi", "Porsche"];
export const modelsByBrand = {
    Toyota: ["Vios", "Camry", "Corolla Cross", "Fortuner", "Innova", "Veloz Cross"],
    Honda: ["City", "Civic", "CR-V", "HR-V", "BR-V"],
    Hyundai: ["Accent", "Creta", "Tucson", "Santa Fe", "Stargazer"],
    Kia: ["Morning", "K3", "Seltos", "Sonet", "Carnival", "Sorento"],
    Mazda: ["Mazda2", "Mazda3", "CX-5", "CX-8"],
    Mitsubishi: ["Xpander", "Xforce", "Attrage", "Triton"],
    Ford: ["Ranger", "Everest", "Territory"],
    VinFast: ["VF 3", "VF 5 Plus", "VF 6", "VF 8 Plus", "VF 9 Plus AWD"],
    Suzuki: ["Ertiga", "XL7", "Swift"],
    Nissan: ["Almera", "Navara", "Kicks"],
    "Mercedes-Benz": ["C 200", "E 300 AMG", "GLC 300 4MATIC"],
    BMW: ["320i", "530i M Sport", "X5 xDrive40i"],
    Audi: ["A4", "A6", "Q5"],
    Porsche: ["Macan GTS", "Cayenne"],
};
const years = ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018"];
export const segments = [
    { id: "suv-ev", label: "SUV 7 chỗ hạng sang thuần điện", carType: "SUV", seats: "7", fuel: "ELECTRIC" },
    { id: "sedan", label: "Sedan thể thao cao cấp", carType: "SEDAN", seats: "5", fuel: "GASOLINE" },
    { id: "suv", label: "SUV 5 chỗ gia đình", carType: "SUV", seats: "5", fuel: "GASOLINE" },
    { id: "coupe", label: "Coupe / Siêu xe thể thao", carType: "LUXURY", seats: "4", fuel: "GASOLINE" },
];
const cities = ["TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Nha Trang"];
export const areas = {
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
export const amenities = [
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
export const photoSlots = [
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
export const OTHER = "__other__";
export const initial = {
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
const fieldErrorClass = "w-full rounded-xl border border-[#EF4444] bg-[#FEF2F2]/40 px-3 py-2.5 text-sm font-medium text-charcoal outline-none focus:border-[#EF4444]";
function inputCls(error) {
    return error ? fieldErrorClass : fieldClass;
}
function Field({ label, error, children }) {
    return <label className="flex flex-col gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-gray">
    {label}
    {children}
    {error ? <span role="alert" className="text-[11px] font-semibold normal-case tracking-normal text-[#B91C1C]">{error}</span> : null}
  </label>;
}
function listed(options) {
    return options.map(item => typeof item === "string" ? { value: item, label: item } : item);
}
function ChoiceSelect({ value, options, onPick, onType, placeholder, inputMode, maxLength, error }) {
    const items = listed(options);
    const known = items.some(item => item.value === value);
    const shown = known ? value : OTHER;
    const type = onType ?? onPick;
    return <>
    <select className={inputCls(error)} value={shown} onChange={event => onPick(event.target.value === OTHER ? "" : event.target.value)}>
      {items.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
      <option value={OTHER}>Khác — tự nhập</option>
    </select>
    {shown === OTHER ? <input className={`${inputCls(error)} normal-case`} value={value} placeholder={placeholder} inputMode={inputMode} maxLength={maxLength} onChange={event => type(event.target.value)}/> : null}
  </>;
}
export function StepOne({
    form,
    cavet,
    inspection,
    cavetFile = null,
    inspectionFile = null,
    cavetError = "",
    inspectionError = "",
    errors = {},
    onChange,
    onBrand,
    onSegment,
    onCity,
    onCavet,
    onInspection,
    onCavetFile,
    onInspectionFile,
}) {
    const models = modelsByBrand[form.brand] ?? [];
    const areaOptions = areas[form.city] ?? [];
    return <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
    <section className="rounded-2xl border border-card-border bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-base font-bold text-charcoal"><Icon name="directions_car" className="text-[20px] text-brand-accent"/> Thông tin định danh phương tiện</h2>
      <p className="mt-1 text-xs text-muted-gray">Nhập đúng biển số và địa chỉ trên giấy đăng ký xe.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Hãng xe" error={errors.brand}>
          <ChoiceSelect value={form.brand} options={brands} onPick={onBrand} onType={brand => onChange({ brand })} placeholder="Nhập hãng xe" maxLength={50} error={errors.brand}/>
        </Field>
        <Field label="Dòng xe / phiên bản" error={errors.model}>
          {models.length ? <ChoiceSelect value={form.model} options={models} onPick={model => onChange({ model })} placeholder="Nhập dòng xe" maxLength={50} error={errors.model}/> : <input className={`${inputCls(errors.model)} normal-case`} value={form.model} maxLength={50} placeholder="Nhập dòng xe" onChange={event => onChange({ model: event.target.value })}/>}
        </Field>
        <Field label="Biển kiểm soát" error={errors.licensePlate}>
          <input className={inputCls(errors.licensePlate)} value={form.licensePlate} maxLength={20} placeholder="51K-889.92" onChange={event => onChange({ licensePlate: event.target.value.toUpperCase() })}/>
        </Field>
        <Field label="Năm sản xuất" error={errors.manufactureYear}>
          <ChoiceSelect value={form.manufactureYear} options={years} onPick={manufactureYear => onChange({ manufactureYear: digitsOf(manufactureYear).slice(0, 4) })} placeholder="Ví dụ 2016" inputMode="numeric" maxLength={4} error={errors.manufactureYear}/>
        </Field>
        <Field label="Phân khúc xe" error={errors.carType}>
          <select className={inputCls(errors.carType)} value={form.segment} onChange={event => onSegment(event.target.value)}>
            {segments.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
            <option value={OTHER}>Khác — tự nhập</option>
          </select>
          {form.segment === OTHER ? <>
            <input className={`${fieldClass} normal-case`} value={form.customSegment} maxLength={80} placeholder="Tên phân khúc" onChange={event => onChange({ customSegment: event.target.value })}/>
            <select className={fieldClass} value={form.carType} onChange={event => onChange({ carType: event.target.value })}>{carTypes.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
          </> : null}
        </Field>
        <Field label="Thành phố vận hành" error={errors.city}>
          <ChoiceSelect value={form.city} options={cities} onPick={onCity} onType={city => onChange({ city })} placeholder="Nhập thành phố" maxLength={100} error={errors.city}/>
        </Field>
        <Field label="Khu vực giao nhận">
          {areaOptions.length ? <ChoiceSelect value={form.area} options={areaOptions} onPick={area => onChange({ area })} placeholder="Nhập khu vực" maxLength={100}/> : <input className={`${fieldClass} normal-case`} value={form.area} maxLength={100} placeholder="Nhập khu vực" onChange={event => onChange({ area: event.target.value })}/>}
        </Field>
        <Field label="Địa chỉ bãi xe cố định" error={errors.pickupAddress}>
          <input className={inputCls(errors.pickupAddress)} value={form.pickupAddress} maxLength={300} placeholder="128 Thảo Điền, P. Thảo Điền" onChange={event => onChange({ pickupAddress: event.target.value })}/>
        </Field>
      </div>
      <p className="mt-4 rounded-xl bg-accent-soft px-4 py-3 text-xs leading-relaxed text-charcoal">Biển số và địa chỉ giao nhận cần trùng giấy đăng ký xe để CarDB đối chiếu hồ sơ.</p>
    </section>
    <section className="flex flex-col gap-3 rounded-2xl border border-card-border bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-charcoal">Giấy tờ bắt buộc</h2>
      <p className="text-xs text-muted-gray">Chọn ảnh JPG, PNG hoặc WebP từ máy (tối đa 5MB) để xem trước.</p>
      <div className="rounded-xl border border-dashed border-card-border p-3 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold text-charcoal">Giấy đăng ký xe (cavet)</span>
          <label className="cursor-pointer rounded-lg border border-card-border bg-bg-light px-2.5 py-1 text-xs font-bold text-charcoal hover:bg-accent-soft">
            Chọn ảnh từ máy
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={event => {
                const file = event.target.files?.[0] ?? null;
                event.target.value = "";
                if (file) onCavetFile?.(file);
              }}
            />
          </label>
        </div>
        {cavet && isUrl(cavet) ? (
          <div className="mt-2 overflow-hidden rounded-lg border border-card-border bg-bg-light">
            <img src={resolveAssetUrl(cavet)} alt="Xem trước giấy đăng ký xe" className="h-28 w-full object-cover" />
            <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-[11px] text-muted-gray">
              <span className="truncate">{cavetFile ? `Tệp: ${cavetFile.name}` : cavet}</span>
              <button type="button" onClick={() => { onCavetFile?.(null); onCavet(""); }} className="shrink-0 font-bold text-red-600 hover:underline">Xóa</button>
            </div>
          </div>
        ) : null}
        {(cavetError || errors.registrationUrl) ? <span role="alert" className="mt-1 block text-xs font-semibold text-[#B91C1C]">{cavetError || errors.registrationUrl}</span> : null}
      </div>
      <div className="rounded-xl border border-dashed border-card-border p-3 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold text-charcoal">Sổ kiểm định an toàn</span>
          <label className="cursor-pointer rounded-lg border border-card-border bg-bg-light px-2.5 py-1 text-xs font-bold text-charcoal hover:bg-accent-soft">
            Chọn ảnh từ máy
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={event => {
                const file = event.target.files?.[0] ?? null;
                event.target.value = "";
                if (file) onInspectionFile?.(file);
              }}
            />
          </label>
        </div>
        {inspection && isUrl(inspection) ? (
          <div className="mt-2 overflow-hidden rounded-lg border border-card-border bg-bg-light">
            <img src={resolveAssetUrl(inspection)} alt="Xem trước sổ kiểm định" className="h-28 w-full object-cover" />
            <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-[11px] text-muted-gray">
              <span className="truncate">{inspectionFile ? `Tệp: ${inspectionFile.name}` : inspection}</span>
              <button type="button" onClick={() => { onInspectionFile?.(null); onInspection(""); }} className="shrink-0 font-bold text-red-600 hover:underline">Xóa</button>
            </div>
          </div>
        ) : null}
        {(inspectionError || errors.inspectionUrl) ? <span role="alert" className="mt-1 block text-xs font-semibold text-[#B91C1C]">{inspectionError || errors.inspectionUrl}</span> : null}
        <span className="mt-1 block text-xs text-muted-gray">Còn hạn tối thiểu 3 tháng khi niêm yết.</span>
      </div>
      <div className="rounded-xl bg-status-green-bg px-3 py-3 text-xs leading-relaxed text-status-success-ink">
        <p className="font-bold">Bảo hiểm vật chất CarDB Care</p>
        Gói bảo hiểm gắn khi xe được duyệt. Chủ xe không thu phí bảo hiểm riêng trên giá thuê.
      </div>
      <a href="tel:19008899" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-accent"><Icon name="call" className="text-[16px]"/> Cần trợ giúp hồ sơ: 1900 8899</a>
    </section>
  </div>;
}
export function StepTwo({ form, errors = {}, onChange }) {
    function toggle(name) {
        onChange({ amenities: form.amenities.includes(name) ? form.amenities.filter(item => item !== name) : [...form.amenities, name] });
    }
    return <div className="grid items-start gap-4 xl:grid-cols-2">
    <section className="rounded-2xl border border-card-border bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-charcoal">Thông số kỹ thuật</h2>
      <div className="mt-4 grid gap-4">
        <Field label="Nhiên liệu" error={errors.fuelType}>
          <select className={inputCls(errors.fuelType)} value={form.fuelType} onChange={event => onChange({ fuelType: event.target.value })}>{fuels.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
        </Field>
        <Field label="Số chỗ ngồi" error={errors.seats}>
          <ChoiceSelect value={form.seats} options={seatOptions} onPick={seats => onChange({ seats: digitsOf(seats).slice(0, 2) })} placeholder="Ví dụ 9" inputMode="numeric" maxLength={2} error={errors.seats}/>
        </Field>
        <Field label="Hộp số" error={errors.transmission}>
          <select className={inputCls(errors.transmission)} value={form.transmission} onChange={event => onChange({ transmission: event.target.value })}>{gearOptions.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
        </Field>
        <p className="text-xs font-medium normal-case text-muted-gray">Nhiên liệu và hộp số chỉ gồm các loại hệ thống đang lưu được.</p>
        <Field label={form.fuelType === "ELECTRIC" ? "Dung lượng pin / công suất" : "Động cơ / công suất"}>
          <input className={fieldClass} maxLength={60} value={form.powerNote} placeholder={form.fuelType === "ELECTRIC" ? "Ví dụ 123 kWh" : "Ví dụ 2.0L"} onChange={event => onChange({ powerNote: event.target.value })}/>
        </Field>
        <Field label="Tầm vận hành (km)" error={errors.rangeKm}>
          <input inputMode="numeric" maxLength={4} className={inputCls(errors.rangeKm)} value={form.rangeKm} placeholder="Không bắt buộc (10 - 5.000 km)" onChange={event => onChange({ rangeKm: digitsOf(event.target.value) })}/>
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
export function StepThree({ form, dayPrice, weekend, deposit, errors = {}, onChange }) {
    return <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.3fr)_300px]">
    <section className="rounded-2xl border border-card-border bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-base font-bold text-charcoal"><Icon name="payments" className="text-[20px] text-brand-accent"/> Cài đặt bảng giá và tiền cọc</h2>
      <p className="mt-1 text-sm text-muted-gray">Đây là các điều khoản hiển thị cho khách khi gửi yêu cầu đặt xe. CarDB không thu hộ tiền thuê: khách thanh toán và đặt cọc trực tiếp cho chủ xe khi nhận xe.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Đơn giá ngày thường (VND)" error={errors.pricePerDay}>
          <input inputMode="numeric" className={inputCls(errors.pricePerDay)} value={grouped(form.pricePerDay)} placeholder="Tối thiểu 10.000đ" onChange={event => onChange({ pricePerDay: digitsOf(event.target.value) })}/>
        </Field>
        <Field label="Đơn giá cuối tuần (VND)" error={errors.weekendPrice}>
          <input inputMode="numeric" className={inputCls(errors.weekendPrice)} value={grouped(form.weekendPrice)} placeholder="Tối thiểu 10.000đ" onChange={event => onChange({ weekendPrice: digitsOf(event.target.value) })}/>
        </Field>
        <Field label="Tiền cọc thế chấp (VND)" error={errors.depositAmount}>
          <input inputMode="numeric" className={inputCls(errors.depositAmount)} value={grouped(form.depositAmount)} placeholder="Nhập 0 nếu miễn cọc" onChange={event => onChange({ depositAmount: digitsOf(event.target.value) })}/>
        </Field>
        <Field label="Chính sách hủy">
          <ChoiceSelect value={form.cancellation} options={cancelPolicies} onPick={cancellation => onChange({ cancellation })} placeholder="Nhập chính sách hủy" maxLength={120}/>
        </Field>
        <Field label="Giới hạn km / ngày" error={errors.kmLimitPerDay}>
          <input inputMode="numeric" maxLength={4} className={inputCls(errors.kmLimitPerDay)} value={form.kmLimitPerDay} placeholder="10 - 5.000 km" onChange={event => onChange({ kmLimitPerDay: digitsOf(event.target.value) })}/>
        </Field>
        <Field label="Phí quá km (VND)" error={errors.extraKmFee}>
          <input inputMode="numeric" className={inputCls(errors.extraKmFee)} value={grouped(form.extraKmFee)} placeholder="0 - 1.000.000đ" onChange={event => onChange({ extraKmFee: digitsOf(event.target.value) })}/>
        </Field>
        <Field label="Phí trễ giờ (VND / giờ)" error={errors.lateFee}>
          <input inputMode="numeric" className={inputCls(errors.lateFee)} value={grouped(form.lateFee)} placeholder="Không bắt buộc" onChange={event => onChange({ lateFee: digitsOf(event.target.value) })}/>
        </Field>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-gray">Tiền thuê tính theo ngày (24 giờ) và giờ lẻ: giá giờ = 1/10 giá ngày, thuê lẻ từ 10 giờ tính tròn 1 ngày. Phí quá km và phí trễ giờ do hai bên đối soát trong biên bản trả xe.</p>
    </section>
    <aside className="rounded-2xl border border-card-border bg-white p-5 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-gray">Bảng giá niêm yết</p>
      <h2 className="mt-2 font-bold text-charcoal">{form.brand} {form.model}</h2>
      <p className="font-mono text-xs text-muted-gray">{form.licensePlate || "Chưa có biển số"} • {form.seats} chỗ</p>
      <dl className="mt-4 flex flex-col gap-2 text-sm">
        <div className="flex justify-between gap-3"><dt className="text-muted-gray">Ngày thường</dt><dd><Money amount={dayPrice ?? 0}/></dd></div>
        <div className="flex justify-between gap-3"><dt className="text-muted-gray">Cuối tuần (T7, CN)</dt><dd>{weekend ? formatVnd(weekend) : "—"}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-muted-gray">Giờ lẻ</dt><dd>{dayPrice ? `${formatVnd(Math.ceil(dayPrice / 10 / 1000) * 1000)}/giờ` : "—"}</dd></div>
        <div className="flex justify-between gap-3 border-t border-card-border pt-2 font-bold"><dt>Tiền cọc</dt><dd>{deposit ? formatVnd(deposit) : "Miễn cọc"}</dd></div>
      </dl>
      <p className="mt-4 rounded-xl bg-bg-light px-3 py-2 text-xs leading-relaxed text-muted-gray">Chủ xe nhận toàn bộ tiền thuê trực tiếp từ khách. Chi phí trên CarDB chỉ là gói đăng tin để xe hiển thị trên sàn.</p>
    </aside>
  </div>;
}
export function StepFour({
    form,
    photos,
    photoCount,
    photoErrors = [],
    dayPrice,
    deposit,
    agreed,
    onAgree,
    onPhoto,
    onPhotoFile,
    onPhotoFiles,
    onRemovePhoto,
    onZoom,
    hasCavet,
    hasInspection,
}) {
    return <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.4fr)_320px]">
    <section className="rounded-2xl border border-card-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-charcoal">Bộ ảnh niêm yết tiêu chuẩn</h2>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-brand-accent px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-hover">
            <Icon name="upload" className="text-[16px]"/>
            Chọn nhiều ảnh từ máy
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={event => {
                const picked = Array.from(event.target.files ?? []);
                event.target.value = "";
                if (picked.length) onPhotoFiles?.(picked);
              }}
            />
          </label>
          <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-bold text-charcoal">{photoCount}/6 đã chọn</span>
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-gray">Chọn ảnh JPG, PNG hoặc WebP từ máy (tối đa 5MB/ảnh). Ảnh góc trước làm ảnh đại diện.</p>
      {photoErrors.length ? (
        <div role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-[#B91C1C]">
          {photoErrors.map((msg, idx) => <p key={idx}>{msg}</p>)}
        </div>
      ) : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {photoSlots.map(slot => {
            const photo = photos[slot.id];
            const valid = photo && isUrl(photo.url);
            return <div key={slot.id} className="overflow-hidden rounded-xl border border-card-border">
            <div className="relative flex h-28 items-center justify-center bg-bg-light">
              {valid ? <img src={resolveAssetUrl(photo.url)} alt={slot.title} className="h-full w-full object-cover"/> : <span className="px-3 text-center text-xs text-muted-gray">{slot.hint}</span>}
              {slot.id === "front" ? <span className="absolute left-2 top-2 rounded-full bg-brand-accent px-2 py-0.5 text-[10px] font-bold text-white">Ảnh đại diện</span> : null}
            </div>
            <div className="p-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-charcoal">{slot.title}</p>
                <label className="cursor-pointer rounded border border-card-border bg-bg-light px-2 py-0.5 text-[11px] font-bold text-charcoal hover:bg-accent-soft">
                  Chọn ảnh
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={event => {
                      const file = event.target.files?.[0] ?? null;
                      event.target.value = "";
                      if (file) onPhotoFile?.(slot.id, file);
                    }}
                  />
                </label>
              </div>
              {photo?.file ? (
                <p className="mt-1 truncate text-[11px] font-medium text-charcoal">Tệp: {photo.file.name}</p>
              ) : null}
              {photo && !valid ? <p className="mt-1 text-[11px] text-on-error-container">Ảnh chưa hợp lệ.</p> : null}
              {valid ? (
                <div className="mt-1 flex items-center justify-between gap-2">
                  <button type="button" className="text-[11px] font-bold text-charcoal hover:underline" onClick={() => onZoom(resolveAssetUrl(photo.url))}>Phóng to</button>
                  <button type="button" className="text-[11px] font-bold text-red-600 hover:underline" onClick={() => onRemovePhoto?.(slot.id)}>Xóa ảnh</button>
                </div>
              ) : null}
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
        <li>{hasCavet ? (hasInspection ? "Cà vẹt và đăng kiểm đã cung cấp" : "Đã có cà vẹt, chưa có đăng kiểm (bổ sung sau được)") : "Thiếu giấy đăng ký xe (cà vẹt)"}</li>
        <li>{dayPrice ? "Giá và hạn km đã thiết lập" : "Chưa có giá thuê"}</li>
        <li>{photoCount}/6 góc ảnh (bắt buộc ảnh góc trước)</li>
      </ul>
      <label className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-charcoal">
        <input type="checkbox" className="mt-0.5" checked={agreed} onChange={event => onAgree(event.target.checked)}/>
        Tôi cam kết thông tin và hình ảnh là chính xác, thuộc quyền sử dụng hợp pháp.
      </label>
      <p className="mt-3 rounded-xl bg-accent-soft px-3 py-2 text-xs text-charcoal">CarDB thẩm định hồ sơ trước khi mở niêm yết. Xe ở trạng thái chờ duyệt cho đến khi được xác nhận.</p>
    </aside>
  </div>;
}
export function isUrl(value) {
    return mediaUrlInput.safeParse(value).success;
}
export { validateImageFile };

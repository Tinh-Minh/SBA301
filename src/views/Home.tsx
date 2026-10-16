import Link from "next/link";
import { SearchPanel } from "@/components/search-panel";
import { Icon } from "@/components/icon";

const vehicles = [
  { name: "VinFast VF 8 Plus", image: "2cdbd30d989eecbb", category: "ev", year: "2024", seats: "5 chỗ", fuel: "Điện", price: 1250000, note: "Có phương án miễn thế chấp", use: "Đi phố và những chuyến đi gần" },
  { name: "Mazda CX-5 Premium", image: "7be8dd37f6bedb0e", category: "suv", year: "2023", seats: "5 chỗ", fuel: "Xăng", price: 950000, note: "Thế chấp từ 5.000.000₫", use: "Gầm cao, khoang hành lý rộng" },
  { name: "Toyota Fortuner Legender", image: "085754faf930a89a", category: "suv", year: "2023", seats: "7 chỗ", fuel: "Dầu", price: 1300000, note: "Thế chấp theo hồ sơ", use: "Gia đình và hành trình đường dài" },
  { name: "Honda City RS", image: "e71613f6efef3b43", category: "sedan", year: "2024", seats: "5 chỗ", fuel: "Xăng", price: 700000, note: "Thế chấp từ 5.000.000₫", use: "Nhỏ gọn, dễ di chuyển trong phố" },
  { name: "Mercedes-Benz E300 AMG", image: "a60e306c906c1d7f", category: "luxury", year: "2023", seats: "5 chỗ", fuel: "Xăng", price: 2400000, note: "Thế chấp theo hồ sơ", use: "Đón đối tác và các dịp đặc biệt" },
  { name: "Kia Carnival Signature", image: "ee1693d52c9ab429", category: "suv", year: "2024", seats: "7 chỗ", fuel: "Dầu", price: 1650000, note: "Thế chấp theo hồ sơ", use: "Nhiều chỗ cho cả gia đình và hành lý" },
] as const;

const filters = [
  ["all", "Tất cả"], ["sedan", "Sedan"], ["suv", "SUV & 7 chỗ"],
  ["ev", "Xe điện"], ["luxury", "Hạng sang"],
] as const;

const questions = [
  { question: "Tôi cần chuẩn bị giấy tờ gì?", answer: "Với xe tự lái, bạn cần CCCD và giấy phép lái xe còn hiệu lực. Kanow sẽ xác nhận hồ sơ và phương án thế chấp trước khi bàn giao xe." },
  { question: "Ngoài giá thuê xe còn những khoản nào?", answer: "Phí giao nhận, bảo hiểm bổ sung và phụ phí trả muộn hoặc vượt số km được thông báo trước khi xác nhận. Bạn có thể xem bảng giá hoặc gọi để được tính tổng chi phí cho lịch trình của mình." },
  { question: "Nếu thay đổi kế hoạch, tôi có thể hủy không?", answer: "Bạn có thể yêu cầu đổi lịch hoặc hủy chuyến. Điều kiện và chi phí phụ thuộc thời điểm hủy, gói thuê và được hiển thị trước khi đặt xe." },
];

export default function Home() {
  return (
    <main className="home-page bg-surface-canvas pt-20">
      <section aria-labelledby="home-title" className="mx-auto grid max-w-[1240px] items-stretch gap-8 px-4 pb-12 pt-8 sm:px-8 sm:pt-12 lg:grid-cols-[1.08fr_1fr] lg:gap-12 lg:pb-16">
        <div className="min-w-0 py-1 lg:py-4">
          <h1 id="home-title" className="max-w-lg text-[34px] leading-[1.23] font-semibold tracking-[-0.035em] text-primary sm:text-[42px] xl:text-[46px]">Bạn muốn nhận xe ở đâu?</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-on-surface-variant sm:text-base sm:leading-7">Chọn nơi nhận xe và ngày đi. Tìm chiếc xe phù hợp, xem rõ chi phí trước khi đặt.</p>
          <SearchPanel />
        </div>
        <figure className="relative min-h-52 overflow-hidden rounded-lg bg-surface-tint lg:min-h-full">
          <img src="/images/7285fea86779dec6.webp" alt="Xe Kanow trên cung đường ven biển" width={1600} height={1000} fetchPriority="high" className="h-60 w-full object-cover object-[40%_center] sm:h-72 lg:absolute lg:inset-0 lg:h-full" />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/85 to-transparent px-6 pt-20 pb-5 text-sm leading-6 text-white">Đi theo lịch trình của bạn.<br /><span className="text-white/75">Tự lái hoặc để bác tài đồng hành.</span></figcaption>
        </figure>
      </section>

      <section aria-labelledby="fleet-title" className="mx-auto max-w-[1240px] px-4 pb-14 sm:px-8 lg:pb-20">
        <div className="flex flex-col gap-4 border-t border-border-subtle pt-8 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 id="fleet-title" className="text-2xl font-semibold tracking-tight text-primary sm:text-[30px]">Chọn xe cho chuyến đi</h2><p className="mt-2 text-sm leading-6 text-text-muted">Giá thuê theo ngày. Bạn chọn thời gian và nơi nhận xe ở bước tiếp theo.</p></div>
          <Link href="/thue-xe-tu-lai" className="inline-flex shrink-0 items-center gap-2 self-start pb-1 text-sm font-semibold text-primary underline decoration-outline-variant underline-offset-8 hover:decoration-primary sm:self-auto">Xem toàn bộ đội xe<Icon name="chevron_right" className="text-[18px]" /></Link>
        </div>
        <div role="group" aria-label="Lọc dòng xe" className="mt-6 mb-6 flex gap-5 overflow-x-auto">
          {filters.map(([category, label], index) => <button key={category} type="button" data-handler="filterFleet" data-args={`'${category}', this`} aria-pressed={index === 0} data-active={index === 0 ? "true" : "false"} className="home-fleet-filter fleet-filter-btn shrink-0 border-b-2 border-transparent px-0 py-2 text-sm text-text-muted transition-colors hover:text-primary">{label}</button>)}
        </div>
        <div id="danh-sach-xe" className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map(vehicle => <article key={vehicle.name} data-vehicle-card={vehicle.category} data-vehicle-name={vehicle.name} data-price={vehicle.price} className="home-vehicle min-w-0 border-b border-border-subtle pb-5">
            <Link href="/xe/vinfast-vf8-plus-2024" aria-label={`Xem xe ${vehicle.name}`} className="group block overflow-hidden rounded-lg bg-surface-container-low">
              <img src={`/images/${vehicle.image}.webp`} alt={vehicle.name} width={720} height={450} loading="lazy" decoding="async" className="aspect-[8/5] w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]" />
            </Link>
            <div className="mt-4 flex items-baseline justify-between gap-2"><h3 className="text-[17px] leading-6 font-semibold tracking-tight text-primary">{vehicle.name}</h3><span className="shrink-0 text-xs text-text-muted">{vehicle.year}</span></div>
            <p className="mt-1 text-xs leading-5 text-text-muted">{vehicle.use}</p>
            <ul aria-label={`Thông số ${vehicle.name}`} className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface-variant"><li>{vehicle.seats}</li><li>Số tự động</li><li>{vehicle.fuel}</li></ul>
            <div className="mt-4 flex items-end justify-between gap-2"><div><p className="text-[19px] font-semibold tracking-tight text-primary">{vehicle.price.toLocaleString("vi-VN")}₫<span className="ml-1 text-xs font-normal tracking-normal text-text-muted">/ ngày</span></p><p className="mt-1 text-[11px] leading-5 text-text-muted">{vehicle.note}</p></div><Link href="/xe/vinfast-vf8-plus-2024" className="shrink-0 rounded-md border border-primary/20 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white">Xem xe</Link></div>
          </article>)}
        </div>
      </section>

      <section aria-labelledby="conditions-title" className="border-y border-border-subtle bg-white">
        <div className="mx-auto max-w-[1240px] px-4 py-9 sm:px-8 lg:py-12">
          <div className="flex flex-wrap items-baseline justify-between gap-3"><h2 id="conditions-title" className="text-xl font-semibold tracking-tight text-primary">Trước khi nhận xe</h2><Link href="/tin-tuc-huong-dan" className="text-sm text-secondary underline decoration-outline-variant underline-offset-4 hover:decoration-secondary">Xem hướng dẫn thuê xe</Link></div>
          <dl className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <div><dt className="text-sm font-semibold text-primary">Giấy tờ</dt><dd className="mt-2 text-sm leading-6 text-on-surface-variant">CCCD và GPLX còn hiệu lực khi thuê xe tự lái.</dd></div>
            <div><dt className="text-sm font-semibold text-primary">Thế chấp</dt><dd className="mt-2 text-sm leading-6 text-on-surface-variant">Tùy dòng xe và hồ sơ. Xác nhận hạn mức trước khi đặt.</dd></div>
            <div><dt className="text-sm font-semibold text-primary">Bảo hiểm</dt><dd className="mt-2 text-sm leading-6 text-on-surface-variant">Xem phạm vi bảo vệ và mức miễn thường của xe bạn chọn.</dd></div>
            <div><dt className="text-sm font-semibold text-primary">Giao nhận</dt><dd className="mt-2 text-sm leading-6 text-on-surface-variant">Tại điểm xe, nhà hoặc sân bay. Phí hiển thị theo địa chỉ.</dd></div>
          </dl>
        </div>
      </section>

      <section aria-labelledby="services-title" className="bg-surface-tint">
        <div className="mx-auto grid max-w-[1240px] gap-8 px-4 py-10 sm:px-8 lg:grid-cols-[.8fr_1fr_1fr] lg:gap-10 lg:py-14">
          <h2 id="services-title" className="max-w-xs text-[26px] leading-9 font-semibold tracking-tight text-primary">Bạn cầm lái,<br />hay để Kanow lo?</h2>
          <article className="border-t border-primary/15 pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8"><h3 className="text-lg font-semibold text-primary">Thuê xe tự lái</h3><p className="mt-3 max-w-sm text-sm leading-7 text-on-surface-variant">Tự chọn giờ xuất phát và những điểm dừng. Phù hợp khi bạn muốn chủ động cả chuyến đi.</p><Link href="/thue-xe-tu-lai" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary underline decoration-primary/25 underline-offset-8 hover:decoration-primary">Chọn xe tự lái<Icon name="chevron_right" className="text-[18px]" /></Link></article>
          <article className="border-t border-primary/15 pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8"><h3 className="text-lg font-semibold text-primary">Xe kèm tài xế</h3><p className="mt-3 max-w-sm text-sm leading-7 text-on-surface-variant">Đưa đón sân bay, đi công việc hoặc du lịch cùng gia đình. Bác tài phụ trách đường đi và chỗ đỗ.</p><Link href="/xe-kem-tai-xe" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary underline decoration-primary/25 underline-offset-8 hover:decoration-primary">Xem xe có tài xế<Icon name="chevron_right" className="text-[18px]" /></Link></article>
        </div>
      </section>

      <section aria-labelledby="help-title" className="mx-auto grid max-w-[1240px] gap-8 px-4 py-12 sm:px-8 lg:grid-cols-[.8fr_1.5fr] lg:gap-16 lg:py-16">
        <div><h2 id="help-title" className="text-[26px] font-semibold tracking-tight text-primary">Cần hỏi thêm trước khi đặt?</h2><p className="mt-3 max-w-xs text-sm leading-7 text-on-surface-variant">Nói cho Kanow biết lịch trình của bạn. Đội ngũ hỗ trợ sẽ giúp chọn xe và làm rõ chi phí.</p><a href="tel:19008888" className="mt-5 inline-block text-2xl font-semibold tracking-tight text-primary hover:text-secondary">1900 8888</a><p className="mt-1 text-xs text-text-muted">Hỗ trợ mỗi ngày, 24/7</p></div>
        <div>{questions.map(({ question, answer }, index) => <div key={question} className="border-b border-border-subtle first:border-t"><h3><button type="button" data-handler="toggleFaq" data-args="this" aria-expanded="false" aria-controls={`home-answer-${index}`} className="home-question flex w-full items-center justify-between gap-4 py-5 text-left text-sm leading-6 font-medium text-primary">{question}<Icon name="expand_more" className="text-[20px] text-text-muted" /></button></h3><p id={`home-answer-${index}`} className="faq-content hidden pb-5 text-sm leading-7 font-normal text-on-surface-variant">{answer}</p></div>)}</div>
      </section>
    </main>
  );
}

import React from 'react';
import SearchPanel from './SearchPanel';

export default function HeroTelemetry({ onSearch }) {
  return (
    <section
      className="relative w-full pt-6 pb-8 overflow-hidden bg-gradient-to-b from-surface-container-low via-surface to-surface-container-lowest bg-cyber-grid"
      id="hero-section"
    >
      {/* Ambient Visual Effects */}
      <div className="ambient-teal-glow absolute -top-24 left-1/2 -translate-x-1/2 w-[850px] h-[360px] bg-secondary/15 rounded-full blur-[115px] pointer-events-none -z-0"></div>
      <div className="absolute top-1/4 -right-20 w-[420px] h-[340px] bg-primary-container/25 rounded-full blur-[95px] pointer-events-none -z-0"></div>
      <div className="absolute top-1/2 -left-20 w-[350px] h-[300px] bg-secondary/10 rounded-full blur-[85px] pointer-events-none -z-0"></div>

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-10 flex flex-col items-center">
        {/* Header Text Block & Futuristic System Chips */}
        <div className="text-center max-w-3xl space-y-2">
          {/* Futuristic Telemetry Status Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-variant/80 border border-secondary/30 backdrop-blur-md shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              <span className="text-[10px] font-semibold tracking-wider text-primary uppercase">
                HỆ THỐNG ĐÃ KÍCH HOẠT
              </span>
              <span className="material-symbols-outlined text-secondary text-[13px]">sensors</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high/90 border border-secondary/20 backdrop-blur-sm text-[10px] text-primary-fixed-dim">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
              <span>
                TRẠNG THÁI SẴN SÀNG: <strong className="text-primary font-bold">100%</strong>
              </span>
            </div>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-tertiary-container/30 border border-tertiary/30 backdrop-blur-sm text-[10px] text-tertiary font-semibold">
              <span className="material-symbols-outlined text-[13px]">offline_bolt</span>
              <span>CHẾ ĐỘ LÁI: THỂ THAO ĐIỆN</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-on-surface">
            Mở lối mọi{' '}
            <span className="bg-gradient-to-r from-secondary-fixed via-primary to-on-surface bg-clip-text text-transparent">
              hành trình
            </span>
          </h1>
          <p className="text-xs md:text-sm text-on-surface-variant max-w-xl mx-auto leading-relaxed">
            Trải nghiệm các dòng xe tự lái cao cấp tiện lợi, minh bạch từng chi phí. Nhận xe linh hoạt theo giờ hoặc theo ngày tại các thành phố lớn.
          </p>
        </div>

        {/* CINEMATIC FUTURISTIC VEHICLE SHOWCASE WITH HUD TELEMETRY */}
        <div className="relative w-full max-w-5xl mt-3 mb-3 group">
          {/* Chassis Cyber Glow Frame */}
          <div className="cyber-card-glow relative rounded-2xl overflow-hidden border border-secondary/30 shadow-[0_12px_45px_rgba(0,17,16,0.9)] bg-surface-container-lowest">
            {/* Scanning HUD Grid & Laser Sweep Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
              {/* Moving Cyan Scan Line */}
              <div className="radar-scan-line w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-60"></div>
              {/* HUD Corner Markers */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-secondary/60"></div>
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-secondary/60"></div>
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-secondary/60"></div>
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-secondary/60"></div>
              {/* Watermark HUD Coordinates */}
              <div className="absolute top-3.5 left-10 text-[9px] font-mono tracking-widest text-primary/50 uppercase select-none">
                RADAR: ACTIVE // 21°01'40"N 105°51'08"E // CAR-DB TELEMETRY 4.0
              </div>
            </div>

            {/* Floating Vehicle with Glide Motion */}
            <div className="relative car-floating-glide">
              <img
                alt="CarDB Xe Thể Thao Đỉnh Cao"
                className="w-full h-[230px] sm:h-[310px] md:h-[380px] object-cover object-center brightness-95 contrast-105 transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                src="https://lh3.googleusercontent.com/aida/AEtjO1U7txDMRGK3-ZUtWPO_7EseResGnzsyy1oGruEUCA0N3HiJcrdc2bVd4Pfxur7o_bTPU-aUTRm_arc6JLZLnzE1_wBvMO-xhIzNufvi8EDrtgUCYqoziVOQFbCH34eMeSVjUMCWM300KVhb4MgfFsbkXcn7TUpJetVSrmnQGXvUDSogBGV1F_p2yzjdHUfdlNwIQqJ0s2h5_tOGjhy_3fg5Mx8KRcS954JRqywJQ961SkMzqQliYY1ML4fX"
              />
            </div>

            {/* Vignette & Light Bleed Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/25 to-transparent pointer-events-none"></div>

            {/* Amber Headlight Highlight Glow Flare */}
            <div className="amber-headlight-flare absolute top-[43%] left-[23%] w-12 h-7 bg-tertiary/50 rounded-full blur-[10px] pointer-events-none mix-blend-screen z-20"></div>

            {/* Laser Headlight Beam Projection */}
            <div className="laser-beam absolute top-[44%] left-[7%] h-6 bg-gradient-to-l from-tertiary/35 to-transparent blur-[8px] -rotate-6 pointer-events-none mix-blend-screen z-10"></div>

            {/* Hologram Cyber Underglow */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-12 bg-gradient-to-r from-transparent via-secondary/35 to-transparent blur-xl pointer-events-none rounded-full z-10"></div>

            {/* ============================================== */}
            {/* INTERACTIVE FUTURISTIC TELEMETRY CALLOUTS (HUD) */}
            {/* ============================================== */}
            {/* CALLOUT 1: ĐẦU XE / ĐÈN PHA (Góc trái trên) */}
            <div className="hud-telemetry-badge absolute top-8 left-4 md:left-8 z-30 max-w-[210px] md:max-w-[245px]">
              <div className="relative bg-surface-container-lowest/85 backdrop-blur-md p-2.5 rounded-xl border border-secondary/40 shadow-[0_4px_20px_rgba(0,17,16,0.85)] hover:border-secondary transition-all">
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-1 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping"></span>
                    <span className="text-[9px] font-bold text-tertiary uppercase tracking-wider">
                      ĐÈN MA TRẬN MATRIX LED
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-secondary font-bold">99.8% Chuẩn xác</span>
                </div>
                <p className="text-[10px] text-on-surface leading-tight font-medium">
                  Tự động quét vật cản đa điểm 350m & thích ứng góc lái ban đêm.
                </p>
                {/* Pointer Line to Headlight */}
                <div className="hidden md:block absolute -bottom-3 right-6 w-8 h-[1px] bg-secondary/70 rotate-45 pointer-events-none"></div>
                <div className="hidden md:block absolute -bottom-5 right-3 w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_#4adcc8]"></div>
              </div>
            </div>

            {/* CALLOUT 2: ĐỘNG CƠ & HIỆU SUẤT (Góc phải trên) */}
            <div className="hud-telemetry-badge absolute top-8 right-4 md:right-8 z-30 max-w-[210px] md:max-w-[245px]">
              <div className="relative bg-surface-container-lowest/85 backdrop-blur-md p-2.5 rounded-xl border border-secondary/40 shadow-[0_4px_20px_rgba(0,17,16,0.85)] hover:border-secondary transition-all">
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-1 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                    <span className="text-[9px] font-bold text-secondary uppercase tracking-wider">
                      ĐỘNG CƠ ĐIỆN KÉP AWD
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-tertiary font-bold">650 HP</span>
                </div>
                <p className="text-[10px] text-on-surface leading-tight font-medium">
                  Tăng tốc tức thì 0-100 km/h: <span className="text-secondary font-bold">3.6 giây</span> • Phân bổ mô-men xoắn AI thông minh.
                </p>
                {/* Pointer Line to Hood/Engine */}
                <div className="hidden md:block absolute -bottom-3 left-6 w-8 h-[1px] bg-secondary/70 -rotate-45 pointer-events-none"></div>
                <div className="hidden md:block absolute -bottom-5 left-3 w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_#4adcc8]"></div>
              </div>
            </div>

            {/* CALLOUT 3: PIN & NĂNG LƯỢNG (Góc phải dưới) */}
            <div className="hud-telemetry-badge absolute bottom-16 right-4 md:right-8 z-30 max-w-[210px] md:max-w-[245px] hidden sm:block">
              <div className="relative bg-surface-container-lowest/85 backdrop-blur-md p-2.5 rounded-xl border border-secondary/40 shadow-[0_4px_20px_rgba(0,17,16,0.85)] hover:border-secondary transition-all">
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-1 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[12px] text-primary">battery_charging_full</span>
                    <span className="text-[9px] font-bold text-primary uppercase tracking-wider">PIN 100 kWh THẾ HỆ MỚI</span>
                  </div>
                  <span className="text-[9px] font-mono text-primary font-bold">510 km</span>
                </div>
                <p className="text-[10px] text-on-surface leading-tight font-medium">
                  Sạc siêu tốc 10% - 80% chỉ trong <span className="text-tertiary font-semibold">18 phút</span> tại trạm sạc đối tác.
                </p>
              </div>
            </div>

            {/* CALLOUT 4: KHUNG GẦM & AN TOÀN CHỦ ĐỘNG (Góc trái dưới) */}
            <div className="hud-telemetry-badge absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto z-30 max-w-sm flex items-center gap-3 p-3 rounded-xl bg-surface-container-low/90 backdrop-blur-md border border-secondary/35 shadow-lg">
              <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary shrink-0 relative">
                <span className="material-symbols-outlined text-[20px]">speed</span>
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-secondary animate-ping"></span>
              </div>
              <div className="pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-tertiary font-bold uppercase tracking-wider">Khung gầm thích ứng</span>
                  <span className="w-1 h-1 rounded-full bg-secondary"></span>
                  <span className="text-[10px] text-on-surface-variant">Giảm chấn khí nén</span>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-on-surface">
                  650 Mã lực • Quét địa hình tự động • Giao nhận 24/7
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Car Floor Reflection Glow */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-4/5 h-10 bg-secondary/20 blur-2xl pointer-events-none rounded-full"></div>
        </div>

        {/* FLOATING SEARCH PANEL */}
        <SearchPanel onSearch={onSearch} />
      </div>
    </section>
  );
}

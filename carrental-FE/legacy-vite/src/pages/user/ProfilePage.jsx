import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function ProfilePage({ initialTab = 'tab-personal' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(urlTab || initialTab);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Selected image preview modal
  const [previewImage, setPreviewImage] = useState(null);

  // Form profile state
  const [profileData, setProfileData] = useState({
    fullName: 'Nguyễn Hoàng Minh',
    email: 'minh.nguyen@example.com',
    phone: '0908 123 456',
    dob: '18/09/1992',
    createdAt: '15/01/2024 (1 năm đồng hành)',
    status: 'Đang hoạt động (Chuẩn CarDB)',
    address: 'Căn hộ B12.04, Landmark 81, Vinhomes Central Park, P. 22, Q. Bình Thạnh, TP. Hồ Chí Minh',
    customerId: 'CDB-VN-88492',
  });

  // eKYC file state
  const [uploadToast, setUploadToast] = useState(null);
  const passportInputRef = useRef(null);

  useEffect(() => {
    if (urlTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  useEffect(() => {
    if (activeTab === 'tab-kyc') {
      document.title = 'CarDB - Xác minh giấy tờ pháp lý eKYC';
    } else if (activeTab === 'tab-driver') {
      document.title = 'CarDB - Hồ sơ tài xế tự lái';
    } else if (activeTab === 'tab-bank') {
      document.title = 'CarDB - Tài khoản ngân hàng';
    } else {
      document.title = 'CarDB - Hồ sơ cá nhân';
    }
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2500);
    }, 600);
  };

  const handlePassportUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileName = files[0].name;
      setUploadToast(
        `Đã tải lên tệp "${fileName}". Hồ sơ Hộ chiếu đã chuyển sang trạng thái "Chờ duyệt" (2-4 giờ làm việc).`
      );
      setTimeout(() => {
        setUploadToast(null);
      }, 4500);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background text-on-surface antialiased pt-4 pb-16 font-body-md text-body-md">
      <div className="relative w-full max-w-[1440px] mx-auto px-6 md:px-12 py-8">
        {/* Subtle Ambient Glow Orbs */}
        <div className="absolute -top-24 left-1/4 w-[480px] h-[360px] bg-primary-container/20 rounded-full blur-[140px] pointer-events-none -z-10"></div>
        <div className="absolute top-1/2 right-0 w-[420px] h-[420px] bg-secondary-container/10 rounded-full blur-[160px] pointer-events-none -z-10"></div>

        {/* Dynamic Page Header based on Active Tab */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-8 pb-4 border-b border-outline-variant/15">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm uppercase tracking-widest font-semibold">
                HỒ SƠ &amp; EKYC CARDB
              </span>
              <span className="text-outline-variant font-label-sm">/</span>
              <span className="font-label-sm text-on-surface-variant">
                {activeTab === 'tab-kyc'
                  ? 'Xác minh giấy tờ pháp lý'
                  : activeTab === 'tab-driver'
                  ? 'Hồ sơ tài xế tự lái'
                  : activeTab === 'tab-bank'
                  ? 'Tài khoản ngân hàng'
                  : 'Khách hàng định danh'}
              </span>
            </div>

            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              {activeTab === 'tab-kyc'
                ? 'Xác minh giấy tờ'
                : activeTab === 'tab-driver'
                ? 'Hồ sơ tài xế'
                : activeTab === 'tab-bank'
                ? 'Tài khoản ngân hàng'
                : 'Hồ sơ cá nhân'}
            </h1>

            <p className="font-body-md text-on-surface-variant max-w-2xl leading-relaxed">
              {activeTab === 'tab-kyc'
                ? 'Cập nhật giấy tờ để hoàn thiện xác minh tài khoản và đáp ứng điều kiện thuê xe.'
                : activeTab === 'tab-driver'
                ? 'Theo dõi năng lực cầm lái, lịch sử an toàn và các đặc quyền xe sang.'
                : activeTab === 'tab-bank'
                ? 'Quản lý tài khoản nhận hoàn tiền cọc giữ xe và quyết toán chi phí tự động.'
                : 'Quản lý thông tin tài khoản, mức độ tín nhiệm lái xe và chứng thực hồ sơ pháp lý chuẩn mực.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-end">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/30 text-primary border border-primary/30 font-label-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              Định danh cấp VIP • CSDL Đồng bộ
            </span>
          </div>
        </div>

        {/* Main 2-Column Dashboard Layout */}
        <div className="grid grid-cols-12 gap-8 items-start">
          {/* LEFT SIDEBAR (Compact Navigation & User Status) */}
          <aside className="col-span-12 lg:col-span-4 xl:col-span-4 flex flex-col gap-6 sticky top-24">
            {/* User Summary Glass Card */}
            <div className="relative bg-surface-container-low/90 backdrop-blur-2xl rounded-2xl p-6 shadow-xl overflow-hidden group border border-outline-variant/20">
              <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-primary via-secondary to-primary-container shadow-[0_0_24px_rgba(20,184,166,0.35)]">
                    <div className="w-full h-full rounded-full bg-surface-container-lowest overflow-hidden flex items-center justify-center relative">
                      <span className="material-symbols-outlined text-[48px] text-primary">
                        account_circle
                      </span>
                    </div>
                  </div>
                  <button
                    className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    title="Đổi ảnh đại diện"
                    onClick={() => alert('Chọn ảnh đại diện mới từ thiết bị của bạn')}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                  </button>
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary font-label-sm font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                      Đang hoạt động
                    </span>
                  </div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface truncate mt-1.5 font-bold">
                    {profileData.fullName}
                  </h2>
                  <span className="font-label-md text-on-surface-variant font-mono text-xs">
                    ID: {profileData.customerId}
                  </span>
                  <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-xs mt-1">
                    <span className="material-symbols-outlined text-[15px] text-primary">verified</span>
                    <span>Tài khoản khách hàng</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical Tab Navigation */}
            <nav className="bg-surface-container-low/90 backdrop-blur-2xl rounded-2xl p-2 shadow-lg flex flex-col gap-1 border border-outline-variant/15" id="profileTabNav">
              {/* Tab 1 */}
              <button
                className={`tab-btn w-full flex items-center justify-between px-4 py-3 rounded-xl font-label-lg text-sm transition-all text-left cursor-pointer ${
                  activeTab === 'tab-personal'
                    ? 'font-semibold bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(20,184,166,0.35)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                }`}
                onClick={() => handleTabChange('tab-personal')}
                type="button"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">badge</span>
                  <span>Thông tin cá nhân</span>
                </div>
              </button>

              {/* Tab 2: Xác minh giấy tờ */}
              <button
                className={`tab-btn w-full flex items-center justify-between px-4 py-3 rounded-xl font-label-lg text-sm transition-all text-left cursor-pointer ${
                  activeTab === 'tab-kyc'
                    ? 'font-semibold bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(20,184,166,0.35)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                }`}
                onClick={() => handleTabChange('tab-kyc')}
                type="button"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">fact_check</span>
                  <span>Xác minh giấy tờ</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-tertiary-container/60 text-on-tertiary-container font-label-sm text-xs font-semibold">
                  1 Chờ duyệt
                </span>
              </button>

              {/* Tab 3: Hồ sơ tài xế */}
              <button
                className={`tab-btn w-full flex items-center justify-between px-4 py-3 rounded-xl font-label-lg text-sm transition-all text-left cursor-pointer ${
                  activeTab === 'tab-driver'
                    ? 'font-semibold bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(20,184,166,0.35)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                }`}
                onClick={() => handleTabChange('tab-driver')}
                type="button"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">airline_seat_recline_normal</span>
                  <span>Hồ sơ tài xế</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-tertiary-container/40 text-tertiary font-label-sm text-xs font-semibold">
                  Chờ kích hoạt
                </span>
              </button>

              {/* Tab 4: Tài khoản ngân hàng */}
              <button
                className={`tab-btn w-full flex items-center justify-between px-4 py-3 rounded-xl font-label-lg text-sm transition-all text-left cursor-pointer ${
                  activeTab === 'tab-bank'
                    ? 'font-semibold bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(20,184,166,0.35)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                }`}
                onClick={() => handleTabChange('tab-bank')}
                type="button"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">account_balance</span>
                  <span>Tài khoản ngân hàng</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-xs font-semibold">
                  Đã liên kết
                </span>
              </button>
            </nav>

            {/* Dedicated Support Notification Box */}
            <div className="bg-surface-container-low/90 backdrop-blur-xl rounded-2xl p-5 shadow-md flex items-start gap-4 border border-outline-variant/15">
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex-shrink-0 flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined text-[22px]">support_agent</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-on-surface font-semibold text-sm">
                  Cần trợ giúp xác minh?
                </span>
                <span className="font-body-sm text-on-surface-variant text-xs mt-0.5 leading-relaxed">
                  Tổng đài thẩm định giấy tờ VIP hỗ trợ trực tiếp 24/7.
                </span>
                <div className="flex items-center gap-2 mt-2">
                  <a
                    className="font-label-md text-primary font-bold hover:underline flex items-center gap-1 text-xs"
                    href="tel:19008899"
                  >
                    <span className="material-symbols-outlined text-[14px]">call</span>
                    1900 8899
                  </a>
                  <span className="text-outline-variant font-label-sm text-xs">•</span>
                  <span className="font-label-sm text-on-surface-variant text-xs">TP. Hồ Chí Minh</span>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT CONTENT AREA */}
          <main className="col-span-12 lg:col-span-8 xl:col-span-8 flex flex-col gap-6 min-w-0">
            {/* ========================================== */}
            {/* TAB 2: XÁC MINH GIẤY TỜ (eKYC System)      */}
            {/* ========================================== */}
            {activeTab === 'tab-kyc' && (
              <div className="flex flex-col gap-6 transition-all duration-300">
                {/* Overall Account KYC Status Overview Banner */}
                <div className="bg-surface-container-low/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-primary/20 flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-tertiary-container/40 text-tertiary flex items-center justify-center flex-shrink-0 shadow-[0_0_16px_rgba(255,185,95,0.25)]">
                        <span className="material-symbols-outlined text-[24px]">pending_actions</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant">
                            Trạng thái xác minh tài khoản
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <h2 className="font-headline-sm text-lg text-on-surface font-semibold">
                            Chờ xác minh
                          </h2>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-container/60 text-on-tertiary-container font-label-sm text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>{' '}
                            PENDING
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="px-4 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
                      <span className="material-symbols-outlined text-[16px]">shield</span> Bảo mật eKYC
                    </span>
                  </div>

                  <div className="bg-surface-container-lowest/60 rounded-xl p-4 flex items-start gap-3 text-on-surface-variant font-body-sm text-xs">
                    <span className="material-symbols-outlined text-[20px] text-tertiary flex-shrink-0 mt-0.5">
                      info
                    </span>
                    <div className="flex flex-col gap-1">
                      <p className="text-on-surface font-medium leading-relaxed">
                        <span className="text-primary font-semibold">Tiến độ xét duyệt: 1/2</span> giấy tờ bắt buộc đã hoàn tất (CCCD: <span className="text-primary font-semibold">Đã duyệt</span>, GPLX: <span className="text-tertiary font-semibold">Đang chờ duyệt</span>).
                      </p>
                      <p className="text-label-sm text-on-surface-variant">
                        Hộ chiếu là giấy tờ tùy chọn không bắt buộc cho kích hoạt tài khoản. Quyền đặt xe tự lái sẽ có hiệu lực ngay khi GPLX được thẩm định thành công.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3 Document Cards Section */}
                <div className="flex flex-col gap-6">
                  {/* CARD 1: CCCD / CMND (APPROVED) */}
                  <div className="bg-surface-container-low/90 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl flex flex-col gap-6 border border-surface-container-high">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-surface-container-high">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary-container/40 flex items-center justify-center text-primary flex-shrink-0">
                          <span className="material-symbols-outlined text-[22px]">badge</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-label-sm text-xs text-primary uppercase tracking-wider font-semibold">
                              Giấy tờ 1 • Bắt buộc
                            </span>
                          </div>
                          <h3 className="font-headline-sm text-base md:text-[18px] text-on-surface font-semibold">
                            Căn cước công dân (CCCD / CMND)
                          </h3>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-sm text-xs font-semibold shadow-[0_0_16px_rgba(20,184,166,0.25)] self-start sm:self-auto">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Đã duyệt (APPROVED)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-surface-container-lowest/60 p-4 rounded-xl text-on-surface font-body-sm text-xs">
                      <div className="flex flex-col">
                        <span className="text-on-surface-variant font-label-sm uppercase tracking-wider text-[11px]">Loại giấy tờ</span>
                        <span className="font-semibold text-sm text-on-surface mt-0.5">CCCD gắn chip (12 số)</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-on-surface-variant font-label-sm uppercase tracking-wider text-[11px]">Số giấy tờ (Mã hóa)</span>
                        <span className="font-mono font-bold text-sm text-primary mt-0.5 tracking-wider">079092••••89</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-on-surface-variant font-label-sm uppercase tracking-wider text-[11px]">Họ và tên trên giấy tờ</span>
                        <span className="font-semibold text-sm text-on-surface mt-0.5">NGUYỄN HOÀNG MINH</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-on-surface-variant font-label-sm uppercase tracking-wider text-[11px]">Ngày cấp</span>
                        <span className="font-medium text-sm text-on-surface mt-0.5">15/05/2021</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-on-surface-variant font-label-sm uppercase tracking-wider text-[11px]">Hạn sử dụng</span>
                        <span className="font-medium text-sm text-on-surface mt-0.5">18/09/2032 (Hợp lệ)</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-on-surface-variant font-label-sm uppercase tracking-wider text-[11px]">Ngày gửi thẩm định</span>
                        <span className="font-medium text-sm text-on-surface mt-0.5">16/01/2024</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Front CCCD */}
                      <div className="relative h-36 rounded-xl bg-surface-container-high overflow-hidden shadow-inner flex flex-col justify-between p-4 border border-outline-variant/15">
                        <div className="flex items-center justify-between z-10">
                          <span className="px-2 py-0.5 rounded bg-surface-container-lowest/80 text-on-surface font-label-sm text-xs font-semibold">
                            Mặt trước • CCCD
                          </span>
                          <span className="inline-flex items-center gap-1 text-primary font-label-sm text-xs font-semibold">
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                            Khớp định danh
                          </span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                          <span className="text-outline-variant/30 font-headline-sm text-base uppercase tracking-widest -rotate-12 font-bold">
                            CarDB eKYC Bảo mật
                          </span>
                        </div>
                        <div className="z-10 flex items-center justify-between text-on-surface-variant font-label-sm text-xs">
                          <span>Bản ghi đã lưu trữ</span>
                          <button
                            className="text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                            onClick={() => setPreviewImage('Mặt trước CCCD gắn chip • NGUYỄN HOÀNG MINH')}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                            Xem ảnh bảo mật
                          </button>
                        </div>
                      </div>

                      {/* Back CCCD */}
                      <div className="relative h-36 rounded-xl bg-surface-container-high overflow-hidden shadow-inner flex flex-col justify-between p-4 border border-outline-variant/15">
                        <div className="flex items-center justify-between z-10">
                          <span className="px-2 py-0.5 rounded bg-surface-container-lowest/80 text-on-surface font-label-sm text-xs font-semibold">
                            Mặt sau • CCCD
                          </span>
                          <span className="inline-flex items-center gap-1 text-primary font-label-sm text-xs font-semibold">
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                            Hợp lệ
                          </span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                          <span className="text-outline-variant/30 font-headline-sm text-base uppercase tracking-widest -rotate-12 font-bold">
                            CarDB eKYC Bảo mật
                          </span>
                        </div>
                        <div className="z-10 flex items-center justify-between text-on-surface-variant font-label-sm text-xs">
                          <span>Bản ghi đã lưu trữ</span>
                          <button
                            className="text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                            onClick={() => setPreviewImage('Mặt sau CCCD gắn chip • NGUYỄN HOÀNG MINH')}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                            Xem ảnh bảo mật
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-surface-container-high/60">
                      <span className="text-on-surface-variant font-label-sm text-xs flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-primary">lock</span>
                        Giấy tờ đã được thẩm định hợp lệ. Liên hệ hỗ trợ nếu cần cập nhật thay đổi thông tin định danh.
                      </span>
                      <span className="font-label-sm text-xs text-outline font-mono">
                        Mã duyệt: KYC-7749-OK
                      </span>
                    </div>
                  </div>

                  {/* CARD 2: GIẤY PHÉP LÁI XE (PENDING) */}
                  <div className="bg-surface-container-low/90 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl flex flex-col gap-6 border border-tertiary/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-surface-container-high">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-tertiary-container/40 flex items-center justify-center text-tertiary flex-shrink-0">
                          <span className="material-symbols-outlined text-[22px]">directions_car</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-label-sm text-xs text-tertiary uppercase tracking-wider font-semibold">
                              Giấy tờ 2 • Bắt buộc
                            </span>
                          </div>
                          <h3 className="font-headline-sm text-base md:text-[18px] text-on-surface font-semibold">
                            Giấy phép lái xe (GPLX)
                          </h3>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container/60 text-on-tertiary-container font-label-sm text-xs font-semibold shadow-sm self-start sm:self-auto">
                        <span className="material-symbols-outlined text-[16px] animate-spin">
                          hourglass_empty
                        </span>
                        Chờ quản trị viên duyệt
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-surface-container-lowest/60 p-4 rounded-xl text-on-surface font-body-sm text-xs">
                      <div className="flex flex-col">
                        <span className="text-on-surface-variant font-label-sm uppercase tracking-wider text-[11px]">Loại GPLX</span>
                        <span className="font-semibold text-sm text-on-surface mt-0.5">GPLX ô tô quốc gia</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-on-surface-variant font-label-sm uppercase tracking-wider text-[11px]">Hạng GPLX</span>
                        <span className="font-semibold text-sm text-primary mt-0.5">Hạng B2 (≤ 9 chỗ, tải &lt; 3.5t)</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-on-surface-variant font-label-sm uppercase tracking-wider text-[11px]">Số GPLX (Mã hóa)</span>
                        <span className="font-mono font-bold text-sm text-primary mt-0.5 tracking-wider">790145••••23</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-on-surface-variant font-label-sm uppercase tracking-wider text-[11px]">Họ và tên trên giấy tờ</span>
                        <span className="font-semibold text-sm text-on-surface mt-0.5">NGUYỄN HOÀNG MINH</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-on-surface-variant font-label-sm uppercase tracking-wider text-[11px]">Thời điểm gửi nộp</span>
                        <span className="font-medium text-sm text-on-surface mt-0.5">Hôm nay, 10:45 AM</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-on-surface-variant font-label-sm uppercase tracking-wider text-[11px]">Hạn sử dụng</span>
                        <span className="font-medium text-sm text-on-surface mt-0.5">10/11/2030 (Còn 6 năm)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Front GPLX */}
                      <div className="relative h-36 rounded-xl bg-surface-container-high overflow-hidden shadow-inner flex flex-col justify-between p-4 border border-outline-variant/15">
                        <div className="flex items-center justify-between z-10">
                          <span className="px-2 py-0.5 rounded bg-surface-container-lowest/80 text-on-surface font-label-sm text-xs font-semibold">
                            GPLX - Mặt trước (PET)
                          </span>
                          <span className="px-2 py-0.5 rounded bg-tertiary-container/50 text-tertiary font-label-sm text-xs font-semibold">
                            Đang đối soát
                          </span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                          <span className="text-outline-variant/30 font-headline-sm text-base uppercase tracking-widest -rotate-12 font-bold">
                            CarDB eKYC Bảo mật
                          </span>
                        </div>
                        <div className="z-10 flex items-center justify-between text-on-surface-variant font-label-sm text-xs">
                          <span>Cơ quan: Sở GTVT TP.HCM</span>
                          <span className="text-tertiary font-semibold">Chờ thẩm định</span>
                        </div>
                      </div>

                      {/* Back GPLX */}
                      <div className="relative h-36 rounded-xl bg-surface-container-high overflow-hidden shadow-inner flex flex-col justify-between p-4 border border-outline-variant/15">
                        <div className="flex items-center justify-between z-10">
                          <span className="px-2 py-0.5 rounded bg-surface-container-lowest/80 text-on-surface font-label-sm text-xs font-semibold">
                            GPLX - Mặt sau
                          </span>
                          <span className="px-2 py-0.5 rounded bg-tertiary-container/50 text-tertiary font-label-sm text-xs font-semibold">
                            Đang đối soát
                          </span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                          <span className="text-outline-variant/30 font-headline-sm text-base uppercase tracking-widest -rotate-12 font-bold">
                            CarDB eKYC Bảo mật
                          </span>
                        </div>
                        <div className="z-10 flex items-center justify-between text-on-surface-variant font-label-sm text-xs">
                          <span>Hạng B2</span>
                          <span className="text-tertiary font-semibold">Chờ thẩm định</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-tertiary-container/20 rounded-xl p-4 flex items-start gap-3 text-on-surface-variant font-body-sm text-xs border border-tertiary/20">
                      <span className="material-symbols-outlined text-[18px] text-tertiary flex-shrink-0 mt-0.5">
                        warning
                      </span>
                      <p className="text-on-surface/90 text-xs leading-relaxed">
                        <span className="font-semibold text-tertiary">Lưu ý:</span> Hồ sơ tài xế chỉ được kích hoạt sau khi Giấy phép lái xe được quản trị viên thẩm định và phê duyệt thành công. Chưa có hiệu lực lái xe ngay.
                      </p>
                    </div>

                    <div className="flex items-center justify-end pt-1">
                      <button
                        className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface font-label-md text-xs font-semibold hover:bg-surface-bright transition-colors flex items-center gap-1.5 cursor-pointer"
                        onClick={() => alert('Mở giao diện cập nhật lại ảnh chụp GPLX')}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit_document</span>
                        Chỉnh sửa tài liệu đã nộp
                      </button>
                    </div>
                  </div>

                  {/* CARD 3: HỘ CHIẾU (REJECTED & RESUBMISSION) */}
                  <div className="bg-surface-container-low/90 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl flex flex-col gap-6 border border-error/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-surface-container-high">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-error-container/40 flex items-center justify-center text-error flex-shrink-0">
                          <span className="material-symbols-outlined text-[22px]">travel_explore</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-label-sm text-xs text-outline uppercase tracking-wider font-semibold">
                              Giấy tờ tùy chọn (Không bắt buộc)
                            </span>
                          </div>
                          <h3 className="font-headline-sm text-base md:text-[18px] text-on-surface font-semibold">
                            Hộ chiếu (Passport)
                          </h3>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-xs font-semibold shadow-sm self-start sm:self-auto">
                        <span className="material-symbols-outlined text-[16px]">cancel</span>
                        Bị từ chối (REJECTED)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-surface-container-lowest/60 p-4 rounded-xl text-on-surface font-body-sm text-xs">
                      <div className="flex flex-col">
                        <span className="text-on-surface-variant font-label-sm uppercase tracking-wider text-[11px]">Loại giấy tờ</span>
                        <span className="font-semibold text-sm text-on-surface mt-0.5">Hộ chiếu phổ thông VN</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-on-surface-variant font-label-sm uppercase tracking-wider text-[11px]">Số hộ chiếu</span>
                        <span className="font-mono font-bold text-sm text-on-surface mt-0.5 tracking-wider">P0128••••</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-on-surface-variant font-label-sm uppercase tracking-wider text-[11px]">Họ và tên</span>
                        <span className="font-semibold text-sm text-on-surface mt-0.5">NGUYỄN HOÀNG MINH</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-on-surface-variant font-label-sm uppercase tracking-wider text-[11px]">Hạn sử dụng</span>
                        <span className="font-medium text-sm text-on-surface mt-0.5">24/08/2029</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-on-surface-variant font-label-sm uppercase tracking-wider text-[11px]">Lần nộp trước</span>
                        <span className="font-medium text-sm text-on-surface mt-0.5">18/01/2024</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-on-surface-variant font-label-sm uppercase tracking-wider text-[11px]">Mục đích</span>
                        <span className="font-medium text-sm text-on-surface mt-0.5">Thuê xe dài hạn / Xuyên biên giới</span>
                      </div>
                    </div>

                    {/* Rejection notice */}
                    <div className="bg-error-container/20 border border-error/30 rounded-xl p-4 flex items-start gap-3">
                      <span className="material-symbols-outlined text-[20px] text-error flex-shrink-0 mt-0.5">
                        report
                      </span>
                      <div className="flex flex-col">
                        <span className="font-label-md text-xs text-error font-bold uppercase tracking-wider">
                          Lý do từ chối:
                        </span>
                        <p className="font-body-sm text-xs text-on-surface leading-relaxed mt-1">
                          Ảnh chụp bị lóa sáng phần thông tin và mất góc tài liệu. Vui lòng chụp lại rõ nét cả 4 góc.
                        </p>
                      </div>
                    </div>

                    {/* Resubmission Dropzone */}
                    <div
                      className="group relative rounded-xl p-6 bg-surface-container-lowest/60 hover:bg-surface-container-high/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer shadow-inner border border-dashed border-outline-variant/30 hover:border-secondary"
                      onClick={() => passportInputRef.current && passportInputRef.current.click()}
                    >
                      <div className="w-12 h-12 rounded-full bg-primary-container/40 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[26px]">cloud_upload</span>
                      </div>
                      <h5 className="font-label-lg text-sm font-semibold text-on-surface">
                        Tải lên lại ảnh chụp Hộ chiếu mới
                      </h5>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Hỗ trợ ảnh rõ 4 góc: JPG, PNG, PDF tối đa 10MB
                      </p>
                      <input
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                        ref={passportInputRef}
                        type="file"
                        onChange={handlePassportUpload}
                      />
                    </div>
                  </div>
                </div>

                {/* Legal & Privacy Security Disclaimer Footer Strip */}
                <div className="bg-surface-container-lowest/50 rounded-xl p-4 border border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-on-surface-variant font-body-sm text-xs">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[18px] text-primary flex-shrink-0">
                      security
                    </span>
                    <span>
                      Thông tin giấy tờ định danh của bạn được bảo mật theo Chính sách quyền riêng tư của CarDB.
                    </span>
                  </div>
                  <a
                    className="font-label-sm text-xs text-primary hover:underline font-semibold flex-shrink-0"
                    href="#ekyc-privacy"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Quy chế bảo vệ quyền riêng tư & eKYC chuẩn Bộ Công an');
                    }}
                  >
                    Chính sách bảo mật eKYC
                  </a>
                </div>
              </div>
            )}

            {/* ========================================== */}
            {/* TAB 1: THÔNG TIN CÁ NHÂN                   */}
            {/* ========================================== */}
            {activeTab === 'tab-personal' && (
              <section className="flex flex-col gap-6 transition-all duration-300">
                <div className="bg-surface-container-low/90 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl flex flex-col gap-6 border border-outline-variant/15">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/15">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-primary font-label-sm uppercase tracking-wider text-xs font-semibold">
                        <span className="material-symbols-outlined text-[16px]">badge</span>
                        Phần 1 • Định danh khách hàng
                      </div>
                      <h3 className="font-headline-md text-headline-md text-on-surface mt-1 font-bold">
                        Thông tin cá nhân
                      </h3>
                      <p className="font-body-sm text-on-surface-variant text-xs">
                        Thông tin dùng cho hợp đồng thuê xe điện tử và xác nhận bàn giao thực tế.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        className={`px-4 py-2 rounded-xl text-on-surface font-label-md text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                          isEditing
                            ? 'bg-secondary text-on-secondary-fixed'
                            : 'bg-surface-container-high hover:bg-surface-bright'
                        }`}
                        onClick={() => setIsEditing(!isEditing)}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isEditing ? 'close' : 'edit'}
                        </span>
                        <span>{isEditing ? 'Hủy' : 'Chỉnh sửa'}</span>
                      </button>

                      <button
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-white font-label-md text-xs font-semibold shadow-[0_4px_20px_rgba(20,184,166,0.35)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                        disabled={isSaving}
                        onClick={handleSaveProfile}
                        type="button"
                      >
                        <span
                          className={`material-symbols-outlined text-[16px] ${
                            isSaving ? 'animate-spin' : ''
                          }`}
                        >
                          {isSaving ? 'refresh' : saveSuccess ? 'done' : 'save'}
                        </span>
                        <span>
                          {isSaving
                            ? 'Đang lưu...'
                            : saveSuccess
                            ? 'Đã cập nhật'
                            : 'Lưu thay đổi'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Editable Fields Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="bg-surface-container-lowest/70 rounded-xl p-4 flex flex-col gap-1 shadow-sm border border-outline-variant/10">
                      <div className="flex items-center justify-between">
                        <label className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                          Họ và tên (full_name)
                        </label>
                        <span className="material-symbols-outlined text-[16px] text-outline">
                          person
                        </span>
                      </div>
                      <input
                        className={`bg-transparent text-on-surface font-body-md text-sm font-semibold focus:outline-none border-b py-0.5 transition-colors ${
                          isEditing
                            ? 'border-primary bg-surface-container-high/30 px-2 rounded'
                            : 'border-transparent'
                        }`}
                        readOnly={!isEditing}
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                      />
                    </div>

                    {/* Email */}
                    <div className="bg-surface-container-lowest/70 rounded-xl p-4 flex flex-col gap-1 shadow-sm border border-outline-variant/10">
                      <div className="flex items-center justify-between">
                        <label className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                          Hộp thư điện tử (email)
                        </label>
                        <span className="inline-flex items-center gap-1 text-primary font-label-sm text-xs font-semibold">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          Đã xác thực
                        </span>
                      </div>
                      <input
                        className="bg-transparent text-on-surface/80 font-body-md text-sm font-semibold focus:outline-none py-0.5 cursor-not-allowed"
                        readOnly
                        type="email"
                        value={profileData.email}
                      />
                    </div>

                    {/* Phone */}
                    <div className="bg-surface-container-lowest/70 rounded-xl p-4 flex flex-col gap-1 shadow-sm border border-outline-variant/10">
                      <div className="flex items-center justify-between">
                        <label className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                          Số điện thoại (phone)
                        </label>
                        <span className="inline-flex items-center gap-1 text-primary font-label-sm text-xs font-semibold">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          Đã xác thực
                        </span>
                      </div>
                      <input
                        className={`bg-transparent text-on-surface font-body-md text-sm font-semibold focus:outline-none border-b py-0.5 font-mono transition-colors ${
                          isEditing
                            ? 'border-primary bg-surface-container-high/30 px-2 rounded'
                            : 'border-transparent'
                        }`}
                        readOnly={!isEditing}
                        type="text"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>

                    {/* Date of Birth */}
                    <div className="bg-surface-container-lowest/70 rounded-xl p-4 flex flex-col gap-1 shadow-sm border border-outline-variant/10">
                      <div className="flex items-center justify-between">
                        <label className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                          Ngày sinh (date_of_birth)
                        </label>
                        <span className="material-symbols-outlined text-[16px] text-outline">
                          calendar_today
                        </span>
                      </div>
                      <input
                        className={`bg-transparent text-on-surface font-body-md text-sm font-semibold focus:outline-none border-b py-0.5 transition-colors ${
                          isEditing
                            ? 'border-primary bg-surface-container-high/30 px-2 rounded'
                            : 'border-transparent'
                        }`}
                        readOnly={!isEditing}
                        type="text"
                        value={profileData.dob}
                        onChange={(e) => handleInputChange('dob', e.target.value)}
                      />
                    </div>

                    {/* Created At */}
                    <div className="bg-surface-container-lowest/70 rounded-xl p-4 flex flex-col gap-1 shadow-sm border border-outline-variant/10">
                      <div className="flex items-center justify-between">
                        <label className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                          Ngày tham gia (created_at)
                        </label>
                        <span className="material-symbols-outlined text-[16px] text-outline">
                          calendar_month
                        </span>
                      </div>
                      <input
                        className="bg-transparent text-on-surface/80 font-body-md text-sm font-semibold focus:outline-none py-0.5 cursor-not-allowed"
                        readOnly
                        type="text"
                        value={profileData.createdAt}
                      />
                    </div>

                    {/* Account Status */}
                    <div className="bg-surface-container-lowest/70 rounded-xl p-4 flex flex-col gap-1 shadow-sm border border-outline-variant/10">
                      <div className="flex items-center justify-between">
                        <label className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                          Trạng thái tài khoản (status)
                        </label>
                        <span className="material-symbols-outlined text-[16px] text-primary">
                          verified
                        </span>
                      </div>
                      <div className="flex items-center gap-2 py-0.5">
                        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                        <span className="text-on-surface font-body-md text-sm font-semibold">
                          {profileData.status}
                        </span>
                      </div>
                    </div>

                    {/* Permanent Address */}
                    <div className="col-span-1 md:col-span-2 bg-surface-container-lowest/70 rounded-xl p-4 flex flex-col gap-1 shadow-sm border border-outline-variant/10">
                      <div className="flex items-center justify-between">
                        <label className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                          Địa chỉ cư trú thường trú (address)
                        </label>
                        <span className="material-symbols-outlined text-[16px] text-outline">
                          home_pin
                        </span>
                      </div>
                      <input
                        className={`bg-transparent text-on-surface font-body-md text-sm font-semibold focus:outline-none border-b py-0.5 transition-colors ${
                          isEditing
                            ? 'border-primary bg-surface-container-high/30 px-2 rounded'
                            : 'border-transparent'
                        }`}
                        readOnly={!isEditing}
                        type="text"
                        value={profileData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ========================================== */}
            {/* TAB 3: HỒ SƠ TÀI XẾ (Driver Profile)       */}
            {/* ========================================== */}
            {activeTab === 'tab-driver' && (
              <section className="flex flex-col gap-6 transition-all duration-300">
                <div className="bg-surface-container-low/90 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl flex flex-col gap-6 border border-outline-variant/15">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/15">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-primary font-label-sm uppercase tracking-wider text-xs font-semibold">
                        <span className="material-symbols-outlined text-[16px]">
                          airline_seat_recline_normal
                        </span>
                        Phần 3 • Năng lực cầm lái &amp; Tín nhiệm
                      </div>
                      <h3 className="font-headline-md text-headline-md text-on-surface font-bold mt-1">
                        Hồ sơ tài xế tự lái
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-primary-container/40 text-primary font-label-md text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                      Đang hoạt động (Đủ điều kiện nhận xe tự lái)
                    </span>
                  </div>

                  {/* Safe Driving Telemetry Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-surface-container-lowest/70 rounded-xl p-5 flex flex-col justify-between shadow-sm border border-outline-variant/10">
                      <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-xs font-semibold">
                        Chuyến đi an toàn
                      </span>
                      <div className="flex items-baseline gap-2 mt-4">
                        <span className="text-3xl font-bold text-on-surface">18</span>
                        <span className="font-body-sm text-primary text-xs">chuyến hoàn tất</span>
                      </div>
                      <span className="font-label-sm text-on-surface-variant text-xs mt-2">
                        Khu vực TP. Hồ Chí Minh &amp; hành trình liên tỉnh
                      </span>
                    </div>

                    <div className="bg-surface-container-lowest/70 rounded-xl p-5 flex flex-col justify-between shadow-sm border border-outline-variant/10">
                      <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-xs font-semibold">
                        Đánh giá từ chủ xe
                      </span>
                      <div className="flex items-center gap-2 mt-4">
                        <span className="text-3xl font-bold text-tertiary">5.0</span>
                        <div className="flex text-tertiary">
                          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                        </div>
                      </div>
                      <span className="font-label-sm text-on-surface-variant text-xs mt-2">
                        100% chủ xe đối tác đánh giá chuẩn mực
                      </span>
                    </div>

                    <div className="bg-surface-container-lowest/70 rounded-xl p-5 flex flex-col justify-between shadow-sm border border-outline-variant/10">
                      <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-xs font-semibold">
                        Tỷ lệ hủy chuyến
                      </span>
                      <div className="flex items-baseline gap-2 mt-4">
                        <span className="text-3xl font-bold text-secondary">0%</span>
                        <span className="font-body-sm text-secondary text-xs">không vi phạm</span>
                      </div>
                      <span className="font-label-sm text-on-surface-variant text-xs mt-2">
                        Đáp ứng chuẩn mực giữ cam kết nhận xe
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ========================================== */}
            {/* TAB 4: TÀI KHOẢN NGÂN HÀNG                  */}
            {/* ========================================== */}
            {activeTab === 'tab-bank' && (
              <section className="flex flex-col gap-6 transition-all duration-300">
                <div className="bg-surface-container-low/90 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl flex flex-col gap-6 border border-outline-variant/15">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/15">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-primary font-label-sm uppercase tracking-wider text-xs font-semibold">
                        <span className="material-symbols-outlined text-[16px]">
                          account_balance
                        </span>
                        Phần 4 • Thanh toán &amp; Hoàn cọc tự động
                      </div>
                      <h3 className="font-headline-md text-headline-md text-on-surface font-bold mt-1">
                        Tài khoản ngân hàng
                      </h3>
                      <p className="font-body-sm text-on-surface-variant text-xs">
                        Tài khoản dùng để nhận hoàn tiền cọc giữ xe và quyết toán chi phí chuyến đi theo quy trình tự động.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface font-label-md text-xs font-semibold hover:bg-surface-bright transition-colors flex items-center gap-1.5 cursor-pointer"
                        onClick={() => alert('Thêm tài khoản ngân hàng mới vào hồ sơ')}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_card</span>
                        Thêm tài khoản mới
                      </button>
                    </div>
                  </div>

                  {/* Dark Platinum Emerald Glass Bank Card */}
                  <div className="relative w-full max-w-lg mx-auto md:mx-0 rounded-2xl p-6 md:p-8 bg-gradient-to-br from-surface-container-highest via-surface-container-high to-surface-container-lowest shadow-[0_20px_50px_rgba(0,17,16,0.8)] overflow-hidden border border-outline-variant/20">
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col justify-between h-56">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col">
                          <span className="font-label-sm text-xs text-primary tracking-widest uppercase font-semibold">
                            VIETCOMBANK
                          </span>
                          <span className="font-headline-sm text-lg text-on-surface font-bold mt-0.5">
                            Vietcombank Priority
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-sm text-xs font-semibold shadow-sm">
                          Mặc định nhận hoàn cọc
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="font-label-sm text-xs text-on-surface-variant">
                          Số tài khoản thanh toán
                        </span>
                        <div className="font-mono text-xl md:text-2xl tracking-widest text-on-surface font-bold mt-1">
                          •••• •••• •••• 6868
                        </div>
                      </div>

                      <div className="flex items-end justify-between pt-2">
                        <div className="flex flex-col">
                          <span className="font-label-sm text-xs text-on-surface-variant">
                            CHỦ TÀI KHOẢN
                          </span>
                          <span className="font-label-lg text-sm text-on-surface font-semibold tracking-wider">
                            NGUYEN HOANG MINH
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-label-sm text-xs text-on-surface-variant">
                            CHI NHÁNH
                          </span>
                          <span className="font-body-sm text-xs text-on-surface-variant font-medium">
                            TP. Hồ Chí Minh
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-surface-container p-6 rounded-2xl max-w-lg w-full border border-outline-variant/30 shadow-2xl relative flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-on-surface text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                {previewImage}
              </h4>
              <button
                className="p-1 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface cursor-pointer"
                onClick={() => setPreviewImage(null)}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="relative h-64 rounded-xl bg-surface-container-lowest flex items-center justify-center overflow-hidden border border-outline-variant/20">
              <span className="text-outline-variant/20 font-bold text-xl uppercase tracking-widest -rotate-12 select-none pointer-events-none">
                Bản ghi eKYC Mã Hóa CarDB
              </span>
              <div className="absolute bottom-3 text-xs text-primary font-mono bg-surface-container-high/80 px-3 py-1 rounded-full">
                Checksum: 0x9f884a2 • Đã ký số định danh
              </div>
            </div>

            <button
              className="w-full py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-semibold transition-colors cursor-pointer"
              onClick={() => setPreviewImage(null)}
              type="button"
            >
              Đóng xem ảnh
            </button>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {uploadToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface-container-highest text-on-surface px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-secondary/40">
          <span className="material-symbols-outlined text-secondary text-[24px]">task_alt</span>
          <p className="font-body-sm text-xs text-on-surface">{uploadToast}</p>
        </div>
      )}
    </div>
  );
}

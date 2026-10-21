import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('tab-personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadToast, setUploadToast] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    document.title = 'CarDB - Hồ sơ cá nhân & eKYC';
  }, []);

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

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileName = files[0].name;
      setUploadedFiles((prev) => [...prev, fileName]);
      setUploadToast(
        `Đã tiếp nhận tệp "${fileName}". Hồ sơ đã chuyển sang trạng thái "Chờ duyệt" (2-4 giờ làm việc).`
      );
      setTimeout(() => {
        setUploadToast(null);
      }, 4500);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background text-on-surface antialiased pt-4 pb-16">
      <div className="relative w-full max-w-[1440px] mx-auto px-6 md:px-12 py-8">
        {/* Subtle Ambient Glow Orbs */}
        <div className="absolute -top-24 left-1/4 w-[480px] h-[360px] bg-primary-container/20 rounded-full blur-[140px] pointer-events-none -z-10"></div>
        <div className="absolute top-1/2 right-0 w-[420px] h-[420px] bg-secondary-container/10 rounded-full blur-[160px] pointer-events-none -z-10"></div>

        {/* Page Header (Editorial Meta Strip) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-8 pb-4 border-b border-outline-variant/15">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm uppercase tracking-widest font-semibold">
                Hồ sơ &amp; eKYC CarDB
              </span>
              <span className="text-outline-variant font-label-sm">/</span>
              <span className="font-label-sm text-on-surface-variant">Khách hàng định danh</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              Hồ sơ cá nhân
            </h1>
            <p className="font-body-md text-on-surface-variant max-w-2xl leading-relaxed">
              Quản lý thông tin tài khoản, mức độ tín nhiệm lái xe và chứng thực hồ sơ pháp lý chuẩn mực.
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
                    <span>Tài khoản khách hàng ưu tiên</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical Tab Navigation */}
            <nav className="bg-surface-container-low/90 backdrop-blur-2xl rounded-2xl p-2 shadow-lg flex flex-col gap-1 border border-outline-variant/15">
              {/* Tab 1 */}
              <button
                className={`tab-btn w-full flex items-center justify-between px-4 py-3 rounded-xl font-label-lg text-sm font-semibold transition-all text-left cursor-pointer ${
                  activeTab === 'tab-personal'
                    ? 'bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(20,184,166,0.35)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                }`}
                onClick={() => setActiveTab('tab-personal')}
                type="button"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">badge</span>
                  <span>Thông tin cá nhân</span>
                </div>
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>

              {/* Tab 2 */}
              <button
                className={`tab-btn w-full flex items-center justify-between px-4 py-3 rounded-xl font-label-lg text-sm font-semibold transition-all text-left cursor-pointer ${
                  activeTab === 'tab-kyc'
                    ? 'bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(20,184,166,0.35)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                }`}
                onClick={() => setActiveTab('tab-kyc')}
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

              {/* Tab 3 */}
              <button
                className={`tab-btn w-full flex items-center justify-between px-4 py-3 rounded-xl font-label-lg text-sm font-semibold transition-all text-left cursor-pointer ${
                  activeTab === 'tab-driver'
                    ? 'bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(20,184,166,0.35)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                }`}
                onClick={() => setActiveTab('tab-driver')}
                type="button"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">airline_seat_recline_normal</span>
                  <span>Hồ sơ tài xế</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-primary-container/30 text-primary font-label-sm text-xs font-semibold">
                  Đang hoạt động
                </span>
              </button>

              {/* Tab 4 */}
              <button
                className={`tab-btn w-full flex items-center justify-between px-4 py-3 rounded-xl font-label-lg text-sm font-semibold transition-all text-left cursor-pointer ${
                  activeTab === 'tab-bank'
                    ? 'bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(20,184,166,0.35)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                }`}
                onClick={() => setActiveTab('tab-bank')}
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

                    {/* Realtime DB Sync Strip */}
                    <div className="col-span-1 md:col-span-2 bg-primary-container/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm border border-primary/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-container/60 text-primary flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-[22px]">sync</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-md text-on-surface font-semibold text-sm">
                            Đồng bộ dữ liệu thời gian thực
                          </span>
                          <span className="font-body-sm text-on-surface-variant text-xs">
                            Dữ liệu được cập nhật và đồng bộ trực tiếp với hệ thống CarDB.
                          </span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-xs font-semibold self-start sm:self-auto">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        Đã kết nối CSDL
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ========================================== */}
            {/* TAB 2: XÁC MINH GIẤY TỜ (eKYC System)      */}
            {/* ========================================== */}
            {activeTab === 'tab-kyc' && (
              <section className="flex flex-col gap-6 transition-all duration-300">
                <div className="bg-surface-container-low/90 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl flex flex-col gap-6 border border-outline-variant/15">
                  {/* Header */}
                  <div className="flex flex-col gap-1 pb-4 border-b border-outline-variant/15">
                    <div className="flex items-center gap-1.5 text-primary font-label-sm uppercase tracking-wider text-xs font-semibold">
                      <span className="material-symbols-outlined text-[16px]">fingerprint</span>
                      Phần 2 • Trung tâm kiểm định định danh eKYC
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface font-bold mt-1">
                      Xác minh hồ sơ pháp lý
                    </h3>
                    <p className="font-body-sm text-on-surface-variant flex items-center gap-2 text-xs">
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        encrypted
                      </span>
                      Giấy tờ của bạn được mã hóa an toàn và chỉ phục vụ mục đích xác thực danh tính khi bàn giao xe theo quy định pháp luật.
                    </p>
                  </div>

                  {/* Standardized 4-Stage Legend Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-container-lowest/60 p-4 rounded-xl border border-outline-variant/10">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-outline"></span>
                      <span className="font-label-sm text-on-surface-variant text-xs">Chưa xác minh</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></span>
                      <span className="font-label-sm text-tertiary text-xs font-medium">Chờ duyệt (2-4h)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                      <span className="font-label-sm text-primary font-semibold text-xs">Đã xác minh ✓</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                      <span className="font-label-sm text-error text-xs">Bị từ chối</span>
                    </div>
                  </div>

                  {/* Document List */}
                  <div className="flex flex-col gap-4">
                    {/* Document A: CCCD gắn chip */}
                    <div className="bg-surface-container-lowest/80 rounded-xl p-5 md:p-6 flex flex-col gap-4 shadow-sm border border-outline-variant/10">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-outline-variant/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary-container/40 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[24px]">contact_emergency</span>
                          </div>
                          <div>
                            <h4 className="font-headline-sm text-base text-on-surface font-bold">
                              A. Căn cước công dân (CCCD gắn chip)
                            </h4>
                            <span className="font-label-sm text-on-surface-variant text-xs">
                              Định danh công dân số quốc gia Việt Nam
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/40 text-primary font-label-sm text-xs font-semibold self-start sm:self-auto">
                          <span className="material-symbols-outlined text-[16px]">verified</span>
                          Đã xác minh
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-on-surface font-body-sm text-xs">
                        <div className="flex flex-col">
                          <span className="text-on-surface-variant font-label-sm">Số CCCD bảo mật</span>
                          <span className="font-mono font-semibold text-sm tracking-wider mt-0.5">
                            079092******
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-on-surface-variant font-label-sm">Ngày cấp / Thời hạn hiệu lực</span>
                          <span className="font-semibold text-sm mt-0.5">
                            18/09/2032 (Còn hơn 7 năm)
                          </span>
                        </div>
                      </div>

                      {/* Image Previews with Watermarks */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div className="relative h-44 rounded-xl bg-surface-container-high overflow-hidden shadow-inner flex flex-col justify-between p-4 border border-outline-variant/20">
                          <div className="flex items-center justify-between z-10">
                            <span className="px-2.5 py-0.5 rounded bg-surface-container-lowest/80 text-on-surface font-label-sm text-xs font-semibold">
                              Mặt trước
                            </span>
                            <span className="material-symbols-outlined text-[18px] text-primary">lock</span>
                          </div>
                          {/* Dynamic Watermark */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                            <span className="text-outline-variant/30 font-headline-sm uppercase tracking-widest -rotate-12 text-sm font-bold">
                              CHỈ DÙNG CHO CARDB
                            </span>
                          </div>
                          <div className="z-10 flex items-center justify-between text-on-surface-variant font-label-sm text-xs">
                            <span>eKYC chip checksum: OK</span>
                            <span className="text-primary font-semibold">Hợp lệ</span>
                          </div>
                        </div>

                        <div className="relative h-44 rounded-xl bg-surface-container-high overflow-hidden shadow-inner flex flex-col justify-between p-4 border border-outline-variant/20">
                          <div className="flex items-center justify-between z-10">
                            <span className="px-2.5 py-0.5 rounded bg-surface-container-lowest/80 text-on-surface font-label-sm text-xs font-semibold">
                              Mặt sau
                            </span>
                            <span className="material-symbols-outlined text-[18px] text-primary">lock</span>
                          </div>
                          {/* Dynamic Watermark */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                            <span className="text-outline-variant/30 font-headline-sm uppercase tracking-widest -rotate-12 text-sm font-bold">
                              CHỈ DÙNG CHO CARDB
                            </span>
                          </div>
                          <div className="z-10 flex items-center justify-between text-on-surface-variant font-label-sm text-xs">
                            <span>MRZ Code Check: Hợp lệ</span>
                            <span className="text-primary font-semibold">Hợp lệ</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Document B: GPLX Ô tô */}
                    <div className="bg-surface-container-lowest/80 rounded-xl p-5 md:p-6 flex flex-col gap-4 shadow-sm border border-outline-variant/10">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-outline-variant/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary-container/40 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[24px]">directions_car</span>
                          </div>
                          <div>
                            <h4 className="font-headline-sm text-base text-on-surface font-bold">
                              B. Giấy phép lái xe (GPLX Ô tô)
                            </h4>
                            <span className="font-label-sm text-on-surface-variant text-xs">
                              Cục Đường bộ Việt Nam cấp
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/40 text-primary font-label-sm text-xs font-semibold self-start sm:self-auto">
                          <span className="material-symbols-outlined text-[16px]">task_alt</span>
                          Đang hoạt động / Đã xác minh
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-on-surface font-body-sm text-xs">
                        <div className="flex flex-col">
                          <span className="text-on-surface-variant font-label-sm">Hạng bằng lái</span>
                          <span className="font-semibold text-sm text-primary mt-0.5">
                            Hạng B2 (Ô tô chở người ≤ 9 chỗ)
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-on-surface-variant font-label-sm">Số GPLX</span>
                          <span className="font-mono font-semibold text-sm tracking-wider mt-0.5">
                            790159******
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-on-surface-variant font-label-sm">Ngày hết hạn</span>
                          <span className="font-semibold text-sm mt-0.5">24/05/2030 (Hợp lệ)</span>
                        </div>
                      </div>

                      {/* GPLX Image Preview */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div className="relative h-44 rounded-xl bg-surface-container-high overflow-hidden shadow-inner flex flex-col justify-between p-4 border border-outline-variant/20">
                          <div className="flex items-center justify-between z-10">
                            <span className="px-2.5 py-0.5 rounded bg-surface-container-lowest/80 text-on-surface font-label-sm text-xs font-semibold">
                              GPLX - Mặt trước (PET)
                            </span>
                            <span className="material-symbols-outlined text-[18px] text-primary">verified</span>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                            <span className="text-outline-variant/30 font-headline-sm uppercase tracking-widest -rotate-12 text-sm font-bold">
                              CHỈ DÙNG CHO CARDB
                            </span>
                          </div>
                          <div className="z-10 flex items-center justify-between text-on-surface-variant font-label-sm text-xs">
                            <span>Cơ quan cấp: Sở GTVT TP.HCM</span>
                            <span className="text-primary font-semibold">Khớp dữ liệu</span>
                          </div>
                        </div>

                        <div className="relative h-44 rounded-xl bg-surface-container-high overflow-hidden shadow-inner flex flex-col justify-between p-4 border border-outline-variant/20">
                          <div className="flex items-center justify-between z-10">
                            <span className="px-2.5 py-0.5 rounded bg-surface-container-lowest/80 text-on-surface font-label-sm text-xs font-semibold">
                              GPLX - Mặt sau
                            </span>
                            <span className="material-symbols-outlined text-[18px] text-primary">verified</span>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                            <span className="text-outline-variant/30 font-headline-sm uppercase tracking-widest -rotate-12 text-sm font-bold">
                              CHỈ DÙNG CHO CARDB
                            </span>
                          </div>
                          <div className="z-10 flex items-center justify-between text-on-surface-variant font-label-sm text-xs">
                            <span>Được phép điều khiển: B2</span>
                            <span className="text-primary font-semibold">Đủ tiêu chuẩn</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Document C: Hộ chiếu */}
                    <div className="bg-surface-container-lowest/80 rounded-xl p-5 md:p-6 flex flex-col gap-4 shadow-sm border border-outline-variant/10">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-outline-variant/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-tertiary-container/40 flex items-center justify-center text-tertiary">
                            <span className="material-symbols-outlined text-[24px]">travel_explore</span>
                          </div>
                          <div>
                            <h4 className="font-headline-sm text-base text-on-surface font-bold">
                              C. Hộ chiếu (Passport) / Giấy tờ bổ sung
                            </h4>
                            <span className="font-label-sm text-on-surface-variant text-xs">
                              Dành cho hành trình dài ngày hoặc khách thuê quốc tế
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container/50 text-tertiary-fixed font-label-sm text-xs font-semibold self-start sm:self-auto">
                          <span className="material-symbols-outlined text-[16px] animate-spin">
                            hourglass_empty
                          </span>
                          Chờ duyệt
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-on-surface font-body-sm text-xs">
                        <div className="flex flex-col">
                          <span className="text-on-surface-variant font-label-sm">Số hộ chiếu khai báo</span>
                          <span className="font-mono font-semibold text-sm tracking-wider mt-0.5">
                            P01984***
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-on-surface-variant font-label-sm">Ghi chú đối soát hệ thống</span>
                          <span className="font-body-sm text-xs text-tertiary font-medium mt-0.5">
                            Đang được chuyên viên CarDB thẩm định trong vòng 2 - 4 giờ làm việc. (Không phê duyệt tức thì để đảm bảo tính pháp lý).
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upload Box (Drag & Drop Zone) */}
                  <div className="mt-2 flex flex-col gap-2">
                    <span className="font-label-lg text-on-surface font-semibold flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-[20px] text-primary">
                        cloud_upload
                      </span>
                      Tải lên cập nhật hoặc bổ sung tài liệu mới
                    </span>

                    <div
                      className="group relative rounded-2xl p-8 bg-surface-container-lowest/50 hover:bg-surface-container-high/40 transition-all flex flex-col items-center justify-center text-center cursor-pointer shadow-inner border-2 border-dashed border-outline-variant/30 hover:border-secondary"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    >
                      <div className="w-14 h-14 rounded-full bg-primary-container/40 text-primary flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(20,184,166,0.4)] transition-all">
                        <span className="material-symbols-outlined text-[32px]">upload_file</span>
                      </div>
                      <h5 className="font-headline-sm text-base text-on-surface font-bold">
                        Kéo và thả tài liệu vào đây
                      </h5>
                      <p className="font-body-sm text-on-surface-variant max-w-md mt-1 text-xs">
                        Hỗ trợ định dạng hình ảnh rõ nét:{' '}
                        <span className="text-primary font-semibold">JPG, PNG, PDF</span> dung lượng tối đa 10MB/tệp.
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          className="px-5 py-2 rounded-xl bg-surface-container-high text-on-surface font-label-md text-xs font-semibold hover:bg-surface-bright transition-colors cursor-pointer"
                          type="button"
                        >
                          Chọn tệp từ máy tính
                        </button>
                        <span className="font-label-sm text-on-surface-variant text-xs">
                          hoặc chụp trực tiếp từ camera
                        </span>
                      </div>
                      <input
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileUpload}
                      />
                    </div>

                    {uploadToast && (
                      <div className="p-3 rounded-xl bg-secondary-container/20 border border-secondary text-secondary text-xs flex items-center gap-2 mt-2">
                        <span className="material-symbols-outlined text-[18px]">info</span>
                        <span>{uploadToast}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 px-2 py-1 text-on-surface-variant font-label-sm text-xs">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">info</span>
                      <span>
                        Quy trình chuẩn mực: Sau khi tải lên, hệ thống sẽ tự động chuyển hồ sơ sang trạng thái <strong>"Chờ duyệt"</strong> để chuyên viên pháp chế rà soát.
                      </span>
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

                  {/* Transparency Disclaimer Box */}
                  <div className="bg-surface-container-lowest/80 rounded-xl p-5 md:p-6 flex items-start gap-4 shadow-sm border border-outline-variant/10">
                    <span className="material-symbols-outlined text-[28px] text-secondary flex-shrink-0 mt-0.5">
                      verified
                    </span>
                    <div className="flex flex-col">
                      <h4 className="font-headline-sm text-base text-on-surface font-bold">
                        Quy chế tự hành phương tiện
                      </h4>
                      <p className="font-body-md text-on-surface-variant mt-1 leading-relaxed text-sm">
                        Quyền điều khiển phương tiện tự lái phụ thuộc vào Giấy phép lái xe còn hiệu lực đã được CarDB phê duyệt. Hồ sơ tài xế hoàn toàn độc lập với quyền Đăng ký xe cho thuê (Chủ xe đối tác).
                      </p>
                    </div>
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

                  {/* Driving Badges & Endorsements */}
                  <div className="bg-surface-container-lowest/60 rounded-xl p-5 md:p-6 flex flex-col gap-4 border border-outline-variant/10">
                    <h4 className="font-label-lg text-on-surface font-bold text-sm">
                      Đặc quyền tài xế đáng tin cậy
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary text-[22px]">
                          electric_car
                        </span>
                        <div className="flex flex-col">
                          <span className="font-label-md text-on-surface font-semibold text-xs">
                            Đặc quyền xe Luxury &amp; Performance
                          </span>
                          <span className="font-body-sm text-on-surface-variant text-xs mt-0.5">
                            Được phép nhận dòng xe công suất cao (Porsche Taycan, Mercedes EQS).
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary text-[22px]">
                          speed
                        </span>
                        <div className="flex flex-col">
                          <span className="font-label-md text-on-surface font-semibold text-xs">
                            Bàn giao nhanh Express
                          </span>
                          <span className="font-body-sm text-on-surface-variant text-xs mt-0.5">
                            Rút ngắn quy trình nhận xe xuống dưới 3 phút tại sân bay Tân Sơn Nhất.
                          </span>
                        </div>
                      </div>
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
                    {/* Internal Glowing Effects */}
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                      <span className="material-symbols-outlined text-[120px] text-on-surface">
                        account_balance
                      </span>
                    </div>

                    <div className="relative z-10 flex flex-col justify-between h-56">
                      {/* Top Row: Bank Name & Status Chip */}
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

                      {/* Card Number Segment */}
                      <div className="flex flex-col">
                        <span className="font-label-sm text-xs text-on-surface-variant">
                          Số tài khoản thanh toán
                        </span>
                        <div className="font-mono text-xl md:text-2xl tracking-widest text-on-surface font-bold mt-1">
                          •••• •••• •••• 6868
                        </div>
                      </div>

                      {/* Bottom Row: Cardholder & Branch */}
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

                  {/* Action Controls for Bank Account */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      className="px-4 py-2 rounded-xl bg-surface-container-high/60 text-on-surface font-label-md text-xs font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-1.5 cursor-pointer"
                      onClick={() => alert('Chỉnh sửa thông tin tài khoản ngân hàng')}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      Chỉnh sửa thông tin
                    </button>
                    <button
                      className="px-4 py-2 rounded-xl bg-surface-container-lowest text-error font-label-md text-xs font-semibold hover:bg-error-container hover:text-on-error-container transition-colors flex items-center gap-1.5 cursor-pointer"
                      onClick={() => {
                        if (confirm('Bạn có chắc chắn muốn gỡ liên kết tài khoản ngân hàng này?')) {
                          alert('Đã gỡ liên kết.');
                        }
                      }}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      Gỡ liên kết
                    </button>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

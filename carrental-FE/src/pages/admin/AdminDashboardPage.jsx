import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboardPage() {
  const stats = [
    {
      title: 'Doanh thu tháng này',
      value: '1.420.000.000đ',
      change: '+18.4% so với tháng trước',
      isPositive: true,
      icon: 'payments',
    },
    {
      title: 'Tỷ lệ khai thác đội xe',
      value: '85.7%',
      subtext: '24 / 28 xe đang lăn bánh',
      icon: 'directions_car',
      change: '+4 xe hôm nay',
      isPositive: true,
    },
    {
      title: 'Hợp đồng đang thực hiện',
      value: '14 chuyến',
      subtext: '3 chuyến bàn giao hôm nay',
      icon: 'commute',
      change: 'Đang đúng lịch 100%',
      isPositive: true,
    },
    {
      title: 'Hồ sơ eKYC chờ duyệt',
      value: '3 hồ sơ',
      subtext: 'Cần thẩm định trong 2-4h',
      icon: 'verified_user',
      change: 'Cần xử lý gấp',
      isPositive: false,
    },
  ];

  const recentBookings = [
    {
      id: 'BK-88492',
      customer: 'Nguyễn Hoàng Minh',
      car: 'Porsche Taycan 4S Electric',
      date: '14/10 - 16/10/2026',
      total: '7.600.000đ',
      status: 'ĐANG LĂN BÁNH',
      statusColor: 'bg-secondary/20 text-secondary border-secondary/30',
    },
    {
      id: 'BK-88493',
      customer: 'Trần Đình Trọng',
      car: 'Mercedes-Benz EQS 450+',
      date: '15/10 - 18/10/2026',
      total: '12.900.000đ',
      status: 'CHỜ BÀN GIAO',
      statusColor: 'bg-primary-container/30 text-primary border-primary/30',
    },
    {
      id: 'BK-88494',
      customer: 'Lê Thùy Dung',
      car: 'BMW i7 xDrive60 Pure',
      date: '17/10 - 20/10/2026',
      total: '15.600.000đ',
      status: 'CHỜ DUYỆT CỌC',
      statusColor: 'bg-tertiary-container/30 text-tertiary border-tertiary/30',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-outline-variant/15">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">
            Tổng quan hệ thống vận hành CarDB
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Cập nhật dữ liệu thời gian thực theo chuẩn xe sang TP. Hồ Chí Minh & Hà Nội
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-white font-semibold text-xs shadow-md hover:brightness-110 transition-all flex items-center gap-1.5"
            to="/admin/cars"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Thêm xe vào đội</span>
          </Link>
        </div>
      </div>

      {/* 4 Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-surface-container-low/90 border border-outline-variant/20 shadow-md flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <span className="text-xs text-on-surface-variant font-medium">{stat.title}</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">{stat.icon}</span>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-on-surface font-mono">{stat.value}</span>
              {stat.subtext && (
                <p className="text-[11px] text-on-surface-variant mt-0.5">{stat.subtext}</p>
              )}
            </div>
            <div className="mt-3 pt-2 border-t border-outline-variant/10 flex items-center justify-between text-[11px]">
              <span className={stat.isPositive ? 'text-secondary font-semibold' : 'text-tertiary font-semibold'}>
                {stat.change}
              </span>
              <span className="text-on-surface-variant">Hôm nay</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings Table */}
      <div className="rounded-2xl bg-surface-container-low/90 border border-outline-variant/20 p-5 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">
              receipt_long
            </span>
            <h2 className="text-base font-bold text-on-surface">Đơn đặt xe mới nhất</h2>
          </div>
          <Link
            className="text-xs text-primary font-semibold hover:underline"
            to="/admin/bookings"
          >
            Xem tất cả đơn
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-lowest/80 text-on-surface-variant uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 rounded-l-lg">Mã đơn</th>
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-4">Phương tiện</th>
                <th className="py-3 px-4">Lộ trình</th>
                <th className="py-3 px-4">Tổng tiền</th>
                <th className="py-3 px-4 rounded-r-lg">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-on-surface">
              {recentBookings.map((bk) => (
                <tr key={bk.id} className="hover:bg-surface-container-high/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-primary">{bk.id}</td>
                  <td className="py-3 px-4 font-medium">{bk.customer}</td>
                  <td className="py-3 px-4">{bk.car}</td>
                  <td className="py-3 px-4 text-on-surface-variant">{bk.date}</td>
                  <td className="py-3 px-4 font-mono font-semibold">{bk.total}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${bk.statusColor}`}
                    >
                      {bk.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

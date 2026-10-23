import React from 'react';

export default function AdminBookingsPage() {
  const bookings = [
    {
      id: 'BK-88492',
      customer: 'Nguyễn Hoàng Minh',
      phone: '0908 123 456',
      car: 'Porsche Taycan 4S Electric',
      pickup: '14/10/2026 - 09:00',
      dropoff: '16/10/2026 - 18:00',
      deposit: '15.000.000đ',
      total: '7.600.000đ',
      payment: 'ĐÃ THANH TOÁN',
      status: 'ĐANG LĂN BÁNH',
    },
    {
      id: 'BK-88493',
      customer: 'Trần Đình Trọng',
      phone: '0912 345 678',
      car: 'Mercedes-Benz EQS 450+',
      pickup: '15/10/2026 - 10:00',
      dropoff: '18/10/2026 - 12:00',
      deposit: '20.000.000đ',
      total: '12.900.000đ',
      payment: 'ĐÃ GIỮ CỌC',
      status: 'CHỜ BÀN GIAO',
    },
    {
      id: 'BK-88494',
      customer: 'Lê Thùy Dung',
      phone: '0988 777 666',
      car: 'BMW i7 xDrive60 Pure',
      pickup: '17/10/2026 - 08:30',
      dropoff: '20/10/2026 - 17:30',
      deposit: '25.000.000đ',
      total: '15.600.000đ',
      payment: 'CHỜ XÁC NHẬN CỌC',
      status: 'CHỜ DUYỆT',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/15">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">
            Quản lý hợp đồng &amp; Đơn đặt xe
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Theo dõi tiến trình nhận xe, đối soát tiền cọc và giải quyết tranh chấp (Dispute)
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-surface-container-low/90 border border-outline-variant/20 p-5 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-lowest/80 text-on-surface-variant uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 rounded-l-lg">Mã hợp đồng</th>
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-4">Phương tiện</th>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Tiền cọc</th>
                <th className="py-3 px-4">Tổng tiền</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 rounded-r-lg text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-on-surface">
              {bookings.map((bk) => (
                <tr key={bk.id} className="hover:bg-surface-container-high/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-primary">{bk.id}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold">{bk.customer}</div>
                    <div className="text-[10px] text-on-surface-variant font-mono">{bk.phone}</div>
                  </td>
                  <td className="py-3 px-4 font-medium">{bk.car}</td>
                  <td className="py-3 px-4 text-on-surface-variant text-[11px]">
                    <div>Nhận: {bk.pickup}</div>
                    <div>Trả: {bk.dropoff}</div>
                  </td>
                  <td className="py-3 px-4 font-mono">{bk.deposit}</td>
                  <td className="py-3 px-4 font-mono font-bold">{bk.total}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary-container/30 text-primary">
                      {bk.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-bright text-xs text-on-surface cursor-pointer"
                      onClick={() => alert(`Xem chi tiết hợp đồng ${bk.id}`)}
                      type="button"
                    >
                      Xem
                    </button>
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

import React, { useState } from 'react';

export default function AdminCarsPage() {
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fleet = [
    {
      id: 'car-1',
      name: 'Porsche Taycan 4S Electric',
      plate: '51K-888.49',
      category: 'Sedan Thể thao',
      dailyPrice: '3.800.000đ',
      status: 'AVAILABLE',
      statusLabel: 'Sẵn sàng',
      statusColor: 'bg-primary-container/30 text-primary',
    },
    {
      id: 'car-2',
      name: 'Mercedes-Benz EQS 450+ Luxury',
      plate: '51K-992.12',
      category: 'Sedan Sang trọng',
      dailyPrice: '4.300.000đ',
      status: 'RENTED',
      statusLabel: 'Đang thuê',
      statusColor: 'bg-secondary/20 text-secondary',
    },
    {
      id: 'car-3',
      name: 'BMW i7 xDrive60 Excellence',
      plate: '51K-774.88',
      category: 'Flagship Luxury',
      dailyPrice: '5.200.000đ',
      status: 'AVAILABLE',
      statusLabel: 'Sẵn sàng',
      statusColor: 'bg-primary-container/30 text-primary',
    },
    {
      id: 'car-4',
      name: 'Audi e-tron GT Quattro RS',
      plate: '51K-633.91',
      category: 'Coupe Điện',
      dailyPrice: '4.600.000đ',
      status: 'MAINTENANCE',
      statusLabel: 'Bảo trì',
      statusColor: 'bg-tertiary-container/30 text-tertiary',
    },
  ];

  const filtered = filterStatus === 'ALL'
    ? fleet
    : fleet.filter((c) => c.status === filterStatus);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/15">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">
            Quản lý đội xe CarDB
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Quản lý danh sách phương tiện, giá thuê ngày/giờ và trạng thái bảo dưỡng
          </p>
        </div>

        <button
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-white font-semibold text-xs shadow-md hover:brightness-110 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          onClick={() => alert('Mở popup thêm xe mới vào hệ thống')}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">add_circle</span>
          <span>Thêm xe mới</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {[
          { key: 'ALL', label: 'Tất cả (28)' },
          { key: 'AVAILABLE', label: 'Sẵn sàng (18)' },
          { key: 'RENTED', label: 'Đang thuê (8)' },
          { key: 'MAINTENANCE', label: 'Bảo trì (2)' },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === tab.key
                ? 'bg-primary-container text-on-primary-container shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
            onClick={() => setFilterStatus(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Fleet Table */}
      <div className="rounded-2xl bg-surface-container-low/90 border border-outline-variant/20 p-5 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-lowest/80 text-on-surface-variant uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 rounded-l-lg">Tên xe</th>
                <th className="py-3 px-4">Biển số</th>
                <th className="py-3 px-4">Phân khúc</th>
                <th className="py-3 px-4">Giá thuê/ngày</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 rounded-r-lg text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-on-surface">
              {filtered.map((car) => (
                <tr key={car.id} className="hover:bg-surface-container-high/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-primary">{car.name}</td>
                  <td className="py-3 px-4 font-mono">{car.plate}</td>
                  <td className="py-3 px-4 text-on-surface-variant">{car.category}</td>
                  <td className="py-3 px-4 font-mono font-semibold">{car.dailyPrice}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${car.statusColor}`}>
                      {car.statusLabel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-bright text-xs text-on-surface cursor-pointer"
                      onClick={() => alert(`Chỉnh sửa ${car.name}`)}
                      type="button"
                    >
                      Sửa
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

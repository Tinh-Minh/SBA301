import React, { useState } from 'react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([
    {
      id: 'CDB-VN-88492',
      name: 'Nguyễn Hoàng Minh',
      email: 'minh.nguyen@example.com',
      phone: '0908 123 456',
      tier: 'VIP',
      kycStatus: 'VERIFIED',
      kycLabel: 'Đã xác minh',
      tripsCompleted: 18,
    },
    {
      id: 'CDB-VN-88493',
      name: 'Trần Đình Trọng',
      email: 'trong.tran@example.com',
      phone: '0912 345 678',
      tier: 'TIÊU CHUẨN',
      kycStatus: 'PENDING',
      kycLabel: 'Chờ duyệt GPLX',
      tripsCompleted: 4,
    },
    {
      id: 'CDB-VN-88494',
      name: 'Lê Thùy Dung',
      email: 'dung.le@example.com',
      phone: '0988 777 666',
      tier: 'VIP',
      kycStatus: 'VERIFIED',
      kycLabel: 'Đã xác minh',
      tripsCompleted: 12,
    },
  ]);

  const handleApprove = (userId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, kycStatus: 'VERIFIED', kycLabel: 'Đã xác minh' } : u
      )
    );
    alert(`Đã duyệt định danh eKYC cho tài khoản ${userId}!`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/15">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">
            Quản lý khách hàng &amp; Thẩm định eKYC
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Duyệt CCCD, Giấy phép lái xe và phân cấp hạn mức khách hàng VIP
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-surface-container-low/90 border border-outline-variant/20 p-5 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-lowest/80 text-on-surface-variant uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 rounded-l-lg">Mã khách hàng</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4">Liên hệ</th>
                <th className="py-3 px-4">Hạng thành viên</th>
                <th className="py-3 px-4">Số chuyến</th>
                <th className="py-3 px-4">Trạng thái eKYC</th>
                <th className="py-3 px-4 rounded-r-lg text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-on-surface">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-container-high/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-primary">{u.id}</td>
                  <td className="py-3 px-4 font-semibold">{u.name}</td>
                  <td className="py-3 px-4 text-on-surface-variant text-[11px]">
                    <div>{u.email}</div>
                    <div className="font-mono">{u.phone}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-primary-container/30 text-primary font-bold text-[10px]">
                      {u.tier}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">{u.tripsCompleted}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.kycStatus === 'VERIFIED'
                          ? 'bg-primary-container/40 text-primary'
                          : 'bg-tertiary-container/40 text-tertiary'
                      }`}
                    >
                      {u.kycLabel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {u.kycStatus === 'PENDING' ? (
                      <button
                        className="px-3 py-1 rounded-lg bg-secondary text-on-secondary-fixed text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                        onClick={() => handleApprove(u.id)}
                        type="button"
                      >
                        Duyệt eKYC
                      </button>
                    ) : (
                      <span className="text-on-surface-variant text-[11px]">Đã chuẩn hóa</span>
                    )}
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

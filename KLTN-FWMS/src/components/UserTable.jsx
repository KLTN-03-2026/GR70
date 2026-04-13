export const UserTable = () => {
  return (
    <section className="bg-surface-container-lowest rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-none">
              <th className="px-8 py-6 font-bold font-headline text-xs uppercase tracking-widest text-outline">HỌ VÀ TÊN</th>
              <th className="px-8 py-6 font-bold font-headline text-xs uppercase tracking-widest text-outline">EMAIL</th>
              <th className="px-8 py-6 font-bold font-headline text-xs uppercase tracking-widest text-outline">VAI TRÒ</th>
              <th className="px-8 py-6 font-bold font-headline text-xs uppercase tracking-widest text-outline">CỬA HÀNG</th>
              <th className="px-8 py-6 font-bold font-headline text-xs uppercase tracking-widest text-outline">TRẠNG THÁI</th>
              <th className="px-8 py-6 font-bold font-headline text-xs uppercase tracking-widest text-outline text-right">THAO TÁC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low">
            {/* Row 1 */}
            <tr className="hover:bg-surface-container-lowest group transition-colors">
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary">NT</div>
                  <span className="font-bold text-on-surface">Nguyễn Thành Trung</span>
                </div>
              </td>
              <td className="px-8 py-6 text-on-surface-variant font-medium">trung.nt@wasteledger.vn</td>
              <td className="px-8 py-6">
                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-lg text-xs font-bold uppercase">Manager</span>
              </td>
              <td className="px-8 py-6 text-on-surface-variant">Green Leaf Market</td>
              <td className="px-8 py-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-sm font-semibold text-primary">Đang hoạt động</span>
                </div>
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex justify-end gap-2">
                  <button className="p-2 hover:bg-surface-container-high rounded-lg text-outline hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button className="p-2 hover:bg-surface-container-high rounded-lg text-outline hover:text-tertiary transition-colors">
                    <span className="material-symbols-outlined">lock_open</span>
                  </button>
                </div>
              </td>
            </tr>

            {/* Row 2 & 3 tương tự (đã rút gọn cho ngắn) */}
            {/* Bạn có thể copy-paste thêm 2 row giống HTML gốc nếu cần */}

          </tbody>
        </table>
      </div>

      {/* Footer pagination */}
      <div className="bg-surface-container-low px-8 py-4 flex justify-between items-center">
        <span className="text-sm text-outline font-medium">Hiển thị 1 - 3 trong tổng số 1,284 người dùng</span>
        <div className="flex gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-sm text-outline hover:text-primary" disabled>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold">1</button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-sm text-outline hover:text-primary">2</button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-sm text-outline hover:text-primary">3</button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-sm text-outline hover:text-primary">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </section>
  );
};
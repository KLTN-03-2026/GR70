export const UserMetrics = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Tổng người dùng */}
      <div className="bg-surface-container-low p-8 rounded-xl flex flex-col justify-between group hover:bg-surface-container-high transition-colors duration-300">
        <div className="flex justify-between items-start">
          <span className="text-xs font-bold font-headline uppercase tracking-widest text-outline">TỔNG NGƯỜI DÙNG</span>
          <span className="material-symbols-outlined text-primary">group</span>
        </div>
        <div className="mt-6">
          <h1 className="text-[64px] leading-tight font-bold font-headline text-on-surface">1,284</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-primary font-bold">+12%</span>
            <span className="text-outline text-sm">so với tháng trước</span>
          </div>
        </div>
      </div>

      {/* Đang hoạt động */}
      <div className="bg-primary p-8 rounded-xl flex flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container opacity-20 rounded-full -mr-16 -mt-16"></div>
        <div className="flex justify-between items-start z-10">
          <span className="text-xs font-bold font-headline uppercase tracking-widest opacity-80">ĐANG HOẠT ĐỘNG</span>
          <span className="material-symbols-outlined">verified_user</span>
        </div>
        <div className="mt-6 z-10">
          <h1 className="text-[64px] leading-tight font-bold font-headline">942</h1>
          <div className="w-full bg-on-primary/20 h-1 rounded-full mt-4">
            <div className="bg-white h-1 rounded-full w-[73%]"></div>
          </div>
          <span className="text-xs mt-2 block opacity-80">73% tỷ lệ hoạt động thực tế</span>
        </div>
      </div>

      {/* Yêu cầu chờ duyệt */}
      <div className="bg-surface-container-low p-8 rounded-xl flex flex-col justify-between group hover:bg-surface-container-high transition-colors duration-300">
        <div className="flex justify-between items-start">
          <span className="text-xs font-bold font-headline uppercase tracking-widest text-outline">YÊU CẦU CHỜ DUYỆT</span>
          <span className="material-symbols-outlined text-tertiary">pending_actions</span>
        </div>
        <div className="mt-6">
          <h1 className="text-[64px] leading-tight font-bold font-headline text-on-surface">18</h1>
          <div className="flex gap-2 mt-4">
            <span className="px-3 py-1 bg-tertiary-container text-on-tertiary-container rounded-full text-xs font-bold">KHẨN CẤP</span>
            <span className="text-outline text-sm">Cần xử lý ngay</span>
          </div>
        </div>
      </div>
    </section>
  );
};
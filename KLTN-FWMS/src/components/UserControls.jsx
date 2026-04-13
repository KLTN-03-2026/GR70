export const UserControls = () => {
  return (
    <section className="flex flex-col md:flex-row justify-between items-end gap-6">
      <div className="w-full md:w-1/2">
        <h2 className="text-[45px] leading-tight font-bold font-headline text-on-surface mb-2">
          Quản lý người dùng
        </h2>
        <p className="text-on-surface-variant max-w-md">
          Kiểm soát quyền truy cập và phân bổ nhân sự cho các cơ sở xử lý rác thải thực phẩm trên toàn hệ thống.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 w-full md:w-auto">
        {/* Filter 1 */}
        <div className="relative flex-grow md:flex-grow-0">
          <select className="appearance-none bg-surface-container-low border-none rounded-xl px-6 py-4 pr-12 font-bold text-sm focus:ring-2 focus:ring-primary w-full cursor-pointer">
            <option>Lọc theo cửa hàng</option>
            <option>Green Leaf Market</option>
            <option>Chi nhánh Quận 1</option>
            <option>Bếp Trung Tâm Đông</option>
            <option>Kho Tổng Hiệp Bình</option>
          </select>
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
            storefront
          </span>
        </div>

        {/* Filter 2 */}
        <div className="relative flex-grow md:flex-grow-0">
          <select className="appearance-none bg-surface-container-low border-none rounded-xl px-6 py-4 pr-12 font-bold text-sm focus:ring-2 focus:ring-primary w-full cursor-pointer">
            <option>Tất cả vai trò</option>
            <option>Manager</option>
            <option>Kitchen</option>
            <option>Warehouse</option>
          </select>
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            expand_more
          </span>
        </div>

        <button className="bg-gradient-to-r from-primary to-primary-container text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined">person_add</span>
          Thêm người dùng
        </button>
      </div>
    </section>
  );
};
import { useState } from "react";
import { mockStores } from "../MockAPI/mockStores";
import { StoreItem } from "./StoreItem";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

export const StoreListSection = ({ onOpenModal }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(""); // ← Thêm state lọc trạng thái

  // Lấy danh sách tỉnh duy nhất từ mock data
  const uniqueProvinces = [...new Set((mockStores || []).map((store) => store.province))];

  // Lọc theo tên + tỉnh + trạng thái
  const filteredStores = (mockStores || []).filter((store) => {
    const matchesSearch = store.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvince = !selectedProvince || store.province === selectedProvince;
    const matchesStatus = !selectedStatus || store.status === selectedStatus;
    return matchesSearch && matchesProvince && matchesStatus;
  });

  return (
    <div className="lg:col-span-12 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-[30px] font-semibold">Danh mục Cửa hàng</h3>
        <div className="flex gap-4 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          {/* Search theo tên */}
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên cửa hàng..."
              className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary text-sm"
            />
          </div>

          {/* ===== LỌC THEO TRẠNG THÁI (đã làm hoạt động) ===== */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5 pointer-events-none" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="pl-10 pr-6 py-3 bg-surface-container-highest border-none rounded-xl font-bold text-on-surface text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary appearance-none min-w-[180px]"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="warning">Cảnh báo</option>
              <option value="locked">Đã khóa</option>
            </select>
          </div>

          {/* ===== LỌC THEO TỈNH (giữ nguyên) ===== */}
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="bg-surface-container-highest px-6 py-3 rounded-xl font-bold text-on-surface text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary border-none min-w-[160px]"
          >
            <option value="">Tất cả tỉnh</option>
            {uniqueProvinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {filteredStores.map((store) => (
          <StoreItem
            key={store.id}
            store={store}
            onViewDetails={onOpenModal}
          />
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-outline-variant/20">
        <p className="text-on-surface-variant text-sm font-medium mb-4 sm:mb-0">
          Hiển thị <span className="text-on-surface font-bold">1-{filteredStores.length}</span> trên tổng số{" "}
          <span className="text-on-surface font-bold">{mockStores.length}</span> cửa hàng
        </p>
        <nav className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-on-primary font-bold shadow-md shadow-primary/20">
            1
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/30 text-on-surface hover:bg-surface-container-high transition-colors font-semibold">
            2
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/30 text-on-surface hover:bg-surface-container-high transition-colors font-semibold">
            3
          </button>
          <span className="px-2 text-on-surface-variant">...</span>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </nav>
      </div>
    </div>
  );
};
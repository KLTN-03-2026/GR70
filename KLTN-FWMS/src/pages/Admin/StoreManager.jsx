import { useState, useMemo } from "react";
import { StoreListSection } from "../../components/StoreListSection";
import { StoreDetailsModal } from "../../components/StoreDetailsModal";
import { mockStores } from "../../MockAPI/mockStores";

export const StoreManager = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  // Tính toán dữ liệu tổng quan để làm Dashboard đẹp hơn
  const stats = useMemo(() => {
    const total = mockStores.length;
    const active = mockStores.filter(s => s.status === "active").length;
    const revenue = mockStores.reduce((sum, s) => {
      // Giả sử annualRevenue là chuỗi "1.200.000.000 VNĐ", ta cần parse số
      const val = parseInt(s.annualRevenue?.replace(/\D/g, "") || 0);
      return sum + val;
    }, 0);

    return [
      { label: "Tổng cửa hàng", value: total, icon: "storefront", color: "text-blue-600", bg: "bg-blue-50" },
      { label: "Đang hoạt động", value: active, icon: "check_circle", color: "text-[#10BC5D]", bg: "bg-[#10BC5D]/10" },
      { label: "Tổng doanh thu năm", value: revenue.toLocaleString() + "đ", icon: "payments", color: "text-orange-600", bg: "bg-orange-50" },
      { label: "Tỉ lệ tăng trưởng", value: "+12.5%", icon: "trending_up", color: "text-purple-600", bg: "bg-purple-50" },
    ];
  }, []);

  const handleOpenModal = (store) => {
    setSelectedStore(store);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStore(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-8 lg:p-10 space-y-8">
      {/* Header Section: Chào hỏi & Action chính */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#141C21]">Quản lý hệ thống cửa hàng</h1>
          <p className="text-[#8B8B8B] text-sm">Theo dõi và quản lý hoạt động kinh doanh toàn hệ thống.</p>
        </div>
      </div>

      {/* Stats Grid: Giúp trang bớt trống và chuyên nghiệp hơn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-[#D1D1D1]/30 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              <span className="material-symbols-outlined">{stat.icon}</span>
            </div>
            <div>
              <p className="text-[#8B8B8B] text-xs font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-bold text-[#141C21]">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#D1D1D1]/30 overflow-hidden">
        <div className="p-1"> {/* Wrapper nhẹ để Table bên trong không bị dính border */}
          <StoreListSection onOpenModal={handleOpenModal} />
        </div>
      </div>

      {/* Modal chi tiết */}
      <StoreDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        store={selectedStore}
      />
    </div>
  );
};
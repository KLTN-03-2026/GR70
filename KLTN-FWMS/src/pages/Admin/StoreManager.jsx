import { useState, useEffect, useCallback } from "react";
import { StoreListSection } from "../../components/StoreListSection";
import { StoreDetailsModal } from "../../components/StoreDetailsModal";
import { getAllBrands, mapBrand } from "../../services/adminService";

export const StoreManager = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);

    // Stats từ API (trang 1, size lớn để tính tổng)
    const [stats, setStats] = useState([
        { label: "Tổng cửa hàng", value: "...", icon: "storefront", color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Đang hoạt động", value: "...", icon: "check_circle", color: "text-[#10BC5D]", bg: "bg-[#10BC5D]/10" },
        { label: "Tổng doanh thu năm", value: "...", icon: "payments", color: "text-orange-600", bg: "bg-orange-50" },
        { label: "Tỉ lệ tăng trưởng", value: "+12.5%", icon: "trending_up", color: "text-purple-600", bg: "bg-purple-50" },
    ]);

    // Fetch stats — lấy trang đầu size 100 để có overview
    const fetchStats = useCallback(async () => {
        try {
            const res = await getAllBrands({ page: 1, size: 100 });
            const inner = res?.data ?? res;
            const list = Array.isArray(inner?.data) ? inner.data
                : Array.isArray(inner) ? inner
                : [];
            const mapped = list.map(mapBrand);

            const totalCount = inner?.total ?? mapped.length;
            const activeCount = mapped.filter((s) => s.status === "active").length;
            const revenue = mapped.reduce((sum, s) => {
                const val = parseInt(s.annualRevenue?.replace(/\D/g, "") || 0);
                return sum + val;
            }, 0);

            setStats([
                { label: "Tổng cửa hàng", value: totalCount, icon: "storefront", color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Đang hoạt động", value: activeCount, icon: "check_circle", color: "text-[#10BC5D]", bg: "bg-[#10BC5D]/10" },
                { label: "Tổng doanh thu năm", value: revenue > 0 ? revenue.toLocaleString("vi-VN") + "đ" : "—", icon: "payments", color: "text-orange-600", bg: "bg-orange-50" },
                { label: "Tỉ lệ tăng trưởng", value: "+12.5%", icon: "trending_up", color: "text-purple-600", bg: "bg-purple-50" },
            ]);
        } catch (e) {
            console.error("Lỗi tải stats:", e);
        }
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    const handleOpenModal = (store) => {
        setSelectedStore(store);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedStore(null);
    };

    // Khi lock/unlock từ list → cập nhật stats
    const handleStatusChange = () => {
        fetchStats();
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-8 lg:p-10 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#141C21]">Quản lý hệ thống cửa hàng</h1>
                    <p className="text-[#8B8B8B] text-sm">Theo dõi và quản lý hoạt động kinh doanh toàn hệ thống.</p>
                </div>
            </div>

            {/* Stats Grid */}
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

            {/* Main Content */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#D1D1D1]/30 overflow-hidden">
                <div className="p-6">
                    <StoreListSection
                        onOpenModal={handleOpenModal}
                        onStatusChange={handleStatusChange}
                    />
                </div>
            </div>

            {/* Modal */}
            <StoreDetailsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                store={selectedStore}
                onStatusChange={handleStatusChange}
            />
        </div>
    );
};

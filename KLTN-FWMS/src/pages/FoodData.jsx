import React, { useEffect, useState } from "react";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";

const FoodData = () => {
    // ===== STATE =====
    const [foodData, setFoodData] = useState([]);
    const [totalDish, setTotalDish] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);

    // ===== FILTER STATE =====
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [appliedDate, setAppliedDate] = useState("");
    const [appliedCategoryId, setAppliedCategoryId] = useState("");

    // ===== PAGINATION STATE =====
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize] = useState(5);

    const API_BASE = "https://system-waste-less-ai.onrender.com/api";

    // ===== HELPER FUNCTIONS =====
    const sortByDateDesc = (data) => {
        return [...data].sort((a, b) => {
            const dateA = a.operation_date;
            const dateB = b.operation_date;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return new Date(dateB) - new Date(dateA);
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "N/A";
            return date.toLocaleDateString("vi-VN");
        } catch {
            return "N/A";
        }
    };

    const formatDateInput = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("vi-VN");
        } catch {
            return "N/A";
        }
    };

    const getCategoryName = (categoryId) => {
        if (!categoryId) return "Chưa phân loại";
        const category = categories.find((cat) => cat.id === categoryId);
        return category ? category.name : "Chưa phân loại";
    };

    // ===== FETCH CATEGORIES =====
    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Vui lòng đăng nhập lại");
                return;
            }

            const res = await fetch(`${API_BASE}/category-dishes`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setCategories(data.data || []);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách loại món:", error);
        }
    };

    // ===== FETCH DATA =====
    const fetchFoodData = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem("token");
            if (!token) {
                setError("Vui lòng đăng nhập lại");
                setLoading(false);
                return;
            }

            let url = `${API_BASE}/consumption/list-dishes-output-lastday?page=${currentPage}&size=${pageSize}`;
            if (appliedDate) url += `&operation_date=${appliedDate}`;
            if (appliedCategoryId) url += `&category=${appliedCategoryId}`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (data.success) {
                // ✅ LẤY TỔNG SUẤT ĂN TỪ API (sumDish)
                const totalDishes = data.data?.sumDish || 0;
                setTotalDish(totalDishes);

                let rawDishes = [];
                let totalRecords = 0;

                if (
                    data.data?.dishesOutput?.data &&
                    Array.isArray(data.data.dishesOutput.data)
                ) {
                    rawDishes = data.data.dishesOutput.data;
                    totalRecords =
                        data.data.dishesOutput.total || rawDishes.length;
                    const totalPagesFromAPI =
                        data.data.dishesOutput.totalPages || 1;
                    setTotalPages(
                        totalPagesFromAPI > 0 ? totalPagesFromAPI : 1,
                    );
                } else if (Array.isArray(data.data?.dishesOutput)) {
                    rawDishes = data.data.dishesOutput;
                    totalRecords = rawDishes.length;
                    setTotalPages(Math.ceil(totalRecords / pageSize));
                } else if (Array.isArray(data.data)) {
                    rawDishes = data.data;
                    totalRecords = rawDishes.length;
                    setTotalPages(Math.ceil(totalRecords / pageSize));
                }

                const processedDishes = rawDishes.map((item, idx) => ({
                    id: item.id || idx,
                    dishName:
                        item.dish?.name ||
                        item.dish_name ||
                        item.name ||
                        "Không có tên",
                    quantity_prepared:
                        item.quantity_prepared ?? item.prepared ?? 0,
                    quantity_wasted: item.quantity_wasted ?? item.wasted ?? 0,
                    waste_percentage:
                        item.waste_percentage ?? item.wastePercent ?? 0,
                    operation_date:
                        item.daily_operation?.operation_date ||
                        item.operation_date ||
                        item.date ||
                        null,
                }));

                // ✅ SẮP XẾP NGÀY MỚI NHẤT LÊN ĐẦU
                const sortedDishes = sortByDateDesc(processedDishes);
                setFoodData(sortedDishes);
                setTotalItems(totalRecords);
            } else {
                setError(data.message || "Không thể tải dữ liệu");
                setFoodData([]);
                setTotalDish(0);
                setTotalItems(0);
                setTotalPages(1);
            }
        } catch (error) {
            console.error("Lỗi fetch:", error);
            setError("Không thể kết nối đến server. Vui lòng thử lại sau.");
            setFoodData([]);
            setTotalDish(0);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    // ===== HANDLE FILTERS =====
    const handleApplyFilters = () => {
        setCurrentPage(1);
        setAppliedDate(selectedDate);
        setAppliedCategoryId(selectedCategoryId);
    };

    const handleResetFilters = () => {
        setSelectedDate("");
        setSelectedCategoryId("");
        setAppliedDate("");
        setAppliedCategoryId("");
        setCurrentPage(1);
        setError(null);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const hasActiveFilters = () => {
        return appliedDate !== "" || appliedCategoryId !== "";
    };

    // ===== EFFECTS =====
    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchFoodData();
    }, [currentPage, appliedDate, appliedCategoryId]);

    // ===== RENDER PAGINATION =====
    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const startItem = (currentPage - 1) * pageSize + 1;
        const endItem = Math.min(currentPage * pageSize, totalItems);

        const getPageNumbers = () => {
            const pages = [];
            const maxVisible = 5;
            if (totalPages <= maxVisible) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else if (currentPage <= 3) {
                for (let i = 1; i <= maxVisible; i++) pages.push(i);
            } else if (currentPage >= totalPages - 2) {
                for (let i = totalPages - maxVisible + 1; i <= totalPages; i++)
                    pages.push(i);
            } else {
                for (let i = currentPage - 2; i <= currentPage + 2; i++)
                    pages.push(i);
            }
            return pages;
        };

        return (
            <div className="px-5 py-4 border-t flex justify-between items-center">
                <p className="text-sm text-[#8b8b8b]">
                    Hiển thị {startItem}-{endItem} trên {totalItems} bản ghi
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-1.5 disabled:opacity-50 hover:bg-gray-100 rounded"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    {getPageNumbers().map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 rounded transition-colors ${currentPage === pageNum ? "bg-[#10bc5d] text-white" : "hover:bg-gray-100"}`}
                        >
                            {pageNum}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-1.5 disabled:opacity-50 hover:bg-gray-100 rounded"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="p-2 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="mb-2">
                    <span className="text-sm text-[#8B8B8B] tracking-wider">
                        FWMS
                    </span>
                    <span className="text-sm text-[#8B8B8B] ml-1">
                        MANAGEMENT SYSTEM
                    </span>
                </div>
                <h2 className="text-3xl font-bold text-[#141C21] mb-2">
                    Dữ liệu món ăn (Món ra & Món dư)
                </h2>
                <p className="text-base text-[#8B8B8B]">
                    Theo dõi và phân tích dữ liệu tiêu thụ từng món ăn trong nhà
                    bếp.
                </p>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <p className="text-sm text-[#8B8B8B] mb-2">
                    Trạng thái món ăn phục vụ
                </p>
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-[#141C21]">
                            {loading ? "..." : totalDish.toLocaleString()}
                        </span>
                        <span className="text-base text-[#141C21]">Suất</span>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
                <h3 className="text-base font-semibold text-[#141C21] mb-4">
                    Bộ lọc tìm kiếm
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-2">
                            Chọn ngày
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#10BC5D] w-full"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-2">
                            Loại món
                        </label>
                        <select
                            value={selectedCategoryId}
                            onChange={(e) =>
                                setSelectedCategoryId(e.target.value)
                            }
                            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#10BC5D] w-full"
                        >
                            <option value="">Tất cả loại món</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleApplyFilters}
                            className="flex items-center justify-center gap-2 bg-[#10BC5D] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-600"
                        >
                            <Filter size={16} /> Lọc dữ liệu
                        </button>
                        {hasActiveFilters() && (
                            <button
                                onClick={handleResetFilters}
                                className="px-6 py-2.5 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50"
                            >
                                Xóa lọc
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-1">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="py-4 px-5 text-left text-sm font-bold text-[#141C21]">
                                NGÀY
                            </th>
                            <th className="py-4 px-5 text-left text-sm font-bold text-[#141C21]">
                                TÊN MÓN
                            </th>
                            <th className="py-4 px-5 text-left text-sm font-bold text-[#141C21]">
                                SL RA
                            </th>
                            <th className="py-4 px-5 text-left text-sm font-bold text-[#141C21]">
                                SL DƯ
                            </th>
                            <th className="py-4 px-5 text-left text-sm font-bold text-[#141C21]">
                                % DƯ
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center py-8">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#10BC5D] mx-auto"></div>
                                    <span className="text-gray-500">
                                        Đang tải...
                                    </span>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="text-center py-8 text-red-500"
                                >
                                    ⚠️ {error}
                                    <button
                                        onClick={() => fetchFoodData()}
                                        className="block mx-auto mt-2 text-[#10BC5D] underline"
                                    >
                                        Thử lại
                                    </button>
                                </td>
                            </tr>
                        ) : foodData.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-8">
                                    <div className="text-gray-500">
                                        <p className="text-lg mb-2">
                                            Không có dữ liệu
                                        </p>
                                        {hasActiveFilters() && (
                                            <p className="text-sm text-gray-400">
                                                {appliedCategoryId &&
                                                    `Không có món nào thuộc loại "${getCategoryName(appliedCategoryId)}"`}
                                                {appliedCategoryId &&
                                                    appliedDate &&
                                                    " vào "}
                                                {appliedDate &&
                                                    `ngày ${formatDateInput(appliedDate)}`}
                                            </p>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            foodData.map((row, index) => {
                                const wastePercent = row.waste_percentage || 0;
                                const isHighWaste = wastePercent > 20;
                                return (
                                    <tr
                                        key={row.id || index}
                                        className="border-b hover:bg-gray-50"
                                    >
                                        <td className="py-4 px-5 text-sm text-gray-600">
                                            {formatDate(row.operation_date)}
                                        </td>
                                        <td className="py-4 px-5 text-sm font-medium text-gray-800">
                                            {row.dishName}
                                        </td>
                                        <td className="py-4 px-5 text-sm text-gray-600">
                                            {row.quantity_prepared.toLocaleString()}{" "}
                                            suất
                                        </td>
                                        <td className="py-4 px-5 text-sm text-gray-600">
                                            {row.quantity_wasted.toLocaleString()}{" "}
                                            suất
                                        </td>
                                        <td
                                            className={`py-4 px-5 text-sm font-bold ${isHighWaste ? "text-red-500" : "text-gray-700"}`}
                                        >
                                            {wastePercent}%
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-auto">
                {!loading && !error && totalItems > 0 && renderPagination()}
            </div>
        </div>
    );
};

export default FoodData;

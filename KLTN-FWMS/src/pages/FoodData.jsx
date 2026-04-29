import React, { useEffect, useState } from "react";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";

const FoodData = () => {
    // ===== STATE =====
    const [allFoodData, setAllFoodData] = useState([]); // Lưu toàn bộ dữ liệu
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

    // Lấy ngày hiện tại theo định dạng YYYY-MM-DD
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // ===== FETCH CATEGORIES =====
    useEffect(() => {
        fetchCategories();
        fetchAllFoodData(); // Load tất cả dữ liệu ban đầu
    }, []);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `https://system-waste-less-ai.onrender.com/api/category-dishes`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            const data = await res.json();
            if (data.success) {
                setCategories(data.data || []);
                console.log("Categories loaded:", data.data);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách loại món:", error);
        }
    };

    // Hàm lấy tất cả dữ liệu (không filter)
    const fetchAllFoodData = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem("token");
            // Lấy nhiều dữ liệu để có đủ cho filter
            let url = `https://system-waste-less-ai.onrender.com/api/consumption/list-dishes-output-lastday?page=1&size=1000`;

            console.log("Fetching all data from:", url);

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            console.log("All Data Response:", data);

            if (data.success) {
                let dishesArray = [];

                if (
                    data.data?.dishesOutput?.data &&
                    Array.isArray(data.data.dishesOutput.data)
                ) {
                    dishesArray = data.data.dishesOutput.data;
                } else if (Array.isArray(data.data?.dishesOutput)) {
                    dishesArray = data.data.dishesOutput;
                } else if (Array.isArray(data.data)) {
                    dishesArray = data.data;
                } else {
                    dishesArray = [];
                }

                setAllFoodData(dishesArray);

                // Hiển thị tất cả dữ liệu ban đầu
                setFoodData(dishesArray);
                const sumDish = dishesArray.reduce(
                    (sum, item) => sum + (item.quantity_prepared || 0),
                    0,
                );
                setTotalDish(sumDish);

                // Cập nhật phân trang
                const total = dishesArray.length;
                const pages = Math.ceil(total / pageSize);
                setTotalItems(total);
                setTotalPages(pages);
                setCurrentPage(1);
            } else {
                setError(data.message || "Không thể tải dữ liệu");
                setAllFoodData([]);
                setFoodData([]);
                setTotalItems(0);
                setTotalPages(1);
            }
        } catch (error) {
            console.error("Lỗi API:", error);
            setError("Không thể kết nối đến server. Vui lòng thử lại sau.");
            setAllFoodData([]);
            setFoodData([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    // Hàm lọc dữ liệu từ allFoodData
    const applyFilters = () => {
        setLoading(true);

        let filtered = [...allFoodData];

        // Lọc theo ngày (nếu có)
        if (appliedDate) {
            filtered = filtered.filter((item) => {
                const operationDate =
                    item.daily_operation?.operation_date || "";
                return (
                    operationDate && operationDate.split("T")[0] === appliedDate
                );
            });
        }

        // Lọc theo category (nếu có)
        if (appliedCategoryId) {
            filtered = filtered.filter((item) => {
                return item.dish?.category_id === appliedCategoryId;
            });
        }

        console.log(`Filtered: ${filtered.length} records`);

        setFoodData(filtered);

        // Tính tổng số suất
        const sumDish = filtered.reduce(
            (sum, item) => sum + (item.quantity_prepared || 0),
            0,
        );
        setTotalDish(sumDish);

        // Cập nhật phân trang
        const total = filtered.length;
        const pages = Math.ceil(total / pageSize);
        setTotalItems(total);
        setTotalPages(pages);
        setCurrentPage(1);

        setLoading(false);
    };

    // Khi appliedDate hoặc appliedCategoryId thay đổi, áp dụng filter
    useEffect(() => {
        if (allFoodData.length > 0) {
            applyFilters();
        }
    }, [appliedDate, appliedCategoryId, allFoodData]);

    // ===== HANDLE FILTER =====
    const handleApplyFilters = () => {
        setAppliedDate(selectedDate);
        setAppliedCategoryId(selectedCategoryId);
    };

    const handleResetFilters = () => {
        // Reset input về trạng thái ban đầu
        setSelectedDate(""); // Xóa ngày đã chọn trên input
        setSelectedCategoryId("");
        // Reset applied filter về rỗng để hiển thị TẤT CẢ dữ liệu
        setAppliedDate("");
        setAppliedCategoryId("");
        setCurrentPage(1);
    };

    // ===== PAGINATION FUNCTIONS =====
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Lấy dữ liệu cho trang hiện tại
    const getCurrentPageData = () => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return foodData.slice(startIndex, endIndex);
    };

    const getCategoryName = (categoryId) => {
        if (!categoryId) return "Chưa phân loại";
        const category = categories.find((cat) => cat.id === categoryId);
        return category ? category.name : "Chưa phân loại";
    };

    const formatDateInput = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "N/A";
            return date.toLocaleDateString("vi-VN");
        } catch (error) {
            return "N/A";
        }
    };

    // ===== RENDER PAGINATION =====
    const renderPagination = () => {
        if (totalPages <= 1 && totalItems <= pageSize) {
            return null;
        }

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
                        className="p-1.5 disabled:opacity-50 hover:bg-gray-100 rounded transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    {getPageNumbers().map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 rounded transition-colors ${
                                currentPage === pageNum
                                    ? "bg-[#10bc5d] text-white"
                                    : "hover:bg-gray-100"
                            }`}
                        >
                            {pageNum}
                        </button>
                    ))}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-1.5 disabled:opacity-50 hover:bg-gray-100 rounded transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "N/A";
            return date.toLocaleDateString("vi-VN");
        } catch (error) {
            return "N/A";
        }
    };

    // Kiểm tra có filter đang áp dụng không
    const hasActiveFilters = () => {
        return appliedDate !== "" || appliedCategoryId !== "";
    };

    const currentPageData = getCurrentPageData();

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
                    {/* Ô chọn ngày */}
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

                    {/* Select loại món */}
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

                    {/* Nhóm nút bấm */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleApplyFilters}
                            className="flex items-center justify-center gap-2 bg-[#10BC5D] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors whitespace-nowrap"
                        >
                            <Filter size={16} />
                            Lọc dữ liệu
                        </button>
                        {hasActiveFilters() && (
                            <button
                                onClick={handleResetFilters}
                                className="px-6 py-2.5 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors whitespace-nowrap"
                            >
                                Xóa lọc
                            </button>
                        )}
                    </div>
                </div>

                {/* Hiển thị filter đang áp dụng */}
                {hasActiveFilters() && (
                    <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                        <span className="text-sm text-gray-500">
                            Đang lọc theo:
                        </span>
                        {appliedDate && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                                Ngày: {formatDateInput(appliedDate)}
                            </span>
                        )}
                        {appliedCategoryId && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs">
                                Loại: {getCategoryName(appliedCategoryId)}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Table Container */}
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
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#10BC5D]"></div>
                                        <span className="text-gray-500">
                                            Đang tải dữ liệu...
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan="5" className="text-center py-8">
                                    <div className="text-red-500 mb-2">
                                        {error}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setCurrentPage(1);
                                            fetchAllFoodData();
                                        }}
                                        className="text-[#10BC5D] underline hover:text-green-600"
                                    >
                                        Thử lại
                                    </button>
                                </td>
                            </tr>
                        ) : currentPageData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="text-center py-8 text-gray-500"
                                >
                                    {appliedCategoryId && appliedDate
                                        ? `Không có món ăn nào thuộc loại "${getCategoryName(appliedCategoryId)}" cho ngày ${formatDateInput(appliedDate)}`
                                        : appliedCategoryId
                                          ? `Không có món ăn nào thuộc loại "${getCategoryName(appliedCategoryId)}"`
                                          : appliedDate
                                            ? `Không có dữ liệu cho ngày ${formatDateInput(appliedDate)}`
                                            : "Không có dữ liệu"}
                                </td>
                            </tr>
                        ) : (
                            currentPageData.map((row, index) => {
                                const operationDate =
                                    row.daily_operation?.operation_date || "";
                                const dishName = row.dish?.name || "N/A";
                                const quantityPrepared =
                                    row.quantity_prepared || 0;
                                const quantityWasted = row.quantity_wasted || 0;
                                const wastePercent =
                                    row.waste_percentage !== undefined &&
                                    row.waste_percentage !== null
                                        ? row.waste_percentage
                                        : 0;
                                const isHighWaste = wastePercent > 20;

                                return (
                                    <tr
                                        key={row.id || index}
                                        className="border-b hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-4 px-5 text-sm text-gray-600">
                                            {formatDate(operationDate)}
                                        </td>
                                        <td className="py-4 px-5 text-sm font-medium text-gray-800">
                                            {dishName}
                                        </td>
                                        <td className="py-4 px-5 text-sm text-gray-600">
                                            {quantityPrepared.toLocaleString()}{" "}
                                            suất
                                        </td>
                                        <td className="py-4 px-5 text-sm text-gray-600">
                                            {quantityWasted.toLocaleString()}{" "}
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

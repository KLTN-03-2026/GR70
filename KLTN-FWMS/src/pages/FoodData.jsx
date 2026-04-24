import React, { useEffect, useState } from "react";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";

const FoodData = () => {
    // ===== STATE =====
    const [foodData, setFoodData] = useState([]);
    const [totalDish, setTotalDish] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterError, setFilterError] = useState(""); // State cho lỗi filter
    const [categories, setCategories] = useState([]);

    // ===== FILTER STATE =====
    const [filters, setFilters] = useState({
        date: "",
        month: "",
        categoryId: "",
    });

    // State lưu filter đã áp dụng
    const [appliedFilters, setAppliedFilters] = useState({
        date: "",
        month: "",
        categoryId: "",
    });

    // ===== PAGINATION STATE =====
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize] = useState(5);

    // Kiểm tra ngày có nằm trong tháng đã chọn không
    const isDateInMonth = (date, month) => {
        if (!date || !month) return true;
        return date.startsWith(month);
    };

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
        // Set ngày hiện tại làm filter mặc định
        const today = getTodayDate();
        setFilters((prev) => ({ ...prev, date: today }));
        setAppliedFilters((prev) => ({ ...prev, date: today }));
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

    // ===== CALL API =====
    useEffect(() => {
        // Kiểm tra tính hợp lệ trước khi gọi API
        if (appliedFilters.date && appliedFilters.month) {
            if (!isDateInMonth(appliedFilters.date, appliedFilters.month)) {
                setFilterError(
                    `Ngày ${formatDateInput(appliedFilters.date)} không nằm trong tháng đã chọn (${appliedFilters.month})`,
                );
                setFoodData([]);
                setTotalItems(0);
                setTotalPages(1);
                setTotalDish(0);
                setLoading(false);
                return;
            }
        }
        setFilterError("");
        fetchFoodData();
    }, [currentPage, appliedFilters]);

    const fetchFoodData = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem("token");
            let url = `https://system-waste-less-ai.onrender.com/api/consumption/list-dishes-output-lastday?page=${currentPage}&size=${pageSize}`;

            // Ưu tiên lọc theo ngày nếu có, nếu không thì lọc theo tháng
            if (appliedFilters.date) {
                url += `&operation_date=${appliedFilters.date}`;
            } else if (appliedFilters.month) {
                url += `&month=${appliedFilters.month}`;
            }

            // GỬI CATEGORY ID LÊN API
            if (appliedFilters.categoryId) {
                url += `&category=${appliedFilters.categoryId}`;
            }

            console.log("Calling API with params:", {
                page: currentPage,
                size: pageSize,
                operation_date: appliedFilters.date || undefined,
                month: appliedFilters.month || undefined,
                category: appliedFilters.categoryId || undefined,
            });
            console.log("Full URL:", url);

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            console.log("API Response:", data);

            if (data.success) {
                let dishesArray = [];
                let totalItemsFromAPI = 0;
                let totalPagesFromAPI = 1;
                let sumDish = 0;

                if (
                    data.data?.dishesOutput?.data &&
                    Array.isArray(data.data.dishesOutput.data)
                ) {
                    dishesArray = data.data.dishesOutput.data;
                    totalItemsFromAPI = data.data.dishesOutput.total || 0;
                    totalPagesFromAPI = data.data.dishesOutput.totalPages || 1;
                    sumDish = data.data.sumDish || 0;

                    console.log(
                        "Filtered by API - Total items:",
                        totalItemsFromAPI,
                    );
                    console.log(
                        "Filtered by API - Dishes count:",
                        dishesArray.length,
                    );
                    console.log("Total pages:", totalPagesFromAPI);
                } else if (Array.isArray(data.data?.dishesOutput)) {
                    dishesArray = data.data.dishesOutput;
                    totalItemsFromAPI = dishesArray.length;
                    totalPagesFromAPI = Math.ceil(
                        dishesArray.length / pageSize,
                    );
                    sumDish = data.data.sumDish || 0;
                } else if (Array.isArray(data.data)) {
                    dishesArray = data.data;
                    totalItemsFromAPI = dishesArray.length;
                    totalPagesFromAPI = Math.ceil(
                        dishesArray.length / pageSize,
                    );
                    sumDish = dishesArray.reduce(
                        (sum, item) => sum + (item.quantity_prepared || 0),
                        0,
                    );
                } else {
                    dishesArray = [];
                    totalItemsFromAPI = 0;
                    totalPagesFromAPI = 1;
                    sumDish = 0;
                }

                // Lọc thủ công nếu có cả date và month (đã kiểm tra hợp lệ ở trên)
                let filteredData = [...dishesArray];

                if (appliedFilters.date && appliedFilters.month) {
                    // Lọc theo ngày cụ thể
                    filteredData = filteredData.filter((item) => {
                        const itemDate =
                            item.daily_operation?.operation_date || "";
                        return (
                            itemDate &&
                            itemDate.split("T")[0] === appliedFilters.date
                        );
                    });
                    totalItemsFromAPI = filteredData.length;
                    totalPagesFromAPI = Math.ceil(
                        filteredData.length / pageSize,
                    );
                }

                setFoodData(filteredData);
                setTotalDish(sumDish);
                setTotalItems(totalItemsFromAPI);
                setTotalPages(totalPagesFromAPI);
            } else {
                setError(data.message || "Không thể tải dữ liệu");
                setFoodData([]);
                setTotalItems(0);
                setTotalPages(1);
            }
        } catch (error) {
            console.error("Lỗi API:", error);
            setError("Không thể kết nối đến server. Vui lòng thử lại sau.");
            setFoodData([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    // ===== HANDLE FILTER CHANGE =====
    const handleFilterChange = (filterName, value) => {
        // Không tự động clear cái kia nữa, cho phép chọn cả hai
        setFilters((prev) => ({
            ...prev,
            [filterName]: value,
        }));

        // Xóa lỗi filter khi người dùng thay đổi
        if (filterError) setFilterError("");
    };

    const handleApplyFilters = () => {
        // Kiểm tra tính hợp lệ trước khi áp dụng
        if (filters.date && filters.month) {
            if (!isDateInMonth(filters.date, filters.month)) {
                setFilterError(
                    `Ngày ${formatDateInput(filters.date)} không nằm trong tháng ${filters.month}`,
                );
                return;
            }
        }

        setFilterError("");
        setAppliedFilters({
            date: filters.date,
            month: filters.month,
            categoryId: filters.categoryId,
        });
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        const today = getTodayDate();
        setFilters({
            date: today,
            month: "",
            categoryId: "",
        });
        setAppliedFilters({
            date: today,
            month: "",
            categoryId: "",
        });
        setFilterError("");
        setCurrentPage(1);
    };

    // ===== PAGINATION FUNCTIONS =====
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            console.log("Changing to page:", newPage);
            setCurrentPage(newPage);
        }
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
                    <span className="text-sm text-[#10BC5D] bg-green-50 px-4 py-2 rounded-full font-medium">
                        Dữ liệu hôm nay
                    </span>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-base font-semibold text-[#141C21] mb-4">
                    Bộ lọc tìm kiếm
                </h3>

                {/* Hiển thị lỗi filter */}
                {filterError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        ⚠️ {filterError}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <input
                            type="date"
                            value={filters.date}
                            onChange={(e) =>
                                handleFilterChange("date", e.target.value)
                            }
                            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#10BC5D] w-full"
                        />
                        {filters.date &&
                            filters.month &&
                            !isDateInMonth(filters.date, filters.month) && (
                                <div className="absolute -top-2 left-2 text-xs text-red-600 bg-red-50 px-2 rounded whitespace-nowrap">
                                    ⚠️ Ngày không hợp lệ
                                </div>
                            )}
                    </div>
                    <div className="relative">
                        <select
                            value={filters.month}
                            onChange={(e) =>
                                handleFilterChange("month", e.target.value)
                            }
                            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#10BC5D] w-full"
                        >
                            <option value="">Tất cả tháng</option>
                            <option value="2026-01">Tháng 1/2026</option>
                            <option value="2026-02">Tháng 2/2026</option>
                            <option value="2026-03">Tháng 3/2026</option>
                            <option value="2026-04">Tháng 4/2026</option>
                            <option value="2026-05">Tháng 5/2026</option>
                            <option value="2026-06">Tháng 6/2026</option>
                            <option value="2026-07">Tháng 7/2026</option>
                            <option value="2026-08">Tháng 8/2026</option>
                            <option value="2026-09">Tháng 9/2026</option>
                            <option value="2026-10">Tháng 10/2026</option>
                            <option value="2026-11">Tháng 11/2026</option>
                            <option value="2026-12">Tháng 12/2026</option>
                        </select>
                    </div>
                    <select
                        value={filters.categoryId}
                        onChange={(e) =>
                            handleFilterChange("categoryId", e.target.value)
                        }
                        className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#10BC5D]"
                    >
                        <option value="">Tất cả loại món</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <div className="flex gap-2">
                        <button
                            onClick={handleApplyFilters}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#10BC5D] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                        >
                            <Filter size={16} />
                            Lọc dữ liệu
                        </button>
                        {(appliedFilters.date !== getTodayDate() ||
                            appliedFilters.month ||
                            appliedFilters.categoryId) && (
                            <button
                                onClick={handleResetFilters}
                                className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                                Xóa lọc
                            </button>
                        )}
                    </div>
                </div>

                {/* Hiển thị filter đang áp dụng */}
                {(appliedFilters.date !== getTodayDate() ||
                    appliedFilters.month ||
                    appliedFilters.categoryId) && (
                    <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                        <span className="text-sm text-gray-500">
                            Đang lọc theo:
                        </span>
                        {appliedFilters.date &&
                            appliedFilters.date !== getTodayDate() && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                                    Ngày: {formatDate(appliedFilters.date)}
                                    <button
                                        onClick={() => {
                                            setAppliedFilters((prev) => ({
                                                ...prev,
                                                date: "",
                                            }));
                                            setFilters((prev) => ({
                                                ...prev,
                                                date: "",
                                            }));
                                            setCurrentPage(1);
                                        }}
                                        className="ml-1 hover:text-blue-900"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                        {appliedFilters.month && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs">
                                Tháng: {appliedFilters.month}
                                <button
                                    onClick={() => {
                                        setAppliedFilters((prev) => ({
                                            ...prev,
                                            month: "",
                                        }));
                                        setFilters((prev) => ({
                                            ...prev,
                                            month: "",
                                        }));
                                        setCurrentPage(1);
                                    }}
                                    className="ml-1 hover:text-green-900"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {appliedFilters.categoryId && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs">
                                Loại:{" "}
                                {getCategoryName(appliedFilters.categoryId)}
                                <button
                                    onClick={() => {
                                        setAppliedFilters((prev) => ({
                                            ...prev,
                                            categoryId: "",
                                        }));
                                        setFilters((prev) => ({
                                            ...prev,
                                            categoryId: "",
                                        }));
                                        setCurrentPage(1);
                                    }}
                                    className="ml-1 hover:text-purple-900"
                                >
                                    ×
                                </button>
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
                                            fetchFoodData();
                                        }}
                                        className="text-[#10BC5D] underline hover:text-green-600"
                                    >
                                        Thử lại
                                    </button>
                                </td>
                            </tr>
                        ) : foodData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="text-center py-8 text-gray-500"
                                >
                                    {appliedFilters.date && appliedFilters.month
                                        ? `Không có dữ liệu cho ngày ${formatDateInput(appliedFilters.date)} trong tháng ${appliedFilters.month}`
                                        : appliedFilters.categoryId
                                          ? `Không có món ăn nào thuộc loại "${getCategoryName(appliedFilters.categoryId)}"`
                                          : appliedFilters.date
                                            ? `Không có dữ liệu cho ngày ${formatDateInput(appliedFilters.date)}`
                                            : appliedFilters.month
                                              ? `Không có dữ liệu cho tháng ${appliedFilters.month}`
                                              : "Không có dữ liệu"}
                                </td>
                            </tr>
                        ) : (
                            foodData.map((row, index) => {
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
                        {/* Thêm các hàng trống để giữ chiều cao cố định khi ít data */}
                        {!loading &&
                            !error &&
                            foodData.length > 0 &&
                            foodData.length < pageSize && (
                                <>
                                    {Array.from({
                                        length: pageSize - foodData.length,
                                    }).map((_, idx) => (
                                        <tr
                                            key={`empty-${idx}`}
                                            className="border-b"
                                        >
                                            <td
                                                colSpan="5"
                                                className="py-4 px-5"
                                            >
                                                &nbsp;
                                            </td>
                                        </tr>
                                    ))}
                                </>
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

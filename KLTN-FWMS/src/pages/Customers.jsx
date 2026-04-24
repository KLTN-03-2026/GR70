import React, { useEffect, useState } from "react";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";

const Customers = () => {
    // ===== STATE =====
    const [summary, setSummary] = useState({
        current_month_total: 0,
        previous_month_total: 0,
        percentage_change: 0,
    });

    const [customerData, setCustomerData] = useState([]);
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [loadingTable, setLoadingTable] = useState(true);
    const [error, setError] = useState(null);
    const [filterError, setFilterError] = useState(""); // State cho lỗi filter

    // ===== FILTER STATE =====
    const [filters, setFilters] = useState({
        date: "",
        month: "",
    });

    // State lưu filter đã áp dụng
    const [appliedFilters, setAppliedFilters] = useState({
        date: "",
        month: "",
    });

    // ===== PAGINATION STATE =====
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize] = useState(10);

    // Lấy ngày hiện tại
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // Kiểm tra ngày có nằm trong tháng đã chọn không
    const isDateInMonth = (date, month) => {
        if (!date || !month) return true;
        return date.startsWith(month);
    };

    // ===== CALL API =====
    useEffect(() => {
        fetchSummary();
    }, []);

    useEffect(() => {
        if (appliedFilters.date || appliedFilters.month) {
            // Kiểm tra tính hợp lệ trước khi gọi API
            if (appliedFilters.date && appliedFilters.month) {
                if (!isDateInMonth(appliedFilters.date, appliedFilters.month)) {
                    setFilterError(
                        `Ngày ${formatDateInput(appliedFilters.date)} không nằm trong tháng đã chọn (${appliedFilters.month})`,
                    );
                    setCustomerData([]);
                    setTotalItems(0);
                    setTotalPages(1);
                    setLoadingTable(false);
                    return;
                }
            }
            setFilterError("");
        }
        fetchCustomers();
    }, [currentPage, appliedFilters]);

    // 👉 API 1: Stats
    const fetchSummary = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(
                "https://system-waste-less-ai.onrender.com/api/consumption/sum-customer-as-last-month",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            const data = await res.json();

            if (data.success) {
                setSummary(data.data);
            }
        } catch (error) {
            console.error("Lỗi summary:", error);
        } finally {
            setLoadingSummary(false);
        }
    };

    // 👉 API 2: Table với filter
    const fetchCustomers = async () => {
        try {
            setLoadingTable(true);
            setError(null);

            const token = localStorage.getItem("token");

            // Xây dựng URL dựa trên filter đã áp dụng
            let url = `https://system-waste-less-ai.onrender.com/api/consumption/list-customer-in-month?page=${currentPage}&size=${pageSize}`;

            // Ưu tiên lọc theo ngày nếu có, nếu không thì lọc theo tháng
            if (appliedFilters.date) {
                url += `&operation_date=${appliedFilters.date}`;
            } else if (appliedFilters.month) {
                url += `&month=${appliedFilters.month}`;
            }

            console.log("Calling API:", url);

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            console.log("API Response:", data);

            if (data.success) {
                let customersArray = [];
                let totalItemsFromAPI = 0;
                let totalPagesFromAPI = 1;

                if (data.data?.data && Array.isArray(data.data.data)) {
                    customersArray = data.data.data;
                    totalItemsFromAPI = data.data.total || 0;
                    totalPagesFromAPI = data.data.totalPages || 1;
                } else if (Array.isArray(data.data)) {
                    customersArray = data.data;
                    totalItemsFromAPI = customersArray.length;
                    totalPagesFromAPI = Math.ceil(
                        customersArray.length / pageSize,
                    );
                } else {
                    customersArray = [];
                    totalItemsFromAPI = 0;
                    totalPagesFromAPI = 1;
                }

                // Lọc thủ công nếu có cả date và month (đã kiểm tra hợp lệ ở trên)
                let filteredData = [...customersArray];

                if (appliedFilters.date && appliedFilters.month) {
                    // Lọc theo ngày cụ thể
                    filteredData = filteredData.filter((item) => {
                        const itemDate =
                            item.operation_date || item.date || item.createdAt;
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

                setCustomerData(filteredData);
                setTotalItems(totalItemsFromAPI);
                setTotalPages(totalPagesFromAPI);
            } else {
                setError(data.message || "Không thể tải dữ liệu");
                setCustomerData([]);
                setTotalItems(0);
                setTotalPages(1);
            }
        } catch (error) {
            console.error("Lỗi table:", error);
            setError("Không thể kết nối đến server. Vui lòng thử lại sau.");
            setCustomerData([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setLoadingTable(false);
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
        });
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        setFilters({
            date: "",
            month: "",
        });
        setAppliedFilters({
            date: "",
            month: "",
        });
        setFilterError("");
        setCurrentPage(1);
    };

    // ===== PAGINATION FUNCTIONS =====
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const formatDate = (row) => {
        const rawDate =
            row.operation_date || row.date || row.createdAt || row.day;
        if (!rawDate) return "Không hợp lệ";
        if (!isNaN(Date.parse(rawDate))) {
            return new Date(rawDate).toLocaleDateString("vi-VN");
        }
        return "Không hợp lệ";
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

    return (
        <div className="p-8 max-w-6xl mx-auto">
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
                    Quản lý số lượng khách hàng
                </h2>
                <p className="text-base text-[#8B8B8B]">
                    Theo dõi và phân tích dữ liệu số lượng khách hàng phục vụ.
                </p>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <p className="text-sm text-[#8B8B8B] mb-2">
                    Tổng số khách trong tháng
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-5xl font-bold text-[#141C21]">
                        {loadingSummary
                            ? "..."
                            : summary.current_month_total?.toLocaleString() ||
                              0}
                    </span>

                    <span
                        className={`text-sm px-4 py-2 rounded-full font-medium ${
                            summary.percentage_change >= 0
                                ? "text-[#10BC5D] bg-green-50"
                                : "text-red-500 bg-red-50"
                        }`}
                    >
                        {summary.percentage_change >= 0 ? "+" : ""}
                        {summary.percentage_change || 0}% so với tháng trước
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <div className="flex gap-2">
                        <button
                            onClick={handleApplyFilters}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#10BC5D] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                        >
                            <Filter size={16} />
                            Lọc dữ liệu
                        </button>
                        {(appliedFilters.date || appliedFilters.month) && (
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
                {(appliedFilters.date || appliedFilters.month) && (
                    <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                        <span className="text-sm text-gray-500">
                            Đang lọc theo:
                        </span>
                        {appliedFilters.date && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs">
                                Ngày: {formatDateInput(appliedFilters.date)}
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
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left py-4 px-5 text-sm font-bold text-[#3D3D3D]">
                                    Ngày
                                </th>
                                <th className="text-left py-4 px-5 text-sm font-bold text-[#3D3D3D]">
                                    Số Lượng Khách
                                </th>
                                <th className="text-left py-4 px-5 text-sm font-bold text-[#3D3D3D]">
                                    Doanh Thu
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loadingTable ? (
                                <tr>
                                    <td
                                        colSpan="3"
                                        className="text-center py-8"
                                    >
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
                                    <td
                                        colSpan="3"
                                        className="text-center py-8"
                                    >
                                        <div className="text-red-500 mb-2">
                                            {error}
                                        </div>
                                        <button
                                            onClick={() => {
                                                setCurrentPage(1);
                                                fetchCustomers();
                                            }}
                                            className="text-[#10BC5D] underline hover:text-green-600"
                                        >
                                            Thử lại
                                        </button>
                                    </td>
                                </tr>
                            ) : customerData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="3"
                                        className="text-center py-8 text-gray-500"
                                    >
                                        {appliedFilters.date &&
                                        appliedFilters.month
                                            ? `Không có dữ liệu cho ngày ${formatDateInput(appliedFilters.date)} trong tháng ${appliedFilters.month}`
                                            : appliedFilters.date
                                              ? `Không có dữ liệu cho ngày ${formatDateInput(appliedFilters.date)}`
                                              : appliedFilters.month
                                                ? `Không có dữ liệu cho tháng ${appliedFilters.month}`
                                                : "Không có dữ liệu"}
                                    </td>
                                </tr>
                            ) : (
                                customerData.map((row, index) => (
                                    <tr
                                        key={index}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-4 px-5 text-sm text-[#141C21]">
                                            {formatDate(row)}
                                        </td>
                                        <td className="py-4 px-5 text-sm text-[#141C21] font-medium">
                                            {row.quantity ??
                                                row.customer_count ??
                                                row.total_customers ??
                                                0}
                                        </td>
                                        <td className="py-4 px-5 text-sm text-[#141C21]">
                                            {row.total_revenue
                                                ? `${row.total_revenue.toLocaleString()}đ`
                                                : "-"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {!loadingTable && !error && totalItems > 0 && renderPagination()}
        </div>
    );
};

export default Customers;

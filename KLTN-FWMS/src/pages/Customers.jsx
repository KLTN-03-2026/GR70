import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Filter, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

const Customers = () => {
    // ===== STATE =====
    const [summary, setSummary] = useState({
        current_month_total: 0,
        previous_month_total: 0,
        percentage_change: 0,
    });

    const [allCustomerData, setAllCustomerData] = useState([]);
    const [customerData, setCustomerData] = useState([]);
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [loadingTable, setLoadingTable] = useState(true);
    const [error, setError] = useState(null);
    const [sortOrder, setSortOrder] = useState("desc"); // "desc" = mới nhất, "asc" = cũ nhất

    // ===== FILTER & SORT STATE =====
    const [selectedDate, setSelectedDate] = useState("");
    const [appliedDate, setAppliedDate] = useState("");

    // ===== PAGINATION STATE =====
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize] = useState(10);

    // ===== HELPER FUNCTIONS =====
    // Lấy ngày từ row data
    const getDateFromRow = useCallback((row) => {
        return row.operation_date || row.date || row.createdAt || row.day;
    }, []);

    // Format ngày để so sánh (YYYY-MM-DD)
    const formatDateForCompare = useCallback((dateString) => {
        if (!dateString) return "";
        if (dateString.includes("T")) return dateString.split("T")[0];
        if (dateString.includes(" ")) return dateString.split(" ")[0];
        return dateString;
    }, []);

    // Sắp xếp dữ liệu theo ngày
    const sortDataByDate = useCallback(
        (data, order = "desc") => {
            return [...data].sort((a, b) => {
                const dateA = getDateFromRow(a);
                const dateB = getDateFromRow(b);

                if (!dateA && !dateB) return 0;
                if (!dateA) return 1;
                if (!dateB) return -1;

                const timeA = new Date(dateA).getTime();
                const timeB = new Date(dateB).getTime();

                return order === "desc" ? timeB - timeA : timeA - timeB;
            });
        },
        [getDateFromRow],
    );

    // Lọc dữ liệu theo ngày (FE)
    const filterDataByDate = useCallback(() => {
        let filtered = [];

        if (!appliedDate) {
            filtered = allCustomerData;
        } else {
            filtered = allCustomerData.filter((item) => {
                const itemDate = getDateFromRow(item);
                if (!itemDate) return false;

                const formattedItemDate = formatDateForCompare(itemDate);
                return formattedItemDate === appliedDate;
            });
        }

        // Sắp xếp sau khi lọc
        const sortedData = sortDataByDate(filtered, sortOrder);
        setCustomerData(sortedData);
    }, [
        appliedDate,
        allCustomerData,
        sortDataByDate,
        sortOrder,
        getDateFromRow,
        formatDateForCompare,
    ]);

    // Cập nhật phân trang
    const updatePagination = useCallback(() => {
        const total = customerData.length;
        const totalPagesCount = Math.ceil(total / pageSize);

        setTotalItems(total);
        setTotalPages(totalPagesCount);

        if (currentPage > totalPagesCount && totalPagesCount > 0) {
            setCurrentPage(totalPagesCount);
        }
    }, [customerData.length, pageSize, currentPage]);

    // Lấy dữ liệu cho trang hiện tại
    const getCurrentPageData = useCallback(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return customerData.slice(startIndex, endIndex);
    }, [customerData, currentPage, pageSize]);

    // ===== API CALLS =====
    // API 1: Stats
    const fetchSummary = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                "https://system-waste-less-ai.onrender.com/api/consumption/sum-customer-as-last-month",
                { headers: { Authorization: `Bearer ${token}` } },
            );
            const data = await res.json();
            if (data.success) setSummary(data.data);
        } catch (error) {
            console.error("Lỗi summary:", error);
        } finally {
            setLoadingSummary(false);
        }
    };
    // API 2: Lấy toàn bộ dữ liệu khách hàng (LỌC Ở FE)
    const fetchAllCustomers = async () => {
        try {
            setLoadingTable(true);
            setError(null);
            const token = localStorage.getItem("token");
            // ⚠️ ĐANG LỌC Ở FE: Lấy tất cả dữ liệu về rồi lọc
            const url = `https://system-waste-less-ai.onrender.com/api/consumption/list-customer-in-month?page=1&size=1000`;
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();

            if (data.success) {
                let customersArray = [];
                if (data.data?.data && Array.isArray(data.data.data)) {
                    customersArray = data.data.data;
                } else if (Array.isArray(data.data)) {
                    customersArray = data.data;
                }
                setAllCustomerData(customersArray);
            } else {
                setError(data.message || "Không thể tải dữ liệu");
                setAllCustomerData([]);
            }
        } catch (error) {
            console.error("Lỗi table:", error);
            setError("Không thể kết nối đến server. Vui lòng thử lại sau.");
            setAllCustomerData([]);
        } finally {
            setLoadingTable(false);
        }
    };
    // ===== HANDLE FILTER & SORT =====
    const handleApplyFilter = () => {
        setAppliedDate(selectedDate);
        setCurrentPage(1);
    };
    const handleResetFilter = () => {
        setSelectedDate("");
        setAppliedDate("");
        setCurrentPage(1);
    };

    // ===== EFFECTS =====
    useEffect(() => {
        fetchSummary();
        fetchAllCustomers();
    }, []);
    useEffect(() => {
        filterDataByDate();
    }, [appliedDate, allCustomerData, filterDataByDate]);
    useEffect(() => {
        updatePagination();
    }, [customerData, currentPage, updatePagination]);
    // ===== FORMAT FUNCTIONS =====
    const formatDateDisplay = useCallback(
        (row) => {
            const rawDate = getDateFromRow(row);
            if (!rawDate) return "Không hợp lệ";
            if (!isNaN(Date.parse(rawDate))) {
                return new Date(rawDate).toLocaleDateString("vi-VN");
            }
            return "Không hợp lệ";
        },
        [getDateFromRow],
    );
    const formatDateInput = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "N/A";
            return date.toLocaleDateString("vi-VN");
        } catch {
            return "N/A";
        }
    };
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
            <div className="px-5 py-4 border-t flex justify-between items-center flex-wrap gap-3">
                <p className="text-sm text-[#8b8b8b]">
                    Hiển thị {startItem}-{endItem} trên {totalItems} bản ghi
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="p-1.5 disabled:opacity-50 hover:bg-gray-100 rounded transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    {getPageNumbers().map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
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
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.min(totalPages, prev + 1),
                            )
                        }
                        disabled={currentPage === totalPages}
                        className="p-1.5 disabled:opacity-50 hover:bg-gray-100 rounded transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        );
    };
    const currentPageData = getCurrentPageData();
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
                <div className="flex items-center justify-between flex-wrap gap-3">
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
            {/* Filter & Sort */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-base font-semibold text-[#141C21] mb-4">
                    Bộ lọc tìm kiếm
                </h3>
                <div className="flex gap-4 flex-wrap">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#10BC5D] flex-1 min-w-[200px]"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleApplyFilter}
                            className="flex items-center gap-2 bg-[#10BC5D] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                        >
                            <Filter size={16} />
                            Lọc dữ liệu
                        </button>
                        {appliedDate && (
                            <button
                                onClick={handleResetFilter}
                                className="px-6 py-2.5 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                                Xóa lọc
                            </button>
                        )}
                    </div>
                </div>
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
                                                fetchAllCustomers();
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
                                        colSpan="3"
                                        className="text-center py-8 text-gray-500"
                                    >
                                        {appliedDate
                                            ? `Không có dữ liệu cho ngày ${formatDateInput(appliedDate)}`
                                            : "Không có dữ liệu"}
                                    </td>
                                </tr>
                            ) : (
                                currentPageData.map((row, index) => (
                                    <tr
                                        key={index}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-4 px-5 text-sm text-[#141C21]">
                                            {formatDateDisplay(row)}
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

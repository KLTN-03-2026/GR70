import React, { useEffect, useState, useCallback } from "react";
import {
    getListWasteByIngredient,
    getSumWasteByMonth,
    getSumWasteByMonthCompare,
} from "../api/wasteHistoryApi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Format date hiển thị
const formatDateVN = (date) => {
    if (!date) return "";
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
};

export default function WasteHistory() {
    // State cho dữ liệu
    const [filteredData, setFilteredData] = useState([]);
    const [currentPageData, setCurrentPageData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterError, setFilterError] = useState("");
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);

    // State cho filter
    const [date, setDate] = useState("");
    const [appliedDate, setAppliedDate] = useState("");

    // State cho thống kê từ BE
    const [stats, setStats] = useState({
        totalWaste: 0,
        comparePercent: 0,
    });

    // Lấy tháng hiện tại (YYYY-MM)
    const getCurrentMonth = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    };

    // ===== PAGINATION STATE =====
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize] = useState(5);

    // Cập nhật dữ liệu phân trang
    const updatePagination = useCallback(
        (dataArray) => {
            const total = dataArray.length;
            const pages = Math.ceil(total / pageSize);
            setTotalItems(total);
            setTotalPages(pages);
            if (currentPage > pages && pages > 0) {
                setCurrentPage(1);
            }
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            setCurrentPageData(dataArray.slice(startIndex, endIndex));
        },
        [currentPage, pageSize],
    );

    // Hàm fetch thống kê (tổng món dư và tỉ lệ so sánh)
    const fetchStats = useCallback(async () => {
        try {
            const currentMonth = getCurrentMonth();

            // Lấy tổng món dư theo tháng hiện tại
            const sumResponse = await getSumWasteByMonth(currentMonth);
            const totalWaste = sumResponse?.data?.total_waste || 0;

            // Lấy phần trăm so sánh với tháng trước
            const compareResponse =
                await getSumWasteByMonthCompare(currentMonth);
            const comparePercent = parseFloat(compareResponse?.data) || 0;

            setStats({
                totalWaste: totalWaste,
                comparePercent: comparePercent,
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    }, []);

    // Hàm fetch dữ liệu chính (gửi filter lên BE)
    const fetchData = useCallback(
        async (filterDate) => {
            try {
                setLoading(true);
                setFilterError("");

                const params = {};
                if (filterDate && filterDate !== "") {
                    params.date = filterDate;
                }

                console.log("📡 Gọi API với params:", params);
                const response = await getListWasteByIngredient(params);
                const rawData = response?.data || [];

                // Lọc thủ công ở FE theo ngày đã chọn
                let filteredResult = rawData;
                if (filterDate && filterDate !== "") {
                    filteredResult = rawData.filter(
                        (item) => item.date === filterDate,
                    );
                    console.log(
                        `📅 Lọc FE: ${rawData.length} -> ${filteredResult.length} records cho ngày ${filterDate}`,
                    );
                }

                setFilteredData(filteredResult);
                updatePagination(filteredResult);
            } catch (err) {
                console.error("Fetch error:", err);
                setFilterError(
                    err.response?.data?.message ||
                        "Có lỗi xảy ra khi tải dữ liệu",
                );
                setFilteredData([]);
                setCurrentPageData([]);
                setTotalItems(0);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        },
        [updatePagination],
    );

    // Load dữ liệu ban đầu và thống kê
    useEffect(() => {
        fetchData("");
        fetchStats();
    }, [fetchData, fetchStats]);

    // Khi appliedDate thay đổi, gọi API mới
    useEffect(() => {
        if (appliedDate !== undefined) {
            fetchData(appliedDate);
        }
    }, [appliedDate, fetchData]);

    // Cập nhật phân trang khi filteredData thay đổi
    useEffect(() => {
        if (filteredData.length > 0) {
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            setCurrentPageData(filteredData.slice(startIndex, endIndex));
        } else {
            setCurrentPageData([]);
        }
    }, [currentPage, filteredData, pageSize]);

    const handleDateChange = (value) => {
        setDate(value);
        if (filterError) setFilterError("");
    };

    const handleResetFilters = () => {
        setDate("");
        setAppliedDate("");
        setFilterError("");
        setCurrentPage(1);
        fetchData("");
    };

    const handleFilter = () => {
        if (!date) {
            setFilterError("⚠️ Vui lòng chọn ngày cần lọc");
            return;
        }
        setFilterError("");
        setCurrentPage(1);
        setAppliedDate(date);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
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
            <div className="px-5 py-3 border-t flex justify-between items-center">
                <p className="text-sm text-gray-500">
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
                                    ? "bg-green-500 text-white"
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

    const exportAllToExcel = () => {
        const excelData = filteredData.map((item) => ({
            NGÀY: item.date,
            "TÊN MÓN": item.dish_name,
            "MÓN RA": `${item.quantity_prepared || 0} suất`,
            "MÓN DÙNG": `${item.quantity_used || 0} suất`,
            "MÓN DƯ": `${item.quantity_wasted || 0} suất`,
            "TỈ LỆ DƯ": `${(item.waste_percentage || 0).toFixed(1)}%`,
            "CHI PHÍ LÃNG PHÍ": `${(item.waste_cost || 0).toLocaleString()}đ`,
            "SL AI ĐỀ XUẤT":
                item.predicted_waste_quantity !== null &&
                item.predicted_waste_quantity !== undefined
                    ? `${item.predicted_waste_quantity} suất`
                    : "Chưa có dữ liệu",
            "GỢI Ý AI": item.suggestion_note || "Chưa có dữ liệu",
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        worksheet["!cols"] = [
            { wch: 12 },
            { wch: 20 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 15 },
            { wch: 15 },
            { wch: 50 },
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Lịch sử món dư");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });
        const blob = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const fileName = `lich_su_mon_du_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.xlsx`;
        saveAs(blob, fileName);
    };

    const getAILevel = (percentage) => {
        if (percentage >= 50)
            return { level: "High", text: "Cao", color: "red" };
        if (percentage >= 30)
            return { level: "Medium", text: "Trung bình", color: "yellow" };
        if (percentage > 0)
            return { level: "Low", text: "Thấp", color: "green" };
        return { level: "None", text: "Không", color: "gray" };
    };

    return (
        <div className="h-screen bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-4 h-full overflow-y-auto hide-scrollbar">
                {/* Title */}
                <div className="mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2.5">
                        Lịch sử lãng phí (dư thừa)
                    </h1>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    {/* Card 1: Tổng món dư */}
                    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <p className="text-gray-500 text-sm uppercase tracking-wide">
                                    Tổng món dư
                                </p>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">
                                    {stats.totalWaste.toLocaleString()}{" "}
                                    <span className="text-lg font-normal text-gray-500">
                                        suất
                                    </span>
                                </h2>
                            </div>
                            <div className="bg-gradient-to-br from-green-400 to-green-600 p-3.5 rounded-xl shadow-md">
                                <span className="text-2xl">📊</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: So với tháng trước */}
                    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <p className="text-gray-500 text-sm uppercase tracking-wide">
                                    So với tháng trước
                                </p>
                                <h2
                                    className={`text-3xl md:text-4xl font-bold mt-2.5 ${stats.comparePercent > 0 ? "text-red-500" : stats.comparePercent < 0 ? "text-green-500" : "text-gray-500"}`}
                                >
                                    {stats.comparePercent > 0 ? "+" : ""}
                                    {stats.comparePercent.toFixed(1)}%
                                </h2>
                                <p className="text-sm text-gray-400 mt-1.5">
                                    {stats.comparePercent > 0
                                        ? "📈 Tăng"
                                        : stats.comparePercent < 0
                                          ? "📉 Giảm"
                                          : "➖ Không đổi"}{" "}
                                    so với tháng trước
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3.5 rounded-xl shadow-md">
                                <span className="text-2xl">📈</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3 mb-4">
                    {filterError && (
                        <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {filterError}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        {/* Ô chọn ngày */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Chọn ngày
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) =>
                                    handleDateChange(e.target.value)
                                }
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        {/* Nhóm nút bấm */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleFilter}
                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-7 py-3 rounded-lg text-base font-medium hover:from-green-600 hover:to-green-700 transition-all whitespace-nowrap"
                            >
                                🔍 Lọc dữ liệu
                            </button>
                            {(appliedDate || date) && (
                                <button
                                    onClick={handleResetFilters}
                                    className="px-7 py-3 rounded-lg text-base font-medium border border-gray-300 hover:bg-gray-50 transition-colors whitespace-nowrap"
                                >
                                    Xóa lọc
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-semibold text-gray-800 text-lg">
                            {appliedDate ? (
                                filteredData.length > 0 ? (
                                    <>
                                        Danh sách món dư ngày{" "}
                                        {formatDateVN(appliedDate)}
                                    </>
                                ) : (
                                    <>
                                        Không có món dư ngày{" "}
                                        {formatDateVN(appliedDate)}
                                    </>
                                )
                            ) : (
                                "Tất cả lịch sử món dư"
                            )}
                        </h3>
                        <button
                            onClick={exportAllToExcel}
                            disabled={filteredData.length === 0}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            Xuất Excel
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm table-fixed">
                            <thead className="bg-gray-100 text-gray-600">
                                <tr>
                                    <th className="p-4 text-left font-semibold text-sm w-[100px]">
                                        NGÀY
                                    </th>
                                    <th className="p-4 text-left font-semibold text-sm w-[150px]">
                                        TÊN MÓN
                                    </th>
                                    <th className="p-4 text-left font-semibold text-sm w-[90px]">
                                        MÓN RA
                                    </th>
                                    <th className="p-4 text-left font-semibold text-sm w-[90px]">
                                        MÓN DÙNG
                                    </th>
                                    <th className="p-4 text-left font-semibold text-sm w-[90px]">
                                        MÓN DƯ
                                    </th>
                                    <th className="p-4 text-left font-semibold text-sm w-[100px]">
                                        TỈ LỆ DƯ
                                    </th>
                                    <th className="p-4 text-left font-semibold text-sm w-[120px]">
                                        CHI PHÍ
                                    </th>
                                    <th className="p-4 text-left font-semibold text-sm w-[130px]">
                                        SL AI ĐỀ XUẤT
                                    </th>
                                    <th className="p-4 text-left font-semibold text-sm w-[200px]">
                                        GỢI Ý AI
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="9"
                                            className="text-center p-9 text-gray-500"
                                        >
                                            <div className="flex flex-col items-center gap-2.5">
                                                <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-green-500"></div>
                                                <span className="text-base">
                                                    Đang tải dữ liệu...
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentPageData.length > 0 ? (
                                    currentPageData.map((item, index) => {
                                        const aiLevel = getAILevel(
                                            item.waste_percentage,
                                        );
                                        const suggestionText =
                                            item.suggestion_note;
                                        const hasLongSuggestion =
                                            suggestionText &&
                                            suggestionText.length > 60;
                                        const displaySuggestion =
                                            suggestionText &&
                                            suggestionText.length > 60
                                                ? suggestionText.substring(
                                                      0,
                                                      60,
                                                  ) + "..."
                                                : suggestionText;

                                        return (
                                            <tr
                                                key={index}
                                                className={`border-t border-gray-100 hover:bg-gray-50 transition ${
                                                    aiLevel.level === "High"
                                                        ? "bg-red-50/50"
                                                        : ""
                                                }`}
                                            >
                                                <td className="p-4 whitespace-nowrap text-sm overflow-hidden text-ellipsis">
                                                    {item.date}
                                                </td>
                                                <td className="p-4 font-medium text-gray-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                                    {item.dish_name}
                                                </td>
                                                <td className="p-4 whitespace-nowrap text-sm">
                                                    {item.quantity_prepared}{" "}
                                                    suất
                                                </td>
                                                <td className="p-4 whitespace-nowrap text-sm">
                                                    {item.quantity_used} suất
                                                </td>
                                                <td className="p-4 text-red-500 font-semibold whitespace-nowrap text-sm">
                                                    {item.quantity_wasted} suất
                                                </td>
                                                <td className="p-4 whitespace-nowrap text-sm">
                                                    <span
                                                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                                                            aiLevel.level ===
                                                            "High"
                                                                ? "bg-red-100 text-red-700"
                                                                : aiLevel.level ===
                                                                    "Medium"
                                                                  ? "bg-yellow-100 text-yellow-700"
                                                                  : aiLevel.level ===
                                                                      "Low"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-gray-100 text-gray-700"
                                                        }`}
                                                    >
                                                        {item.waste_percentage?.toFixed(
                                                            1,
                                                        ) || 0}
                                                        %
                                                    </span>
                                                </td>
                                                <td className="p-4 whitespace-nowrap font-medium text-sm">
                                                    {(
                                                        item.waste_cost || 0
                                                    ).toLocaleString()}
                                                    đ
                                                </td>
                                                <td className="p-4 whitespace-nowrap text-sm">
                                                    {item.predicted_waste_quantity !==
                                                        null &&
                                                    item.predicted_waste_quantity !==
                                                        undefined ? (
                                                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 font-semibold rounded-full">
                                                            {
                                                                item.predicted_waste_quantity
                                                            }{" "}
                                                            suất
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">
                                                            Chưa có dữ liệu
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-gray-600 text-sm">
                                                    {suggestionText ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                                                                {
                                                                    displaySuggestion
                                                                }
                                                            </span>
                                                            {hasLongSuggestion && (
                                                                <button
                                                                    onClick={() =>
                                                                        setSelectedSuggestion(
                                                                            suggestionText,
                                                                        )
                                                                    }
                                                                    className="text-blue-500 hover:text-blue-700 transition-colors flex-shrink-0"
                                                                    title="Xem chi tiết gợi ý"
                                                                >
                                                                    <svg
                                                                        className="w-5 h-5"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={
                                                                                2
                                                                            }
                                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                        />
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={
                                                                                2
                                                                            }
                                                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">
                                                            Chưa có dữ liệu
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="9"
                                            className="text-center p-9 text-gray-400"
                                        >
                                            <div className="flex flex-col items-center gap-2.5">
                                                <svg
                                                    className="w-14 h-14 text-gray-300"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={1.5}
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                                <span className="text-base">
                                                    Không có dữ liệu
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && totalItems > 0 && renderPagination()}
                </div>
            </div>

            {/* Modal */}
            {selectedSuggestion && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedSuggestion(null)}
                >
                    <div
                        className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">💡</span>
                                <h3 className="font-bold text-lg text-gray-800">
                                    Gợi ý từ AI
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedSuggestion(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                            <div className="leading-relaxed text-gray-700 whitespace-pre-wrap break-words">
                                {selectedSuggestion}
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-3 flex justify-end">
                            <button
                                onClick={() => setSelectedSuggestion(null)}
                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

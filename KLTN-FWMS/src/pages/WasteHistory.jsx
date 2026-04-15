import React, { useEffect, useState, useCallback } from "react";
import {
    getListWasteByIngredient,
    getSumWasteByMonth,
    getSumWasteByMonthCompare,
} from "../api/wasteHistoryApi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// format tháng hiển thị
const formatMonthDisplay = (value) => {
    if (!value) return "";
    const [year, month] = value.split("-");
    return `Tháng ${parseInt(month)}/${year}`;
};

// Format date hiển thị
const formatDateVN = (date) => {
    if (!date) return "";
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
};

// Hàm tạo danh sách tháng - chỉ năm hiện tại
const getMonthOptions = () => {
    const options = [];
    const currentYear = new Date().getFullYear(); // 2026
    for (let month = 1; month <= 12; month++) {
        const value = `${currentYear}-${String(month).padStart(2, "0")}`;
        const label = `Tháng ${month}/${currentYear}`;
        options.push({ value, label });
    }
    return options;
};

export default function WasteHistory() {
    const [data, setData] = useState([]);
    const [allData, setAllData] = useState([]);
    const [date, setDate] = useState("");
    const [month, setMonth] = useState("");
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalWaste: 0,
        totalWasteCompare: 0,
        percentChange: 0,
    });
    const [hasFiltered, setHasFiltered] = useState(false);

    // Hàm lọc dữ liệu thủ công
    const filterData = useCallback((rawData, selectedDate, selectedMonth) => {
        if (!rawData || rawData.length === 0) return [];

        if (selectedDate && selectedDate !== "") {
            return rawData.filter((item) => item.date === selectedDate);
        } else if (selectedMonth && selectedMonth !== "") {
            return rawData.filter(
                (item) => item.date && item.date.startsWith(selectedMonth),
            );
        }
        return rawData;
    }, []);

    // Hàm tính tổng số món dư
    const calculateTotalWaste = useCallback((filteredData) => {
        return filteredData.reduce(
            (sum, item) => sum + (item.quantity_wasted || 0),
            0,
        );
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            console.log("========== FETCHING DATA ==========");
            console.log("Date filter:", date);
            console.log("Month filter:", month);

            // Gọi API lấy toàn bộ dữ liệu
            const listWasteResponse = await getListWasteByIngredient({});
            const rawData = listWasteResponse?.data || [];

            setAllData(rawData);

            // Lọc thủ công
            const filteredData = filterData(rawData, date, month);

            console.log(
                `Raw: ${rawData.length}, Filtered: ${filteredData.length}`,
            );

            setData(filteredData);
            setHasFiltered(true);

            // Xử lý thống kê
            let totalWaste = 0;
            let sumWasteResponse = null;
            let sumWasteCompareResponse = null;

            if (date && date !== "") {
                totalWaste = calculateTotalWaste(filteredData);
                sumWasteResponse = await getSumWasteByMonth(null);
            } else if (month && month !== "") {
                totalWaste = calculateTotalWaste(filteredData);
                sumWasteResponse = await getSumWasteByMonth(month);
                sumWasteCompareResponse =
                    await getSumWasteByMonthCompare(month);
            } else {
                sumWasteResponse = await getSumWasteByMonth(null);
                totalWaste = sumWasteResponse?.data?.total_waste || 0;
            }

            const compareValue = sumWasteCompareResponse?.data || 0;

            setStats({
                totalWaste: totalWaste,
                totalWasteCompare: compareValue,
                percentChange: compareValue,
            });
        } catch (err) {
            console.error("Fetch error:", err);
            setData([]);
            setStats({
                totalWaste: 0,
                totalWasteCompare: 0,
                percentChange: 0,
            });
        } finally {
            setLoading(false);
        }
    }, [date, month, filterData, calculateTotalWaste]);

    // Tính tỷ lệ lãng phí trung bình
    const avgWastePercent =
        data.length > 0
            ? Math.round(
                  data.reduce(
                      (sum, item) => sum + (item.waste_percentage || 0),
                      0,
                  ) / data.length,
              )
            : 0;

    const handleResetFilters = () => {
        setDate("");
        setMonth("");
        setHasFiltered(false);
    };

    const handleFilter = () => {
        fetchData();
    };

    // Load dữ liệu lần đầu
    useEffect(() => {
        fetchData();
    }, []);

    // Xuất Excel
    const exportAllToExcel = () => {
        const excelData = data.map((item) => ({
            NGÀY: item.date,
            "TÊN MÓN": item.dish_name,
            "MÓN RA": `${item.quantity_prepared || 0} suất`,
            "MÓN DÙNG": `${item.quantity_used || 0} suất`,
            "MÓN DƯ": `${item.quantity_wasted || 0} suất`,
            "TỈ LỆ DƯ": `${(item.waste_percentage || 0).toFixed(1)}%`,
            "CHI PHÍ LÃNG PHÍ": `${(item.waste_cost || 0).toLocaleString()}đ`,
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

    const exportSingleToExcel = (item) => {
        const singleData = [
            {
                NGÀY: item.date,
                "TÊN MÓN": item.dish_name,
                "MÓN RA": `${item.quantity_prepared || 0} suất`,
                "MÓN DÙNG": `${item.quantity_used || 0} suất`,
                "MÓN DƯ": `${item.quantity_wasted || 0} suất`,
                "TỈ LỆ DƯ": `${(item.waste_percentage || 0).toFixed(1)}%`,
                "CHI PHÍ LÃNG PHÍ": `${(item.waste_cost || 0).toLocaleString()}đ`,
                "GỢI Ý AI": item.suggestion_note || "Chưa có dữ liệu",
            },
        ];

        const worksheet = XLSX.utils.json_to_sheet(singleData);
        worksheet["!cols"] = [
            { wch: 12 },
            { wch: 20 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 15 },
            { wch: 50 },
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            `Món dư: ${item.dish_name}`,
        );

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });
        const blob = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const fileName = `mon_du_${item.date}_${item.dish_name}_${Date.now()}.xlsx`;
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

    const getTitle = () => {
        if (date) return `Thống kê ngày ${formatDateVN(date)}`;
        if (month) return `Thống kê ${formatMonthDisplay(month)}`;
        return "Thống kê tất cả";
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                {/* Title */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                        Lịch sử lãng phí (dư thừa)
                    </h1>
                    <p className="text-gray-500 text-base">{getTitle()}</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <p className="text-gray-500 text-sm uppercase tracking-wide mb-1">
                                    {date
                                        ? "Tổng món dư trong ngày"
                                        : month
                                          ? "Tổng món dư trong tháng"
                                          : "Tổng món dư"}
                                </p>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">
                                    {stats.totalWaste.toLocaleString()}{" "}
                                    <span className="text-lg font-normal text-gray-500">
                                        suất
                                    </span>
                                </h2>
                                {month &&
                                    stats.percentChange !== 0 &&
                                    stats.percentChange !== "0" && (
                                        <div className="mt-3">
                                            <span
                                                className={`inline-flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-md ${parseFloat(stats.percentChange) > 0 ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"}`}
                                            >
                                                {parseFloat(
                                                    stats.percentChange,
                                                ) > 0
                                                    ? "↑"
                                                    : "↓"}{" "}
                                                {Math.abs(
                                                    parseFloat(
                                                        stats.percentChange,
                                                    ),
                                                ).toFixed(1)}
                                                %
                                                <span className="text-gray-500 font-normal ml-1">
                                                    so với tháng trước
                                                </span>
                                            </span>
                                        </div>
                                    )}
                            </div>
                            <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl shadow-md">
                                <span className="text-2xl">📊</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <p className="text-gray-500 text-sm uppercase tracking-wide mb-1">
                                    Tỉ lệ món dư trung bình
                                </p>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">
                                    {avgWastePercent}%
                                </h2>
                            </div>
                            <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl shadow-md">
                                <span className="text-2xl">📈</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter - Đã thay thế input month bằng select dropdown */}
                <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                        <div className="flex-1 w-full sm:w-auto">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ngày cụ thể
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => {
                                    setDate(e.target.value);
                                    setMonth("");
                                }}
                                className="w-full sm:w-64 border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                            />
                        </div>

                        {/* Thay thế input month bằng select dropdown */}
                        <div className="flex-1 w-full sm:w-auto">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Theo tháng
                            </label>
                            <select
                                value={month}
                                onChange={(e) => {
                                    setMonth(e.target.value);
                                    setDate("");
                                }}
                                className="w-full sm:w-64 border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition bg-white cursor-pointer"
                            >
                                <option value="">Chọn tháng</option>
                                {getMonthOptions().map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {(date || month) && (
                            <button
                                onClick={handleResetFilters}
                                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
                            >
                                Xóa bộ lọc
                            </button>
                        )}

                        <button
                            onClick={handleFilter}
                            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg font-medium"
                        >
                            🔍 Lọc dữ liệu
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-semibold text-gray-800 text-lg">
                            {date
                                ? `📋 Chi tiết lãng phí ngày ${formatDateVN(date)}`
                                : month
                                  ? `📋 Chi tiết lãng phí ${formatMonthDisplay(month)}`
                                  : "📋 Tất cả lịch sử lãng phí"}
                        </h3>
                        <button
                            onClick={exportAllToExcel}
                            disabled={data.length === 0}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-sm font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 text-gray-600">
                                <tr>
                                    <th className="p-4 text-left font-semibold">
                                        NGÀY
                                    </th>
                                    <th className="p-4 text-left font-semibold">
                                        TÊN MÓN
                                    </th>
                                    <th className="p-4 text-left font-semibold">
                                        MÓN RA
                                    </th>
                                    <th className="p-4 text-left font-semibold">
                                        MÓN DÙNG
                                    </th>
                                    <th className="p-4 text-left font-semibold">
                                        MÓN DƯ
                                    </th>
                                    <th className="p-4 text-left font-semibold">
                                        TỈ LỆ DƯ
                                    </th>
                                    <th className="p-4 text-left font-semibold">
                                        CHI PHÍ
                                    </th>
                                    <th className="p-4 text-left font-semibold">
                                        GỢI Ý AI
                                    </th>
                                    <th className="p-4 text-left font-semibold">
                                        THAO TÁC
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="9"
                                            className="text-center p-8 text-gray-500"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                                                <span>Đang tải dữ liệu...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : data.length > 0 ? (
                                    data.map((item, index) => {
                                        const aiLevel = getAILevel(
                                            item.waste_percentage,
                                        );
                                        return (
                                            <tr
                                                key={index}
                                                className={`border-t border-gray-100 hover:bg-gray-50 transition ${aiLevel.level === "High" ? "bg-red-50/50" : ""}`}
                                            >
                                                <td className="p-4 whitespace-nowrap">
                                                    {item.date}
                                                </td>
                                                <td className="p-4 font-medium text-gray-800 whitespace-nowrap">
                                                    {item.dish_name}
                                                </td>
                                                <td className="p-4 whitespace-nowrap">
                                                    {item.quantity_prepared}{" "}
                                                    suất
                                                </td>
                                                <td className="p-4 whitespace-nowrap">
                                                    {item.quantity_used} suất
                                                </td>
                                                <td className="p-4 text-red-500 font-semibold whitespace-nowrap">
                                                    {item.quantity_wasted} suất
                                                </td>
                                                <td className="p-4 whitespace-nowrap">
                                                    <span
                                                        className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${aiLevel.level === "High" ? "bg-red-100 text-red-700" : aiLevel.level === "Medium" ? "bg-yellow-100 text-yellow-700" : aiLevel.level === "Low" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                                                    >
                                                        {item.waste_percentage?.toFixed(
                                                            1,
                                                        ) || 0}
                                                        %
                                                    </span>
                                                </td>
                                                <td className="p-4 whitespace-nowrap font-medium">
                                                    {(
                                                        item.waste_cost || 0
                                                    ).toLocaleString()}
                                                    đ
                                                </td>
                                                <td className="p-4 text-gray-600 text-sm max-w-xs truncate">
                                                    {item.suggestion_note ||
                                                        "Chưa có dữ liệu"}
                                                </td>
                                                <td className="p-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() =>
                                                            exportSingleToExcel(
                                                                item,
                                                            )
                                                        }
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-xs font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-sm"
                                                    >
                                                        <svg
                                                            className="w-3.5 h-3.5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                                            />
                                                        </svg>
                                                        Xuất
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="9"
                                            className="text-center p-8 text-gray-400"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <svg
                                                    className="w-12 h-12 text-gray-300"
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
                                                <span>Không có dữ liệu</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                        <p className="text-sm text-gray-500">
                            📄 Hiển thị{" "}
                            <span className="font-semibold text-gray-700">
                                {data.length}
                            </span>{" "}
                            bản ghi
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

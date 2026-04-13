import React, { useEffect, useState } from "react";
import { getWasteHistory } from "../api/wasteApi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// format tháng -> "Tháng 1 2026"
const formatMonthVN = (value) => {
    if (!value) return "";
    const [year, month] = value.split("-");
    return `Tháng ${parseInt(month)} ${year}`;
};

// Lấy tháng trước đó
const getPreviousMonth = (currentMonth) => {
    if (!currentMonth) return "";
    const [year, month] = currentMonth.split("-");
    let prevYear = parseInt(year);
    let prevMonth = parseInt(month) - 1;

    if (prevMonth === 0) {
        prevMonth = 12;
        prevYear--;
    }

    return `${prevYear}-${String(prevMonth).padStart(2, "0")}`;
};

export default function WasteHistory() {
    const [data, setData] = useState([]);
    const [previousData, setPreviousData] = useState([]);
    const [date, setDate] = useState("");
    const [month, setMonth] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getWasteHistory({ date, month });
            setData(res.data || []);

            if (month) {
                const previousMonth = getPreviousMonth(month);
                if (previousMonth) {
                    const prevRes = await getWasteHistory({
                        month: previousMonth,
                    });
                    setPreviousData(prevRes.data || []);
                } else {
                    setPreviousData([]);
                }
            } else {
                setPreviousData([]);
            }
        } catch (err) {
            console.error(err);
            setData([]);
            setPreviousData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Stats for current month
    const totalWaste = data.reduce(
        (sum, item) => sum + (item.leftover || 0),
        0,
    );

    const avgWastePercent =
        data.length > 0
            ? Math.round(
                  data.reduce(
                      (sum, item) => sum + (item.leftoverPercent || 0),
                      0,
                  ) / data.length,
              )
            : 0;

    // Stats for previous month
    const previousTotalWaste = previousData.reduce(
        (sum, item) => sum + (item.leftover || 0),
        0,
    );

    const previousAvgWastePercent =
        previousData.length > 0
            ? Math.round(
                  previousData.reduce(
                      (sum, item) => sum + (item.leftoverPercent || 0),
                      0,
                  ) / previousData.length,
              )
            : 0;

    // Calculate percentage change
    const wasteChange =
        previousTotalWaste > 0
            ? (
                  ((totalWaste - previousTotalWaste) / previousTotalWaste) *
                  100
              ).toFixed(1)
            : totalWaste > 0
              ? 100
              : 0;

    const percentChange =
        previousAvgWastePercent > 0
            ? (
                  ((avgWastePercent - previousAvgWastePercent) /
                      previousAvgWastePercent) *
                  100
              ).toFixed(1)
            : avgWastePercent > 0
              ? 100
              : 0;

    // ========== HÀM XUẤT EXCEL TOÀN BỘ ==========
    const exportAllToExcel = () => {
        const excelData = data.map((item) => ({
            NGÀY: item.date,
            "TÊN MÓN": item.name,
            "MÓN RA": `${item.produced || 0} suất`,
            "MÓN DÙNG": `${item.used || 0} suất`,
            "MÓN DƯ": `${item.leftover || 0} suất`,
            "TỈ LỆ DƯ": `${item.leftoverPercent || 0}%`,
            AI: item.aiLevel || "Chưa có",
            "NGUYÊN NHÂN AI": item.aiReason || "Chưa có dữ liệu",
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        worksheet["!cols"] = [
            { wch: 12 },
            { wch: 20 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 8 },
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

    // ========== HÀM XUẤT EXCEL TỪNG DÒNG ==========
    const exportSingleToExcel = (item) => {
        const singleData = [
            {
                NGÀY: item.date,
                "TÊN MÓN": item.name,
                "MÓN RA": `${item.produced || 0} suất`,
                "MÓN DÙNG": `${item.used || 0} suất`,
                "MÓN DƯ": `${item.leftover || 0} suất`,
                "TỈ LỆ DƯ": `${item.leftoverPercent || 0}%`,
                AI: item.aiLevel || "Chưa có",
                "NGUYÊN NHÂN AI": item.aiReason || "Chưa có dữ liệu",
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
            { wch: 8 },
            { wch: 50 },
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            `Món dư: ${item.name}`,
        );

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });
        const blob = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const fileName = `mon_du_${item.date}_${item.name}_${Date.now()}.xlsx`;
        saveAs(blob, fileName);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Container chính với padding lớn hơn ở các cạnh */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                {/* Title */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                        Lịch sử lãng phí (dư thừa)
                    </h1>
                    <p className="text-gray-500 text-base">
                        {month
                            ? `Thống kê chi tiết tháng ${formatMonthVN(month)}`
                            : "Theo dõi lượng món dư và phân tích bằng AI"}
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Tổng món dư trong tháng */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <p className="text-gray-500 text-sm uppercase tracking-wide mb-1">
                                    Tổng món dư trong tháng
                                </p>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">
                                    {totalWaste.toLocaleString()}{" "}
                                    <span className="text-lg font-normal text-gray-500">
                                        suất
                                    </span>
                                </h2>
                                {month && previousTotalWaste > 0 && (
                                    <div className="mt-3">
                                        <span
                                            className={`inline-flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-md ${
                                                wasteChange > 0
                                                    ? "text-red-600 bg-red-50"
                                                    : "text-green-600 bg-green-50"
                                            }`}
                                        >
                                            {wasteChange > 0 ? "↑" : "↓"}{" "}
                                            {Math.abs(wasteChange)}%
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
                        {month && previousTotalWaste > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                                Tháng trước:{" "}
                                <span className="font-semibold text-gray-700">
                                    {previousTotalWaste.toLocaleString()} suất
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Tỉ lệ trung bình */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <p className="text-gray-500 text-sm uppercase tracking-wide mb-1">
                                    Tỉ lệ món dư trung bình
                                </p>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">
                                    {avgWastePercent}%
                                </h2>
                                {month && previousAvgWastePercent > 0 && (
                                    <div className="mt-3">
                                        <span
                                            className={`inline-flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-md ${
                                                percentChange > 0
                                                    ? "text-red-600 bg-red-50"
                                                    : "text-green-600 bg-green-50"
                                            }`}
                                        >
                                            {percentChange > 0 ? "↑" : "↓"}{" "}
                                            {Math.abs(percentChange)}%
                                            <span className="text-gray-500 font-normal ml-1">
                                                so với tháng trước
                                            </span>
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl shadow-md">
                                <span className="text-2xl">📈</span>
                            </div>
                        </div>
                        {month && previousAvgWastePercent > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                                Tháng trước:{" "}
                                <span className="font-semibold text-gray-700">
                                    {previousAvgWastePercent}%
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filter */}
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

                        <div className="flex-1 w-full sm:w-auto">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Theo tháng
                            </label>
                            <div className="relative">
                                <input
                                    type="month"
                                    value={month}
                                    onChange={(e) => {
                                        setMonth(e.target.value);
                                        setDate("");
                                    }}
                                    className="w-full sm:w-64 border border-gray-300 px-4 py-2.5 rounded-lg text-transparent focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                />
                                <span className="absolute left-4 top-2.5 text-gray-700 pointer-events-none">
                                    {month
                                        ? formatMonthVN(month)
                                        : "Chọn tháng"}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={fetchData}
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
                            {month
                                ? `📋 Chi tiết lãng phí tháng ${formatMonthVN(month)}`
                                : "📋 Chi tiết món dư"}
                        </h3>
                        <button
                            onClick={exportAllToExcel}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-sm font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-md"
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

                    {/* Responsive Table */}
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
                                        AI
                                    </th>
                                    <th className="p-4 text-left font-semibold">
                                        NGUYÊN NHÂN
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
                                    data.map((item) => (
                                        <tr
                                            key={item.id}
                                            className={`border-t border-gray-100 hover:bg-gray-50 transition ${
                                                item.aiLevel === "High"
                                                    ? "bg-red-50/50"
                                                    : ""
                                            }`}
                                        >
                                            <td className="p-4 whitespace-nowrap">
                                                {item.date}
                                            </td>
                                            <td className="p-4 font-medium text-gray-800 whitespace-nowrap">
                                                {item.name}
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                {item.produced} suất
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                {item.used} suất
                                            </td>
                                            <td className="p-4 text-red-500 font-semibold whitespace-nowrap">
                                                {item.leftover} suất
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                {item.leftoverPercent}%
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
                                                        item.aiLevel === "High"
                                                            ? "bg-red-100 text-red-700"
                                                            : item.aiLevel ===
                                                                "Medium"
                                                              ? "bg-yellow-100 text-yellow-700"
                                                              : "bg-green-100 text-green-700"
                                                    }`}
                                                >
                                                    {item.aiLevel || "N/A"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-600 text-sm max-w-xs truncate">
                                                {item.aiReason ||
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
                                    ))
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

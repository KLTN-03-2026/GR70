// src/pages/kitchen/ReportExport.jsx
import React, { useState } from "react";
import {
    Calendar,
    Download,
    FileSpreadsheet,
    Filter,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    CheckCircle,
    XCircle,
    Printer,
    Mail,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

const ReportExport = () => {
    // State cho các bộ lọc
    const [reportType, setReportType] = useState("surplus"); // surplus, revenue, waste
    const [dateRange, setDateRange] = useState({
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
    });
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [showPreview, setShowPreview] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // Dữ liệu mẫu cho món dư (Surplus)
    const [surplusData] = useState([
        {
            id: "KT001",
            name: "Cơm gà xôi mỡ",
            category: "Món chính",
            prepared: 50,
            served: 35,
            surplus: 15,
            surplusRate: 30,
            wasteCost: 15 * 15000,
            revenue: 35 * 45000,
            status: "active",
            date: "2024-03-21",
            riskLevel: "Cao",
        },
        {
            id: "KT002",
            name: "Salad dầu giấm",
            category: "Món phụ",
            prepared: 40,
            served: 25,
            surplus: 15,
            surplusRate: 37.5,
            wasteCost: 15 * 10000,
            revenue: 25 * 35000,
            status: "active",
            date: "2024-03-21",
            riskLevel: "Cao",
        },
        {
            id: "KT003",
            name: "Phở bò",
            category: "Món chính",
            prepared: 45,
            served: 32,
            surplus: 13,
            surplusRate: 28.9,
            wasteCost: 13 * 20000,
            revenue: 32 * 55000,
            status: "active",
            date: "2024-03-21",
            riskLevel: "Trung bình",
        },
        {
            id: "KT004",
            name: "Bún chả",
            category: "Món chính",
            prepared: 35,
            served: 23,
            surplus: 12,
            surplusRate: 34.3,
            wasteCost: 12 * 18000,
            revenue: 23 * 50000,
            status: "closed",
            date: "2024-03-20",
            riskLevel: "Cao",
        },
        {
            id: "KT005",
            name: "Cơm tấm sườn",
            category: "Món chính",
            prepared: 45,
            served: 35,
            surplus: 10,
            surplusRate: 22.2,
            wasteCost: 10 * 12000,
            revenue: 35 * 40000,
            status: "active",
            date: "2024-03-20",
            riskLevel: "Trung bình",
        },
        {
            id: "KT006",
            name: "Chả giò",
            category: "Món khai vị",
            prepared: 60,
            served: 50,
            surplus: 10,
            surplusRate: 16.7,
            wasteCost: 10 * 8000,
            revenue: 50 * 25000,
            status: "active",
            date: "2024-03-19",
            riskLevel: "Thấp",
        },
        {
            id: "KT007",
            name: "Gỏi cuốn",
            category: "Món khai vị",
            prepared: 55,
            served: 45,
            surplus: 10,
            surplusRate: 18.2,
            wasteCost: 10 * 9000,
            revenue: 45 * 30000,
            status: "active",
            date: "2024-03-19",
            riskLevel: "Thấp",
        },
    ]);

    // Dữ liệu mẫu cho doanh thu
    const [revenueData] = useState([
        {
            date: "2024-03-19",
            revenue: 4250000,
            cost: 1850000,
            profit: 2400000,
        },
        {
            date: "2024-03-20",
            revenue: 4870000,
            cost: 2120000,
            profit: 2750000,
        },
        {
            date: "2024-03-21",
            revenue: 5320000,
            cost: 2310000,
            profit: 3010000,
        },
    ]);

    // Lọc dữ liệu theo điều kiện
    const getFilteredData = () => {
        let filtered = [...surplusData];

        // Lọc theo ngày
        filtered = filtered.filter(
            (item) =>
                item.date >= dateRange.startDate &&
                item.date <= dateRange.endDate,
        );

        // Lọc theo danh mục
        if (selectedCategory !== "all") {
            filtered = filtered.filter(
                (item) => item.category === selectedCategory,
            );
        }

        // Lọc theo trạng thái
        if (selectedStatus !== "all") {
            filtered = filtered.filter(
                (item) => item.status === selectedStatus,
            );
        }

        // Lọc theo loại báo cáo
        if (reportType === "surplus") {
            // Chỉ hiển thị món có dư
            return filtered.filter((item) => item.surplus > 0);
        }

        return filtered;
    };

    const filteredData = getFilteredData();

    // Tính toán thống kê
    const statistics = {
        totalSurplus: filteredData.reduce((sum, item) => sum + item.surplus, 0),
        totalWasteCost: filteredData.reduce(
            (sum, item) => sum + item.wasteCost,
            0,
        ),
        totalRevenue: filteredData.reduce((sum, item) => sum + item.revenue, 0),
        avgSurplusRate:
            filteredData.length > 0
                ? (
                      filteredData.reduce(
                          (sum, item) => sum + item.surplusRate,
                          0,
                      ) / filteredData.length
                  ).toFixed(1)
                : 0,
        highRiskCount: filteredData.filter((item) => item.riskLevel === "Cao")
            .length,
        mediumRiskCount: filteredData.filter(
            (item) => item.riskLevel === "Trung bình",
        ).length,
        lowRiskCount: filteredData.filter((item) => item.riskLevel === "Thấp")
            .length,
    };

    // Format tiền tệ
    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
    };

    // Format phần trăm
    const formatPercent = (value) => {
        return typeof value === "number" ? value.toFixed(1) + "%" : value;
    };

    // Xử lý xuất Excel
    const handleExport = async () => {
        if (filteredData.length === 0) {
            alert("⚠️ Không có dữ liệu để xuất!");
            return;
        }

        setIsExporting(true);

        try {
            // Format dữ liệu cho Excel
            const exportFormattedData = filteredData.map((item, index) => ({
                STT: index + 1,
                "Mã món": item.id,
                "Tên món": item.name,
                "Danh mục": item.category,
                "Số lượng chuẩn bị": item.prepared,
                "Số lượng đã phục vụ": item.served,
                "Số lượng dư": item.surplus,
                "Tỷ lệ dư (%)": item.surplusRate,
                "Chi phí hao hụt": formatPrice(item.wasteCost),
                "Doanh thu": formatPrice(item.revenue),
                "Mức rủi ro": item.riskLevel,
                Ngày: item.date,
            }));

            // Thêm sheet thống kê
            const summaryData = [
                {
                    "Chỉ tiêu": "📊 Tổng số món dư",
                    "Giá trị": filteredData.length,
                },
                {
                    "Chỉ tiêu": "🍽️ Tổng số lượng dư",
                    "Giá trị": statistics.totalSurplus,
                },
                {
                    "Chỉ tiêu": "💰 Tổng chi phí hao hụt",
                    "Giá trị": formatPrice(statistics.totalWasteCost),
                },
                {
                    "Chỉ tiêu": "📈 Tổng doanh thu",
                    "Giá trị": formatPrice(statistics.totalRevenue),
                },
                {
                    "Chỉ tiêu": "📊 Tỷ lệ dư trung bình",
                    "Giá trị": formatPercent(statistics.avgSurplusRate),
                },
                {
                    "Chỉ tiêu": "🔴 Mức rủi ro cao",
                    "Giá trị": statistics.highRiskCount,
                },
                {
                    "Chỉ tiêu": "🟡 Mức rủi ro trung bình",
                    "Giá trị": statistics.mediumRiskCount,
                },
                {
                    "Chỉ tiêu": "🟢 Mức rủi ro thấp",
                    "Giá trị": statistics.lowRiskCount,
                },
            ];

            // Tạo workbook với nhiều sheet
            const XLSX = require("xlsx");
            const workbook = XLSX.utils.book_new();

            // Sheet chi tiết
            const detailSheet = XLSX.utils.json_to_sheet(exportFormattedData);
            detailSheet["!cols"] = [
                { wch: 6 },
                { wch: 10 },
                { wch: 25 },
                { wch: 15 },
                { wch: 18 },
                { wch: 18 },
                { wch: 15 },
                { wch: 12 },
                { wch: 18 },
                { wch: 18 },
                { wch: 12 },
                { wch: 12 },
            ];
            XLSX.utils.book_append_sheet(
                workbook,
                detailSheet,
                "Chi tiết món dư",
            );

            // Sheet thống kê
            const summarySheet = XLSX.utils.json_to_sheet(summaryData);
            summarySheet["!cols"] = [{ wch: 25 }, { wch: 20 }];
            XLSX.utils.book_append_sheet(
                workbook,
                summarySheet,
                "Thống kê tổng hợp",
            );

            // Xuất file
            const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array",
            });
            const blob = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const timestamp = new Date()
                .toISOString()
                .slice(0, 19)
                .replace(/:/g, "-");
            const fileName = `bao_cao_mon_du_${dateRange.startDate}_den_${dateRange.endDate}_${timestamp}`;

            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${fileName}.xlsx`;
            link.click();
            URL.revokeObjectURL(link.href);

            alert("✅ Xuất Excel thành công!");
        } catch (error) {
            console.error("Lỗi xuất Excel:", error);
            alert("❌ Có lỗi xảy ra khi xuất Excel!");
        } finally {
            setIsExporting(false);
        }
    };

    // Reset bộ lọc
    const handleResetFilters = () => {
        setDateRange({
            startDate: new Date().toISOString().split("T")[0],
            endDate: new Date().toISOString().split("T")[0],
        });
        setSelectedCategory("all");
        setSelectedStatus("all");
    };

    // Danh sách danh mục
    const categories = [
        "all",
        "Món chính",
        "Món phụ",
        "Món khai vị",
        "Món tráng miệng",
    ];
    const statuses = ["all", "active", "closed"];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    📊 Báo cáo & Xuất dữ liệu
                </h1>
                <p className="text-gray-500">
                    Chọn loại báo cáo và tùy chỉnh thông tin cần xuất
                </p>
            </div>

            {/* Panel lọc */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter size={20} className="text-green-500" />
                    <h2 className="text-lg font-semibold text-gray-700">
                        Tùy chọn báo cáo
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Loại báo cáo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loại báo cáo
                        </label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="surplus">🍽️ Món dư (Surplus)</option>
                            <option value="revenue">
                                💰 Báo cáo doanh thu
                            </option>
                            <option value="waste">📉 Báo cáo thất thoát</option>
                        </select>
                    </div>

                    {/* Ngày bắt đầu */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar size={14} className="inline mr-1" />
                            Từ ngày
                        </label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) =>
                                setDateRange({
                                    ...dateRange,
                                    startDate: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Ngày kết thúc */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar size={14} className="inline mr-1" />
                            Đến ngày
                        </label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) =>
                                setDateRange({
                                    ...dateRange,
                                    endDate: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Danh mục */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Danh mục món ăn
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) =>
                                setSelectedCategory(e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat === "all" ? "Tất cả danh mục" : cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Trạng thái */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trạng thái
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">Tất cả</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="closed">Đã đóng</option>
                        </select>
                    </div>

                    {/* Nút hành động */}
                    <div className="flex gap-2 items-end">
                        <button
                            onClick={handleResetFilters}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Đặt lại
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                            {isExporting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Đang xuất...</span>
                                </>
                            ) : (
                                <>
                                    <Download size={18} />
                                    <FileSpreadsheet size={18} />
                                    <span>Xuất Excel</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Thống kê nhanh */}
            {filteredData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">
                                    Tổng số lượng dư
                                </p>
                                <p className="text-2xl font-bold">
                                    {statistics.totalSurplus}
                                </p>
                            </div>
                            <TrendingDown size={32} className="opacity-80" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">
                                    Chi phí hao hụt
                                </p>
                                <p className="text-2xl font-bold">
                                    {formatPrice(statistics.totalWasteCost)}
                                </p>
                            </div>
                            <AlertCircle size={32} className="opacity-80" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Doanh thu</p>
                                <p className="text-2xl font-bold">
                                    {formatPrice(statistics.totalRevenue)}
                                </p>
                            </div>
                            <TrendingUp size={32} className="opacity-80" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">
                                    Tỷ lệ dư TB
                                </p>
                                <p className="text-2xl font-bold">
                                    {formatPercent(statistics.avgSurplusRate)}
                                </p>
                            </div>
                            <FileSpreadsheet size={32} className="opacity-80" />
                        </div>
                    </div>
                </div>
            )}

            {/* Bảng hiển thị dữ liệu */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700">
                        📋 Chi tiết món dư ({filteredData.length} món)
                    </h3>
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        {showPreview ? (
                            <ChevronUp size={20} />
                        ) : (
                            <ChevronDown size={20} />
                        )}
                    </button>
                </div>

                {showPreview && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr className="text-gray-600 text-sm">
                                    <th className="px-4 py-3 text-left">Mã</th>
                                    <th className="px-4 py-3 text-left">
                                        Tên món
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Danh mục
                                    </th>
                                    <th className="px-4 py-3 text-center">
                                        CB
                                    </th>
                                    <th className="px-4 py-3 text-center">
                                        PV
                                    </th>
                                    <th className="px-4 py-3 text-center">
                                        Dư
                                    </th>
                                    <th className="px-4 py-3 text-center">
                                        Tỷ lệ
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Chi phí HH
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        Doanh thu
                                    </th>
                                    <th className="px-4 py-3 text-center">
                                        Rủi ro
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? (
                                    filteredData.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-gray-100 hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-3 text-sm font-medium text-green-600">
                                                {item.id}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium">
                                                {item.name}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {item.category}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-center">
                                                {item.prepared}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-center">
                                                {item.served}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-center font-semibold text-red-500">
                                                {item.surplus}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-center">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs ${
                                                        item.surplusRate > 30
                                                            ? "bg-red-100 text-red-600"
                                                            : item.surplusRate >
                                                                20
                                                              ? "bg-yellow-100 text-yellow-600"
                                                              : "bg-green-100 text-green-600"
                                                    }`}
                                                >
                                                    {item.surplusRate}%
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-red-500">
                                                {formatPrice(item.wasteCost)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-green-500">
                                                {formatPrice(item.revenue)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-center">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs ${
                                                        item.riskLevel === "Cao"
                                                            ? "bg-red-100 text-red-600"
                                                            : item.riskLevel ===
                                                                "Trung bình"
                                                              ? "bg-yellow-100 text-yellow-600"
                                                              : "bg-green-100 text-green-600"
                                                    }`}
                                                >
                                                    {item.riskLevel ===
                                                        "Cao" && (
                                                        <AlertCircle
                                                            size={12}
                                                            className="inline mr-1"
                                                        />
                                                    )}
                                                    {item.riskLevel}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="10"
                                            className="px-4 py-8 text-center text-gray-400"
                                        >
                                            <AlertCircle
                                                size={40}
                                                className="mx-auto mb-2 opacity-50"
                                            />
                                            <p>
                                                Không có dữ liệu phù hợp với bộ
                                                lọc
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Hướng dẫn */}
            {filteredData.length === 0 && (
                <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-3">
                        <AlertCircle
                            size={20}
                            className="text-blue-500 mt-0.5"
                        />
                        <div>
                            <h4 className="font-semibold text-blue-800 mb-1">
                                Hướng dẫn
                            </h4>
                            <p className="text-sm text-blue-600">
                                1. Chọn loại báo cáo bạn muốn xuất
                                <br />
                                2. Chọn khoảng thời gian cần xem
                                <br />
                                3. Lọc theo danh mục hoặc trạng thái (nếu cần)
                                <br />
                                4. Nhấn "Xuất Excel" để tải file về máy
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportExport;

// src/pages/kitchen/reports/SurplusReport.jsx
import React, { useState, useEffect } from "react";
import {
    Calendar,
    Download,
    FileSpreadsheet,
    Filter,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Search,
    RefreshCw,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const SurplusReport = () => {
    // Lấy ngày hiện tại
    const today = new Date();
    const getFormattedDate = (date) => {
        return date.toISOString().split("T")[0];
    };

    // Tính ngày 7 ngày trước
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    // State cho các bộ lọc
    const [dateRange, setDateRange] = useState({
        startDate: getFormattedDate(sevenDaysAgo), // 7 ngày trước
        endDate: getFormattedDate(today), // Hôm nay
    });
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedRiskLevel, setSelectedRiskLevel] = useState("all");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [showPreview, setShowPreview] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Dữ liệu mẫu cho món dư (Surplus) - Cập nhật năm 2026
    const [surplusData, setSurplusData] = useState([]);
    const [allData, setAllData] = useState([]);

    // Mock data - Cập nhật ngày tháng năm 2026
    useEffect(() => {
        loadMockData();
    }, []);

    const loadMockData = () => {
        setIsLoading(true);
        // Giả lập API call
        setTimeout(() => {
            const mockData = [
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
                    date: "2026-03-21", // Cập nhật năm 2026
                    riskLevel: "Cao",
                    note: "Dự báo không chính xác, khách đến ít hơn dự kiến",
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
                    date: "2026-03-21",
                    riskLevel: "Cao",
                    note: "Nguyên liệu nhập quá nhiều",
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
                    date: "2026-03-20",
                    riskLevel: "Trung bình",
                    note: "",
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
                    date: "2026-03-20",
                    riskLevel: "Cao",
                    note: "Cần điều chỉnh lượng chuẩn bị",
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
                    date: "2026-03-19",
                    riskLevel: "Trung bình",
                    note: "",
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
                    date: "2026-03-19",
                    riskLevel: "Thấp",
                    note: "",
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
                    date: "2026-03-18",
                    riskLevel: "Thấp",
                    note: "",
                },
                {
                    id: "KT008",
                    name: "Bánh xèo",
                    category: "Món chính",
                    prepared: 40,
                    served: 28,
                    surplus: 12,
                    surplusRate: 30,
                    wasteCost: 12 * 12000,
                    revenue: 28 * 45000,
                    status: "active",
                    date: "2026-03-18",
                    riskLevel: "Cao",
                    note: "Cần xem xét lại công thức",
                },
                {
                    id: "KT009",
                    name: "Súp cua",
                    category: "Món khai vị",
                    prepared: 30,
                    served: 22,
                    surplus: 8,
                    surplusRate: 26.7,
                    wasteCost: 8 * 25000,
                    revenue: 22 * 55000,
                    status: "inactive",
                    date: "2026-03-17",
                    riskLevel: "Trung bình",
                    note: "",
                },
                {
                    id: "KT010",
                    name: "Cháo lòng",
                    category: "Món chính",
                    prepared: 35,
                    served: 28,
                    surplus: 7,
                    surplusRate: 20,
                    wasteCost: 7 * 10000,
                    revenue: 28 * 35000,
                    status: "active",
                    date: "2026-03-17",
                    riskLevel: "Thấp",
                    note: "",
                },
                {
                    id: "KT011",
                    name: "Bò lúc lắc",
                    category: "Món chính",
                    prepared: 38,
                    served: 30,
                    surplus: 8,
                    surplusRate: 21.1,
                    wasteCost: 8 * 25000,
                    revenue: 30 * 85000,
                    status: "active",
                    date: "2026-03-16",
                    riskLevel: "Trung bình",
                    note: "",
                },
                {
                    id: "KT012",
                    name: "Cá hấp",
                    category: "Món chính",
                    prepared: 25,
                    served: 18,
                    surplus: 7,
                    surplusRate: 28,
                    wasteCost: 7 * 35000,
                    revenue: 18 * 120000,
                    status: "active",
                    date: "2026-03-16",
                    riskLevel: "Cao",
                    note: "Khách không ưa chuộng",
                },
            ];
            setAllData(mockData);
            setSurplusData(mockData.filter((item) => item.surplus > 0));
            setIsLoading(false);
        }, 500);
    };

    // Lọc dữ liệu
    useEffect(() => {
        let filtered = [...allData];

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

        // Lọc theo mức rủi ro
        if (selectedRiskLevel !== "all") {
            filtered = filtered.filter(
                (item) => item.riskLevel === selectedRiskLevel,
            );
        }

        // Lọc theo từ khóa
        if (searchKeyword.trim() !== "") {
            filtered = filtered.filter(
                (item) =>
                    item.name
                        .toLowerCase()
                        .includes(searchKeyword.toLowerCase()) ||
                    item.id.toLowerCase().includes(searchKeyword.toLowerCase()),
            );
        }

        // Chỉ hiển thị món có dư
        filtered = filtered.filter((item) => item.surplus > 0);

        setSurplusData(filtered);
    }, [
        allData,
        dateRange,
        selectedCategory,
        selectedRiskLevel,
        searchKeyword,
    ]);

    // Tính toán thống kê
    const statistics = {
        totalDishes: surplusData.length,
        totalSurplus: surplusData.reduce((sum, item) => sum + item.surplus, 0),
        totalWasteCost: surplusData.reduce(
            (sum, item) => sum + item.wasteCost,
            0,
        ),
        totalRevenue: surplusData.reduce((sum, item) => sum + item.revenue, 0),
        avgSurplusRate:
            surplusData.length > 0
                ? (
                      surplusData.reduce(
                          (sum, item) => sum + item.surplusRate,
                          0,
                      ) / surplusData.length
                  ).toFixed(1)
                : 0,
        highRiskCount: surplusData.filter((item) => item.riskLevel === "Cao")
            .length,
        mediumRiskCount: surplusData.filter(
            (item) => item.riskLevel === "Trung bình",
        ).length,
        lowRiskCount: surplusData.filter((item) => item.riskLevel === "Thấp")
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

    // Xuất Excel
    const handleExport = async () => {
        if (surplusData.length === 0) {
            alert("⚠️ Không có dữ liệu món dư để xuất!");
            return;
        }

        setIsExporting(true);

        try {
            // Format dữ liệu chi tiết
            const detailData = surplusData.map((item, index) => ({
                STT: index + 1,
                "Mã món": item.id,
                "Tên món": item.name,
                "Danh mục": item.category,
                "Số lượng chuẩn bị": item.prepared,
                "Số lượng đã phục vụ": item.served,
                "Số lượng dư": item.surplus,
                "Tỷ lệ dư (%)": item.surplusRate,
                "Chi phí hao hụt (VNĐ)": item.wasteCost,
                "Doanh thu (VNĐ)": item.revenue,
                "Mức rủi ro": item.riskLevel,
                Ngày: item.date,
                "Ghi chú": item.note || "",
            }));

            // Format dữ liệu thống kê
            const summaryData = [
                {
                    "Chỉ tiêu": "📊 Tổng số món có dư",
                    "Giá trị": statistics.totalDishes,
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
                {
                    "Chỉ tiêu": "📅 Kỳ báo cáo",
                    "Giá trị": `${dateRange.startDate} - ${dateRange.endDate}`,
                },
            ];

            // Tạo workbook
            const workbook = XLSX.utils.book_new();

            // Sheet chi tiết
            const detailSheet = XLSX.utils.json_to_sheet(detailData);
            detailSheet["!cols"] = [
                { wch: 6 },
                { wch: 10 },
                { wch: 25 },
                { wch: 15 },
                { wch: 18 },
                { wch: 18 },
                { wch: 15 },
                { wch: 12 },
                { wch: 20 },
                { wch: 20 },
                { wch: 12 },
                { wch: 12 },
                { wch: 30 },
            ];
            XLSX.utils.book_append_sheet(
                workbook,
                detailSheet,
                "Chi tiết món dư",
            );

            // Sheet thống kê
            const summarySheet = XLSX.utils.json_to_sheet(summaryData);
            summarySheet["!cols"] = [{ wch: 25 }, { wch: 25 }];
            XLSX.utils.book_append_sheet(
                workbook,
                summarySheet,
                "Thống kê tổng hợp",
            );

            // Sheet cảnh báo (chỉ hiển thị món rủi ro cao)
            const highRiskData = surplusData
                .filter((item) => item.riskLevel === "Cao")
                .map((item, index) => ({
                    STT: index + 1,
                    "Mã món": item.id,
                    "Tên món": item.name,
                    "Số lượng dư": item.surplus,
                    "Chi phí hao hụt": formatPrice(item.wasteCost),
                    "Tỷ lệ dư": formatPercent(item.surplusRate),
                    "Khuyến nghị": item.note || "Cần điều chỉnh lượng chuẩn bị",
                }));

            if (highRiskData.length > 0) {
                const riskSheet = XLSX.utils.json_to_sheet(highRiskData);
                riskSheet["!cols"] = [
                    { wch: 6 },
                    { wch: 10 },
                    { wch: 25 },
                    { wch: 15 },
                    { wch: 20 },
                    { wch: 12 },
                    { wch: 30 },
                ];
                XLSX.utils.book_append_sheet(
                    workbook,
                    riskSheet,
                    "⚠️ Cảnh báo rủi ro cao",
                );
            }

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
            const fileName = `Bao_cao_mon_du_${dateRange.startDate}_den_${dateRange.endDate}_${timestamp}`;

            saveAs(blob, `${fileName}.xlsx`);

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
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);

        setDateRange({
            startDate: sevenDaysAgo.toISOString().split("T")[0],
            endDate: today.toISOString().split("T")[0],
        });
        setSelectedCategory("all");
        setSelectedRiskLevel("all");
        setSearchKeyword("");
    };

    // Danh sách danh mục
    const categories = [
        "all",
        "Món chính",
        "Món phụ",
        "Món khai vị",
        "Món tráng miệng",
    ];
    const riskLevels = ["all", "Cao", "Trung bình", "Thấp"];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    📊 Báo cáo món dư (Surplus)
                </h1>
                <p className="text-gray-500">
                    Báo cáo chi tiết về các món ăn bị dư thừa, hao hụt và đề
                    xuất giải pháp
                </p>
            </div>

            {/* Panel lọc */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter size={20} className="text-green-500" />
                    <h2 className="text-lg font-semibold text-gray-700">
                        Bộ lọc báo cáo
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                    {/* Mức rủi ro */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mức rủi ro
                        </label>
                        <select
                            value={selectedRiskLevel}
                            onChange={(e) =>
                                setSelectedRiskLevel(e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            {riskLevels.map((level) => (
                                <option key={level} value={level}>
                                    {level === "all" ? "Tất cả" : level}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tìm kiếm */}
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Search size={14} className="inline mr-1" />
                            Tìm kiếm món ăn
                        </label>
                        <input
                            type="text"
                            placeholder="Nhập tên món hoặc mã món..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Nút hành động */}
                    <div className="flex gap-2 items-end">
                        <button
                            onClick={handleResetFilters}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw size={16} />
                            Đặt lại
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={isExporting || surplusData.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* Thống kê nhanh - Chỉ hiển thị khi có dữ liệu */}
            {surplusData.length > 0 && (
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
                                <p className="text-xs opacity-80 mt-1">
                                    {statistics.totalDishes} món có dư
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
                                <p className="text-xs opacity-80 mt-1">
                                    Cần giảm thiểu
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
                                <p className="text-xs opacity-80 mt-1">
                                    Từ món đã phục vụ
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
                                <p className="text-xs opacity-80 mt-1">
                                    {statistics.avgSurplusRate > 25
                                        ? "⚠️ Cao hơn mức cho phép"
                                        : "✅ Trong mức cho phép"}
                                </p>
                            </div>
                            <FileSpreadsheet size={32} className="opacity-80" />
                        </div>
                    </div>
                </div>
            )}

            {/* Bảng hiển thị dữ liệu */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-700">
                            📋 Danh sách món dư ({surplusData.length} món)
                        </h3>
                        {statistics.highRiskCount > 0 && (
                            <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                                ⚠️ {statistics.highRiskCount} món rủi ro cao
                            </span>
                        )}
                    </div>
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

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                        <span className="ml-3 text-gray-500">
                            Đang tải dữ liệu...
                        </span>
                    </div>
                ) : (
                    showPreview && (
                        <div className="overflow-x-auto">
                            {surplusData.length > 0 ? (
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr className="text-gray-600 text-sm border-b">
                                            <th className="px-4 py-3 text-left">
                                                Mã
                                            </th>
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
                                            <th className="px-4 py-3 text-left">
                                                Ghi chú
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {surplusData.map((item) => (
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
                                                            item.surplusRate >
                                                            30
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
                                                    {formatPrice(
                                                        item.wasteCost,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-green-500">
                                                    {formatPrice(item.revenue)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-center">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs ${
                                                            item.riskLevel ===
                                                            "Cao"
                                                                ? "bg-red-100 text-red-600"
                                                                : item.riskLevel ===
                                                                    "Trung bình"
                                                                  ? "bg-yellow-100 text-yellow-600"
                                                                  : "bg-green-100 text-green-600"
                                                        }`}
                                                    >
                                                        {item.riskLevel}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                                                    {item.note || "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-12">
                                    <AlertCircle
                                        size={48}
                                        className="mx-auto text-gray-400 mb-3"
                                    />
                                    <p className="text-gray-500">
                                        Không có dữ liệu món dư trong khoảng
                                        thời gian này
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Vui lòng điều chỉnh lại bộ lọc
                                    </p>
                                </div>
                            )}
                        </div>
                    )
                )}
            </div>

            {/* Hướng dẫn */}
            <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-blue-500 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-1">
                            Hướng dẫn xuất báo cáo món dư
                        </h4>
                        <p className="text-sm text-blue-600">
                            1. Chọn khoảng thời gian cần báo cáo
                            <br />
                            2. Lọc theo danh mục hoặc mức rủi ro (nếu cần)
                            <br />
                            3. Nhấn "Xuất Excel" để tải file báo cáo về máy
                            <br />
                            4. File Excel bao gồm: Chi tiết món dư, Thống kê
                            tổng hợp, Cảnh báo rủi ro cao
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SurplusReport;

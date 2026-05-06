import React, { useState, useEffect, useCallback } from "react";
import {
    Lightbulb,
    AlertTriangle,
    RefreshCw,
    Clock,
    TrendingUp,
} from "lucide-react";
import { kitchenDishAPI } from "../../services/kitchenApi";

const KitchenDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const getUserNameFromToken = () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return "Nguyễn Văn A";

            const payload = JSON.parse(atob(token.split(".")[1]));

            // Thử lấy từ các trường khác nhau
            let name =
                payload.name ||
                payload.fullName ||
                payload.full_name ||
                payload.username ||
                payload.email?.split("@")[0] ||
                "Nguyễn Văn A";

            // Fix lỗi encoding
            name = name
                .replace(/Ä/g, "ă")
                .replace(/Ä/g, "Ă")
                .replace(/â/g, "â")
                .replace(/Ä/g, "ă");

            return name;
        } catch (error) {
            return "Nguyễn Văn A";
        }
    };
    // State cho dashboard data
    const [dashboardData, setDashboardData] = useState({
        wastePercent: "0",
        wasteTrend: "+0",
        topWastedDish: {
            name: "--",
            quantity: 0,
            total: 0,
        },
        warningDishes: [],
    });

    // State cho dữ liệu AI
    const [aiData, setAiData] = useState({
        wasteAI: [],
        customerAI: null,
    });

    // State cho món dư cao nhất hôm nay (dùng từ leftover API)
    const [topWastedToday, setTopWastedToday] = useState({
        name: "--",
        served: 0,
        wasted: 0,
        wastePercentage: "0",
    });

    // Helper: format date
    const formatDate = (dateString) => {
        if (!dateString) return "--";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
    };

    // Fetch dữ liệu AI
    const fetchAIData = useCallback(async () => {
        try {
            const [wasteAIResponse, customerAIResponse] = await Promise.all([
                kitchenDishAPI.getWasteAI(),
                kitchenDishAPI.getCustomerAI(),
            ]);

            const wasteAIData =
                wasteAIResponse?.data?.[0]?.ai_analysis_details ||
                wasteAIResponse?.data ||
                [];
            const customerAIData = customerAIResponse?.data?.[0] || null;

            setAiData({
                wasteAI: wasteAIData,
                customerAI: customerAIData,
            });
        } catch (err) {
            console.error("Fetch AI data error:", err);
        }
    }, []);

    // Fetch dữ liệu chính
    const fetchDashboardData = useCallback(async () => {
        setError(null);
        try {
            const [payYesterday, leftoverDishes, warningDishes] =
                await Promise.all([
                    kitchenDishAPI.getReportPayYesterday(),
                    kitchenDishAPI.getReportLeftoverDishes(),
                    kitchenDishAPI.getReportWarningDishes(),
                ]);

            // ========== 1. Xử lý % lãng phí từ pay-yesterday ==========
            const totalPrepared = payYesterday?.data?.total_prepared || 0;
            const totalWasted = payYesterday?.data?.total_wasted || 0;
            const wastePercent =
                totalPrepared > 0
                    ? ((totalWasted / totalPrepared) * 100).toFixed(1)
                    : "0";

            // Trend: tạm thời để "+0" vì API chưa trả về
            const wasteTrend = "+0";

            // ========== 2. Xử lý món dư nhiều nhất từ leftover-dishes ==========
            // Cấu trúc API: data.result.quantity_wasted, data.ResutlDetail["dish.name"], data.ResutlDetail.quantity_prepared
            const leftoverResult = leftoverDishes?.data?.result || {};
            const leftoverDetail = leftoverDishes?.data?.ResutlDetail || {};

            const topDishName = leftoverDetail["dish.name"] || "--";
            const topDishQuantity = leftoverResult.quantity_wasted || 0;
            const topDishTotal = leftoverDetail.quantity_prepared || 0;

            // Tính % lãng phí cho món dư nhiều nhất
            const topDishWastePercent =
                topDishTotal > 0
                    ? ((topDishQuantity / topDishTotal) * 100).toFixed(1)
                    : "0";

            // ========== 3. Xử lý bảng cảnh báo từ warning-dishes ==========
            // Cấu trúc API: data là array, mỗi item có: quantity_prepared, quantity_wasted, waste_percent, dish.name, daily_operation.operation_date
            const rawWarningDishes = warningDishes?.data || [];
            const formattedWarningDishes = rawWarningDishes.map((dish) => ({
                id: dish.id,
                dishName: dish["dish.name"] || "--",
                prepared: dish.quantity_prepared || 0,
                wasted: dish.quantity_wasted || 0,
                wastePercent: dish.waste_percent || "0",
                date: dish["daily_operation.operation_date"] || null,
            }));

            setDashboardData({
                wastePercent,
                wasteTrend,
                topWastedDish: {
                    name: topDishName,
                    quantity: topDishQuantity,
                    total: topDishTotal,
                },
                warningDishes: formattedWarningDishes,
            });

            // ========== 4. Cập nhật món dư cao hôm nay (box đỏ) ==========
            if (topDishName !== "--" && topDishTotal > 0) {
                setTopWastedToday({
                    name: topDishName,
                    served: topDishTotal,
                    wasted: topDishQuantity,
                    wastePercentage: topDishWastePercent,
                });
            } else {
                // Fallback theo hình ảnh nếu không có dữ liệu
                setTopWastedToday({
                    name: "Cơm trắng",
                    served: 100,
                    wasted: 10,
                    wastePercentage: "10.0",
                });
            }

            await fetchAIData();
        } catch (err) {
            console.error("Fetch dashboard error:", err);
            setError(
                err?.response?.data?.message ||
                    err?.message ||
                    "Có lỗi xảy ra khi tải dữ liệu",
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [fetchAIData]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardData();
    };

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-[#f9f8fd] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10BC5D] mx-auto mb-4"></div>
                    <p className="text-[#3D3D3D]">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen w-full bg-[#f9f8fd] flex items-center justify-center p-4">
                <div className="text-center bg-red-50 p-8 rounded-2xl max-w-md">
                    <AlertTriangle className="text-red-500 w-12 h-12 mx-auto mb-4" />
                    <p className="text-red-600 mb-4 font-medium">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="bg-[#10BC5D] text-white px-6 py-2 rounded-xl hover:bg-[#10BC5D]/90 transition-colors flex items-center gap-2 mx-auto"
                    >
                        <RefreshCw size={18} />
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#f9f8fd]">
            <main className="w-full px-4 md:px-8 py-4 md:py-4">
                <div className="max-w-[1600px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cột trái - 2/3 */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Banner chào buổi sáng */}
                            <div className="bg-gradient-to-r from-[#10BC5D] to-[#10BC5D]/80 rounded-2xl py-8 md:py-10 px-6 md:px-8 text-white shadow-lg">
                                <h4 className="text-white text-3xl md:text-4xl font-bold mb-2">
                                    Chào buổi sáng, {getUserNameFromToken()}!
                                </h4>
                                <p className="text-sm md:text-base text-white/90 leading-relaxed">
                                    Hôm nay hệ thống ghi nhận món có tỷ lệ dư
                                    thừa cao. Hãy kiểm tra cảnh báo để điều
                                    chỉnh lượng chuẩn bị phù hợp.
                                </p>
                            </div>

                            {/* Cảnh báo lãng phí */}
                            <div>
                                <h3 className="text-[#3b97d1] font-semibold text-xl md:text-2xl mb-2">
                                    Cảnh báo lãng phí
                                </h3>

                                {/* 2 thẻ: % lãng phí & món dư nhiều nhất */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                    <div className="bg-white border rounded-2xl p-6 shadow-sm">
                                        <p className="text-base text-[#3D3D3D] mb-2">
                                            % lãng phí hôm qua
                                        </p>
                                        <div className="mb-2">
                                            <span className="text-4xl md:text-5xl font-bold text-[#141C21]">
                                                {dashboardData.wastePercent}%
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-white border rounded-2xl p-6 shadow-sm">
                                        <p className="text-base text-[#3D3D3D] mb-2">
                                            Món dư nhiều nhất
                                        </p>
                                        <p className="font-semibold text-2xl md:text-3xl text-[#141C21] break-words">
                                            {dashboardData.topWastedDish.name}
                                        </p>
                                        <p className="text-sm text-[#8B8B8B] mt-1">
                                            {
                                                dashboardData.topWastedDish
                                                    .quantity
                                            }{" "}
                                            suất dư hôm qua
                                            {dashboardData.topWastedDish.total >
                                                0 &&
                                                ` / Tổng ${dashboardData.topWastedDish.total} suất`}
                                        </p>
                                    </div>
                                </div>

                                {/* Món dư cao hôm nay (box đỏ) */}
                                {topWastedToday &&
                                    topWastedToday.name !== "--" && (
                                        <div className="bg-white border-2 border-red-300 rounded-2xl p-5 mb-6 shadow-sm">
                                            {/* Dòng trên cùng: Cảnh báo cao + thời gian */}
                                            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                                                        Cảnh báo cao
                                                    </span>
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Clock size={12} />
                                                        Hôm qua
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Tiêu đề Món dư cao hôm nay */}
                                            <h4 className="font-bold text-xl text-[#141C21] mb-3">
                                                Món dư cao hôm qua
                                            </h4>

                                            {/* Nội dung chính */}
                                            <p className="text-gray-800 text-base">
                                                <span className="font-bold text-[#141C21]">
                                                    {topWastedToday.name}
                                                </span>{" "}
                                                dư{" "}
                                                <span className="font-bold text-red-600">
                                                    {topWastedToday.wasted}
                                                </span>{" "}
                                                suất trên tổng{" "}
                                                <span className="font-semibold">
                                                    {topWastedToday.served}
                                                </span>{" "}
                                                suất, tỷ lệ lãng phí{" "}
                                                <span className="font-semibold">
                                                    {
                                                        topWastedToday.wastePercentage
                                                    }
                                                    %
                                                </span>
                                                .
                                            </p>

                                            {/* Dòng cuối: Xem chi tiết + Đối chiếu dữ liệu */}
                                            {/* <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-100">
                                                <button className="text-red-500 font-semibold text-sm hover:text-red-700 transition">
                                                    Xem chi tiết
                                                </button>
                                                <button className="text-gray-400 text-xs hover:text-gray-600 transition">
                                                    Đối chiếu dữ liệu
                                                </button>
                                            </div> */}
                                        </div>
                                    )}

                                {/* Bảng chi tiết món đang cảnh báo - Đã bỏ cột Xu hướng & Khuyến nghị, thêm cột Ngày */}
                                <h4 className="font-medium text-xl text-[#141C21] mb-4">
                                    Chi tiết món đang cảnh báo
                                </h4>
                                <div className="overflow-x-auto border border-[#D1D1D1] rounded-2xl shadow-sm">
                                    <table className="w-full text-sm">
                                        <thead className="bg-[#F7F9FC]">
                                            <tr className="border-b border-[#D1D1D1]">
                                                <th className="text-left py-4 px-5 text-[#8B8B8B] font-semibold">
                                                    Ngày
                                                </th>
                                                <th className="text-left py-4 px-5 text-[#8B8B8B] font-semibold">
                                                    Món
                                                </th>
                                                <th className="text-left py-4 px-5 text-[#8B8B8B] font-semibold">
                                                    Món ra
                                                </th>
                                                <th className="text-left py-4 px-5 text-[#8B8B8B] font-semibold">
                                                    Món dư
                                                </th>
                                                <th className="text-left py-4 px-5 text-[#8B8B8B] font-semibold">
                                                    % lãng phí
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dashboardData.warningDishes
                                                .length > 0 ? (
                                                dashboardData.warningDishes.map(
                                                    (dish) => (
                                                        <tr
                                                            key={dish.id}
                                                            className="border-b border-[#D1D1D1] hover:bg-gray-50 transition-colors"
                                                        >
                                                            <td className="py-4 px-5 text-[#3D3D3D] whitespace-nowrap">
                                                                {formatDate(
                                                                    dish.date,
                                                                )}
                                                            </td>
                                                            <td className="py-4 px-5 font-semibold text-[#141C21]">
                                                                {dish.dishName}
                                                            </td>
                                                            <td className="py-4 px-5 text-[#3D3D3D]">
                                                                {dish.prepared}
                                                            </td>
                                                            <td className="py-4 px-5 text-[#3D3D3D]">
                                                                {dish.wasted}
                                                            </td>
                                                            <td className="py-4 px-5 text-red-500 font-semibold">
                                                                {
                                                                    dish.wastePercent
                                                                }
                                                                %
                                                            </td>
                                                        </tr>
                                                    ),
                                                )
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan="5"
                                                        className="text-center py-8 text-[#8B8B8B]"
                                                    >
                                                        Không có dữ liệu cảnh
                                                        báo
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Cột phải - Gợi ý AI (1/3) - Giữ nguyên */}
                        <div className="lg:col-span-1">
                            <div className="bg-white border border-[#D1D1D1] rounded-2xl p-6 sticky top-6 shadow-lg">
                                <div className="text-center mb-6">
                                    <div className="flex items-center justify-center gap-3 mb-2">
                                        <span className="text-3xl">✨</span>
                                        <h3 className="font-semibold text-2xl text-[#141C21]">
                                            Gợi ý AI
                                        </h3>
                                    </div>
                                    <p className="text-base text-[#8B8B8B]">
                                        Dự báo chuẩn bị cho ngày hôm nay dựa
                                        trên dữ liệu lịch sử và xu hướng khách
                                        hàng.
                                    </p>
                                </div>

                                {/* Dự đoán số lượng khách từ AI */}
                                {aiData.customerAI && (
                                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-[#141C21]">
                                                📈 Dự đoán số lượng khách
                                            </span>
                                            <span
                                                className={`text-sm px-2 py-1 rounded-full ${
                                                    aiData.customerAI
                                                        .risk_level === "high"
                                                        ? "bg-red-100 text-red-700"
                                                        : aiData.customerAI
                                                                .risk_level ===
                                                            "medium"
                                                          ? "bg-yellow-100 text-yellow-700"
                                                          : "bg-green-100 text-green-700"
                                                }`}
                                            >
                                                Rủi ro:{" "}
                                                {aiData.customerAI
                                                    .risk_level === "high"
                                                    ? "Cao"
                                                    : aiData.customerAI
                                                            .risk_level ===
                                                        "medium"
                                                      ? "Trung bình"
                                                      : "Thấp"}
                                            </span>
                                        </div>
                                        <div className="text-3xl font-bold text-[#141C21] mb-2">
                                            {
                                                aiData.customerAI
                                                    .ai_customer_count
                                            }{" "}
                                            khách
                                        </div>
                                        <p className="text-sm text-[#8B8B8B] leading-relaxed">
                                            {aiData.customerAI.summary}
                                        </p>
                                    </div>
                                )}

                                {/* Đề xuất số lượng chuẩn bị */}
                                <div className="space-y-4 mb-6">
                                    <h4 className="font-semibold text-[#141C21] border-b pb-2">
                                        🍽️ Đề xuất số lượng chuẩn bị
                                    </h4>
                                    {aiData.wasteAI.length > 0 ? (
                                        aiData.wasteAI
                                            .slice(0, 5)
                                            .map((item, index) => {
                                                const dishName =
                                                    item.dish?.name ||
                                                    "Tên món";
                                                const recommendedQty =
                                                    item.recommended_quantity ||
                                                    0;
                                                const predictedWaste =
                                                    item.predicted_waste_quantity ||
                                                    0;
                                                const currentQty =
                                                    recommendedQty +
                                                    predictedWaste;

                                                return (
                                                    <div
                                                        key={item.id || index}
                                                        className="pb-4 border-b border-[#D1D1D1]/50"
                                                    >
                                                        <div className="flex justify-between items-baseline mb-2">
                                                            <span className="font-semibold text-base text-[#141C21]">
                                                                {dishName}
                                                            </span>
                                                            <span className="text-xl font-bold text-[#141C21]">
                                                                {currentQty}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-sm mb-2">
                                                            <span className="text-[#8B8B8B]">
                                                                Nguy cơ dư thừa
                                                            </span>
                                                            <span className="text-orange-500 font-semibold">
                                                                {predictedWaste}{" "}
                                                                suất dư
                                                            </span>
                                                        </div>
                                                        <div className="h-2 bg-[#D1D1D1] rounded-full overflow-hidden mb-2">
                                                            <div
                                                                className="h-full bg-[#10BC5D] rounded-full"
                                                                style={{
                                                                    width: `${Math.min(100, (recommendedQty / currentQty) * 100)}`,
                                                                }}
                                                            />
                                                        </div>
                                                        <p className="text-xs text-[#8B8B8B] mt-1">
                                                            AI dự báo cần{" "}
                                                            {recommendedQty}{" "}
                                                            suất, đang chuẩn bị{" "}
                                                            {currentQty} suất
                                                        </p>
                                                        {item.suggestion_note && (
                                                            <p className="text-xs text-[#8B8B8B] mt-2 italic">
                                                                💡{" "}
                                                                {
                                                                    item.suggestion_note
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })
                                    ) : (
                                        <div className="text-center py-8 text-[#8B8B8B]">
                                            <p>Đang cập nhật dữ liệu AI...</p>
                                        </div>
                                    )}
                                </div>

                                {/* Mẹo giảm lãng phí */}
                                <div className="bg-[#F0FFF4] rounded-xl p-5 border border-[#10BC5D]/30">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-[#10BC5D]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Lightbulb
                                                size={20}
                                                className="text-[#10BC5D]"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-semibold text-[#141C21] mb-2">
                                                Mẹo giảm lãng phí
                                            </h4>
                                            <p className="text-sm text-[#3D3D3D] leading-relaxed">
                                                Ưu tiên rà soát các món có tỷ lệ
                                                lãng phí cao trước. Với món
                                                chuẩn bị cao hơn AI dự đoán, nên
                                                điều chỉnh giảm 5–10% ở ca tiếp
                                                theo để tránh dư thừa.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default KitchenDashboard;

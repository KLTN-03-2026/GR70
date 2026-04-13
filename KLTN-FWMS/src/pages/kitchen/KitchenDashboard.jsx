import React, { useState, useEffect, useCallback } from "react";
import { Lightbulb, AlertTriangle, RefreshCw } from "lucide-react";
import { kitchenDishAPI } from "../../services/kitchenApi";

const KitchenDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState({
        wastePercent: "0",
        wasteTrend: "0",
        topWastedDish: {
            name: "--",
            quantity: 0,
            total: 0,
        },
        warningDishes: [],
    });

    // Hàm fetch dữ liệu
    const fetchDashboardData = useCallback(async () => {
        setError(null);

        try {
            // Gọi song song 3 API
            const [payYesterday, leftoverDishes, warningDishes] =
                await Promise.all([
                    kitchenDishAPI.getReportPayYesterday(),
                    kitchenDishAPI.getReportLeftoverDishes(),
                    kitchenDishAPI.getReportWarningDishes(),
                ]);

            console.log("Pay Yesterday Data:", payYesterday);
            console.log("Leftover Dishes Data:", leftoverDishes);
            console.log("Warning Dishes Data:", warningDishes);

            // Xử lý dữ liệu từ API (điều chỉnh theo format thực tế)
            setDashboardData({
                wastePercent:
                    payYesterday?.data?.waste_percent ||
                    payYesterday?.waste_percent ||
                    "0",
                wasteTrend:
                    payYesterday?.data?.trend || payYesterday?.trend || "+0",
                topWastedDish: {
                    name:
                        leftoverDishes?.data?.dish_name ||
                        leftoverDishes?.dish_name ||
                        "--",
                    quantity:
                        leftoverDishes?.data?.waste_quantity ||
                        leftoverDishes?.waste_quantity ||
                        0,
                    total:
                        leftoverDishes?.data?.total_quantity ||
                        leftoverDishes?.total_quantity ||
                        0,
                },
                warningDishes: warningDishes?.data || warningDishes || [],
            });
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
    }, []);

    // Refresh handler
    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardData();
    };

    // Load dữ liệu lần đầu
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Loading state
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

    // Error state
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
            <main className="w-full px-4 md:px-8 py-6 md:py-8">
                <div className="max-w-[1600px] mx-auto">
                    {/* Header với nút refresh */}
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D1D1D1] rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw
                                size={18}
                                className={refreshing ? "animate-spin" : ""}
                            />
                            <span className="text-sm">Làm mới</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - 2/3 */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Welcome Banner */}
                            <div className="bg-gradient-to-r from-[#10BC5D] to-[#10BC5D]/80 rounded-2xl p-6 md:p-8 text-white shadow-lg">
                                <h4 className="text-white text-xl md:text-2xl font-semibold mb-2">
                                    Chào buổi sáng, Nguyễn Văn A!
                                </h4>
                                <p className="text-sm md:text-base text-white/90 leading-relaxed">
                                    Hôm nay hệ thống ghi nhận món có tỷ lệ dư
                                    thừa cao. Hãy kiểm tra cảnh báo để điều
                                    chỉnh lượng chuẩn bị phù hợp.
                                </p>
                            </div>

                            {/* Waste Alerts Section */}
                            <div>
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-[#3b97d1] font-semibold text-xl md:text-2xl">
                                        Cảnh báo lãng phí
                                    </h3>
                                </div>

                                {/* Waste Stats */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                    <div className="bg-white border rounded-2xl p-6">
                                        <p className="text-base text-[#3D3D3D] mb-2">
                                            % lãng phí hôm qua
                                        </p>
                                        <div className="mb-2">
                                            <span className="text-4xl md:text-5xl font-bold text-[#141C21]">
                                                {dashboardData.wastePercent}%
                                            </span>
                                        </div>
                                        <span className="text-sm text-[#e8c658] px-2 py-1 rounded-full inline-block">
                                            {dashboardData.wasteTrend}% so với
                                            hôm qua
                                        </span>
                                    </div>

                                    <div className="bg-white border rounded-2xl p-6">
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
                                            suất dư hôm nay
                                            {dashboardData.topWastedDish.total >
                                                0 &&
                                                ` / Tổng ${dashboardData.topWastedDish.total} suất`}
                                        </p>
                                    </div>
                                </div>

                                {/* Warning Table */}
                                <h4 className="font-medium text-xl text-[#141C21] mb-4">
                                    Chi tiết món đang cảnh báo
                                </h4>
                                <div className="overflow-x-auto border border-[#D1D1D1] rounded-2xl shadow-sm">
                                    <table className="w-full text-sm">
                                        <thead className="bg-[#F7F9FC]">
                                            <tr className="border-b border-[#D1D1D1]">
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
                                                <th className="text-left py-4 px-5 text-[#8B8B8B] font-semibold">
                                                    Chi phí
                                                </th>
                                                <th className="text-left py-4 px-5 text-[#8B8B8B] font-semibold">
                                                    Xu hướng
                                                </th>
                                                <th className="text-left py-4 px-5 text-[#8B8B8B] font-semibold">
                                                    Khuyến nghị
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dashboardData.warningDishes
                                                .length > 0 ? (
                                                dashboardData.warningDishes.map(
                                                    (dish, index) => (
                                                        <tr
                                                            key={index}
                                                            className="border-b border-[#D1D1D1] hover:bg-gray-50 transition-colors"
                                                        >
                                                            <td className="py-4 px-5 font-semibold text-[#141C21]">
                                                                {dish.dish_name ||
                                                                    dish.name}
                                                            </td>
                                                            <td className="py-4 px-5 text-[#3D3D3D]">
                                                                {dish.served ||
                                                                    dish.quantity_served ||
                                                                    "--"}
                                                            </td>
                                                            <td className="py-4 px-5 text-[#3D3D3D]">
                                                                {dish.wasted ||
                                                                    dish.quantity_wasted ||
                                                                    "--"}
                                                            </td>
                                                            <td className="py-4 px-5 text-red-500 font-semibold">
                                                                {dish.waste_percentage ||
                                                                    dish.waste_percent ||
                                                                    "--"}
                                                                %
                                                            </td>
                                                            <td className="py-4 px-5 text-[#3D3D3D]">
                                                                {dish.cost
                                                                    ? `${dish.cost.toLocaleString()}đ`
                                                                    : "--"}
                                                            </td>
                                                            <td className="py-4 px-5 text-[#3D3D3D]">
                                                                {dish.trend ||
                                                                    "--"}
                                                            </td>
                                                            <td className="py-4 px-5 text-[#10BC5D] font-medium">
                                                                {dish.recommendation ||
                                                                    "--"}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan="7"
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

                        {/* Right Column - AI Suggestions */}
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
                                        Dự báo chuẩn bị cho ngày hôm nay
                                    </p>
                                </div>

                                {/* AI Predictions */}
                                <div className="space-y-4 mb-6">
                                    {dashboardData.warningDishes
                                        .slice(0, 3)
                                        .map((dish, index) => (
                                            <div
                                                key={index}
                                                className="pb-4 border-b border-[#D1D1D1]/50"
                                            >
                                                <div className="flex justify-between items-baseline mb-2">
                                                    <span className="font-semibold text-base text-[#141C21]">
                                                        {dish.dish_name ||
                                                            dish.name}
                                                    </span>
                                                    <span className="text-xl font-bold text-[#141C21]">
                                                        {dish.served ||
                                                            dish.quantity_served ||
                                                            0}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span className="text-[#8B8B8B]">
                                                        Nguy cơ dư thừa
                                                    </span>
                                                    <span className="text-orange-500 font-semibold">
                                                        {dish.wasted ||
                                                            dish.quantity_wasted ||
                                                            0}{" "}
                                                        suất dư
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-[#D1D1D1] rounded-full overflow-hidden mb-2">
                                                    <div
                                                        className="h-full bg-[#10BC5D] rounded-full"
                                                        style={{
                                                            width: `${100 - (parseFloat(dish.waste_percentage) || 0)}%`,
                                                        }}
                                                    />
                                                </div>
                                                <p className="text-sm text-[#8B8B8B] mt-2">
                                                    Tỷ lệ lãng phí:{" "}
                                                    {dish.waste_percentage ||
                                                        dish.waste_percent ||
                                                        0}
                                                    %
                                                </p>
                                            </div>
                                        ))}
                                </div>

                                {/* Tip Box */}
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
                                                chuẩn bị cao hơn nhu cầu thực
                                                tế, nên điều chỉnh giảm 5–10% ở
                                                ca tiếp theo để tránh dư thừa.
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

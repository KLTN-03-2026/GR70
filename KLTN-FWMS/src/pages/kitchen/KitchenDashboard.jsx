import {
    Bell,
    Search,
    ChevronRight,
    AlertTriangle,
    Lightbulb,
    TrendingUp,
    FileText,
    MessageSquare,
    Package,
    PlusCircle,
    BarChart3,
    Clock,
} from "lucide-react";

const KitchenDashboard = () => {
    return (
        <div className="min-h-screen w-full bg-[#f9f8fd]">
            {/* Main */}
            <main className="w-full px-8 py-8">
                <div className="max-w-[1600px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - 2/3 */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Welcome Banner */}
                            <div className="bg-gradient-to-r from-[#10BC5D] to-[#10BC5D]/80 rounded-2xl p-8 text-white shadow-lg">
                                <h4 className="text-white text-2xl font-semibold mb-2">
                                    Chào buổi sáng, Nguyễn Văn A!
                                </h4>
                                <p className="text-base text-white/90 leading-relaxed">
                                    Hôm nay hệ thống ghi nhận món có tỷ lệ dư
                                    thừa cao. Hãy kiểm tra cảnh báo để điều
                                    chỉnh lượng chuẩn bị phù hợp.
                                </p>
                            </div>

                            {/* Waste Alerts Section */}
                            <div>
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-[#141C21] font-semibold text-2xl">
                                        Cảnh báo lãng phí
                                    </h3>
                                </div>

                                {/* Waste Stats - Split into 2 separate cards */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    {/* Left Card - % lãng phí hôm nay */}
                                    <div className="bg-white  border  rounded-2xl p-6">
                                        <p className="text-base text-[#3D3D3D] mb-2">
                                            % lãng phí hôm nay
                                        </p>
                                        <div className="mb-2">
                                            <span className="text-5xl font-bold text-[#141C21]">
                                                8.4%
                                            </span>
                                        </div>
                                        <span className="text-sm text-[#e8c658] px-2 py-1 rounded-full inline-block">
                                            +1.2% so với hôm qua
                                        </span>
                                    </div>

                                    {/* Right Card - Món dư nhiều nhất */}
                                    <div className="bg-white border  rounded-2xl p-6">
                                        <p className="text-base text-[#3D3D3D] mb-2">
                                            Món dư nhiều nhất
                                        </p>
                                        <p className="font-semibold text-3xl text-[#141C21]">
                                            Cơm trắng
                                        </p>
                                        <p className="text-sm text-[#8B8B8B] mt-1">
                                            10 suất dư hôm nay
                                        </p>
                                    </div>
                                </div>

                                {/* Món dư cao hôm nay - ĐÃ SỬA THEO YÊU CẦU MỚI */}
                                <div className="bg-[#FEF2F2] border border-red-200 rounded-2xl p-5 mb-6">
                                    {/* Bố cục 2 cột: trái - phải */}
                                    <div className="flex justify-between gap-4">
                                        {/* Cột trái: nội dung chính */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-red-600 font-bold text-sm uppercase tracking-wide border border-red-200 bg-red-50 px-3 py-1 rounded-full inline-block">
                                                    Cảnh báo cao
                                                </span>
                                                <span className="text-xs text-[#8B8B8B] flex items-center gap-1">
                                                    <svg
                                                        width="13"
                                                        height="13"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                        />
                                                        <polyline points="12 6 12 12 16 14" />
                                                    </svg>
                                                    10 phút trước
                                                </span>
                                            </div>

                                            <h5 className="text-[#141C21] font-semibold text-lg mb-2">
                                                Môn dư cao hôm nay
                                            </h5>
                                            <p className="text-sm text-[#3D3D3D] mb-2">
                                                Cơm trắng dư 10 suất trên tổng
                                                100 suất, tỷ lệ lãng phí 10%.
                                            </p>
                                            <span className="text-sm text-black font-medium border border-white bg-white px-3 py-1 rounded-full inline-block">
                                                +18% so với hôm qua
                                            </span>
                                        </div>

                                        {/* Cột phải: 2 nút xếp dọc */}
                                        <div className="flex flex-col gap-1 ">
                                            <button className="border border-[#D1D1D1] bg-white text-[#3D3D3D] px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap">
                                                Xem chi tiết
                                            </button>
                                            <button className="bg-[#1E1E1E] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-black transition-colors whitespace-nowrap">
                                                Đối chiếu dữ liệu
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Table - GIỐNG ẢNH: có thêm cột Chi phí */}
                                <h4 className="font-medium text-xl text-[#141C21] mb-4">
                                    Chi tiết món đang cảnh báo
                                </h4>
                                <div className="overflow-x-auto border border-[#D1D1D1] rounded-2xl shadow-sm">
                                    <table className="w-full text-sm">
                                        <thead className="bg-[#F7F9FC]">
                                            <tr className="border-b border-[#D1D1D1]">
                                                <th className="text-left py-4 px-5 text-[#8B8B8B] font-semibold text-sm">
                                                    Món
                                                </th>
                                                <th className="text-left py-4 px-5 text-[#8B8B8B] font-semibold text-sm">
                                                    Món ra
                                                </th>
                                                <th className="text-left py-4 px-5 text-[#8B8B8B] font-semibold text-sm">
                                                    Món dư
                                                </th>
                                                <th className="text-left py-4 px-5 text-[#8B8B8B] font-semibold text-sm">
                                                    % lãng phí
                                                </th>
                                                <th className="text-left py-4 px-5 text-[#8B8B8B] font-semibold text-sm">
                                                    Chi phí
                                                </th>
                                                <th className="text-left py-4 px-5 text-[#8B8B8B] font-semibold text-sm">
                                                    Xu hướng
                                                </th>
                                                <th className="text-left py-4 px-5 text-[#8B8B8B] font-semibold text-sm">
                                                    Khuyến nghị
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* Cơm trắng */}
                                            <tr className="border-b border-[#D1D1D1] hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-5 font-semibold text-[#141C21]">
                                                    Cơm trắng
                                                </td>
                                                <td className="py-4 px-5 text-[#3D3D3D]">
                                                    100
                                                </td>
                                                <td className="py-4 px-5 text-[#3D3D3D]">
                                                    10
                                                </td>
                                                <td className="py-4 px-5 text-red-500 font-semibold">
                                                    10%
                                                </td>
                                                <td className="py-4 px-5 text-[#3D3D3D]">
                                                    120.000đ
                                                </td>
                                                <td className="py-4 px-5 text-[#3D3D3D]">
                                                    +18% hôm qua
                                                </td>
                                                <td className="py-4 px-5 text-[#10BC5D] font-medium">
                                                    Giảm chuẩn bị 10%
                                                </td>
                                            </tr>
                                            {/* Sườn nướng */}
                                            <tr className="border-b border-[#D1D1D1] hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-5 font-semibold text-[#141C21]">
                                                    Sườn nướng
                                                </td>
                                                <td className="py-4 px-5 text-[#3D3D3D]">
                                                    45
                                                </td>
                                                <td className="py-4 px-5 text-[#3D3D3D]">
                                                    6
                                                </td>
                                                <td className="py-4 px-5 text-red-500 font-semibold">
                                                    13.3%
                                                </td>
                                                <td className="py-4 px-5 text-[#3D3D3D]">
                                                    95.000đ
                                                </td>
                                                <td className="py-4 px-5 text-[#3D3D3D]">
                                                    Cao hơn TB 7 ngày
                                                </td>
                                                <td className="py-4 px-5 text-[#10BC5D] font-medium">
                                                    Kiểm tra lượng khách
                                                </td>
                                            </tr>
                                            {/* Gà */}
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-5 font-semibold text-[#141C21]">
                                                    Gà
                                                </td>
                                                <td className="py-4 px-5 text-[#3D3D3D]">
                                                    48
                                                </td>
                                                <td className="py-4 px-5 text-[#3D3D3D]">
                                                    5
                                                </td>
                                                <td className="py-4 px-5 text-[#10BC5D] font-semibold">
                                                    AI cảnh báo sớm
                                                </td>
                                                <td className="py-4 px-5 text-[#3D3D3D]">
                                                    —
                                                </td>
                                                <td className="py-4 px-5 text-[#3D3D3D]">
                                                    +20% so với AI
                                                </td>
                                                <td className="py-4 px-5 text-[#10BC5D] font-medium">
                                                    Rà soát kế hoạch nấu
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - AI Suggestions */}
                        <div className="lg:col-span-1">
                            <div className="bg-white border border-[#D1D1D1] rounded-2xl p-6 sticky shadow-lg">
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

                                <p className="text-xs font-semibold text-[#8B8B8B] uppercase tracking-wider mb-5">
                                    Nhu cầu món ăn
                                </p>

                                <div className="space-y-6 mb-8">
                                    {/* Gà */}
                                    <div className="pb-4 border-b border-[#D1D1D1]/50">
                                        <div className="flex justify-between items-baseline mb-2">
                                            <span className="font-semibold text-base text-[#141C21]">
                                                Gà
                                            </span>
                                            <span className="text-2xl font-bold text-[#141C21]">
                                                48
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-[#8B8B8B]">
                                                Nguy cơ dư thừa
                                            </span>
                                            <span className="text-orange-500 font-semibold">
                                                8 suất dư
                                            </span>
                                        </div>
                                        <div className="h-2 bg-[#D1D1D1] rounded-full overflow-hidden mb-2">
                                            <div
                                                className="h-full bg-[#10BC5D] rounded-full"
                                                style={{ width: "83%" }}
                                            />
                                        </div>
                                        <p className="text-sm text-[#8B8B8B] mt-2">
                                            AI dự báo cần 40 suất, đang chuẩn bị
                                            48 suất
                                        </p>
                                    </div>

                                    {/* Cơm trắng */}
                                    <div className="pb-4 border-b border-[#D1D1D1]/50">
                                        <div className="flex justify-between items-baseline mb-2">
                                            <span className="font-semibold text-base text-[#141C21]">
                                                Cơm trắng
                                            </span>
                                            <span className="text-2xl font-bold text-[#141C21]">
                                                100
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-[#8B8B8B]">
                                                Nguy cơ dư thừa
                                            </span>
                                            <span className="text-orange-500 font-semibold">
                                                10 suất dư
                                            </span>
                                        </div>
                                        <div className="h-2 bg-[#D1D1D1] rounded-full overflow-hidden mb-2">
                                            <div
                                                className="h-full bg-[#10BC5D] rounded-full"
                                                style={{ width: "90%" }}
                                            />
                                        </div>
                                        <p className="text-sm text-[#8B8B8B] mt-2">
                                            AI dự báo cần 90 suất, đang chuẩn bị
                                            100 suất
                                        </p>
                                    </div>

                                    {/* Sườn */}
                                    <div>
                                        <div className="flex justify-between items-baseline mb-2">
                                            <span className="font-semibold text-base text-[#141C21]">
                                                Sườn
                                            </span>
                                            <span className="text-2xl font-bold text-[#141C21]">
                                                20
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-[#8B8B8B]">
                                                Nguy cơ dư thừa
                                            </span>
                                            <span className="text-orange-500 font-semibold">
                                                2 suất dư
                                            </span>
                                        </div>
                                        <div className="h-2 bg-[#D1D1D1] rounded-full overflow-hidden mb-2">
                                            <div
                                                className="h-full bg-[#10BC5D] rounded-full"
                                                style={{ width: "90%" }}
                                            />
                                        </div>
                                        <p className="text-sm text-[#8B8B8B] mt-2">
                                            AI dự báo cần 18 suất, đang chuẩn bị
                                            20 suất
                                        </p>
                                    </div>
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

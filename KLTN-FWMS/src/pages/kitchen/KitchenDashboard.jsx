import {
    Bell,
    Search,
    ChevronRight,
    AlertTriangle,
    Lightbulb,
    Clock,
} from "lucide-react";

const foods = [
    { name: "Gà", current: 40, surplus: 5, forecast: 50 },
    { name: "Cơm trắng", current: 100, surplus: 10, forecast: 50 },
    { name: "Sườn", current: 20, surplus: 10, forecast: 50 },
];

const KitchenDashboard = () => {
    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            {/* <header className="bg-white px-6 py-4 flex-shrink-0 border-b border-[var(--color-text-4)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="paragraph-large text-[var(--color-text-3)]">
                            Bảng điều khiển
                        </span>
                        <ChevronRight
                            size={14}
                            className="text-[var(--color-text-4)]"
                        />
                        <span className="paragraph-large text-[var(--color-primary)]">
                            Tổng quan
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-4)]"
                            />
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                className="paragraph-large w-[260px] pl-10 pr-4 py-2 border border-[var(--color-text-4)] rounded-lg focus:outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--color-text-3)]"
                            />
                        </div>
                        <button className="relative">
                            <Bell
                                size={20}
                                className="text-[var(--color-text-1)]"
                            />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-[var(--color-primary)] rounded-full" />
                        </button>
                    </div>
                </div>
            </header> */}

            {/* Main */}
            <main className="flex-1 overflow-y-auto px-6 py-6">
                <div className="grid grid-cols-[1fr_340px] gap-6">
                    {/* ── Left Column ── */}
                    <div>
                        {/* Welcome Banner */}
                        <div className="bg-gradient-to-r from-[var(--color-primary)] to-[#34C759] rounded-xl p-6 text-white mb-7">
                            <h4 className="text-white mb-1">
                                Chào buổi sáng, Nguyễn Văn A!
                            </h4>
                            <p className="paragraph-large text-white/90">
                                Hãy kiểm tra các gợi ý AI để chuẩn bị nguyên
                                liệu tối ưu nhất.
                            </p>
                        </div>

                        {/* Waste Alerts */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[var(--color-text-1)]">
                                Cảnh báo lãng phí
                            </h3>
                            <button className="paragraph-large text-[var(--color-primary)]">
                                Xem tất cả
                            </button>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex gap-4">
                            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle
                                    size={20}
                                    className="text-red-500"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-1">
                                    <h5 className="text-[var(--color-text-1)]">
                                        Lãng phí cao tại khu vực Sơ chế
                                    </h5>
                                    <span className="paragraph-small text-[var(--color-text-3)] flex items-center gap-1 ml-3 whitespace-nowrap">
                                        <Clock size={13} /> 10 phút trước
                                    </span>
                                </div>
                                <p className="paragraph-large text-[var(--color-text-2)]">
                                    Lượng vỏ rau củ bỏ đi vượt mức trung bình
                                    15%. Cần kiểm tra kỹ thuật gọt vỏ của nhân
                                    viên mới.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Right Column: AI Suggestions ── */}
                    <div className="bg-white border border-[var(--color-text-4)] rounded-xl p-5 self-start">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">✨</span>
                            <h4 className="text-[var(--color-text-1)]">
                                Gợi ý AI
                            </h4>
                        </div>
                        <p className="paragraph-small text-[var(--color-text-3)] mb-5">
                            Dự báo chuẩn bị cho ngày hôm nay
                        </p>

                        <p className="paragraph-small font-semibold tracking-widest text-[var(--color-text-3)] uppercase mb-4">
                            Nhu cầu món ăn
                        </p>

                        <div className="flex flex-col gap-5 mb-5">
                            {foods.map(
                                ({ name, current, surplus, forecast }) => (
                                    <div key={name}>
                                        <div className="flex items-baseline justify-between">
                                            <h5 className="text-[var(--color-text-1)]">
                                                {name}
                                            </h5>
                                            <h3 className="text-[var(--color-text-1)]">
                                                {current}
                                            </h3>
                                        </div>
                                        <div className="flex items-baseline justify-between mt-1">
                                            <span className="paragraph-large text-[var(--color-text-3)]">
                                                Dư thừa
                                            </span>
                                            <span className="paragraph-large font-semibold text-orange-400">
                                                {surplus} xuất
                                            </span>
                                        </div>
                                        <div className="h-1 bg-green-50 rounded-full mt-2 overflow-hidden">
                                            <div
                                                className="h-full bg-[var(--color-primary)] rounded-full"
                                                style={{
                                                    width: `${(current / (current + surplus)) * 100}%`,
                                                }}
                                            />
                                        </div>
                                        <p className="paragraph-small text-[var(--color-text-3)] mt-1">
                                            Dự báo cần {forecast} xuất (Tăng so
                                            với hôm qua)
                                        </p>
                                    </div>
                                ),
                            )}
                        </div>

                        {/* Tip */}
                        <div className="bg-[#F0FFF4] border border-[var(--color-primary)] rounded-xl p-4 flex gap-3">
                            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                <Lightbulb
                                    size={18}
                                    className="text-[var(--color-primary)]"
                                />
                            </div>
                            <div>
                                <h6 className="text-[var(--color-text-1)] mb-1">
                                    Mẹo giảm lãng phí
                                </h6>
                                <p className="paragraph-small text-[var(--color-text-2)]">
                                    Sử dụng lá súp lơ còn dư để làm món rau xào
                                    thập cẩm cho suất ăn nhân viên.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default KitchenDashboard;

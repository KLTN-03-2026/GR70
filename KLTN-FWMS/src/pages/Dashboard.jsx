import axios from "axios";
import { useEffect, useState } from "react";

const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
};

const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fadeIn">
                <div
                    className="p-6 text-white"
                    style={{
                        background:
                            "linear-gradient(to right, var(--color-primary), #0da04f)",
                    }}
                >
                    <div className="flex items-center justify-between">
                        <h2
                            className="text-lg font-bold"
                            style={{ fontFamily: "'Arimo', sans-serif" }}
                        >
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">
                                close
                            </span>
                        </button>
                    </div>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

function AddPeopleForm({ onClose }) {
    const [count, setCount] = useState("");
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    // ← THÊM CẢ ĐOẠN NÀY (đặt sau 3 state trên)
    const fetchCustomerCount = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}users/get-customer-count`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            console.log("Customer count response:", response.data);

            // Giả sử API trả về data là số lượng khách
            const customerCount =
                response.data?.data?.customer_count ||
                response.data?.customer_count ||
                response.data;

            if (customerCount && typeof customerCount === "number") {
                setEntries([
                    {
                        count: customerCount,
                        time: getCurrentTime(),
                        date: getCurrentDate(),
                    },
                ]);
            }
        } catch (error) {
            console.error("Lỗi khi lấy số lượng khách:", error);
        } finally {
            setLoading(false);
        }
    };

    // ← THÊM useEffect NÀY
    useEffect(() => {
        fetchCustomerCount();
    }, []);

    const handleAdd = async () => {
        if (!count || isNaN(count) || Number(count) <= 0) return;

        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}users/update-customer-count`,
                { customer_count: Number(count) },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                },
            );

            // ✅ Sửa điều kiện ở đây
            if (response.data?.success === true) {
                setEntries([
                    {
                        count: Number(count),
                        time: getCurrentTime(),
                        date: getCurrentDate(),
                    },
                ]);
                setCount("");
                console.log("Đã thêm thành công:", count, "người");
            } else {
                console.log("API trả về không thành công");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
            alert("Cập nhật thất bại, vui lòng thử lại!");
        }
    };

    return (
        <Modal title="Nhập số lượng người ngày hôm nay" onClose={onClose}>
            <div
                className="space-y-4"
                style={{ fontFamily: "'Nunito', sans-serif" }}
            >
                <div>
                    <label
                        className="block text-sm font-bold mb-1"
                        style={{ color: "var(--color-text-2)" }}
                    >
                        Thời gian nhập
                    </label>
                    <div
                        className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm cursor-not-allowed"
                        style={{ color: "var(--color-text-3)" }}
                    >
                        <span
                            className="material-symbols-outlined text-sm"
                            style={{ color: "var(--color-primary)" }}
                        >
                            schedule
                        </span>
                        <span className="font-semibold">
                            {getCurrentDate()} — {getCurrentTime()}
                        </span>
                        <span
                            className="ml-auto text-xs bg-gray-200 px-2 py-0.5 rounded-full"
                            style={{ color: "var(--color-text-3)" }}
                        >
                            Cố định
                        </span>
                    </div>
                </div>
                <div>
                    <label
                        className="block text-sm font-bold mb-1"
                        style={{ color: "var(--color-text-2)" }}
                    >
                        Số lượng người <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={count}
                        onChange={(e) => setCount(e.target.value)}
                        placeholder="Nhập số lượng người..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none transition-all"
                        style={{
                            fontFamily: "'Nunito', sans-serif",
                            color: "var(--color-text-1)",
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = "var(--color-primary)";
                            e.target.style.boxShadow =
                                "0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent)";
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = "#e5e7eb";
                            e.target.style.boxShadow = "none";
                        }}
                    />
                </div>

                {/* Thay thế đoạn code cũ từ {entries.length > 0 && (...) thành: */}
                {loading ? (
                    <div className="text-center py-4">
                        <span
                            className="text-sm"
                            style={{ color: "var(--color-text-3)" }}
                        >
                            Đang tải dữ liệu...
                        </span>
                    </div>
                ) : entries.length > 0 ? (
                    <div
                        className="rounded-xl p-3 space-y-2 max-h-36 overflow-y-auto border"
                        style={{
                            background:
                                "color-mix(in srgb, var(--color-primary) 5%, transparent)",
                            borderColor:
                                "color-mix(in srgb, var(--color-primary) 20%, transparent)",
                        }}
                    >
                        <p
                            className="text-xs font-bold uppercase tracking-wider"
                            style={{ color: "var(--color-primary)" }}
                        >
                            Đã thêm hôm nay
                        </p>
                        {entries.map((e, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between text-xs bg-white rounded-lg px-3 py-2 border"
                                style={{
                                    borderColor:
                                        "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                                }}
                            >
                                <span
                                    className="font-bold"
                                    style={{ color: "var(--color-text-1)" }}
                                >
                                    {e.count} người
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <span
                            className="text-sm"
                            style={{ color: "var(--color-text-3)" }}
                        >
                            Chưa có dữ liệu nhập hôm nay
                        </span>
                    </div>
                )}

                <button
                    onClick={handleAdd}
                    className="w-full py-3 text-white font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                    style={{
                        background:
                            "linear-gradient(to right, var(--color-primary), #0da04f)",
                        fontFamily: "'Nunito', sans-serif",
                        boxShadow:
                            "0 4px 14px color-mix(in srgb, var(--color-primary) 30%, transparent)",
                    }}
                >
                    <span className="material-symbols-outlined text-sm">
                        person_add
                    </span>
                    Thêm người mới
                </button>
            </div>
        </Modal>
    );
}

export default function Dashboard() {
    const [modal, setModal] = useState(null);
    const token = localStorage.getItem("token");

    const [dataDishes, setDataDishes] = useState(null);
    const [totalRevenueOneMonth, settotalRevenueOneMonth] = useState(null);
    const [lowstockingredient, setlowstockingredient] = useState(null);
    const [Waste_Percentage, setWaste_Percentage] = useState(null);

    useEffect(() => {
        fetchDishes();
        fetchtotalRevenueOneMonth();
        fetchreportlowstock();
        fetch_WastePecentage();
    }, []);
    const fetchDishes = async () => {
        if (!token) return;

        try {
            const res = await axios.get(
                "https://system-waste-less-ai.onrender.com/api/dashboard/get-sum-dishes",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            // console.log(res.data.data);
            setDataDishes(res.data.data);
            // console.log(dataDishes);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchtotalRevenueOneMonth = async () => {
        try {
            const res = await axios.get(
                "https://system-waste-less-ai.onrender.com/api/dashboard/get-sum-revenue",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            settotalRevenueOneMonth(res.data.data);
            // console.log(res.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchreportlowstock = async () => {
        try {
            const res = await axios.get(
                "https://system-waste-less-ai.onrender.com/api/dashboard/get-low-stock-ingredients",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            setlowstockingredient(res.data.data);
            // console.log(res.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    const fetch_WastePecentage = async () => {
        try {
            const res = await axios.get(
                "https://system-waste-less-ai.onrender.com/api/dashboard/get-waste-percentage",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            // console.log(res.data.data);
            setWaste_Percentage(res.data.data);
        } catch (error) {
            console.log(error);
        }
    };
    const number_waste_percentage = parseFloat(Waste_Percentage);

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                rel="stylesheet"
            />

            <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.22s cubic-bezier(.4,0,.2,1); }
      `}</style>

            <div
                className="min-h-screen pl-8"
                style={{ background: "#f6f8f7" }}
            >
                <main
                    className="p-8 max-w-7xl mx-auto"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                    {/* Header */}
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h3
                                className="font-bold"
                                style={{
                                    fontFamily: "'Arimo', sans-serif",
                                    color: "var(--color-text-1)",
                                    fontSize: "24px",
                                    lineHeight: "34px",
                                    margin: 0,
                                }}
                            >
                                Trung tâm Báo cáo
                            </h3>
                            <p
                                className="text-sm mt-0.5"
                                style={{
                                    color: "var(--color-text-3)",
                                    fontFamily: "'Nunito', sans-serif",
                                }}
                            >
                                Hệ thống quản lý và cảnh báo lãng phí thực phẩm
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setModal("add")}
                                className="px-4 py-2.5 bg-white rounded-xl flex items-center gap-2 font-bold text-sm hover:opacity-80 transition-all shadow-sm"
                                style={{
                                    border: "1px solid color-mix(in srgb, var(--color-primary) 40%, transparent)",
                                    color: "var(--color-primary)",
                                    fontFamily: "'Nunito', sans-serif",
                                }}
                            >
                                <span className="material-symbols-outlined text-sm">
                                    person_add
                                </span>
                                Nhập số lượng người ngày hôm nay
                            </button>
                        </div>
                    </div>

                    {/* AI Alert */}
                    <div className="mb-8 p-6 bg-orange-50 border-l-4 border-orange-500 rounded-xl flex items-start gap-4">
                        <div className="bg-orange-500 text-white p-2 rounded-full flex-shrink-0">
                            <span className="material-symbols-outlined text-sm">
                                auto_awesome
                            </span>
                        </div>
                        <div>
                            <p
                                className="font-bold text-orange-800 text-base"
                                style={{ fontFamily: "'Arimo', sans-serif" }}
                            >
                                Cảnh báo lãng phí (AI Alert)
                            </p>
                            <p
                                className="text-orange-700 text-sm mt-1"
                                style={{ fontFamily: "'Nunito', sans-serif" }}
                            >
                                Cảnh báo: Lãng phí món <strong>Phở Bò</strong>{" "}
                                vượt <strong>15%</strong> so với dự báo AI. Vui
                                lòng kiểm tra lại định lượng nguyên liệu hoặc
                                quy trình chế biến tại bếp 01.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-6">
                        {/* Left: Stats + Chart */}
                        <div className="col-span-12 lg:col-span-8">
                            <p
                                className="font-bold text-base mb-4"
                                style={{
                                    color: "var(--color-text-1)",
                                    fontFamily: "'Arimo', sans-serif",
                                }}
                            >
                                Báo cáo số lượng món ăn
                            </p>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    {
                                        label: "Tổng số món",
                                        value: dataDishes?.totalDishes || "0",
                                        badge: "+3",
                                        badgeBg:
                                            "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                                        badgeColor: "var(--color-primary)",
                                    },
                                    {
                                        label: "Đang phục vụ",
                                        value:
                                            dataDishes?.totalServingDishes ||
                                            "0",
                                        badge: "95.2%",
                                        badgeBg: "#f3f4f6",
                                        badgeColor: "var(--color-text-3)",
                                    },
                                    {
                                        label: "Chờ duyệt",
                                        value:
                                            dataDishes?.totalWaitingDishes ||
                                            "0",
                                        badge: "Cần xử lý",
                                        badgeBg: "#fff7ed",
                                        badgeColor: "#f97316",
                                    },
                                ].map((s) => (
                                    <div
                                        key={s.label}
                                        className="bg-white p-6 rounded-xl shadow-sm"
                                        style={{
                                            border: "1px solid color-mix(in srgb, var(--color-primary) 10%, transparent)",
                                        }}
                                    >
                                        <p
                                            className="text-xs font-bold uppercase tracking-wider mb-2"
                                            style={{
                                                color: "var(--color-text-3)",
                                                fontFamily:
                                                    "'Nunito', sans-serif",
                                            }}
                                        >
                                            {s.label}
                                        </p>
                                        <div className="flex justify-between items-end">
                                            <span
                                                className="text-2xl font-bold"
                                                style={{
                                                    color: "var(--color-text-1)",
                                                    fontFamily:
                                                        "'Arimo', sans-serif",
                                                }}
                                            >
                                                {s.value}
                                            </span>
                                            <span
                                                className="text-xs font-bold px-2 py-1 rounded"
                                                style={{
                                                    background: s.badgeBg,
                                                    color: s.badgeColor,
                                                    fontFamily:
                                                        "'Nunito', sans-serif",
                                                }}
                                            >
                                                {s.badge}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Revenue Chart */}
                            <div className="mt-8">
                                <p
                                    className="font-bold text-base mb-4"
                                    style={{
                                        color: "var(--color-text-1)",
                                        fontFamily: "'Arimo', sans-serif",
                                    }}
                                >
                                    Báo cáo tổng doanh thu tháng
                                </p>
                                <div
                                    className="bg-white p-6 rounded-xl shadow-sm h-64 flex flex-col"
                                    style={{
                                        border: "1px solid color-mix(in srgb, var(--color-primary) 10%, transparent)",
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p
                                                className="text-2xl font-bold"
                                                style={{
                                                    color: "var(--color-text-1)",
                                                    fontFamily:
                                                        "'Arimo', sans-serif",
                                                }}
                                            >
                                                {(
                                                    totalRevenueOneMonth *
                                                    26.335
                                                ).toLocaleString()}{" "}
                                                VND
                                            </p>
                                            <p
                                                className="text-sm font-bold flex items-center gap-1 mt-0.5"
                                                style={{
                                                    color: "var(--color-primary)",
                                                    fontFamily:
                                                        "'Nunito', sans-serif",
                                                }}
                                            >
                                                <span className="material-symbols-outlined text-sm">
                                                    trending_up
                                                </span>{" "}
                                                +12% so với tháng trước
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="flex items-center gap-1.5">
                                                <div
                                                    className="w-2.5 h-2.5 rounded-full"
                                                    style={{
                                                        background:
                                                            "var(--color-primary)",
                                                    }}
                                                />
                                                <span
                                                    className="text-xs"
                                                    style={{
                                                        color: "var(--color-text-3)",
                                                        fontFamily:
                                                            "'Nunito', sans-serif",
                                                    }}
                                                >
                                                    Doanh thu
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2.5 h-2.5 bg-gray-200 rounded-full" />
                                                <span
                                                    className="text-xs"
                                                    style={{
                                                        color: "var(--color-text-3)",
                                                        fontFamily:
                                                            "'Nunito', sans-serif",
                                                    }}
                                                >
                                                    Mục tiêu
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 flex items-end gap-2 px-2">
                                        {[60, 75, 90, 65, 80, 95, 100].map(
                                            (h, i) => (
                                                <div
                                                    key={i}
                                                    className="flex-1 rounded-t relative group"
                                                    style={{
                                                        height: `${h}%`,
                                                        background:
                                                            "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                                                    }}
                                                >
                                                    <div
                                                        className="absolute bottom-0 left-0 w-full rounded-t transition-all duration-300 group-hover:opacity-80"
                                                        style={{
                                                            height: "85%",
                                                            background:
                                                                "linear-gradient(to top, var(--color-primary), color-mix(in srgb, var(--color-primary) 70%, transparent))",
                                                        }}
                                                    />
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Waste % + Low Stock */}
                        <div className="col-span-12 lg:col-span-4 space-y-6">
                            {/* Waste gauge */}
                            <div
                                className="bg-white p-6 rounded-xl shadow-sm text-center"
                                style={{
                                    border: "1px solid color-mix(in srgb, var(--color-primary) 10%, transparent)",
                                }}
                            >
                                <p
                                    className="font-bold text-base mb-5"
                                    style={{
                                        color: "var(--color-text-1)",
                                        fontFamily: "'Arimo', sans-serif",
                                    }}
                                >
                                    Báo cáo % lãng phí
                                </p>
                                <div className="relative w-36 h-36 mx-auto mb-4">
                                    <svg
                                        className="w-full h-full -rotate-90"
                                        viewBox="0 0 80 80"
                                    >
                                        <circle
                                            cx="40"
                                            cy="40"
                                            r="32"
                                            fill="none"
                                            stroke="#f0f4f2"
                                            strokeWidth="7"
                                        />
                                        <circle
                                            cx="40"
                                            cy="40"
                                            r="32"
                                            fill="none"
                                            stroke={`${number_waste_percentage <= 5 ? "var(--color-primary)" : number_waste_percentage > 5 && number_waste_percentage <= 10 ? "#f97316" : number_waste_percentage > 10 ? "#ef4444" : ""}`}
                                            strokeWidth="7"
                                            strokeDasharray="201"
                                            strokeDashoffset={
                                                201 -
                                                number_waste_percentage * 2
                                            }
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span
                                            className="text-2xl font-bold"
                                            style={{
                                                color: "var(--color-text-1)",
                                                fontFamily:
                                                    "'Arimo', sans-serif",
                                            }}
                                        >
                                            {Waste_Percentage}
                                        </span>
                                        <span
                                            className="text-xs"
                                            style={{
                                                color: "var(--color-text-3)",
                                                fontFamily:
                                                    "'Nunito', sans-serif",
                                            }}
                                        >
                                            {number_waste_percentage <= 5
                                                ? "Ổn Định"
                                                : number_waste_percentage > 5 &&
                                                    number_waste_percentage <=
                                                        10
                                                  ? "Cảnh báo"
                                                  : number_waste_percentage > 10
                                                    ? "Báo động"
                                                    : ""}
                                        </span>
                                    </div>
                                </div>
                                {/* style={{ color: "var(--color-text-2)", fontFamily: "'Nunito', sans-serif" }} */}
                                <p
                                    className={`text-sm ${number_waste_percentage <= 5 ? "text-[#10BC5D]" : number_waste_percentage > 5 && number_waste_percentage <= 10 ? "text-[#f97316]" : number_waste_percentage > 10 ? "text-[#ef4444]" : ""}`}
                                >
                                    {number_waste_percentage <= 5
                                        ? `Mức lãng phí thực phẩm đang ổn định, chưa có dấu hiệu đáng lo ngại.`
                                        : number_waste_percentage > 5 &&
                                            number_waste_percentage <= 10
                                          ? "Lượng thực phẩm lãng phí đang tăng, cần theo dõi và kiểm soát sớm."
                                          : number_waste_percentage > 10
                                            ? `Mức lãng phí thực phẩm cao hơn ${(number_waste_percentage - 10).toFixed(2)}% ,cần hành động ngay để tránh thất thoát nghiêm trọng!`
                                            : ""}
                                </p>
                            </div>

                            {/* Low stock */}
                            <div
                                className="bg-white p-6 rounded-xl shadow-sm"
                                style={{
                                    border: "1px solid color-mix(in srgb, var(--color-primary) 10%, transparent)",
                                }}
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <p
                                        className="font-bold text-base"
                                        style={{
                                            color: "var(--color-text-1)",
                                            fontFamily: "'Arimo', sans-serif",
                                        }}
                                    >
                                        Nguyên liệu sắp hết
                                    </p>
                                    <span
                                        className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-lg font-bold"
                                        style={{
                                            fontFamily: "'Nunito', sans-serif",
                                        }}
                                    >
                                        4 Cảnh báo
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        {
                                            name: "Sữa tươi",
                                            status: "Còn 2L (Tối thiểu 5L)",
                                            color: "#ef4444",
                                            icon: "priority_high",
                                            iconColor: "#f87171",
                                            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuALpLnaf1p3NHsARbyzz1S8JPF6DdinQLmzrmmY_yvbFDpd8sno8L3qDwdvrSFyYqTA-TgsZ7paqtn_qdSXlXxlCU5uYp73iCq4RC9IwlxdUaZ5-BMV4-75rP3e78n5JKVz_Xeqbe4dwXfSS6aJd8UKUylOv2heygVzk2CdYanmDLzWQQTeunlUts1h14zdV18kmpCVlFGTUe9vDZF6uDTofQPzLptJF5yY6LeCfwpRd1NyGbHpKZAH8y9OPh2_8gdMEamnZjfH0-Q",
                                        },
                                        {
                                            name: "Thịt bò",
                                            status: "Còn 1.5kg (Dưới mức an toàn)",
                                            color: "#f97316",
                                            icon: "warning",
                                            iconColor: "#fb923c",
                                            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHL2oTnRXN7owRLMNWRWMyCab-QpWowthiOemDMvg1WnrTWVGEtRK6HdVZ3Ors4d8eHDp9M83a5WefmtjfkO0spzUGXQ2LXtDWeZ2z8mb1HVsXs1wmH13fhJUFAXlQ6JMRkH2zKF3rpmTlTNWV9qeZmk5uTfgx0eVJFgqtxK0lTGI3GjQscQhJsRG6Ibd6a9WCHrj2sra0BMug2-2EwKMQC54nE3nlXku8FqqIum6jcO7p8InvkuK_NTdBwnytAVJFGf-G43Jwiss",
                                        },
                                        {
                                            name: "Cà chua",
                                            status: "Còn 0.5kg (Sắp hết)",
                                            color: "#f97316",
                                            icon: "warning",
                                            iconColor: "#fb923c",
                                            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtqpLHW7k9YdZWaKUr5sQNK4LPTM_cQ0gI3kPY9t_-ivIPJrazOnSqxYj2fggYE6twpD-fDBLsleITKZYauOhA-YbCMDv0UjMWaRsUo0bBztCaFLDDvoaAxou0jZQPJ7QMchJpAJvHaAQpLBzgRflIFGQtR7fp9RIEsGnJtHQ9rdjjWScPIlBITrXemfqy77lq_4WmE2mz_ovTNLiaALqSbhqTDtJvoNBt6svj5caSj8eqDNm_dunLmcCUj-dU7TdW4EMzVDAPV7I",
                                        },
                                        {
                                            name: "Hành lá",
                                            status: "Còn 0.2kg (Nhập ngay)",
                                            color: "#ef4444",
                                            icon: "priority_high",
                                            iconColor: "#f87171",
                                            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2TkOmaWbre-wLDEOsaLYYM5ZOXfhGl1193whUgt-T8QTGPNyYskKTFxORzWgK5tHHjRlU4nPlB4C0CPSsEDvrPhgY73GZdU34xUSVk7lUa6ZSCbz0qWGUjeIVoXs_Z-xeTw-0y6-YxMClj-gWGGReAqZ_3m2_PeuErUVvZVPZgKxI9gsLB-W-UGBxHxV4Ll8d0iugFm6_56gXOoDJAWbBLHHjKPbmGcDlTKLx_WXZs9PyPzQ3OIVbHYgowv3Q0yNcqAXFZWJlqf8",
                                        },
                                    ].map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-3 pb-3 last:pb-0"
                                            style={{
                                                borderBottom:
                                                    idx < 3
                                                        ? "1px solid #f6f8f7"
                                                        : "none",
                                            }}
                                        >
                                            <div
                                                className="w-10 h-10 rounded-lg bg-center bg-cover flex-shrink-0"
                                                style={{
                                                    backgroundImage: `url('${item.img}')`,
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className="text-sm font-bold"
                                                    style={{
                                                        color: "var(--color-text-1)",
                                                        fontFamily:
                                                            "'Nunito', sans-serif",
                                                    }}
                                                >
                                                    {item.name}
                                                </p>
                                                <p
                                                    className="text-xs font-bold"
                                                    style={{
                                                        color: item.color,
                                                        fontFamily:
                                                            "'Nunito', sans-serif",
                                                    }}
                                                >
                                                    {item.status}
                                                </p>
                                            </div>
                                            <span
                                                className="material-symbols-outlined text-sm"
                                                style={{
                                                    color: item.iconColor,
                                                }}
                                            >
                                                {item.icon}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className="w-full mt-4 py-2 font-bold text-sm rounded-xl hover:opacity-80 transition-colors"
                                    style={{
                                        color: "var(--color-primary)",
                                        border: "1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)",
                                        fontFamily: "'Nunito', sans-serif",
                                    }}
                                >
                                    Xem tất cả nguyên liệu
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Waste Table */}
                    <div
                        className="mt-10 bg-white rounded-xl shadow-sm overflow-hidden"
                        style={{
                            border: "1px solid color-mix(in srgb, var(--color-primary) 10%, transparent)",
                        }}
                    >
                        <div
                            className="p-6 flex justify-between items-center"
                            style={{ borderBottom: "1px solid #f6f8f7" }}
                        >
                            <p
                                className="font-bold text-base"
                                style={{
                                    color: "var(--color-text-1)",
                                    fontFamily: "'Arimo', sans-serif",
                                }}
                            >
                                Chi tiết lãng phí theo danh mục
                            </p>
                            <button
                                className="text-sm font-bold hover:underline"
                                style={{
                                    color: "var(--color-primary)",
                                    fontFamily: "'Nunito', sans-serif",
                                }}
                            >
                                Xem chi tiết
                            </button>
                        </div>
                        <table className="w-full text-left">
                            <thead>
                                <tr
                                    style={{
                                        background: "rgba(246,248,247,0.6)",
                                    }}
                                >
                                    {[
                                        "Danh mục",
                                        "Số lượng",
                                        "Tồn tối thiểu",
                                        "Đơn vị",
                                        "Trạng thái",
                                        "Xu hướng",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className="px-6 py-4 font-bold text-xs uppercase tracking-wider"
                                            style={{
                                                color: "var(--color-text-3)",
                                                fontFamily:
                                                    "'Nunito', sans-serif",
                                            }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {lowstockingredient?.map((value, index) => {
                                    const isLow =
                                        value.current_stock <
                                        value.minimum_stock;

                                    return (
                                        <tr
                                            key={value.id || index}
                                            className="transition-colors hover:bg-gray-50"
                                            style={{
                                                borderTop: "1px solid #f6f8f7",
                                            }}
                                        >
                                            {/* Tên */}
                                            <td className="px-6 py-4 text-sm font-bold">
                                                {value.name}
                                            </td>

                                            {/* Current stock */}
                                            <td className="px-6 py-4 text-sm">
                                                {value.current_stock?.toLocaleString(
                                                    "vi-VN",
                                                )}
                                            </td>

                                            {/* Minimum */}
                                            <td className="px-6 py-4 text-sm">
                                                {value.minimum_stock?.toLocaleString(
                                                    "vi-VN",
                                                )}
                                            </td>

                                            {/* Unit */}
                                            <td className="px-6 py-4 text-sm">
                                                {value.unit?.toLocaleString(
                                                    "vi-VN",
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <span
                                                    className="px-2 py-1 rounded text-xs font-bold"
                                                    style={{
                                                        background: isLow
                                                            ? "#fee2e2"
                                                            : "#dcfce7",
                                                        color: isLow
                                                            ? "#dc2626"
                                                            : "#16a34a",
                                                    }}
                                                >
                                                    {isLow
                                                        ? "Thiếu hàng"
                                                        : "Ổn định"}
                                                </span>
                                            </td>

                                            {/* Trend */}
                                            <td
                                                className="px-6 py-4"
                                                style={{
                                                    color: isLow
                                                        ? "#dc2626"
                                                        : "#16a34a",
                                                }}
                                            >
                                                <span className="material-symbols-outlined align-middle text-sm">
                                                    {isLow
                                                        ? "trending_down"
                                                        : "trending_up"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>

            {modal === "add" && (
                <AddPeopleForm onClose={() => setModal(null)} />
            )}
            {modal === "update" && (
                <UpdatePeopleForm onClose={() => setModal(null)} />
            )}
        </>
    );
}

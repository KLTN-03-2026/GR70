import axios from "axios";
import { Lightbulb } from "lucide-react";
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
    const [error, setError] = useState("");
    // ← THÊM CẢ ĐOẠN NÀY (đặt sau 3 state trên)
    const fetchCustomerCount = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/users/get-customer-count`,
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
        // Validation: Kiểm tra chưa nhập số
        if (!count || count === "") {
            setError("Vui lòng nhập số lượng người!");
            return;
        }

        // Validation: Kiểm tra số không hợp lệ
        if (isNaN(count) || Number(count) <= 0) {
            setError("Số lượng người phải là số và lớn hơn 0!");
            return;
        }

        // Clear error trước khi gọi API
        setError("");

        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/users/update-customer-count`,
                { customer_count: Number(count) },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                },
            );

            if (response.data?.success === true) {
                setEntries([
                    {
                        count: Number(count),
                        time: getCurrentTime(),
                        date: getCurrentDate(),
                    },
                ]);
                setCount("");
                setError(""); // Clear error khi thành công
                console.log("Đã thêm thành công:", count, "người");
            } else {
                setError("Cập nhật thất bại, vui lòng thử lại!");
                console.log("API trả về không thành công");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
            setError("Cập nhật thất bại, vui lòng thử lại!");
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
                        onChange={(e) => {
                            setCount(e.target.value);
                            setError(""); // Clear error khi người dùng bắt đầu nhập
                        }}
                        placeholder="Nhập số lượng người..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none transition-all"
                        style={{
                            fontFamily: "'Nunito', sans-serif",
                            color: "var(--color-text-1)",
                            borderColor: error ? "#ef4444" : undefined, // Thêm viền đỏ nếu có lỗi
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = error
                                ? "#ef4444"
                                : "var(--color-primary)";
                            e.target.style.boxShadow = error
                                ? "0 0 0 3px rgba(239, 68, 68, 0.2)"
                                : "0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent)";
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = error
                                ? "#ef4444"
                                : "#e5e7eb";
                            e.target.style.boxShadow = "none";
                        }}
                    />
                    {/* Hiển thị thông báo lỗi */}
                    {error && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">
                                error
                            </span>
                            {error}
                        </p>
                    )}
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
        fetch_WasteLess_AI();
        fetch_Customer_AI();
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

    const [WasteLess_AI, setWasteLess_AI] = useState();
    const fetch_WasteLess_AI = async () => {
        try {
            const res = await axios.get(
                "https://system-waste-less-ai.onrender.com/api/dashboard/get-waste-ai",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            // console.log(res.data.data?.[0]?.ai_analysis_details);
            setWasteLess_AI(res.data.data?.[0]?.ai_analysis_details);
            // setWasteLess_AI(res.data.data?.[0]);
        } catch (error) {
            console.log(error);
        }
    };

    const [Customer_AI, setCustomer_AI] = useState(null);
    const fetch_Customer_AI = async () => {
        try {
            const res = await axios.get(
                "https://system-waste-less-ai.onrender.com/api/dashboard/get-customer-ai",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            // console.log(res.data.data);
            setCustomer_AI(res.data?.data[0]);
        } catch (error) {
            console.log(error);
        }
    };
    const [showDetailAI, setShowDetailAI] = useState(false);
    function AIAlertDetail({ data, onClose }) {
        return (
            <Modal
                className="w-[800px]"
                title="Chi tiết gợi ý AI"
                onClose={onClose}
            >
                <div className="space-y-4 max-h-[520px] overflow-y-auto">
                    {!data || data.length === 0 ? (
                        <p className="text-base text-gray-500 text-center">
                            Không có dữ liệu chi tiết
                        </p>
                    ) : (
                        data.map((item, index) => (
                            <div
                                key={index}
                                className="p-4 border rounded-2xl bg-white shadow-sm"
                            >
                                {/* Tên món */}
                                <div className="flex justify-between items-center">
                                    <p className="font-bold text-base text-gray-800">
                                        {item.dish?.name}
                                    </p>

                                    <span
                                        className={`text-xs px-2 py-1 rounded-full font-bold ${
                                            item.predicted_waste_quantity > 0
                                                ? "bg-red-100 text-red-600"
                                                : "bg-green-100 text-green-600"
                                        }`}
                                    >
                                        {item.predicted_waste_quantity > 0
                                            ? "Cảnh báo"
                                            : "Ổn định"}
                                    </span>
                                </div>

                                {/* Recommended */}
                                <p className="text-sm mt-3">
                                    👉 Nên chuẩn bị:{" "}
                                    <span className="font-bold text-green-600 text-sm">
                                        {item.recommended_quantity}
                                    </span>{" "}
                                    suất
                                </p>

                                {/* Waste */}
                                <p className="text-sm mt-1">
                                    ⚠️ Dự kiến lãng phí:{" "}
                                    <span
                                        className={`font-bold text-sm ${
                                            item.predicted_waste_quantity > 0
                                                ? "text-red-500"
                                                : "text-green-500"
                                        }`}
                                    >
                                        {item.predicted_waste_quantity}
                                    </span>
                                </p>

                                {/* Suggestion note */}
                                <div className="mt-3 p-3 rounded-xl bg-gray-100 text-black text-sm leading-relaxed">
                                    {item.suggestion_note}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Modal>
        );
    }

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
                    {/* <div className="mb-8 p-6 bg-orange-50 border-l-4 border-orange-500 rounded-xl flex items-start gap-4">
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
                                {!Customer_AI || Customer_AI?.length === 0 ? (
                                    "Chưa có gợi ý gì cho hôm nay."
                                ) : (
                                    Customer_AI.map((value, index) => (
                                        <div key={index}>
                                            {Array.isArray(value.summary) ? (
                                                value.summary.length > 0 ? (
                                                    value.summary.map((item, i) => (
                                                        <div key={i}>{item}</div>
                                                    ))
                                                ) : (
                                                    "Chưa có gợi ý gì cho hôm nay."
                                                )
                                            ) : value.summary ? (
                                                value.summary
                                            ) : (
                                                "Chưa có gợi ý gì cho hôm nay."
                                            )}
                                        </div>
                                    ))
                                )}
                            </p>
                            {Customer_AI?.length > 0 ? (
                                <button
                                    onClick={() => setShowDetailAI(true)}
                                    className="mt-2 text-xs font-bold  hover:opacity-80"
                                    style={{ color: "rgb(220, 38, 38)" }}
                                >
                                    Xem chi tiết gợi ý từ AI!
                                </button>
                            ) : ""}
                        </div>
                    </div> */}

                    {showDetailAI && (
                        <AIAlertDetail
                            data={WasteLess_AI}
                            onClose={() => setShowDetailAI(false)}
                        />
                    )}

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
                                        badge: "",
                                        badgeBg:
                                            "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                                        badgeColor: "var(--color-primary)",
                                    },
                                    {
                                        label: "Đang phục vụ",
                                        value:
                                            dataDishes?.totalServingDishes ||
                                            "0",
                                        badge:
                                            (
                                                (dataDishes?.totalServingDishes *
                                                    100) /
                                                (dataDishes?.totalDishes || 1)
                                            ).toFixed(1) + "%",
                                        badgeBg: "#f3f4f6",
                                        badgeColor: "var(--color-text-3)",
                                    },
                                    {
                                        label: "Chờ duyệt",
                                        value:
                                            dataDishes?.totalWaitingDishes ||
                                            "0",
                                        badge:
                                            dataDishes?.totalWaitingDishes > 0
                                                ? "Cần xử lý"
                                                : "Ổn định",
                                        badgeBg:
                                            dataDishes?.totalWaitingDishes === 0
                                                ? "color-mix(in srgb, var(--color-primary) 10%, transparent)"
                                                : "#fff7ed",
                                        badgeColor:
                                            dataDishes?.totalWaitingDishes === 0
                                                ? "var(--color-primary)"
                                                : "#f97316",
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
                            <div className="mt-8 flex gap-2">
                                {/* <p
                                    className="font-bold text-base mb-4"
                                    style={{
                                        color: "var(--color-text-1)",
                                        fontFamily: "'Arimo', sans-serif",
                                    }}
                                >
                                    Báo cáo tổng doanh thu tháng
                                </p> */}
                                <div
                                    className="bg-white px-6 pt-2 rounded-xl shadow-sm flex flex-col w-3/5"
                                    style={{
                                        border: "1px solid color-mix(in srgb, var(--color-primary) 10%, transparent)",
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="text-center w-full p-4 bg-white rounded-2xl">
                                            <p
                                                className="font-bold text-base"
                                                style={{
                                                    color: "var(--color-text-1)",
                                                    fontFamily:
                                                        "'Arimo', sans-serif",
                                                }}
                                            >
                                                Báo cáo tổng doanh thu tháng
                                            </p>

                                            {/* Icon + số */}
                                            <div className="flex flex-col items-center gap-2 mt-2">
                                                <div className=" w-14">
                                                    <span className="material-symbols-outlined text-green-600 text-3xl">
                                                        payments
                                                    </span>
                                                </div>

                                                <p
                                                    style={{
                                                        color: "",
                                                        fontFamily:
                                                            "'Arimo', sans-serif",
                                                    }}
                                                    className="text-2xl font-bold text-white rounded-md py-3 px-6 bg-[#10BC5D] "
                                                >
                                                    {(
                                                        totalRevenueOneMonth *
                                                        26.335
                                                    ).toLocaleString()}{" "}
                                                    VND
                                                </p>
                                            </div>

                                            {/* Breakdown */}
                                            <div className="text-sm mt-8">
                                                <div className="flex flex-col">
                                                    <span
                                                        className="text-gray-500 font-light"
                                                        style={{
                                                            color: "",
                                                            fontFamily:
                                                                "'Arimo', sans-serif",
                                                        }}
                                                    >
                                                        Trung bình{" "}
                                                        {Math.round(
                                                            (totalRevenueOneMonth *
                                                                26.335) /
                                                                30,
                                                        ).toLocaleString()}{" "}
                                                        VND / ngày
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Trend */}
                                            <p className="text-sm font-bold flex justify-center items-center gap-1 text-green-600 mt-6">
                                                <span className="material-symbols-outlined text-sm">
                                                    {/* trending_up */}
                                                </span>
                                                Doanh thu đang tăng trưởng ổn
                                                định, phản ánh hiệu quả kinh
                                                doanh tích cực.
                                            </p>
                                        </div>
                                        {/* <div className="flex gap-3">
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
                                        </div> */}
                                    </div>
                                    {/* <div className="flex-1 flex items-end gap-2 px-2">
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
                                    </div> */}
                                </div>

                                {/* Waste gauge */}
                                <div
                                    className="bg-white p-6 rounded-xl shadow-sm text-center w-3/5"
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
                                                    : number_waste_percentage >
                                                            5 &&
                                                        number_waste_percentage <=
                                                            10
                                                      ? "Cảnh báo"
                                                      : number_waste_percentage >
                                                          10
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
                                    style={{
                                        borderBottom: "1px solid #f6f8f7",
                                    }}
                                >
                                    <p
                                        className="font-bold text-base"
                                        style={{
                                            color: "var(--color-text-1)",
                                            fontFamily: "'Arimo', sans-serif",
                                        }}
                                    >
                                        Nguyên liệu sắp hết
                                    </p>
                                    <button
                                        className="text-sm font-bold hover:underline"
                                        style={{
                                            color: "var(--color-primary)",
                                            fontFamily: "'Nunito', sans-serif",
                                        }}
                                    ></button>
                                </div>
                                <table className="w-full text-left">
                                    <thead>
                                        <tr
                                            style={{
                                                background:
                                                    "rgba(246,248,247,0.6)",
                                            }}
                                        >
                                            {[
                                                "Tên nguyên liệu",
                                                "Trong kho",
                                                "Tồn tối thiểu",
                                                "Đơn vị",
                                                "Trạng thái",
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
                                        {lowstockingredient?.map(
                                            (value, index) => {
                                                const isLow =
                                                    value.current_stock <
                                                    value.minimum_stock / 2;

                                                return (
                                                    <tr
                                                        key={value.id || index}
                                                        className="transition-colors hover:bg-gray-50"
                                                        style={{
                                                            borderTop:
                                                                "1px solid #f6f8f7",
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
                                                                    background:
                                                                        isLow
                                                                            ? "#fee2e2"
                                                                            : "#FFF7ED",
                                                                    color: isLow
                                                                        ? "#dc2626"
                                                                        : "#F97316",
                                                                }}
                                                            >
                                                                {isLow
                                                                    ? "Khẩn cấp"
                                                                    : "Cảnh báo"}
                                                            </span>
                                                        </td>

                                                        {/* Trend */}
                                                        {/* <td
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
                                                    </td> */}
                                                    </tr>
                                                );
                                            },
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Right: Waste % + Low Stock */}

                        <div className="col-span-12 lg:col-span-4 space-y-6 mt-10">
                            {/* Low stock */}
                            <div className="lg:col-span-1">
                                <div className="bg-white border border-green-300 rounded-2xl p-6 sticky top-6 shadow-lg">
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

                                    {/* Dự đoán số lượng khách từ AI */}
                                    {WasteLess_AI && (
                                        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-semibold text-[#141C21]">
                                                    📈 Dự đoán số lượng khách
                                                </span>
                                                <span
                                                    className={`text-[14px] px-2 py-1 rounded-full ${
                                                        Customer_AI?.risk_level ===
                                                        "high"
                                                            ? "bg-red-100 text-red-700"
                                                            : Customer_AI?.risk_level ===
                                                                "medium"
                                                              ? "bg-yellow-100 text-yellow-700"
                                                              : "bg-green-100 text-green-700"
                                                    }`}
                                                >
                                                    Rủi ro:{" "}
                                                    {Customer_AI?.risk_level ===
                                                    "high"
                                                        ? "Cao"
                                                        : Customer_AI?.risk_level ===
                                                            "medium"
                                                          ? "Trung bình"
                                                          : "Thấp"}
                                                </span>
                                            </div>
                                            <div className="text-3xl font-bold text-[#141C21] mb-2">
                                                {Customer_AI?.ai_customer_count}{" "}
                                                khách
                                            </div>
                                            <p className="text-sm text-[#8B8B8B] leading-relaxed">
                                                {Customer_AI?.summary}
                                            </p>
                                        </div>
                                    )}

                                    {/* Đề xuất số lượng chuẩn bị */}
                                    <div className="space-y-4 mb-6">
                                        <h4 className="font-semibold text-[#141C21] border-b pb-2">
                                            🍽️ Đề xuất số lượng chuẩn bị
                                        </h4>
                                        {WasteLess_AI?.length > 0 ? (
                                            WasteLess_AI.slice(0, 5).map(
                                                (item, index) => {
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
                                                            key={
                                                                item.id || index
                                                            }
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
                                                                    Nguy cơ dư
                                                                    thừa
                                                                </span>
                                                                <span className="text-orange-500 font-semibold">
                                                                    {
                                                                        predictedWaste
                                                                    }{" "}
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
                                                                suất, đang chuẩn
                                                                bị {currentQty}{" "}
                                                                suất
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
                                                },
                                            )
                                        ) : (
                                            <div className="text-center py-8 text-[#8B8B8B]">
                                                <p>
                                                    Đang cập nhật dữ liệu AI...
                                                </p>
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
                                                    Ưu tiên rà soát các món có
                                                    tỷ lệ lãng phí cao trước.
                                                    Với món chuẩn bị cao hơn AI
                                                    dự đoán, nên điều chỉnh giảm
                                                    5–10% ở ca tiếp theo để
                                                    tránh dư thừa.
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

            {modal === "add" && (
                <AddPeopleForm onClose={() => setModal(null)} />
            )}
            {modal === "update" && (
                <UpdatePeopleForm onClose={() => setModal(null)} />
            )}
        </>
    );
}

import React, { useEffect, useState } from "react";
import axios from "axios";

export const AdminDashboard = () => {
    const token = localStorage.getItem("token");

    // ===== STATE =====
    const [sumBrand, setSumBrand] = useState(0);
    const [sumUser, setSumUser] = useState(0);
    const [wastePercent, setWastePercent] = useState(0);

    const [topBrandWaste, setTopBrandWaste] = useState([]);
    const [allBrandWaste, setAllBrandWaste] = useState([]);

    const [loading, setLoading] = useState(true);

    const axiosConfig = {
        headers: { Authorization: `Bearer ${token}` },
    };

    // ===== API =====
    const fetchData = async () => {
        if (!token) return;

        try {
            setLoading(true);

            const [
                brandRes,
                userRes,
                wasteRes,
                topRes,
                allRes
            ] = await Promise.all([
                axios.get("https://system-waste-less-ai.onrender.com/api/admin/dashboard/get-report-sum-brand", axiosConfig),
                axios.get("https://system-waste-less-ai.onrender.com/api/admin/dashboard/get-report-sum-user", axiosConfig),
                axios.get("https://system-waste-less-ai.onrender.com/api/admin/dashboard/get-report-waste-dish", axiosConfig),
                axios.get("https://system-waste-less-ai.onrender.com/api/admin/dashboard/get-report-brand-waste-dish", axiosConfig),
                axios.get("https://system-waste-less-ai.onrender.com/api/admin/dashboard/get-report-all-brand-waste-dish", axiosConfig),
            ]);

            setSumBrand(brandRes.data?.data || 0);
            setSumUser(userRes.data?.data || 0);
            setWastePercent(parseFloat(wasteRes.data?.data) || 0);

            setTopBrandWaste(topRes.data?.data || []);
            setAllBrandWaste(allRes.data?.data || []);

        } catch (err) {
            console.log("API lỗi:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ===== MAP DATA =====

    const summaryCards = [
        {
            title: "Tổng cửa hàng đang hoạt động",
            value: loading ? "..." : sumBrand,
            note: "Các cửa hàng đang vận hành ổn định",
            accent: "bg-emerald-500",
            soft: "bg-emerald-50 text-emerald-600",
        },
        {
            title: "Tài khoản đang hoạt động",
            value: loading ? "..." : sumUser,
            note: "Tài khoản đang có quyền truy cập hệ thống",
            accent: "bg-blue-500",
            soft: "bg-blue-50 text-blue-600",
        },
        {
            title: "% lãng phí toàn hệ thống",
            value: loading ? "..." : `${wastePercent.toFixed(2)}%`,
            note: "Tỷ lệ lãng phí trung bình toàn hệ thống",
            accent: "bg-amber-500",
            soft: "bg-amber-50 text-amber-600",
        },
    ];

    const topWasteStores = (topBrandWaste || []).map((item) => ({
        name: item.brand_name,
        waste: item.total_waste,
        prepared: item.total_prepared,
        rate: Number(item.total_percent || 0).toFixed(1),
        color:
            item.total_percent > 10
                ? "bg-red-500"
                : item.total_percent > 5
                    ? "bg-amber-500"
                    : "bg-emerald-500",
        status:
            item.total_percent > 10
                ? "Cần xử lý"
                : item.total_percent > 5
                    ? "Theo dõi"
                    : "Ổn định",
    }));

    const maxWaste = Math.max(
        ...(topWasteStores.length
            ? topWasteStores.map((s) => s.waste)
            : [1])
    );

    const storeStats = (allBrandWaste || []).map((item) => ({
        name: item.brand_name,
        accounts: item.total_users || 0,
        dishes: item.total_prepared || 0,
        wasteRate: `${Number(item.total_percent || 0).toFixed(1)}%`,
        lowStock: item.low_stock_count || 0,
        status:
            item.total_percent > 10
                ? "Cần xử lý"
                : item.total_percent > 5
                    ? "Theo dõi"
                    : "Ổn định",
    }));

    // ===== UI =====
    return (
        <div className="min-h-screen bg-[#f6f8f8] text-slate-800">
            <main>
                {/* HEADER */}
                <header className="flex h-[74px] items-center justify-between border-b border-slate-200 bg-white px-10">
                    <h1 className="text-[22px] font-bold">
                        Dashboard quản trị hệ thống
                    </h1>

                    <div className="flex items-center gap-3">
                        <button className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm">
                            Xuất dữ liệu
                        </button>
                        <button
                            onClick={fetchData}
                            className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-sm"
                        >
                            Làm mới thống kê
                        </button>
                    </div>
                </header>

                <p className="mt-4 ml-10 text-sm text-slate-500">
                    Theo dõi cửa hàng, tài khoản và mức lãng phí toàn hệ thống
                </p>

                <div className="space-y-6 px-8 py-6">

                    {/* CARDS */}
                    <div className="grid grid-cols-3 gap-4">
                        {summaryCards.map((card, index) => (
                            <div key={index} className="rounded-2xl border bg-white p-5 shadow-sm">
                                <div className="flex justify-between">
                                    <div className={`px-3 py-1 text-xs font-semibold rounded-xl ${card.soft}`}>
                                        {card.title}
                                    </div>
                                    <span className="text-xs text-slate-400">Hiện tại</span>
                                </div>

                                <div className="mt-4 text-3xl font-bold">
                                    {card.value}
                                </div>

                                <p className="mt-2 text-sm text-slate-500">
                                    {card.note}
                                </p>

                                <div className="mt-4 h-1.5 bg-slate-100 rounded-full">
                                    <div
                                        className={`h-1.5 rounded-full ${card.accent}`}
                                        style={{ width: `${70 + index * 10}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* TOP WASTE */}
                    <div className="bg-white rounded-2xl border p-5 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">
                            Cửa hàng có lãng phí cao trong tháng hiện tại
                        </h2>

                        <div className="space-y-5">
                            {topWasteStores.map((store, index) => (
                                <div key={index} className="border rounded-2xl p-4">

                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-semibold">
                                                {store.name}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                Món dư: {store.waste.toLocaleString()} ·
                                                Món ra: {store.prepared.toLocaleString()} ·
                                                Tỷ lệ: {store.rate}%
                                            </div>
                                        </div>

                                        <span
                                            className={`px-3 py-1 text-xs rounded-full font-semibold
                                            ${store.status === "Cần xử lý"
                                                    ? "bg-red-100 text-red-600"
                                                    : store.status === "Theo dõi"
                                                        ? "bg-amber-100 text-amber-600"
                                                        : "bg-emerald-100 text-emerald-600"
                                                }`}
                                        >
                                            {store.status}
                                        </span>
                                    </div>

                                    <div className="mt-3 h-2.5 bg-slate-100 rounded-full">
                                        <div
                                            className={`h-2.5 rounded-full ${store.color}`}
                                            style={{
                                                width: `${(store.waste / maxWaste) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="bg-white rounded-2xl border p-5 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">
                            Tình hình các cửa hàng trong tháng hiện tại
                        </h2>

                        <div className="overflow-hidden rounded-2xl border border-slate-100">
                            <table className="min-w-full text-sm text-left">

                                {/* HEADER */}
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="px-5 py-4 font-semibold">Cửa hàng</th>
                                        <th className="px-5 py-4 font-semibold text-center">Tài khoản</th>
                                        <th className="px-5 py-4 font-semibold text-center">Món</th>
                                        <th className="px-5 py-4 font-semibold text-center">% lãng phí</th>
                                        <th className="px-5 py-4 font-semibold text-center">Nguyên liệu</th>
                                        <th className="px-5 py-4 font-semibold text-center">Trạng thái</th>
                                    </tr>
                                </thead>

                                {/* BODY */}
                                <tbody>
                                    {storeStats.map((s, i) => (
                                        <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition">

                                            <td className="px-5 py-4 font-medium text-slate-800">
                                                {s.name}
                                            </td>

                                            <td className="px-5 py-4 text-center">
                                                {s.accounts}
                                            </td>

                                            <td className="px-5 py-4 text-center">
                                                {s.dishes}
                                            </td>

                                            <td className="px-5 py-4 text-center font-semibold">
                                                {s.wasteRate}
                                            </td>

                                            <td className="px-5 py-4 text-center">
                                                {s.lowStock}
                                            </td>

                                            <td className="px-5 py-4 text-center">
                                                <span
                                                    className={`px-3 py-1 text-xs rounded-full font-semibold
                                ${s.status === "Cần xử lý"
                                                            ? "bg-red-100 text-red-600"
                                                            : s.status === "Theo dõi"
                                                                ? "bg-amber-100 text-amber-600"
                                                                : "bg-emerald-100 text-emerald-600"
                                                        }`}
                                                >
                                                    {s.status}
                                                </span>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
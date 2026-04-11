import React from 'react'

export const AdminDashboard = () => {
    const summaryCards = [
        {
            title: "Tổng cửa hàng đang hoạt động",
            value: "12",
            note: "Tính theo số cửa hàng đang mở và có dữ liệu trong hệ thống hiện tại",
            accent: "bg-emerald-500",
            soft: "bg-emerald-50 text-emerald-600",
        },
        {
            title: "Tài khoản đang hoạt động",
            value: "48",
            note: "Tính theo tài khoản Admin, Manager, Kitchen chưa bị khóa",
            accent: "bg-blue-500",
            soft: "bg-blue-50 text-blue-600",
        },
        {
            title: "% lãng phí toàn hệ thống",
            value: "7.8%",
            note: "Tính theo tháng hiện tại = tổng món dư / tổng món ra × 100",
            accent: "bg-amber-500",
            soft: "bg-amber-50 text-amber-600",
        },
    ];

    const topWasteStores = [
        { name: "CN Hải Châu", waste: 1240, prepared: 11480, rate: 10.8, color: "bg-red-500", status: "Cần xử lý" },
        { name: "CN Sơn Trà", waste: 910, prepared: 10580, rate: 8.6, color: "bg-amber-500", status: "Theo dõi" },
        { name: "CN Thanh Khê", waste: 750, prepared: 10563, rate: 7.1, color: "bg-emerald-500", status: "Ổn định" },
        { name: "CN Liên Chiểu", waste: 620, prepared: 11481, rate: 5.4, color: "bg-emerald-500", status: "Ổn định" },
    ];

    const storeStats = [
        {
            name: "CN Hải Châu",
            accounts: 6,
            dishes: 42,
            wasteRate: "10.8%",
            lowStock: 5,
            status: "Cần xử lý",
        },
        {
            name: "CN Sơn Trà",
            accounts: 5,
            dishes: 38,
            wasteRate: "8.6%",
            lowStock: 3,
            status: "Theo dõi",
        },
        {
            name: "CN Thanh Khê",
            accounts: 4,
            dishes: 34,
            wasteRate: "7.1%",
            lowStock: 2,
            status: "Ổn định",
        },
        {
            name: "CN Liên Chiểu",
            accounts: 4,
            dishes: 31,
            wasteRate: "5.4%",
            lowStock: 1,
            status: "Ổn định",
        },
    ];

    const maxWaste = Math.max(...topWasteStores.map((store) => store.waste));

    return (
        <div className="min-h-screen bg-[#f6f8f8] text-slate-800">
            <div className="grid min-h-screen">

                <main className="col-span-10">
                    <header className="flex h-[74px] items-center justify-between border-b border-slate-200 bg-white px-10">
                        <div>
                            <h1 className="text-[22px] font-bold">Dashboard quản trị hệ thống</h1>

                        </div>
                        <div className="flex items-center gap-3">
                            <button className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm">
                                Xuất dữ liệu
                            </button>
                            <button className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-sm">
                                Làm mới thống kê
                            </button>
                        </div>
                    </header>
                    <p className="mt-1 ml-10 text-sm text-slate-500">
                        Theo dõi cửa hàng, tài khoản và mức lãng phí toàn hệ thống
                    </p>

                    <div className="space-y-6 px-8 py-8">
                        <div className="grid grid-cols-3 gap-4">
                            {summaryCards.map((card, index) => (
                                <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className={`rounded-xl px-3 py-1 text-xs font-semibold ${card.soft}`}>{card.title}</div>
                                        <div className="text-xs font-medium text-slate-400">Hiện tại</div>
                                    </div>
                                    <div className="mt-4 text-3xl font-bold">{card.value}</div>
                                    <div className="mt-3 text-sm leading-6 text-slate-500">{card.note}</div>
                                    <div className="mt-4 h-1.5 rounded-full bg-slate-100">
                                        <div className={`h-1.5 rounded-full ${card.accent}`} style={{ width: `${72 + index * 8}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-semibold">Cửa hàng có lãng phí cao trong tháng hiện tại</h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Công thức: % lãng phí = tổng món dư trong tháng / tổng món ra trong tháng × 100
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">Mốc thời gian: Tháng hiện tại</div>
                                </div>

                                <div className="mt-6 space-y-5">
                                    {topWasteStores.map((store, index) => (
                                        <div key={index} className="rounded-2xl border border-slate-100 p-4">
                                            <div className="mb-3 flex items-center justify-between gap-4">
                                                <div>
                                                    <div className="font-semibold text-slate-800">{store.name}</div>
                                                    <div className="mt-1 text-sm text-slate-500">
                                                        Món dư: {store.waste.toLocaleString()} · Món ra: {store.prepared.toLocaleString()} · Tỷ lệ: {store.rate}%
                                                    </div>
                                                </div>
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${store.status === "Cần xử lý"
                                                        ? "bg-red-100 text-red-600"
                                                        : store.status === "Theo dõi"
                                                            ? "bg-amber-100 text-amber-600"
                                                            : "bg-emerald-100 text-emerald-600"
                                                        }`}
                                                >
                                                    {store.status}
                                                </span>
                                            </div>
                                            <div className="h-2.5 rounded-full bg-slate-100">
                                                <div
                                                    className={`h-2.5 rounded-full ${store.color}`}
                                                    style={{ width: `${(store.waste / maxWaste) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold">Tình hình các cửa hàng trong tháng hiện tại</h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Các chỉ số dưới đây đang tính theo tháng hiện tại, riêng số tài khoản là số đang hoạt động ở thời điểm hiện tại.
                                    </p>
                                </div>
                                <button className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700">
                                    Xem tất cả cửa hàng
                                </button>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                                <div>
                                    <span className="font-semibold text-slate-800">% lãng phí cửa hàng:</span> tổng món dư trong tháng / tổng món ra trong tháng × 100
                                </div>
                                <div>
                                    <span className="font-semibold text-slate-800">Nguyên liệu sắp hết:</span> số nguyên liệu có tồn kho hiện tại nhỏ hơn hoặc bằng mức tối thiểu
                                </div>
                            </div>

                            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
                                <table className="min-w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500">
                                        <tr>
                                            <th className="px-5 py-4 font-semibold">Cửa hàng</th>
                                            <th className="px-5 py-4 font-semibold">Tài khoản hoạt động</th>
                                            <th className="px-5 py-4 font-semibold">Số món đang bán</th>
                                            <th className="px-5 py-4 font-semibold">% lãng phí tháng</th>
                                            <th className="px-5 py-4 font-semibold">Nguyên liệu sắp hết</th>
                                            <th className="px-5 py-4 font-semibold">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {storeStats.map((store, index) => (
                                            <tr key={index} className="border-t border-slate-100">
                                                <td className="px-5 py-4 font-medium text-slate-800">{store.name}</td>
                                                <td className="px-5 py-4">{store.accounts}</td>
                                                <td className="px-5 py-4">{store.dishes}</td>
                                                <td className="px-5 py-4 font-semibold">{store.wasteRate}</td>
                                                <td className="px-5 py-4">{store.lowStock}</td>
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${store.status === "Cần xử lý"
                                                            ? "bg-red-100 text-red-600"
                                                            : store.status === "Theo dõi"
                                                                ? "bg-amber-100 text-amber-600"
                                                                : "bg-emerald-100 text-emerald-600"
                                                            }`}
                                                    >
                                                        {store.status}
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
        </div>
    );
}

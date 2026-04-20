import React, { useState } from "react";
import { Eye, Pencil, Users, ShieldCheck, Utensils } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockManagers = [
    {
        id: 1,
        name: "Nguyễn Thành Trung",
        email: "trung.nt@wasteledger.vn",
        store: "Green Leaf Market",
        type: "restaurant",
        status: "active",
        kitchens: 5,
    },
    {
        id: 2,
        name: "Lê Văn A",
        email: "a.lv@hotel.vn",
        store: "Sunrise Hotel",
        type: "hotel",
        status: "active",
        kitchens: 3,
    },
];

export default function Accountmanagement() {
    const navigate = useNavigate();

    const [data] = useState(mockManagers);
    const [filterType, setFilterType] = useState("all");

    // FILTER
    const filteredData =
        filterType === "all"
            ? data
            : data.filter((item) => item.type === filterType);

    // ===== STATS =====
    const totalAccounts = data.length;
    const totalManagers = data.length;
    const totalKitchens = data.reduce((sum, item) => sum + item.kitchens, 0);

    return (
        <div className="p-6 space-y-6">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
                    <p className="text-sm text-gray-500">
                        Quản lý tài khoản Manager và hệ thống Kitchen
                    </p>
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-4">

                {/* TOTAL ACCOUNT */}
                <div className="bg-slate-800 text-white p-4 rounded-xl shadow flex justify-between items-start">
                    <div>
                        <p className="text-sm opacity-80">Tổng tài khoản</p>
                        <h2 className="text-2xl font-bold">{totalAccounts}</h2>
                    </div>

                    <div className="bg-white/20 p-2 rounded-lg">
                        <Users size={18} />
                    </div>
                </div>

                {/* TOTAL MANAGER */}
                <div className="bg-emerald-600 text-white p-4 rounded-xl shadow flex justify-between items-start">
                    <div>
                        <p className="text-sm opacity-80">Tổng Manager</p>
                        <h2 className="text-2xl font-bold">{totalManagers}</h2>
                        <span className="text-xs font-medium opacity-90">
                            +12% tháng này
                        </span>
                    </div>

                    <div className="bg-white/20 p-2 rounded-lg">
                        <ShieldCheck size={18} />
                    </div>
                </div>

                {/* TOTAL KITCHEN */}
                <div className="bg-orange-500 text-white p-4 rounded-xl shadow flex justify-between items-start">
                    <div>
                        <p className="text-sm opacity-80">Tổng Kitchen</p>
                        <h2 className="text-2xl font-bold">{totalKitchens}</h2>
                        <span className="text-xs font-medium opacity-90">
                            Đang hoạt động
                        </span>
                    </div>

                    <div className="bg-white/20 p-2 rounded-lg">
                        <Utensils size={18} />
                    </div>
                </div>

            </div>

            {/* FILTER */}
            <div className="flex justify-end items-center mb-3">
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border px-3 py-2 rounded-lg text-sm"
                >
                    <option value="all">Tất cả cửa hàng</option>
                    <option value="restaurant">Nhà hàng</option>
                    <option value="hotel">Khách sạn</option>
                </select>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-left">
                        <tr>
                            <th className="p-3">Manager</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Cửa hàng</th>
                            <th className="p-3">Loại</th>
                            <th className="p-3">Trạng thái</th>
                            <th className="p-3">Kitchen</th>
                            <th className="p-3">Thao tác</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredData.map((item) => (
                            <tr key={item.id} className="border-t">
                                <td className="p-3 font-medium">{item.name}</td>
                                <td className="p-3">{item.email}</td>
                                <td className="p-3">{item.store}</td>

                                {/* TYPE */}
                                <td className="p-3">
                                    <span className="text-xs px-2 py-1 rounded bg-gray-100">
                                        {item.type === "hotel"
                                            ? "Khách sạn"
                                            : "Nhà hàng"}
                                    </span>
                                </td>

                                {/* STATUS */}
                                <td className="p-3">
                                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-600">
                                        Hoạt động
                                    </span>
                                </td>

                                {/* KITCHEN */}
                                <td className="p-3">{item.kitchens}</td>

                                {/* ACTION */}
                                <td className="p-3 flex gap-2">
                                    <button
                                        className="p-2 hover:bg-gray-100 rounded"
                                        onClick={() =>
                                            navigate(
                                                `/admin/user/${item.id}/kitchens`
                                            )
                                        }
                                    >
                                        <Eye size={16} />
                                    </button>

                                    <button className="p-2 hover:bg-gray-100 rounded">
                                        <Pencil size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
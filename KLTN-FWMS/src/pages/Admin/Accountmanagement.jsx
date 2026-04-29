import React, { useEffect, useState } from "react";
import {
    Eye,
    Users,
    ShieldCheck,
    Utensils
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Accountmanagement() {
    const navigate = useNavigate();

    const [data, setData] = useState([]);
    const [stats, setStats] = useState({
        sumAccount: 0,
        sumManager: 0,
        sumKitchen: 0,
        sumBrand: 0,
    });

    const [filterType, setFilterType] = useState("all");

    // PAGINATION
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const token = localStorage.getItem("token");

    // ================= FETCH LIST =================
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(
                    "https://system-waste-less-ai.onrender.com/api/admin/account/get-all-account",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const brands = res.data.data.data;

                const formatted = brands.flatMap((brand) =>
                    brand.users.map((user) => ({
                        id: brand.id + "_" + user.email, // ✅ unique id
                        brandId: brand.id, // ✅ dùng cho detail
                        name: user.name,
                        email: user.email,
                        store: brand.name,
                        type: brand.rolebrand?.toLowerCase().trim(),
                        status: brand.status ? "active" : "inactive",
                        kitchens: brand.kitchens?.length || 0
                    }))
                );

                setData(formatted);
            } catch (err) {
                console.error("Error fetch list:", err);
            }
        };

        fetchData();
    }, [token]);

    // ================= FETCH STATS =================
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(
                    "https://system-waste-less-ai.onrender.com/api/admin/account/get-sum-acount",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setStats(res.data.data);
            } catch (err) {
                console.error("Error fetch stats:", err);
            }
        };

        fetchStats();
    }, [token]);

    // ================= FILTER =================
    const filteredData =
        filterType === "all"
            ? data
            : data.filter(
                (item) =>
                    item.type &&
                    item.type.toLowerCase().trim() === filterType
            );

    // ================= PAGINATION =================
    const totalPages = Math.ceil(filteredData.length / pageSize);

    const startIndex = (page - 1) * pageSize;
    const paginatedData = filteredData.slice(
        startIndex,
        startIndex + pageSize
    );

    // ================= HELPER =================
    const getTypeLabel = (type) => {
        switch (type) {
            case "hotel":
                return "Khách sạn";
            case "restaurant":
                return "Nhà hàng";
            default:
                return "Không xác định";
        }
    };

    return (
        <div className="p-6 space-y-6">

            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
                <p className="text-sm text-gray-500">
                    Quản lý tài khoản Manager và hệ thống Kitchen
                </p>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-4 gap-4">

                <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white p-4 rounded-xl flex justify-between">
                    <div>
                        <p className="text-sm">Tổng tài khoản</p>
                        <h2 className="text-2xl font-bold">{stats.sumAccount}</h2>
                    </div>
                    <Users />
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-xl flex justify-between">
                    <div>
                        <p className="text-sm">Đang hoạt động</p>
                        <h2 className="text-2xl font-bold">
                            {data.filter((i) => i.status === "active").length}
                        </h2>
                    </div>
                    <ShieldCheck />
                </div>

                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl flex justify-between">
                    <div>
                        <p className="text-sm">Tổng Manager</p>
                        <h2 className="text-2xl font-bold">{stats.sumManager}</h2>
                    </div>
                    <Users />
                </div>

                <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-4 rounded-xl flex justify-between">
                    <div>
                        <p className="text-sm">Tổng Kitchen</p>
                        <h2 className="text-2xl font-bold">{stats.sumKitchen}</h2>
                    </div>
                    <Utensils />
                </div>

            </div>

            {/* FILTER */}
            <div className="flex justify-end">
                <select
                    value={filterType}
                    onChange={(e) => {
                        setFilterType(e.target.value);
                        setPage(1);
                    }}
                    className="border px-3 py-2 rounded-lg text-sm"
                >
                    <option value="all">Tất cả</option>
                    <option value="restaurant">Nhà hàng</option>
                    <option value="hotel">Khách sạn</option>
                </select>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-sm table-fixed">
                    <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                        <tr>
                            <th className="p-3 text-left w-[18%]">Manager</th>
                            <th className="p-3 text-left w-[20%]">Email</th>
                            <th className="p-3 text-left w-[18%]">Cửa hàng</th>
                            <th className="p-3 text-left w-[12%]">Loại</th>
                            <th className="p-3 text-left w-[14%]">Trạng thái</th>
                            <th className="p-3 text-center w-[8%]">Kitchen</th>
                            <th className="p-3 text-center w-[10%]">Thao tác</th>
                        </tr>
                    </thead>

                    <tbody>
                        {paginatedData.map((item) => (
                            <tr
                                key={item.id}
                                className="border-t hover:bg-gray-50 transition"
                            >
                                <td className="p-3 font-medium text-gray-800">
                                    {item.name}
                                </td>

                                <td className="p-3 text-gray-600">
                                    {item.email}
                                </td>

                                <td className="p-3">
                                    {item.store}
                                </td>

                                <td className="p-3">
                                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                                        {getTypeLabel(item.type)}
                                    </span>
                                </td>

                                <td className="p-3">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs ${item.status === "active"
                                            ? "bg-green-100 text-green-600"
                                            : "bg-gray-200 text-gray-500"
                                            }`}
                                    >
                                        {item.status === "active"
                                            ? "Hoạt động"
                                            : "Ngừng"}
                                    </span>
                                </td>

                                {/* ✅ FIX LỆCH */}
                                <td className="p-3 text-center align-middle">
                                    {item.kitchens}
                                </td>

                                <td className="p-3 text-center align-middle">
                                    <button
                                        onClick={() =>
                                            navigate(`/admin/manager/${item.brandId}`)
                                        }
                                        className="p-2 hover:bg-gray-100 rounded transition"
                                    >
                                        <Eye size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* EMPTY */}
                {paginatedData.length === 0 && (
                    <div className="text-center p-6 text-gray-500">
                        Không có dữ liệu
                    </div>
                )}

                {/* PAGINATION */}
                <div className="flex justify-center items-center gap-2 p-4">
                    <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border rounded"
                    >
                        ←
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`px-3 py-1 border rounded ${page === i + 1
                                ? "bg-blue-500 text-white"
                                : ""
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        onClick={() =>
                            setPage((prev) =>
                                Math.min(prev + 1, totalPages)
                            )
                        }
                        disabled={page === totalPages}
                        className="px-3 py-1 border rounded"
                    >
                        →
                    </button>
                </div>
            </div>
        </div>
    );
}
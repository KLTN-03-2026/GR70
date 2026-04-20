import React, { useEffect, useState } from "react";

import {
    BarChart,
    Bar,
    XAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

import {
    getRevenueStats,
    getRevenueChart,
    getTransactions,
} from "../api/revenueApi.js";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import { Sum_Revenue_Month, Sum_Revenue_yesterday, Transaction_Revenue_Month } from "../services/Revenue_Manager.js";

const Revenue = () => {
    const [stats, setStats] = useState({
        today: 0,
        month: 0,
        growth: 0,
    });

    const [chartData, setChartData] = useState([]);
    const [transactions, setTransactions] = useState([]);

    // set default để không bị undefined
    const [sum_Revenue_Yesterday, setSum_Revenue_Yesterday] = useState([]);
    const [sum_Revenue_Month, setSum_Revenue_Month] = useState([]);
    const [transactions_Revenue_Month, settransactions_Revenue_Month] = useState([]);
    const [loading, setLoading] = useState(false);


    // gọi API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [res, res1, res2] = await Promise.all([
                    Sum_Revenue_yesterday(),
                    Sum_Revenue_Month(),
                    Transaction_Revenue_Month(),
                ])
                setSum_Revenue_Yesterday(res.data.data.total_revenue);
                setSum_Revenue_Month(res1.data.data.total_revenue);
                settransactions_Revenue_Month(res2.data.data);
                console.log(res2.data.data);

            } catch (err) {
                console.error("Lỗi load dữ liệu:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    //  tránh crash khi chartData rỗng
    const maxValue =
        chartData.length > 0 ? Math.max(...chartData.map((d) => d.value)) : 0;

    if (loading) {
        return <div className="p-8">Đang tải dữ liệu...</div>;
    }

    // THÊM HÀM XUẤT EXCEL (thêm vào trong component Revenue, trước return)
    const exportToExcel = () => {
        // Chuẩn bị dữ liệu cho Excel
        const excelData = transactions_Revenue_Month.map((item) => ({
            "Ngày giao dịch": item["daily_operation.operation_date"],
            "Danh mục": item["dish.name"],
            "Số lượng": item.quantity_used || 0,
            "Số tiền": item.revenue_cost?.toLocaleString("vi-VN") + " VNĐ" || "0 VNĐ",
        }));

        // Tạo worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Tùy chỉnh độ rộng cột (optional)
        const colWidths = [
            { wch: 15 }, // Ngày giao dịch
            { wch: 20 }, // Danh mục
            { wch: 12 }, // Số lượng
            { wch: 18 }, // Số tiền
            // { wch: 12 }, // Trạng thái
        ];
        worksheet["!cols"] = colWidths;

        // Tạo workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Chi tiết giao dịch");

        // Xuất file
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });
        const data = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(
            data,
            `chi_tiet_giao_dich_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.xlsx`,
        );
    };

    // THÊM HÀM XUẤT EXCEL CHO TỪNG GIAO DỊCH
    const exportSingleToExcel = (item) => {
        const singleData = [
            {
                "Ngày giao dịch": item["daily_operation.operation_date"],
                "Danh mục": item["dish.name"],
                "Số lượng": item.quantity_used || 0,
                "Số tiền":
                    Number(item.revenue_cost || 0).toLocaleString("vi-VN") + " VNĐ",
            },
        ];

        const worksheet = XLSX.utils.json_to_sheet(singleData);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Giao dịch");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });

        const data = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(
            data,
            `giao_dich_${item["daily_operation.operation_date"]}_${item["dish.name"]}.xlsx`
        );
    };

    return (
        <div className="p-8 ml-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Thống kê doanh thu
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Báo cáo chi tiết hiệu suất kinh doanh
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <select className="border rounded-lg px-3 py-2 text-sm">
                        <option>Tháng 04, 2026</option>
                    </select>
                    <button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm">
                        Xem thống kê
                    </button>
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-5 rounded-xl shadow">
                    <p className="text-gray-500 text-sm">Hôm qua</p>
                    <h2 className="text-2xl font-bold mt-1">
                        {(sum_Revenue_Yesterday ? parseFloat(sum_Revenue_Yesterday).toLocaleString("vi-VN") : "0")} VND
                    </h2>
                </div>

                <div className="bg-white p-5 rounded-xl shadow">
                    <p className="text-gray-500 text-sm">Tháng này</p>
                    <h2 className="text-2xl font-bold mt-1">
                        {parseFloat((sum_Revenue_Month ?? 0)).toLocaleString('vi-VN')} VND
                    </h2>
                </div>

                <div className="bg-green-500 text-white p-5 rounded-xl shadow">
                    <p className="text-sm">Tăng trưởng</p>
                    <h2 className="text-2xl font-bold mt-1">
                        +{stats.growth || 0}%
                    </h2>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white p-6 rounded-xl shadow mb-6">
                <h3 className="text-gray-700 font-semibold mb-4">
                    Biểu đồ doanh thu
                </h3>

                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                        <XAxis dataKey="name" />
                        <Tooltip />

                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={index}
                                    fill={
                                        entry.value === maxValue
                                            ? "#10BC5D"
                                            : "#10BC5D33"
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="flex justify-between items-center p-5 border-b">
                    <h3 className="font-semibold text-gray-700">
                        Chi tiết giao dịch
                    </h3>
                    <button
                        onClick={exportToExcel}
                        className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
                        style={{
                            background:
                                "linear-gradient(135deg, var(--color-primary), #0da04f)",
                            boxShadow: "rgba(16, 188, 93, 0.25) 0px 4px 12px",
                        }}
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "20px" }}
                        >
                            add
                        </span>
                        Xuất Excel
                    </button>
                </div>

                <table className="w-full">
                    <thead className="bg-gray-50 text-sm text-gray-500">
                        <tr>
                            <th className="text-left p-4">Ngày giao dịch</th>
                            <th className="text-left p-4">Tên món</th>
                            <th className="text-left p-4 text-center">Số lượng</th>
                            <th className="text-left p-4">Số tiền</th>
                            {/* <th className="text-left p-4">Trạng thái</th> */}
                        </tr>
                    </thead>

                    <tbody>
                        {transactions_Revenue_Month.length > 0 ? (
                            transactions_Revenue_Month.map((item) => (
                                <tr key={item.id} className="border-t">
                                    <td className="p-4">{item["daily_operation.operation_date"]
                                        ? new Date(item["daily_operation.operation_date"]).toLocaleDateString('vi-VN')
                                        : 'N/A'}</td>
                                    <td className="p-4">{item["dish.name"]}</td>
                                    <td className="p-4 text-center">
                                        {item.quantity_used || 0}
                                    </td>
                                    <td className="p-4 font-semibold">
                                        {(Number(item.revenue_cost)).toLocaleString("vi-VN")} VND
                                    </td>
                                    {/* <td className="p-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs ${item.status === "success"
                                                    ? "bg-green-100 text-green-600"
                                                    : "bg-yellow-100 text-yellow-600"
                                                }`}
                                        >
                                            {item.status === "success"
                                                ? "Thành công"
                                                : "Đang xử lý"}
                                        </span>
                                    </td> */}
                                    {/* THÊM CỘT THAO TÁC VỚI NÚT XUẤT EXCEL */}
                                    <td className="p-4">
                                        <button
                                            onClick={() =>
                                                exportSingleToExcel(item)
                                            }
                                            className="flex items-center gap-1 px-3 py-1.5 text-white rounded-lg text-xs font-medium hover:opacity-90 active:scale-95 transition-all"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg, #10BC5D, #0da04f)",
                                                boxShadow:
                                                    "rgba(16, 188, 93, 0.25) 0px 2px 8px",
                                            }}
                                        >
                                            <span
                                                className="material-symbols-outlined"
                                                style={{ fontSize: "16px" }}
                                            >
                                                download
                                            </span>
                                            Xuất
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="text-center p-6 text-gray-400"
                                >
                                    Không có dữ liệu
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="flex justify-between items-center p-4 text-sm text-gray-500">
                    <span>Hiển thị {transactions_Revenue_Month.length} giao dịch</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-green-500 text-white rounded">
                            1
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Revenue;

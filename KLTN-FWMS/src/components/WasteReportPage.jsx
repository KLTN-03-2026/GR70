import React, { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { getWasteReport } from "../api/wasteReportApi";

const WasteReportPage = () => {
  const [data, setData] = useState(null);

  // 👉 gọi API
  useEffect(() => {
    getWasteReport().then((res) => {
      setData(res);
    });
  }, []);

  // 👉 fallback tránh lỗi khi chưa có data
  const summary = data?.summary || {};
  const topWaste = data?.topWaste || [];
  const reasons = data?.reasons || [];

  // 👉 giữ màu như cũ
  const pieData = reasons.map((item, index) => ({
    ...item,
    color: ["#22C55E", "#F59E0B", "#EF4444", "#374151"][index],
  }));

  return (
    <div className="ml-10 p-5 bg-[#F6F8FA] min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">       
        <h1 className="text-2xl font-bold text-[#141C21]">
          Báo cáo Phân tích Lãng phí
        </h1>
        <input
          placeholder="Tìm kiếm dữ liệu..."
          className="px-4 py-2 border rounded-lg text-sm outline-none"
        />
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500 mb-2">
            TỔNG KHỐI LƯỢNG LÃNG PHÍ
          </p>
          <h2 className="text-2xl font-bold">
            {summary.totalWaste || 0} kg
            
          </h2>
          <p className="text-green-500 text-xs mt-1">
            +12% vs tháng trước
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500 mb-2">
            TỈ LỆ LÃNG PHÍ/NGUYÊN LIỆU
          </p>
          <h2 className="text-2xl font-bold">
            {summary.wasteRate || 0}%
          </h2>
          <p className="text-red-500 text-xs mt-1">
            +2% mục tiêu
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500 mb-2">
            ƯỚC TÍNH GIÁ TRỊ THIỆT HẠI
          </p>
          <h2 className="text-2xl font-bold">
            {(summary.damageCost || 0).toLocaleString()} VND
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500 mb-2">
            TỈ LỆ GIẢM SO VỚI THÁNG TRƯỚC
          </p>
          <h2 className="text-2xl font-bold">
            {summary.reductionRate || 0}%
          </h2>
        </div>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-3 gap-6">
        {/* TABLE */}
        <div className="col-span-2 bg-white p-5 rounded-xl shadow-sm">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold">
              Top 5 nguyên liệu lãng phí nhất
            </h3>
            <span className="text-green-500 text-sm cursor-pointer">
              Xem tất cả
            </span>
          </div>

          <table className="w-full text-sm">
            <thead className="text-gray-500 text-xs">
              <tr>
                <th className="text-left py-2">Tên nguyên liệu</th>
                <th>Khối lượng</th>
                <th>Xu hướng</th>
              </tr>
            </thead>

            <tbody>
              {topWaste.map((item, index) => {
                // 👉 convert data API -> UI cũ
                const trendText =
                  item.trend > 0
                    ? `+${item.trend}%`
                    : item.trend < 0
                    ? `${item.trend}%`
                    : "0%";

                const up =
                  item.trend > 0
                    ? true
                    : item.trend < 0
                    ? false
                    : null;

                return (
                  <tr key={index} className="border-t">
                    <td className="py-3">{item.name}</td>
                    <td className="text-center">
                      {item.amount} {item.unit}
                    </td>
                    <td className="text-center">
                      <span
                        className={`flex items-center justify-center gap-1 ${
                          up === true
                            ? "text-red-500"
                            : up === false
                            ? "text-green-500"
                            : "text-gray-400"
                        }`}
                      >
                        {up === true && <ArrowUpRight size={14} />}
                        {up === false && <ArrowDownRight size={14} />}
                        {trendText}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* PIE */}
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <h3 className="font-semibold mb-4">
            Lý do lãng phí chính
          </h3>


          <div className="w-full h-52">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* LEGEND */}
          <div className="text-sm mt-4 space-y-2">
            {pieData.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: item.color }}
                  ></span>
                  {item.name}
                </span>
                <span>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteReportPage;
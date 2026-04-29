import React, { useEffect, useState } from "react";
import axios from "axios";
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

const WasteReportPage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const axiosConfig = {
      headers: { Authorization: `Bearer ${token}` },
    };

    const BASE_URL = "https://system-waste-less-ai.onrender.com/api";

    const fetchData = async () => {
      try {
        const [
          revenueRes,
          percentRes,
          ingredientRes,
          topRes,
        ] = await Promise.all([
          axios.get(`${BASE_URL}/report-waste/revenue-loss-by-month`, axiosConfig),
          axios.get(`${BASE_URL}/report-waste/percent-loss-by-month`, axiosConfig),
          axios.get(`${BASE_URL}/report-waste/precent-ingredient-by-month`, axiosConfig),
          axios.get(`${BASE_URL}/report-waste/top-5-wasted-ingredients`, axiosConfig),
        ]);

        const summary = {
          wasteRate:
            ingredientRes.data?.data?.waste_percentage || 0,

          damageCost: Number(
            revenueRes.data?.data?.[0]?.total_waste_cost || 0
          ),

          reductionRate:
            percentRes.data?.data?.trend_percent || 0,
        };

        // ✅ SỬA THEO API MỚI
        const topWaste = (topRes.data?.data || []).map((item) => ({
          name: item.ingredient_name,
          amount: item.wasted_amount || 0, // dùng cho chart
          display: item.display_amount,    // dùng hiển thị
          trendPercent: item.trend_percent || 0,
          trendDirection: item.trend_direction, // up | down
        }));

        setData({
          summary,
          topWaste,
        });
      } catch (err) {
        console.log("API lỗi:", err);
      }
    };

    fetchData();
  }, []);

  const summary = data?.summary || {};
  const topWaste = data?.topWaste || [];

  const COLORS = ["#22C55E", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6"];

  return (
    <div className="ml-10 p-5 bg-[#F6F8FA] min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#141C21]">
          Báo cáo Phân tích Lãng phí
        </h1>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500 mb-2">
            TỈ LỆ LÃNG PHÍ/NGUYÊN LIỆU
          </p>
          <h2 className="text-2xl font-bold">
            {summary.wasteRate || 0}%
          </h2>
          
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500 mb-2">
            ƯỚC TÍNH GIÁ TRỊ THIỆT HẠI
          </p>
          <h2 className="text-2xl font-bold">
            {(summary.damageCost || 0).toLocaleString("vi-VN")} VND
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
                const isUp = item.trendDirection === "up";

                return (
                  <tr key={index} className="border-t">
                    <td className="py-3">{item.name}</td>

                    {/* ✅ HIỂN THỊ display_amount */}
                    <td className="text-center">
                      {item.display}
                    </td>

                    {/* ✅ TREND */}
                    <td className="text-center">
                      <span
                        className={`flex items-center justify-center gap-1 ${
                          isUp
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {isUp ? (
                          <ArrowUpRight size={14} />
                        ) : (
                          <ArrowDownRight size={14} />
                        )}
                        {item.trendPercent}%
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
            Top 5 nguyên liệu lãng phí
          </h3>

          <div className="w-full h-52">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={topWaste}
                  dataKey="amount"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                >
                  {topWaste.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* LEGEND */}
          <div className="text-sm mt-4 space-y-2">
            {topWaste.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: COLORS[index % COLORS.length],
                    }}
                  ></span>
                  {item.name}
                </span>
                <span>{item.display}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteReportPage;
import React, { useEffect, useState } from "react";
import { Filter } from "lucide-react";

const FoodData = () => {
    // ===== STATE =====
    const [foodData, setFoodData] = useState([]);
    const [totalDish, setTotalDish] = useState(0);
    const [loading, setLoading] = useState(true);

    // ===== CALL API =====
    useEffect(() => {
        fetchFoodData();
    }, []);

    const fetchFoodData = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(
                "https://wasteless-ai.onrender.com/api/consumption/list-dishes-output-lastday",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();

            console.log("API:", data);

            if (data.success) {
                
                setFoodData(data.data.dishesOutput || []);
                setTotalDish(data.data.sumDish || 0);
            }
        } catch (error) {
            console.error("Lỗi API:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="mb-2">
                    <span className="text-sm text-[#8B8B8B] tracking-wider">
                        FWMS
                    </span>
                    <span className="text-sm text-[#8B8B8B] ml-1">
                        MANAGEMENT SYSTEM
                    </span>
                </div>
                <h2 className="text-3xl font-bold text-[#141C21] mb-2">
                    Dữ liệu món ăn (Món ra & Món dư)
                </h2>
                <p className="text-base text-[#8B8B8B]">
                    Theo dõi và phân tích dữ liệu tiêu thụ từng món ăn trong nhà bếp.
                </p>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <p className="text-sm text-[#8B8B8B] mb-2">
                    Trạng thái món ăn phục vụ
                </p>
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-[#141C21]">
                            {loading ? "..." : totalDish}
                        </span>
                        <span className="text-base text-[#141C21]">Món</span>
                    </div>
                    <span className="text-sm text-[#10BC5D] bg-green-50 px-4 py-2 rounded-full font-medium">
                        Dữ liệu hôm qua
                    </span>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-base font-semibold text-[#141C21] mb-4">
                    Bộ lọc tìm kiếm
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="mm/dd/yyyy"
                        className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm"
                    />
                    <select className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm">
                        <option>Loại món ăn</option>
                    </select>
                    <select className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm">
                        <option>Chọn tháng</option>
                    </select>
                    <button className="flex items-center justify-center gap-2 bg-[#10BC5D] text-white px-4 py-2.5 rounded-lg text-sm font-medium">
                        <Filter size={16} />
                        Lọc dữ liệu
                    </button>
                </div>
            </div>
            
            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="py-4 px-5 text-left text-sm font-bold">NGÀY</th>
                            <th className="py-4 px-5 text-left text-sm font-bold">MÃ MÓN</th>
                            <th className="py-4 px-5 text-left text-sm font-bold">SL RA</th>
                            <th className="py-4 px-5 text-left text-sm font-bold">SL DƯ</th>
                            <th className="py-4 px-5 text-left text-sm font-bold">% DƯ</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center py-4">
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : foodData.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-4">
                                    Không có dữ liệu
                                </td>
                            </tr>
                        ) : (
                            foodData.map((row, index) => {
                                return (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="py-4 px-5">
                                            {new Date(row["daily_operation.operation_date"]).toLocaleDateString("vi-VN")}
                                        </td>
                                        <td className="py-4 px-5">
                                            {row["dish.name"]}
                                        </td>
                                        <td className="py-4 px-5">
                                            {row.quantity_prepared} suất
                                        </td>
                                        <td className="py-4 px-5">
                                            {row.quantity_wasted} suất
                                        </td>
                                        <td
                                            className={`py-4 px-5 font-bold ${
                                                row.waste_percentage > 20
                                                    ? "text-red-500"
                                                    : "text-[#141C21]"
                                            }`}
                                        >
                                             {row.waste_percentage}%
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-[#8B8B8B]">
                    Hiển thị {foodData.length} bản ghi
                </p>
            </div>
        </div>
    );
};

export default FoodData;
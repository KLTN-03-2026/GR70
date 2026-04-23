import React, { useEffect, useState } from "react";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";

const FoodData = () => {
    // ===== STATE =====
    const [foodData, setFoodData] = useState([]);
    const [totalDish, setTotalDish] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ===== PAGINATION STATE =====
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize] = useState(5); // 👈 ĐÃ SỬA: 5 items mỗi trang

    // ===== MOCK DATA FLAG =====
    const [useMockData, setUseMockData] = useState(false);

    // ===== MOCK DATA =====
    const generateMockData = () => {
        const dishes = [
            "Phở bò",
            "Bún chả",
            "Cơm tấm",
            "Bánh mì",
            "Mì Quảng",
            "Bún bò Huế",
            "Cao lầu",
            "Hủ tiếu",
            "Cháo lòng",
            "Cơm rang",
            "Gà chiên",
            "Cá kho",
            "Thịt kho",
            "Canh chua",
            "Rau muống",
            "Đậu phụ",
            "Trứng chiên",
            "Súp cua",
            "Nem rán",
            "Chả giò",
        ];

        const mockDataList = [];
        let totalDishesCount = 0;

        // Tạo data từ 01/04/2026 đến 23/04/2026
        for (let day = 1; day <= 23; day++) {
            const date = `2026-04-${day.toString().padStart(2, "0")}`;
            const numDishesPerDay = Math.floor(Math.random() * 6) + 3;

            for (let i = 0; i < numDishesPerDay; i++) {
                const quantityPrepared = Math.floor(Math.random() * 100) + 20;
                const quantityWasted = Math.floor(
                    Math.random() * quantityPrepared * 0.3,
                );
                const wastePercent = (
                    (quantityWasted / quantityPrepared) *
                    100
                ).toFixed(1);

                mockDataList.push({
                    id: `${date}-${i}`,
                    daily_operation: {
                        operation_date: date,
                    },
                    dish: {
                        name: dishes[Math.floor(Math.random() * dishes.length)],
                    },
                    quantity_prepared: quantityPrepared,
                    quantity_wasted: quantityWasted,
                    waste_percentage: parseFloat(wastePercent),
                });

                totalDishesCount += quantityPrepared;
            }
        }

        // Thêm data cho ngày hôm qua
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        for (let i = 0; i < 8; i++) {
            const quantityPrepared = Math.floor(Math.random() * 80) + 30;
            const quantityWasted = Math.floor(
                Math.random() * quantityPrepared * 0.25,
            );
            const wastePercent = (
                (quantityWasted / quantityPrepared) *
                100
            ).toFixed(1);

            mockDataList.push({
                id: `${yesterdayStr}-${i}`,
                daily_operation: {
                    operation_date: yesterdayStr,
                },
                dish: {
                    name: dishes[Math.floor(Math.random() * dishes.length)],
                },
                quantity_prepared: quantityPrepared,
                quantity_wasted: quantityWasted,
                waste_percentage: parseFloat(wastePercent),
            });

            totalDishesCount += quantityPrepared;
        }

        return { mockDataList, totalDishesCount };
    };

    // ===== CALL API =====
    useEffect(() => {
        fetchFoodData();
    }, [currentPage]); // Re-fetch khi currentPage thay đổi

    const fetchFoodData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Nếu đang ở chế độ mock data
            if (useMockData) {
                console.log("Đang sử dụng MOCK DATA để test");
                setTimeout(() => {
                    const { mockDataList, totalDishesCount } =
                        generateMockData();
                    // Phân trang client-side cho mock data - MỖI TRANG 5 MÓN
                    const startIndex = (currentPage - 1) * pageSize;
                    const endIndex = startIndex + pageSize;
                    const paginatedData = mockDataList.slice(
                        startIndex,
                        endIndex,
                    );

                    setFoodData(paginatedData);
                    setTotalDish(totalDishesCount);
                    setTotalItems(mockDataList.length);
                    setTotalPages(Math.ceil(mockDataList.length / pageSize));
                    setLoading(false);
                }, 500);
                return;
            }

            const token = localStorage.getItem("token");

            // Gọi API với phân trang - MỖI TRANG 5 MÓN
            const res = await fetch(
                `https://system-waste-less-ai.onrender.com/api/consumption/list-dishes-output-lastday?page=${currentPage}&size=${pageSize}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            const data = await res.json();

            console.log("API Response:", data);

            if (data.success) {
                let dishesArray = [];
                let totalItemsFromAPI = 0;
                let totalPagesFromAPI = 1;

                if (
                    data.data?.dishesOutput?.data &&
                    Array.isArray(data.data.dishesOutput.data)
                ) {
                    dishesArray = data.data.dishesOutput.data;
                    totalItemsFromAPI = data.data.dishesOutput.total || 0;
                    totalPagesFromAPI = data.data.dishesOutput.totalPages || 1;
                } else if (Array.isArray(data.data?.dishesOutput)) {
                    dishesArray = data.data.dishesOutput;
                    totalItemsFromAPI = dishesArray.length;
                    totalPagesFromAPI = Math.ceil(
                        dishesArray.length / pageSize,
                    );
                } else {
                    dishesArray = [];
                    totalItemsFromAPI = 0;
                    totalPagesFromAPI = 1;
                }

                console.log("Dishes array length:", dishesArray.length);

                // Nếu API trả về mảng rỗng, chuyển sang mock data
                if (dishesArray.length === 0 && totalItemsFromAPI === 0) {
                    console.warn(
                        "API trả về dữ liệu rỗng, chuyển sang mock data để test",
                    );
                    const { mockDataList, totalDishesCount } =
                        generateMockData();
                    const startIndex = (currentPage - 1) * pageSize;
                    const endIndex = startIndex + pageSize;
                    const paginatedData = mockDataList.slice(
                        startIndex,
                        endIndex,
                    );

                    setFoodData(paginatedData);
                    setTotalDish(totalDishesCount);
                    setTotalItems(mockDataList.length);
                    setTotalPages(Math.ceil(mockDataList.length / pageSize));
                } else {
                    setFoodData(dishesArray);
                    setTotalDish(data.data?.sumDish || 0);
                    setTotalItems(totalItemsFromAPI);
                    setTotalPages(totalPagesFromAPI);
                }
            } else {
                // Nếu API fail, dùng mock data
                console.warn(
                    "API không thành công, chuyển sang mock data để test",
                );
                const { mockDataList, totalDishesCount } = generateMockData();
                const startIndex = (currentPage - 1) * pageSize;
                const endIndex = startIndex + pageSize;
                const paginatedData = mockDataList.slice(startIndex, endIndex);

                setFoodData(paginatedData);
                setTotalDish(totalDishesCount);
                setTotalItems(mockDataList.length);
                setTotalPages(Math.ceil(mockDataList.length / pageSize));
            }
        } catch (error) {
            console.error("Lỗi API:", error);
            // Dùng mock data khi có lỗi
            console.warn("Có lỗi xảy ra, chuyển sang mock data để test");
            const { mockDataList, totalDishesCount } = generateMockData();
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedData = mockDataList.slice(startIndex, endIndex);

            setFoodData(paginatedData);
            setTotalDish(totalDishesCount);
            setTotalItems(mockDataList.length);
            setTotalPages(Math.ceil(mockDataList.length / pageSize));
        } finally {
            setLoading(false);
        }
    };

    // ===== PAGINATION FUNCTIONS =====
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // ===== RENDER PAGINATION (GIỐNG UI SurplusDishes) =====
    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const startItem = (currentPage - 1) * pageSize + 1;
        const endItem = Math.min(currentPage * pageSize, totalItems);

        // Tạo mảng số trang hiển thị (tối đa 5 số)
        const getPageNumbers = () => {
            const pages = [];
            const maxVisible = 5;

            if (totalPages <= maxVisible) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else if (currentPage <= 3) {
                for (let i = 1; i <= maxVisible; i++) pages.push(i);
            } else if (currentPage >= totalPages - 2) {
                for (let i = totalPages - maxVisible + 1; i <= totalPages; i++)
                    pages.push(i);
            } else {
                for (let i = currentPage - 2; i <= currentPage + 2; i++)
                    pages.push(i);
            }
            return pages;
        };

        return (
            <div className="px-5 py-4 border-t flex justify-between items-center">
                <p className="text-sm text-[#8b8b8b]">
                    Hiển thị {startItem}-{endItem} trên {totalItems} bản ghi
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-1.5 disabled:opacity-50 hover:bg-gray-100 rounded transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    {getPageNumbers().map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 rounded transition-colors ${
                                currentPage === pageNum
                                    ? "bg-[#10bc5d] text-white"
                                    : "hover:bg-gray-100"
                            }`}
                        >
                            {pageNum}
                        </button>
                    ))}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-1.5 disabled:opacity-50 hover:bg-gray-100 rounded transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        );
    };

    // Hàm format date an toàn
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "N/A";
            return date.toLocaleDateString("vi-VN");
        } catch (error) {
            return "N/A";
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
                    Theo dõi và phân tích dữ liệu tiêu thụ từng món ăn trong nhà
                    bếp.
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
                            {loading ? "..." : totalDish.toLocaleString()}
                        </span>
                        <span className="text-base text-[#141C21]">Suất</span>
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
                        className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#10BC5D]"
                    />
                    <select className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#10BC5D]">
                        <option>Loại món ăn</option>
                    </select>
                    <select className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#10BC5D]">
                        <option>Chọn tháng</option>
                    </select>
                    <button className="flex items-center justify-center gap-2 bg-[#10BC5D] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                        <Filter size={16} />
                        Lọc dữ liệu
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="overflow-x-auto hide-scrollbar">
                    <table className="w-full min-w-[600px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="py-4 px-5 text-left text-sm font-bold text-[#141C21]">
                                    NGÀY
                                </th>
                                <th className="py-4 px-5 text-left text-sm font-bold text-[#141C21]">
                                    TÊN MÓN
                                </th>
                                <th className="py-4 px-5 text-left text-sm font-bold text-[#141C21]">
                                    SL RA
                                </th>
                                <th className="py-4 px-5 text-left text-sm font-bold text-[#141C21]">
                                    SL DƯ
                                </th>
                                <th className="py-4 px-5 text-left text-sm font-bold text-[#141C21]">
                                    % DƯ
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="text-center py-8"
                                    >
                                        <div className="flex justify-center items-center gap-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#10BC5D]"></div>
                                            <span className="text-gray-500">
                                                Đang tải dữ liệu...
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="text-center py-8 text-red-500"
                                    >
                                        {error}
                                        <button
                                            onClick={() => {
                                                setCurrentPage(1);
                                                fetchFoodData();
                                            }}
                                            className="ml-3 text-[#10BC5D] underline hover:text-green-600"
                                        >
                                            Thử lại
                                        </button>
                                    </td>
                                </tr>
                            ) : foodData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="text-center py-8 text-gray-500"
                                    >
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                foodData.map((row, index) => {
                                    const operationDate =
                                        row.daily_operation?.operation_date ||
                                        "";
                                    const dishName = row.dish?.name || "N/A";
                                    const quantityPrepared =
                                        row.quantity_prepared || 0;
                                    const quantityWasted =
                                        row.quantity_wasted || 0;
                                    const wastePercent =
                                        row.waste_percentage !== undefined &&
                                        row.waste_percentage !== null
                                            ? row.waste_percentage
                                            : 0;
                                    const isHighWaste = wastePercent > 20;

                                    return (
                                        <tr
                                            key={row.id || index}
                                            className="border-b hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="py-4 px-5 text-sm text-gray-600">
                                                {formatDate(operationDate)}
                                            </td>
                                            <td className="py-4 px-5 text-sm font-medium text-gray-800">
                                                {dishName}
                                            </td>
                                            <td className="py-4 px-5 text-sm text-gray-600">
                                                {quantityPrepared.toLocaleString()}{" "}
                                                suất
                                            </td>
                                            <td className="py-4 px-5 text-sm text-gray-600">
                                                {quantityWasted.toLocaleString()}{" "}
                                                suất
                                            </td>
                                            <td
                                                className={`py-4 px-5 text-sm font-bold ${
                                                    isHighWaste
                                                        ? "text-red-500"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                {wastePercent}%
                                                {isHighWaste && (
                                                    <span className="ml-2 text-xs text-red-400">
                                                        ⚠️
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination - Mỗi trang 5 món */}
            {!loading && !error && totalItems > 0 && renderPagination()}

            {/* Hiển thị thông tin số lượng món mỗi trang */}
            {!loading && !error && totalItems > 0 && (
                <div className="text-center text-xs text-gray-400 mt-2">
                    * Mỗi trang hiển thị {pageSize} món
                </div>
            )}
        </div>
    );
};

export default FoodData;

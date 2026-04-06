import React, { useState, useEffect, useCallback } from "react";
import DishFilterTabs from "./DishFilterTabs";
import DishDetailPanel from "./DishDetailPanel";
import { kitchenDishAPI } from "../../../services/kitchenApi";
import { jwtDecode } from "jwt-decode";
import {
    Calendar,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Edit2,
} from "lucide-react";
import { toast } from "sonner";

const ServedDishes = ({ surplusData = [], selectedDate: propSelectedDate }) => {
    const [activeTab, setActiveTab] = useState("all");
    const [selectedDish, setSelectedDish] = useState(null);
    const [quantity, setQuantity] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dishes, setDishes] = useState([]);
    const [brandId, setBrandId] = useState(null);
    const [allMasterDishes, setAllMasterDishes] = useState([]);
    const [selectedDate, setSelectedDate] = useState(
        propSelectedDate || new Date(),
    );

    const itemsPerPage = 5;

    // Cập nhật selectedDate khi prop thay đổi
    useEffect(() => {
        if (propSelectedDate) {
            setSelectedDate(propSelectedDate);
        }
    }, [propSelectedDate]);

    // Lấy brandID từ token
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.brandID) {
                    setBrandId(decoded.brandID);
                } else {
                    setError("Không tìm thấy thông tin brand trong token");
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error decoding token:", error);
                setError("Lỗi xác thực, vui lòng đăng nhập lại");
                setLoading(false);
            }
        } else {
            setError("Vui lòng đăng nhập để tiếp tục");
            setLoading(false);
        }
    }, []);

    // Fetch tất cả món ăn từ API
    const fetchAllMasterDishes = useCallback(async () => {
        try {
            const response = await kitchenDishAPI.getAllDishes();
            if (response.success && response.data) {
                const formattedDishes = response.data.map((dish) => ({
                    id: dish.id,
                    name: dish.name,
                }));
                setAllMasterDishes(formattedDishes);
            }
        } catch (error) {
            console.error("Error fetching all master dishes:", error);
            toast.error("Không thể tải danh sách món ăn");
        }
    }, []);

    // Format ngày tháng
    const formatDate = (date) => {
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    // Hàm kiểm tra món có món dư không (từ surplusData)
    const isDishHasWaste = (dishName) => {
        const surplusItem = surplusData.find(
            (item) => item.name?.toLowerCase() === dishName?.toLowerCase(),
        );
        return surplusItem ? surplusItem.waste > 0 : false;
    };

    // Hàm lấy số lượng món dư
    const getWasteQuantity = (dishName) => {
        const surplusItem = surplusData.find(
            (item) => item.name?.toLowerCase() === dishName?.toLowerCase(),
        );
        return surplusItem ? surplusItem.waste : 0;
    };

    // Fetch dishes với ngày được chọn
    const fetchDishes = useCallback(async () => {
        if (!brandId) return;
        setLoading(true);
        setError(null);
        try {
            const formattedDate = selectedDate.toISOString().split("T")[0];
            const response = await kitchenDishAPI.getDishesOutput(
                brandId,
                formattedDate,
            );

            if (response.success && response.data) {
                const formattedDishes = response.data.map((item) => ({
                    id: item.id,
                    dailyDetailId: item.id,
                    name: item.dish?.name || "Unknown",
                    served: item.quantity_prepared || 0,
                    price: item.dish?.price || 0,
                    status: item.quantity_wasted > 0 ? "closed" : "active",
                    category: item.dish?.category || "Món chính",
                    ingredients: item.dish?.ingredients || [],
                    revenue_cost: parseFloat(item.revenue_cost) || 0,
                    waste_cost: parseFloat(item.waste_cost) || 0,
                    image:
                        item.dish?.image ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150",
                    quantity_prepared: item.quantity_prepared,
                    quantity_wasted: item.quantity_wasted,
                    dishId: item.dish?.id,
                    hasWaste: item.quantity_wasted > 0,
                }));
                setDishes(formattedDishes);
            } else {
                setError(response.message || "Không thể tải dữ liệu");
            }
        } catch (err) {
            console.error("Error fetching dishes:", err);
            setError(
                err.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu",
            );
        } finally {
            setLoading(false);
        }
    }, [brandId, selectedDate]);

    // Fetch master dishes khi component mount
    useEffect(() => {
        fetchAllMasterDishes();
    }, [fetchAllMasterDishes]);

    // Fetch khi brandId hoặc selectedDate thay đổi
    useEffect(() => {
        if (brandId) {
            fetchDishes();
        }
    }, [brandId, selectedDate, fetchDishes]);

    // Auto refresh mỗi 30 giây
    useEffect(() => {
        const interval = setInterval(() => {
            if (brandId && !loading) {
                fetchDishes();
            }
        }, 30000);
        return () => clearInterval(interval);
    }, [brandId, loading, fetchDishes]);

    const handleRefresh = () => {
        fetchDishes();
        toast.success("Đã làm mới dữ liệu", { duration: 2000 });
    };

    const formatPrice = (price) =>
        new Intl.NumberFormat("vi-VN").format(price) + "₫";

    const filteredDishes = dishes;
    const totalItems = filteredDishes.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentDishes = filteredDishes.slice(
        startIndex,
        startIndex + itemsPerPage,
    );

    const handleQuantityChange = (delta) => {
        setQuantity((prev) => Math.max(0, prev + delta));
    };

    // KIỂM TRA VÀ THÔNG BÁO KHI NHẤN LƯU - NẾU CÓ MÓN DƯ THÌ BÁO LỖI
    const handleSaveReport = async () => {
        if (selectedDish) {
            // Kiểm tra từ cả dish.hasWaste và surplusData
            const hasWaste =
                selectedDish.hasWaste ||
                selectedDish.quantity_wasted > 0 ||
                isDishHasWaste(selectedDish.name);

            if (hasWaste) {
                const wasteQty =
                    selectedDish.quantity_wasted > 0
                        ? selectedDish.quantity_wasted
                        : getWasteQuantity(selectedDish.name);

                toast.error(
                    `⛔ KHÔNG CÓ QUYỀN CẬP NHẬT!\n\n` +
                        `Món "${selectedDish.name}" đã được báo cáo là có ${wasteQty} phần MÓN DƯ.\n\n` +
                        `⚠️ Bạn không thể cập nhật số lượng món ra sau khi đã nhập món dư.\n\n` +
                        `💡 Vui lòng liên hệ quản lý nếu cần điều chỉnh.`,
                    {
                        duration: 6000,
                        position: "top-center",
                        style: {
                            whiteSpace: "pre-line",
                            backgroundColor: "#fee2e2",
                            color: "#991b1b",
                            border: "1px solid #fecaca",
                        },
                    },
                );
                return;
            }

            const toastId = toast.loading("Đang cập nhật số lượng...");
            try {
                const updateData = {
                    quantity_prepared: quantity,
                    quantity_wasted: selectedDish.quantity_wasted || 0,
                };

                const response = await kitchenDishAPI.updateDishesOutput(
                    selectedDish.dailyDetailId,
                    updateData,
                );

                if (response.success) {
                    await fetchDishes();
                    setSelectedDish(null);
                    toast.success(
                        `Đã cập nhật số lượng cho món ${selectedDish.name}: ${quantity} phần`,
                        { id: toastId, duration: 3000 },
                    );
                } else {
                    throw new Error(response.message || "Cập nhật thất bại");
                }
            } catch (error) {
                console.error("Error updating dish:", error);
                toast.error(
                    error.response?.data?.message ||
                        "Có lỗi xảy ra khi cập nhật số lượng",
                    { id: toastId, duration: 4000 },
                );
            }
        }
    };

    const handleAddNewDish = async (newDishData) => {
        const toastId = toast.loading("Đang thêm món...");
        try {
            if (!newDishData.name || !newDishData.quantity_prepared) {
                toast.error("Vui lòng nhập đầy đủ thông tin", { id: toastId });
                return;
            }

            const existingDailyDish = dishes.find(
                (d) => d.name.toLowerCase() === newDishData.name.toLowerCase(),
            );

            if (existingDailyDish) {
                // Kiểm tra nếu món đã có món dư
                const hasWaste =
                    existingDailyDish.hasWaste ||
                    existingDailyDish.quantity_wasted > 0 ||
                    isDishHasWaste(existingDailyDish.name);

                if (hasWaste) {
                    const wasteQty =
                        existingDailyDish.quantity_wasted > 0
                            ? existingDailyDish.quantity_wasted
                            : getWasteQuantity(existingDailyDish.name);

                    toast.error(
                        `⛔ KHÔNG CÓ QUYỀN CẬP NHẬT!\n\n` +
                            `Món "${existingDailyDish.name}" đã được báo cáo là có ${wasteQty} phần MÓN DƯ.\n\n` +
                            `⚠️ Bạn không thể thêm/cập nhật số lượng món ra sau khi đã nhập món dư.\n\n` +
                            `💡 Vui lòng liên hệ quản lý nếu cần điều chỉnh.`,
                        {
                            id: toastId,
                            duration: 6000,
                            position: "top-center",
                            style: {
                                whiteSpace: "pre-line",
                                backgroundColor: "#fee2e2",
                                color: "#991b1b",
                            },
                        },
                    );
                    return;
                }

                const updatedQuantity =
                    existingDailyDish.served + newDishData.quantity_prepared;
                const updateData = {
                    quantity_prepared: updatedQuantity,
                    quantity_wasted: existingDailyDish.quantity_wasted || 0,
                };
                await kitchenDishAPI.updateDishesOutput(
                    existingDailyDish.dailyDetailId,
                    updateData,
                );
                await fetchDishes();
                toast.success(
                    `✅ Đã cập nhật món ${existingDailyDish.name}: +${newDishData.quantity_prepared} phần`,
                    { id: toastId, duration: 3000 },
                );
                setShowAddForm(false);
                return;
            }

            const existingMasterDish = allMasterDishes.find(
                (d) => d.name.toLowerCase() === newDishData.name.toLowerCase(),
            );

            if (!existingMasterDish) {
                toast.error(
                    `❌ Món "${newDishData.name}" không có trong hệ thống.`,
                    { id: toastId, duration: 4000 },
                );
                return;
            }

            const requestData = {
                dishes_id: existingMasterDish.id,
                quantity_prepared: Number(newDishData.quantity_prepared),
            };

            const response = await kitchenDishAPI.createDishesDaily(
                brandId,
                requestData,
            );

            if (response.success) {
                await fetchDishes();
                toast.success(`✅ Đã thêm món ${newDishData.name} thành công`, {
                    id: toastId,
                    duration: 3000,
                });
                setShowAddForm(false);
            } else {
                throw new Error(response.message || "Thêm món thất bại");
            }
        } catch (error) {
            console.error("LỖI:", error);
            toast.error(
                error.response?.data?.message ||
                    error.message ||
                    "Có lỗi xảy ra",
                { id: toastId, duration: 4000 },
            );
        }
    };

    // Mở form chi tiết - luôn cho phép mở dù có món dư hay không
    const handleEditClick = (dish) => {
        setSelectedDish(dish);
        setQuantity(dish.served);
    };

    const handleRowClick = (dish) => {
        setSelectedDish(dish);
        setQuantity(dish.served);
    };

    if (loading && dishes.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">Đang tải dữ liệu...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-64">
                <div className="text-red-500 mb-4">{error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <Calendar className="text-[#10bc5d]" size={20} />
                    <span className="font-semibold">Ngày:</span>
                    <span className="text-lg font-medium">
                        {formatDate(selectedDate)}
                    </span>
                    {selectedDate.toDateString() ===
                        new Date().toDateString() && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Hôm nay
                        </span>
                    )}
                </div>
                <button
                    onClick={handleRefresh}
                    className="p-2 hover:bg-gray-100 rounded-full"
                >
                    <RefreshCw size={18} className="text-gray-600" />
                </button>
            </div>

            <div className="flex gap-8 items-start">
                <div className="flex-1">
                    <DishFilterTabs
                        activeTab={activeTab}
                        onTabChange={(tab) => {
                            setActiveTab(tab);
                            setCurrentPage(1);
                        }}
                        totalAll={dishes.length}
                        onAddNew={() => setShowAddForm(true)}
                        disabled={
                            selectedDate.toDateString() !==
                            new Date().toDateString()
                        }
                    />

                    {/* BẢNG HIỂN THỊ MÓN RA */}
                    <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr className="text-[#8b8b8b] text-xs uppercase">
                                    <th className="px-5 py-4 text-left">
                                        TÊN MÓN
                                    </th>
                                    <th className="px-5 py-4 text-left">
                                        ĐÃ RA
                                    </th>
                                    <th className="px-5 py-4 text-left">
                                        MÓN DƯ
                                    </th>
                                    <th className="px-5 py-4 text-left">
                                        DOANH THU
                                    </th>
                                    <th className="px-5 py-4 text-center">
                                        HÀNH ĐỘNG
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentDishes.map((dishItem) => {
                                    // Kiểm tra món có món dư không (chỉ để hiển thị số lượng)
                                    const wasteQty =
                                        dishItem.quantity_wasted > 0
                                            ? dishItem.quantity_wasted
                                            : getWasteQuantity(dishItem.name);

                                    return (
                                        <tr
                                            key={dishItem.id}
                                            className={`border-b cursor-pointer hover:bg-gray-50 ${
                                                selectedDish?.id === dishItem.id
                                                    ? "bg-green-50"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handleRowClick(dishItem)
                                            }
                                        >
                                            <td className="px-5 py-4">
                                                <div className="font-semibold">
                                                    {dishItem.name}
                                                </div>
                                                <div className="text-xs text-[#8b8b8b]">
                                                    {dishItem.category}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                {dishItem.served} phần
                                            </td>
                                            <td className="px-5 py-4">
                                                {wasteQty > 0 ? (
                                                    <div>
                                                        <span className="text-red-600 font-semibold">
                                                            {wasteQty} phần
                                                        </span>
                                                        <span className="text-xs text-red-500 block">
                                                            (
                                                            {formatPrice(
                                                                dishItem.waste_cost,
                                                            )}
                                                            )
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">
                                                        0 phần
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                {formatPrice(
                                                    dishItem.revenue_cost || 0,
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditClick(
                                                            dishItem,
                                                        );
                                                    }}
                                                    className="text-[#10bc5d] hover:text-[#0c9c4a]"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* PHÂN TRANG */}
                        {totalPages > 1 && (
                            <div className="px-5 py-4 border-t flex justify-between items-center">
                                <p className="text-sm text-[#8b8b8b]">
                                    Hiển thị {startIndex + 1}-
                                    {Math.min(
                                        startIndex + itemsPerPage,
                                        totalItems,
                                    )}{" "}
                                    trên {totalItems} món
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() =>
                                            setCurrentPage((p) =>
                                                Math.max(1, p - 1),
                                            )
                                        }
                                        disabled={currentPage === 1}
                                        className="p-1.5 disabled:opacity-50 hover:bg-gray-100 rounded"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <span className="px-3 py-1 rounded bg-[#10bc5d] text-white">
                                        {currentPage}
                                    </span>
                                    <button
                                        onClick={() =>
                                            setCurrentPage((p) =>
                                                Math.min(totalPages, p + 1),
                                            )
                                        }
                                        disabled={currentPage === totalPages}
                                        className="p-1.5 disabled:opacity-50 hover:bg-gray-100 rounded"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* PANEL CHI TIẾT - LUÔN HIỂN THỊ VÀ CHO PHÉP NHẬP SỐ LƯỢNG */}
                {selectedDish && (
                    <DishDetailPanel
                        isDetail={true}
                        dish={selectedDish}
                        quantity={quantity}
                        onQuantityChange={handleQuantityChange}
                        onSave={handleSaveReport}
                        onClose={() => setSelectedDish(null)}
                        formatPrice={formatPrice}
                        // KHÔNG disable - vẫn cho phép nhập số lượng
                        isReadOnly={
                            selectedDate.toDateString() !==
                            new Date().toDateString()
                        }
                    />
                )}

                {showAddForm && (
                    <DishDetailPanel
                        isModal={true}
                        onAdd={handleAddNewDish}
                        onClose={() => setShowAddForm(false)}
                        existingDishes={dishes}
                        selectedDate={selectedDate}
                        allMasterDishes={allMasterDishes}
                    />
                )}
            </div>
        </div>
    );
};

export default ServedDishes;

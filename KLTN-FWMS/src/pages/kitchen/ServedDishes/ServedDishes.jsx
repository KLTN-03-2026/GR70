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
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dishes, setDishes] = useState([]);
    const [brandId, setBrandId] = useState(null);
    const [allMasterDishes, setAllMasterDishes] = useState([]);
    const [selectedDate, setSelectedDate] = useState(
        propSelectedDate || new Date(),
    );

    // ========== PHÂN TRANG - LẤY TỪ API ==========
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize] = useState(5); // 5 items mỗi trang

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

    // ========== FETCH DISHES VỚI PHÂN TRANG TỪ API ==========
    const fetchDishes = useCallback(async () => {
        if (!brandId) return;
        setLoading(true);
        setError(null);
        try {
            const formattedDate = selectedDate.toISOString().split("T")[0];

            // Gọi API với page và size
            const response = await kitchenDishAPI.getDishesOutput(
                brandId,
                formattedDate,
                currentPage, // Trang hiện tại
                pageSize, // 5 items mỗi trang
            );

            console.log("ServedDishes API Response:", response);

            if (response.success && response.data) {
                // Lấy mảng từ response.data.data
                const dishesArray = response.data.data || [];

                const formattedDishes = dishesArray.map((item) => ({
                    id: item.id,
                    dailyDetailId: item.id,
                    name: item.dish?.name || "Unknown",
                    served: item.quantity_prepared || 0,
                    price: item.dish?.price || 0,
                    status: item.quantity_wasted > 0 ? "closed" : "active",
                    category: item.dish?.dish_category?.name || "Món chính",
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

                // Lấy thông tin phân trang từ API
                setTotalPages(response.data.totalPages || 1);
                setTotalItems(response.data.total || 0);
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
    }, [brandId, selectedDate, currentPage, pageSize]);

    // Reset về trang 1 khi đổi ngày
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedDate]);

    // Fetch master dishes khi component mount
    useEffect(() => {
        fetchAllMasterDishes();
    }, [fetchAllMasterDishes]);

    // Fetch khi brandId, selectedDate, hoặc currentPage thay đổi
    useEffect(() => {
        if (brandId) {
            fetchDishes();
        }
    }, [brandId, selectedDate, currentPage, fetchDishes]);

    const handleRefresh = () => {
        fetchDishes();
        toast.success("Đã làm mới dữ liệu", { duration: 2000 });
    };

    const formatPrice = (price) =>
        new Intl.NumberFormat("vi-VN").format(price) + "₫";

    // ========== FILTER THEO TAB (client-side filter) ==========
    const filteredDishes = dishes.filter((dish) => {
        if (activeTab === "active") return dish.status === "active";
        if (activeTab === "closed") return dish.status === "closed";
        return true;
    });

    // ========== XỬ LÝ CHUYỂN TRANG ==========
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // ========== RENDER PHÂN TRANG ==========
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
                    Hiển thị {startItem}-{endItem} trên {totalItems} món
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-1.5 disabled:opacity-50 hover:bg-gray-100 rounded"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    {getPageNumbers().map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 rounded ${
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
                        className="p-1.5 disabled:opacity-50 hover:bg-gray-100 rounded"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        );
    };

    const handleQuantityChange = (delta) => {
        setQuantity((prev) => Math.max(0, prev + delta));
    };

    const handleSaveReport = async () => {
        if (selectedDish) {
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
                        totalAll={totalItems} // Dùng total từ API
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
                                {filteredDishes.map((dishItem) => {
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
                        {renderPagination()}
                    </div>
                </div>

                {/* PANEL CHI TIẾT */}
                {selectedDish && (
                    <DishDetailPanel
                        isDetail={true}
                        dish={selectedDish}
                        quantity={quantity}
                        onQuantityChange={handleQuantityChange}
                        onSave={handleSaveReport}
                        onClose={() => setSelectedDish(null)}
                        formatPrice={formatPrice}
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

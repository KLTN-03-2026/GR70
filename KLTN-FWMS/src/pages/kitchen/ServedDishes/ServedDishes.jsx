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

const ServedDishes = ({
    surplusData = [],
    selectedDate: propSelectedDate,
    onDataChange,
}) => {
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
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize] = useState(5);

    // 👉 THÊM STATE ĐỂ LƯU THÔNG BÁO LỖI CHO TỪNG MÓN
    const [dishErrors, setDishErrors] = useState({});

    // Hàm sắp xếp món mới nhất lên đầu
    const sortDishesByLatest = (dishesList) => {
        return [...dishesList].sort((a, b) => {
            if (a.id && b.id) {
                return b.id.localeCompare(a.id);
            }
            return 0;
        });
    };

    // Hàm xử lý lỗi thiếu nguyên liệu
    const formatIngredientError = (errors) => {
        if (
            typeof errors === "string" &&
            errors.includes("Not enough ingredient")
        ) {
            return "⚠️ Không đủ nguyên liệu để thực hiện món này!";
        }
        if (errors && typeof errors === "object") {
            // Kiểm tra nếu errors là object chứa thông báo
            for (const key in errors) {
                if (
                    typeof errors[key] === "string" &&
                    errors[key].includes("Not enough ingredient")
                ) {
                    return "⚠️ Không đủ nguyên liệu để thực hiện món này!";
                }
            }
        }
        return null;
    };

    useEffect(() => {
        if (propSelectedDate) {
            setSelectedDate(propSelectedDate);
        }
    }, [propSelectedDate]);

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

    const formatDate = (date) => {
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    const isDishHasWaste = (dishName) => {
        const surplusItem = surplusData.find(
            (item) => item.name?.toLowerCase() === dishName?.toLowerCase(),
        );
        return surplusItem ? surplusItem.waste > 0 : false;
    };

    const getWasteQuantity = (dishName) => {
        const surplusItem = surplusData.find(
            (item) => item.name?.toLowerCase() === dishName?.toLowerCase(),
        );
        return surplusItem ? surplusItem.waste : 0;
    };

    const fetchDishes = useCallback(async () => {
        if (!brandId) return;
        console.log(
            "🟢 [MÓN RA] fetchDishes đang được gọi, activeTab =",
            activeTab,
        );
        setLoading(true);
        setError(null);
        try {
            const formattedDate = selectedDate.toISOString().split("T")[0];
            let statusParam = null;
            if (activeTab === "active") statusParam = "active";
            if (activeTab === "closed") statusParam = "closed";
            console.log("🟢 [MÓN RA] Gọi API với statusParam =", statusParam);

            const response = await kitchenDishAPI.getDishesOutput(
                brandId,
                formattedDate,
                currentPage,
                pageSize,
                statusParam,
            );

            if (response.success && response.data) {
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

                const sortedDishes = sortDishesByLatest(formattedDishes);
                setDishes(sortedDishes);
                setTotalPages(response.data.totalPages || 1);
                setTotalItems(response.data.total || 0);

                // Reset errors khi load lại dữ liệu
                setDishErrors({});
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
    }, [brandId, selectedDate, currentPage, pageSize, activeTab]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, selectedDate]);

    useEffect(() => {
        fetchAllMasterDishes();
    }, [fetchAllMasterDishes]);

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

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const startItem = (currentPage - 1) * pageSize + 1;
        const endItem = Math.min(currentPage * pageSize, totalItems);

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

    // Cập nhật số lượng món ra (từ panel chi tiết)
    const handleSaveReport = async () => {
        if (selectedDish) {
            // Kiểm tra món đã có món dư chưa
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
                    `KHÔNG CÓ QUYỀN CẬP NHẬT!\n\n` +
                        `Món "${selectedDish.name}" đã được báo cáo là có ${wasteQty} phần MÓN DƯ.\n\n` +
                        `Bạn không thể cập nhật số lượng món ra sau khi đã nhập món dư.\n\n` +
                        `Vui lòng liên hệ quản lý nếu cần điều chỉnh.`,
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

            // Kiểm tra không cho phép đặt số lượng về 0
            if (quantity === 0) {
                toast.error(
                    "Không thể đặt số lượng món ra về 0!\n\nVui lòng liên hệ quản lý nếu muốn xóa món.",
                    { duration: 4000, position: "top-center" },
                );
                return;
            }

            // Kiểm tra không cho giảm số lượng
            if (quantity < selectedDish.served) {
                toast.error(
                    "Không thể giảm số lượng món ra!\n\nChỉ có thể tăng thêm số lượng món đã làm ra.",
                    { duration: 4000, position: "top-center" },
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
                    if (onDataChange) {
                        onDataChange();
                    }
                    toast.success(
                        `Đã cập nhật số lượng cho món ${selectedDish.name}: ${quantity} phần`,
                        { id: toastId, duration: 3000 },
                    );
                } else {
                    throw new Error(response.message || "Cập nhật thất bại");
                }
            } catch (error) {
                console.error("Error updating dish:", error);

                let errorMessage = "Có lỗi xảy ra khi cập nhật số lượng";
                const ingredientError = formatIngredientError(
                    error.response?.data?.errors || error.message,
                );

                if (ingredientError) {
                    errorMessage = ingredientError;
                    // Lưu lỗi vào state để hiển thị trong panel
                    setDishErrors((prev) => ({
                        ...prev,
                        [selectedDish.name]: ingredientError,
                    }));
                } else if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error.message) {
                    errorMessage = error.message;
                }

                toast.error(errorMessage, { id: toastId, duration: 6000 });
            }
        }
    };
    // Thêm món ra mới hoặc cập nhật món đã có - ĐÃ SỬA (KHÔNG TOAST ERROR)
    const handleAddNewDish = async (newDishData) => {
        // KHÔNG hiển thị toast loading
        try {
            if (!newDishData.name || !newDishData.quantity_prepared) {
                throw new Error("Vui lòng nhập đầy đủ thông tin");
            }
            if (newDishData.quantity_prepared <= 0) {
                throw new Error("Số lượng thêm vào phải lớn hơn 0!");
            }

            const existingDailyDish = dishes.find(
                (d) => d.name.toLowerCase() === newDishData.name.toLowerCase(),
            );

            if (existingDailyDish) {
                // KIỂM TRA MÓN ĐÃ CÓ MÓN DƯ CHƯA
                const hasWaste =
                    existingDailyDish.hasWaste ||
                    existingDailyDish.quantity_wasted > 0 ||
                    isDishHasWaste(existingDailyDish.name);

                if (hasWaste) {
                    throw new Error(
                        `KHÔNG CÓ QUYỀN CẬP NHẬT!\n\n` +
                            `Món "${existingDailyDish.name}" đã được báo cáo là có món dư.\n\n` +
                            `Bạn không thể thêm/cập nhật số lượng món ra sau khi đã nhập món dư.\n\n` +
                            `Vui lòng liên hệ quản lý nếu cần điều chỉnh.`,
                    );
                }

                const updatedQuantity =
                    existingDailyDish.served + newDishData.quantity_prepared;

                await kitchenDishAPI.updateDishesOutput(
                    existingDailyDish.dailyDetailId,
                    { quantity_prepared: updatedQuantity },
                );
                await fetchDishes();
                if (onDataChange) {
                    onDataChange();
                }
                setShowAddForm(false);
                toast.success(
                    `Món đã có nên cập nhật thêm món ${existingDailyDish.name}: +${newDishData.quantity_prepared} phần`,
                    { duration: 3000 },
                );
            } else {
                const existingMasterDish = allMasterDishes.find(
                    (d) =>
                        d.name.toLowerCase() === newDishData.name.toLowerCase(),
                );

                if (!existingMasterDish) {
                    throw new Error(
                        `Món "${newDishData.name}" không có trong hệ thống.`,
                    );
                }

                await kitchenDishAPI.createDishesDaily(brandId, {
                    dishes_id: existingMasterDish.id,
                    quantity_prepared: Number(newDishData.quantity_prepared),
                });
                await fetchDishes();
                if (onDataChange) {
                    onDataChange();
                }
                setShowAddForm(false);
                toast.success(`Đã thêm món ${newDishData.name} thành công`, {
                    duration: 3000,
                });
            }
        } catch (error) {
            console.error("Error adding dish:", error);

            let errorMessage = "Có lỗi xảy ra khi thêm món";
            const errors = error.response?.data?.errors;

            if (errors && typeof errors === "string") {
                if (errors.includes("Not enough ingredient")) {
                    errorMessage =
                        "⚠️ Không đủ nguyên liệu để thực hiện món này!";
                } else {
                    errorMessage = errors;
                }
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
                if (errorMessage.includes("Not enough ingredient")) {
                    errorMessage =
                        "⚠️ Không đủ nguyên liệu để thực hiện món này!";
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            // 👉 Ném lỗi lên modal xử lý - KHÔNG gọi toast.error
            throw new Error(errorMessage);
        }
    };

    const handleEditClick = (dish) => {
        // Kiểm tra lỗi trước khi mở panel
        if (dishErrors[dish.name]) {
            toast.error(dishErrors[dish.name], { duration: 5000 });
            return;
        }
        setSelectedDish(dish);
        setQuantity(dish.served);
    };

    const handleRowClick = (dish) => {
        // Kiểm tra lỗi trước khi mở panel
        if (dishErrors[dish.name]) {
            toast.error(dishErrors[dish.name], { duration: 5000 });
            return;
        }
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
                        totalAll={totalItems}
                        onAddNew={() => setShowAddForm(true)}
                        disabled={
                            selectedDate.toDateString() !==
                            new Date().toDateString()
                        }
                    />

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
                                {dishes.map((dishItem) => {
                                    const wasteQty =
                                        dishItem.quantity_wasted > 0
                                            ? dishItem.quantity_wasted
                                            : getWasteQuantity(dishItem.name);
                                    const hasWaste = wasteQty > 0;
                                    const hasError = dishErrors[dishItem.name];

                                    // Xác định class cho hàng dựa trên lỗi
                                    let rowClassName =
                                        "border-b cursor-pointer hover:bg-gray-50";
                                    if (selectedDish?.id === dishItem.id)
                                        rowClassName += " bg-green-50";
                                    if (hasWaste) rowClassName += " opacity-60";
                                    if (hasError && !hasWaste)
                                        rowClassName +=
                                            " bg-red-50 hover:bg-red-100";

                                    return (
                                        <tr
                                            key={dishItem.id}
                                            className={rowClassName}
                                            onClick={() =>
                                                handleRowClick(dishItem)
                                            }
                                        >
                                            <td className="px-5 py-4">
                                                <div className="font-semibold">
                                                    {dishItem.name}
                                                    {hasWaste && (
                                                        <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                                            Đã đóng
                                                        </span>
                                                    )}
                                                    {hasError && !hasWaste && (
                                                        <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                                                            Thiếu nguyên liệu
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-[#8b8b8b]">
                                                    {dishItem.category}
                                                </div>
                                                {/* Hiển thị lỗi dưới tên món */}
                                                {hasError && !hasWaste && (
                                                    <div className="text-xs text-red-600 mt-1">
                                                        {hasError}
                                                    </div>
                                                )}
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
                                                        if (
                                                            !hasWaste &&
                                                            !hasError
                                                        ) {
                                                            handleEditClick(
                                                                dishItem,
                                                            );
                                                        } else if (hasError) {
                                                            toast.error(
                                                                hasError,
                                                                {
                                                                    duration: 3000,
                                                                },
                                                            );
                                                        } else {
                                                            toast.error(
                                                                `Món "${dishItem.name}" đã có món dư, không thể chỉnh sửa!`,
                                                                {
                                                                    duration: 3000,
                                                                },
                                                            );
                                                        }
                                                    }}
                                                    className={`text-[#10bc5d] hover:text-[#0c9c4a] ${hasWaste || hasError ? "opacity-50 cursor-not-allowed" : ""}`}
                                                    disabled={
                                                        hasWaste || hasError
                                                    }
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {renderPagination()}
                    </div>
                </div>
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
                                new Date().toDateString() ||
                            selectedDish.hasWaste ||
                            selectedDish.quantity_wasted > 0 ||
                            isDishHasWaste(selectedDish.name) ||
                            !!dishErrors[selectedDish.name]
                        }
                        errorMessage={dishErrors[selectedDish.name]} // Truyền lỗi xuống panel
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
                        onError={(errorMsg, dishName) => {
                            // Callback để nhận lỗi từ modal
                            const ingredientError =
                                formatIngredientError(errorMsg);
                            if (ingredientError && dishName) {
                                setDishErrors((prev) => ({
                                    ...prev,
                                    [dishName]: ingredientError,
                                }));
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default ServedDishes;

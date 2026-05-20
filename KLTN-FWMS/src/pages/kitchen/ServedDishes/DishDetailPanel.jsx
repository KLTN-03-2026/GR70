import React, { useState } from "react";
import {
    Edit2,
    Minus,
    Plus,
    Save,
    X,
    ChevronLeft,
    ChevronRight,
    Calendar,
    ChevronDown,
    Search,
} from "lucide-react";

const DishDetailPanel = ({
    isTable,
    isDetail,
    isModal,
    dishes = [],
    selectedDish,
    onRowClick,
    onEditClick,
    formatPrice,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    totalItems,
    onPageChange,
    dish,
    quantity,
    onQuantityChange,
    onSave,
    onClose,
    onAdd,
    existingDishes = [],
    selectedDate = new Date(),
    isReadOnly = false,
    allMasterDishes = [],
}) => {
    // Hàm kiểm tra món đã có món dư chưa
    const isDishHasWaste = (dishName) => {
        const existingDish = existingDishes.find(
            (d) => d.name?.toLowerCase() === dishName?.toLowerCase(),
        );
        return existingDish
            ? existingDish.waste > 0 || existingDish.hasWaste
            : false;
    };

    // Modal thêm món
    if (isModal) {
        const [dishName, setDishName] = useState("");
        const [quantityPrepared, setQuantityPrepared] = useState(0);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState("");
        const [isDropdownOpen, setIsDropdownOpen] = useState(false);
        const [searchTerm, setSearchTerm] = useState("");
        const [selectedDishId, setSelectedDishId] = useState(null);
        const [warningMessage, setWarningMessage] = useState(""); // 👈 THÊM STATE CHO CẢNH BÁO

        const formatDate = (date) => {
            return date.toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            });
        };

        const filteredDishes = allMasterDishes.filter((dish) =>
            dish.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );

        // 👉 HÀM KIỂM TRA LỖI KHI CHỌN MÓN
        const checkDishError = (dishNameToCheck) => {
            // Kiểm tra món dư
            if (isDishHasWaste(dishNameToCheck)) {
                setWarningMessage(
                    `KHÔNG CÓ QUYỀN CẬP NHẬT!\n\n` +
                        `Món "${dishNameToCheck}" đã được báo cáo là có món dư.\n\n` +
                        `Bạn không thể thêm/cập nhật số lượng món ra sau khi đã nhập món dư.\n\n` +
                        `Vui lòng liên hệ quản lý nếu cần điều chỉnh.`,
                );
                return false;
            }
            setWarningMessage("");
            return true;
        };

        const handleSelectDish = (dish) => {
            setDishName(dish.name);
            setSelectedDishId(dish.id);
            setSearchTerm("");
            setIsDropdownOpen(false);
            setError("");
            // 👉 KIỂM TRA NGAY KHI CHỌN MÓN
            checkDishError(dish.name);
        };

        const handleInputClick = () => {
            setIsDropdownOpen(true);
            setSearchTerm("");
            setWarningMessage("");
        };

        const handleInputChange = (e) => {
            const value = e.target.value;
            setDishName(value);
            setSelectedDishId(null);
            setSearchTerm(value);
            setIsDropdownOpen(true);
            setError("");
            setWarningMessage(""); // Reset warning khi nhập
        };

        const handleSubmit = async () => {
            if (!dishName.trim()) {
                setError("Vui lòng chọn hoặc nhập tên món ăn!");
                return;
            }

            // 👉 KIỂM TRA MÓN DƯ TRƯỚC KHI SUBMIT
            if (isDishHasWaste(dishName.trim())) {
                setWarningMessage(
                    `KHÔNG CÓ QUYỀN CẬP NHẬT!\n\n` +
                        `Món "${dishName.trim()}" đã được báo cáo là có món dư.\n\n` +
                        `Bạn không thể thêm/cập nhật số lượng món ra sau khi đã nhập món dư.\n\n` +
                        `Vui lòng liên hệ quản lý nếu cần điều chỉnh.`,
                );
                return;
            }

            if (quantityPrepared <= 0) {
                setError("Vui lòng nhập số lượng hợp lệ!");
                return;
            }

            setError("");
            setWarningMessage("");
            setLoading(true);

            try {
                const submitData = {
                    name: dishName.trim(),
                    quantity_prepared: Number(quantityPrepared),
                };

                if (onAdd) {
                    await onAdd(submitData);
                }
                onClose();
            } catch (error) {
                console.error("Lỗi khi submit:", error);

                let errorMsg = "Có lỗi xảy ra khi thêm món";
                const errors = error.response?.data?.errors;

                if (errors && typeof errors === "string") {
                    if (errors.includes("Not enough ingredient")) {
                        errorMsg =
                            "⚠️ Không đủ nguyên liệu để thực hiện món này!";
                    } else {
                        errorMsg = errors;
                    }
                } else if (error.response?.data?.message) {
                    errorMsg = error.response.data.message;
                    // Kiểm tra lỗi từ message
                    if (errorMsg.includes("Not enough ingredient")) {
                        errorMsg =
                            "⚠️ Không đủ nguyên liệu để thực hiện món này!";
                    }
                } else if (error.message) {
                    errorMsg = error.message;
                }

                // Nếu là lỗi nguyên liệu, hiển thị dưới dạng warning
                if (errorMsg.includes("Không đủ nguyên liệu")) {
                    setWarningMessage(errorMsg);
                } else {
                    setError(errorMsg);
                }
            } finally {
                setLoading(false);
            }
        };

        return (
            <>
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={onClose}
                />
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-xl font-bold">
                                Thêm món ra mới
                            </h3>
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="hover:bg-gray-100 p-1 rounded"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="mx-6 mt-2">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                                <div className="flex items-center gap-2 text-sm text-blue-800">
                                    <Calendar size={16} />
                                    <span>
                                        Ngày: {formatDate(selectedDate)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    TÊN MÓN ĂN *
                                </label>
                                <div className="relative">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={dishName}
                                            onChange={handleInputChange}
                                            onClick={handleInputClick}
                                            disabled={loading}
                                            placeholder="Nhập hoặc chọn món ăn..."
                                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#10bc5d] focus:border-transparent disabled:bg-gray-100 pr-10 ${
                                                warningMessage
                                                    ? "border-red-500 bg-red-50"
                                                    : ""
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsDropdownOpen(
                                                    !isDropdownOpen,
                                                )
                                            }
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <ChevronDown size={20} />
                                        </button>
                                    </div>

                                    {isDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                                            <div className="p-2 border-b">
                                                <div className="relative">
                                                    <Search
                                                        size={16}
                                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={searchTerm}
                                                        onChange={(e) =>
                                                            setSearchTerm(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Tìm kiếm món ăn..."
                                                        className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#10bc5d] focus:border-transparent"
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>
                                            <div className="max-h-60 overflow-auto">
                                                {filteredDishes.length > 0 ? (
                                                    filteredDishes.map(
                                                        (dish) => {
                                                            // Kiểm tra món có bị khóa không
                                                            const hasWaste =
                                                                isDishHasWaste(
                                                                    dish.name,
                                                                );
                                                            return (
                                                                <div
                                                                    key={
                                                                        dish.id
                                                                    }
                                                                    className={`px-4 py-3 border-b last:border-b-0 ${
                                                                        hasWaste
                                                                            ? "opacity-50 bg-gray-50 cursor-not-allowed"
                                                                            : "hover:bg-gray-50 cursor-pointer"
                                                                    }`}
                                                                    onClick={() => {
                                                                        if (
                                                                            !hasWaste
                                                                        ) {
                                                                            handleSelectDish(
                                                                                dish,
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    <div className="font-medium text-gray-900">
                                                                        {
                                                                            dish.name
                                                                        }
                                                                        {hasWaste && (
                                                                            <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                                                                Đã
                                                                                có
                                                                                món
                                                                                dư
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        },
                                                    )
                                                ) : (
                                                    <div className="px-4 py-8 text-center text-gray-500">
                                                        <p>
                                                            Không tìm thấy món
                                                            ăn
                                                        </p>
                                                        <p className="text-xs mt-1">
                                                            Bạn có thể nhập tên
                                                            món mới
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 👉 HIỂN THỊ THÔNG BÁO LỖI NGAY DƯỚI Ô INPUT */}
                                {warningMessage && (
                                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-600 text-sm whitespace-pre-line">
                                            {warningMessage}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    SỐ LƯỢNG CHUẨN BỊ *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={quantityPrepared || ""}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        setQuantityPrepared(
                                            isNaN(value) ? 0 : value,
                                        );
                                        setError("");
                                    }}
                                    disabled={loading}
                                    placeholder="Nhập số lượng"
                                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#10bc5d] disabled:bg-gray-100"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-600 whitespace-pre-line">
                                        {error}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 p-6 border-t">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={
                                    loading ||
                                    !dishName.trim() ||
                                    quantityPrepared <= 0 ||
                                    !!warningMessage
                                }
                                className="flex-1 px-4 py-2.5 bg-[#10bc5d] text-white rounded-lg hover:bg-[#0c9c4a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    "Thêm món ăn"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Bảng hiển thị
    if (isTable) {
        return (
            <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr className="text-[#8b8b8b] text-xs uppercase">
                            <th className="px-5 py-4 text-left">TÊN MÓN</th>
                            <th className="px-5 py-4 text-left">ĐÃ RA</th>
                            <th className="px-5 py-4 text-left">MÓN DƯ</th>
                            <th className="px-5 py-4 text-left">DOANH THU</th>
                            <th className="px-5 py-4 text-center">HÀNH ĐỘNG</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dishes.map((dishItem) => {
                            const hasWaste =
                                dishItem.waste > 0 ||
                                dishItem.quantity_wasted > 0;
                            return (
                                <tr
                                    key={dishItem.id}
                                    className={`border-b cursor-pointer hover:bg-gray-50 ${
                                        selectedDish?.id === dishItem.id
                                            ? "bg-green-50"
                                            : ""
                                    } ${hasWaste ? "opacity-60" : ""}`}
                                    onClick={() => onRowClick(dishItem)}
                                >
                                    <td className="px-5 py-4">
                                        <div className="font-semibold">
                                            {dishItem.name}
                                            {hasWaste && (
                                                <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                                    Đã đóng
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-[#8b8b8b]">
                                            {dishItem.category}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        {dishItem.served || dishItem.prepared}{" "}
                                        phần
                                    </td>
                                    <td className="px-5 py-4">
                                        {dishItem.waste > 0 ||
                                        dishItem.quantity_wasted > 0 ? (
                                            <div>
                                                <span className="text-red-600 font-semibold">
                                                    {dishItem.waste ||
                                                        dishItem.quantity_wasted}{" "}
                                                    phần
                                                </span>
                                                <span className="text-xs text-red-500 block">
                                                    (
                                                    {formatPrice
                                                        ? formatPrice(
                                                              dishItem.waste_cost,
                                                          )
                                                        : `${dishItem.waste_cost}₫`}
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
                                        {formatPrice
                                            ? formatPrice(
                                                  dishItem.revenue_cost || 0,
                                              )
                                            : `${dishItem.revenue_cost || 0}₫`}
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!hasWaste) {
                                                    onEditClick(dishItem);
                                                }
                                            }}
                                            className={`text-[#10bc5d] hover:text-[#0c9c4a] ${hasWaste ? "opacity-50 cursor-not-allowed" : ""}`}
                                            disabled={hasWaste}
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <div className="px-5 py-4 border-t flex justify-between items-center">
                    <p className="text-sm text-[#8b8b8b]">
                        Hiển thị {startIndex + 1}-{endIndex} trên {totalItems}{" "}
                        món
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-1.5 disabled:opacity-50 hover:bg-gray-100 rounded"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => onPageChange(i + 1)}
                                className={`px-3 py-1 rounded ${
                                    currentPage === i + 1
                                        ? "bg-[#10bc5d] text-white"
                                        : "hover:bg-gray-100"
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-1.5 disabled:opacity-50 hover:bg-gray-100 rounded"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Panel chi tiết
    if (isDetail && dish) {
        const handleDetailServedChange = (e) => {
            const numericValue = e.target.value.replace(/[^\d]/g, "");
            if (numericValue === "") {
                onQuantityChange(-quantity);
            } else {
                const number = parseInt(numericValue, 10);
                if (!isNaN(number) && number >= 0)
                    onQuantityChange(number - quantity);
            }
        };

        return (
            <div className="w-[420px] bg-white rounded-xl border p-6 shadow-md -mt-20">
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>
                <h3 className="text-xl font-bold mb-2 border-l-4 border-[#10bc5d] pl-3">
                    CHI TIẾT MÓN ĂN
                </h3>
                <div className="flex justify-center mb-2">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#10bc5d]/20 shadow-md">
                        <img
                            src={dish.image}
                            alt={dish.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.src =
                                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150";
                            }}
                        />
                    </div>
                </div>
                <div className="text-center mb-3">
                    <h4 className="text-xl font-bold">{dish.name}</h4>
                </div>
                <div className="mb-4">
                    <p className="text-sm font-semibold uppercase">DANH MỤC</p>
                    <p className="text-base text-[#8b8b8b]">{dish.category}</p>
                </div>
                <div className="mb-5">
                    <p className="text-sm font-semibold uppercase mb-3">
                        NGUYÊN LIỆU TIÊU CHUẨN
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {dish.ingredients && dish.ingredients.length > 0 ? (
                            dish.ingredients.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-2"
                                >
                                    <span className="text-[#10bc5d]">•</span>
                                    <span className="text-sm text-[#8b8b8b]">
                                        {item}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 col-span-2">
                                Chưa có thông tin nguyên liệu
                            </p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="bg-red-50 rounded-xl p-3">
                        <p className="text-xs font-semibold uppercase">
                            CHI PHÍ HAO HỤT
                        </p>
                        <p className="text-lg font-bold text-red-500">
                            {formatPrice
                                ? formatPrice(dish.waste_cost || 0)
                                : `${dish.waste_cost || 0}₫`}
                        </p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3">
                        <p className="text-xs font-semibold uppercase">
                            DOANH THU DỰ KIẾN
                        </p>
                        <p className="text-lg font-bold text-green-500">
                            {formatPrice
                                ? formatPrice(dish.revenue_cost || 0)
                                : `${dish.revenue_cost || 0}₫`}
                        </p>
                    </div>
                </div>
                <div className="pt-2">
                    <p className="text-sm font-semibold uppercase mb-2">
                        CẬP NHẬT SỐ LƯỢNG ĐÃ RA
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onQuantityChange(-1)}
                            disabled={true}
                            className="w-10 h-10 rounded-xl border flex items-center justify-center hover:bg-[#10bc5d] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Minus size={18} />
                        </button>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={quantity || ""}
                            onChange={handleDetailServedChange}
                            disabled={isReadOnly}
                            className="flex-1 h-10 px-3 border rounded-xl text-center focus:ring-2 focus:ring-[#10bc5d] disabled:bg-gray-100"
                        />
                        <button
                            onClick={() => onQuantityChange(1)}
                            disabled={isReadOnly}
                            className="w-10 h-10 rounded-xl border flex items-center justify-center hover:bg-[#10bc5d] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                </div>
                <button
                    onClick={onSave}
                    disabled={isReadOnly}
                    className="w-full mt-6 bg-[#10bc5d] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#0c9c4a] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save size={18} /> <span>Lưu báo cáo hôm nay</span>
                </button>
            </div>
        );
    }

    return null;
};

export default DishDetailPanel;

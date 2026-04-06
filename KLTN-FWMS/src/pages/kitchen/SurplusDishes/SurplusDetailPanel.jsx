import React, { useState } from "react";
import {
    Edit2,
    ChevronLeft,
    ChevronRight,
    Minus,
    Plus,
    Save,
    X,
    Calendar,
} from "lucide-react";

const SurplusDetailPanel = ({
    isTable,
    isDetail,
    isModal,
    dishes = [],
    selectedDish,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    totalItems,
    onRowClick,
    onEditClick,
    onPageChange,
    formatPrice,
    dish,
    quantity,
    onQuantityChange,
    onSave,
    onClose,
    onAdd,
    existingDishes = [],
    selectedDate = new Date(),
}) => {
    // Modal thêm món dư
    if (isModal) {
        const [dishName, setDishName] = useState("");
        const [quantityWasted, setQuantityWasted] = useState(0);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState("");
        const [suggestions, setSuggestions] = useState([]);

        const formatDate = (date) => {
            return date.toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            });
        };

        const isDishExistsInToday = (name) => {
            return existingDishes.some(
                (dishItem) =>
                    dishItem.name?.toLowerCase() === name.toLowerCase(),
            );
        };

        const getExistingDishWaste = (name) => {
            const existing = existingDishes.find(
                (dishItem) =>
                    dishItem.name?.toLowerCase() === name.toLowerCase(),
            );
            return existing?.waste || 0;
        };

        const handleDishNameChange = (e) => {
            const value = e.target.value;
            setDishName(value);
            setError("");

            if (value.trim()) {
                const filtered = existingDishes.filter((dish) =>
                    dish.name.toLowerCase().includes(value.toLowerCase()),
                );
                setSuggestions(filtered.slice(0, 5));
            } else {
                setSuggestions([]);
            }
        };

        const selectDish = (selected) => {
            setDishName(selected.name);
            setSuggestions([]);
        };

        const handleSubmit = async () => {
            if (!dishName.trim()) {
                setError("Vui lòng nhập tên món ăn!");
                return;
            }

            if (quantityWasted <= 0) {
                setError("Vui lòng nhập số lượng dư hợp lệ!");
                return;
            }

            setError("");
            setLoading(true);

            try {
                if (onAdd) {
                    await onAdd({
                        dishName: dishName.trim(),
                        quantity_wasted: quantityWasted,
                    });
                }
                onClose();
            } catch (error) {
                console.error("Lỗi:", error);
                setError(error.message || "Có lỗi xảy ra khi thêm món dư");
                setTimeout(() => {
                    setError("");
                }, 5000);
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
                        {/* <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-xl font-bold">
                                Thêm báo cáo món dư
                            </h3>
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="hover:bg-gray-100 p-1 rounded"
                            >
                                <X size={24} />
                            </button>
                        </div> */}
                        <div className="mx-6 mt-2">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                                <div className="flex items-center gap-2 text-sm text-blue-800">
                                    <Calendar size={16} />
                                    <span>
                                        Ngày: {formatDate(selectedDate)}
                                    </span>
                                </div>
                            </div>

                            {dishName && isDishExistsInToday(dishName) && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-2">
                                    <div className="flex items-start gap-2">
                                        <span className="text-orange-600 text-lg">
                                            ⚠️
                                        </span>
                                        <div className="text-xs text-orange-800">
                                            <p className="font-semibold">
                                                Món này đã có trong ngày hôm
                                                nay!
                                            </p>
                                            <p>
                                                Số lượng dư sẽ được{" "}
                                                <span className="font-bold">
                                                    CỘNG DỒN
                                                </span>{" "}
                                                với số lượng hiện tại.
                                            </p>
                                            <p className="mt-1">
                                                Số lượng dư hiện tại:{" "}
                                                <span className="font-bold text-orange-700">
                                                    {getExistingDishWaste(
                                                        dishName,
                                                    )}{" "}
                                                    phần
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    TÊN MÓN ĂN *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={dishName}
                                        onChange={handleDishNameChange}
                                        disabled={loading}
                                        placeholder="VD: Phở bò, Cơm gà, ..."
                                        className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#10bc5d] focus:border-transparent disabled:bg-gray-100"
                                    />
                                    {suggestions.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                                            {suggestions.map((dish) => (
                                                <div
                                                    key={dish.id}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() =>
                                                        selectDish(dish)
                                                    }
                                                >
                                                    <div className="font-medium">
                                                        {dish.name}
                                                    </div>
                                                    <div className="text-xs text-red-600">
                                                        Đã dư: {dish.waste} phần
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    SỐ LƯỢNG DƯ *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={quantityWasted}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        setQuantityWasted(
                                            isNaN(value) ? 0 : value,
                                        );
                                        setError("");
                                    }}
                                    disabled={loading}
                                    placeholder="Nhập số lượng dư"
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
                            {/* <button
                                onClick={handleSubmit}
                                disabled={
                                    loading ||
                                    !dishName.trim() ||
                                    quantityWasted <= 0
                                }
                                className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    "Thêm báo cáo món dư"
                                )}
                            </button> */}
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
                            <th className="px-5 py-4 text-left">CHUẨN BỊ</th>
                            <th className="px-5 py-4 text-left">MÓN DƯ</th>
                            <th className="px-5 py-4 text-left">
                                CHI PHÍ HAO HỤT
                            </th>
                            <th className="px-5 py-4 text-center">HÀNH ĐỘNG</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dishes.map((dishItem) => (
                            <tr
                                key={dishItem.id}
                                className={`border-b cursor-pointer hover:bg-gray-50 ${
                                    selectedDish?.id === dishItem.id
                                        ? "bg-orange-50"
                                        : ""
                                }`}
                                onClick={() => onRowClick(dishItem)}
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
                                    {dishItem.prepared} phần
                                </td>
                                <td className="px-5 py-4">
                                    {dishItem.waste > 0 ? (
                                        <div>
                                            <span className="text-red-600 font-semibold">
                                                {dishItem.waste} phần
                                            </span>
                                            <span className="text-xs text-red-600 block">
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
                                    {formatPrice(dishItem.waste_cost || 0)}
                                </td>
                                <td className="px-5 py-4 text-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditClick(dishItem);
                                        }}
                                        className="text-[#10bc5d] hover:text-[#0c9c4a]"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
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
        const handleDetailWasteChange = (e) => {
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
            <div className="w-[420px] bg-white rounded-xl border p-6 shadow-md -mt-40 overflow-y-auto scrollbar-hide">
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>
                <h3 className="text-xl font-bold mb-2 border-l-4 border-[#10bc5d] pl-3">
                    CHI TIẾT MÓN DƯ
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
                                    <span className="text-orange-500">•</span>
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
                            CHUẨN BỊ
                        </p>
                        <p className="text-lg font-bold text-red-500">
                            {dish.prepared} phần
                        </p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-3">
                        <p className="text-xs font-semibold uppercase">
                            MÓN DƯ
                        </p>
                        <p className="text-lg font-bold text-orange-500">
                            {dish.waste} phần
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-red-50 rounded-xl p-3">
                        <p className="text-xs font-semibold uppercase">
                            CHI PHÍ HAO HỤT
                        </p>
                        <p className="text-lg font-bold text-red-500">
                            {formatPrice(dish.waste_cost || 0)}
                        </p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3">
                        <p className="text-xs font-semibold uppercase">
                            DOANH THU DỰ KIẾN
                        </p>
                        <p className="text-lg font-bold text-green-500">
                            {formatPrice(dish.revenue_cost || 0)}
                        </p>
                    </div>
                </div>
                <div className="pt-1">
                    <p className="text-sm font-semibold uppercase mb-2">
                        CẬP NHẬT SỐ LƯỢNG DƯ
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onQuantityChange(-1)}
                            className="w-10 h-10 rounded-xl border flex items-center justify-center hover:bg-[#10BC5D] hover:text-white"
                        >
                            <Minus size={18} />
                        </button>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={quantity === 0 ? 0 : quantity || ""}
                            onChange={handleDetailWasteChange}
                            className="flex-1 h-10 px-3 border rounded-xl text-center focus:ring-2 focus:ring-[#10BC5D]"
                        />
                        <button
                            onClick={() => onQuantityChange(1)}
                            className="w-10 h-10 rounded-xl border flex items-center justify-center hover:bg-[#10BC5D] hover:text-white"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                </div>
                <button
                    onClick={onSave}
                    className="w-full mt-3 bg-[#10bc5d] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#0c9c4a]"
                >
                    <Save size={18} /> <span>Lưu báo cáo món dư</span>
                </button>
            </div>
        );
    }
    return null;
};
export default SurplusDetailPanel;

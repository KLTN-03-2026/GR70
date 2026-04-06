import React, { useState, useEffect, useCallback } from "react";
import SurplusFilterTabs from "./SurplusFilterTabs";
import SurplusDetailPanel from "./SurplusDetailPanel";
import ServedDishes from "../ServedDishes/ServedDishes";
import { kitchenDishAPI } from "../../../services/kitchenApi";
import { jwtDecode } from "jwt-decode";
import {
    Calendar,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Edit2,
} from "lucide-react";
import { toast } from "sonner"; // THÊM IMPORT TOAST

const SurplusDishes = () => {
    // State cho thanh điều hướng chính
    const [mainTab, setMainTab] = useState("served");

    // State cho phần Món dư
    const [activeTab, setActiveTab] = useState("all");
    const [selectedDish, setSelectedDish] = useState(null);
    const [quantity, setQuantity] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dishes, setDishes] = useState([]);
    const [brandId, setBrandId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const itemsPerPage = 5;

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

    // Format ngày tháng
    const formatDate = (date) => {
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    const formatDateTime = (date) => {
        return date.toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
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
            console.log("API Response Surplus:", response);

            if (response.success && response.data) {
                const formattedDishes = response.data.map((item) => ({
                    id: item.id,
                    dailyDetailId: item.id,
                    name: item.dish?.name || "Unknown",
                    prepared: item.quantity_prepared || 0,
                    waste: item.quantity_wasted || 0,
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
                }));
                console.log("Formatted surplus dishes:", formattedDishes);
                setDishes(formattedDishes);
                setLastUpdated(new Date());
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

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN").format(price) + "₫";
    };

    const filteredDishes = dishes.filter((dish) => {
        if (activeTab === "active") return dish.status === "active";
        if (activeTab === "closed") return dish.status === "closed";
        return true;
    });

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

    // CẬP NHẬT MÓN DƯ - SỬ DỤNG TOAST THAY VÌ ALERT
    const handleSaveReport = async () => {
        if (selectedDish) {
            const toastId = toast.loading("Đang cập nhật số lượng dư...");
            try {
                const updateData = {
                    quantity_wasted: quantity,
                };

                const response = await kitchenDishAPI.updateDishesLeftover(
                    selectedDish.dailyDetailId,
                    updateData,
                );

                if (response.success) {
                    await fetchDishes();
                    setSelectedDish(null);
                    setLastUpdated(new Date());
                    toast.success(
                        `Đã cập nhật số lượng dư cho món ${selectedDish.name}: ${quantity} phần`,
                        { id: toastId, duration: 3000 },
                    );
                } else {
                    throw new Error(response.message || "Cập nhật thất bại");
                }
            } catch (error) {
                console.error("Error updating leftover:", error);
                toast.error(
                    error.response?.data?.message ||
                        "Có lỗi xảy ra khi cập nhật số lượng dư",
                    { id: toastId, duration: 4000 },
                );
            }
        }
    };

    // THÊM MỚI BÁO CÁO MÓN DƯ - SỬ DỤNG TOAST
    const handleAddNewReport = async (newReportData) => {
        const toastId = toast.loading("Đang thêm món dư...");
        try {
            const existingDailyDish = dishes.find(
                (d) =>
                    d.name.toLowerCase() ===
                    newReportData.dishName.toLowerCase(),
            );

            if (existingDailyDish) {
                const updatedWaste =
                    existingDailyDish.waste + newReportData.quantity_wasted;

                await kitchenDishAPI.updateDishesLeftover(
                    existingDailyDish.dailyDetailId,
                    {
                        quantity_wasted: updatedWaste,
                    },
                );
                await fetchDishes();
                toast.success(
                    `Đã cập nhật món dư ${existingDailyDish.name}: +${newReportData.quantity_wasted} phần`,
                    { id: toastId, duration: 3000 },
                );
                setShowAddForm(false);
                return;
            }
            toast.error(
                `Món "${newReportData.dishName}" không có trong danh sách món đã ra. Vui lòng chỉ thêm món từ danh sách đã có.`,
                { id: toastId, duration: 4000 },
            );
            setShowAddForm(false);
        } catch (error) {
            console.error("Lỗi:", error);
            toast.error(
                error.response?.data?.message ||
                    error.message ||
                    "Có lỗi xảy ra",
                { id: toastId, duration: 4000 },
            );
            throw error;
        }
    };

    const handleEditClick = (dish) => {
        setSelectedDish(dish);
        setQuantity(dish.waste);
    };

    const handleRowClick = (dish) => {
        setSelectedDish(dish);
        setQuantity(dish.waste);
    };

    if (loading && dishes.length === 0) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500">Đang tải dữ liệu...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <div className="flex flex-col justify-center items-center h-64">
                    <div className="text-bg-[#10BC5D] mb-4">{error}</div>
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-[45px] leading-[55px] font-bold text-[#141c21] mb-2">
                    {mainTab === "surplus"
                        ? "Cập nhật số lượng món dư"
                        : "Cập nhật số lượng món ra"}
                </h2>
                <p className="text-[16px] leading-[26px] text-[#8b8b8b]">
                    {mainTab === "surplus"
                        ? "Danh sách món dư trong ngày, cập nhật số lượng hao hụt"
                        : "Danh sách món đã ra trong ngày"}
                </p>
            </div>

            {/* Thanh điều hướng chính */}
            <div className="flex gap-6 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setMainTab("served")}
                    className={`pb-3 text-base font-semibold transition-colors ${
                        mainTab === "served"
                            ? "text-[#10bc5d] border-b-2 border-[#10bc5d]"
                            : "text-[#8b8b8b] hover:text-[#3d3d3d]"
                    }`}
                >
                    Món ra
                </button>
                <button
                    onClick={() => setMainTab("surplus")}
                    className={`pb-3 text-base font-semibold transition-colors ${
                        mainTab === "surplus"
                            ? "text-[#10bc5d] border-b-2 border-[#10bc5d]"
                            : "text-[#8b8b8b] hover:text-[#3d3d3d]"
                    }`}
                >
                    Món dư
                </button>
            </div>

            {/* Nội dung chính */}
            {mainTab === "surplus" ? (
                <>
                    {/* Header với ngày tháng và refresh */}
                    <div className="flex justify-between items-center bg-white rounded-xl p-4 shadow-sm mb-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Calendar
                                    className="text-[#10bc5d]"
                                    size={20}
                                />
                                <span className="font-semibold">Ngày:</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-medium px-4">
                                        {formatDate(selectedDate)}
                                    </span>
                                </div>
                            </div>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Hôm nay
                            </span>
                        </div>
                        <button
                            onClick={handleRefresh}
                            className="p-2 hover:bg-gray-100 rounded-full"
                            title="Làm mới dữ liệu"
                        >
                            <RefreshCw size={18} className="text-gray-600" />
                        </button>
                    </div>

                    <div className="flex gap-8 items-start">
                        <div className="flex-1">
                            <SurplusFilterTabs
                                activeTab={activeTab}
                                onTabChange={(tab) => {
                                    setActiveTab(tab);
                                    setCurrentPage(1);
                                }}
                                totalAll={dishes.length}
                                totalActive={
                                    dishes.filter((d) => d.status === "active")
                                        .length
                                }
                                totalClosed={
                                    dishes.filter((d) => d.status === "closed")
                                        .length
                                }
                                onAddNew={() => setShowAddForm(true)}
                            />

                            <SurplusDetailPanel
                                isTable={true}
                                dishes={currentDishes}
                                selectedDish={selectedDish}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                startIndex={startIndex}
                                endIndex={Math.min(
                                    startIndex + itemsPerPage,
                                    totalItems,
                                )}
                                totalItems={totalItems}
                                onRowClick={handleRowClick}
                                onEditClick={handleEditClick}
                                onPageChange={setCurrentPage}
                                formatPrice={formatPrice}
                            />
                        </div>
                        {selectedDish && (
                            <SurplusDetailPanel
                                isDetail={true}
                                dish={selectedDish}
                                quantity={quantity}
                                onQuantityChange={handleQuantityChange}
                                onSave={handleSaveReport}
                                onClose={() => setSelectedDish(null)}
                                formatPrice={formatPrice}
                            />
                        )}
                        {showAddForm && (
                            <SurplusDetailPanel
                                isModal={true}
                                onAdd={handleAddNewReport}
                                onClose={() => setShowAddForm(false)}
                                existingDishes={dishes}
                                selectedDate={selectedDate}
                            />
                        )}
                    </div>
                </>
            ) : (
                <ServedDishes
                    surplusData={dishes}
                    selectedDate={selectedDate}
                />
            )}
        </div>
    );
};
export default SurplusDishes;

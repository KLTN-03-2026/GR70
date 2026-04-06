// import React, { useState, useEffect } from "react";
// import {
//     Edit2,
//     ChevronLeft,
//     ChevronRight,
//     Minus,
//     Plus,
//     Save,
//     PlusCircle,
//     X,
// } from "lucide-react";
// import ServedDishes from "./ServedDishes/ServedDishes";
// import { kitchenDishAPI } from "../../services/kitchenApi";
// import { jwtDecode } from "jwt-decode";

// const SurplusDishes = () => {
//     // State cho thanh điều hướng chính
//     const [mainTab, setMainTab] = useState("served");

//     // State cho phần Món dư
//     const [activeTab, setActiveTab] = useState("all");
//     const [selectedDish, setSelectedDish] = useState(null);
//     const [quantity, setQuantity] = useState(0);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [dishes, setDishes] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [brandId, setBrandId] = useState(null);

//     const itemsPerPage = 5;

//     // Lấy brandID từ token
//     useEffect(() => {
//         const token = localStorage.getItem("token");
//         if (token) {
//             try {
//                 const decoded = jwtDecode(token);
//                 if (decoded.brandID) {
//                     setBrandId(decoded.brandID);
//                 }
//             } catch (error) {
//                 console.error("Error decoding token:", error);
//                 setError("Lỗi xác thực, vui lòng đăng nhập lại");
//             }
//         } else {
//             setError("Vui lòng đăng nhập để tiếp tục");
//         }
//     }, []);

//     // Fetch dishes khi có brandId
//     useEffect(() => {
//         if (brandId) {
//             fetchDishes();
//         }
//     }, [brandId]);

//     const fetchDishes = async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const response = await kitchenDishAPI.getDishesOutput(brandId);
//             console.log("API Response Surplus:", response);

//             if (response.success && response.data) {
//                 // Transform dữ liệu từ API
//                 const formattedDishes = response.data.map((item) => ({
//                     id: item.id,
//                     dailyDetailId: item.id,
//                     name: item.dish?.name || "Unknown",
//                     prepared: item.quantity_prepared || 0,
//                     waste: item.quantity_wasted || 0,
//                     price: item.dish?.price || 0,
//                     status: item.quantity_wasted > 0 ? "closed" : "active",
//                     category: item.dish?.category || "Món chính",
//                     ingredients: item.dish?.ingredients || [],
//                     wasteCost:
//                         (item.quantity_wasted || 0) * (item.dish?.price || 0),
//                     expectedRevenue:
//                         (item.quantity_prepared || 0) * (item.dish?.price || 0),
//                     image:
//                         item.dish?.image ||
//                         "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150",
//                     quantity_prepared: item.quantity_prepared,
//                     quantity_wasted: item.quantity_wasted,
//                     dishId: item.dish?.id,
//                 }));
//                 setDishes(formattedDishes);
//             } else {
//                 setError(response.message || "Không thể tải dữ liệu");
//             }
//         } catch (err) {
//             console.error("Error fetching dishes:", err);
//             setError(
//                 err.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu",
//             );
//         } finally {
//             setLoading(false);
//         }
//     };

//     const formatPrice = (price) => {
//         return new Intl.NumberFormat("vi-VN").format(price) + "₫";
//     };

//     // Lọc theo tab con (Tất cả, Đang hoạt động, Đã đóng)
//     const filteredDishes = dishes.filter((dish) => {
//         if (activeTab === "active") return dish.status === "active";
//         if (activeTab === "closed") return dish.status === "closed";
//         return true;
//     });

//     const totalItems = filteredDishes.length;
//     const totalPages = Math.ceil(totalItems / itemsPerPage);
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     const currentDishes = filteredDishes.slice(
//         startIndex,
//         startIndex + itemsPerPage,
//     );

//     const handleQuantityChange = (delta) => {
//         setQuantity((prev) => Math.max(0, prev + delta));
//     };

//     const handleSaveReport = async () => {
//         if (selectedDish) {
//             try {
//                 // Cập nhật số lượng dư qua API
//                 const updateData = {
//                     quantity_prepared: selectedDish.prepared,
//                     quantity_wasted: quantity,
//                 };

//                 await kitchenDishAPI.updateDishesLeftover(
//                     selectedDish.dailyDetailId,
//                     updateData,
//                 );

//                 // Cập nhật local state
//                 setDishes(
//                     dishes.map((dish) =>
//                         dish.id === selectedDish.id
//                             ? {
//                                   ...dish,
//                                   waste: quantity,
//                                   wasteCost: quantity * dish.price,
//                                   status: quantity > 0 ? "closed" : "active",
//                               }
//                             : dish,
//                     ),
//                 );
//                 setSelectedDish({
//                     ...selectedDish,
//                     waste: quantity,
//                     wasteCost: quantity * selectedDish.price,
//                 });
//                 alert(
//                     `Đã cập nhật số lượng dư cho món ${selectedDish.name}: ${quantity} phần`,
//                 );
//             } catch (error) {
//                 console.error("Error updating leftover:", error);
//                 alert(
//                     error.response?.data?.message ||
//                         "Có lỗi xảy ra khi cập nhật số lượng dư",
//                 );
//             }
//         }
//     };

//     const handleAddNewReport = async () => {
//         // Tạo món dư mới
//         const dishName = prompt("Nhập tên món ăn:");
//         if (!dishName) return;

//         const wasteQuantity = parseInt(prompt("Nhập số lượng dư:"));
//         if (isNaN(wasteQuantity) || wasteQuantity <= 0) {
//             alert("Số lượng dư không hợp lệ");
//             return;
//         }

//         try {
//             // TODO: Cần có API lấy dishId từ tên món
//             // Tạm thời tìm dishId từ danh sách hiện có
//             const existingDish = dishes.find((d) => d.name === dishName);

//             if (!existingDish) {
//                 alert("Không tìm thấy món ăn này trong danh sách");
//                 return;
//             }

//             const requestData = {
//                 dishes: [
//                     {
//                         dishId: existingDish.dishId,
//                         quantity_wasted: wasteQuantity,
//                     },
//                 ],
//             };

//             const response = await kitchenDishAPI.createDishesLeftover(
//                 brandId,
//                 requestData,
//             );

//             if (response.success) {
//                 alert("Đã thêm báo cáo món dư thành công!");
//                 fetchDishes(); // Refresh danh sách
//             } else {
//                 alert(response.message || "Không thể thêm báo cáo");
//             }
//         } catch (error) {
//             console.error("Error adding leftover report:", error);
//             alert(
//                 error.response?.data?.message ||
//                     "Có lỗi xảy ra khi thêm báo cáo",
//             );
//         }
//     };

//     const handleEditClick = (dish, e) => {
//         if (e) e.stopPropagation();
//         setSelectedDish(dish);
//         setQuantity(dish.waste);
//     };

//     const handleRowClick = (dish) => {
//         setSelectedDish(dish);
//         setQuantity(dish.waste);
//     };

//     const handleCloseDetail = () => {
//         setSelectedDish(null);
//     };

//     // Component nội dung Món dư
//     const SurplusContent = () => (
//         <>
//             {/* Tabs con (Tất cả, Đang hoạt động, Đã đóng) */}
//             <div className="flex gap-3 mb-5 border-b border-gray-200">
//                 <button
//                     onClick={() => {
//                         setActiveTab("all");
//                         setCurrentPage(1);
//                     }}
//                     className={`px-5 py-2.5 text-sm font-medium transition-all ${
//                         activeTab === "all"
//                             ? "text-[#10bc5d] border-b-2 border-[#10bc5d]"
//                             : "text-[#8b8b8b] hover:text-[#3d3d3d]"
//                     }`}
//                 >
//                     Tất cả ({dishes.length})
//                 </button>
//                 <button
//                     onClick={() => {
//                         setActiveTab("active");
//                         setCurrentPage(1);
//                     }}
//                     className={`px-5 py-2.5 text-sm font-medium transition-all ${
//                         activeTab === "active"
//                             ? "text-[#10bc5d] border-b-2 border-[#10bc5d]"
//                             : "text-[#8b8b8b] hover:text-[#3d3d3d]"
//                     }`}
//                 >
//                     Đang hoạt động (
//                     {dishes.filter((d) => d.status === "active").length})
//                 </button>
//                 <button
//                     onClick={() => {
//                         setActiveTab("closed");
//                         setCurrentPage(1);
//                     }}
//                     className={`px-5 py-2.5 text-sm font-medium transition-all ${
//                         activeTab === "closed"
//                             ? "text-[#10bc5d] border-b-2 border-[#10bc5d]"
//                             : "text-[#8b8b8b] hover:text-[#3d3d3d]"
//                     }`}
//                 >
//                     Đã đóng (
//                     {dishes.filter((d) => d.status === "closed").length})
//                 </button>
//             </div>

//             {/* Loading state */}
//             {loading && (
//                 <div className="flex justify-center items-center h-64">
//                     <div className="text-gray-500">Đang tải dữ liệu...</div>
//                 </div>
//             )}

//             {/* Error state */}
//             {error && !loading && (
//                 <div className="flex flex-col justify-center items-center h-64">
//                     <div className="text-red-500 mb-4">{error}</div>
//                     <button
//                         onClick={fetchDishes}
//                         className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//                     >
//                         Thử lại
//                     </button>
//                 </div>
//             )}

//             {/* Bảng món dư */}
//             {!loading && !error && (
//                 <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
//                     <table className="w-full">
//                         <thead className="bg-gray-50 border-b border-gray-200">
//                             <tr className="text-[#8b8b8b] text-xs uppercase">
//                                 <th className="px-5 py-4 text-left font-semibold">
//                                     TÊN MÓN
//                                 </th>
//                                 <th className="px-5 py-4 text-left font-semibold">
//                                     CHUẨN BỊ
//                                 </th>
//                                 <th className="px-5 py-4 text-left font-semibold">
//                                     HAO HỤT
//                                 </th>
//                                 <th className="px-5 py-4 text-left font-semibold">
//                                     GIÁ
//                                 </th>
//                                 <th className="px-5 py-4 text-center font-semibold">
//                                     HÀNH ĐỘNG
//                                 </th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {currentDishes.map((dish) => (
//                                 <tr
//                                     key={dish.id}
//                                     className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
//                                         selectedDish?.id === dish.id
//                                             ? "bg-green-50"
//                                             : ""
//                                     }`}
//                                     onClick={() => handleRowClick(dish)}
//                                 >
//                                     <td className="px-5 py-4">
//                                         <div>
//                                             <div className="font-semibold text-[#141c21] text-base">
//                                                 {dish.name}
//                                             </div>
//                                             <div className="text-xs text-[#8b8b8b] mt-0.5">
//                                                 {dish.category}
//                                             </div>
//                                         </div>
//                                     </td>
//                                     <td className="px-5 py-4 text-sm text-[#3d3d3d]">
//                                         {dish.prepared} phần
//                                     </td>
//                                     <td className="px-5 py-4 text-sm text-red-500 font-medium">
//                                         {dish.waste} phần
//                                     </td>
//                                     <td className="px-5 py-4 text-sm text-[#3d3d3d]">
//                                         {formatPrice(dish.price)}
//                                     </td>
//                                     <td className="px-5 py-4 text-center">
//                                         <button
//                                             onClick={(e) =>
//                                                 handleEditClick(dish, e)
//                                             }
//                                             className="text-[#10bc5d] hover:text-[#0c9c4a]"
//                                         >
//                                             <Edit2 size={18} />
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>

//                     {/* Pagination */}
//                     {totalPages > 1 && (
//                         <div className="px-5 py-4 border-t border-gray-200 flex justify-between items-center bg-white">
//                             <p className="text-sm text-[#8b8b8b]">
//                                 Hiển thị {startIndex + 1}-
//                                 {Math.min(
//                                     startIndex + itemsPerPage,
//                                     totalItems,
//                                 )}{" "}
//                                 trên {totalItems} món ăn
//                             </p>
//                             <div className="flex gap-2">
//                                 <button
//                                     onClick={() =>
//                                         setCurrentPage((prev) =>
//                                             Math.max(1, prev - 1),
//                                         )
//                                     }
//                                     disabled={currentPage === 1}
//                                     className="p-1.5 text-[#8b8b8b] hover:text-[#3d3d3d] disabled:opacity-50"
//                                 >
//                                     <ChevronLeft size={18} />
//                                 </button>
//                                 {[...Array(totalPages)].map((_, i) => (
//                                     <button
//                                         key={i}
//                                         onClick={() => setCurrentPage(i + 1)}
//                                         className={`px-3 py-1 text-sm rounded ${
//                                             currentPage === i + 1
//                                                 ? "text-white bg-[#10bc5d]"
//                                                 : "text-[#3d3d3d] hover:bg-gray-100"
//                                         }`}
//                                     >
//                                         {i + 1}
//                                     </button>
//                                 ))}
//                                 <button
//                                     onClick={() =>
//                                         setCurrentPage((prev) =>
//                                             Math.min(totalPages, prev + 1),
//                                         )
//                                     }
//                                     disabled={currentPage === totalPages}
//                                     className="p-1.5 text-[#8b8b8b] hover:text-[#3d3d3d] disabled:opacity-50"
//                                 >
//                                     <ChevronRight size={18} />
//                                 </button>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             )}

//             {/* Nút Thêm báo cáo mới */}
//             <div className="mt-5">
//                 <button
//                     onClick={handleAddNewReport}
//                     className="flex items-center gap-2 px-5 py-2.5 bg-[#10bc5d] text-white rounded-lg hover:bg-[#0c9c4a] text-sm font-medium"
//                 >
//                     <PlusCircle size={18} />
//                     <span>Thêm báo cáo món dư</span>
//                 </button>
//             </div>
//         </>
//     );

//     return (
//         <div className="p-8 bg-gray-50 min-h-screen">
//             {/* Header */}
//             <div className="mb-8">
//                 <h2 className="text-[45px] leading-[55px] font-bold text-[#141c21] mb-2">
//                     {mainTab === "surplus"
//                         ? "Cập nhật số lượng món dư"
//                         : "Cập nhật số lượng món ra"}
//                 </h2>
//                 <p className="text-[16px] leading-[26px] text-[#8b8b8b]">
//                     {mainTab === "surplus"
//                         ? "Danh sách chi tiết hàng ngày kết nối từ bảng thực đơn (dishes) và báo cáo (daily_detail)"
//                         : "Danh sách món đã ra trong ngày, kết nối từ bảng thực đơn và báo cáo"}
//                 </p>
//             </div>

//             {/* Thanh điều hướng chính */}
//             <div className="flex gap-6 mb-6 border-b border-gray-200">
//                 <button
//                     onClick={() => setMainTab("served")}
//                     className={`pb-3 text-base font-semibold transition-colors ${
//                         mainTab === "served"
//                             ? "text-[#10bc5d] border-b-2 border-[#10bc5d]"
//                             : "text-[#8b8b8b] hover:text-[#3d3d3d]"
//                     }`}
//                 >
//                     Món ra
//                 </button>
//                 <button
//                     onClick={() => setMainTab("surplus")}
//                     className={`pb-3 text-base font-semibold transition-colors ${
//                         mainTab === "surplus"
//                             ? "text-[#10bc5d] border-b-2 border-[#10bc5d]"
//                             : "text-[#8b8b8b] hover:text-[#3d3d3d]"
//                     }`}
//                 >
//                     Món dư
//                 </button>
//             </div>

//             {/* Nội dung chính */}
//             {mainTab === "surplus" ? (
//                 <div className="flex gap-8 items-start">
//                     <div className="flex-1">
//                         <SurplusContent />
//                     </div>
//                     {selectedDish && (
//                         <div className="w-[420px] bg-white rounded-xl border border-gray-200 p-6 shadow-md -mt-20 sticky top-5">
//                             {/* Nút đóng */}
//                             <div className="flex justify-end mb-2">
//                                 <button
//                                     onClick={handleCloseDetail}
//                                     className="text-gray-400 hover:text-gray-600 transition-colors"
//                                 >
//                                     <X size={20} />
//                                 </button>
//                             </div>

//                             <h3 className="text-xl font-bold text-[#141c21] mb-5 border-l-4 border-[#10bc5d] pl-3">
//                                 CHI TIẾT MÓN ĂN
//                             </h3>

//                             {/* Ảnh món ăn */}
//                             <div className="flex justify-center mb-3">
//                                 <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#10bc5d]/20 shadow-md">
//                                     <img
//                                         src={selectedDish.image}
//                                         alt={selectedDish.name}
//                                         className="w-full h-full object-cover"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Tên món và giá */}
//                             <div className="text-center mb-3">
//                                 <h4 className="text-xl font-bold text-[#141c21]">
//                                     {selectedDish.name}
//                                 </h4>
//                                 <p className="text-sm font-semibold text-[#10bc5d] mt-1">
//                                     {formatPrice(selectedDish.price)}
//                                 </p>
//                             </div>

//                             {/* DANH MỤC */}
//                             <div className="mb-4">
//                                 <p className="text-sm font-semibold text-[#3d3d3d] uppercase">
//                                     DANH MỤC
//                                 </p>
//                                 <p className="text-base text-[#8b8b8b] mt-1">
//                                     {selectedDish.category}
//                                 </p>
//                             </div>

//                             {/* NGUYÊN LIỆU TIÊU CHUẨN */}
//                             {selectedDish.ingredients &&
//                                 selectedDish.ingredients.length > 0 && (
//                                     <div className="mb-5">
//                                         <p className="text-sm font-semibold text-[#3d3d3d] uppercase mb-3">
//                                             NGUYÊN LIỆU TIÊU CHUẨN
//                                         </p>
//                                         <div className="grid grid-cols-2 gap-x-4 gap-y-2">
//                                             {selectedDish.ingredients.map(
//                                                 (item, idx) => (
//                                                     <div
//                                                         key={idx}
//                                                         className="flex items-start gap-2"
//                                                     >
//                                                         <span className="text-[#10bc5d] text-sm">
//                                                             •
//                                                         </span>
//                                                         <span className="text-sm text-[#8b8b8b]">
//                                                             {item}
//                                                         </span>
//                                                     </div>
//                                                 ),
//                                             )}
//                                         </div>
//                                     </div>
//                                 )}

//                             {/* CHI PHÍ HAO HỤT và DOANH THU DỰ KIẾN */}
//                             <div className="grid grid-cols-2 gap-4 mb-5">
//                                 <div className="bg-red-50 rounded-xl p-3">
//                                     <p className="text-xs font-semibold text-[#3d3d3d] mb-1 uppercase">
//                                         CHI PHÍ HAO HỤT
//                                     </p>
//                                     <p className="text-lg font-bold text-red-500">
//                                         {formatPrice(selectedDish.wasteCost)}
//                                     </p>
//                                 </div>
//                                 <div className="bg-green-50 rounded-xl p-3">
//                                     <p className="text-xs font-semibold text-[#3d3d3d] mb-1 uppercase">
//                                         DOANH THU DỰ KIẾN
//                                     </p>
//                                     <p className="text-lg font-bold text-green-500">
//                                         {formatPrice(
//                                             selectedDish.expectedRevenue,
//                                         )}
//                                     </p>
//                                 </div>
//                             </div>

//                             {/* CẬP NHẬT LƯỢNG HAO HỤT */}
//                             <div className="pt-2">
//                                 <p className="text-sm font-semibold text-[#3d3d3d] mb-2 uppercase">
//                                     CẬP NHẬT LƯỢNG HAO HỤT
//                                 </p>
//                                 <div className="flex items-center gap-3">
//                                     <button
//                                         onClick={() => handleQuantityChange(-1)}
//                                         className="w-10 h-10 rounded-xl border border-gray-300 flex items-center justify-center text-[#10bc5d] hover:bg-[#10bc5d] hover:text-white transition-all"
//                                     >
//                                         <Minus size={18} />
//                                     </button>
//                                     <input
//                                         type="number"
//                                         value={quantity}
//                                         onChange={(e) =>
//                                             setQuantity(
//                                                 Math.max(
//                                                     0,
//                                                     Number(e.target.value),
//                                                 ),
//                                             )
//                                         }
//                                         className="flex-1 h-10 px-3 border border-gray-300 rounded-xl text-center text-base focus:outline-none focus:ring-2 focus:ring-[#10bc5d]"
//                                     />
//                                     <button
//                                         onClick={() => handleQuantityChange(1)}
//                                         className="w-10 h-10 rounded-xl border border-gray-300 flex items-center justify-center text-[#10bc5d] hover:bg-[#10bc5d] hover:text-white transition-all"
//                                     >
//                                         <Plus size={18} />
//                                     </button>
//                                 </div>
//                             </div>

//                             {/* Nút lưu báo cáo */}
//                             <button
//                                 onClick={handleSaveReport}
//                                 className="w-full mt-6 bg-[#10bc5d] text-white py-3 rounded-xl font-semibold text-base hover:bg-[#0c9c4a] transition-all flex items-center justify-center gap-2"
//                             >
//                                 <Save size={18} />
//                                 <span>Lưu báo cáo hôm nay</span>
//                             </button>
//                         </div>
//                     )}
//                 </div>
//             ) : (
//                 <ServedDishes />
//             )}
//         </div>
//     );
// };

// export default SurplusDishes;

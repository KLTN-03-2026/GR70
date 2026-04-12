export default function ViewFood({ food, onClose }) {
    if (!food) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
            <div
                className="bg-white rounded-3xl w-[500px] max-h-[95vh] overflow-hidden shadow-2xl border-none flex flex-col"
                style={{ fontFamily: "'Nunito', sans-serif" }}
            >
                {/* HEADER XANH */}
                <div
                    className="flex justify-between items-center px-6 py-5"
                    style={{ background: "linear-gradient(135deg, var(--color-primary), #0da04f)" }}
                >
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-white/80">info</span>
                        <h3 className="font-bold text-xl text-white">Thông tin món ăn</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-red-500 hover:text-white rounded-xl text-white transition-all duration-200 backdrop-blur-md border border-white/10"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                    </button>
                </div>

                {/* NỘI DUNG CUỘN */}
                <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">

                    {/* Tên món & Giá - Điểm nhấn chính */}
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <h1 className="text-2xl font-black text-gray-800 leading-tight">{food.name}</h1>
                            <p className="text-gray-500 font-medium">{food.category?.name || "Chưa phân loại"}</p>
                        </div>
                        <div className="bg-green-50 px-4 py-2 rounded-2xl border border-green-100 text-right">
                            <p className="text-green-600 text-[10px] font-bold uppercase tracking-widest">Giá bán</p>
                            <p className="text-green-700 font-black text-xl">
                                {Number(food.price).toLocaleString("vi-VN")} <span className="text-sm">₫</span>
                            </p>
                        </div>
                    </div>

                    <div className="h-[1px] bg-gray-100 w-full"></div>

                    {/* Grid thông tin phụ */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50 flex items-center gap-3">
                            <span className="material-symbols-outlined text-blue-500">person</span>
                            <div>
                                <p className="text-[10px] text-blue-400 font-bold uppercase">Người tạo</p>
                                <p className="text-blue-700 font-bold text-sm">{food.user?.fullName || "Quản trị viên"}</p>
                            </div>
                        </div>
                        <div className="bg-orange-50/50 p-3 rounded-2xl border border-orange-100/50 flex items-center gap-3">
                            <span className="material-symbols-outlined text-orange-500">analytics</span>
                            <div>
                                <p className="text-[10px] text-orange-400 font-bold uppercase">Đã bán</p>
                                <p className="text-orange-700 font-bold text-sm">{food.totalSold ?? 0} phần</p>
                            </div>
                        </div>
                    </div>

                    {/* Nguyên liệu */}
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-gray-800 font-bold">
                            <span className="material-symbols-outlined text-green-600" style={{ fontSize: 20 }}>rebase_edit</span>
                            <span>Công thức định lượng</span>
                        </div>

                        {food.ingredients?.length > 0 ? (
                            <div className="grid gap-2">
                                {food.ingredients.map((ing, idx) => (
                                    <div
                                        key={idx}
                                        className="flex justify-between items-center bg-gray-50/80 rounded-xl px-4 py-3 border border-gray-100 hover:bg-white hover:shadow-sm transition"
                                    >
                                        <span className="font-semibold text-gray-700">{ing.name}</span>
                                        <span className="text-sm font-bold text-gray-500 bg-white px-3 py-1 rounded-lg border">
                                            {ing.quantity} {ing.unit}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 italic text-sm">
                                Món ăn này chưa thiết lập nguyên liệu
                            </div>
                        )}
                    </div>

                    {/* Mô tả */}
                    {food.des && (
                        <div className="bg-amber-50/30 p-4 rounded-2xl border border-amber-100/50">
                            <p className="text-amber-700 font-bold text-xs uppercase mb-2">Mô tả món ăn</p>
                            <p className="text-gray-600 text-sm italic leading-relaxed">"{food.des}"</p>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-10 py-3 text-white font-bold rounded-xl shadow-lg hover:shadow-green-200 active:scale-95 transition-all"
                        style={{ background: "linear-gradient(135deg, var(--color-primary), #0da04f)" }}
                    >
                        Đóng cửa sổ
                    </button>
                </div>
            </div>
        </div>
    );
}
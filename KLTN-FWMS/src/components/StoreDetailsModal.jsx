import { useState, useEffect } from "react";
import { getBrandDetail, lockBrand, unlockBrand, mapBrand } from "../services/adminService";

export const StoreDetailsModal = ({ isOpen, onClose, store, onStatusChange }) => {
    const [detail, setDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [loadingLock, setLoadingLock] = useState(false);
    const [lockMsg, setLockMsg] = useState("");

    useEffect(() => {
        if (!isOpen || !store?.id) return;
        setDetail(null);
        setLockMsg("");
        setLoadingDetail(true);
        getBrandDetail(store.id)
            .then((res) => {
                if (res?.data) setDetail(mapBrand(res.data));
            })
            .catch(() => setDetail(store)) // fallback về data list nếu lỗi
            .finally(() => setLoadingDetail(false));
    }, [isOpen, store?.id]);

    if (!isOpen || !store) return null;

    const displayed = detail ?? store;

    const colors = {
        primary: "#10BC5D",
        text1: "#141C21",
        text2: "#3D3D3D",
        text3: "#8B8B8B",
        text4: "#D1D1D1",
    };

    const getStatusLabel = (status) => {
        if (status === "active") return "Hoạt động";
        if (status === "locked") return "Đã khóa";
        return "Cảnh báo";
    };

    const getStatusBadgeStyles = (status) => {
        if (status === "active") return { backgroundColor: "#10BC5D15", color: colors.primary };
        if (status === "locked") return { backgroundColor: "#141C2110", color: colors.text2 };
        return { backgroundColor: "#FF980015", color: "#FF9800" };
    };

    const handleToggleLock = async () => {
        setLoadingLock(true);
        setLockMsg("");
        try {
            let res;
            if (displayed.status === "locked") {
                res = await unlockBrand(displayed.id);
            } else {
                res = await lockBrand(displayed.id);
            }
            const newStatus = displayed.status === "locked" ? "active" : "locked";
            setDetail((prev) => ({ ...(prev ?? store), status: newStatus }));
            onStatusChange?.(displayed.id, newStatus);
            setLockMsg(res?.message ?? "Thành công");
        } catch (e) {
            setLockMsg(e?.response?.data?.message ?? "Đã xảy ra lỗi");
        } finally {
            setLoadingLock(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
            <div
                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border"
                style={{ borderColor: colors.text4 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b" style={{ borderColor: colors.text4 + "50" }}>
                    <div>
                        <h2 className="text-2xl font-bold" style={{ color: colors.text1 }}>{displayed.name}</h2>
                        <p className="text-sm font-medium" style={{ color: colors.text3 }}>ID: {displayed.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-gray-100 transition-colors"
                        style={{ color: colors.text2 }}
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>

                <div className="p-8 space-y-10">
                    {/* Loading skeleton */}
                    {loadingDetail ? (
                        <div className="space-y-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-4 rounded-lg animate-pulse bg-gray-100" style={{ width: i % 2 === 0 ? "60%" : "40%" }} />
                            ))}
                        </div>
                    ) : (
                        <>
                            {/* Thông báo lock/unlock */}
                            {lockMsg && (
                                <div className="text-sm px-4 py-2.5 rounded-xl"
                                    style={{
                                        background: lockMsg.includes("lỗi") || lockMsg.includes("không")
                                            ? "#FF000015" : "#10BC5D15",
                                        color: lockMsg.includes("lỗi") || lockMsg.includes("không")
                                            ? "#dc2626" : colors.primary
                                    }}>
                                    {lockMsg}
                                </div>
                            )}

                            {/* Thông tin chủ sở hữu */}
                            <div>
                                <h4 className="uppercase text-xs font-bold tracking-[0.15em] mb-5" style={{ color: colors.text3 }}>
                                    Thông tin chủ sở hữu
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                    {[
                                        { label: "Tên", value: displayed.owner },
                                        { label: "Email", value: displayed.ownerEmail },
                                        { label: "Số điện thoại", value: displayed.ownerPhone },
                                        { label: "Địa chỉ", value: displayed.ownerAddress },
                                    ].map((item, idx) => (
                                        <div key={idx}>
                                            <p className="text-[11px] uppercase mb-1 font-bold" style={{ color: colors.text3 }}>{item.label}</p>
                                            <p className="font-semibold" style={{ color: colors.text2 }}>{item.value}</p>
                                        </div>
                                    ))}
                                    <div>
                                        <p className="text-[11px] uppercase mb-1 font-bold" style={{ color: colors.text3 }}>Trạng thái</p>
                                        <span
                                            className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase"
                                            style={getStatusBadgeStyles(displayed.status)}
                                        >
                                            {getStatusLabel(displayed.status)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[11px] uppercase mb-1 font-bold" style={{ color: colors.text3 }}>Ngày tạo</p>
                                        <p className="font-semibold" style={{ color: colors.text2 }}>{displayed.createdAt}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin cửa hàng */}
                            <div className="pt-2">
                                <h4 className="uppercase text-xs font-bold tracking-[0.15em] mb-5" style={{ color: colors.text3 }}>
                                    Thông tin cửa hàng
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                    <div>
                                        <p className="text-[11px] uppercase mb-1 font-bold" style={{ color: colors.text3 }}>Tỉnh/Thành phố</p>
                                        <p className="font-semibold" style={{ color: colors.text2 }}>{displayed.province}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] uppercase mb-1 font-bold" style={{ color: colors.text3 }}>Loại hình</p>
                                        <p className="font-semibold capitalize" style={{ color: colors.text2 }}>{displayed.role}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] uppercase mb-1 font-bold" style={{ color: colors.text3 }}>Tổng số món ăn</p>
                                        <p className="font-semibold" style={{ color: colors.text2 }}>{displayed.totalDishes} món</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] uppercase mb-1 font-bold" style={{ color: colors.text3 }}>Doanh thu năm</p>
                                        <p className="font-bold text-2xl" style={{ color: colors.primary }}>{displayed.annualRevenue}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t flex justify-between items-center bg-gray-50/50" style={{ borderColor: colors.text4 + "50" }}>
                    {/* Nút lock/unlock */}
                    <button
                        onClick={handleToggleLock}
                        disabled={loadingLock || loadingDetail}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                        style={displayed.status === "locked"
                            ? { background: "#10BC5D15", color: colors.primary }
                            : { background: "#141C2110", color: colors.text2 }
                        }
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                            {displayed.status === "locked" ? "lock_open" : "lock"}
                        </span>
                        {loadingLock
                            ? "Đang xử lý..."
                            : displayed.status === "locked" ? "Mở khóa" : "Khóa cửa hàng"
                        }
                    </button>

                    <button
                        onClick={onClose}
                        className="px-10 py-3 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg"
                        style={{ backgroundColor: colors.primary, boxShadow: "0 4px 14px #10BC5D40" }}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

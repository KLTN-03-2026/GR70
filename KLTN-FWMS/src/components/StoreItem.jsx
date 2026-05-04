import { useState } from "react";
import { lockBrand, unlockBrand } from "../services/adminService";

export const StoreItem = ({ store, onViewDetails, onStatusChange }) => {
    const [loadingLock, setLoadingLock] = useState(false);

    const statusConfig = {
        active: {
            label: "Hoạt động",
            badgeClass: "bg-primary/10 text-primary",
            iconClass: "bg-primary-container/10 text-primary",
            lockIcon: "lock", lockTitle: "Khóa cửa hàng",
            lockClass: "bg-surface-container-highest text-on-surface-variant hover:text-error transition-colors",
        },
        warning: {
            label: "Cảnh báo",
            badgeClass: "bg-tertiary-container/20 text-tertiary",
            iconClass: "bg-tertiary-container/10 text-tertiary",
            lockIcon: "lock", lockTitle: "Khóa cửa hàng",
            lockClass: "bg-surface-container-highest text-on-surface-variant hover:text-error transition-colors",
        },
        locked: {
            label: "Đã khóa",
            badgeClass: "bg-on-surface/10 text-on-surface",
            iconClass: "bg-on-surface/5 text-on-surface",
            lockIcon: "lock_open", lockTitle: "Mở khóa cửa hàng",
            lockClass: "bg-primary-container text-on-primary-container hover:opacity-90 transition-colors",
            itemClass: "opacity-75",
        },
    };

    const config = statusConfig[store.status] || statusConfig.active;

    const [lockError, setLockError] = useState("");

    const handleToggleLock = async () => {
        setLoadingLock(true);
        try {
            let res;

            if (store.status === "locked") {
                res = await unlockBrand(store.id);
            } else {
                res = await lockBrand(store.id);
            }
            if (!res?.success) {
                setLockError(res?.message);
                return;
            }

            // setLockError("");
            const newStatus = store.status === "locked" ? "active" : "locked";
            onStatusChange?.(store.id, newStatus);
        } catch (e) {
            console.error("Lỗi thay đổi trạng thái:", e?.response?.data || e);
        } finally {
            setLoadingLock(false);
        }
    };



    return (
        <div className={`group grid grid-cols-1 md:grid-cols-12 items-center p-6 bg-surface-container-low rounded-xl hover:bg-surface-container-highest transition-all ${config.itemClass ?? ""}`}>
            <div className="md:col-span-3 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${config.iconClass}`}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>store</span>
                </div>
                <div>
                    <h6 className="text-[18px] font-bold leading-tight">{store.name}</h6>
                    <p className="text-xs text-on-surface-variant font-medium">ID: {store.id}</p>
                </div>
            </div>
            <div className="md:col-span-2">
                <p className="text-sm text-on-surface-variant uppercase">Tỉnh/TP</p>
                <p className="font-bold text-on-surface">{store.province}</p>
            </div>
            <div className="md:col-span-2">
                <p className="text-sm text-on-surface-variant uppercase">Chủ sở hữu</p>
                <p className="font-bold text-on-surface">{store.owner}</p>
            </div>
            <div className="md:col-span-2">
                <p className="text-sm text-on-surface-variant uppercase">Loại hình</p>
                <p className="font-bold text-on-surface capitalize">{store.role}</p>
            </div>
            <div className="md:col-span-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.badgeClass}`}>
                    {config.label}
                </span>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
                <button onClick={() => onViewDetails(store)}
                    className="bg-surface-container-highest p-2 rounded-xl text-on-surface-variant hover:text-primary transition-colors" title="Xem chi tiết">
                    <span className="material-symbols-outlined">visibility</span>
                </button>
                <button onClick={handleToggleLock} disabled={loadingLock}
                    className={`p-2 rounded-xl ${config.lockClass} disabled:opacity-50`} title={config.lockTitle}>
                    {loadingLock
                        ? <span className="material-symbols-outlined" style={{ fontSize: 20 }}>progress_activity</span>
                        : <span className="material-symbols-outlined">{config.lockIcon}</span>}
                </button>
                {lockError && (
                    <p className="text-xs text-red-500 mt-1 text-right">{lockError}</p>
                )}
            </div>
        </div>
    );
};
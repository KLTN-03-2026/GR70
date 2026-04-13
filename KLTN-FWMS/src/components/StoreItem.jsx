import {
  Eye,
  BarChart,
  LockOpen,
  Lock,
  Store as StoreIcon,
} from "lucide-react";

export const StoreItem = ({ store, onViewDetails }) => {
  const statusConfig = {
    active: {
      label: "Hoạt động",
      badgeClass: "bg-primary/10 text-primary",
      iconClass: "bg-primary-container/10 text-primary",
      revenueClass: "bg-primary text-on-primary",
      lockIcon: "lock_open",
      lockClass: "bg-surface-container-highest text-on-surface-variant hover:text-primary",
      itemClass: "",
    },
    warning: {
      label: "Cảnh báo",
      badgeClass: "bg-tertiary-container/20 text-tertiary",
      iconClass: "bg-tertiary-container/10 text-tertiary",
      revenueClass: "bg-surface-container-high text-on-surface",
      lockIcon: "lock_open",
      lockClass: "bg-surface-container-highest text-on-surface-variant hover:text-on-surface",
      itemClass: "",
    },
    locked: {
      label: "Đã khóa",
      badgeClass: "bg-on-surface/10 text-on-surface",
      iconClass: "bg-on-surface/5 text-on-surface",
      revenueClass: "bg-surface-container-high text-on-surface opacity-50 cursor-not-allowed",
      lockIcon: "lock",
      lockClass: "bg-primary-container text-on-primary-container hover:opacity-90",
      itemClass: "opacity-75 grayscale hover:grayscale-0",
    },
  };

  const config = statusConfig[store.status] || statusConfig.active;

  return (
    <div
      className={`group grid grid-cols-1 md:grid-cols-12 items-center p-6 bg-surface-container-low rounded-xl hover:bg-surface-container-highest transition-all ${config.itemClass}`}
    >
      {/* Cột 1: Icon + Tên + ID */}
      <div className="md:col-span-3 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${config.iconClass}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>
            store
          </span>
        </div>
        <div>
          <h6 className="text-[18px] font-bold leading-tight">{store.name}</h6>
          <p className="text-xs text-on-surface-variant font-medium">ID: {store.id}</p>
        </div>
      </div>

      {/* Vị trí */}
      <div className="md:col-span-2">
        <p className="text-sm text-on-surface-variant uppercase">Vị trí</p>
        <p className="font-bold text-on-surface">{store.location}</p>
      </div>

      {/* Chủ sở hữu */}
      <div className="md:col-span-2">
        <p className="text-sm text-on-surface-variant uppercase">Chủ sở hữu</p>
        <p className="font-bold text-on-surface">{store.owner}</p>
      </div>

      {/* Danh sách tài khoản */}
      <div className="md:col-span-2">
        <p className="text-sm text-on-surface-variant uppercase">Danh sách tài khoản</p>
        <button className="text-primary font-bold text-sm hover:underline flex items-center gap-1">
          Xem tài khoản
          <span className="material-symbols-outlined text-sm">open_in_new</span>
        </button>
      </div>

      {/* Trạng thái */}
      <div className="md:col-span-1">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.badgeClass}`}>
          {config.label}
        </span>
      </div>

      {/* Actions */}
      <div className="md:col-span-2 flex justify-end gap-2">
        <button
          onClick={() => onViewDetails()}
          className="bg-surface-container-highest p-2 rounded-xl text-on-surface-variant hover:text-primary transition-colors"
          title="Xem chi tiết"
        >
          <span className="material-symbols-outlined">visibility</span>
        </button>

        <button className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${config.revenueClass}`}>
          <span className="material-symbols-outlined text-sm">bar_chart</span>
          DOANH THU
        </button>

        <button
          className={`p-2 rounded-xl transition-colors ${config.lockClass}`}
          title={store.status === "locked" ? "Mở khóa cửa hàng" : "Khóa quyền truy cập"}
        >
          <span className="material-symbols-outlined">{config.lockIcon}</span>
        </button>
      </div>
    </div>
  );
};
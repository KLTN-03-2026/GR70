export const StoreDetailsModal = ({ isOpen, onClose, store }) => {
  if (!isOpen || !store) return null;

  // Cấu hình bảng màu theo yêu cầu
  const colors = {
    primary: "#10BC5D",
    text1: "#141C21", // Tiêu đề chính, text đậm
    text2: "#3D3D3D", // Nội dung quan trọng
    text3: "#8B8B8B", // Label, thông tin phụ
    text4: "#D1D1D1", // Border, text mờ nhất
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

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border" style={{ borderColor: colors.text4 }}>

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b" style={{ borderColor: colors.text4 + '50' }}>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: colors.text1 }}>{store.name}</h2>
            <p className="text-sm font-medium" style={{ color: colors.text3 }}>ID: {store.id}</p>
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
          {/* Thông tin chủ sở hữu */}
          <div>
            <h4 className="uppercase text-xs font-bold tracking-[0.15em] mb-5" style={{ color: colors.text3 }}>
              Thông tin chủ sở hữu
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              {[
                { label: "Tên", value: store.owner },
                { label: "Email", value: store.ownerEmail },
                { label: "Số điện thoại", value: store.ownerPhone },
                { label: "Địa chỉ", value: store.ownerAddress },
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
                  style={getStatusBadgeStyles(store.status)}
                >
                  {getStatusLabel(store.status)}
                </span>
              </div>
              <div>
                <p className="text-[11px] uppercase mb-1 font-bold" style={{ color: colors.text3 }}>Ngày tạo</p>
                <p className="font-semibold" style={{ color: colors.text2 }}>{store.createdAt}</p>
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
                <p className="font-semibold" style={{ color: colors.text2 }}>{store.province}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase mb-1 font-bold" style={{ color: colors.text3 }}>Vai trò</p>
                <p className="font-semibold" style={{ color: colors.text2 }}>{store.role}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase mb-1 font-bold" style={{ color: colors.text3 }}>Tổng số món ăn</p>
                <p className="font-semibold" style={{ color: colors.text2 }}>{store.totalDishes} món</p>
              </div>
              <div>
                <p className="text-[11px] uppercase mb-1 font-bold" style={{ color: colors.text3 }}>Doanh thu năm</p>
                <p className="font-bold text-2xl" style={{ color: colors.primary }}>{store.annualRevenue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t flex justify-end bg-gray-50/50" style={{ borderColor: colors.text4 + '50' }}>
          <button
            onClick={onClose}
            className="px-10 py-3 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-[#10BC5D]/20"
            style={{ backgroundColor: colors.primary }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
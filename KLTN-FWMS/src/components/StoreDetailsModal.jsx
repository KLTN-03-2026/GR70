export const StoreDetailsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-outline-variant/20">
          <h3 className="text-2xl font-bold text-on-surface">
            Chi tiết Cửa hàng
          </h3>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface text-3xl"
          >
            ✕
          </button>
        </div>

        <form className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-on-surface-variant uppercase tracking-wider">
                Loại hình
              </label>
              <select className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary text-on-surface">
                <option value="restaurant">Nhà hàng</option>
                <option value="hotel">Khách sạn</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-on-surface-variant uppercase tracking-wider">
                Tổng món ăn
              </label>
              <input
                type="number"
                defaultValue={124}
                className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary text-on-surface"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-primary text-on-primary py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:brightness-110 transition-all"
            >
              Lưu thay đổi
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-outline-variant/30 text-on-surface py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-surface-container-low transition-all"
            >
              Hủy bỏ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

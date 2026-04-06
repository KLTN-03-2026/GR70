export default function ModalActions({ onSave, onClose, saveLabel, loading }) {
  return (
    <div className="flex justify-end mt-4 space-x-2">
      <button onClick={onClose} disabled={loading}>Hủy</button>
      <button onClick={onSave} disabled={loading}>
        {loading ? "Đang xử lý..." : saveLabel}
      </button>
    </div>
  );
}

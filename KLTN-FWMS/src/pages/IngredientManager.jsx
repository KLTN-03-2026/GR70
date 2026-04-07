import { useState, useEffect, useCallback } from "react";
import { getUserInfo } from "../utils/auth";

import {
  getAllDishes,
  getAllDishesFalse,
  createDish,
  updateDish,
  deleteDish,
  approveDish,
  getCategoryDishes,
  getIngredientsByBrand,
} from "../services/dishService";

// ─── Toast ─────────────────────────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-lg text-sm font-semibold ${t.type === "error"
              ? "bg-red-50 border-red-200 text-red-700"
              : t.type === "warning"
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}
          style={{ animation: "fadeInUp 0.25s ease" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            {t.type === "error" ? "error" : t.type === "warning" ? "warning" : "check_circle"}
          </span>
          {t.message}
          <button onClick={() => removeToast(t.id)} className="ml-2 opacity-60 hover:opacity-100">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  const remove = useCallback(
    (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    []
  );
  return { toasts, add, remove };
}

// ─── Shared UI ──────────────────────────────────────────────────────────────
const labelClass =
  "block text-xs font-bold uppercase tracking-wider mb-1.5 text-slate-500";
const inputClass =
  "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-all";

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        style={{ animation: "fadeIn 0.2s cubic-bezier(.4,0,.2,1)" }}
      >
        <div
          className="p-6 text-white"
          style={{ background: "linear-gradient(135deg, var(--color-primary), #0da04f)" }}
        >
          <div className="flex items-center justify-between">
            <h2
              style={{
                fontFamily: "'Arimo', sans-serif",
                fontSize: 18,
                fontWeight: 700,
                margin: 0,
              }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                close
              </span>
            </button>
          </div>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ─── Confirm Lock Modal ──────────────────────────────────────────────────────
function ConfirmLockModal({ item, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(item.id);
    setLoading(false);
    onClose();
  };

  return (
    <Modal title="Xác nhận khóa món ăn" onClose={onClose}>
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 24, color: "#f59e0b" }}
            >
              lock
            </span>
          </div>
          <div>
            <p className="font-bold text-base" style={{ color: "var(--color-text-1)" }}>
              Khóa "{item.name}"?
            </p>
            <p className="text-sm mt-0.5" style={{ color: "var(--color-text-3)" }}>
              Món ăn sẽ bị ẩn khỏi thực đơn. Bạn có thể mở khóa sau.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border text-sm font-bold hover:opacity-80 transition-all"
            style={{ borderColor: "var(--color-text-4)", color: "var(--color-text-2)" }}
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold bg-amber-500 hover:opacity-90 active:scale-95 disabled:opacity-60 transition-all"
          >
            {loading ? "Đang khóa..." : "Khóa món ăn"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Food Form Modal ─────────────────────────────────────────────────────────
function FoodFormModal({ initial, onClose, onSave, isEdit, brandId, userId, showToast }) {
  const userInfo = getUserInfo();

  const [form, setForm] = useState({
    category: initial
      ? String(
        initial.dish_category_id ||
        initial.dish_category?.id ||
        initial.category?.id ||
        ""
      )
      : "",
    name: initial?.name || "",
    des: initial?.des || "",
    status: initial ? (initial.status === true ? "active" : "paused") : "paused",
  });

  // Giá tách riêng: raw (số) và display (format VND)
  const [priceRaw, setPriceRaw] = useState(
    initial?.price ? String(initial.price) : ""
  );
  const [priceDisplay, setPriceDisplay] = useState(
    initial?.price ? Number(initial.price).toLocaleString("vi-VN") + " ₫" : ""
  );

  const [categories, setCategories] = useState([]);
  const [ingredientsList, setIngredientsList] = useState([]);
  const [dishRecipes, setDishRecipes] = useState([]);
  const [fetchReady, setFetchReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // FIX: Fetch categories + ingredients trước
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, ingRes] = await Promise.all([
          getCategoryDishes(),
          getIngredientsByBrand(),
        ]);
        setCategories(Array.isArray(catRes?.data) ? catRes.data : []);
        setIngredientsList(Array.isArray(ingRes?.data) ? ingRes.data : []);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        setFetchReady(true);
      }
    };
    fetchData();
  }, []);

  // FIX: Load công thức SAU khi ingredients đã có → select hiển thị đúng
  useEffect(() => {
    if (!fetchReady) return;
    if (isEdit && Array.isArray(initial?.dish_recipes) && initial.dish_recipes.length > 0) {
      setDishRecipes(
        initial.dish_recipes.map((r) => ({
          ingredient_id: String(r.ingredient_id || ""),
          quantity: r.quantity ? String(r.quantity) : "",
        }))
      );
    }
  }, [fetchReady]);

  const handleInputChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  // Giá: focus → hiện số thuần để nhập; blur → format VND
  const handlePriceFocus = () => setPriceDisplay(priceRaw);
  const handlePriceChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setPriceRaw(val);
    setPriceDisplay(val);
  };
  const handlePriceBlur = () => {
    if (priceRaw) {
      setPriceDisplay(Number(priceRaw).toLocaleString("vi-VN") + " ₫");
    } else {
      setPriceDisplay("");
    }
  };

  const handleAddIngredient = () =>
    setDishRecipes((prev) => [...prev, { ingredient_id: "", quantity: "" }]);

  const handleRemoveIngredient = (index) =>
    setDishRecipes((prev) => prev.filter((_, i) => i !== index));

  const handleRecipeChange = (index, field, value) =>
    setDishRecipes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });

  const handleSave = async () => {
    if (!form.name?.trim() || !form.category || !priceRaw) {
      setError("Vui lòng nhập đầy đủ tên món, danh mục và giá.");
      return;
    }
    if (!isEdit && (!brandId || !userId)) {
      setError("Thiếu thông tin brand hoặc user. Vui lòng đăng nhập lại!");
      return;
    }

    const validRecipes = dishRecipes
      .filter((r) => r.ingredient_id && r.quantity?.trim())
      .map((r) => ({ ingredient_id: r.ingredient_id, quantity: Number(r.quantity) }));

    try {
      setLoading(true);
      setError("");

      if (isEdit && initial?.id) {
        await updateDish(initial.id, {
          dish_category_id: form.category,
          name: form.name.trim(),
          price: Number(priceRaw),
          des: form.des.trim(),
          status: form.status === "active",
          dish_recipes: validRecipes,
        });
        showToast("Cập nhật món ăn thành công!");
      } else {
        await createDish(brandId, userId, {
          dish_category_id: form.category,
          name: form.name.trim(),
          price: Number(priceRaw),
          des: form.des.trim() || "",
          // FIX: BE tự xét, tạo mới luôn false (chờ duyệt)
          status: false,
          dish_recipes: validRecipes,
        });
        showToast("Thêm món ăn thành công! Đang chờ duyệt.");
      }

      onSave();
      onClose();
    } catch (err) {
      const backendError = err?.response?.data;
      const msg =
        backendError?.message ||
        backendError?.error ||
        (backendError?.errors ? `Lỗi: ${backendError.errors}` : "Có lỗi xảy ra khi lưu món ăn");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={isEdit ? "Cập nhật món ăn" : "Thêm món ăn mới"} onClose={onClose}>
      <div className="space-y-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              error
            </span>
            {error}
          </div>
        )}

        {/* Người tạo — chỉ khi thêm mới */}
        {!isEdit && (
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center gap-2">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20, color: "#3b82f6" }}
            >
              person
            </span>
            <div className="text-sm">
              <span className="text-blue-500 font-medium">Người tạo: </span>
              <span className="font-bold text-blue-700">
                {userInfo?.fullName ||
                  userInfo?.name ||
                  userInfo?.username ||
                  "Người dùng"}
              </span>
            </div>
          </div>
        )}

        {/* Tên món */}
        <div>
          <label className={labelClass}>
            Tên món ăn <span className="text-red-400">*</span>
          </label>
          <input
            value={form.name}
            onChange={handleInputChange("name")}
            placeholder="VD: Phở bò tái chín"
            className={inputClass}
          />
        </div>

        {/* Danh mục */}
        <div>
          <label className={labelClass}>
            Danh mục <span className="text-red-400">*</span>
          </label>
          <select
            value={form.category}
            onChange={handleInputChange("category")}
            className={inputClass}
          >
            <option value="">— Chọn danh mục —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Giá tiền */}
        <div>
          <label className={labelClass}>
            Giá bán <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={priceDisplay}
            onFocus={handlePriceFocus}
            onChange={handlePriceChange}
            onBlur={handlePriceBlur}
            placeholder="VD: 85000 → hiển thị 85,000 ₫"
            className={inputClass}
          />
        </div>

        {/* Mô tả */}
        <div>
          <label className={labelClass}>Mô tả món ăn</label>
          <textarea
            value={form.des}
            onChange={handleInputChange("des")}
            placeholder="Mô tả ngắn về món ăn, hương vị, phong cách nấu..."
            rows={3}
            className={inputClass + " resize-y"}
          />
        </div>

        {/* Trạng thái — chỉ cho edit vì tạo mới BE tự xét */}
        {isEdit && (
          <div>
            <label className={labelClass}>Trạng thái</label>
            <select
              value={form.status}
              onChange={handleInputChange("status")}
              className={inputClass}
            >
              <option value="active">Hoạt động</option>
              <option value="paused">Tạm dừng</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              * Món mới tạo sẽ vào trạng thái "Chờ duyệt" — BE tự xét.
            </p>
          </div>
        )}

        {/* Nguyên liệu */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelClass} style={{ marginBottom: 0 }}>
              Công thức nguyên liệu
            </label>
            <button
              type="button"
              onClick={handleAddIngredient}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-bold bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                add
              </span>
              Thêm
            </button>
          </div>

          {!fetchReady ? (
            <div className="text-center py-4 text-sm text-slate-400">
              Đang tải nguyên liệu...
            </div>
          ) : (
            <div className="space-y-2">
              {dishRecipes.map((recipe, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <select
                    value={recipe.ingredient_id}
                    onChange={(e) =>
                      handleRecipeChange(index, "ingredient_id", e.target.value)
                    }
                    className="flex-1 border border-gray-200 p-2.5 rounded-xl text-sm focus:outline-none focus:border-green-400"
                  >
                    <option value="">— Chọn nguyên liệu —</option>
                    {ingredientsList.map((ing) => (
                      <option key={ing.id} value={String(ing.id)}>
                        {ing.name} ({ing.unit})
                      </option>
                    ))}
                  </select>

                  <div className="relative w-32 flex-shrink-0">
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={recipe.quantity}
                      onChange={(e) =>
                        handleRecipeChange(index, "quantity", e.target.value)
                      }
                      placeholder="SL"
                      className="w-full border border-gray-200 p-2.5 pr-8 rounded-xl text-sm focus:outline-none focus:border-green-400"
                    />
                    {recipe.ingredient_id && (
                      <span
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold pointer-events-none"
                        style={{ color: "var(--color-text-3)" }}
                      >
                        {ingredientsList.find(
                          (i) => String(i.id) === String(recipe.ingredient_id)
                        )?.unit || ""}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      delete
                    </span>
                  </button>
                </div>
              ))}

              {dishRecipes.length === 0 && (
                <p className="text-sm text-slate-400 italic text-center py-4 border border-dashed rounded-xl">
                  Chưa có nguyên liệu. Nhấn "Thêm" để bắt đầu.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border text-sm font-bold hover:opacity-80 transition-all"
            style={{ borderColor: "var(--color-text-4)", color: "var(--color-text-2)" }}
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2.5 text-white rounded-xl text-sm font-bold disabled:opacity-60 hover:opacity-90 active:scale-95 transition-all"
            style={{
              background: "linear-gradient(135deg, var(--color-primary), #0da04f)",
            }}
          >
            {loading ? "Đang xử lý..." : isEdit ? "Lưu thay đổi" : "Thêm món ăn"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main FoodsPage ──────────────────────────────────────────────────────────
export default function FoodsPage() {
  const userInfo = getUserInfo();
  const userId =
    userInfo?.userId || userInfo?.id || localStorage.getItem("userId");
  const brandId =
    userInfo?.brandID || userInfo?.brandId || localStorage.getItem("brandID");

  const { toasts, add: showToast, remove: removeToast } = useToast();

  const [foods, setFoods] = useState([]);
  const [pending, setPending] = useState([]);
  const [activeTab, setActiveTab] = useState("list");
  const [modal, setModal] = useState(null);

  const fetchFoods = useCallback(async () => {
    try {
      const [activeRes, pendingRes] = await Promise.all([
        getAllDishes(),
        getAllDishesFalse(),
      ]);
      setFoods(Array.isArray(activeRes?.data) ? activeRes.data : []);
      setPending(Array.isArray(pendingRes?.data) ? pendingRes.data : []);
    } catch {
      showToast("Lỗi tải danh sách món ăn", "error");
    }
  }, []);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  // FIX: Đổi "xóa" → "khóa"
  const handleLock = async (id) => {
    try {
      await deleteDish(id);
      setFoods((prev) => prev.filter((f) => f.id !== id));
      showToast("Đã khóa món ăn thành công.");
    } catch (err) {
      const msg = err?.response?.data?.message || "";
      if (msg.includes("foreign key")) {
        showToast("Không thể khóa: món ăn đang dùng trong thực đơn.", "warning");
      } else {
        showToast("Khóa thất bại: " + (msg || "Có lỗi xảy ra"), "error");
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveDish(id);
      showToast("Duyệt món ăn thành công!");
      fetchFoods();
    } catch (err) {
      showToast(
        "Duyệt thất bại: " + (err?.response?.data?.message || ""),
        "error"
      );
    }
  };

  const handleReject = async (id) => {
    try {
      await deleteDish(id);
      showToast("Đã từ chối và xóa món ăn.");
      fetchFoods();
    } catch (err) {
      showToast(
        "Từ chối thất bại: " + (err?.response?.data?.message || ""),
        "error"
      );
    }
  };

  const thClass = "px-6 py-4 text-xs font-bold uppercase tracking-wider";

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        select { appearance: auto; }
      `}</style>

      <div
        className="flex min-h-screen pl-8"
        style={{ background: "#f6f8f7", fontFamily: "'Nunito', sans-serif" }}
      >
        <main className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-white border-b border-slate-200 px-8 sticky top-0 z-10">
            <div className="flex justify-between items-center pt-6 pb-4">
              <h2
                style={{
                  fontFamily: "'Arimo', sans-serif",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "var(--color-text-1)",
                  margin: 0,
                }}
              >
                Quản lý Món ăn
              </h2>
              <button
                onClick={() => setModal("add")}
                className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary), #0da04f)",
                  boxShadow: "0 4px 12px rgba(16,188,93,0.25)",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  add
                </span>
                Thêm món ăn mới
              </button>
            </div>

            <div className="flex gap-6">
              {[
                { key: "list", label: "Danh sách món ăn" },
                { key: "pending", label: "Chờ duyệt", badge: pending.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="pb-3 px-1 text-sm font-bold border-b-2 transition-all flex items-center gap-2"
                  style={
                    activeTab === tab.key
                      ? {
                        borderColor: "var(--color-primary)",
                        color: "var(--color-text-1)",
                      }
                      : {
                        borderColor: "transparent",
                        color: "var(--color-text-3)",
                      }
                  }
                >
                  {tab.label}
                  {tab.badge > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </header>

          <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
            {/* Tab: Danh sách */}
            {activeTab === "list" && (
              <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3
                    style={{
                      fontFamily: "'Arimo', sans-serif",
                      fontWeight: 700,
                      color: "var(--color-text-1)",
                      margin: 0,
                    }}
                  >
                    Danh sách món ăn
                  </h3>
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(16,188,93,0.1)",
                      color: "var(--color-primary)",
                    }}
                  >
                    {foods.length} món
                  </span>
                </div>

                <table className="w-full text-left">
                  <thead style={{ background: "#f8faf9" }}>
                    <tr>
                      {[
                        "Tên món ăn",
                        "Danh mục",
                        "Đơn giá",
                        "Người tạo",
                        "Trạng thái",
                        "Thao tác",
                      ].map((header, idx) => (
                        <th
                          key={header}
                          className={thClass}
                          style={{
                            color: "var(--color-text-3)",
                            textAlign: idx === 5 ? "right" : "left",
                          }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {foods.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/60 transition-colors"
                        style={{ borderTop: "1px solid #f1f5f2" }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: "rgba(16,188,93,0.08)" }}
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: 20, color: "var(--color-primary)" }}
                              >
                                restaurant
                              </span>
                            </div>
                            <span
                              className="text-sm font-semibold"
                              style={{ color: "var(--color-text-1)" }}
                            >
                              {item.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className="text-xs px-3 py-1 rounded-full font-semibold"
                            style={{ background: "#f1f5f4", color: "var(--color-text-2)" }}
                          >
                            {item.dish_category?.name ||
                              item.category?.name ||
                              "Chưa phân loại"}
                          </span>
                        </td>

                        <td
                          className="px-6 py-4 text-sm font-bold"
                          style={{ color: "var(--color-text-1)" }}
                        >
                          {Number(item.price).toLocaleString("vi-VN")}đ
                        </td>

                        {/* FIX: Hiển thị tên người tạo rõ ràng */}
                        <td
                          className="px-6 py-4 text-sm"
                          style={{ color: "var(--color-text-2)" }}
                        >
                          {item.user?.fullName ||
                            item.user?.name ||
                            item.created_by_name ||
                            (item.user_id === userId
                              ? userInfo?.fullName || userInfo?.name || "Tôi"
                              : item.user_id
                                ? `Người dùng #${String(item.user_id).slice(0, 6)}`
                                : "—")}
                        </td>

                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-sm font-semibold w-fit">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{
                                background:
                                  item.status === true
                                    ? "var(--color-primary)"
                                    : "#9ca3af",
                              }}
                            />
                            <span
                              style={{
                                color:
                                  item.status === true
                                    ? "var(--color-primary)"
                                    : "var(--color-text-3)",
                              }}
                            >
                              {item.status === true ? "Hoạt động" : "Tạm dừng"}
                            </span>
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setModal({ type: "edit", item })}
                              className="p-2 rounded-lg hover:bg-green-50 transition-colors"
                              title="Cập nhật"
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: 18, color: "var(--color-text-3)" }}
                              >
                                edit
                              </span>
                            </button>
                            {/* FIX: icon khóa thay vì xóa */}
                            <button
                              onClick={() => setModal({ type: "lock", item })}
                              className="p-2 rounded-lg hover:bg-amber-50 transition-colors"
                              title="Khóa món ăn"
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: 18, color: "#f59e0b" }}
                              >
                                lock
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {foods.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center text-sm"
                          style={{ color: "var(--color-text-3)" }}
                        >
                          Chưa có món ăn nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>
            )}

            {/* Tab: Chờ duyệt */}
            {activeTab === "pending" && (
              <section className="space-y-4">
                <h3
                  style={{
                    fontFamily: "'Arimo', sans-serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "var(--color-text-1)",
                    margin: 0,
                  }}
                >
                  Danh sách chờ duyệt
                </h3>

                {pending.length === 0 ? (
                  <div
                    className="bg-white rounded-xl border border-slate-200 p-12 text-center text-sm"
                    style={{ color: "var(--color-text-3)" }}
                  >
                    Không có món nào chờ duyệt
                  </div>
                ) : (
                  pending.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex justify-between items-center gap-4"
                    >
                      <div className="flex gap-4 items-center">
                        <div
                          className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(16,188,93,0.06)" }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 36, color: "var(--color-primary)" }}
                          >
                            restaurant
                          </span>
                        </div>
                        <div>
                          <h5
                            style={{
                              fontFamily: "'Arimo', sans-serif",
                              fontSize: 16,
                              fontWeight: 600,
                              color: "var(--color-text-1)",
                              margin: 0,
                            }}
                          >
                            {item.name}
                          </h5>
                          <p
                            className="text-xs mt-1"
                            style={{ color: "var(--color-text-3)" }}
                          >
                            {item.des || "Không có mô tả"}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span
                              className="text-xs font-bold px-2.5 py-1 rounded-lg"
                              style={{
                                background: "rgba(16,188,93,0.1)",
                                color: "var(--color-primary)",
                              }}
                            >
                              {Number(item.price).toLocaleString("vi-VN")}đ
                            </span>
                            <span
                              className="text-xs"
                              style={{ color: "var(--color-text-2)" }}
                            >
                              {item.dish_category?.name ||
                                item.category?.name ||
                                "Chưa phân loại"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 flex-shrink-0">
                        <button
                          onClick={() => handleReject(item.id)}
                          className="px-5 py-2 rounded-xl text-sm font-bold border-2 transition-all hover:bg-red-50"
                          style={{ borderColor: "#ef4444", color: "#ef4444" }}
                        >
                          Từ chối
                        </button>
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--color-primary), #0da04f)",
                          }}
                        >
                          Duyệt món
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </section>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {modal === "add" && (
        <FoodFormModal
          onClose={() => setModal(null)}
          onSave={fetchFoods}
          isEdit={false}
          brandId={brandId}
          userId={userId}
          showToast={showToast}
        />
      )}

      {modal?.type === "edit" && modal.item && (
        <FoodFormModal
          initial={modal.item}
          onClose={() => setModal(null)}
          onSave={fetchFoods}
          isEdit={true}
          brandId={brandId}
          userId={userId}
          showToast={showToast}
        />
      )}

      {modal?.type === "lock" && modal.item && (
        <ConfirmLockModal
          item={modal.item}
          onClose={() => setModal(null)}
          onConfirm={handleLock}
        />
      )}

      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  );
}
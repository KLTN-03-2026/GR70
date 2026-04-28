import { useState, useEffect, useCallback } from "react";
import { getUserInfo } from "../../../utils/auth";
import Pagination from "../../../components/Pagination"
import {
  approveDish,
  getCategoryDishes,
  getIngredientsByBrand,
} from "../../../services/dishService";

import { Create_Dish_Kitchen, getAll_Dish, List_Dish_Await } from "../../../services/Dish_Kitchen";
import { toast } from "sonner";

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

// ─── Food Form Modal ───────────────────────────────────────────────────────
function FoodFormModal({
  initial,
  onClose,
  onSave,
  isEdit,
  brandId,
  userId
}) {
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
    status: initial && initial.status === true ? "active" : "paused",
  });

  const [priceRaw, setPriceRaw] = useState(
    initial?.price ? String(initial.price) : ""
  );
  const [priceDisplay, setPriceDisplay] = useState(
    initial?.price ? Number(initial.price).toLocaleString("vi-VN") : ""
  );

  const [categories, setCategories] = useState([]);
  const [ingredientsList, setIngredientsList] = useState([]);
  const [dishRecipes, setDishRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch danh mục + nguyên liệu
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
      }
    };
    fetchData();
  }, []);

  // Load công thức khi edit
  useEffect(() => {
    if (isEdit && Array.isArray(initial?.dish_recipes)) {
      setDishRecipes(
        initial.dish_recipes.map((item) => ({
          ingredient_id: item.ingredient_id || "",
          quantity: item.quantity ? String(item.quantity) : "",
        }))
      );
    } else {
      setDishRecipes([]);
    }
  }, [initial, isEdit]);

  const handleInputChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

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
    // Validate cơ bản
    if (!form.name?.trim()) {
      setError("Tên món ăn không được để trống");
      return;
    }

    if (!form.category) {
      setError("Vui lòng chọn danh mục");
      return;
    }

    if (!priceRaw || Number(priceRaw) <= 0) {
      setError("Giá phải lớn hơn 0");
      return;
    }

    // Validate nguyên liệu
    const validRecipes = dishRecipes
      .filter((r) => r.ingredient_id && r.quantity?.trim())
      .map((r) => ({
        ingredient_id: r.ingredient_id,
        quantity: Number(r.quantity),
      }));

    if (validRecipes.length === 0) {
      setError("Phải có ít nhất 1 nguyên liệu");
      return;
    }

    // Check quantity > 0
    const invalidQty = validRecipes.find((r) => r.quantity <= 0);
    if (invalidQty) {
      setError("Số lượng nguyên liệu phải lớn hơn 0");
      return;
    }

    // Check trùng nguyên liệu
    const ids = validRecipes.map((r) => r.ingredient_id);
    const hasDuplicate = new Set(ids).size !== ids.length;
    if (hasDuplicate) {
      setError("Không được chọn trùng nguyên liệu");
      return;
    }

    const payload = {
      dish_category_id: form.category,
      name: form.name.trim(),
      price: Number(priceRaw),
      des: form.des.trim() || "",
      dish_recipes: validRecipes,
    };

    try {
      setLoading(true);
      setError("");

      await Create_Dish_Kitchen(payload);

      toast.success("Thêm món ăn thành công!");
      onSave();
      onClose();
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Có lỗi xảy ra";

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={isEdit ? "Cập nhật món ăn" : "Thêm món ăn mới"} onClose={onClose}>
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Hiển thị Người tạo khi thêm mới */}
        {!isEdit && userInfo?.fullName && (
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">person</span>
            <div>
              <span className="text-xs text-blue-600 font-medium">Người tạo:</span>
              <span className="ml-1.5 font-semibold text-blue-700">
                {userInfo.fullName}
              </span>
            </div>
          </div>
        )}

        <input
          value={form.name}
          onChange={handleInputChange("name")}
          placeholder="Tên món ăn"
          className="w-full border p-3 rounded-xl focus:outline-none focus:border-green-500"
        />

        <select
          value={form.category}
          onChange={handleInputChange("category")}
          className="w-full border p-3 rounded-xl focus:outline-none focus:border-green-500"
        >
          <option value="">Chọn danh mục</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={priceDisplay}
          onFocus={() => setPriceDisplay(priceRaw)}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9]/g, "");
            setPriceRaw(val);
            setPriceDisplay(val);
          }}
          onBlur={() => {
            if (priceRaw)
              setPriceDisplay(Number(priceRaw).toLocaleString("vi-VN"));
            else setPriceDisplay("");
          }}
          placeholder="Giá món ăn"
          className="w-full border p-3 rounded-xl focus:outline-none focus:border-green-500"
        />

        <textarea
          value={form.des}
          onChange={handleInputChange("des")}
          placeholder="Mô tả món ăn (tùy chọn)"
          rows={3}
          className="w-full border p-3 rounded-xl focus:outline-none focus:border-green-500 resize-y"
        />

        <select
          value={form.status}
          onChange={handleInputChange("status")}
          className="w-full border p-3 rounded-xl focus:outline-none focus:border-green-500"
        >
          <option value="active">Hoạt động</option>
          <option value="paused">Tạm dừng</option>
        </select>

        {/* Nguyên liệu */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="font-semibold text-sm" style={{ color: "var(--color-text-1)" }}>
              Nguyên liệu
            </label>
            <button
              type="button"
              onClick={handleAddIngredient}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              Thêm
            </button>
          </div>

          <div className="space-y-2">
            {dishRecipes.map((recipe, index) => (
              <div key={index} className="flex gap-2 items-center">
                <select
                  value={recipe.ingredient_id}
                  onChange={(e) => handleRecipeChange(index, "ingredient_id", e.target.value)}
                  className="flex-1 border p-2.5 rounded-xl text-sm focus:outline-none focus:border-green-500"
                >
                  <option value="">Chọn nguyên liệu</option>
                  {ingredientsList.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({ing.unit})
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={recipe.quantity}
                    onChange={(e) => handleRecipeChange(index, "quantity", e.target.value)}
                    placeholder="Số lượng"
                    className="w-32 border p-2.5 pr-10 rounded-xl text-sm focus:outline-none focus:border-green-500"
                  />
                  {recipe.ingredient_id && (
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold pointer-events-none"
                      style={{ color: "var(--color-text-3)" }}
                    >
                      {ingredientsList.find((i) => i.id === recipe.ingredient_id)?.unit || ""}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(index)}
                  className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                </button>
              </div>
            ))}

            {dishRecipes.length === 0 && (
              <p className="text-sm text-slate-400 italic text-center py-4 border border-dashed rounded-xl">
                Chưa có nguyên liệu nào. Nhấn "Thêm" để bắt đầu.
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3 text-white rounded-xl font-bold disabled:opacity-70 transition-all"
            style={{ background: "linear-gradient(135deg, var(--color-primary), #0da04f)" }}
          >
            {loading ? "Đang xử lý..." : isEdit ? "Cập nhật" : "Thêm món ăn"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main FoodsPage ────────────────────────────────────────────────────────
export default function Manager_Dish_Kitchen() {


  const userInfo = getUserInfo();   // ← Lấy từ JWT decode

  const userId = userInfo?.userId || userInfo?.id || localStorage.getItem("userId");
  const brandId = userInfo?.brandID || userInfo?.brandId || localStorage.getItem("brandID");

  // Debug để bạn thấy rõ giá trị
  // useEffect(() => {
  //   console.log("=== Debug User & Brand ===");
  //   console.log("userInfo từ JWT:", userInfo);
  //   console.log("userId:", userId);
  //   console.log("brandId:", brandId);
  // }, [userId, brandId]);

  const [pending, setPending] = useState([]);
  const [activeTab, setActiveTab] = useState("list");
  const [modal, setModal] = useState(null);

  const fetchFoods = async () => {
    try {
      const res = await List_Dish_Await();
      setPending(Array.isArray(res.data) ? res.data : []);
      console.log(res.data);

    } catch (err) {
      console.error("Lỗi tải danh sách món ăn:", err);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  // get_All_Dishes
  const [getAll_Dishes, setGetAll_Dishes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const ITEMS_PER_PAGE = 15;

  const fetch_getAll_Dish = async (p = 1) => {
    try {
      const res = await getAll_Dish(p, ITEMS_PER_PAGE);

      const data = res.data.data;
      console.log(res.data.data);

      setGetAll_Dishes(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || p);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetch_getAll_Dish(1);
  }, []);

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
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
        select { appearance: auto; }
      `}</style>

      <div className=" flex  min-h-screen  pl-8" style={{ background: "#f6f8f7", fontFamily: "'Nunito', sans-serif" }}>


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
                Thêm & Xem Danh Sách Món Ăn
              </h2>
              <button
                onClick={() => setModal("add")}
                className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
                style={{
                  background: "linear-gradient(135deg, var(--color-primary), #0da04f)",
                  boxShadow: "0 4px 12px rgba(16,188,93,0.25)",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
                Thêm món ăn mới
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-6">
              {[
                { key: "list", label: "Danh sách món ăn" },
                { key: "pending", label: "Đã gửi yêu cầu", badge: pending.length },

              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="pb-3 px-1 text-sm font-bold border-b-2 transition-all flex items-center gap-2"
                  style={
                    activeTab === tab.key
                      ? { borderColor: "var(--color-primary)", color: "var(--color-text-1)" }
                      : { borderColor: "transparent", color: "var(--color-text-3)" }
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

          <div className="p-8 space-y-8 max-w-7xl mx-auto w-full ">
            {/* Tab Danh sách món ăn */}
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
                    style={{ background: "rgba(16,188,93,0.1)", color: "var(--color-primary)" }}
                  >
                    {getAll_Dishes?.length} món
                  </span>
                </div>

                {/* Table List Dish */}
                <table className="w-full text-left">
                  <thead style={{ background: "#f8faf9" }}>
                    <tr>
                      {["Tên món ăn", "Danh mục", "Đơn giá", "Người tạo", "Trạng thái"].map(
                        (header, idx) => (
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
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {getAll_Dishes.map((item) => (
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
                            {item.dish_category?.name || item.category?.name || "Chưa phân loại"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm font-bold" style={{ color: "var(--color-text-1)" }}>
                          {Number(item.price).toLocaleString("vi-VN")}đ
                        </td>

                        <td className="px-6 py-4 text-sm" style={{ color: "var(--color-text-2)" }}>
                          {item.id === userId ? "Tôi" : item.user?.name || "Không rõ"}

                        </td>

                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-sm font-semibold w-fit">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{
                                background: "var(--color-primary)",
                              }}
                            />
                            <span
                              style={{
                                color: "var(--color-primary)",
                              }}
                            >
                              {"Hoạt động"}
                            </span>
                          </span>
                        </td>
                      </tr>
                    ))}

                    {getAll_Dishes.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-sm" style={{ color: "var(--color-text-3)" }}>
                          Chưa có món ăn nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  limit={ITEMS_PER_PAGE}
                  onPageChange={(p) => fetch_getAll_Dish(p)}
                />
              </section>
            )}

            {/* Tab Chờ duyệt giữ nguyên */}
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
                  Danh sách món đã yêu cầu!
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
                      {/* Nội dung pending giữ nguyên như code cũ của bạn */}
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
                          <p className="text-xs mt-1" style={{ color: "var(--color-text-3)" }}>
                            {item.des || "Không có mô tả"}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span
                              className="text-xs font-bold px-2.5 py-1 rounded-lg"
                              style={{ background: "rgba(16,188,93,0.1)", color: "var(--color-primary)" }}
                            >
                              {Number(item.price).toLocaleString("vi-VN")}đ
                            </span>
                            <span className="text-xs" style={{ color: "var(--color-text-2)" }}>
                              {item.dish_category?.name || item.category?.name || "Chưa phân loại"}
                            </span>
                          </div>
                        </div>
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
        />
      )}

      {modal?.type === "edit" && modal.item && (
        <FoodFormModal
          initial={modal.item}
          onClose={() => setModal(null)}
          onSave={fetchFoods}
          isEdit={true}
        />
      )}
    </>
  );
}
import { useState, useEffect, useCallback } from "react";


import {
    getIngredients,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    addStock,
    getIngredientById,
    getCategoryIngredients,
} from "../services/ingredientService";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────




const UNITS = ["kg", "lít", "gói", "hộp", "cái", "túi"];

const BADGE_COLORS = [
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-orange-100 text-orange-700",
    "bg-purple-100 text-purple-700",
    "bg-pink-100 text-pink-700",
    "bg-sky-100 text-sky-700",
];
const categoryColorCache = {};
let colorIdx = 0;
function getCategoryBadge(name) {
    if (!name || name === "—") return "bg-gray-100 text-gray-600";
    if (!categoryColorCache[name])
        categoryColorCache[name] = BADGE_COLORS[colorIdx++ % BADGE_COLORS.length];
    return categoryColorCache[name];
}

function mapIngredient(raw) {
    const stock = parseFloat(raw.current_stock);
    const minimum = parseFloat(raw.minimum_stock ?? raw.minimumStock ?? 0);

    return {
        id: raw.id ?? raw._id,
        name: raw.name,
        category:
            raw.ingredient_category?.name ??
            raw.category_name ??
            raw.category ??
            "—",
        ingredient_category_id:
            raw.ingredient_category_id ??
            raw.ingredient_category?.id ??
            "",
        unit: raw.unit,
        current_stock: isNaN(stock) ? 0 : stock,
        minimum_stock: isNaN(minimum) ? 0 : minimum,
    };
}

function extractList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.ingredients)) return data.ingredients;
    return [];
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const inputClass =
    "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none transition-all";
const labelClass =
    "block text-xs font-bold uppercase tracking-wider mb-1.5";

function ErrorBox({ message }) {
    return (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-xl border border-red-100">
            {message}
        </div>
    );
}

function ModalActions({ onClose, onSave, loading, saveLabel }) {
    return (
        <div className="flex gap-3 pt-2">
            <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all hover:opacity-80"
                style={{ borderColor: "var(--color-text-4)", color: "var(--color-text-2)" }}
            >
                Hủy
            </button>
            <button
                onClick={onSave}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, var(--color-primary), #0da04f)" }}
            >
                {loading ? "Đang lưu..." : saveLabel}
            </button>
        </div>
    );
}

function SkeletonRow() {
    return (
        <tr style={{ borderTop: "1px solid #f1f5f2" }}>
            {[220, 100, 60, 60, 80].map((w, i) => (
                <td key={i} className="px-6 py-4">
                    <div className="h-4 rounded-lg animate-pulse" style={{ width: w, background: "#f1f5f2" }} />
                </td>
            ))}
        </tr>
    );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onDismiss }) {
    useEffect(() => {
        const t = setTimeout(onDismiss, 3000);
        return () => clearTimeout(t);
    }, [onDismiss]);

    const colors =
        type === "error"
            ? "bg-red-50 border-red-200 text-red-700"
            : "bg-emerald-50 border-emerald-200 text-emerald-700";

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-lg text-sm font-semibold ${colors}`}
            style={{ animation: "fadeIn 0.2s ease" }}
        >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                {type === "error" ? "error" : "check_circle"}
            </span>
            {message}
        </div>
    );
}

// ─── MODAL WRAPPER ────────────────────────────────────────────────────────────
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
                        <h2 style={{ fontFamily: "'Arimo', sans-serif", fontSize: 18, fontWeight: 700, margin: 0 }}>
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                        </button>
                    </div>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

// ─── ADD INGREDIENT MODAL ─────────────────────────────────────────────────────
function AddIngredientModal({ onClose, onSave, brandId, categories }) {
    const [form, setForm] = useState({
        name: "",
        ingredient_category_id: categories[0]?.id ?? "",
        unit: UNITS[0],
        minimum_stock: "",
        current_stock: "",
    });

    useEffect(() => {
        if (categories.length > 0 && !form.ingredient_category_id) {
            setForm((f) => ({ ...f, ingredient_category_id: categories[0].id }));
        }
    }, [categories]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const handleSave = async () => {
        if (!form.name || !form.unit || !form.ingredient_category_id) {
            setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const payload = {
                name: form.name,
                ingredient_category_id: form.ingredient_category_id,
                unit: form.unit,
                minimum_stock: form.minimum_stock === "" ? null : Number(form.minimum_stock),
                current_stock: form.current_stock === "" ? 0 : Number(form.current_stock),
            };

            const res = await createIngredient(brandId, payload);
            const raw = res?.data ?? res;

            onSave(mapIngredient(raw));
            onClose();
        } catch (e) {
            setError(e?.response?.data?.message ?? e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Thêm nguyên liệu mới" onClose={onClose}>
            <div className="space-y-4">
                {error && <ErrorBox message={error} />}

                <div>
                    <label className={labelClass}>Tên nguyên liệu <span style={{ color: "#f87171" }}>*</span></label>
                    <input
                        value={form.name}
                        onChange={set("name")}
                        placeholder="Nhập tên nguyên liệu..."
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className={labelClass}>Danh mục <span style={{ color: "#f87171" }}>*</span></label>
                    <select
                        value={form.ingredient_category_id}
                        onChange={set("ingredient_category_id")}
                        className={inputClass}
                    >
                        {categories.length === 0 ? (
                            <option value="">Chưa có danh mục</option>
                        ) : (
                            categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))
                        )}
                    </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>Đơn vị <span style={{ color: "#f87171" }}>*</span></label>
                        <select value={form.unit} onChange={set("unit")} className={inputClass}>
                            {UNITS.map((u) => (
                                <option key={u} value={u}>{u}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Số lượng tối thiểu</label>
                        <input
                            type="number"
                            min={0}
                            value={form.minimum_stock}
                            onChange={(e) => setForm((f) => ({ ...f, minimum_stock: e.target.value }))}
                            placeholder="0"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Số lượng tồn kho</label>
                        <input
                            type="number"
                            min={0}
                            value={form.current_stock}
                            onChange={(e) => setForm((f) => ({ ...f, current_stock: e.target.value }))}
                            placeholder="0"
                            className={inputClass}
                        />
                    </div>
                </div>

                <ModalActions
                    onClose={onClose}
                    onSave={handleSave}
                    loading={loading}
                    saveLabel="Thêm nguyên liệu"
                />
            </div>
        </Modal>
    );
}

// ─── UPDATE INGREDIENT MODAL ──────────────────────────────────────────────────
function UpdateIngredientModal({ ingredient, onClose, onSave, categories }) {
    const [form, setForm] = useState({
        name: ingredient.name,
        unit: ingredient.unit,
        minimum_stock: String(ingredient.minimum_stock ?? ""),
        ingredient_category_id: ingredient.ingredient_category_id ?? "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const handleSave = async () => {
        setLoading(true);
        setError("");
        try {

            await updateIngredient(ingredient.id, {
                name: form.name,
                unit: form.unit,
                minimum_stock: form.minimum_stock,
                ingredient_category_id: form.ingredient_category_id,
            });


            onSave(mapIngredient({ ...ingredient, ...form }));
            onClose();
        } catch (e) {
            setError(e?.response?.data?.message ?? e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Cập nhật nguyên liệu" onClose={onClose}>
            <div className="space-y-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
                {error && <ErrorBox message={error} />}

                <div>
                    <label className={labelClass} style={{ color: "var(--color-text-3)" }}>Tên nguyên liệu</label>
                    <input type="text" value={form.name} onChange={set("name")} className={inputClass} style={{ color: "var(--color-text-1)" }} />
                </div>

                <div>
                    <label className={labelClass} style={{ color: "var(--color-text-3)" }}>Danh mục</label>
                    <select value={form.ingredient_category_id} onChange={set("ingredient_category_id")} className={inputClass} style={{ color: "var(--color-text-1)" }}>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass} style={{ color: "var(--color-text-3)" }}>Đơn vị</label>
                        <select value={form.unit} onChange={set("unit")} className={inputClass} style={{ color: "var(--color-text-1)" }}>
                            {UNITS.map((u) => <option key={u}>{u}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass} style={{ color: "var(--color-text-3)" }}>Tồn kho tối thiểu</label>
                        <input type="number" min="0" value={form.minimum_stock} onChange={set("minimum_stock")} className={inputClass} style={{ color: "var(--color-text-1)" }} />
                    </div>
                </div>

                <ModalActions onClose={onClose} onSave={handleSave} loading={loading} saveLabel="Lưu thay đổi" />
            </div>
        </Modal>
    );
}

// ─── ADD STOCK MODAL ──────────────────────────────────────────────────────────
function AddStockModal({ ingredient, onClose, onSave }) {
    // Lấy cả userId và tên người dùng
    const getUserData = () => {
        let userId = null;
        let fullName = "Người dùng";

        // Cách 1: Từ getUserInfo() - ưu tiên
        if (typeof getUserInfo === "function") {
            const info = getUserInfo();
            if (info) {
                userId = info.userId || info.id;
                fullName = info.name || info.fullName || info.username || "Người dùng";
                return { userId, fullName };
            }
        }

        // Cách 2: Fallback từ JWT token
        try {
            const token = localStorage.getItem("token");
            if (token) {
                const payload = JSON.parse(atob(token.split(".")[1]));
                userId = payload?.userId || payload?.id || payload?.user_id;
                fullName = payload?.name || payload?.fullName || "Người dùng";
            }
        } catch (e) {
            console.error("Lỗi parse token:", e);
        }

        return { userId, fullName };
    };

    const { userId, fullName } = getUserData();

    const [quantity, setQuantity] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    console.log("🔍 AddStockModal - userId:", userId, "| Tên:", fullName);

    const handleSave = async () => {
        setError("");

        if (!userId) {
            setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
            return;
        }

        if (!ingredient?.id) {
            setError("Nguyên liệu không hợp lệ.");
            return;
        }

        const qtyNumber = parseFloat(quantity);
        if (!quantity || isNaN(qtyNumber) || qtyNumber <= 0) {
            setError("Vui lòng nhập số lượng hợp lệ (> 0).");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await addStock(userId, {
                ingredient_id: ingredient.id,
                quantity: qtyNumber.toString(),
            });

            onSave({
                ...ingredient,
                current_stock: (Number(ingredient.current_stock) || 0) + qtyNumber,
            });

            console.log("✅ Nhập kho thành công bởi:", fullName);
            onClose();
        } catch (e) {
            console.error("❌ Lỗi nhập kho:", e?.response?.data || e);
            setError(e?.response?.data?.message || "Đã xảy ra lỗi khi nhập kho.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title={`Nhập kho: ${ingredient?.name || "Nguyên liệu"}`} onClose={onClose}>
            <div className="space-y-4">
                {error && <ErrorBox message={error} />}

                {/* Hiển thị tên người dùng đẹp hơn */}
                {userId && (
                    <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person</span>
                        Người thực hiện: <strong>{fullName}</strong>
                    </div>
                )}

                <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-sm" style={{ color: "var(--color-text-3)" }}>
                        Tồn kho hiện tại
                    </span>
                    <span className="font-bold text-lg" style={{ color: "var(--color-primary)" }}>
                        {ingredient?.current_stock || 0} {ingredient?.unit || ""}
                    </span>
                </div>

                <div>
                    <label className={labelClass} style={{ color: "var(--color-text-3)" }}>
                        Số lượng nhập thêm ({ingredient?.unit || "đơn vị"}) <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="VD: 20"
                        className={inputClass}
                        style={{ color: "var(--color-text-1)" }}
                        autoFocus
                    />
                </div>

                <ModalActions
                    onClose={onClose}
                    onSave={handleSave}
                    loading={loading}
                    saveLabel="Xác nhận nhập kho"
                />
            </div>
        </Modal>
    );
}

// ─── CONFIRM DELETE MODAL ─────────────────────────────────────────────────────
function ConfirmDeleteModal({ ingredient, onClose, onConfirm }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleConfirm = async () => {
        setLoading(true);
        setError("");
        try {
            await onConfirm(ingredient.id);
            onClose();
        } catch (e) {
            setError(e?.response?.data?.message ?? e.message);
            setLoading(false);
        }
    };

    return (
        <Modal title="Xác nhận xóa" onClose={onClose}>
            <div className="space-y-5" style={{ fontFamily: "'Nunito', sans-serif" }}>
                {error && <ErrorBox message={error} />}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined" style={{ fontSize: 24, color: "#f87171" }}>delete</span>
                    </div>
                    <div>
                        <p className="font-bold text-base" style={{ color: "var(--color-text-1)" }}>
                            Xóa "{ingredient.name}"?
                        </p>
                        <p className="text-sm mt-0.5" style={{ color: "var(--color-text-3)" }}>
                            Hành động này không thể hoàn tác.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all hover:opacity-80" style={{ borderColor: "var(--color-text-4)", color: "var(--color-text-2)" }}>
                        Hủy
                    </button>
                    <button onClick={handleConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold bg-red-500 hover:opacity-90 active:scale-95 disabled:opacity-60 transition-all">
                        {loading ? "Đang xóa..." : "Xóa nguyên liệu"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function IngredientsPage() {
    const token = localStorage.getItem("token");
    const tokenPayload = token ? JSON.parse(atob(token.split(".")[1])) : {};

    const brandId =
        tokenPayload?.brandID ||
        tokenPayload?.brandId ||
        tokenPayload?.brand_id ||
        null;

    const branchId =
        tokenPayload?.branchID ||
        tokenPayload?.branchId ||
        tokenPayload?.branch_id ||
        null;

    const [ingredients, setIngredients] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");
    const [modal, setModal] = useState(null);
    const [search, setSearch] = useState("");
    const [filterCat, setFilterCat] = useState("");
    const [toast, setToast] = useState(null);

    const showToast = (message, type = "success") => setToast({ message, type });


    useEffect(() => {
        getCategoryIngredients()
            .then((res) => setCategories(extractList(res)))
            .catch(() => { });
    }, []);

    // ── Fetch ──────────────────────────────────────────────────────────────────

    const fetchIngredients = useCallback(async () => {
        setLoading(true);
        setFetchError("");
        try {
            const res = await getIngredients();
            const rawList = extractList(res);
            setIngredients(rawList.map(mapIngredient));
        } catch (e) {
            setFetchError(e?.response?.data?.message ?? e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchIngredients(); }, [fetchIngredients]);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleAdd = (item) => {
        setIngredients((prev) => [item, ...prev]);
        showToast("Thêm nguyên liệu thành công!");
    };

    const handleUpdate = (updated) => {
        setIngredients((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        showToast("Cập nhật thành công!");
    };

    const handleDelete = async (id) => {
        await deleteIngredient(id);
        setIngredients((prev) => prev.filter((i) => i.id !== id));
        showToast("Đã xóa nguyên liệu.");
    };

    const handleStockUpdate = (updated) => {
        setIngredients((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        showToast("Nhập kho thành công!");
    };

    const uniqueCategories = [...new Set(ingredients.map((i) => i.category).filter((c) => c !== "—"))];
    const filtered = ingredients.filter((i) => {
        const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
        const matchCat = !filterCat || i.category === filterCat;
        return matchSearch && matchCat;
    });

    const thClass = "px-6 py-4 text-xs font-bold uppercase tracking-wider text-left";
    const tdClass = "px-6 py-4 text-sm";

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: scale(0.97) translateY(6px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                select { appearance: auto; }
            `}</style>

            <div className="flex  min-h-screen  pl-8" style={{ background: "#f6f8f7", fontFamily: "'Nunito', sans-serif" }}>
                <main className="flex-1 flex flex-col min-w-0">
                    {/* ── Header ── */}
                    <header className="bg-white border-b border-slate-200 px-8 h-20 flex items-center justify-between sticky top-0 z-10">
                        <h2 style={{ fontFamily: "'Arimo', sans-serif", fontSize: 22, fontWeight: 700, color: "var(--color-text-1)", margin: 0 }}>
                            Quản lý nguyên liệu
                        </h2>
                        <div className="flex gap-3">
                            <button
                                onClick={fetchIngredients}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all hover:opacity-80"
                                style={{ borderColor: "var(--color-text-4)", color: "var(--color-text-2)" }}
                                title="Làm mới"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>
                            </button>
                            <button
                                onClick={() => setModal("add")}
                                className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
                                style={{ background: "linear-gradient(135deg, var(--color-primary), #0da04f)", boxShadow: "0 4px 12px rgba(16,188,93,0.25)" }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
                                Thêm nguyên liệu mới
                            </button>
                        </div>
                    </header>

                    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full ">

                        {/* ── Fetch Error Banner ── */}
                        {fetchError && (
                            <div className="bg-red-50 text-red-600 text-sm px-5 py-3.5 rounded-xl border border-red-100 flex items-center gap-3">
                                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>error</span>
                                Lỗi tải dữ liệu: {fetchError}
                                <button onClick={fetchIngredients} className="ml-auto font-bold underline">Thử lại</button>
                            </div>
                        )}

                        {/* ── Search & Filter ── */}
                        <section className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-4 items-center">
                            <div className="flex-1 min-w-64 relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--color-text-3)" }}>search</span>
                                <input
                                    type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Tìm kiếm tên nguyên liệu..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm focus:outline-none border border-transparent focus:border-green-300 transition-all"
                                    style={{ color: "var(--color-text-1)" }}
                                />
                            </div>
                            <select
                                value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
                                className="bg-slate-50 border border-transparent focus:border-green-300 text-sm rounded-xl px-4 py-2.5 focus:outline-none transition-all"
                                style={{ color: "var(--color-text-2)" }}
                            >
                                <option value="">Tất cả danh mục</option>
                                {uniqueCategories.map((c) => <option key={c}>{c}</option>)}
                            </select>
                        </section>

                        {/* ── Table ── */}
                        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 style={{ fontFamily: "'Arimo', sans-serif", fontWeight: 700, color: "var(--color-text-1)", margin: 0 }}>
                                    Danh sách nguyên liệu
                                </h3>
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(16,188,93,0.1)", color: "var(--color-primary)" }}>
                                    {loading ? "..." : `${filtered.length} mục`}
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead style={{ background: "#f8faf9" }}>
                                        <tr>
                                            {["Tên nguyên liệu", "Danh mục", "Tối thiểu", "Tồn kho", "Đơn vị", "Hành động"].map((h, i) => (
                                                <th key={h} className={thClass} style={{
                                                    color: "var(--color-text-3)",
                                                    textAlign: i >= 2 ? "right" : "left"
                                                }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                                        ) : filtered.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-sm" style={{ color: "var(--color-text-3)" }}>
                                                    {fetchError ? "Không thể tải dữ liệu" : "Không tìm thấy nguyên liệu nào"}
                                                </td>
                                            </tr>
                                        ) : filtered.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/60 transition-colors" style={{ borderTop: "1px solid #f1f5f2" }}>
                                                <td className={tdClass}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(16,188,93,0.1)" }}>
                                                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--color-primary)" }}>nutrition</span>
                                                        </div>
                                                        <span className="font-semibold" style={{ color: "var(--color-text-1)" }}>{item.name}</span>
                                                    </div>
                                                </td>
                                                <td className={tdClass}>
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getCategoryBadge(item.category)}`}>
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className={tdClass} style={{ textAlign: "right" }}>
                                                    <span className="font-bold inline-flex items-center gap-1" style={{ color: item.current_stock <= item.minimum_stock ? "#f97316" : "var(--color-primary)" }}>
                                                        {Number(item.current_stock).toFixed(2)}
                                                        {item.current_stock <= item.minimum_stock && (
                                                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#f97316" }} title="Sắp hết hàng">warning</span>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className={tdClass} style={{ textAlign: "center", color: "var(--color-text-2)" }}>
                                                    {Number(item.minimum_stock).toFixed(2)}
                                                </td>
                                                <td className={tdClass} style={{ color: "var(--color-text-2)", textAlign: "center" }}>{item.unit}</td>
                                                <td className={tdClass} style={{ textAlign: "right" }}>
                                                    <div className="flex justify-end gap-1.5">
                                                        <button onClick={() => setModal({ type: "addStock", item })} className="p-2 rounded-lg hover:bg-emerald-50 transition-colors" title="Nhập kho">
                                                            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-primary)" }}>add_box</span>
                                                        </button>
                                                        <button onClick={() => setModal({ type: "update", item })} className="p-2 rounded-lg hover:bg-slate-100 transition-colors" title="Chỉnh sửa">
                                                            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-text-3)" }}>edit</span>
                                                        </button>
                                                        <button onClick={() => setModal({ type: "delete", item })} className="p-2 rounded-lg hover:bg-red-50 transition-colors" title="Xóa">
                                                            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#f87171" }}>delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                    </div>
                </main>

            </div>

            {/* ── Modals ── */}
            {modal === "add" && (
                <AddIngredientModal onClose={() => setModal(null)} onSave={handleAdd} brandId={brandId} categories={categories} />
            )}
            {modal?.type === "update" && (
                <UpdateIngredientModal ingredient={modal.item} onClose={() => setModal(null)} onSave={handleUpdate} categories={categories} />
            )}
            {modal?.type === "addStock" && modal.item && (
                <AddStockModal
                    ingredient={modal.item}
                    onClose={() => setModal(null)}
                    onSave={handleStockUpdate}
                />
            )}
            {modal?.type === "delete" && (
                <ConfirmDeleteModal ingredient={modal.item} onClose={() => setModal(null)} onConfirm={handleDelete} />
            )}

            {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
        </>
    );
}
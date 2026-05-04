import { useState, useEffect, useCallback, useRef } from "react";
import { getAllBrands, mapBrand } from "../services/adminService";
import { StoreItem } from "./StoreItem";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

const SIZES_PER_PAGE = 10;

export const StoreListSection = ({ onOpenModal, onStatusChange }) => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProvince, setSelectedProvince] = useState("");
    const searchTimer = useRef(null);

    const fetchStores = useCallback(async (p = 1, searchVal = "", provinceVal = "") => {
        setLoading(true);
        setError("");
        try {
            const params = {
                page: p,
                size: SIZES_PER_PAGE,
                ...(searchVal.trim() ? { search: searchVal.trim() } : {}),
                ...(provinceVal.trim() ? { province: provinceVal.trim() } : {}),
            };
            const res = await getAllBrands(params);
            const inner = res?.data ?? res;
            const list = Array.isArray(inner?.data) ? inner.data : Array.isArray(inner) ? inner : [];
            setStores(list.map(mapBrand));
            setTotal(inner?.total ?? list.length);
            setTotalPages(inner?.totalPages ?? 1);
            setPage(p);
        } catch (e) {
            setError(e?.response?.data?.message ?? e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchStores(1, "", ""); }, [fetchStores]);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => fetchStores(1, val, selectedProvince), 400);
    };

    const handleProvinceChange = (e) => {
        const val = e.target.value;
        setSelectedProvince(val);
        fetchStores(1, searchTerm, val);
    };

    const handleStatusChange = async (id, newStatus) => {
        // update UI ngay (mượt)
        setStores((prev) =>
            prev.map((s) => s.id === id ? { ...s, status: newStatus } : s)
        );

        // sync lại backend (đảm bảo đúng)
        await fetchStores(page, searchTerm, selectedProvince);
    };


    const handlePageChange = (p) => {
        if (p < 1 || p > totalPages) return;
        fetchStores(p, searchTerm, selectedProvince);
    };

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
        .reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
            acc.push(p);
            return acc;
        }, []);

    return (
        <div className="lg:col-span-12 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-[30px] font-semibold">Danh mục Cửa hàng</h3>
                <div className="flex gap-4 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                    <div className="relative flex-1 sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                        <input type="text" value={searchTerm} onChange={handleSearchChange}
                            placeholder="Tìm kiếm theo tên cửa hàng..."
                            className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary text-sm" />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5 pointer-events-none" />
                        <input type="text" value={selectedProvince} onChange={handleProvinceChange}
                            placeholder="Lọc theo tỉnh..."
                            className="pl-10 pr-4 py-3 bg-surface-container-highest border-none rounded-xl text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[180px]" />
                    </div>
                    <button onClick={() => fetchStores(page, searchTerm, selectedProvince)}
                        className="p-3 bg-surface-container-highest rounded-xl text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>refresh</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="text-sm px-4 py-3 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center gap-2">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
                    {error}
                    <button onClick={() => fetchStores(1, searchTerm, selectedProvince)} className="ml-auto font-bold underline">Thử lại</button>
                </div>
            )}

            <div className="space-y-4">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-20 rounded-xl animate-pulse bg-surface-container-low" />
                    ))
                ) : stores.length === 0 ? (
                    <div className="py-16 text-center text-on-surface-variant text-sm">Không tìm thấy cửa hàng nào</div>
                ) : (
                    stores.map((store) => (
                        <StoreItem key={store.id} store={store} onViewDetails={onOpenModal} onStatusChange={handleStatusChange} />
                    ))
                )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-outline-variant/20">
                <p className="text-on-surface-variant text-sm font-medium mb-4 sm:mb-0">
                    {loading ? "Đang tải..." : <>Hiển thị <span className="text-on-surface font-bold">{(page - 1) * SIZES_PER_PAGE + 1}–{Math.min(page * SIZES_PER_PAGE, total)}</span> trên <span className="text-on-surface font-bold">{total}</span> cửa hàng</>}
                </p>
                {totalPages > 1 && (
                    <nav className="flex items-center gap-2">
                        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        {pages.map((p, idx) =>
                            p === "..." ? <span key={`e-${idx}`} className="px-2 text-on-surface-variant text-sm">…</span> : (
                                <button key={p} onClick={() => handlePageChange(p)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm transition-colors ${page === p ? "bg-primary text-on-primary shadow-md shadow-primary/20" : "border border-outline-variant/30 text-on-surface hover:bg-surface-container-high"}`}>
                                    {p}
                                </button>
                            )
                        )}
                        <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </nav>
                )}
            </div>
        </div>
    );
};
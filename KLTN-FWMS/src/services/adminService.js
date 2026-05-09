import api from "./api";

export function mapBrand(raw) {
    const brand = raw?.brand ?? raw;
    const user = brand?.users?.[0] ?? {};
    return {
        id: brand.id,
        name: brand.name,
        location: brand.address ?? "—",
        province: brand.province ?? "—",
        status: brand.status === true ? "active" : "locked",
        role: brand.rolebrand ?? "—",
        owner: user.name ?? "—",
        ownerEmail: user.email ?? "—",
        ownerPhone: user.phone ?? "—",
        ownerAddress: user.address ?? "—",
        createdAt: user.created_at ? new Date(user.created_at).toLocaleDateString("vi-VN") : "—",
        totalDishes: raw?.dish ?? 0,
        annualRevenue: raw?.revenue ? Number(raw.revenue).toLocaleString("vi-VN") + "đ" : "—",
    };
}

export const getAllBrands = async (params = {}) => {
    const res = await api.get("admin/get-all-brand", { params });
    return res.data;
};

export const getBrandDetail = async (id) => {
    const res = await api.get(`admin/get-brand-detail/${id}`);
    return res.data;
};

export const lockBrand = async (id) => {
    const res = await api.put(`admin/lock-brand/${id}`);
    return res.data;
};

export const unlockBrand = async (id) => {
    const res = await api.put(`admin/unlock-brand/${id}`);
    if (res.data?.success === false) {
        throw new Error(res.data?.message || "Không thể mở khóa");
    }
    return res.data;
};

export const getTotalBrand = async () => {
    const res = await api.get("admin/get-total-brand");
    return res.data;
};
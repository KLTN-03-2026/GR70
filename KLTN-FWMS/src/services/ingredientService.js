import api from "./api";

export const getIngredients = async (
    page = 1,
    size = 10,
    search = "",
    category = ""
) => {
    const res = await api.get("ingredients/get-ingredients-by-brand", {
        params: {
            page,
            size,
            ...(search && { search }),
            ...(category && { category }),
        },
    });
    return res.data;
};


export const createIngredient = async (brandId, data) => {
    const formData = new FormData();
    Object.entries({
        ...data,
        current_stock: data.current_stock ?? "0",
    }).forEach(([key, value]) => {
        formData.append(key, value ?? "");
    });

    const res = await api.post(`ingredients/create-ingredient/${brandId}`, formData);
    return res.data;
};

export const updateIngredient = async (id, data) => {
    const res = await api.put(`ingredients/update-ingredient/${id}`, data);
    return res.data;
};

export const deleteIngredient = async (id) => {
    const res = await api.delete(`ingredients/delete-ingredient/${id}`);
    return res.data;
};

export const addStock = async (userId, data) => {
    const res = await api.post(`ingredients/add-ingredient-transaction/${userId}`, data);
    return res.data;
};

export const getIngredientById = async (id) => {
    const res = await api.get(`ingredients/get-ingredient/${id}`);
    return res.data;
};

export const getCategoryIngredients = async () => {
    const res = await api.get("category-ingredients");
    return res.data;
};

export const getIngredientTransactions = async (page = 1, size = 10) => {
    const res = await api.get("ingredients/get-ingredient-transaction", {
        params: { page, size }
    });
    return res.data;
};
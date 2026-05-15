import api from "./api";

// Lấy tất cả món ăn
export const getAllDishes = async (page = 1, size = 10) => {
    const res = await api.get("/dishes/get-all-dishes", {
        params: { page, size },
    });
    return res.data;
};

// Lấy tất cả món chưa active
// dishService.js
export const getAllDishesFalse = async (page = 1, size = 10) => {
    const token = localStorage.getItem("token");
    const payload = token ? JSON.parse(atob(token.split(".")[1])) : {};
    const brandID = payload?.brandID || payload?.brandId || payload?.brand_id;

    const res = await api.get("/dishes/get-all-dishes-false", {
        params: { page, size, brandID }, 
    });
    return res.data;
};


export const createDish = async (brandId, userId, data) => {
    const res = await api.post(
        `/dishes/create-dishes/${brandId}/${userId}`,
        {
            dish_category_id: data.dish_category_id,
            name: data.name,
            price: data.price,
            des: data.des || "",
            status: data.status ?? false,
            dish_recipes: Array.isArray(data.dish_recipes)
                ? data.dish_recipes.map((r) => ({
                    ingredient_id: r.ingredient_id,
                    quantity: Number(r.quantity),
                }))
                : [],
        },
        {
            headers: { "Content-Type": "application/json" },
        }
    );

    if (res.data?.success === false) {
        const err = new Error(res.data?.message || "Nguyên liệu không phù hợp với món ăn.");
        err.isAIValidation = true;
        err.response = { data: res.data };
        throw err;
    }

    return res.data;
};


export const updateDish = async (id, data) => {
    const res = await api.put(`/dishes/update-dishes/${id}`, data);
    return res.data;
};

export const deleteDish = async (id) => {
    const res = await api.delete(`/dishes/delete-dishes/${id}`);
    return res.data;
};

export const approveDish = async (id) => {
    const res = await api.put(`/dishes/approve-dishes/${id}`);
    return res.data;
};

export const getCategoryDishes = async () => {
    const res = await api.get("/category-dishes");
    return res.data;
};

export const getIngredientsByBrand = async () => {
    const token = localStorage.getItem("token");
    const payload = token ? JSON.parse(atob(token.split(".")[1])) : {};
    const brandID = payload?.brandID || payload?.brandId || payload?.brand_id;

    const res = await api.get("/ingredients/get-ingredients-by-brand", {
        params: { brandID, size: 1000, page: 1 }, 
    });
    return res.data;
};

export const getRecipesByDish = async (dishId) => {
    const res = await api.get(`/dishes/get-recipes-by-dish/${dishId}`);
    return res.data;
};

export const getDishDetail = async (id) => {
    const res = await api.get(`dishes/get-dish-detail/${id}`);
    return res.data;
};

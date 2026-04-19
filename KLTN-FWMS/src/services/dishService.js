import api from "./api";

// Lấy tất cả món ăn
export const getAllDishes = async (page = 1, size = 10) => {
    const res = await api.get("/dishes/get-all-dishes", {
        params: { page, size },
    });
    return res.data;
};

// Lấy tất cả món chưa active
export const getAllDishesFalse = async (page = 1, size = 10) => {
    const res = await api.get("/dishes/get-all-dishes-false", {
        params: { page, size },
    });
    return res.data;
};

export const createDish = async (brandId, userId, data) => {
    const formData = new FormData();

    formData.append("dish_category_id", String(data.dish_category_id || ""));
    formData.append("name", String(data.name || ""));
    formData.append("price", String(data.price || 0));
    formData.append("des", String(data.des || ""));
    formData.append("status", data.status === true ? "true" : "false");

    if (Array.isArray(data.dish_recipes) && data.dish_recipes.length > 0) {
        data.dish_recipes.forEach((recipe, index) => {
            formData.append(`dish_recipes[${index}][ingredient_id]`, recipe.ingredient_id);
            formData.append(`dish_recipes[${index}][quantity]`, recipe.quantity);
        });
    } else {
        formData.append("dish_recipes[0][ingredient_id]", "");
        formData.append("dish_recipes[0][quantity]", "0");
    }

    const res = await api.post(`/dishes/create-dishes/${brandId}/${userId}`, formData);
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
    const res = await api.get("/ingredients/get-ingredients-by-brand");
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

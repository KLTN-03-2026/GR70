const ApiError = require("../utils/ApiError");
const ApiSuccess = require("../utils/ApiSuccess");
const CategoryRepository = require("../repository/CategoryRepository");


// lấy danh sách category dish
exports.GetCategoryDishes = async function (req, res, next) {
    try {
        const getCategoryDishes = await CategoryRepository.getCategoryDishes();
        return res.json(ApiSuccess.getSelect("Category Dishes list", getCategoryDishes));
    } catch (error) {
        return next(error);
    }
};
// lấy danh sách category ingredient
exports.GetCategoryIngredients = async function (req, res, next) {
    try {
        const getCategoryIngredients = await CategoryRepository.getCategoryIngredients();
        return res.json(ApiSuccess.getSelect("Category Ingredients list", getCategoryIngredients));
    } catch (error) {
        return next(error);
    }
};
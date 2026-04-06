
const {DishCategoryModel,IngredientCategoryModel} = require("../models/index");
class CategoryRepository {
    async getCategoryDishes() {
        return await DishCategoryModel.findAll();
    }
    async getCategoryIngredients() {
        return await IngredientCategoryModel.findAll();
    }
}

module.exports = new CategoryRepository();
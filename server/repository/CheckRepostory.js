
const { IngredientCategoryModel, DishCategoryModel, BrandModel, DishModel } = require("../models/index");
class CheckRepository {
    async checkCategoryIngredient(id) {
        return await IngredientCategoryModel.findOne({where: {id: id}});
    }
    async checkCategoryDishes(id) {
        return await DishCategoryModel.findOne({where: {id: id}});
    }
    async checkDish(id) {
        const dish = await DishModel.findOne({where: {id: id}});
        return dish;
    }
    // gọi hết id của brand
    async AllBrand() {
        return await BrandModel.findAll({where: {status: true}});
    }
    // check brand
    async checkBrand(id) {
        return await BrandModel.findOne({where: {id: id, status: true}});
    }
}

module.exports = new CheckRepository();
const {
  IngredientModel,
  IngredientStockTransactionModel,
  IngredientCategoryModel,
  UserModel,
  DishRecipeModel,
  DishModel,
} = require("../models/index");
const sequelize = require("../config/connectData");
const pagination = require("../utils/pagination");
// const { where } = require("sequelize");
class IngredientRepository {
  async createIngredient(data, brandID) {
    return await IngredientModel.create({ ...data, brand_id: brandID });
  }
  // thêm số lượng nguyên liệu mới
  async addIngredientTransaction(data, userID, option = {}) {
    return await IngredientStockTransactionModel.create(
      { ...data, user_id: userID },
      { ...option },
    );
  }
  // lấy tên nguyên liệu
  async getIngredientName(ingredientID) {
    return await IngredientModel.findOne({attributes: ['name'], where: { id: ingredientID }, raw: true });
  }
  // ghi lại lịch sử xuất nguyên liệu khi tạo món ăn mới
  async IngredientTransactionOutput(data, userID,type, option = {}) {
    return await IngredientStockTransactionModel.create(
      { ...data, user_id: userID, type: type },
      { ...option },
    );
  }
  // cập nhật số lượng nguyên liệu
  async updateIngredientStock(ingredientID, quantity, option = {}) {
    await IngredientModel.update(
      { current_stock: sequelize.literal(`current_stock + ${quantity}`) },
      { where: { id: ingredientID }, ...option },
    );
  }
  // chỉnh sữa tên nguyên liệu hoặc đơn vị tính hoặc số lượng tồn kho tối thiểu hoặc category của nguyên liệu
  async updateIngredient(ingredientID, data) {
    return await IngredientModel.update(data, { where: { id: ingredientID } });
  }
  // xóa nguyên liệu
  async deleteIngredient(ingredientID) {
    return await IngredientModel.destroy({ where: { id: ingredientID } });
  }
  // get nguyên liệu theo id
  async getIngredient(ingredientID) {
    return await IngredientModel.findOne({ 
        where: { id: ingredientID },
        include: [{
            model: IngredientCategoryModel,
            attributes: ['id', 'name']
        }]
    });
  }
  // get nguyên liệu theo id
  async GetIngredientByID(id) {
    return await IngredientModel.findByPk(id);
  }
  // câp nhật số lượng tồn kho của nguyên liệu
  async updateIngredientStockWhenOutputDish(ingredientID, quantity, option = {}) {
    return await IngredientModel.update({ current_stock: sequelize.literal(`current_stock - ${quantity}`) }, { where: { id: ingredientID }, ...option });
  }
  async updateIngredientStockWhenOutputDishUpdate(ingredientID, quantity, option = {}) {
    return await IngredientModel.update({ current_stock: quantity }, { where: { id: ingredientID }, ...option });
  }
  // get tất cả nguyên liệu của một thương hiệu
  async getIngredientsByBrandID(brandID, options) {
    return await pagination.getPagination({
      model: IngredientModel,
      attributes: ['id', 'name', 'unit', 'current_stock', 'minimum_stock',
          [
        sequelize.literal(`EXISTS (
          SELECT 1
          FROM dish_recipes dr
          WHERE dr.ingredient_id = "ingredients"."id"
        )`),
        'haveDish'
      ]
      ],
      include: [{
          model: IngredientCategoryModel,
          attributes: ['name']
      }],
      where: { brand_id: brandID },
      searchFields: [
        'name',
      ],
      ...options
    })
  }
  // lịch sử nguyên liệu
  async getIngredientTransaction(brandID,options) {
    return await pagination.getPagination({
      model: IngredientStockTransactionModel,
      attributes: ['id', 'type', 'quantity', 'created_at'],
      include: [{
          model: IngredientModel,
          attributes: ['name',"unit"],
      },{
          model: UserModel,
          attributes: ['name'],
          where: {brand_id: brandID}
      }],
      searchFields: [
      'type',
      '$ingredient.name$'  // 👈 search theo tên nguyên liệu
    ],
      ...options
    })
  }
}
module.exports = new IngredientRepository();

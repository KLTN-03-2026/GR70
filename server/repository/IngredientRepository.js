const {
  IngredientModel,
  IngredientStockTransactionModel,
  IngredientCategoryModel,
  UserModel
} = require("../models/index");
const sequelize = require("../config/connectData");
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
  async getIngredientsByBrandID(brandID) {
    return await IngredientModel.findAll({ where: { brand_id: brandID }, include: [{
        model: IngredientCategoryModel,
        attributes: ['id', 'name']
    }] 
  });
  }
  // lịch sử nguyên liệu
  async getIngredientTransaction(brandID) {
    return await IngredientStockTransactionModel.findAll({ 
        attributes: ['id', 'type', 'quantity', 'created_at'],
        include: [{
            model: IngredientModel,
            attributes: ['name',"unit"],
        },{
            model: UserModel,
            attributes: ['name'],
            where: {brand_id: brandID}
        }]
    });
  }
}
module.exports = new IngredientRepository();

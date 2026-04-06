const BrandModel = require('./BrandModel');
const RoleModel = require('./RoleModel');
const PermissionModel = require('./PermissionModel');
const DishCategoryModel = require('./DishCategoryModel');
const IngredientCategoryModel = require('./IngredientCategoryModel');
const UserModel = require('./UserModel');
const UserRoleModel = require('./UserRoleModel');
const RolePermissionModel = require('./RolePermissionModel');
const DishModel = require('./DishModel');
const IngredientModel = require('./IngredientModel');
const DishRecipeModel = require('./DishRecipeModel');
const DailyOperationModel = require('./DailyOperationModel');
const DailyDetailModel = require('./DailyDetailModel');
const IngredientStockTransactionModel = require('./IngredientStockTransactionModel');
const AiAnalysisModel = require('./AiAnalysisModel');
const AiAnalysisDetailModel = require('./AiAnalysisDetailModel');
const MessageModel = require('./MessageModel');
const DetailMessageModel = require('./DetailMessageModel');
const RefreshTokenModel = require('./Refresh_token');

/* ===== BRAND ===== */
BrandModel.hasMany(UserModel, { foreignKey: 'brand_id' });
UserModel.belongsTo(BrandModel, { foreignKey: 'brand_id' });

BrandModel.hasMany(DishModel, { foreignKey: 'brand_id' });
DishModel.belongsTo(BrandModel, { foreignKey: 'brand_id' });

BrandModel.hasMany(IngredientModel, { foreignKey: 'brand_id' });
IngredientModel.belongsTo(BrandModel, { foreignKey: 'brand_id' });

BrandModel.hasMany(DailyOperationModel, { foreignKey: 'brand_id' });
DailyOperationModel.belongsTo(BrandModel, { foreignKey: 'brand_id' });

BrandModel.hasMany(AiAnalysisModel, { foreignKey: 'brand_id' });
AiAnalysisModel.belongsTo(BrandModel, { foreignKey: 'brand_id' });

/* ===== USER – ROLE – PERMISSION ===== */
UserModel.belongsToMany(RoleModel, { through: UserRoleModel, foreignKey: 'user_id', otherKey: 'role_id' });
RoleModel.belongsToMany(UserModel, { through: UserRoleModel, foreignKey: 'role_id', otherKey: 'user_id' });

RoleModel.belongsToMany(PermissionModel, { through: RolePermissionModel, foreignKey: 'role_id', otherKey: 'permission_id' });
PermissionModel.belongsToMany(RoleModel, { through: RolePermissionModel, foreignKey: 'permission_id', otherKey: 'role_id' });
/* ===== USER – REFRESH_TOKEN ===== */
UserModel.hasMany(RefreshTokenModel, { foreignKey: 'user_id' });
RefreshTokenModel.belongsTo(UserModel, { foreignKey: 'user_id' });

/* ===== DISH CATEGORY ===== */
DishCategoryModel.hasMany(DishModel, { foreignKey: 'dish_category_id' });
DishModel.belongsTo(DishCategoryModel, { foreignKey: 'dish_category_id' });

/* ===== INGREDIENT CATEGORY ===== */
IngredientCategoryModel.hasMany(IngredientModel, { foreignKey: 'ingredient_category_id' });
IngredientModel.belongsTo(IngredientCategoryModel, { foreignKey: 'ingredient_category_id' });

/* ===== USER – DISH ===== */
UserModel.hasMany(DishModel, { foreignKey: 'user_id' });
DishModel.belongsTo(UserModel, { foreignKey: 'user_id' });

/* ===== DISH – INGREDIENT through DISH_RECIPE ===== */
DishModel.belongsToMany(IngredientModel, { through: DishRecipeModel, foreignKey: 'dishes_id', otherKey: 'ingredient_id' });
IngredientModel.belongsToMany(DishModel, { through: DishRecipeModel, foreignKey: 'ingredient_id', otherKey: 'dishes_id' });

DishModel.hasMany(DishRecipeModel, { foreignKey: 'dishes_id' });
DishRecipeModel.belongsTo(DishModel, { foreignKey: 'dishes_id' });

IngredientModel.hasMany(DishRecipeModel, { foreignKey: 'ingredient_id' });
DishRecipeModel.belongsTo(IngredientModel, { foreignKey: 'ingredient_id' });

/* ===== DAILY OPERATION ===== */
DailyOperationModel.hasMany(DailyDetailModel, { foreignKey: 'daily_id' });
DailyDetailModel.belongsTo(DailyOperationModel, { foreignKey: 'daily_id' });

DishModel.hasMany(DailyDetailModel, { foreignKey: 'dishes_id' });
DailyDetailModel.belongsTo(DishModel, { foreignKey: 'dishes_id' });

/* ===== INGREDIENT STOCK TRANSACTION ===== */
UserModel.hasMany(IngredientStockTransactionModel, { foreignKey: 'user_id' });
IngredientStockTransactionModel.belongsTo(UserModel, { foreignKey: 'user_id' });

IngredientModel.hasMany(IngredientStockTransactionModel, { foreignKey: 'ingredient_id' });
IngredientStockTransactionModel.belongsTo(IngredientModel, { foreignKey: 'ingredient_id' });

/* ===== AI ANALYSIS ===== */
AiAnalysisModel.hasMany(AiAnalysisDetailModel, { foreignKey: 'analysis_id' });
AiAnalysisDetailModel.belongsTo(AiAnalysisModel, { foreignKey: 'analysis_id' });

DishModel.hasMany(AiAnalysisDetailModel, { foreignKey: 'dishes_id' });
AiAnalysisDetailModel.belongsTo(DishModel, { foreignKey: 'dishes_id' });

/* ===== CHAT 1-1 ===== */
UserModel.hasMany(MessageModel, { foreignKey: 'user_id1', as: 'messagesAsUser1' });
UserModel.hasMany(MessageModel, { foreignKey: 'user_id2', as: 'messagesAsUser2' });

MessageModel.belongsTo(UserModel, { foreignKey: 'user_id1', as: 'user1' });
MessageModel.belongsTo(UserModel, { foreignKey: 'user_id2', as: 'user2' });

MessageModel.hasMany(DetailMessageModel, { foreignKey: 'message_id' });
DetailMessageModel.belongsTo(MessageModel, { foreignKey: 'message_id' });

UserModel.hasMany(DetailMessageModel, { foreignKey: 'user_id' });
DetailMessageModel.belongsTo(UserModel, { foreignKey: 'user_id' });

module.exports = {
  BrandModel,
  RoleModel,
  PermissionModel,
  DishCategoryModel,
  IngredientCategoryModel,
  UserModel,
  UserRoleModel,
  RolePermissionModel,
  DishModel,
  IngredientModel,
  DishRecipeModel,
  DailyOperationModel,
  DailyDetailModel,
  IngredientStockTransactionModel,
  AiAnalysisModel,
  AiAnalysisDetailModel,
  MessageModel,
  DetailMessageModel,
  RefreshTokenModel
};
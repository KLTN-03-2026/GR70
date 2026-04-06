const ApiError = require("../utils/ApiError");
const ApiSuccess = require("../utils/ApiSuccess");
const CheckServices = require("../services/CheckServices");
const DishesRepository = require("../repository/DishesRepository");
const sequelize = require("../config/connectData");


// tạo món ăn mới cho manager
// flow 1. kiểm tra xem brandID và userID có tồn tại hay không
// flow 2. kiểm tra xem các trường dữ liệu có đầy đủ hay không
// flow 3. kiểm tra xem dish_category_id có tồn tại hay không
// flow 4. kiẻm tra dish_recipes có tồn tại hay không
// flow 5. tạo món ăn mới trả về id của món ăn mới tạo ra
// flow 6. chạy vòng lặp để tạo dish_recipes mới
// flow 7. trả về kết quả
exports.CreateDishes = async function (req, res, next) {
    const t = await sequelize.transaction();
    try {
        const data = req.body;
        const brandID = req.params.brandID;
        const userID = req.params.userID;
        // console.log("data", data);
        
        if(!brandID || !userID){
            throw ApiError.ValidationError("Missing required fields brandID or userID");
        }
        if (!data.name || !data.price || !data.dish_category_id || !data.des || !data.dish_recipes) {
            throw ApiError.ValidationError("Missing required fields");
        }
        if(!Array.isArray(data.dish_recipes) || data.dish_recipes.length === 0){
            throw ApiError.ValidationError("dish_recipes must be a non-empty array");
        }
        await CheckServices.checkCategoryDishes(data.dish_category_id);
        data.status=true;
        const createDishes = await DishesRepository.CreateDishes(data, brandID , userID, { transaction: t });
        // tạo dish_recipes mới bằng vòng lặp
        await Promise.all(
            data.dish_recipes.map(async (item) => {
                if (!item.quantity || !item.ingredient_id) {
                    throw ApiError.ValidationError(
                        "Missing required fields quantity or ingredient_id in dish_recipes"
                    );
                }
                return DishesRepository.CreateDishRecipes( item, createDishes.id,  { transaction: t });
            })
        );
        await t.commit();
        return res.json(ApiSuccess.created("Dish created successfully", createDishes));
    } catch (error) {
        if(!t.finished){
            await t.rollback();
        }
        return next(error);
    }
};
// cập nhập món ăn cho manager
exports.UpdateDishes = async function (req, res, next) {
    try {
        const data = req.body;
        const id = req.params.DishID;
        await CheckServices.checkDish(id);
        if (!data.name || !data.price || !data.dish_category_id || !data.des) {
            throw ApiError.ValidationError("Missing required fields");
        }
        await CheckServices.checkCategoryDishes(data.dish_category_id);
        const updateDishes = await DishesRepository.UpdateDishes(id, data);
        return res.json(ApiSuccess.updated("Dish updated successfully", updateDishes));
    } catch (error) {
        return next(error);
    }
};
// xóa món ăn cho manager
exports.DeleteDishes = async function (req, res, next) {
    try {
        const id = req.params.DishID;
        await CheckServices.checkDish(id);
        const deleteDishes = await DishesRepository.DeleteDishes(id);
        return res.json(ApiSuccess.deleted("Dish deleted successfully", deleteDishes));
    } catch (error) {
        return next(error);
    }
};

// lấy danh sách món ăn chờ
exports.GetAllDishesFalse = async function (req, res, next) {
    try {
        const BrandID = req.user.brandID;
        if(!BrandID){
            throw ApiError.Unauthorized("Brand ID is required");
        }
        await CheckServices.checkBrand(BrandID);
        const getAllDishes = await DishesRepository.GetAllDishesFalse(BrandID);
        return res.json(ApiSuccess.getSelect("Dishes list", getAllDishes));
    } catch (error) {
        return next(error);
    }
};
// duyệt danh sách món ăn chờ
exports.ApproveDishes = async function (req, res, next) {
    try {
        const id = req.params.DishID;
        await CheckServices.checkDish(id);
        const approveDishes = await DishesRepository.ApproveDishes(id);
        return res.json(ApiSuccess.updated("Dish approved successfully", approveDishes));
    } catch (error) {
        return next(error);
    }
};
// danh sách món ăn đã được duyệt
exports.GetAllDishesTrue = async function (req, res, next) {
    try {
        const BrandID = req.user.brandID;
        if(!BrandID){
            throw ApiError.Unauthorized("Brand ID is required");
        }
        await CheckServices.checkBrand(BrandID);
        const getAllDishes = await DishesRepository.GetAllDishesTrue(BrandID);
        return res.json(ApiSuccess.getSelect("Dishes list", getAllDishes));
    } catch (error) {
        return next(error);
    }
}
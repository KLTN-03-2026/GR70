const ApiError = require("../../utils/ApiError");
const ApiSuccess = require("../../utils/ApiSuccess");
const CheckServices = require("../../services/CheckServices");
const DishesRepository = require("../../repository/DishesRepository");
const BrandRepository = require("../../repository/CheckRepostory");
const DailyRepository = require("../../repository/DailyRepository");
const DailyService = require("../../services/DailyServices");
const sequelize = require("../../config/connectData");
const { log } = require("winston");
const IngredientServices = require("../../services/IngredientServices");
// tạo món ăn mới cho kitchen
exports.CreateDishesForKitchen = async function (req, res, next) {
  const t = await sequelize.transaction();
  try {
    const data = req.body;
    const brandID = req.user.brandID;
    const userID = req.user?.userId;
    // console.log("data", data);

    if (!brandID || !userID) {
      throw ApiError.ValidationError(
        "Missing required fields brandID or userID",
      );
    }
    if (
      !data.name ||
      !data.price ||
      !data.dish_category_id ||
      !data.des ||
      !data.dish_recipes
    ) {
      throw ApiError.ValidationError("Missing required fields");
    }
    if (!Array.isArray(data.dish_recipes) || data.dish_recipes.length === 0) {
      throw ApiError.ValidationError("dish_recipes must be a non-empty array");
    }
    await CheckServices.checkCategoryDishes(data.dish_category_id);
    const createDishes = await DishesRepository.CreateDishes(
      data,
      brandID,
      userID,
      { transaction: t },
    );
    // tạo dish_recipes mới bằng vòng lặp
    await Promise.all(
      data.dish_recipes.map(async (item) => {
        if (!item.quantity || !item.ingredient_id) {
          throw ApiError.ValidationError(
            "Missing required fields quantity or ingredient_id in dish_recipes",
          );
        }
        return DishesRepository.CreateDishRecipes(item, createDishes.id, {
          transaction: t,
        });
      }),
    );
    await t.commit();
    return res.json(
      ApiSuccess.created("Dish created successfully", createDishes),
    );
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    return next(error);
  }
};

// tạo món ra
exports.CreateDishesOutput = async function (req, res, next) {
  const t = await sequelize.transaction();
  try {
    const data = req.body;
    const brandID = req.params.brandID;
    console.log("brand", brandID);
    if (!brandID) {
      throw ApiError.ValidationError("Missing required field brandID");
    }
    // tìm kiếm ngày hiện tại lấy id ở operation_daily
    const TakeIDOperation = await DailyRepository.TakeIDOperation(brandID);
    console.log("take", TakeIDOperation);
    if (!TakeIDOperation) {
      throw ApiError.ValidationError("NotFound operation_daily for today");
    }
    if (!data.dishes_id || !data.quantity_prepared) {
      throw ApiError.ValidationError(
        "Missing required fields dishes_id or quantity_prepared",
      );
    }
    await CheckServices.checkDish(data.dishes_id);
    // kiểm tra món ăn đó đã được tạo món ra trong ngày chưa, nếu có rồi thì không được tạo nữa
    const checkDishesOutput = await DailyRepository.CheckDishesOutputByDishID(
      data.dishes_id,
      TakeIDOperation,
    );
    if (checkDishesOutput) {
      throw ApiError.Notification("Dish output already exists");
    }
    // kiểm tra xem nguyên liệu có đủ để tạo món ăn mới không
    const checkIngredient = await IngredientServices.CheckIngredientOutput(
      data.dishes_id,
      data.quantity_prepared,
    );
    const priceDish = await DailyService.checkPriceDish(data.dishes_id);
    data.revenue_cost = priceDish * data.quantity_prepared;
    const createDishesOutput = await DailyRepository.CreateDishesOutput(
      data,
      TakeIDOperation,
      { transaction: t },
    );
    // khi tạo món ra mới thì cũng cần cập nhật lại số lượng nguyên liệu đã xuất đi khi tạo món ăn đó
    const ingredient = await IngredientServices.HandleIngredientOutput(
      data.dishes_id,
      data.quantity_prepared,
      req.user?.userId,
      t,
    );
    await t.commit();
    return res.json(
      ApiSuccess.created(
        "Dish output created successfully",
        createDishesOutput,
      ),
    );
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    return next(error);
  }
};
// cập nhập món ra
// cập nhập món dư
exports.UpdateDishesLeftoverOutput = async function (req, res, next) {
  try {
    const data = req.body;
    const DailyDetailID = req.params.DailyDetailID;

    if (!DailyDetailID) {
      throw ApiError.ValidationError("Missing required field DailyDetailID");
    }

    if (data.quantity_wasted == null) {
      throw ApiError.ValidationError("Missing required field quantity_wasted");
    }

    const quantityWasted = Number(data.quantity_wasted);

    if (Number.isNaN(quantityWasted) || quantityWasted < 0) {
      throw ApiError.ValidationError("quantity_wasted must be a number >= 0");
    }

    const dishOutput = await DailyRepository.GetDishesOutputByID(DailyDetailID);
    if (!dishOutput) {
      throw ApiError.ValidationError(
        "NotFound dish output with id: " + DailyDetailID,
      );
    }

    if (quantityWasted > Number(dishOutput.quantity_prepared)) {
      throw ApiError.ValidationError(
        "quantity_wasted cannot be greater than quantity_prepared",
      );
    }

    const priceDish = await DailyService.checkPriceDish(dishOutput.dishes_id);

    // Recalculate from original values
    const quantityPrepared = Number(dishOutput.quantity_prepared || 0);
    const totalRevenue = priceDish * quantityPrepared;

    data.quantity_wasted = quantityWasted;
    data.wasted_cost = priceDish * quantityWasted;
    data.revenue_cost = totalRevenue - data.wasted_cost;

    const updateDishesLeftoverOutput =
      await DailyRepository.UpdateDishesLeftoverOutput(data, DailyDetailID);

    return res.json(
      ApiSuccess.updated(
        "Dish leftover output updated successfully",
        updateDishesLeftoverOutput,
      ),
    );
  } catch (error) {
    return next(error);
  }
};

// cập nhập số lượng món ra và tính toán lại revenue_cost
exports.UpdateDishesOutput = async function (req, res, next) {
  const t = await sequelize.transaction();
  try {
    const data = req.body;
    const DailyDetailID = req.params.DailyDetailID;

    if (!DailyDetailID) {
      throw ApiError.ValidationError("Missing required field DailyDetailID");
    }

    if (data.quantity_prepared == null) {
      throw ApiError.ValidationError(
        "Missing required field quantity_prepared",
      );
    }

    const quantityPrepared = Number(data.quantity_prepared);

    if (Number.isNaN(quantityPrepared) || quantityPrepared < 0) {
      throw ApiError.ValidationError("quantity_prepared must be a number >= 0");
    }

    const dishOutput = await DailyRepository.GetDishesOutputByID(DailyDetailID);
    if (!dishOutput) {
      throw ApiError.ValidationError(
        "NotFound dish output with id: " + DailyDetailID,
      );
    }
    if(Number(dishOutput.quantity_wasted>0)) {
      throw ApiError.ValidationError(
        "Cannot update quantity_prepared when quantity_wasted is already set. Please update quantity_wasted",
      );
    }
    const quantityWasted = Number(dishOutput.quantity_wasted || 0);

    if (quantityPrepared < quantityWasted) {
      throw ApiError.ValidationError(
        "quantity_prepared cannot be less than quantity_wasted",
      );
    }

    const priceDish = await DailyService.checkPriceDish(dishOutput.dishes_id);

    // Recalculate revenue_cost based on new quantity_prepared
    const totalRevenue = priceDish * quantityPrepared;
    const wastedCost = Number(dishOutput.wasted_cost || 0);

    data.quantity_prepared = quantityPrepared;
    data.revenue_cost = totalRevenue - wastedCost;

    const updateDishesOutput = await DailyRepository.UpdateDishesOutput(
      data,
      DailyDetailID,
      { transaction: t },
    );
    const oldQuantityPrepared = Number(dishOutput.quantity_prepared || 0);
    const ingredient =
      await IngredientServices.HandleIngredientOutputWhenUpdateDish(
        dishOutput.dishes_id,
        oldQuantityPrepared,
        quantityPrepared,
        req.user?.userId,
        t,
      );
    await t.commit();
    return res.json(
      ApiSuccess.updated(
        "Dish output updated successfully",
        updateDishesOutput,
      ),
    );
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    return next(error);
  }
};

// get danh sách món ăn ra hàng ngày theo day
exports.GetDishesOutputByDate = async function (req, res, next) {
  try {
    const brandID = req.params.brandID;
    if (!brandID) {
      throw ApiError.ValidationError("Missing required field brandID");
    }
    const checkBrand = await CheckServices.checkBrand(brandID);
    if (!checkBrand) {
      throw ApiError.ValidationError("Brand not found with id: " + brandID);
    }
    const dishesOutput = await DailyRepository.GetDishesOutputByDate(brandID);
    return res.json(ApiSuccess.getSelect("Dishes Output list", dishesOutput));
  } catch (error) {
    return next(error);
  }
};
// get danh sách món ăn true dành cho kitchen
exports.GetAllDishesTrueKitchen = async function (req, res, next) {
  try {
    const BrandID = req.user.brandID;
    if (!BrandID) {
      throw ApiError.Unauthorized("Brand ID is required");
    }
    await CheckServices.checkBrand(BrandID);
    const getAllDishes = await DishesRepository.GetAllDishesTrueKitchen(BrandID);
    return res.json(ApiSuccess.getSelect("Dishes list", getAllDishes));
  } catch (error) {
    return next(error);
  }
}
// danh sách món ăn đợi của kitchen
exports.GetListDishWaitByUser = async function (req, res, next) {
  try {
    const brandID =req.user.brandID;
    const userID = req.user.userId;
    const dishesOutput = await DishesRepository.GetAllDishesFalseByUserID(userID, brandID);
    return res.json(ApiSuccess.getSelect("Dishes Output list", dishesOutput));
  } catch (error) {
    return next(error);
  }
}
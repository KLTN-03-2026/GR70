const IngredientsRepository = require("../repository/IngredientRepository");
const ApiSuccess = require("../utils/ApiSuccess");
const ApiError = require("../utils/ApiError");
const CheckServices = require("../services/CheckServices");
const IngredientServices = require("../services/IngredientServices");
const sequelize = require("../config/connectData");
// tạo nguyên liệu mới
exports.CreateIngredient = async function (req, res, next) {
  try {
    const data = req.body;
    const brandID = req.params.brandID;
    if (!brandID) {
      throw ApiError.ValidationError("Missing required field: brandID");
    }
    if (
      !data.name ||
      !data.unit ||
      !data.ingredient_category_id ||
      !data.minimum_stock ||
      Number.isNaN(data.minimum_stock) ||
      !data.current_stock ||
      Number.isNaN(data.current_stock)
    ) {
      throw ApiError.ValidationError(
        "Missing required fields: name, unit, ingredient_category_id, minimum_stock, current_stock",
      );
    }
    // Check if the ingredient category exists
    await CheckServices.checkCategoryIngredient(data.ingredient_category_id);
    if (!data.current_stock) {
      data.current_stock = 0;
    }
    const newIngredient = await IngredientsRepository.createIngredient(
      data,
      brandID,
    );
    return res.json(
      ApiSuccess.created("Ingredient created successfully", newIngredient),
    );
  } catch (error) {
    return next(error);
  }
};
// thêm nguyên liệu mới
exports.AddIngredientTransaction = async function (req, res, next) {
  const t = await sequelize.transaction();
  try {
    const data = req.body;
    const userID = req.params.id;
    if (!userID) {
      throw ApiError.ValidationError("Missing required field: userID");
    }
    if (!data.ingredient_id || !data.quantity || Number.isNaN(data.quantity)) {
      throw ApiError.ValidationError(
        "Missing required fields: ingredientID, quantity",
      );
    }
    // có 3 loại transaction: nhập kho (extra), xuất kho (sell), điều chỉnh tồn kho(adjustment)
    data.type = "extra";
    const newIngredientTransaction =
      await IngredientsRepository.addIngredientTransaction(data, userID, {
        transaction: t,
      });
    await IngredientsRepository.updateIngredientStock(
      data.ingredient_id,
      data.quantity,
      { transaction: t },
    );
    await t.commit();
    return res.json(
      ApiSuccess.created(
        "Ingredient transaction created successfully",
        newIngredientTransaction,
      ),
    );
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    return next(error);
  }
};
// chỉnh sữa tên nguyên liệu hoặc đơn vị tính hoặc số lượng tồn kho tối thiểu hoặc category của nguyên liệu
exports.UpdateIngredient = async function (req, res, next) {
  try {
    const data = {
      name: req.body.name,
      unit: req.body.unit,
      minimum_stock: req.body.minimum_stock,
      IngredientCategoryID: req.body.ingredient_category_id,
    };
    const ingredientID = req.params.ingredientID;
    if (!ingredientID) {
      throw ApiError.ValidationError("Missing required field: ingredientID");
    }
    if (
      !data.name ||
      !data.unit ||
      !data.IngredientCategoryID ||
      !data.minimum_stock ||
      Number.isNaN(data.minimum_stock)
    ) {
      throw ApiError.ValidationError(
        "Missing required fields: name, unit, IngredientCategoryID, minimum_stock",
      );
    }
    if (data.minimum_stock < 0) {
      throw ApiError.ValidationError("minimum_stock must be >= 0");
    }
    // if (data.current_stock && Number(data.current_stock)) {
    //   throw ApiError.ValidationError(
    //     "Invalid value for field: current_stock cannot be updated through this endpoint",
    //   );
    // }
    // Check if the ingredient category exists
    await CheckServices.checkCategoryIngredient(data.IngredientCategoryID);
    const check = await IngredientServices.CheckIngredientInDish(ingredientID);
    let dataUpdate={};
    if (check) {
      dataUpdate={
        minimum_stock: data.minimum_stock
      }
    }else{
      dataUpdate={
        name: data.name,
        unit: data.unit,
        minimum_stock: data.minimum_stock,
        ingredient_category_id: data.IngredientCategoryID
      }
    }
    const updateIngredient = await IngredientsRepository.updateIngredient(
      ingredientID,
      dataUpdate,
    );
    return res.json(
      ApiSuccess.updated("Ingredient updated successfully", updateIngredient),
    );
  } catch (error) {
    return next(error);
  }
};
// xóa nguyên liệu
exports.DeleteIngredient = async function (req, res, next) {
  try {
    const ingredientID = req.params.ingredientID;
    if (!ingredientID) {
      throw ApiError.ValidationError("Missing required field: ingredientID");
    }
    const check = await IngredientServices.CheckIngredientInDish(ingredientID);
    if (check) {
      throw ApiError.ValidationError("Ingredient is used in a dish");
    }
    const deleteIngredient =
      await IngredientsRepository.deleteIngredient(ingredientID);
    return res.json(
      ApiSuccess.deleted("Ingredient deleted successfully", deleteIngredient),
    );
  } catch (error) {
    return next(error);
  }
};

// get thông tin của ingredient
exports.GetIngredient = async function (req, res, next) {
  try {
    const ingredientID = req.params.ingredientID;
    if (!ingredientID) {
      throw ApiError.ValidationError("Missing required field: ingredientID");
    }
    const getIngredient =
      await IngredientsRepository.getIngredient(ingredientID);
    return res.json(
      ApiSuccess.getSelect("Ingredient retrieved successfully", getIngredient),
    );
  } catch (error) {
    return next(error);
  }
};
// get danh sách nguyên liệu của một brand
exports.GetIngredientsByBrandID = async function (req, res, next) {
  try {
    const brandID = req.user.brandID;
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const filters = {
      search: req.query.search || "",
      category: req.query.category || undefined,
    }
    if (!brandID) {
      throw ApiError.ValidationError("Missing required field: brandID");
    }
    const getIngredientsByBrandID = await IngredientsRepository.getIngredientsByBrandID(brandID,{
      page,
      size,
      filters,
      orderBy: req.query.orderBy || "id",
      order: req.query.orderType === "1" ? "ASC" : "DESC",
    });
    return res.json(
      ApiSuccess.getSelect("Ingredients list", getIngredientsByBrandID),
    );
  } catch (error) {
    return next(error);
  }
};
// get danh sách nguyên liệu của một brand không phân trang
exports.GetIngredientsByBrandIDNoPagination = async function (req, res, next) {
  try {
    const brandID = req.user.brandID;
    const getIngredientsByBrandID = await IngredientsRepository.getIngredientsByBrandIDNoPagination(brandID);
    return res.json(
      ApiSuccess.getSelect("Ingredients list", getIngredientsByBrandID),
    );
  } catch (error) {
    return next(error);
  }
}
// lịch sử nguyên liệu
exports.GetIngredientTransaction = async function (req, res, next) {
  try {
    const brandID = req.user.brandID;
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const filters = {
      search: req.query.search || "",
      // fromDate: req.query.fromDate || undefined,
      // toDate: req.query.toDate || undefined,
      // category: req.query.category || undefined,
    };
    const getIngredientTransaction =
      await IngredientsRepository.getIngredientTransaction(brandID, {
        page,
        size,
        filters,
        orderBy: req.query.orderBy || "created_at",
        order: req.query.orderType === "1" ? "ASC" : "DESC",
      });
    return res.json(
      ApiSuccess.getSelect(
        "Ingredient transaction list",
        getIngredientTransaction,
      ),
    );
  } catch (error) {
    return next(error);
  }
};

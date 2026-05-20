const IngredientRepository = require("../repository/IngredientRepository");
const DishesRepository = require("../repository/DishesRepository");
const ApiError = require("../utils/ApiError");

function parsePositiveNumber(value, fieldName) {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) {
        throw ApiError.ValidationError(`${fieldName} phai la so lon hon 0`);
    }
    return number;
}

function parseNonNegativeNumber(value, fieldName) {
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0) {
        throw ApiError.ValidationError(`${fieldName} phai la so lon hon hoac bang 0`);
    }
    return number;
}

class IngredientServices{
    // xử lý logic xuất nguyên liệu khi thêm món ăn mới
    async HandleIngredientOutput(dishesID,quantity, userID, t){
        try {
            const outputQuantity = parsePositiveNumber(quantity, "quantity_prepared");
            const dishRecipes = await DishesRepository.GetIngredientsByDishID(dishesID);
            if (!dishRecipes.length) {
                throw ApiError.ValidationError("Mon an chua co nguyen lieu trong cong thuc");
            }
            for (const dishRecipe of dishRecipes) {
                const ingredientID = dishRecipe.ingredient_id;
                const recipeQuantity = parsePositiveNumber(dishRecipe.quantity, "so luong nguyen lieu trong cong thuc");
                const quantityRequired = recipeQuantity * outputQuantity;
                await IngredientRepository.updateIngredientStockWhenOutputDish(ingredientID, quantityRequired, { transaction: t });
                const data={
                    ingredient_id: ingredientID,
                    quantity: quantityRequired,
                }
                // khi xuất nguyên liệu thì cũng tạo một transaction để lưu lại lịch sử xuất nguyên liệu đó
                await IngredientRepository.IngredientTransactionOutput( data ,userID ,"output", { transaction: t }) ;
            }
            return true;
        } catch (error) {
            throw error;
        }
    }
    // hàm xử lý khi update món ăn đã được tạo ra rồi thì cũng cần cập nhật lại số lượng nguyên liệu đã xuất đi khi tạo món ăn đó
    async HandleIngredientOutputWhenUpdateDish(dishesID, oldQuantity, newQuantity, userID, t){
        try {
            const oldPreparedQuantity = parseNonNegativeNumber(oldQuantity, "old quantity_prepared");
            const newPreparedQuantity = parseNonNegativeNumber(newQuantity, "new quantity_prepared");
            const dishRecipes = await DishesRepository.GetIngredientsByDishID(dishesID);
            if (!dishRecipes.length) {
                throw ApiError.ValidationError("Mon an chua co nguyen lieu trong cong thuc");
            }
            for (const dishRecipe of dishRecipes) {
                const ingredientID = dishRecipe.ingredient_id;
                // gọi get nguyên liệu để lấy lại số lượng kho trước khi update để tính toán lại số lượng nguyên liệu cần xuất đi khi update món ăn đó
                const ingredient = await IngredientRepository.GetIngredientByID(ingredientID);
                if (!ingredient) {
                    throw ApiError.NotFound("Khong tim thay nguyen lieu");
                }
                const recipeQuantity = parsePositiveNumber(dishRecipe.quantity, "so luong nguyen lieu trong cong thuc");
                const ingredientCurrentStock = parseNonNegativeNumber(ingredient.current_stock, "current_stock");
                const currentStock = ingredientCurrentStock + (oldPreparedQuantity * recipeQuantity);
                // nếu số lượng mới lớn hơn số lượng cũ thì cần xuất thêm nguyên liệu, nếu số lượng mới nhỏ hơn số lượng cũ thì cần trả lại nguyên liệu vào kho
                const quantityRequired =(currentStock - (recipeQuantity *  newPreparedQuantity)) ;
                if(quantityRequired < 0) {
                    throw ApiError.ValidationError(`Khong du nguyen lieu: ${ingredient.name}. Can: ${-quantityRequired}, Hien co: ${currentStock}`);
                }
                await IngredientRepository.updateIngredientStockWhenOutputDishUpdate(ingredientID, quantityRequired, { transaction: t });
                const data={
                    ingredient_id: ingredientID,
                    quantity: quantityRequired,
                }
                // khi xuất nguyên liệu thì cũng tạo một transaction để lưu lại lịch sử xuất nguyên liệu đó
                await IngredientRepository.IngredientTransactionOutput( data ,userID ,"update output", { transaction: t }) ;
            }
            return true;
        } catch (error) {
            throw error;
        }
    }
    // check xem nguyên liệu có đủ để tạo món ăn mới không
    async CheckIngredientOutput(dishID,quantity){
        try {
            const outputQuantity = parsePositiveNumber(quantity, "quantity_prepared");
            let errors = [];
            // tìm tất cả nguyên liệu của món ăn đó
            const dishRecipes = await DishesRepository.GetIngredientsByDishID(dishID);
            if (!dishRecipes.length) {
                throw ApiError.ValidationError("Mon an chua co nguyen lieu trong cong thuc");
            }
            for (const dishRecipe of dishRecipes) {
                const ingredientID = dishRecipe.ingredient_id;
                const recipeQuantity = parsePositiveNumber(dishRecipe.quantity, "so luong nguyen lieu trong cong thuc");
                const quantityRequired = recipeQuantity * outputQuantity;
                const ingredient = await IngredientRepository.GetIngredientByID(ingredientID);
                if (!ingredient) {
                    throw ApiError.NotFound("Khong tim thay nguyen lieu");
                }
                const currentStock = parseNonNegativeNumber(ingredient.current_stock, "current_stock");
                if (currentStock < quantityRequired) {
                    errors.push(`Khong du nguyen lieu: ${ingredient.name}. Can: ${quantityRequired}, Hien co: ${currentStock}`);
                }
            }
            if (errors.length > 0) {
                throw ApiError.ValidationError(errors.join("; "));
            }
            return true;
        } catch (error) {
            throw error;
        }
    }
    // check nguyên liệu đã được thêm vào công thức món ăn chưa
    async CheckIngredientInDish(ingredientID){
        try {
            const dishRecipes = await IngredientRepository.GetIngredientsByDishID(ingredientID);
            if(dishRecipes){
                return true
            }
            return false;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new IngredientServices ();

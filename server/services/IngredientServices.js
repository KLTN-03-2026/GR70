const IngredientRepository = require("../repository/IngredientRepository");
const DishesRepository = require("../repository/DishesRepository");
const ApiError = require("../utils/ApiError");
class IngredientServices{
    // xử lý logic xuất nguyên liệu khi thêm món ăn mới
    async HandleIngredientOutput(dishesID,quantity, userID, t){
        try {
            const dishRecipes = await DishesRepository.GetIngredientsByDishID(dishesID);
            for (const dishRecipe of dishRecipes) {
                const ingredientID = dishRecipe.ingredient_id;
                const quantityRequired = dishRecipe.quantity * quantity;
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
            const dishRecipes = await DishesRepository.GetIngredientsByDishID(dishesID);
            for (const dishRecipe of dishRecipes) {
                const ingredientID = dishRecipe.ingredient_id;
                // gọi get nguyên liệu để lấy lại số lượng kho trước khi update để tính toán lại số lượng nguyên liệu cần xuất đi khi update món ăn đó
                const ingredient = await IngredientRepository.GetIngredientByID(ingredientID);
                const currentStock = ingredient.current_stock + (oldQuantity * dishRecipe.quantity);
                // nếu số lượng mới lớn hơn số lượng cũ thì cần xuất thêm nguyên liệu, nếu số lượng mới nhỏ hơn số lượng cũ thì cần trả lại nguyên liệu vào kho
                const quantityRequired =(currentStock - (dishRecipe.quantity *  newQuantity)) ;
                if(quantityRequired < 0) {
                    throw ApiError.ValidationError(`Not enough ingredient: ${ingredient.name}. Required: ${-quantityRequired}, Available: ${currentStock}`);
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
            let errors = [];
            // tìm tất cả nguyên liệu của món ăn đó
            const dishRecipes = await DishesRepository.GetIngredientsByDishID(dishID);
            for (const dishRecipe of dishRecipes) {
                const ingredientID = dishRecipe.ingredient_id;
                const quantityRequired = dishRecipe.quantity * quantity;
                const ingredient = await IngredientRepository.GetIngredientByID(ingredientID);
                if (ingredient.current_stock < quantityRequired) {
                    errors.push(`Not enough ingredient: ${ingredient.name}. Required: ${quantityRequired}, Available: ${ingredient.current_stock}`);
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
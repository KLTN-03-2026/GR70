const {DishModel, DishRecipeModel, DishCategoryModel, UserModel, IngredientModel} = require("../models/index");


class DishesRepository {
    async CreateDishes(data, brandID, userID, options={}) {
        try {
            const createDishes = await DishModel.create({ ...data, brand_id: brandID, user_id: userID },{...options});
            return createDishes;
        } catch (error) {
            throw error;
        }
    }
    async UpdateDishes(id, data, options={}) {
        try {
            const updateDishes = await DishModel.update(data, { where: { id: id } },{...options});
            return updateDishes;
        } catch (error) {
            throw error;
        }
    }
    // update dish_recipes
    async UpdateDishRecipes(data, id, options={}) {
        try {
            const updateDishRecipes = await DishRecipeModel.update(data, { where: { id: id } },{...options});
            return updateDishRecipes;
        } catch (error) {
            throw error;
        }
    }
    async DeleteDishes(id) {
        try {
            const deleteDishes = await DishModel.update({ status: false }, ({ where: { id: id } }));
            return deleteDishes;
        } catch (error) {
            throw error;
        }
    }
    // tạo dish_recipes mới
    async CreateDishRecipes(data, dishes_id, options={}) {
        try {
            const createDishRecipes = await DishRecipeModel.create({dishes_id: dishes_id, ingredient_id: data.ingredient_id, quantity: data.quantity},{...options});
            return createDishRecipes;
        } catch (error) {
            throw error;
        }
    }
    // lấy tất cả món ăn theo status true
    async GetAllDishesTrue(brandID) {
        try {            
            const dishes = await DishModel.findAll({
                 where: { status: true, brand_id: brandID },
                    include: [{
                      model:   DishCategoryModel,
                      attributes: ['name']
                    },{
                        model: UserModel,
                        attributes: ['name']
                    }]
                });
            return dishes;
        } catch (error) {
            throw error;
        }
    }
    async GetAllDishesTrueAI(brandID) {
        try {            
            const dishes = await DishModel.findAll({
                 where: { status: true, brand_id: brandID },
                attributes: ['id', 'name']
                });
            return dishes;
        } catch (error) {
            throw error;
        }
    }
    // lấy tất cả món ăn theo status false
    async GetAllDishesFalse(brandID) {
        try {
            const dishes = await DishModel.findAll({ where: { status: false, brand_id: brandID } });
            return dishes;
        } catch (error) {
            throw error;
        }
    }
    // duyệt món ăn
    async ApproveDishes(id) {
        try {
            const approveDishes = await DishModel.update({ status: true }, { where: { id: id } });
            return approveDishes;
        } catch (error) {
            throw error;
        }
    }
    // get giá món ăn
    async GetPriceDishByID(id) {
        try {
            const dish = await DishModel.findByPk(id);
            return dish.price;
        } catch (error) {
            throw error;
        }
    }
    // get tất cả nguyên liệu của món ăn đó
    async GetIngredientsByDishID(id) {
        try {
            const dishRecipes = await DishRecipeModel.findAll({ where: { dishes_id: id } });
            return dishRecipes;
        } catch (error) {
            throw error;
        }
    }
    // get danh sách món ăn cho kitchen staff
    async GetAllDishesTrueKitchen(brandID) {
        try {
            const dishes = await DishModel.findAll({
                 where: { status: true, brand_id: brandID },
                  attributes: ['id', 'name', 'price',"des"] ,
                  include: [{
                      model:   DishCategoryModel,
                      attributes: ['name']
                    },{
                        model: UserModel,
                        attributes: ['name']
                    }]
                });
            return dishes;
        } catch (error) {
            throw error;
        }
    }
    // tổng món ăn true
    async SumDishesOutputByDate(brandID) {
        try {
            const dishes = await DishModel.count({ where: { status: true, brand_id: brandID } });
            return dishes;
        } catch (error) {
            throw error;
        }
    }
    // danh sách món ăn chờ của userID
    async GetAllDishesFalseByUserID(userID, brand) {
        try {
            const dishes = await DishModel.findAll({
                 where: { status: false, user_id: userID, brand_id: brand },
                 attributes: ['id', 'name', 'price',"des","status"] ,
                 include: [{
                      model:   DishCategoryModel,
                      attributes: ['name']
                    }]
                });
            return dishes;
        } catch (error) {
            throw error;
        }
    }
    // all ingredient by dishID form dish_recipes
    async GetRecipesIngredientsByDishID(id) {
        try {
            const dishRecipes = await DishRecipeModel.findAll({ 
                where: { dishes_id: id },
                attributes: ["id",'ingredient_id', 'quantity'],
                include: [{
                    model:   IngredientModel,
                    attributes: ['name','unit']
                  }]
             });
            return dishRecipes;
        } catch (error) {
            throw error;
        }
    }
    // check recipesID 
    async CheckDishRecipesID(id) {
        try {
            const dishRecipes = await DishRecipeModel.findOne({ where: { id: id } });
            return dishRecipes;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new DishesRepository();
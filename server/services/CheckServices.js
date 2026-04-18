const AuthRepository = require("../repository/AuthRepository");
const CheckRepository = require("../repository/CheckRepostory");
const ApiError = require("../utils/ApiError");
const ErrorMessageBase = require("../utils/ErrorMessageBase");
const bcrypt = require('bcryptjs'); 
class CheckServices {
    async checkMailExit(email) {
        try {
            if (!email){
                throw ApiError.ValidationError(ErrorMessageBase.format(ErrorMessageBase.REQUIRED, { PropertyName: "email" }));
            }
            // check email tồn tại
            const dataEmail =email.toLowerCase().trim();
            const check = await AuthRepository.SelectMail(dataEmail);
            if(check){
                throw ApiError.ValidationError(ErrorMessageBase.format(ErrorMessageBase.EXIST, { PropertyName: "email" }));
            }
            return true
        } catch (error) {
            throw error;
        }
    }
    // check pass and mail
    async checkMailPass(email, password) {
        try {
            const dataEmail =email.toLowerCase().trim();
            const user =  await AuthRepository.SelectMail(dataEmail);
            await this.checkBrand(user.brand?.id);
            const check = await this.checkHash(password, user.password);
            if(!user || !check){
                throw ApiError.Unauthorized("Invalid email or password");
            }
            return user;
        } catch (error) {
            throw error;
        }
    }
    async hashPassword (password) {
        try {
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const hash = await bcrypt.hash(password, salt);
            return hash;
        } catch (error) {
            throw error;
        }
    }
    async checkHash(password, hash) {
        try {
            const isMatch = await bcrypt.compare(password, hash);
            if(isMatch){
                return true;
            }
            return false;
        } catch (error) {
            throw error;
        }
    }
    // check user có tồn tại và đang hoạt động hay không
    async checkUserActive(id) {
        try {
            const user = await AuthRepository.checkUserActive(id);
            if(!user){
                throw ApiError.Unauthorized("User is not active");
            }
            return user
        } catch (error) {
            throw error;
        }
    }
    // check category của ingredient
    async checkCategoryIngredient(id) {
        try {
            const category = await CheckRepository.checkCategoryIngredient(id);
            if(!category){
                throw ApiError.NotFound("Category not found");
            }
            return category
        } catch (error) {
            throw error;
        }
    }
    // check category của dishes
    async checkCategoryDishes(id) {
        try {
            const category = await CheckRepository.checkCategoryDishes(id);
            if(!category){
                throw ApiError.NotFound("Category not found");
            }
            return category
        } catch (error) {
            throw error;
        }
    }
    // check id dish có tồn tại hay không
    async checkDish(id) {
        try {
            const dish = await CheckRepository.checkDish(id);
            if(!dish){
                throw ApiError.NotFound("Dish not found");
            }
            return dish
        } catch (error) {
            throw error;
        }
    }
    // check brand
    async checkBrand(id) {
        try {
            const brand = await CheckRepository.checkBrand(id);
            if(!brand){
                throw ApiError.NotFound("Brand not found");
            }
            return brand
        } catch (error) {
            throw error;
        }
    }
    async checkAdmin(email,password) {
        try {
            const dataEmail =email.toLowerCase().trim();
            const user =  await AuthRepository.checkUserAdmin(dataEmail);
            const check = await this.checkHash(password, user.password);
            if(!user || !check){
                throw ApiError.Unauthorized("Invalid email or password");
            }
            return user;
        } catch (error) {
            throw error;
        }
    }
    async checkRole(id){
        try {
            const role = await CheckRepository.checkRole(id);
            if(!role){
                throw ApiError.NotFound("Role not found");
            }
            // console.log(role);
            return role?.roles?.name
        } catch (error) {
            throw error;
        }
    }
}
module.exports = new CheckServices();
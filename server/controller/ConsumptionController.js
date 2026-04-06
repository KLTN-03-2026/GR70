const ApiError = require("../utils/ApiError");
const ApiSuccess = require("../utils/ApiSuccess");
const DailyServices = require("../services/DailyServices");
const DailyRepository = require("../repository/DailyRepository");
const DishesRepository = require("../repository/DishesRepository");

exports.sumCustomerAsLastMonth = async (req, res, next) => {
    try {
        const brandID = req.user.brandID;
        const result = await DailyRepository.GetCustomerCountByMonth(brandID);
        return res.json(ApiSuccess.getSelect("Customer count", result));
    } catch (error) {
        return next(error);
    }
};

// danh sách số lượng khách hằng ngày trong 1 tháng
exports.ListCustomerInMonth = async (req, res, next) => {
    try {
        const brandID = req.user.brandID;
        const month = await DailyServices.checkMonth();
        const result = await DailyRepository.GetCustomerCountAndRevenueByMonth(brandID, month);
        return res.json(ApiSuccess.getSelect("Customer count", result));
    } catch (error) {
        return next(error);
    }
};

// tổng danh sách món ăn true và danh sách món ăn bán ra trong ngày hôm qua
exports.GetDishesOutputByDate = async function (req, res, next) {
    try {
        const brandID = req.user.brandID;
        const sumDish = await DishesRepository.SumDishesOutputByDate(brandID);
        const dishesOutput = await DailyRepository.GetDishesOutputByLastDate(brandID);
        const result ={
            sumDish: sumDish,
            dishesOutput: dishesOutput
        }
        return res.json(ApiSuccess.getSelect("Dishes Output list", result));
    } catch (error) {
        return next(error);
    }
};
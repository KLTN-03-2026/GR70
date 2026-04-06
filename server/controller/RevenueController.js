const ApiSuccess = require("../utils/ApiSuccess");
const ApiErorr = require("../utils/ApiError");
const DailyRepository = require("../repository/DailyRepository");
const DailyServices = require("../services/DailyServices");
// tổng doanh thu hôm nay
exports.SumRevenueYesterday = async function (req, res, next) {
    try {
        const brandID = req.user.brandID;
        const result = await DailyRepository.SumRevenueYesterday(brandID);
        return res.json(ApiSuccess.getSelect("Sum revenue yesterday", result));
    } catch (error) {
        return next(error);
    }
}
// tố doanh thu tháng nay
exports.SumRevenueByMonth = async function (req, res, next) {
    try {
        const brandID = req.user.brandID;
        const month = await DailyServices.checkMonth();
        const result = await DailyRepository.SumRevenueByMonth(brandID, month);
        return res.json(ApiSuccess.getSelect("Sum revenue by month", result));
    } catch (error) {
        return next(error);
    }
}
// chi tiết giao dịch trong tháng nay
exports.TransactionByMonth = async function (req, res, next) {
    try {
        const brandID = req.user.brandID;
        const month = await DailyServices.checkMonth();
        const result = await DailyRepository.TransactionByMonth(brandID, month);
        return res.json(ApiSuccess.getSelect("Transaction by month", result));
    } catch (error) {
        return next(error);
    }
}
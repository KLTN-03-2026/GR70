const ApiSuccess = require("../utils/ApiSuccess");
const ApiErorr = require("../utils/ApiError");
const ReportWasteRepository = require("../repository/ReportWasteRepository");
const DailyServices = require("../services/DailyServices");
// tỉ lệ lãng phí nguyên liệu
exports.getPrecenIngredient = async (req, res, next) => {
    try {
        const brandID = req.user.brandID;
        const month = await DailyServices.checkMonth();
        const result = await ReportWasteRepository.getPrecenIngredientByMonth(brandID, month.startDate, month.endDate);
        return res.json(ApiSuccess.getSelect("Precen ingredient", result));
    } catch (error) {
        return next(error);
    }
};
// tổn thất thiệt hại doanh thu
exports.getRevenueLossByMonth = async (req, res, next) => {
    try {
        const brandID = req.user.brandID;
        const month = await DailyServices.checkMonth();
        const result = await ReportWasteRepository.getRevenueLossByMonth(brandID, month.startDate, month.endDate);
        return res.json(ApiSuccess.getSelect("Revenue by month", result));
    } catch (error) {
        return next(error);
    }
};
// tỉ lệ giảm so với tháng trước
exports.getPercentLossByMonth = async (req, res, next) => {
    try {
        const brandID = req.user.brandID;
        const month = await DailyServices.checkMonth();
        const result = await ReportWasteRepository.getWasteTrendByMonth(brandID, month.startDate, month.endDate);
        return res.json(ApiSuccess.getSelect("Percent loss by month", result));
    } catch (error) {
        return next(error);
    }
}
// top 5 nguyên liệu lãng phí nhất
exports.getTop5WastedIngredients = async (req, res, next) => {
    try {
        const brandID = req.user.brandID;
        const month = await DailyServices.checkMonth();
        const result = await ReportWasteRepository.getTop5WastedIngredients(brandID, month.startDate, month.endDate);
        return res.json(ApiSuccess.getSelect("Top 5 wasted ingredients", result));
    } catch (error) {
        return next(error);
    }
};
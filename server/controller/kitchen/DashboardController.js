const ApiError = require("../../utils/ApiError");
const ApiSuccess = require("../../utils/ApiSuccess");
const dashboardRepository = require("../../repository/DashboardRepository");
// báo cáo phần trăm lãng phí của ngày hôm qua
exports.ReportPayYesterday = async function (req, res, next) {
    try {
        const brandID = req.user.brandID;
        const response = await dashboardRepository.getPayDishYesterday(brandID);
        return res.json(ApiSuccess.getSelect("Report Pay Yesterday", response));
    } catch (error) {
        return next(error);
    }
}
// món dư nhiều nhất hôm qua
exports.ReportLeftoverDishes = async function (req, res, next) {
    try {
        const brandID = req.user.brandID;
        const response = await dashboardRepository.getPayDishYesterdayByDate(brandID);
        return res.json(ApiSuccess.getSelect("Report Pay Yesterday", response));
    } catch (error) {
        return next(error);
    }
}
// bảng cảnh báo chi tiết món
exports.ReportWarningDishTable = async function (req, res, next) {
    try {
        const brandID = req.user.brandID;
        const response = await dashboardRepository.getWarningDishTableYesterday(brandID);
        return res.json(ApiSuccess.getSelect("Report Pay Yesterday", response));
    } catch (error) {
        return next(error);
    }
}
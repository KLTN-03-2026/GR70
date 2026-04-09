const ApiSuccess = require("../../utils/ApiSuccess");
const ApiError = require("../../utils/ApiError");
const dashboardRepository = require("../../repository/DashboardAdminRepository");
// tổng số cửa hàng hoạt động
exports.ReportBrandActive = async function (req, res, next) {
    try {
        const response = await dashboardRepository.CountBrandActive();
        return res.json(ApiSuccess.getSelect("Report Brand Active", response));
    } catch (error) {
        return next(error);
    }
};
// tài khoản đang hoạt động
exports.ReportUserActive = async function (req, res, next) {
    try {
        const response = await dashboardRepository.CountUserActive();
        return res.json(ApiSuccess.getSelect("Report User Active", response));
    } catch (error) {
        return next(error);
    }
};
// % lãng phí món ăn của hệ thống
exports.ReportPrecentWasteDish = async function (req, res, next) {
    try {
        const response = await dashboardRepository.precentWasteDishOnMonth();
        return res.json(ApiSuccess.getSelect("Report Precent Waste Dish", response));
    } catch (error) {
        return next(error);
    }
};

// báo cáo cửa hàng có lãng phí cao hiện tại > 15
exports.ReportBrandWasteDish = async function (req, res, next) {
    try {
        const response = await dashboardRepository.ReportBrandWasteDish();
        return res.json(ApiSuccess.getSelect("Report Brand Waste Dish", response));
    } catch (error) {
        return next(error);
    }
}
// báo cáo của tất cả cửa hàng lãng phí hiện tại
exports.ReportAllBrandWasteDish = async function (req, res, next) {
    try {
        const response = await dashboardRepository.ReportBrandWasteDish(0);
        return res.json(ApiSuccess.getSelect("Report All Brand Waste Dish", response));
    } catch (error) {
        return next(error);
    }
}
const ApiSuccess = require("../../utils/ApiSuccess");
const ApiError = require("../../utils/ApiError");
const dashboardRepository = require("../../repository/DashboardRepository");
// tổng số cửa hàng hoạt động
exports.ReportBrandActive = async function (req, res, next) {
    try {
        const response = await dashboardRepository.getBrandActive();
        return res.json(ApiSuccess.getSelect("Report Brand Active", response));
    } catch (error) {
        return next(error);
    }
};
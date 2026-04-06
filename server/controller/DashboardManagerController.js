const ApiError = require("../utils/ApiError");
const ApiSuccess = require("../utils/ApiSuccess");
const CheckServices = require("../services/CheckServices");
const DailyServices = require("../services/DailyServices");
const DashboardRepository = require("../repository/DashboardRepository");

exports.GetReportDishes = async function (req, res, next) {
    try {
        const brandID = req.user.brandID;
        if (!brandID) {
            throw ApiError.ValidationError("Missing required field brandID");
        }
        const checkBrand = await CheckServices.checkBrand(brandID);
        if (!checkBrand) {
            throw ApiError.ValidationError("Brand not found with id: " + brandID);
        }
        const reportDishes = await DashboardRepository.getSumDishes(brandID);
        return res.json(ApiSuccess.getSelect("Report dishes", reportDishes));
    } catch (error) {
        return next(error);
    }
};
// tổng doanh thu của 1 tháng
exports.GetReportRevenue = async function (req, res, next) {
    try {
        const brandID = req.user.brandID;
        if (!brandID) {
            throw ApiError.ValidationError("Missing required field brandID");
        }
        const checkBrand = await CheckServices.checkBrand(brandID);
        if (!checkBrand) {
            throw ApiError.ValidationError("Brand not found with id: " + brandID);
        }
        // Get current month date range using checkMonth for consistency
        const monthRange = await DailyServices.checkMonth();
        
        const reportRevenue = await DashboardRepository.getPayDish1Month(brandID, monthRange);
        return res.json(ApiSuccess.getSelect("Report revenue", reportRevenue.total_revenue));
    } catch (error) {
        return next(error);
    }
};
// báo cáo phần trăm lãng phí của 7 ngày gần nhất
exports.GetReportWaste = async function (req, res, next) {
    try {
        const brandID = req.user.brandID;
        if (!brandID) {
            throw ApiError.ValidationError("Missing required field brandID");
        }
        const checkBrand = await CheckServices.checkBrand(brandID);
        if (!checkBrand) {
            throw ApiError.ValidationError("Brand not found with id: " + brandID);
        }
        const reportWaste = await DashboardRepository.getPayDish7Day(brandID);
        const totalDishes = reportWaste.total_prepared + reportWaste.total_wasted;
        const wastePercentage = totalDishes > 0 ? (reportWaste.total_wasted / totalDishes) * 100 : 0;
        return res.json(ApiSuccess.getSelect("Report waste",wastePercentage.toFixed(2) + "%"));
    } catch (error) {
        return next(error);
    }
};
// thông báo nguyên liệu sắp hết
exports.GetLowStockIngredients = async function (req, res, next) {
    try {
        const brandID = req.user.brandID;
        if (!brandID) {
            throw ApiError.ValidationError("Missing required field brandID");
        }
        const checkBrand = await CheckServices.checkBrand(brandID);
        if (!checkBrand) {
            throw ApiError.ValidationError("Brand not found with id: " + brandID);
        }
        const lowStockIngredients = await DashboardRepository.getLowStockIngredients(brandID);
        return res.json(ApiSuccess.getSelect("Low stock ingredients", lowStockIngredients));
    } catch (error) {
        return next(error);
    }
};
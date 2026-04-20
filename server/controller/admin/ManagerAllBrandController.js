const ApiSuccess = require("../../utils/ApiSuccess");
const ApiError = require("../../utils/ApiError");
const ManagerAllBrandRepository = require("../../repository/admin/ManagerAllBrandRepository");
exports.getAllBrand = async (req, res,next) => {
    try {
        const page = req.query.page || 1;
        const size = req.query.size || 10;
        const filters ={
            search: req.query.search || "",
            status: req.query.status || undefined,
            province: req.query.province || undefined
        }
        const brand = await ManagerAllBrandRepository.getAllBrand({
            page,
            size,
            filters,
            // orderBy: req.query.orderBy || "id",
            // order: req.query.orderType === "1" ? "ASC" : "DESC",
        });
        res.json(ApiSuccess.getSelect("Get all brand", brand));
    } catch (error) {
        return next(error);
    }
};
exports.getDetailBrand = async (req, res, next) => {
    try {
        const brandID = req.params.brandID;
        const year = new Date().getFullYear();
        const [brand, dish, revenue] = await Promise.all([
            ManagerAllBrandRepository.getDetailBrand(brandID),
            ManagerAllBrandRepository.SumDishBrand(brandID),
            ManagerAllBrandRepository.SumRevenueYearBrand(brandID, year)
        ])
        const result ={
            brand: brand,
            dish: dish,
            revenue: revenue
        }
        res.json(ApiSuccess.getSelect("Get detail brand", result));
    } catch (error) {
        return next(error);
    }
};

exports.lockBrand = async (req, res, next) => {
    try {
        const brandID = req.params.brandID;
        const checkStatus = await ManagerAllBrandRepository.checkStatusBrand(brandID);
        if(checkStatus.status === false){
            throw ApiError.Notification("Brand is locked");
        }
        const result = await ManagerAllBrandRepository.lockBrand(brandID);
        res.json(ApiSuccess.updateStatus("Lock brand", result));
    } catch (error) {
        return next(error);
    }
};
exports.unLockBrand = async (req, res, next) => {
    try {
        const brandID = req.params.brandID;
        const checkStatus = await ManagerAllBrandRepository.checkStatusBrand(brandID);
        if(checkStatus.status === true){
            throw ApiError.Notification("Brand is not locked");
        }
        const result = await ManagerAllBrandRepository.unlockBrand(brandID);
        return next(error);
    }catch (error) {
        return next(error);
    }
};
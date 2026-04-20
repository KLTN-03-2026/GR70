const ApiError = require("../../utils/ApiError");
const ApiSuccess = require("../../utils/ApiSuccess");
const ManagerAccountRepository = require("../../repository/admin/AcountRepository");
exports.getSumAccount = async (req, res, next) => {
    try {
        const [sumAccount, sumManager, sumKitchen, sumBrand] = await Promise.all([
            ManagerAccountRepository.SumAccount(),
            ManagerAccountRepository.SumManager(),
            ManagerAccountRepository.SumKitchen(),
            ManagerAccountRepository.SumBrand()
            ]);

            const result = {
            sumAccount,
            sumManager,
            sumKitchen,
            sumBrand
            };
        return res.json(ApiSuccess.getSelect("Sum account", result));
    } catch (error) {
        return next(error);
    }
}
exports.getListUserForBrand = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;
        const filters = {
            rolebrand: req.query.rolebrand || undefined
        }
        const result = await ManagerAccountRepository.getListBrand({
            page,
            size,
            filters,
            // order: req.query.orderType === "1" ? "ASC" : "DESC",
        });
        return res.json(ApiSuccess.getSelect("List user for brand", result));
    } catch (error) {
        return next(error);
    }
}
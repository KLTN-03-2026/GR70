const ApiError = require("../../utils/ApiError");
const ApiSuccess = require("../../utils/ApiSuccess");
const CheckServices = require("../../services/CheckServices");
const DailyRepository = require("../../repository/DailyRepository");
// cập nhập số lượng khách hàng trong ngày
exports.UpdateCustomerCount = async function (req, res, next) {
  try {
    const customer_count = req.body.customer_count;
    const brandID = req.user.brandID;
    if (!customer_count || customer_count < 0) {
      throw ApiError.ValidationError("Customer count must be a positive number");
    }
    await CheckServices.checkBrand(brandID);
    const updateCustomer = await DailyRepository.UpdateCustomerCount(brandID, customer_count);
    return res.json(ApiSuccess.updated("Customer count updated successfully"));
  } catch (error) {
    return next(error);
  }
};
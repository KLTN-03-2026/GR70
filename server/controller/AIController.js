const { connectAI } = require("../config/connectAI");
const ApiSuccess = require("../utils/ApiSuccess");
const ApiErorr = require("../utils/ApiError");
const AIRepository = require("../repository/AIRepository");
const checkRepository = require("../repository/CheckRepostory");

exports.WasteLessAI = async (req, res, next) => {
  try {
    const brandID =req.user.brandID;
    if(!brandID){
        throw ApiError.Unauthorized("Brand ID is required");
    }
    await checkRepository.checkBrand(brandID);
    const result = await AIRepository.getAi_Analysis_By_BrandID(brandID);
    return res.json(ApiSuccess.getSelect("AI", result));
  } catch (error) {
    return next(error);
  }
};
// lấy dữ liệu phân tích của AI về số lượng khách hàng theo ngày
exports.CustomerAI = async (req, res, next) => {
    try {
        const brandID =req.user.brandID;
        if(!brandID){
            throw ApiError.Unauthorized("Brand ID is required");
        }
        await checkRepository.checkBrand(brandID);
        const result = await AIRepository.getAi_Analysis_Customer_By_BrandID(brandID);
        return res.json(ApiSuccess.getSelect("AI", result));
    } catch (error) {
        return next(error);
    }
};

const jwt= require('jsonwebtoken');
// const ENV = require('../config/env.js');
const logger = require('../utils/log.js');
const ApiError = require("../utils/ApiError");
const checkServices = require("../services/CheckServices");
module.exports =async function authenticate (req, res, next) {
    try {
         if (!process.env.JWT_SECRET) {
            logger.error("🚨 Lỗi cấu hình: JWT_SECRET chưa được set trong biến môi trường.");
            return next(new ApiError("Cấu hình hệ thống chưa đày đủ."));
        }

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            logger.warn(`❌ Không tìm thấy Bearer token | IP: ${req.ip} | URL: ${req.originalUrl}`);
            return next(ApiError.Unauthorized());
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            logger.warn(`❌ Token trống | IP: ${req.ip} | URL: ${req.originalUrl}`);
            return next(ApiError.Unauthorized("Token không hợp lệ"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.userId) {
            logger.warn(`⚠️ Token hợp lệ nhưng thiếu userId | Token: ${token.slice(0, 10)}...`);
            return next(ApiError.Unauthorized("Thông tin người dùng không hợp lệ."));
        }

        logger.info(`✅ Xác thực thành công | userId: ${decoded.userId} | IP: ${req.ip}`);
        await checkServices.checkBrand(decoded.brandID);
        await checkServices.checkUserActive(decoded.userId);
        req.user = decoded; // lưu thông tin người dùng vào request
        next();
    } catch (error) {
        handleJwtError(error, req, res, next);
    }
}
    
function handleJwtError(error, req, res, next) {
    if (error instanceof jwt.TokenExpiredError) {
        logger.warn(`⏳ Token hết hạn | IP: ${req.ip} | URL: ${req.originalUrl}`);
        return next(ApiError.Unauthorized("Token đã hết hạn, vui lòng đăng nhập lại."));
    }

    if (error instanceof jwt.JsonWebTokenError) {
        logger.warn(`❌ Token không hợp lệ | IP: ${req.ip} | URL: ${req.originalUrl}`);
        return next(ApiError.Unauthorized("Token không hợp lệ, vui lòng đăng nhập lại."));
    }

    logger.error(`⚠️ Lỗi xác thực không xác định: ${error.message} | IP: ${req.ip}`);
     return next(ApiError.Internal());
}
// middleware/responseHandler.js
const ApiSuccess = require("../utils/ApiSuccess");

function responseHandler(req, res, next) {
  // giữ lại hàm res.json gốc
  const originalJson = res.json.bind(res);

  res.json = (data) => {
    // Nếu controller đã gửi success = true theo chuẩn ApiSuccess thì thôi
    if (data && data.success === true) {
      return originalJson(data);
    }
    // Nếu là ApiError (có type và status), không can thiệp - để errorHandler xử lý
    if (data && data.type && typeof data.status === "number") {
      return originalJson(data);
    }
    // Còn nếu controller chỉ gửi raw data thì tự bọc lại thành ApiSuccess
    return originalJson(
      ApiSuccess.response({
        data,
      }),
    );
  };

  next();
}

module.exports = responseHandler;

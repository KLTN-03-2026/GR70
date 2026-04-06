// utils/ApiError.js
class ApiError extends Error {
    constructor(type, message, status, errors = []) {
        super(message);
        this.type = type;
        this.status = status;
        this.errors = errors;
    }

    static ValidationError(errors) {
        return new ApiError(
            "BadRequest",
            "Dữ liệu gửi lên không hợp lệ",
            400,
            errors
        );
    }

    static NotFound(message = "Không tìm thấy dữ liệu") {
        return new ApiError("NotFound", message, 404);
    }

    static Unauthorized(message = "Bạn chưa đăng nhập hoặc token khôn hợp lệ") {
        return new ApiError("Unauthorized", message, 401);
    }

    static Forbidden(message = "Bạn không có quyền truy cập") {
        return new ApiError("Forbidden", message, 403);
    }
    static BadConnection(message = "Lỗi server") {
        return new ApiError("BadConnection", message, 402);
    }
    static Internal(message = "Lỗi server") {
        return new ApiError("InternalServerError", message, 500);
    }
    static Notification(message = "Thông báo") {
        return new ApiError("Notification", message, 200);
    }
}

module.exports = ApiError;

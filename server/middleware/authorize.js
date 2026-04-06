const ApiError = require("../utils/ApiError");
const { UserModel, RoleModel } = require("../models/index");
module.exports = function authorize(requiredPermissions = []) {
  return async function (req, res, next) {
    try {
      const userID = req.user?.userId; // Giả sử bạn lưu ID người dùng trong req.user sau khi xác thực
      if (!userID) {
        return next(ApiError.Unauthorized());
      }

      if (requiredPermissions.length === 0) {
        return next(); // Không yêu cầu quyền cụ thể → cho qua
      }

      // Lấy quyền của user từ DB
      const result = await UserModel.findByPk(userID, {
        include: [
          {
            model: RoleModel,
            attributes: ["name"],
          },
        ],
      });
      if (!result) {
        return next(ApiError.Unauthorized());
      }
      const Roles = result.roles.map((role) => role.name) || [];
      // console.log(Roles);

      // Kiểm tra quyền
      const hasPermission = Roles.some((role) =>
        requiredPermissions.includes(role),
      );

      if (!hasPermission) {
        return next(ApiError.Forbidden());
      }
      next();
    } catch (err) {
      console.error(err);
      return next(ApiError.Internal());
    }
  };
};

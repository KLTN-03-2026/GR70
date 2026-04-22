const ApiError = require("../utils/ApiError");
const ApiSuccess = require("../utils/ApiSuccess");
const UserRepository = require("../repository/UserRepository");
const AuthRepository = require("../repository/AuthRepository");
const ChatRepository = require("../repository/ChatRepository");
const CheckServices = require("../services/CheckServices");
const sequelize = require("../config/connectData");
exports.GetInfoUser = async function (req, res, next) {
  try {
    const userId = req.params.id;

    const user = await UserRepository.InfoUser(userId);
    if (!user) {
      throw ApiError.NotFound("User not found");
    }
    return res.json(ApiSuccess.getSelect("User information", user));
  } catch (error) {
    return next(error);
  }
};
// thêm nhân viên role Kitchen
exports.RegisterKitchen = async function (req, res, next) {
  const t = await sequelize.transaction();
  try {
    const data = req.body;
    const userID = req.params.id;
    if (!data.email || !data.password || !data.name || !userID) {
      throw ApiError.ValidationError("Missing required fields");
    }
    const checkuser = await CheckServices.checkUserActive(userID);
    if (!checkuser) {
      throw ApiError.Unauthorized("User is not active");
    }
    await CheckServices.checkMailExit(data.email);
    data.password = await CheckServices.hashPassword(data.password);
    data.status = true;
    // console.log(checkuser.brand.id);
    // lấy tất cả user kitchen cùng brand
    const listKichen = await AuthRepository.getKitchenList(checkuser.brand.id);
    const createKitchen = await AuthRepository.createUser(
      data,
      checkuser.brand.id,
      { transaction: t },
    );
    const roleKitchen = process.env.ROLE_KITCHEN;
    await AuthRepository.createRole(createKitchen.id, roleKitchen, {
      transaction: t,
    });
    await ChatRepository.createChat(userID, createKitchen.id, {
      transaction: t,
    });
    // tạo các đoạn chát của nhân viên với nhân viên mới
    await Promise.all(
      listKichen.map(async (item) => {
        await ChatRepository.createChat(item.id, createKitchen.id, {
          transaction: t,
        });
      }),
    );
    await t.commit();
    return res.json(
      ApiSuccess.created("Kitchen staff registered successfully"),
    );
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    return next(error);
  }
};
// cập nhập thông tin nhân viên role Kitchen
exports.UpdateKitchen = async function (req, res, next) {
  const t = await sequelize.transaction();
  try {
    const data = req.body;
    const userID = req.params.id;
    const checkuser = await CheckServices.checkUserActive(userID);
    if (!checkuser) {
      throw ApiError.Unauthorized("User is not active");
    }
    // Chỉ kiểm tra email nếu email khác email hiện tại
    if (data.email && data.email !== checkuser.email) {
      await CheckServices.checkMailExit(data.email);
    }
    const updateKitchen = await AuthRepository.updateUser(data, userID, {
      transaction: t,
    });
    if (!updateKitchen[0]) {
      throw ApiError.NotFound("Failed to update user");
    }
    await t.commit();
    return res.json(ApiSuccess.updated("Kitchen staff updated successfully"));
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    return next(error);
  }
};
// khóa tài khoản nhân viên role Kitchen
exports.LockKitchen = async function (req, res, next) {
  try {
    const userID = req.params.id;
    const checkuser = await CheckServices.checkUserActive(userID);
    if (!checkuser) {
        // console.log("checkusser");
      throw ApiError.Unauthorized("User is not active");
    }
    if (checkuser.roles.some((role) => role.name === "Manager" || role.name === "Admin",)) {
        // console.log("user:",checkuser.roles);
      throw ApiError.Unauthorized("You cannot lock a Manager account");
    }
    const [affectedCount] = await UserRepository.lockOrUnlockUser(
      userID,
      false,
    );
    // console.log("update result =", affectedCount);
    if (affectedCount === 0) {
      throw ApiError.NotFound("User not found or already locked");
    }
    return res.json(ApiSuccess.updated("Kitchen staff locked successfully"));
  } catch (error) {
    return next(error);
  }
};
// mở khóa tài khoản nhân viên role Kitchen
exports.UnlockKitchen = async function (req, res, next) {
  try {
    const userID = req.params.id;
    const checkuser = await CheckServices.checkStautsUser(userID);
    if (!checkuser) {
      throw ApiError.Unauthorized("User is not active");
    }
    if(checkuser.status===true){
        throw ApiError.Notification("User is already unlocked");
    }
    const [affectedCount] = await UserRepository.lockOrUnlockUser(userID, true);
    if (affectedCount === 0) {
      throw ApiError.NotFound("User not found or already unlocked");
    }
    return res.json(ApiSuccess.updated("Kitchen staff unlocked successfully"));
  } catch (error) {
    return next(error);
  }
};
// lấy danh sách nhân viên role Kitchen
exports.GetKitchenStaff = async function (req, res, next) {
  try {
    const brandID = req.user.brandID;
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    if(!brandID){
        throw ApiError.Unauthorized("Brand ID is required");
    }
    const getKitchenStaff = await UserRepository.getKitchenStaff(brandID,{
      page,
      size,
      orderBy: req.query.orderBy || "created_at",
      order: req.query.orderType === "1" ? "ASC" : "DESC",
    });
    return res.json(ApiSuccess.getSelect("Kitchen staff list", getKitchenStaff));
  } catch (error) {
    return next(error);
  }
};
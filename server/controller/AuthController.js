const ApiSuccess = require("../utils/ApiSuccess");
const ApiError = require("../utils/ApiError");
// const cloudinary=require("../config/connectCloudinary")
const CheckServices = require("../services/CheckServices");
const AuthRepository = require("../repository/AuthRepository");
const ChatRepository = require("../repository/ChatRepository");
// const sendVerificationEmail = require("../utils/sendMail");
const sequelize = require("../config/connectData");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const authServices = require("../services/AuthServices");
const checkServices = require("../services/CheckServices");
const { log } = require("console");
 const tempUsers = new Map();
 const MAX_AGE = 15 * 60 * 1000; // 15 phút
exports.register=async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const data =req.body;
        const brand={
            name: data.nameBrand,
            address: data.addressBrand
        }
        if(!brand.name || !brand.address){
            throw ApiError.ValidationError("Brand name and address are required");
        }
        // check email tồn tại
        data.email = data.email.toLowerCase().trim();
        await CheckServices.checkMailExit(data.email);
        // hash password
        data.password = await CheckServices.hashPassword(data.password);
        data.status=true;
        const newBrand = await AuthRepository.createBrand(brand, { transaction: t });
        // tạo lưu user//
        const newUser = await AuthRepository.createUser(data, newBrand.id , { transaction: t });
        //  gán role manager
        const roleManager=process.env.ROLE_MANAGER;
        const adminID = process.env.ADMIN_ID;
        await AuthRepository.createRole(newUser.id, roleManager, { transaction: t });
        // tạo group chat
        await ChatRepository.createChat(adminID, newUser.id, { transaction: t });
        await t.commit();
        return res.json(ApiSuccess.created("User registered successfully"));
    } catch (error) {
      if(!t.finished){
        await t.rollback();
      }
        return next(error);
    }
};
    // xác thực mail
exports.verifiMail = async (req, res, next) => {
      const token = req.query.token;
    const temuser = tempUsers.get(token);
    const t = await sequelize.transaction();
    try {
        if (!temuser) {
            throw ApiError.Unauthorized();
        }
        // kiểm tra token có hết hạn ko
        if (Date.now() - temuser.createdAt > MAX_AGE) {
            // xóa user tạm
            tempUsers.delete(token);
            throw ApiError.Unauthorized("Token has expired. Please register again.");
        }
        // desTeamUser = temuser;
        // await AuthRepository.createUser(temuser);
        const newUser = await AuthRepository.createUser(temuser,{ transaction: t });
        await AuthRepository.createAccount(newUser.id, temuser.password, temuser.email, { transaction: t });
        const roleID='d4fcfda6-b21d-4128-982b-46b7230634b9';
        await AuthRepository.createRole(newUser.id, roleID, { transaction: t }); // gán role user
        // xóa user tạm
        tempUsers.delete(token);
        await t.commit();
        return res.json(ApiSuccess.Notification("Email verified successfully"));
    } catch (error) {
        await t.rollback();
        if(temuser?.publicimage){
          await cloudinary.uploader.destroy(temuser.publicimage);
        }
        return next(error);
    }
}

// login
exports.login= async (req, res, next) => {
    try {
        const data = req.body;
        let user;
        let token;
        if(data.email.trim() ==="admin@gmail.com"){
           user=await CheckServices.checkAdmin(data.email,data.password);
           await AuthRepository.deleteRefreshToken(user.id);
          token = jwt.sign(
            { userId: user.id, role: user.roles[0].name, name: user.name, email: user.email},
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
            );
        }else{
             user = await CheckServices.checkMailPass(data.email, data.password);
            // console.log("user", user.brand.id);
            // xóa refresh token cũ nếu có
            await AuthRepository.deleteRefreshToken(user.id);
            // access token (sống ngắn, ví dụ 1 giờ)
             token = jwt.sign(
            { userId: user.id, role: user.roles[0].name, name: user.name, email: user.email, brandID: user.brand?.id},
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
            );
        }
        // // refresh token (sống lâu hơn, ví dụ 7 ngày)
        const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "20d" }
        );
        // lưu refresh token vào db
        await AuthRepository.saveRefreshToken(refreshToken, user.id);
        // gửi token về client
        return res.json(ApiSuccess.getSelect("Login",token));
    } catch (error) {
        return next(error);
    }
};

// refresh token
exports.refreshToken= async (req, res, next) => {
    try {
    const { token, id } = req.body;
    if (!token || !id) {
      return ApiError.Unauthorized();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.userId) {
            logger.warn(`⚠️ Token hợp lệ nhưng thiếu userId | Token: ${token.slice(0, 10)}...`);
            return next(ApiError.Unauthorized("Thông tin người dùng không hợp lệ."));
        }
    // Kiểm tra refresh token có trong DB không
    const isValid = await authServices.checkRefreshToken(id);
    // kiểm tra user còn active không
   await CheckServices.checkUserActive(decoded.userId);
    // console.log("isValid: ", isValid.rows[0].token);
    if (!isValid) {
      return ApiError.Forbidden("Refresh token không hợp lệ");
    }
    // Verify refresh token
    jwt.verify(isValid.token, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
      if (err) {
        return ApiError.Forbidden("Refresh token hết hạn");
      }
      // Tạo access token mới
      const newAccessToken = jwt.sign(
        { userId: user.userId, role: decoded.role, name: decoded.name, email: decoded.email, brandID: decoded.brandID },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );
      return res.json({
        success: true,
        accessToken: newAccessToken,
      });
    });
  } catch (error) {
    // logger.error(`Lỗi khi refresh token: ${error.message}`);
    return next(error);
  }
};

// logout controller
exports.logout = async (req, res, next) => {
  try {
    const id = req.params.id;
    await authServices.deleteRefreshToken(id);
    return res.json(ApiSuccess.deleted("Refresh token"));
  } catch (error) {
    return next(error);
  }
};
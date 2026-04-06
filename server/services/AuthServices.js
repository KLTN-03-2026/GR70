const AuthRepository = require('../repository/AuthRepository');
const ApiError = require('../utils/ApiError');

class AuthServices{
    async checkRefreshToken(id) {
    try {
        return await AuthRepository.checkRefreshToken(id);
    } catch (error) {
        return ApiError.BadConnection();
    }
    }
    async deleteRefreshToken(id) {
    try {
        return await AuthRepository.deleteRefreshToken(id);
    } catch (error) {
        return ApiError.BadConnection();
    }
    }
}

module.exports = new AuthServices();
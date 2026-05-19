const ChatRepository = require("../repository/ChatRepository");
const ApiError = require("../utils/ApiError");
class ChatServices {
    async checkMessage(id){
        try {
            if(!id){
                throw ApiError.ValidationError("ID tin nhan la bat buoc");
            }
            const message = await ChatRepository.chetMessage(id);
            if(!message){
                throw ApiError.NotFound("Khong tim thay tin nhan");
            }
            return message;
        } catch (error) {
            
        }
    }
}

module.exports = new ChatServices();

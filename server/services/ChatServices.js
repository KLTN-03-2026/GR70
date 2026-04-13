const ChatRepository = require("../repository/ChatRepository");
const ApiError = require("../utils/ApiError");
class ChatServices {
    async checkMessage(id){
        try {
            if(!id){
                throw ApiError.ValidationError("Message id is required");
            }
            const message = await ChatRepository.chetMessage(id);
            if(!message){
                throw ApiError.NotFound("Message not found");
            }
            return message;
        } catch (error) {
            
        }
    }
}

module.exports = new ChatServices();
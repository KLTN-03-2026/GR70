const ApiError = require("../utils/ApiError");
const ApiSuccess = require("../utils/ApiSuccess");
const ChatRepository = require("../repository/ChatRepository");
const ChatServices = require("../services/ChatServices");
const socket = require('../config/connectSocketIO');

exports.sendChatUser = async (req, res, next) => {
    try {
        const data = req.body;
        const userID = req.user.userId;
        let receiverId;
        const check = await ChatServices.checkMessage(data.message_id);
        if(check.user_id1 === userID && check.user_id2 !== userID) {
            receiverId = check.user_id2;
        }else{
            receiverId = check.user_id1;
        }
        const result = await ChatRepository.sendChatUser(data.message_id,data.content,userID);
        global._io
        .to(`message_${data.message_id}`)
        .emit('receive_message', result);
        global._io.to(`user_${receiverId}`).emit('new_message_notification', result);
        return res.json(ApiSuccess.created("Message sent successfully", result));
    } catch (error) {
        return next(error);
    }
};

exports.RoomMessage = async (req, res, next) => {
    try {
        const MessID = req.params.MessID;
        const result = await ChatRepository.getChatUser(MessID);
        if(result.length===0) {
            return res.json(ApiSuccess.getSelect("Hiện tại chưa có tin nhắn nào, Mời bạn gưi tin nhắn", result));
        }
        return res.json(ApiSuccess.getSelect("Room message", result));
    } catch (error) {
        return next(error);
    }
};
exports.markAsRead = async (req, res, next) => {
    try {
        const userID = req.user.userId;
        const messageID= req.params.messageID;
        const result = await ChatRepository.markAsRead(userID,messageID);
        return res.json(ApiSuccess.getSelect("Mark as read", result));
    } catch (error) {
        return next(error);
    }
};
// lấy danh sách chat của user
exports.ListchatMessageTogether = async (req, res, next) => {
    try {
        const userID = req.user.userId;
        const result = await ChatRepository.ListChatByUser(userID);
        return res.json(ApiSuccess.getSelect("Chat list", result));
    } catch (error) {
        return next(error);
    }
};
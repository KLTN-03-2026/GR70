const {DetailMessageModel,MessageModel, UserModel} = require("../models/index");
const { Op } = require("sequelize");
class ChatRepository {
    async chetMessage(id){
        const message = await MessageModel.findByPk(id);
        return message;
    }
    async createChat(user1,user2, optiones = {}) {
        const message = await MessageModel.create({user_id1:user1,user_id2:user2},{...optiones});
        return message;
    }
    // tạo tin nhắn chi tiết trong hội thoại
    async sendChatUser(message,content,userID) {
        const result = await DetailMessageModel.create({message_id:message,content:content,user_id:userID},{raw:true},);
        return result;
    }
    // lấy danh sách tin nhắn trong hội thoại
    async getChatUser(messageId) {
        const messages = await DetailMessageModel.findAll({
            where: { message_id: messageId },
            order: [['created_at', 'DESC']],
            limit: 30,
            raw: true
        });

        return messages.reverse();
    }
    // ĐỔI trạng thái đã đọc
    async markAsRead(userID,messageId) {
        const message = await DetailMessageModel.update({status:false},{where:{message_id:messageId,user_id:userID},raw:true});
        return message;
    }
    // lấy list danh sách của user
    async ListChatByUser(userID) {
        const messages = await MessageModel.findAll({
            attributes: ['id', 'user_id1', 'user_id2'],
            where: {
                [Op.or]: [
                    { user_id1: userID },
                    { user_id2: userID }
                ]
            },
            raw: true
        });

        const result = await Promise.all(
            messages.map(async (item) => {
                const otherUserId = item.user_id1 === userID ? item.user_id2 : item.user_id1;

                const otherUser = await UserModel.findOne({
                    attributes: ['name'],
                    where: { id: otherUserId },
                    raw: true
                });

                return {
                    id: item.id,
                    other_user_id: otherUserId,
                    other_user_name: otherUser ? otherUser.name : null
                };
            })
        );

        return result;
    }
}

module.exports = new ChatRepository();
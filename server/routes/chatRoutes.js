var express = require('express');
var router = express.Router();
const ChatController = require('../controller/ChatController');
const validator = require('../middleware/validator/chat');
router.post('/send',validator, ChatController.sendChatUser);
router.get('/get-message/:MessID', ChatController.RoomMessage);
router.put('/mark-as-read/:messageID', ChatController.markAsRead);
router.get('/list-message', ChatController.ListchatMessageTogether);
module.exports = router;
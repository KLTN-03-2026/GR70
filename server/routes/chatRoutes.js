var express = require('express');
var router = express.Router();
const ChatController = require('../controller/ChatController');
router.post('/send', ChatController.sendChatUser);
router.get('/get-message/:MessID', ChatController.RoomMessage);
router.put('/mark-as-read/:messageID', ChatController.markAsRead);
router.get('/list-message', ChatController.ListchatMessageTogether);
module.exports = router;
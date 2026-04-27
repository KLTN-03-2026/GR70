var express = require('express');
var router = express.Router();
const authorize = require('../../middleware/authorize');
const AcountController = require('../../controller/admin/ManagerAccountController');
router.use(authorize(["Admin"]));
router.get('/get-all-account', AcountController.getListUserForBrand);
router.get('/get-sum-acount', AcountController.getSumAccount);
router.get('/get-account-detail/:id', AcountController.getDetailManagerAndKitchen);
module.exports = router;
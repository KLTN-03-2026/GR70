var express = require('express');
var router = express.Router();
const AcountController = require('../../controller/admin/ManagerAccountController');
router.get('/get-all-account', AcountController.getListUserForBrand);
router.get('/get-sum-acount', AcountController.getSumAccount);
module.exports = router;
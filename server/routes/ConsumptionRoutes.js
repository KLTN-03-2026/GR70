var express = require('express');
var router = express.Router();
var ConsumptionController = require('../controller/ConsumptionController');
const authorize = require('../middleware/authorize');
/* GET users listing. */
router.get('/sum-customer-as-last-month', authorize(["Manager", "Admin"]), ConsumptionController.sumCustomerAsLastMonth);
router.get('/list-customer-in-month', authorize(["Manager", "Admin"]), ConsumptionController.ListCustomerInMonth);
router.get('/list-dishes-output-lastday', authorize(["Manager", "Admin"]), ConsumptionController.GetDishesOutputByDate);
module.exports = router;
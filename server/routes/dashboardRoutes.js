var express = require('express');
var router = express.Router();
const DashboardController = require('../controller/DashboardManagerController');
const AIController = require('../controller/AIController');
const authorize = require('../middleware/authorize');
/* GET users listing. */
router.get('/get-sum-dishes', authorize(["Manager"]), DashboardController.GetReportDishes);
router.get('/get-sum-revenue', authorize(["Manager"]), DashboardController.GetReportRevenue);
router.get('/get-waste-percentage', authorize(["Manager"]), DashboardController.GetReportWaste);
router.get('/get-customer-ai', AIController.CustomerAI);
router.get('/get-waste-ai', AIController.WasteLessAI);
router.get('/get-low-stock-ingredients', authorize(["Manager"]), DashboardController.GetLowStockIngredients);
module.exports = router;
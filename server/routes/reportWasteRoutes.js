var express = require('express');
var router = express.Router();
const ReportWasteController = require('../controller/ReportWasteController');
router.get('/precent-ingredient-by-month', ReportWasteController.getPrecenIngredient);
router.get('/top-5-wasted-ingredients', ReportWasteController.getTop5WastedIngredients);
router.get('/revenue-loss-by-month', ReportWasteController.getRevenueLossByMonth);
router.get('/percent-loss-by-month', ReportWasteController.getPercentLossByMonth);
module.exports = router;
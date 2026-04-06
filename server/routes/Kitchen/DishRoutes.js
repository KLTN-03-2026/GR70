var express = require('express');
var router = express.Router();
var DishesController = require('../../controller/kitchen/DishesController');
const authorize = require('../../middleware/authorize');

router.post('/create-dishes-new',authorize(["Kitchen"]), DishesController.CreateDishesForKitchen);
router.post('/create-dishes-daily/:brandID', DishesController.CreateDishesOutput);
router.put('/update-dishes-leftover/:DailyDetailID', DishesController.UpdateDishesLeftoverOutput);
router.put('/update-dishes-output/:DailyDetailID', DishesController.UpdateDishesOutput);
router.get('/get-dishes-output/:brandID', DishesController.GetDishesOutputByDate);
// danh sách món ăn cho kitchen staff
router.get('/get-all-dishes', DishesController.GetAllDishesTrueKitchen);
router.get('/get-all-dishes-false-by-kitchen', DishesController.GetListDishWaitByUser);
module.exports = router;

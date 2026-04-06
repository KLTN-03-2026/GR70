var express = require('express');
var router = express.Router();
var CategoryController = require('../controller/CategoryController');
/* GET users listing. */
router.get('/category-dishes', CategoryController.GetCategoryDishes);
router.get('/category-ingredients', CategoryController.GetCategoryIngredients);
module.exports = router;
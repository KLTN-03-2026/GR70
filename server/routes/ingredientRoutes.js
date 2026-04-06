var express = require('express');
var router = express.Router();
var IngredientController = require('../controller/IngredientsController');
const authorize = require('../middleware/authorize');
const validateIngredient = require('../middleware/validator/ingredient');
const validateIngredientTransaction = require('../middleware/validator/ingredientTrancastion');
/* GET users listing. */
router.post('/create-ingredient/:brandID', authorize(["Manager", "Admin"]),validateIngredient, IngredientController.CreateIngredient);
router.post('/add-ingredient-transaction/:id', authorize(["Manager", "Admin"]),validateIngredientTransaction, IngredientController.AddIngredientTransaction);
router.put('/update-ingredient/:ingredientID', authorize(["Manager", "Admin"]),validateIngredient, IngredientController.UpdateIngredient);
router.delete('/delete-ingredient/:ingredientID', authorize(["Manager", "Admin"]), IngredientController.DeleteIngredient);
router.get('/get-ingredient/:ingredientID', authorize(["Manager", "Admin"]), IngredientController.GetIngredient);
router.get('/get-ingredients-by-brand', IngredientController.GetIngredientsByBrandID);
router.get('/get-ingredient-transaction', authorize(["Manager"]), IngredientController.GetIngredientTransaction);
module.exports = router;

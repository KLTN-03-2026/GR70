const { DataTypes } = require('sequelize');
const sequelize = require('../config/connectData');

const DishRecipeModel = sequelize.define('dish_recipes', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  dishes_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  ingredient_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  quantity: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  }
}, {
  tableName: 'dish_recipes',
  timestamps: false
});

module.exports = DishRecipeModel;
const { DataTypes } = require('sequelize');
const sequelize = require('../config/connectData');

const IngredientModel = sequelize.define('ingredients', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  brand_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  ingredient_category_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  unit: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  current_stock: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  },
  minimum_stock: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'ingredients',
  timestamps: false
});

module.exports = IngredientModel;
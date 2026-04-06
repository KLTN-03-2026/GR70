const { DataTypes } = require('sequelize');
const sequelize = require('../config/connectData');

const IngredientCategoryModel = sequelize.define('ingredient_categories', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'ingredient_categories',
  timestamps: false
});

module.exports = IngredientCategoryModel;
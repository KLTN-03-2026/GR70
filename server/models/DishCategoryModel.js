const { DataTypes } = require('sequelize');
const sequelize = require('../config/connectData');

const DishCategoryModel = sequelize.define('dish_categories', {
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
  tableName: 'dish_categories',
  timestamps: false
});

module.exports = DishCategoryModel;
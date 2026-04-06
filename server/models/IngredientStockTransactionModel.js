const { DataTypes } = require('sequelize');
const sequelize = require('../config/connectData');

const IngredientStockTransactionModel = sequelize.define('ingredient_stock_transactions', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
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
  },
  type: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'ingredient_stock_transactions',
  timestamps: false
});

module.exports = IngredientStockTransactionModel;
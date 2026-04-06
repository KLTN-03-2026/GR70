const { DataTypes } = require('sequelize');
const sequelize = require('../config/connectData');

const DailyOperationModel = sequelize.define('daily_operations', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  brand_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  operation_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  customer_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  note: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'daily_operations',
  timestamps: false
});

module.exports = DailyOperationModel;
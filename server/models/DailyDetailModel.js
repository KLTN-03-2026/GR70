const { DataTypes } = require('sequelize');
const sequelize = require('../config/connectData');

const DailyDetailModel = sequelize.define('daily_detail', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  daily_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  dishes_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  quantity_prepared: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  quantity_wasted: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  waste_cost: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  revenue_cost: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  }
}, {
  tableName: 'daily_detail',
  timestamps: false
});

module.exports = DailyDetailModel;
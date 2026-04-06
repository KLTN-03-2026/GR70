const { DataTypes } = require('sequelize');
const sequelize = require('../config/connectData');

const BrandModel = sequelize.define('brands', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT
  },
  rolebrand:{
    type: DataTypes.TEXT,
  },
  province: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'brands',
  timestamps: false
});

module.exports = BrandModel;
const { DataTypes } = require('sequelize');
const sequelize = require('../config/connectData');

const PermissionModel = sequelize.define('permissions', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  },
  des: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'permissions',
  timestamps: false
});

module.exports = PermissionModel;
const { DataTypes } = require('sequelize');
const sequelize = require('../config/connectData');

const RoleModel = sequelize.define('roles', {
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
  tableName: 'roles',
  timestamps: false
});

module.exports = RoleModel;
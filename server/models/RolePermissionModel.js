const { DataTypes } = require('sequelize');
const sequelize = require('../config/connectData');

const RolePermissionModel = sequelize.define('role_permissions', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  permission_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  role_id: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  tableName: 'role_permissions',
  timestamps: false
});

module.exports = RolePermissionModel;
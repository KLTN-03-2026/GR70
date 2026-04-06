const { DataTypes } = require('sequelize');
const sequelize = require('../config/connectData');

const UserRoleModel = sequelize.define('user_roles', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  role_id: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  tableName: 'user_roles',
  timestamps: false
});

module.exports = UserRoleModel;
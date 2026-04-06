const { DataTypes } = require('sequelize');
const sequelize = require('../config/connectData');

const Refresh_tokenModel = sequelize.define('refresh_tokens', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  token: { type: DataTypes.TEXT, unique: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'refresh_tokens', timestamps: false });

module.exports = Refresh_tokenModel;

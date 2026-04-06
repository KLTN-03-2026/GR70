const { DataTypes } = require('sequelize');
const sequelize = require('../config/connectData');

const MessageModel = sequelize.define('messages', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id1: {
    type: DataTypes.UUID,
    allowNull: false
  },
  user_id2: {
    type: DataTypes.UUID,
    allowNull: false
  },
  status: {
    type: DataTypes.TEXT,
    defaultValue: 'ACTIVE'
  }
}, {
  tableName: 'messages',
  timestamps: false
});

module.exports = MessageModel;
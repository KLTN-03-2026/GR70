const { DataTypes } = require('sequelize');
const sequelize = require('../config/connectData');

const AiAnalysisModel = sequelize.define('ai_analysis', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  brand_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  summary: {
    type: DataTypes.TEXT
  },
  risk_level: {
    type: DataTypes.TEXT
  },
  ai_customer_count: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  date: {
    type: DataTypes.DATEONLY
  }
}, {
  tableName: 'ai_analysis',
  timestamps: false
});

module.exports = AiAnalysisModel;
const { DataTypes } = require('sequelize');
const sequelize = require('../config/connectData');

const AiAnalysisDetailModel = sequelize.define('ai_analysis_detail', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  analysis_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  dishes_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  recommended_quantity: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  predicted_waste_quantity: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  suggestion_note: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'ai_analysis_detail',
  timestamps: false
});

module.exports = AiAnalysisDetailModel;
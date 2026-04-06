require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // cần cho Supabase vì cert self-signed
    },
  },
  pool: {
    max: 10,        // số kết nối tối đa
    min: 0,
    acquire: 30000, // timeout khi lấy kết nối
    idle: 10000,    // idle timeout
  },
});

module.exports = sequelize;

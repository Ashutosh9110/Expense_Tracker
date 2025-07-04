const { DataTypes } = require("sequelize");
const { sequelize } = require("../utils/db-connection");




const users = sequelize.define("users", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  totalExpenses: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
})




module.exports = {
  users
}
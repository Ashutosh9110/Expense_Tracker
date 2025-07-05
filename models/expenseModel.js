
const { DataTypes } = require("sequelize")
const {sequelize} = require("../utils/db-connection")
const { users } = require("./userModel")

const expenses = sequelize.define("expenses", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expenseAmount : {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: users,
      key: "id"
    }},

})





 module.exports = {
  expenses
 }
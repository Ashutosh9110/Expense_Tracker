const { DataTypes } = require("sequelize");
const { sequelize } = require("../utils/db-connection");
// const { users } = require("./userModel");



const forgotPasswordRequest = sequelize.define("forgotPasswordRequest", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,

  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isActive : {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
})


module.exports = {
  forgotPasswordRequest 
}
